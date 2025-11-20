

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  X,
  BarChart3,
  Target,
  Zap,
  Shield,
  DollarSign,
  RefreshCw,
  Save,
  AlertTriangle,
  Cpu,
  Brain,
  Loader2,
  Upload,
  ImagePlus,
  Image,
  Download,
  Search,
  Filter,
  SortAsc,
  FileText,        // ← ADD THIS
  MessageSquare,
} from "lucide-react";
import { sanitizeHtmlContent, sanitizeFormInput } from "@/utils/sanitize-HTML";
import { API_URL } from "@/config/api";

const NICHES = [
  { value: "reputation_sites", label: "Good Reputation Sites & Reviews" },
  { value: "peptides", label: "Peptides & Performance Enhancement" },
  { value: "gambling", label: "Gambling & Sports Betting" },
  { value: "apps_marketing", label: "Apps Marketing & Reviews" },
  { value: "exclusive_models", label: "Creator Platforms & OnlyFans Business" },
  { value: "ecom_nails", label: "Nails & Beauty E-commerce" },
  { value: "soccer_jersey", label: "Soccer Jerseys & Fan Merchandise" },
  { value: "payment_processing", label: "Payment Processing & Fintech" },
  { value: "web_dev", label: "Web Development" },
  { value: "app_dev", label: "App Development" },
  { value: "construction", label: "Construction & B2B Services" },
  { value: "loans", label: "Loans & Lending" },
];


const LANGUAGES = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "italian", label: "Italian", flag: "🇮🇹" },
  { value: "portuguese", label: "Portuguese", flag: "🇵🇹" },
  { value: "russian", label: "Russian", flag: "🇷🇺" },
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "chinese", label: "Chinese (Simplified)", flag: "🇨🇳" },
  { value: "korean", label: "Korean", flag: "🇰🇷" },
  { value: "dutch", label: "Dutch", flag: "🇳🇱" },
  { value: "swedish", label: "Swedish", flag: "🇸🇪" },
  { value: "polish", label: "Polish", flag: "🇵🇱" },
  { value: "turkish", label: "Turkish", flag: "🇹🇷" },
  { value: "thai", label: "Thai", flag: "🇹🇭" },
  { value: "vietnamese", label: "Vietnamese", flag: "🇻🇳" },
];


