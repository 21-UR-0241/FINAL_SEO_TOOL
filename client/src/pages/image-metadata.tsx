
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Image,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Info,
  FileImage,
  RefreshCw,
  Filter,
  Settings,
  X,
  Zap,
  Clock,
  Globe,
  Shuffle,
  Link,
  Search,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://final-seo-tool.onrender.com';

// Enhanced API with authentication support
const api = {
  async getContentImages(websiteId?: string) {
    const url = websiteId
      ? `${API_BASE_URL}/api/images/content-images?websiteId=${websiteId}`
      : `${API_BASE_URL}/api/images/content-images`;

    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.error('Authentication required - redirecting to login');
        window.location.href = '/login';
        return [];
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        }
        return [];
      }

      const data = await response.json();
      if (Array.isArray(data)) return data;
      if (data.images && Array.isArray(data.images)) return data.images;
      return [];
    } catch (error) {
      console.error("getContentImages error:", error);
      return [];
    }
  },

  async crawlWebsiteImages(url: string, options: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/crawl`, {
        method: "POST",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url, options }),
      });

      if (response.status === 401) {
        console.error('Authentication required - redirecting to login');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to crawl website");
      }

      return await response.json();
    } catch (error) {
      console.error("crawlWebsiteImages error:", error);
      throw error;
    }
  },

  async batchProcessMetadata(
    imageIds: string[],
    options: any,
    imageUrls?: Record<string, string>
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/batch-process`, {
        method: "POST",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageIds, options, imageUrls }),
      });

      if (response.status === 401) {
        console.error('Authentication required - redirecting to login');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to process images");
        }
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("batchProcessMetadata error:", error);
      throw error;
    }
  },

  async getWebsites() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/websites`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.error('Authentication required - redirecting to login');
        window.location.href = '/login';
        return [];
      }

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to fetch websites: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("getWebsites error:", error);
      return [];
    }
  },

  async getImageStatus(contentId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/images/batch-process?contentId=${contentId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 401) {
        console.error('Authentication required - redirecting to login');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("getImageStatus error:", error);
      throw error;
    }
  },
};

// Utility functions
const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// URL Validation and Fixing Utilities
const validateImageUrl = (url: string): { valid: boolean; issue?: string; suggestion?: string } => {
  if (!url) return { valid: false, issue: 'Empty URL' };
  
  // Check if it's a data URL (base64)
  if (url.startsWith('data:image/')) {
    return { valid: true };
  }
  
  // Check for relative URLs
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return { 
      valid: false, 
      issue: 'Relative URL', 
      suggestion: 'Needs base domain' 
    };
  }
  
  // Check for protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { 
      valid: false, 
      issue: 'Missing protocol', 
      suggestion: `https://${url}` 
    };
  }
  
  // Check for valid URL format
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, issue: 'Invalid URL format' };
  }
};

const fixImageUrl = (url: string, baseUrl?: string): string => {
  if (!url) return url;
  
  // Already valid data URL
  if (url.startsWith('data:image/')) return url;
  
  // Already valid absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Fix relative URLs
  if (baseUrl) {
    try {
      const base = new URL(baseUrl);
      
      // Handle protocol-relative URLs
      if (url.startsWith('//')) {
        return `${base.protocol}${url}`;
      }
      
      // Handle absolute paths
      if (url.startsWith('/')) {
        return `${base.protocol}//${base.host}${url}`;
      }
      
      // Handle relative paths
      return new URL(url, baseUrl).href;
    } catch (error) {
      console.error('Error fixing URL:', error);
    }
  }
  
  // Default to adding https://
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  
  return url;
};

const extractDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return '';
  }
};

interface ContentImage {
  id: string;
  url?: string;
  data?: string;
  contentId: string;
  contentTitle: string;
  websiteId: string;
  websiteName: string;
  hasMetadata: boolean;
  metadataDetails?: {
    copyright?: string;
    author?: string;
    aiModel?: string;
    aiProvider?: string;
    altText?: string;
    caption?: string;
  };
  size: number;
  createdAt: string;
  isAIGenerated: boolean;
  processedAt?: string;
  costCents?: number;
  isCrawled?: boolean;
  source?: string;
}

interface Website {
  id: string;
  name: string;
  domain?: string;
  url?: string;
  status?: string;
  contentCount?: number;
  lastContentDate?: string;
}

interface ProcessOptions {
  action: "add" | "strip" | "update" | "scramble";
  copyright?: string;
  author?: string;
  removeGPS?: boolean;
  optimize?: boolean;
  maxWidth?: number;
  quality?: number;
  keepColorProfile?: boolean;
  imageDescription?: string;
  make?: string;
  model?: string;
  software?: string;
  hostComputer?: string;
  seoDescription?: string;
  seoTitle?: string;
  seoLocation?: string;
  seoKeywords?: string;
  scrambleType?:
    | "pixel-shift"
    | "watermark"
    | "blur-regions"
    | "color-shift"
    | "noise";
  scrambleIntensity?: number;
  watermarkText?: string;
  watermarkPosition?:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  preserveFaces?: boolean;
}