// API utility functions
const api = {
  async getAllStandaloneContent() {
      const response = await fetch(`${API_URL}/api/user/content/all`, {
       credentials: "include",
     });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch standalone content");
    }
    return response.json();
  },
  async generateContent(data: any) {
    const response = await fetch(`${API_URL}/api/user/content/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate content");
    }
    return response.json();
  },
  async updateContent(contentId: number, data: any) {
    const response = await fetch(`${API_URL}/api/user/content/${contentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update content");
    }
    return response.json();
  },
  async deleteContent(contentId: number) {
      const response = await fetch(`${API_URL}/api/user/content/${contentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete content");
    }
    return response.json();
  },
  async uploadImages(files: FileList, contentId?: number) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    if (contentId) formData.append("contentId", contentId.toString());
  
   const response = await fetch(`${API_URL}/api/user/content/upload-images`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    
    if (!response.ok) throw new Error("Failed to upload images");
    return response.json();
  },
};


// Add these utility functions near the top with other utilities

const getNicheDescription = (nicheValue: string) => {
  const descriptions: Record<string, string> = {
    reputation_sites: "Online reviews & reputation management",
    peptides: "Performance supplements & enhancement",
    gambling: "Sports betting & casino content",
    apps_marketing: "App promotion & mobile marketing",
    exclusive_models: "Creator platforms & adult content",
    ecom_nails: "Beauty products & nail care",
    soccer_jersey: "Sports merchandise & fan gear",
    payment_processing: "Fintech & payment solutions",
    web_dev: "Web development & design",
    app_dev: "Mobile app development",
    construction: "Construction & B2B services",
    loans: "Lending & financial services",
  };
  return descriptions[nicheValue] || "Industry-specific content";
};

const getNicheIcon = (nicheValue: string) => {
  const iconClass = "w-4 h-4";
  
  switch (nicheValue) {
    case "reputation_sites":
      return <BarChart3 className={`${iconClass} text-indigo-600`} />;
    case "peptides":
      return <Zap className={`${iconClass} text-green-600`} />;
    case "gambling":
      return <DollarSign className={`${iconClass} text-yellow-600`} />;
    case "apps_marketing":
      return <Cpu className={`${iconClass} text-blue-600`} />;
    case "exclusive_models":
      return <Sparkles className={`${iconClass} text-pink-600`} />;
    case "ecom_nails":
      return <Sparkles className={`${iconClass} text-purple-600`} />;
    case "soccer_jersey":
      return <Target className={`${iconClass} text-red-600`} />;
    case "payment_processing":
      return <DollarSign className={`${iconClass} text-green-600`} />;
    case "web_dev":
      return <Cpu className={`${iconClass} text-blue-600`} />;
    case "app_dev":
      return <Bot className={`${iconClass} text-indigo-600`} />;
    case "construction":
      return <Shield className={`${iconClass} text-orange-600`} />;
    case "loans":
      return <DollarSign className={`${iconClass} text-yellow-600`} />;
    default:
      return <Target className={`${iconClass} text-gray-600`} />;
  }
};


// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 border-green-200";
    case "generating":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "draft":
    case "pending_approval":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "approved":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "published":
      return <CheckCircle className="w-4 h-4" />;
    case "generating":
      return <Bot className="w-4 h-4 animate-spin" />;
    case "scheduled":
      return <Clock className="w-4 h-4" />;
    case "draft":
    case "pending_approval":
      return <Edit className="w-4 h-4" />;
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <X className="w-4 h-4" />;
    default:
      return <Edit className="w-4 h-4" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case "openai":
      return <Cpu className="w-4 h-4 text-green-600" />;
    case "anthropic":
      return <Bot className="w-4 h-4 text-purple-600" />;
    case "gemini":
      return <Sparkles className="w-4 h-4 text-blue-600" />;
    default:
      return <Cpu className="w-4 h-4 text-gray-600" />;
  }
};

const getProviderName = (provider: string) => {
  switch (provider) {
    case "openai":
      return "OpenAI GPT-4";
    case "anthropic":
      return "Anthropic Claude";
    case "gemini":
      return "Google Gemini";
    default:
      return provider || "Unknown";
  }
};

const getNicheLabel = (nicheValue: string) => {
  const niche = NICHES.find((n) => n.value === nicheValue);
  return niche ? niche.label : nicheValue;
};

const formatDistanceToNow = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 1) {
    return "Less than an hour ago";
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
};

const getErrorType = (error: any) => {
  if (error.message.includes("OpenAI Error:")) return "openai";
  if (error.message.includes("Anthropic Error:")) return "anthropic";
  if (error.message.includes("PageSpeed API Error:")) return "pagespeed";
  if (error.message.includes("Analysis Error:")) return "analysis";
  return "general";
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Image Picker Modal Component
const ImagePickerModal = ({
  uploadedImages,
  onSelect,
  onClose,
  onUpload,
  isUploadingImage,
}: {
  uploadedImages: any[];
  onSelect: (img: any) => void;
  onClose: () => void;
  onUpload: (files: FileList | null) => void;
  isUploadingImage: boolean;
}) => {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select or Upload Image</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <label className="block">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => onUpload(e.target.files)}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Click or drag images to upload</p>
                </div>
              </label>
            </div>
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelect(img)}
                    className="cursor-pointer group relative border rounded hover:shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.altText}
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded flex items-center justify-center">
                      <Plus className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No images uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StandaloneContent() {
  // State management
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState("");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");
  const [activeTab, setActiveTab] = useState("all");

  // Image management state
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [contentImages, setContentImages] = useState<any[]>([]);
  const [selectedImageToReplace, setSelectedImageToReplace] = useState<any>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingContentId, setDeletingContentId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);

  // Refs
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");


  // Form state
  const [formData, setFormData] = useState({
    niche: "",
    topic: "",
    keywords: "",
    tone: "professional",
    wordCount: 800,
    seoOptimized: true,
    brandVoice: "",
    targetAudience: "",
    eatCompliance: false,
    aiProvider: "openai",
    includeImages: false,
    imageCount: 1,
    imageStyle: "natural",
    language: "english",
    promptType: "system", // NEW: 'system' or 'custom'
    customPrompt: "", // ADD THIS LINE
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    body: "",
    excerpt: "",
    keywords: "",
    tone: "professional",
    brandVoice: "",
    targetAudience: "",
    eatCompliance: false,
    aiProvider: "openai",
    regenerateImages: false,
    includeImages: false,
    imageCount: 1,
    imageStyle: "natural",
    language: "english", // ADD THIS LINE
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<any>({});

  // Load standalone content on mount
  useEffect(() => {
    loadContent();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...content];

    // Tab filter
    if (activeTab === "published") {
      filtered = filtered.filter((item) => item.status === "published");
    } else if (activeTab === "drafts") {
      filtered = filtered.filter((item) => item.status !== "published");
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearch) ||
          item.excerpt?.toLowerCase().includes(lowerSearch) ||
          item.niche?.toLowerCase().includes(lowerSearch)
      );
    }

    // Niche filter
    if (selectedNiche) {
      filtered = filtered.filter((item) => item.niche === selectedNiche);
    }

    // Provider filter
    if (selectedProvider) {
      filtered = filtered.filter((item) => item.aiProvider === selectedProvider);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "seo_score_desc":
          return (b.seoScore || 0) - (a.seoScore || 0);
        case "seo_score_asc":
          return (a.seoScore || 0) - (b.seoScore || 0);
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [content, searchTerm, selectedNiche, selectedProvider, sortBy, activeTab]);

  // Extract images from content
  useEffect(() => {
    if (editFormData.body) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const images = [];
      let match;
      while ((match = imgRegex.exec(editFormData.body)) !== null) {
        const altMatch = match[0].match(/alt=["']([^"']*?)["']/i);
        images.push({
          url: match[1],
          altText: altMatch ? altMatch[1] : "",
          htmlString: match[0],
          position: match.index,
        });
      }
      setContentImages(images);
    }
  }, [editFormData.body]);

  const loadContent = async () => {
    try {
      setIsLoadingContent(true);
      const contentData = await api.getAllStandaloneContent();
      // Filter to only standalone content (no websiteId)
      const standaloneContent = contentData.filter((item: any) => !item.websiteId && item.niche);
      setContent(standaloneContent);
    } catch (error: any) {
      showToast(
        "Failed to Load Content",
        error.message || "Unable to fetch standalone content",
        "destructive"
      );
      setContent([]);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const showToast = (
    title: string,
    description: string,
    variant: string = "default",
    errorType: string | null = null
  ) => {
    setToast({ title, description, variant, errorType });
    setTimeout(() => setToast(null), 6000);
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.niche.trim()) {
      errors.niche = "Please select a niche";
    }

    if (!formData.topic.trim()) {
      errors.topic = "Topic is required";
    } else if (formData.topic.trim().length < 10) {
      errors.topic = "Topic must be at least 10 characters";
    } else if (formData.topic.trim().length > 200) {
      errors.topic = "Topic must be under 200 characters";
    }

    if (!formData.language) {
    errors.language = "Please select a language";
    } else if (!LANGUAGES.find((l) => l.value === formData.language)) {
    errors.language = "Invalid language selected";
    }

        // NEW: Validate custom prompt if selected
    if (formData.promptType === "custom") {
      if (!formData.customPrompt.trim()) {
        errors.customPrompt = "Custom prompt is required when selected";
      } else if (formData.customPrompt.trim().length < 20) {
        errors.customPrompt = "Custom prompt must be at least 20 characters";
      } else if (formData.customPrompt.trim().length > 3000) {
        errors.customPrompt = "Custom prompt must be under 3000 characters";
      }
    }


    

    if (!formData.wordCount) {
      errors.wordCount = "Word count is required";
    } else if (formData.wordCount < 100) {
      errors.wordCount = "Minimum word count is 100";
    } else if (formData.wordCount > 5000) {
      errors.wordCount = "Maximum word count is 5,000";
    }

    if (!formData.aiProvider) {
      errors.aiProvider = "Please select an AI provider";
    } else if (!["openai", "anthropic", "gemini"].includes(formData.aiProvider)) {
      errors.aiProvider = "Invalid AI provider selected";
    }

    const validTones = [
      "professional",
      "casual",
      "friendly",
      "authoritative",
      "technical",
      "warm",
    ];
    if (!formData.tone || !validTones.includes(formData.tone)) {
      errors.tone = "Please select a valid content tone";
    }

    if (formData.keywords && formData.keywords.trim()) {
      const keywordArray = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
      if (keywordArray.length > 10) {
        errors.keywords = "Maximum 10 keywords allowed";
      }
      const tooLongKeywords = keywordArray.filter((k) => k.length > 50);
      if (tooLongKeywords.length > 0) {
        errors.keywords = "Keywords must be under 50 characters each";
      }
    }

    if (formData.includeImages) {
      if (!formData.imageCount || formData.imageCount < 1 || formData.imageCount > 3) {
        errors.imageCount = "Image count must be between 1 and 3";
      }
      const validStyles = ["natural", "digital_art", "photographic", "cinematic"];
      if (!formData.imageStyle || !validStyles.includes(formData.imageStyle)) {
        errors.imageStyle = "Invalid image style selected";
      }
    }

    if (formData.brandVoice && formData.brandVoice.length > 500) {
      errors.brandVoice = "Brand voice description must be under 500 characters";
    }

    if (formData.targetAudience && formData.targetAudience.length > 300) {
      errors.targetAudience = "Target audience description must be under 300 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors: any = {};

    if (!editFormData.title.trim()) errors.title = "Title is required";
    if (!editFormData.body.trim()) errors.body = "Content body is required";
    if (editFormData.body.trim().length < 50) {
      errors.body = "Content body must be at least 50 characters long";
    }

    if (
      (editFormData.regenerateImages || editFormData.includeImages) &&
      (editFormData.imageCount < 1 || editFormData.imageCount > 3)
    ) {
      errors.imageCount = "Image count must be between 1 and 3";
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      niche: "",
      topic: "",
      keywords: "",
      tone: "professional",
      wordCount: 800,
      seoOptimized: true,
      brandVoice: "",
      targetAudience: "",
      eatCompliance: false,
      aiProvider: "openai",
      includeImages: false,
      imageCount: 1,
      imageStyle: "natural",
      language: "english",
      promptType: "system",
      customPrompt: "",
    });
    setFormErrors({});
    setShowLanguageDropdown(false);
    setLanguageSearchTerm("");
  };

    // Also close dropdown when dialog closes
  const closeGenerateDialog = () => {
    setIsGenerateDialogOpen(false);
    setShowLanguageDropdown(false);
    setLanguageSearchTerm("");
  };

  const generateContent = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationPhase("Initializing AI...");

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const increment = prev < 20 ? 3 : prev < 50 ? 2 : prev < 80 ? 1.5 : 0.5;
        const newProgress = Math.min(prev + increment, 90);

        if (newProgress < 15) {
          setGenerationPhase("Initializing AI...");
          setEstimatedTimeRemaining(25);
        } else if (newProgress < 30) {
          setGenerationPhase("Analyzing topic and keywords...");
          setEstimatedTimeRemaining(20);
        } else if (newProgress < 45) {
          setGenerationPhase(
            `Generating content with ${getProviderName(formData.aiProvider)}...`
          );
          setEstimatedTimeRemaining(15);
        } else if (newProgress < 60) {
          setGenerationPhase("Optimizing for SEO...");
          setEstimatedTimeRemaining(10);
        } else if (newProgress < 75) {
          setGenerationPhase("Analyzing readability and brand voice...");
          setEstimatedTimeRemaining(5);
        } else if (newProgress < 85) {
          setGenerationPhase(
            formData.includeImages
              ? "Generating AI images..."
              : "Finalizing content..."
          );
          setEstimatedTimeRemaining(3);
        } else {
          setGenerationPhase("Almost done...");
          setEstimatedTimeRemaining(1);
        }

        return newProgress;
      });
    }, 300);

    try {
      const keywords = formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const result = await api.generateContent({
        niche: formData.niche,
        topic: formData.topic,
        keywords: keywords,
        tone: formData.tone,
        wordCount: formData.wordCount,
        brandVoice: formData.brandVoice || undefined,
        targetAudience: formData.targetAudience || undefined,
        eatCompliance: formData.eatCompliance,
        aiProvider: formData.aiProvider,
        includeImages: formData.includeImages,
        imageCount: formData.imageCount,
        imageStyle: formData.imageStyle,
        language: formData.language,
        promptType: formData.promptType, // NEW
        customPrompt: formData.promptType === "custom" ? formData.customPrompt : undefined,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationPhase("Content generated successfully!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const aiResult = result.aiResult;
      const imageInfo =
        aiResult.images?.length > 0
          ? `+ ${aiResult.images.length} images ($${aiResult.totalImageCost?.toFixed(4)})`
          : "";

      showToast(
        "Content Generated Successfully",
        `${getProviderName(aiResult.aiProvider)} generated content with SEO: ${
          aiResult.seoScore
        }%, Readability: ${aiResult.readabilityScore}%, Brand Voice: ${
          aiResult.brandVoiceScore
        }%. Cost: $${(aiResult.costUsd / 100).toFixed(4)}${imageInfo}`
      );

      setIsGenerateDialogOpen(false);
      resetForm();
      setGenerationProgress(0);
      setGenerationPhase("");
      setEstimatedTimeRemaining(0);
      await loadContent();
    } catch (error: any) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      setGenerationPhase("");
      const errorType = getErrorType(error);
      let errorTitle = "Content Generation Failed";
      let errorDescription = error.message;

      if (error.message.includes("Image generation failed")) {
        errorTitle = "Image Generation Failed";
        errorDescription =
          "Content generated successfully, but image generation failed. " +
          error.message;
      }

      showToast(errorTitle, errorDescription, "destructive", errorType);
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditDialog = (contentItem: any) => {
    setEditingContent(contentItem);
    setEditFormData({
      title: contentItem.title || "",
      body: contentItem.body || "",
      excerpt: contentItem.excerpt || "",
      keywords: Array.isArray(contentItem.seoKeywords)
        ? contentItem.seoKeywords.join(", ")
        : "",
      tone: contentItem.tone || "professional",
      brandVoice: contentItem.brandVoice || "",
      targetAudience: contentItem.targetAudience || "",
      eatCompliance: contentItem.eatCompliance || false,
      aiProvider: contentItem.aiProvider || "openai",
      regenerateImages: false,
      includeImages: contentItem.hasImages || false,
      imageCount: contentItem.imageCount || 1,
      imageStyle: "natural",
      language: "english", 
    });
    setEditFormErrors({});
    setUploadedImages([]);
    setContentImages([]);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingContent(null);
    setEditFormData({
      title: "",
      body: "",
      excerpt: "",
      keywords: "",
      tone: "professional",
      brandVoice: "",
      targetAudience: "",
      eatCompliance: false,
      aiProvider: "openai",
      regenerateImages: false,
      includeImages: false,
      imageCount: 1,
      imageStyle: "natural",
      language: "english",
    });
    setEditFormErrors({});
    setUploadedImages([]);
    setContentImages([]);
  };

  const saveContent = async () => {
    if (!validateEditForm() || !editingContent) return;

    setIsSaving(true);
    try {
      const keywords = editFormData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      await api.updateContent(editingContent.id, {
        title: sanitizeFormInput(editFormData.title),
        body: sanitizeHtmlContent(editFormData.body, true),
        excerpt: sanitizeFormInput(editFormData.excerpt),
        seoKeywords: keywords,
        tone: editFormData.tone,
        brandVoice: editFormData.brandVoice || undefined,
        targetAudience: editFormData.targetAudience || undefined,
        eatCompliance: editFormData.eatCompliance,
      });

      await loadContent();
      closeEditDialog();
      showToast(
        "Content Saved Successfully",
        "Your changes have been saved to the database."
      );
    } catch (error: any) {
      showToast(
        "Save Failed",
        error.message || "Failed to save content changes",
        "destructive"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateContent = async () => {
    if (!validateEditForm() || !editingContent) return;

    if (
      !editFormData.aiProvider ||
      !["openai", "anthropic", "gemini"].includes(editFormData.aiProvider)
    ) {
      setEditFormErrors({
        aiProvider:
          "Please select a valid AI provider for content regeneration",
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const keywords = editFormData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const result = await api.updateContent(editingContent.id, {
        title: editFormData.title,
        body: editFormData.body,
        excerpt: editFormData.excerpt,
        seoKeywords: keywords,
        tone: editFormData.tone,
        brandVoice: editFormData.brandVoice || undefined,
        targetAudience: editFormData.targetAudience || undefined,
        eatCompliance: editFormData.eatCompliance,
        aiProvider: editFormData.aiProvider,
        regenerateImages: editFormData.regenerateImages,
        includeImages: editFormData.includeImages,
        imageCount: editFormData.imageCount,
        imageStyle: editFormData.imageStyle,
      });

      await loadContent();
      closeEditDialog();

      if (result.regeneration && result.regeneration.success) {
        const regen = result.regeneration;
        let successMessage = `${getProviderName(
          regen.contentAiProvider
        )} created new content - SEO: ${regen.seoScore}%, Readability: ${
          regen.readabilityScore
        }%, Brand Voice: ${
          regen.brandVoiceScore
        }%. Text cost: $${regen.costUsd.toFixed(4)}`;

        if (regen.imagesRegenerated && regen.newImageCount > 0) {
          successMessage += `. Generated ${regen.newImageCount} new image${
            regen.newImageCount > 1 ? "s" : ""
          } with DALL-E for $${regen.imageCostUsd.toFixed(4)}`;
        }

        showToast("Content Regenerated Successfully", successMessage);
      } else {
        showToast(
          "Content Saved Successfully",
          "Your content has been updated and saved."
        );
      }
    } catch (error: any) {
      const errorType = getErrorType(error);
      showToast(
        "Regeneration Failed",
        error.message,
        "destructive",
        errorType
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const deleteContent = async (contentId: number) => {
    setIsDeleting(true);
    setDeletingContentId(contentId);
    try {
      await api.deleteContent(contentId);
      await loadContent();
      showToast("Content Deleted", "Content has been successfully deleted.");
      setShowDeleteConfirm(false);
      setContentToDelete(null);
    } catch (error: any) {
      showToast(
        "Delete Failed",
        error.message || "Failed to delete content. Please try again.",
        "destructive"
      );
    } finally {
      setIsDeleting(false);
      setDeletingContentId(null);
    }
  };

  const downloadContentAsDoc = (item: any) => {
    try {
      const htmlContent = `
          <!DOCTYPE html>
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>${item.title}</title>
            <style>
              body {
                font-family: 'Calibri', sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                margin: 1in;
              }
              h1 {
                font-size: 24pt;
                font-weight: bold;
                margin-bottom: 20pt;
                color: #2c3e50;
              }
              p {
                margin-bottom: 12pt;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            <h1>${item.title}</h1>
            <div class="content">
              ${item.body}
            </div>
          </body>
          </html>`;

      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = item.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()
        .substring(0, 50);
      link.download = `${filename}_${Date.now()}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        "Download Started",
        `Downloading "${item.title}" as Word document`
      );
    } catch (error: any) {
      showToast(
        "Download Failed",
        error.message || "Failed to download content",
        "destructive"
      );
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadProgress(0);

    try {
      const result = await api.uploadImages(files, editingContent?.id);
      setUploadedImages((prev) => [...prev, ...result.images]);
      showToast(
        "Images Uploaded",
        `Successfully uploaded ${result.images.length} image(s)`
      );

      if (result.images.length === 1 && bodyTextareaRef.current) {
        insertImageAtCursor(result.images[0].url, result.images[0].altText);
      }
    } catch (error: any) {
      showToast("Upload Failed", error.message, "destructive");
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(0);
    }
  };

  const insertImageAtCursor = (imageUrl: string, altText: string = "") => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editFormData.body;

    const imageHtml = `
<figure class="wp-block-image size-large">
  <img src="${imageUrl}" alt="${altText}" class="aligncenter" />
  <figcaption>${altText}</figcaption>
</figure>`;

    const newText = text.substring(0, start) + imageHtml + text.substring(end);

    setEditFormData((prev) => ({
      ...prev,
      body: newText,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + imageHtml.length,
        start + imageHtml.length
      );
    }, 0);
  };

  const replaceImage = (oldImageUrl: string, newImageUrl: string, newAltText: string) => {
    let updatedBody = editFormData.body;
    const imgRegex = new RegExp(
      `<img[^>]*src=["']${escapeRegExp(oldImageUrl)}["'][^>]*>`,
      "gi"
    );

    updatedBody = updatedBody.replace(imgRegex, (match) => {
      return match
        .replace(/src=["'][^"']+["']/, `src="${newImageUrl}"`)
        .replace(/alt=["'][^"']*["']/, `alt="${newAltText}"`);
    });

    setEditFormData((prev) => ({
      ...prev,
      body: updatedBody,
    }));

    showToast("Image Replaced", "Successfully replaced image in content");
  };

  const removeImage = (image: any) => {
    const updatedBody = editFormData.body.replace(image.htmlString, "");
    setEditFormData((prev) => ({
      ...prev,
      body: updatedBody,
    }));
  };

  const openDeleteConfirm = (item: any) => {
    setContentToDelete(item);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setContentToDelete(null);
  };

  // Calculate metrics
  const totalCost = filteredContent.reduce((sum, item) => {
    const cost = typeof item.costUsd === "number" ? item.costUsd : 0;
    return sum + cost;
  }, 0);

  const validScores = filteredContent.filter(
    (item) => typeof item.seoScore === "number" && item.seoScore > 0
  );

  const avgSeoScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((sum, item) => sum + item.seoScore, 0) /
            validScores.length
        )
      : null;

  const publishedCount = filteredContent.filter(
    (c) => c.status === "published"
  ).length;

  const draftCount = filteredContent.filter(
    (c) => c.status !== "published"
  ).length;

  return (
    <div className="py-6 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes stripes {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        .bg-stripes {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 40px 40px;
          animation: stripes 1s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-md ${
              toast.variant === "destructive"
                ? "bg-red-50 border-red-200 text-red-800"
                : toast.variant === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                {(toast.variant === "destructive" ||
                  toast.variant === "warning") && (
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{toast.title}</div>
                  <div className="text-xs opacity-90 mt-1">
                    {toast.description}
                  </div>
                  {toast.errorType && (
                    <div className="text-xs mt-1 opacity-75">
                      Error Type: {toast.errorType.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-3 opacity-70 hover:opacity-100 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Header - UPDATED WITHOUT BACK BUTTON */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Standalone Content Generator
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage AI-powered content for any niche, independent of websites
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={loadContent}
              disabled={isLoadingContent}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  isLoadingContent ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
            <button
              onClick={() => setIsGenerateDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Content
            </button>
          </div>
        </div>

        {isGenerateDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => !isGenerating && setIsGenerateDialogOpen(false)}
              ></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Generate Standalone Content
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create SEO-optimized content for any niche with your
                      preferred AI provider
                    </p>
                  </div>
                  <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* AI Provider Selection */}
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Provider for Content *
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Select AI provider for content generation. Images will
                        always use DALL-E 3 when enabled.
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aiProvider: "openai",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.aiProvider === "openai"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <Cpu className="w-4 h-4 text-green-600 mr-2" />
                            <span className="font-medium text-sm">
                              OpenAI GPT-4O
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Advanced language model with excellent content
                            generation
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            $0.005/$0.015 per 1K tokens
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aiProvider: "anthropic",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.aiProvider === "anthropic"
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <Bot className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="font-medium text-sm">
                              Anthropic Claude
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Thoughtful AI with strong analytical capabilities
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            $0.003/$0.015 per 1K tokens
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aiProvider: "gemini",
                            }))
                          }
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.aiProvider === "gemini"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-sm">
                              Google Gemini
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Google's multimodal AI with strong reasoning
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            $0.0025/$0.0075 per 1K tokens
                          </p>
                        </button>
                      </div>
                      {formErrors.aiProvider && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.aiProvider}
                        </p>
                      )}
                    </div>

                    
                    {/* NEW: Prompt Type Selection */}
                    <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Prompt Type *
                      </label>
                      <p className="text-xs text-gray-600 mb-4">
                        Choose between our optimized system prompt or provide your own custom instructions
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              promptType: "system",
                              customPrompt: "",
                            }))
                          }
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.promptType === "system"
                              ? "border-purple-500 bg-purple-100 shadow-md"
                              : "border-gray-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            {formData.promptType === "system" && (
                              <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                            )}
                            <FileText className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="font-medium text-sm">System Prompt</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Use our optimized, SEO-focused content generation prompt
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              promptType: "custom",
                            }))
                          }
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            formData.promptType === "custom"
                              ? "border-purple-500 bg-purple-100 shadow-md"
                              : "border-gray-200 bg-white hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            {formData.promptType === "custom" && (
                              <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                            )}
                            <MessageSquare className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="font-medium text-sm">Custom Prompt</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Provide your own specific instructions for content generation
                          </p>
                        </button>
                      </div>

                      {/* Custom Prompt Textarea */}
                      {formData.promptType === "custom" && (
                        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Custom Prompt *
                          </label>
                          <textarea
                            value={formData.customPrompt}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                customPrompt: e.target.value,
                              }))
                            }
                            placeholder="Enter your custom instructions for content generation. Be specific about style, structure, tone, and any special requirements..."
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formData.customPrompt.length}
                            </p>
                            {formErrors.customPrompt && (
                              <p className="text-xs text-red-600">
                                {formErrors.customPrompt}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-800">
                              <strong>Tip:</strong> Your custom prompt will be combined with the topic, keywords, and other settings you provide below. Be clear and specific about what you want!
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.promptType === "system" && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs text-green-800">
                            <strong>System Prompt Benefits:</strong> Optimized for SEO, readability, and brand voice consistency. Includes automatic structure optimization and keyword placement.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Niche Selector - Replace the existing dropdown section with this */}
                      <div className="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Content Niche *
                        </label>
                        <p className="text-xs text-gray-600 mb-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mr-1">
                            <Target className="w-3 h-3 mr-1" />
                            Required
                          </span>
                          Select the industry niche for your content to help AI understand your audience
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                          {NICHES.map((niche) => (
                            <button
                              key={niche.value}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  niche: niche.value,
                                }))
                              }
                              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                formData.niche === niche.value
                                  ? "border-indigo-500 bg-indigo-100 shadow-md scale-105"
                                  : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    {formData.niche === niche.value && (
                                      <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium ${
                                      formData.niche === niche.value
                                        ? "text-indigo-900"
                                        : "text-gray-900"
                                    }`}>
                                      {niche.label}
                                    </span>
                                  </div>
                                  {/* Optional: Add descriptions for each niche */}
                                  <p className={`text-xs mt-1 ${
                                    formData.niche === niche.value
                                      ? "text-indigo-700"
                                      : "text-gray-500"
                                  }`}>
                                    {getNicheDescription(niche.value)}
                                  </p>
                                </div>
                                <div className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  formData.niche === niche.value
                                    ? "bg-indigo-500"
                                    : "bg-gray-100"
                                }`}>
                                  {getNicheIcon(niche.value)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {formErrors.niche && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {formErrors.niche}
                          </p>
                        )}
                      </div>

                    {/* Language Selector - NATIVE SELECT DROPDOWN */}
                      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Content Language *
                        </label>
                        <p className="text-xs text-gray-600 mb-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Required
                          </span>
                          Select the language for your AI-generated content
                        </p>
                        
                        <select
                          value={formData.language}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              language: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                        >
                          <option value="" disabled>
                            Select a language...
                          </option>
                          {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                              {lang.flag} {lang.label}
                            </option>
                          ))}
                        </select>

                        {formErrors.language && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {formErrors.language}
                          </p>
                        )}
                      </div>

                    {/* Content Tone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Tone
                      </label>
                      <select
                        value={formData.tone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="friendly">Friendly</option>
                        <option value="authoritative">Authoritative</option>
                        <option value="technical">Technical</option>
                        <option value="warm">Warm</option>
                      </select>
                    </div>

                    {/* Content Topic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Topic *
                      </label>
                      <input
                        type="text"
                        value={formData.topic}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            topic: e.target.value,
                          }))
                        }
                        placeholder={
                          formData.niche
                            ? `e.g., Latest ${getNicheLabel(formData.niche)} Trends`
                            : "e.g., Your content topic"
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formErrors.topic && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.topic}
                        </p>
                      )}
                    </div>

                    {/* SEO Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            keywords: e.target.value,
                          }))
                        }
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate keywords with commas
                      </p>
                    </div>

                    {/* Word Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Word Count
                      </label>
                      <input
                        type="number"
                        value={formData.wordCount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            wordCount: parseInt(e.target.value) || 0,
                          }))
                        }
                        min="100"
                        max="5000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formErrors.wordCount && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.wordCount}
                        </p>
                      )}
                    </div>

                    {/* SEO Optimized */}
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.seoOptimized}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              seoOptimized: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          SEO Optimized
                        </span>
                      </label>
                    </div>

                    {/* Advanced Options */}
                    <div className="border-t pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-500"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Advanced Options
                      </button>
                      {showAdvanced && (
                        <div className="mt-3 space-y-4 pl-5 border-l-2 border-blue-100">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target Audience
                            </label>
                            <input
                              type="text"
                              value={formData.targetAudience}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  targetAudience: e.target.value,
                                }))
                              }
                              placeholder="e.g., Small business owners, Developers"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Brand Voice
                            </label>
                            <input
                              type="text"
                              value={formData.brandVoice}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  brandVoice: e.target.value,
                                }))
                              }
                              placeholder="Describe your brand voice"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.eatCompliance}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    eatCompliance: e.target.checked,
                                  }))
                                }
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                E-E-A-T Compliance (YMYL Content)
                              </span>
                            </label>
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.includeImages}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      includeImages: e.target.checked,
                                    }))
                                  }
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                  Generate Images with DALL-E 3
                                </span>
                              </label>
                              <span className="text-xs text-orange-600">
                                $0.04-$0.12 per image
                              </span>
                            </div>
                            {formData.includeImages && (
                              <div className="space-y-3 pl-6 border-l-2 border-orange-100 bg-orange-50 p-3 rounded">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Number of Images
                                    </label>
                                    <select
                                      value={formData.imageCount}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          imageCount: parseInt(e.target.value),
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value={1}>1 Image (Hero)</option>
                                      <option value={2}>
                                        2 Images (Hero + Support)
                                      </option>
                                      <option value={3}>
                                        3 Images (Full Set)
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Image Style
                                    </label>
                                    <select
                                      value={formData.imageStyle}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          imageStyle: e.target.value,
                                        }))
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      <option value="natural">
                                        Natural/Photorealistic
                                      </option>
                                      <option value="digital_art">
                                        Digital Art
                                      </option>
                                      <option value="photographic">
                                        Professional Photography
                                      </option>
                                      <option value="cinematic">
                                        Cinematic
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6">
                  {isGenerating && (
                    <div className="mb-4 px-1">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              Generating Content
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {generationProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                          <div
                            style={{ width: `${generationProgress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out relative"
                          >
                            <div className="absolute inset-0 bg-stripes opacity-20"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
                            <span className="text-gray-700">
                              {generationPhase}
                            </span>
                          </div>
                          {estimatedTimeRemaining > 0 && (
                            <div className="flex items-center text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span className="text-xs">
                                ~{estimatedTimeRemaining}s remaining
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={generateContent}
                      disabled={isGenerating}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isGenerating ? (
                        <>
                          <Bot className="w-4 h-4 mr-2 animate-spin" />
                          Generating ({generationProgress}%)...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with {getProviderName(formData.aiProvider)}
                          {formData.includeImages && (
                            <span className="ml-1 text-xs bg-orange-500 px-1 rounded">
                              +${(formData.imageCount * 0.04).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        !isGenerating && setIsGenerateDialogOpen(false)
                      }
                      disabled={isGenerating}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "Please wait..." : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Content Dialog */}
        {isEditDialogOpen && editingContent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={closeEditDialog}
              ></div>
              <div className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-7xl mx-auto my-8">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Content
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Edit content with live preview - Save changes or
                        regenerate with AI
                      </p>
                    </div>
                    <button
                      onClick={closeEditDialog}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {/* Main Content - Side by Side Layout */}
                <div className="flex h-[calc(100vh-200px)]">
                  {/* Left Side - WordPress Preview */}
                  <div className="flex-1 p-6 bg-gray-50 overflow-y-auto border-r border-gray-200">
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="mb-8">
                          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                            {editFormData.title || "Your Post Title"}
                          </h1>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <span>By Admin</span>
                            <span className="mx-2">•</span>
                            <span>{new Date().toLocaleDateString()}</span>
                            {editFormData.keywords && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Keywords: {editFormData.keywords}</span>
                              </>
                            )}
                          </div>
                          {editFormData.excerpt && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                              <p className="text-blue-800 italic">
                                {editFormData.excerpt}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="prose prose-lg max-w-none">
                          <div
                            className="wordpress-content"
                            dangerouslySetInnerHTML={{
                              __html:
                                editFormData.body ||
                                "<p>Start typing your content...</p>",
                            }}
                            style={{ lineHeight: "1.7", fontSize: "16px" }}
                          />
                        </div>
                        {(editFormData.targetAudience ||
                          editFormData.brandVoice ||
                          editFormData.eatCompliance) && (
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Content Metadata
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {editFormData.targetAudience && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Audience: {editFormData.targetAudience}
                                </span>
                              )}
                              {editFormData.brandVoice && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Voice: {editFormData.brandVoice}
                                </span>
                              )}
                              {editFormData.eatCompliance && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  <Shield className="w-3 h-3 mr-1" />
                                  E-E-A-T Compliant
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Tone: {editFormData.tone}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right Side - Edit Form */}
                  <div className="w-96 p-6 bg-white overflow-y-auto">
                    <div className="space-y-6">
                      {/* AI Provider Selection */}
                      <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          AI Provider for Regeneration
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                          Select an AI provider to completely regenerate this
                          content with new AI-generated text
                        </p>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                aiProvider: "openai",
                              }))
                            }
                            className={`w-full p-3 border rounded-lg text-left text-sm transition-all ${
                              editFormData.aiProvider === "openai"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Cpu className="w-4 h-4 text-green-600 mr-2" />
                                <span className="font-medium">
                                  OpenAI GPT-4
                                </span>
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                aiProvider: "anthropic",
                              }))
                            }
                            className={`w-full p-3 border rounded-lg text-left text-sm transition-all ${
                              editFormData.aiProvider === "anthropic"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center">
                              <Bot className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="font-medium">
                                Anthropic Claude
                              </span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                aiProvider: "gemini",
                              }))
                            }
                            className={`w-full p-3 border rounded-lg text-left text-sm transition-all ${
                              editFormData.aiProvider === "gemini"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center">
                              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="font-medium">Google Gemini</span>
                            </div>
                          </button>
                        </div>
                        {editFormErrors.aiProvider && (
                          <p className="text-sm text-red-600 mt-2">
                            {editFormErrors.aiProvider}
                          </p>
                        )}
                      </div>

                      {/* Image Management Section */}
                      <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Image Management
                          </h4>
                          <span className="text-xs text-indigo-600">
                            {contentImages.length} images in content
                          </span>
                        </div>
                        {/* Upload New Images */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Upload Custom Images
                          </label>
                          <div className="flex items-center space-x-2">
                            <label className="flex-1">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageUpload(e.target.files)
                                }
                                disabled={isUploadingImage}
                                className="hidden"
                              />
                              <div className="px-3 py-2 border-2 border-dashed border-indigo-300 rounded-lg text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-100 transition-colors">
                                {isUploadingImage ? (
                                  <div className="flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    <span className="text-xs">
                                      Uploading... {imageUploadProgress}%
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <Upload className="w-4 h-4 mr-2 text-indigo-600" />
                                    <span className="text-xs text-indigo-700">
                                      Click to upload images
                                    </span>
                                  </div>
                                )}
                              </div>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowImagePicker(true)}
                              className="p-2 border border-indigo-300 rounded-lg hover:bg-indigo-100"
                              title="Insert image at cursor"
                            >
                              <ImagePlus className="w-4 h-4 text-indigo-600" />
                            </button>
                          </div>
                          {isUploadingImage && (
                            <div className="mt-2">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${imageUploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Uploaded Images Gallery */}
                        {uploadedImages.length > 0 && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Recently Uploaded
                            </label>
                            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                              {uploadedImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative group cursor-pointer"
                                  onClick={() =>
                                    insertImageAtCursor(img.url, img.altText)
                                  }
                                >
                                  <img
                                    src={img.url}
                                    alt={img.altText}
                                    className="w-full h-20 object-cover rounded border hover:border-indigo-500"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Click image to insert at cursor position
                            </p>
                          </div>
                        )}

                        {/* Current Content Images */}
                        {contentImages.length > 0 && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Images in Content
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {contentImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center space-x-2 p-2 bg-white rounded border"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.altText}
                                    className="w-16 h-12 object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = "/placeholder-image.png";
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs truncate">
                                      {img.altText || "No alt text"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {img.url}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(img)}
                                    className="p-1 hover:bg-red-100 rounded"
                                    title="Remove image"
                                  >
                                    <X className="w-3 h-3 text-red-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Regeneration Options */}
                      <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            AI Image Options
                          </h4>
                          <span className="text-xs text-orange-600">
                            DALL-E 3 Only
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          Images are always generated with DALL-E 3, regardless
                          of your content AI provider choice.
                        </p>
                        <div className="space-y-3">
                          <label className="flex items-start">
                            <input
                              type="radio"
                              name="imageRegenOption"
                              checked={
                                !editFormData.regenerateImages &&
                                !editFormData.includeImages
                              }
                              onChange={() =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  regenerateImages: false,
                                  includeImages: false,
                                }))
                              }
                              className="mt-1 rounded border-gray-300 text-orange-600"
                            />
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-700">
                                Keep Current Setup
                              </span>
                              <p className="text-xs text-gray-600">
                                {editingContent && editingContent.hasImages
                                  ? `Keep existing ${
                                      editingContent.imageCount || 0
                                    } images`
                                  : "No images (text content only)"}
                              </p>
                              <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                No additional cost
                              </span>
                            </div>
                          </label>
                          {editingContent && editingContent.hasImages && (
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="imageRegenOption"
                                checked={editFormData.regenerateImages}
                                onChange={() =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    regenerateImages: true,
                                    includeImages: true,
                                  }))
                                }
                                className="mt-1 rounded border-gray-300 text-orange-600"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Regenerate Images
                                </span>
                                <p className="text-xs text-gray-600">
                                  Create completely new AI-generated images for
                                  this content
                                </p>
                                <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                  $0.04 per image
                                </span>
                              </div>
                            </label>
                          )}
                          {(!editingContent || !editingContent.hasImages) && (
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="imageRegenOption"
                                checked={
                                  !editFormData.regenerateImages &&
                                  editFormData.includeImages
                                }
                                onChange={() =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    regenerateImages: false,
                                    includeImages: true,
                                  }))
                                }
                                className="mt-1 rounded border-gray-300 text-orange-600"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Add New Images
                                </span>
                                <p className="text-xs text-gray-600">
                                  Generate images for content that doesn't
                                  currently have any
                                </p>
                                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  $0.04 per image
                                </span>
                              </div>
                            </label>
                          )}
                          {(editFormData.regenerateImages ||
                            editFormData.includeImages) && (
                            <div className="ml-6 pl-4 border-l-2 border-orange-200 space-y-3 bg-white p-3 rounded">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Number of Images
                                  </label>
                                  <select
                                    value={editFormData.imageCount}
                                    onChange={(e) =>
                                      setEditFormData((prev) => ({
                                        ...prev,
                                        imageCount: parseInt(e.target.value),
                                      }))
                                    }
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  >
                                    <option value={1}>1 Image (Hero)</option>
                                    <option value={2}>
                                      2 Images (Hero + Support)
                                    </option>
                                    <option value={3}>
                                      3 Images (Full Set)
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Image Style
                                  </label>
                                  <select
                                    value={editFormData.imageStyle}
                                    onChange={(e) =>
                                      setEditFormData((prev) => ({
                                        ...prev,
                                        imageStyle: e.target.value,
                                      }))
                                    }
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  >
                                    <option value="natural">
                                      Natural/Photorealistic
                                    </option>
                                    <option value="digital_art">
                                      Digital Art
                                    </option>
                                    <option value="photographic">
                                      Professional Photography
                                    </option>
                                    <option value="cinematic">Cinematic</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Enter content title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {editFormErrors.title && (
                          <p className="text-sm text-red-600 mt-1">
                            {editFormErrors.title}
                          </p>
                        )}
                      </div>

                      {/* Content Body */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content Body *
                        </label>
                        <textarea
                          ref={bodyTextareaRef}
                          value={editFormData.body}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              body: e.target.value,
                            }))
                          }
                          placeholder="Enter the main content..."
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none text-sm font-mono"
                          style={{ fontSize: "13px", lineHeight: "1.4" }}
                        />
                        {editFormErrors.body && (
                          <p className="text-sm text-red-600 mt-1">
                            {editFormErrors.body}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {editFormData.body.length} characters • You can use
                          HTML tags for formatting
                        </p>
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Excerpt
                        </label>
                        <textarea
                          value={editFormData.excerpt}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              excerpt: e.target.value,
                            }))
                          }
                          placeholder="Brief description or summary..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        />
                      </div>

                      {/* SEO Keywords and Tone */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SEO Keywords
                          </label>
                          <input
                            type="text"
                            value={editFormData.keywords}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                keywords: e.target.value,
                              }))
                            }
                            placeholder="wordpress, security, tips"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Separate keywords with commas
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Tone
                          </label>
                          <select
                            value={editFormData.tone}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                tone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="friendly">Friendly</option>
                            <option value="authoritative">Authoritative</option>
                            <option value="technical">Technical</option>
                            <option value="warm">Warm</option>
                          </select>
                        </div>
                      </div>

                      {/* Target Audience and Brand Voice */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Audience
                          </label>
                          <input
                            type="text"
                            value={editFormData.targetAudience}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                targetAudience: e.target.value,
                              }))
                            }
                            placeholder="e.g., Small business owners"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand Voice
                          </label>
                          <input
                            type="text"
                            value={editFormData.brandVoice}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                brandVoice: e.target.value,
                              }))
                            }
                            placeholder="Brand voice description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* E-E-A-T Compliance */}
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editFormData.eatCompliance}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                eatCompliance: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            E-E-A-T Compliance (YMYL Content)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Edit className="w-4 h-4 mr-2" />
                    <span>
                      Choose: Save your edits OR regenerate completely with AI
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={closeEditDialog}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveContent}
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={regenerateContent}
                      disabled={isRegenerating}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegenerating ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-spin" />
                          Regenerating
                          {editFormData.regenerateImages ||
                          editFormData.includeImages
                            ? " + Images"
                            : ""}
                          ...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate with{" "}
                          {getProviderName(editFormData.aiProvider)}
                          {(editFormData.regenerateImages ||
                            editFormData.includeImages) && (
                            <span className="ml-1 text-xs bg-orange-500 px-1 rounded">
                              +${(editFormData.imageCount * 0.04).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Picker Modal */}
        {showImagePicker && (
          <ImagePickerModal
            uploadedImages={uploadedImages}
            onSelect={(img) => {
              insertImageAtCursor(img.url, img.altText);
              setShowImagePicker(false);
            }}
            onClose={() => setShowImagePicker(false)}
            onUpload={handleImageUpload}
            isUploadingImage={isUploadingImage}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && contentToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={closeDeleteConfirm}
              ></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Content
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "
                          {contentToDelete.title}"? This action cannot be
                          undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => deleteContent(contentToDelete.id)}
                    disabled={isDeleting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeDeleteConfirm}
                    disabled={isDeleting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Content
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {isLoadingContent ? "..." : filteredContent.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Published
                    </dt>
                    <dd className="text-2xl font-bold text-green-600">
                      {isLoadingContent ? "..." : publishedCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg SEO Score
                    </dt>
                    <dd
                      className={`text-2xl font-bold ${
                        avgSeoScore !== null
                          ? getScoreColor(avgSeoScore)
                          : "text-gray-400"
                      }`}
                    >
                      {isLoadingContent
                        ? "..."
                        : avgSeoScore !== null
                        ? `${avgSeoScore}%`
                        : "N/A"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      E-E-A-T Compliant
                    </dt>
                    <dd className="text-2xl font-bold text-purple-600">
                      {isLoadingContent
                        ? "..."
                        : filteredContent.filter((c) => c.eatCompliance)
                            .length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Cost
                    </dt>
                    <dd className="text-2xl font-bold text-yellow-600">
                      {isLoadingContent
                        ? "..."
                        : `$${(totalCost / 100).toFixed(3)}`}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Niche Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Niche
              </label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Niches</option>
                {NICHES.map((niche) => (
                  <option key={niche.value} value={niche.value}>
                    {niche.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Providers</option>
                <option value="openai">OpenAI GPT-4</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="title_asc">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
                <option value="seo_score_desc">SEO Score (High to Low)</option>
                <option value="seo_score_asc">SEO Score (Low to High)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedNiche("");
                  setSelectedProvider("");
                  setSortBy("created_desc");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Standalone Content
                </h3>
                <p className="text-sm text-gray-500">
                  Manage your niche-specific content pieces
                </p>
              </div>
              <button
                onClick={loadContent}
                disabled={isLoadingContent}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${
                    isLoadingContent ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`${
                    activeTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  All Content
                  <span
                    className={`ml-2 ${
                      activeTab === "all"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-900"
                    } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {filteredContent.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("drafts")}
                  className={`${
                    activeTab === "drafts"
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Drafts
                  <span
                    className={`ml-2 ${
                      activeTab === "drafts"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-900"
                    } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {draftCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("published")}
                  className={`${
                    activeTab === "published"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Published
                  <span
                    className={`ml-2 ${
                      activeTab === "published"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-900"
                    } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {publishedCount}
                  </span>
                </button>
              </nav>
            </div>

            {isLoadingContent ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="space-y-6">
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900 text-lg">
                            {item.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">
                              {item.status.replace("_", " ")}
                            </span>
                          </span>
                          {item.niche && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                              <Target className="w-3 h-3 mr-1" />
                              {getNicheLabel(item.niche)}
                            </span>
                          )}
                          {item.aiProvider && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {getProviderIcon(item.aiProvider)}
                              <span className="ml-1">
                                {getProviderName(item.aiProvider)}
                              </span>
                            </span>
                          )}
                          {item.hasImages && item.imageCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                              <Image className="w-3 h-3 mr-1" />
                              {item.imageCount} image
                              {item.imageCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {item.excerpt ||
                            (item.body &&
                              item.body.substring(0, 200) + "...")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => downloadContentAsDoc(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Download as Word document"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                        <button
                          onClick={() => openEditDialog(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item)}
                          disabled={
                            isDeleting && deletingContentId === item.id
                          }
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {isDeleting && deletingContentId === item.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            typeof item.seoScore === "number" &&
                            item.seoScore > 0
                              ? getScoreColor(item.seoScore)
                              : "text-red-500"
                          }`}
                        >
                          {typeof item.seoScore === "number" &&
                          item.seoScore > 0
                            ? `${item.seoScore}%`
                            : "Error"}
                        </div>
                        <div className="text-xs text-gray-500">SEO Score</div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            typeof item.readabilityScore === "number" &&
                            item.readabilityScore > 0
                              ? getScoreColor(item.readabilityScore)
                              : "text-red-500"
                          }`}
                        >
                          {typeof item.readabilityScore === "number" &&
                          item.readabilityScore > 0
                            ? `${item.readabilityScore}%`
                            : "Error"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Readability
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            typeof item.brandVoiceScore === "number" &&
                            item.brandVoiceScore > 0
                              ? getScoreColor(item.brandVoiceScore)
                              : "text-red-500"
                          }`}
                        >
                          {typeof item.brandVoiceScore === "number" &&
                          item.brandVoiceScore > 0
                            ? `${item.brandVoiceScore}%`
                            : "Error"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Brand Voice
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {item.wordCount || "-"}
                        </div>
                        <div className="text-xs text-gray-500">Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {item.hasImages && item.imageCostCents
                            ? `$${(item.imageCostCents / 100).toFixed(3)}`
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Image Cost
                        </div>
                      </div>
                    </div>

                    {/* Footer Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                      <div className="flex items-center space-x-4 flex-wrap">
                        <span>Tokens: {item.tokensUsed || "N/A"}</span>
                        <span>
                          Cost: $
                          {typeof item.costUsd === "number"
                            ? (item.costUsd / 100).toFixed(4)
                            : "N/A"}
                        </span>
                        {item.seoKeywords && item.seoKeywords.length > 0 && (
                          <span>Keywords: {item.seoKeywords.join(", ")}</span>
                        )}
                        {item.eatCompliance && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            E-E-A-T
                          </span>
                        )}
                      </div>
                      <div>
                        <span>
                          Created: {formatDistanceToNow(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No standalone content
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by generating your first niche-specific content piece.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsGenerateDialogOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}