interface CrawlOptions {
  maxDepth: number;
  maxImages: number;
  followExternal: boolean;
  includeSubdomains: boolean;
  imageTypes: string[];
  minWidth?: number;
  minHeight?: number;
  excludePatterns?: string[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ProcessingStatus {
  imageId: string;
  status: "pending" | "processing" | "success" | "failed";
  error?: string;
}

// Image Card Component with Error Handling
const ImageCard = ({
  image,
  isSelected,
  processingItem,
  onSelect,
  onFixUrl,
  onImageError,
}: {
  image: ContentImage;
  isSelected: boolean;
  processingItem?: ProcessingStatus;
  onSelect: () => void;
  onFixUrl: (image: ContentImage) => void;
  onImageError: (imageId: string) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    console.error('Failed to load image:', image.url || image.data);
    setImageError(true);
    onImageError(image.id);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSource = image.data || image.url;
  
  // Validate URL before attempting to load
  const validation = validateImageUrl(imageSource || '');
  const hasInvalidUrl = !validation.valid && !imageSource?.startsWith('data:image/');

  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
        ${
          isSelected
            ? "border-blue-500 shadow-lg scale-[1.02]"
            : "border-gray-200 hover:border-gray-300"
        }
        ${processingItem?.status === "processing" ? "animate-pulse" : ""}
        ${processingItem?.status === "success" ? "ring-2 ring-green-500" : ""}
        ${processingItem?.status === "failed" ? "ring-2 ring-red-500" : ""}
      `}
      onClick={onSelect}
    >
      <div className="aspect-square bg-gray-100 relative">
        {imageSource && !imageError && !hasInvalidUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            
            <img
              src={imageSource}
              alt={image.contentTitle}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-xs text-gray-600 px-2 text-center">
              {hasInvalidUrl ? 'Invalid URL' : imageError ? 'Failed to load' : 'No image'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFixUrl(image);
              }}
              className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Fix URL
            </button>
            {image.url && (
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                Test URL
              </a>
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 text-white">
          <p className="text-[10px] sm:text-xs font-medium truncate">
            {image.contentTitle}
          </p>
          <p className="text-xs opacity-90">
            {formatFileSize(image.size)}
          </p>
          <p className="text-xs opacity-80">
            {image.websiteName}
          </p>
          {(imageError || hasInvalidUrl) && (
            <p className="text-xs text-red-300 mt-1">
              ⚠️ {hasInvalidUrl ? 'Invalid URL' : 'Image unavailable'}
            </p>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {image.hasMetadata && (
          <span className="bg-green-500 text-white p-1 rounded" title="Has metadata">
            <Shield className="w-3 h-3" />
          </span>
        )}
        {image.isAIGenerated && (
          <span className="bg-purple-500 text-white text-[10px] px-1 py-0.5 rounded font-bold">
            AI
          </span>
        )}
        {image.isCrawled && (
          <span className="bg-indigo-500 text-white p-1 rounded" title="Crawled">
            <Globe className="w-3 h-3" />
          </span>
        )}
        {(imageError || hasInvalidUrl) && (
          <span className="bg-red-500 text-white p-1 rounded" title="Failed to load">
            <AlertTriangle className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="absolute top-2 left-2">
        <div
          className={`
            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${
              isSelected
                ? "bg-blue-500 border-blue-500 scale-110"
                : "bg-white/80 border-gray-300 group-hover:border-gray-400"
            }
          `}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </div>
      </div>

      {processingItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          {processingItem.status === "processing" && (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          )}
          {processingItem.status === "success" && (
            <CheckCircle className="w-8 h-8 text-green-400" />
          )}
          {processingItem.status === "failed" && (
            <AlertTriangle className="w-8 h-8 text-red-400" />
          )}
        </div>
      )}
    </div>
  );
};

export default function EnhancedImageMetadata() {
  // State management
  const [images, setImages] = useState<ContentImage[]>([]);
  const [crawledImages, setCrawledImages] = useState<ContentImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "with-metadata" | "without-metadata" | "ai-generated" | "crawled"
  >("all");
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus[]>([]);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<"existing" | "crawl">("existing");

  // Broken images state
  const [showBrokenImages, setShowBrokenImages] = useState(false);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());

  // URL Fixing State
  const [showUrlFixer, setShowUrlFixer] = useState(false);
  const [urlFixerImage, setUrlFixerImage] = useState<ContentImage | null>(null);
  const [fixedUrl, setFixedUrl] = useState('');
  const [bulkFixDomain, setBulkFixDomain] = useState('');
  const [showBulkFixer, setShowBulkFixer] = useState(false);

  // Crawling state
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>({
    maxDepth: 2,
    maxImages: 50,
    followExternal: false,
    includeSubdomains: true,
    imageTypes: ["jpg", "jpeg", "png", "webp", "gif"],
    minWidth: 200,
    minHeight: 200,
    excludePatterns: ["thumbnail", "icon", "logo", "avatar"],
  });
  const [crawlProgress, setCrawlProgress] = useState<{
    current: number;
    total: number;
    currentUrl: string;
  } | null>(null);

  const [lastCrawlStats, setLastCrawlStats] = useState<{
    imagesFound: number;
    pagesVisited: number;
    duplicates: number;
    timestamp: string;
  } | null>(null);

  // Processing options
  const [processOptions, setProcessOptions] = useState<ProcessOptions>({
    action: "add",
    copyright: `© ${new Date().getFullYear()}`,
    author: "Frederic Murray",
    removeGPS: true,
    optimize: true,
    maxWidth: 1920,
    quality: 85,
    keepColorProfile: true,
    imageDescription: "Property of Murray Group",
    make: "AI Content Manager",
    model: "Image Processor v1.0",
    software: "AI Content Manager - Murray Group",
    hostComputer: "Murray Group Real Estate System",
    seoDescription: "",
    seoTitle: "",
    seoLocation: "",
    seoKeywords: "",
    scrambleType: "pixel-shift",
    scrambleIntensity: 50,
    watermarkText: "CONFIDENTIAL",
    watermarkPosition: "bottom-right",
    preserveFaces: true,
  });

  // SEO Score helper
  const getSEOScore = useCallback(() => {
    const desc = processOptions.seoDescription || "";
    if (!desc) return { score: 0, text: "No SEO description", color: "text-gray-400" };
    if (desc.length < 60) return { score: 1, text: "Too short for SEO (add more detail)", color: "text-orange-500" };
    if (desc.length > 125) return { score: 2, text: "Too long for SEO (shorten)", color: "text-orange-500" };
    return { score: 3, text: "Perfect SEO length! ✓", color: "text-green-600" };
  }, [processOptions.seoDescription]);

  // Toast management
  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success", duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    if (websites.length > 0 || selectedWebsite === "") {
      loadImages();
    }
  }, [selectedWebsite, websites]);

  const loadWebsites = async () => {
    try {
      const data = await api.getWebsites();
      if (Array.isArray(data)) {
        setWebsites(data);
        if (data.length > 0 && !selectedWebsite) {
          setSelectedWebsite(data[0].id);
        }
        if (data.length === 0) {
          addToast("No websites found. Please add a website first.", "info");
          setApiAvailable(false);
        } else {
          setApiAvailable(true);
        }
      } else {
        setWebsites([]);
        setApiAvailable(false);
      }
    } catch (error: any) {
      setWebsites([]);
      addToast("Website API not configured. Please set up your websites first.", "info");
      setApiAvailable(false);
    }
  };

  const loadImages = async () => {
    if (websites.length === 0 && selectedWebsite) {
      setImages([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.getContentImages(selectedWebsite || undefined);
      if (Array.isArray(data)) {
        const allImages = [...data, ...crawledImages];
        setImages(allImages);
        if (data.length > 0) {
          const withMetadata = data.filter((img) => img.hasMetadata).length;
          const withoutMetadata = data.length - withMetadata;
          addToast(
            `Loaded ${data.length} images (${withMetadata} protected, ${withoutMetadata} unprotected)`,
            "info"
          );
        }
      } else {
        setImages(crawledImages);
      }
    } catch (error: any) {
      setImages(crawledImages);
      addToast(error.message || "Failed to load images", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrawlWebsite = async () => {
    if (!crawlUrl) {
      addToast("Please enter a URL to crawl", "warning");
      return;
    }

    setIsCrawling(true);
    setLastCrawlStats(null);
    setCrawlProgress({ current: 0, total: 0, currentUrl: crawlUrl });

    try {
      const result = await api.crawlWebsiteImages(crawlUrl, crawlOptions);

      if (result.images && Array.isArray(result.images)) {
        const crawledData = result.images
          .map((img: any) => ({
            ...img,
            id: img.id || `crawled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            url: img.url || img.src || img.source || "",
            websiteId: selectedWebsite || "crawled",
            websiteName: "Crawled",
            isCrawled: true,
            hasMetadata: false,
            contentTitle: img.contentTitle || img.title || img.alt || "Crawled Image",
            size: img.size || 0,
            createdAt: img.createdAt || new Date().toISOString(),
          }))
          .filter((img: any) => img.url);

        const stats = {
          imagesFound: crawledData.length,
          pagesVisited: result.stats?.pagesVisited || 1,
          duplicates: result.stats?.duplicates || 0,
          timestamp: new Date().toISOString(),
        };
        setLastCrawlStats(stats);

        setCrawledImages((prev) => [...prev, ...crawledData]);
        setImages((prev) => [...prev, ...crawledData]);

        const message = stats.duplicates > 0
          ? `🎉 Crawl complete! Found ${stats.imagesFound} unique images from ${stats.pagesVisited} pages (${stats.duplicates} duplicates skipped)`
          : `🎉 Crawl complete! Found ${stats.imagesFound} images from ${stats.pagesVisited} pages`;

        addToast(message, "success", 7000);

        if (result.stats) {
          console.log("Crawl statistics:", result.stats);
        }
      } else {
        addToast("No images found on the website. Try adjusting the crawl settings.", "warning");
      }
    } catch (error: any) {
      console.error("Crawl error:", error);
      addToast(`Crawl failed: ${error.message || "Unknown error occurred"}`, "error");
    } finally {
      setIsCrawling(false);
      setCrawlProgress(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map((img) => img.id));
    }
  };

  const handleSelectImage = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  const handleBatchProcess = async () => {
    if (selectedImages.length === 0) {
      addToast("Please select images to process", "warning");
      return;
    }

    if (processOptions.action === "strip") {
      const confirmed = window.confirm(
        `Are you sure you want to strip metadata from ${selectedImages.length} images? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    if (processOptions.action === "scramble") {
      const confirmed = window.confirm(
        `Are you sure you want to scramble ${selectedImages.length} images? This will modify the image content.`
      );
      if (!confirmed) return;
    }

    setIsProcessing(true);

    const initialStatus: ProcessingStatus[] = selectedImages.map((id) => ({
      imageId: id,
      status: "pending",
    }));
    setProcessingStatus(initialStatus);

    try {
      setProcessingStatus((prev) =>
        prev.map((s) => ({ ...s, status: "processing" as const }))
      );

      const imageUrls: Record<string, string> = {};
      
      for (const imageId of selectedImages) {
        const image = images.find((img) => img.id === imageId);
        if (image && (image.isCrawled || imageId.startsWith("crawled"))) {
          const url = image.url || image.data || "";
          if (url) {
            imageUrls[imageId] = url;
          }
        }
      }

      const result = await api.batchProcessMetadata(selectedImages, processOptions, imageUrls);

      if (result.results) {
        setProcessingStatus((prev) =>
          prev.map((s) => ({
            ...s,
            status: result.results.success.some((success: any) => success.imageId === s.imageId)
              ? ("success" as const)
              : ("failed" as const),
          }))
        );
      }

      const actionText =
        processOptions.action === "add"
          ? "Added metadata to"
          : processOptions.action === "strip"
          ? "Stripped metadata from"
          : processOptions.action === "scramble"
          ? "Scrambled"
          : "Updated metadata for";

      addToast(
        `${actionText} ${result.processed} of ${result.total} images (${result.successRate})`,
        result.failed > 0 ? "warning" : "success"
      );

      if (result.errors && result.errors.length > 0) {
        console.error("Processing errors:", result.errors);
        if (result.errors[0]) {
          addToast(`Error: ${result.errors[0].message}`, "error");
        }
      }

      await loadImages();
      setSelectedImages([]);

      setTimeout(() => {
        setProcessingStatus([]);
      }, 3000);
    } catch (error: any) {
      console.error("Batch processing error:", error);
      addToast(error.message || "Failed to process images", "error");

      setProcessingStatus((prev) =>
        prev.map((s) => ({
          ...s,
          status: "failed" as const,
          error: "Processing failed",
        }))
      );

      setTimeout(() => {
        setProcessingStatus([]);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCrawled = () => {
    const crawledData = crawledImages.map((img) => ({
      url: img.url,
      title: img.contentTitle,
      source: img.source,
      size: img.size,
    }));

    const blob = new Blob([JSON.stringify(crawledData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crawled-images-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast(`Downloaded ${crawledImages.length} crawled image URLs`, "success");
  };

  const handleFixSingleUrl = async (image: ContentImage, newUrl: string) => {
    try {
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, url: newUrl, data: undefined } : img
      ));
      
      if (image.isCrawled) {
        setCrawledImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, url: newUrl, data: undefined } : img
        ));
      }
      
      setBrokenImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
      
      addToast(`Fixed URL for "${image.contentTitle}"`, 'success');
      setShowUrlFixer(false);
      setUrlFixerImage(null);
    } catch (error: any) {
      addToast(`Failed to fix URL: ${error.message}`, 'error');
    }
  };

  const handleBulkFixUrls = () => {
    if (!bulkFixDomain) {
      addToast('Please enter a base domain', 'warning');
      return;
    }
    
    let fixedCount = 0;
    
    setImages(prev => prev.map(img => {
      const validation = validateImageUrl(img.url || '');
      if (!validation.valid && (img.url?.startsWith('/') || img.url?.startsWith('./'))) {
        fixedCount++;
        setBrokenImageIds(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(img.id);
          return newSet;
        });
        return { ...img, url: fixImageUrl(img.url, bulkFixDomain) };
      }
      return img;
    }));
    
    setCrawledImages(prev => prev.map(img => {
      const validation = validateImageUrl(img.url || '');
      if (!validation.valid && (img.url?.startsWith('/') || img.url?.startsWith('./'))) {
        return { ...img, url: fixImageUrl(img.url, bulkFixDomain) };
      }
      return img;
    }));
    
    addToast(`Fixed ${fixedCount} relative URLs`, 'success');
    setShowBulkFixer(false);
    setBulkFixDomain('');
  };

  const handleAutoFixUrl = (image: ContentImage) => {
    const url = image.url || '';
    const validation = validateImageUrl(url);
    
    if (validation.suggestion) {
      setFixedUrl(validation.suggestion);
    } else if (image.source) {
      const domain = extractDomainFromUrl(image.source);
      if (domain) {
        setFixedUrl(fixImageUrl(url, domain));
      }
    } else if (crawlUrl) {
      setFixedUrl(fixImageUrl(url, crawlUrl));
    } else {
      setFixedUrl(url);
    }
  };

  const openUrlFixer = (image: ContentImage) => {
    setUrlFixerImage(image);
    setFixedUrl(image.url || '');
    handleAutoFixUrl(image);
    setShowUrlFixer(true);
  };

  const handleImageError = useCallback((imageId: string) => {
    setBrokenImageIds(prev => {
      const newSet = new Set(prev);
      newSet.add(imageId);
      return newSet;
    });
  }, []);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (selectedWebsite && img.websiteId !== selectedWebsite && img.websiteId !== "crawled") {
        return false;
      }

      if (!showBrokenImages) {
        const imageSource = img.data || img.url;
        const validation = validateImageUrl(imageSource || '');
        const hasInvalidUrl = !validation.valid && !imageSource?.startsWith('data:image/');
        const isBroken = brokenImageIds.has(img.id);
        
        if (hasInvalidUrl || isBroken) {
          return false;
        }
      }

      switch (filter) {
        case "with-metadata":
          return img.hasMetadata;
        case "without-metadata":
          return !img.hasMetadata;
        case "ai-generated":
          return img.isAIGenerated;
        case "crawled":
          return img.isCrawled === true;
        default:
          return true;
      }
    });
  }, [images, filter, selectedWebsite, showBrokenImages, brokenImageIds]);

  const stats = useMemo(() => {
    const brokenCount = images.filter(img => {
      const imageSource = img.data || img.url;
      const validation = validateImageUrl(imageSource || '');
      const hasInvalidUrl = !validation.valid && !imageSource?.startsWith('data:image/');
      return hasInvalidUrl || brokenImageIds.has(img.id);
    }).length;

    return {
      total: images.length,
      withMetadata: images.filter((img) => img.hasMetadata).length,
      withoutMetadata: images.filter((img) => !img.hasMetadata).length,
      aiGenerated: images.filter((img) => img.isAIGenerated).length,
      crawled: images.filter((img) => img.isCrawled).length,
      broken: brokenCount,
      totalSize: images.reduce((sum, img) => sum + (img.size || 0), 0),
      totalCost: images.reduce((sum, img) => sum + (img.costCents || 0), 0),
    };
  }, [images, brokenImageIds]);

  const seoScore = getSEOScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] ${
              toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : toast.type === "warning"
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                : toast.type === "info"
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              {toast.type === "error" || toast.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 mr-2" />
              ) : toast.type === "info" ? (
                <Info className="w-5 h-5 mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Enhanced Image Metadata Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Crawl, process, optimize for SEO, and manage image metadata
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">{formatFileSize(stats.totalSize)}</p>
              </div>
              <FileImage className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Protected</p>
                <p className="text-2xl font-bold text-green-600">{stats.withMetadata}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? `${Math.round((stats.withMetadata / stats.total) * 100)}%` : "0%"}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unprotected</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.withoutMetadata}</p>
                <p className="text-xs text-gray-500">
                  {stats.total > 0 ? `${Math.round((stats.withoutMetadata / stats.total) * 100)}%` : "0%"}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</p>
                <p className="text-xs text-gray-500">${(stats.totalCost / 100).toFixed(2)}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crawled</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.crawled}</p>
                <p className="text-xs text-gray-500">External</p>
              </div>
              <Globe className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-orange-600">{selectedImages.length}</p>
                <p className="text-xs text-gray-500">Ready</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Broken URLs</p>
                <p className="text-2xl font-bold text-red-600">{stats.broken}</p>
                <p className="text-xs text-gray-500">{showBrokenImages ? 'Showing' : 'Hidden'}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation - Responsive */}
        <div className="bg-white rounded-t-lg shadow-sm border border-b-0 border-gray-200">
          <div className="block sm:hidden px-4 py-3">
            <select
              value={activeTab}
              onChange={(e) => {
                const newTab = e.target.value as "existing" | "crawl";
                setActiveTab(newTab);
                if (newTab === "crawl" && selectedWebsite && websites.length > 0) {
                  const website = websites.find((w) => w.id === selectedWebsite);
                  if (website?.url && !crawlUrl) {
                    setCrawlUrl(website.url);
                  }
                }
              }}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="existing">📁 Existing Images</option>
              <option value="crawl">🌐 Web Crawler</option>
            </select>
          </div>

          <div className="hidden sm:flex">
            <button
              onClick={() => setActiveTab("existing")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "existing" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileImage className="w-4 h-4 inline mr-2" />
              Existing Images
            </button>
            <button
              onClick={() => {
                setActiveTab("crawl");
                if (selectedWebsite && websites.length > 0) {
                  const website = websites.find((w) => w.id === selectedWebsite);
                  if (website?.url && !crawlUrl) {
                    setCrawlUrl(website.url);
                  }
                }
              }}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "crawl" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Web Crawler
            </button>
          </div>
        </div>

        {/* Crawler Panel */}
        {activeTab === "crawl" && (
          <div className="bg-white shadow-sm border border-t-0 border-gray-200 mb-6">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Web Image Crawler</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={crawlUrl}
                      onChange={(e) => setCrawlUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isCrawling}
                    />
                    <button
                      onClick={handleCrawlWebsite}
                      disabled={isCrawling || !crawlUrl}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                    >
                      {isCrawling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Crawling...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Start Crawl
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {crawlProgress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Crawling in progress...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "100%", animation: "slide 2s linear infinite" }} />
                    </div>
                    <p className="text-xs text-blue-700 mt-2 truncate">Scanning: {crawlProgress.currentUrl}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Depth</label>
                    <input
                      type="number"
                      value={crawlOptions.maxDepth}
                      onChange={(e) => setCrawlOptions({ ...crawlOptions, maxDepth: parseInt(e.target.value) })}
                      min="1"
                      max="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isCrawling}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Images</label>
                    <input
                      type="number"
                      value={crawlOptions.maxImages}
                      onChange={(e) => setCrawlOptions({ ...crawlOptions, maxImages: parseInt(e.target.value) })}
                      min="1"
                      max="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isCrawling}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Width (px)</label>
                    <input
                      type="number"
                      value={crawlOptions.minWidth}
                      onChange={(e) => setCrawlOptions({ ...crawlOptions, minWidth: parseInt(e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isCrawling}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={crawlOptions.followExternal}
                      onChange={(e) => setCrawlOptions({ ...crawlOptions, followExternal: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                      disabled={isCrawling}
                    />
                    <span className="text-sm">Follow external links</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={crawlOptions.includeSubdomains}
                      onChange={(e) => setCrawlOptions({ ...crawlOptions, includeSubdomains: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 mr-2"
                      disabled={isCrawling}
                    />
                    <span className="text-sm">Include subdomains</span>
                  </label>
                </div>

                {crawledImages.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                    <span className="text-xs sm:text-sm text-gray-600">
                      {crawledImages.length} images crawled in this session
                    </span>
                    <button
                      onClick={handleDownloadCrawled}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export URLs
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              <span className="font-medium">Processing Settings</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showSettings ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSettings && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-6 mt-4">
                {/* Action Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <select
                    value={processOptions.action}
                    onChange={(e) => setProcessOptions({ ...processOptions, action: e.target.value as ProcessOptions["action"] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="add">Add Metadata</option>
                    <option value="strip">Strip All Metadata</option>
                    <option value="update">Update Existing Metadata</option>
                    <option value="scramble">Scramble Image</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {processOptions.action === "add" && "Add copyright and SEO information"}
                    {processOptions.action === "strip" && "Remove all metadata from images"}
                    {processOptions.action === "update" && "Update existing metadata fields"}
                    {processOptions.action === "scramble" && "Obfuscate image content for privacy"}
                  </p>
                </div>

                {/* SEO Optimization Section */}
                {processOptions.action !== "strip" && processOptions.action !== "scramble" && (
                  <div className="border-l-4 border-indigo-500 pl-3 sm:pl-6 py-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 flex items-center">
                      🔍 SEO Optimization (Search Engine Visibility)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Optimize images for search engines. Better descriptions = higher rankings in Google Images!
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Description (Alt Text) *
                          <span className="text-xs text-gray-500 ml-2">Most important for SEO!</span>
                        </label>
                        <textarea
                          value={processOptions.seoDescription}
                          onChange={(e) => setProcessOptions({ ...processOptions, seoDescription: e.target.value })}
                          placeholder="Example: Luxury 3-bedroom home with modern kitchen and spacious garden"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-sm font-medium ${seoScore.color}`}>{seoScore.text}</span>
                          <span className="text-xs text-gray-500">
                            {processOptions.seoDescription?.length || 0}/125 characters (60-125 recommended)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Tip: Be descriptive and natural. Include what people might search for.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title (Optional)</label>
                        <input
                          type="text"
                          value={processOptions.seoTitle}
                          onChange={(e) => setProcessOptions({ ...processOptions, seoTitle: e.target.value })}
                          placeholder="Example: Modern Bervedere Street Home"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                          <span className="text-xs text-gray-500 ml-2">Helps with local search</span>
                        </label>
                        <input
                          type="text"
                          value={processOptions.seoLocation}
                          onChange={(e) => setProcessOptions({ ...processOptions, seoLocation: e.target.value })}
                          placeholder="Example: Montreal, Quebec"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (Comma-separated)</label>
                        <input
                          type="text"
                          value={processOptions.seoKeywords}
                          onChange={(e) => setProcessOptions({ ...processOptions, seoKeywords: e.target.value })}
                          placeholder="Example: real estate, luxury home, modern architecture"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {processOptions.seoDescription && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">📝 How this will appear in search results:</p>
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <div className="text-xs text-gray-500 mb-1">
                              {processOptions.seoLocation || 'your-website.com'} › images
                            </div>
                            <div className="text-sm text-blue-600 mb-1 font-medium">
                              {processOptions.seoTitle || processOptions.seoDescription}
                            </div>
                            <div className="text-xs text-gray-700">
                              {processOptions.seoDescription}
                              {processOptions.author && ` - Photo by ${processOptions.author}`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 SEO Best Practices</h4>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>✅ Write natural descriptions (60-125 characters) that people might search for</li>
                        <li>✅ Include location for local SEO (e.g., "in Montreal")</li>
                        <li>✅ Be specific: "3-bedroom luxury home" beats "nice house"</li>
                        <li>❌ Don't use generic text like "image123" or just "property"</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* EXIF Metadata Section */}
                {processOptions.action !== "strip" && processOptions.action !== "scramble" && (
                  <div className="border-l-4 border-purple-500 pl-6 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                      © Copyright & Technical Metadata
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These fields are embedded in the image file's EXIF data
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Copyright</label>
                        <input
                          type="text"
                          value={processOptions.copyright}
                          onChange={(e) => setProcessOptions({ ...processOptions, copyright: e.target.value })}
                          placeholder="© 2025 Your Company"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photographer / Author</label>
                        <input
                          type="text"
                          value={processOptions.author}
                          onChange={(e) => setProcessOptions({ ...processOptions, author: e.target.value })}
                          placeholder="Frederic Murray"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Internal Description</label>
                        <input
                          type="text"
                          value={processOptions.imageDescription}
                          onChange={(e) => setProcessOptions({ ...processOptions, imageDescription: e.target.value })}
                          placeholder="Property description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Camera Make</label>
                        <input
                          type="text"
                          value={processOptions.make}
                          onChange={(e) => setProcessOptions({ ...processOptions, make: e.target.value })}
                          placeholder="AI Content Manager"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Camera Model</label>
                        <input
                          type="text"
                          value={processOptions.model}
                          onChange={(e) => setProcessOptions({ ...processOptions, model: e.target.value })}
                          placeholder="Image Processor v1.0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Software</label>
                        <input
                          type="text"
                          value={processOptions.software}
                          onChange={(e) => setProcessOptions({ ...processOptions, software: e.target.value })}
                          placeholder="AI Content Manager - Murray Group"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Host Computer</label>
                        <input
                          type="text"
                          value={processOptions.hostComputer}
                          onChange={(e) => setProcessOptions({ ...processOptions, hostComputer: e.target.value })}
                          placeholder="Murray Group Real Estate System"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrambling Options */}
                {processOptions.action === "scramble" && (
                  <div className="border-l-4 border-orange-500 pl-6 py-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔀 Image Scrambling Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Scramble Type</label>
                        <select
                          value={processOptions.scrambleType}
                          onChange={(e) => setProcessOptions({ ...processOptions, scrambleType: e.target.value as ProcessOptions["scrambleType"] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="pixel-shift">Pixel Shift</option>
                          <option value="watermark">Watermark Overlay</option>
                          <option value="blur-regions">Blur Regions</option>
                          <option value="color-shift">Color Distortion</option>
                          <option value="noise">Add Noise</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Intensity (1-100)</label>
                        <input
                          type="number"
                          value={processOptions.scrambleIntensity}
                          onChange={(e) => setProcessOptions({ ...processOptions, scrambleIntensity: parseInt(e.target.value) })}
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      {processOptions.scrambleType === "watermark" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
                            <input
                              type="text"
                              value={processOptions.watermarkText}
                              onChange={(e) => setProcessOptions({ ...processOptions, watermarkText: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <select
                              value={processOptions.watermarkPosition}
                              onChange={(e) => setProcessOptions({ ...processOptions, watermarkPosition: e.target.value as ProcessOptions["watermarkPosition"] })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="center">Center</option>
                              <option value="top-left">Top Left</option>
                              <option value="top-right">Top Right</option>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="bottom-right">Bottom Right</option>
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Options</label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={processOptions.preserveFaces}
                            onChange={(e) => setProcessOptions({ ...processOptions, preserveFaces: e.target.checked })}
                            className="rounded border-gray-300 text-orange-600 mr-2"
                          />
                          <span className="text-sm">Detect and blur faces</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Optimization */}
                <div className="border-l-4 border-green-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Image Optimization</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={processOptions.removeGPS}
                          onChange={(e) => setProcessOptions({ ...processOptions, removeGPS: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 mr-2"
                        />
                        <span className="text-sm">Remove GPS Data</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={processOptions.optimize}
                          onChange={(e) => setProcessOptions({ ...processOptions, optimize: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 mr-2"
                        />
                        <span className="text-sm">Optimize for Web</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={processOptions.keepColorProfile}
                          onChange={(e) => setProcessOptions({ ...processOptions, keepColorProfile: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 mr-2"
                        />
                        <span className="text-sm">Keep Color Profile</span>
                      </label>
                    </div>

                    {processOptions.optimize && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Width (px)</label>
                          <input
                            type="number"
                            value={processOptions.maxWidth}
                            onChange={(e) => setProcessOptions({ ...processOptions, maxWidth: parseInt(e.target.value) })}
                            min="640"
                            max="3840"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quality (1-100)</label>
                          <input
                            type="number"
                            value={processOptions.quality}
                            onChange={(e) => setProcessOptions({ ...processOptions, quality: parseInt(e.target.value) })}
                            min="1"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                <select
                  value={selectedWebsite}
                  onChange={(e) => setSelectedWebsite(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                  disabled={websites.length === 0}
                >
                  {websites.length > 0 ? (
                    <>
                      <option value="">All Sources</option>
                      {websites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                          {site.contentCount ? ` (${site.contentCount} items)` : ""}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">No websites available</option>
                  )}
                </select>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                  >
                    <option value="all">All Images ({stats.total})</option>
                    <option value="with-metadata">With Metadata ({stats.withMetadata})</option>
                    <option value="without-metadata">Without Metadata ({stats.withoutMetadata})</option>
                    <option value="ai-generated">AI Generated ({stats.aiGenerated})</option>
                    <option value="crawled">Crawled ({stats.crawled})</option>
                  </select>
                </div>

                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  {selectedImages.length === filteredImages.length && filteredImages.length > 0 ? "Deselect All" : "Select All"}
                </button>

                {selectedImages.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedImages.length} of {filteredImages.length} selected
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={loadImages}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={handleBatchProcess}
                  disabled={selectedImages.length === 0 || isProcessing}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing {processingStatus.filter((s) => s.status === "processing").length} images...
                    </>
                  ) : processOptions.action === "scramble" ? (
                    <>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Scramble Selected ({selectedImages.length})
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Process Selected ({selectedImages.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">Loading images from database...</p>
              </div>
            ) : filteredImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredImages.map((image) => {
                  const processingItem = processingStatus.find((s) => s.imageId === image.id);
                  const isSelected = selectedImages.includes(image.id);

                  return (
                    <ImageCard
                      key={image.id}
                      image={image}
                      isSelected={isSelected}
                      processingItem={processingItem}
                      onSelect={() => handleSelectImage(image.id)}
                      onFixUrl={openUrlFixer}
                      onImageError={handleImageError}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Image className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-xs sm:text-sm text-gray-500 text-center max-w-md px-4">
                  {activeTab === "crawl"
                    ? "Start crawling a website to discover images"
                    : !apiAvailable
                    ? "API endpoints are not configured. Please set up your backend services first."
                    : websites.length === 0
                    ? "No websites found. Please generate content with images first using the AI Content page."
                    : selectedWebsite
                    ? "No images found for this website. Generate content with images enabled or try crawling."
                    : "Select a website to view images or start crawling to discover new ones."}
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="mt-4 px-4 py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filter
                  </button>
                )}
                {activeTab === "existing" && (
                  <button
                    onClick={() => setActiveTab("crawl")}
                    className="mt-2 px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Crawling Images
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* URL Fixer Modal */}
      {showUrlFixer && urlFixerImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowUrlFixer(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Fix Image URL</h3>
                <button onClick={() => setShowUrlFixer(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium text-gray-900 mb-1">{urlFixerImage.contentTitle}</p>
                  <p className="text-xs text-gray-600">Website: {urlFixerImage.websiteName}</p>
                  {urlFixerImage.source && <p className="text-xs text-gray-600">Source: {urlFixerImage.source}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current URL (Broken)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={urlFixerImage.url || ''}
                      readOnly
                      className="flex-1 px-3 py-2 border border-red-300 bg-red-50 rounded-lg text-sm"
                    />
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  {(() => {
                    const validation = validateImageUrl(urlFixerImage.url || '');
                    return !validation.valid && validation.issue && (
                      <p className="text-xs text-red-600 mt-1">Issue: {validation.issue}</p>
                    );
                  })()}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fixed URL</label>
                  <input
                    type="text"
                    value={fixedUrl}
                    onChange={(e) => setFixedUrl(e.target.value)}
                    placeholder="Enter the corrected URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Edit the URL above or paste a new one</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Quick Fixes:</p>
                  <div className="flex flex-wrap gap-2">
                    {urlFixerImage.source && (
                      <button
                        onClick={() => {
                          const domain = extractDomainFromUrl(urlFixerImage.source || '');
                          if (domain) {
                            setFixedUrl(fixImageUrl(urlFixerImage.url || '', domain));
                          }
                        }}
                        className="text-xs px-3 py-1 bg-white border border-blue-300 rounded hover:bg-blue-100"
                      >
                        Use source domain
                      </button>
                    )}
                    {crawlUrl && (
                      <button
                        onClick={() => setFixedUrl(fixImageUrl(urlFixerImage.url || '', crawlUrl))}
                        className="text-xs px-3 py-1 bg-white border border-blue-300 rounded hover:bg-blue-100"
                      >
                        Use crawl URL
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const url = urlFixerImage.url || '';
                        if (!url.startsWith('http')) {
                          setFixedUrl(`https://${url}`);
                        }
                      }}
                      className="text-xs px-3 py-1 bg-white border border-blue-300 rounded hover:bg-blue-100"
                    >
                      Add https://
                    </button>
                  </div>
                </div>
                
                {fixedUrl && fixedUrl !== urlFixerImage.url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <img
                        src={fixedUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto"
                        onError={() => addToast('Preview failed - URL still invalid', 'warning')}
                        onLoad={() => addToast('Preview loaded successfully!', 'success', 2000)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowUrlFixer(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFixSingleUrl(urlFixerImage, fixedUrl)}
                  disabled={!fixedUrl || fixedUrl === urlFixerImage.url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply Fix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk URL Fixer */}
      {showBulkFixer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowBulkFixer(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Bulk Fix Relative URLs</h3>
                <button onClick={() => setShowBulkFixer(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This will automatically fix all relative URLs (starting with / or ./) by adding the base domain you provide.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Domain *</label>
                  <input
                    type="url"
                    value={bulkFixDomain}
                    onChange={(e) => setBulkFixDomain(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Example: https://example.com (don't include trailing slash)
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800"><strong>Preview:</strong></p>
                  <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                    <li>/images/photo.jpg → {bulkFixDomain || 'https://example.com'}/images/photo.jpg</li>
                    <li>./assets/img.png → {bulkFixDomain || 'https://example.com'}/assets/img.png</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> This only fixes relative URLs. Absolute URLs (starting with http:// or https://) won't be changed.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkFixer(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkFixUrls}
                  disabled={!bulkFixDomain}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Fix All Relative URLs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}