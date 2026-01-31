
import { API_URL } from "@/config/api";
export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface LocationTarget {
  type: "country" | "state" | "province" | "city";
  code: string; // e.g., "us", "ca-on", "us-ca", "us-ca-sf"
  name: string;
  parentCode?: string; // For cities/states to reference their parent
}

export interface ResearchedQuestion {
  id: string;
  productId: string;
  productName: string;
  question: string;
  searchVolume: number;
  difficulty: number;
  popularity: "high" | "medium" | "low";
  region: string;
  locationData?: {
    country?: string;
    state?: string;
    province?: string;
    city?: string;
    localSearchVolume?: number;
  };
  relatedQuestions: string[];
  source: string;
  trend: "rising" | "stable" | "declining";
  intent: "informational" | "commercial" | "transactional" | "navigational";
  estimatedClicks: number;
  competition: "low" | "medium" | "high";
  lastUpdated: Date;
  selected?: boolean;
  blogGenerated?: boolean;
  blogId?: string;
}

export interface BlogGenerationRequest {
  questionId: string;
  question: string;
  productName: string;
  targetWordCount: number;
  includeFAQ: boolean;
  faqCount: number;
  aiProvider: "openai" | "anthropic" | "gemini";
  tone: string;
  includeProductSection: boolean;
  saveToDb?: boolean;
  saveQuestionFirst?: boolean;
  questionData?: ResearchedQuestion; // Full question data if saving question first
}

export interface GeneratedBlog {
  id: string;
  questionId: string;
  title: string;
  content: string;
  wordCount: number;
  readingTime?: number;
  faqs: Array<{ question: string; answer: string }>;
  metaDescription: string;
  seoScore: number;
  aiProvider?: string;
  status: "draft" | "reviewed" | "published" | "downloaded" | "archived";
  downloadCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ResearchResponse {
  success: boolean;
  questions: ResearchedQuestion[];
  count?: number;
  totalProducts?: number;
  totalQuestions?: number;
  locationBreakdown?: Record<string, number>;
}

export interface SavedResearchSession {
  id: string;
  name: string;
  niche: string;
  products: string[];
  questions?: ResearchedQuestion[]; // Optional - only populated when loading full session
  totalQuestions: number; // Count for display in list view
  locations: LocationTarget[];
  createdAt: Date;
}

// Location Data
export interface CountryData {
  code: string;
  name: string;
  states?: StateData[];
  provinces?: ProvinceData[];
}

export interface StateData {
  code: string;
  name: string;
  topCities: string[];
}

export interface ProvinceData {
  code: string;
  name: string;
  topCities: string[];
}

// Helper function for authenticated requests
const fetchWithCredentials = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

// High Intent Collection API
export const highIntentApi = {
  /**
   * Research questions for a single product with multi-location support
   * @param saveToDb - If true, saves questions to the database
   */
  async researchProduct(
    productName: string,
    niche: string,
    questionsCount: number = 10,
    locations?: LocationTarget[],
    saveToDb: boolean = false
  ): Promise<ResearchResponse> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/research-product`, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ productName, niche, questionsCount, locations, saveToDb }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to research product" }));
      throw new Error(error.message || "Failed to research product");
    }
`${API_URL}/api/user/high-intent/research-product`
    return response.json();
  },

  /**
   * Bulk research multiple products with multi-location support
   * @param saveToDb - If true, saves questions to the database
   */
  async bulkResearch(
    productNames: string[],
    niche: string,
    questionsPerProduct: number = 10,
    locations?: LocationTarget[],
    saveToDb: boolean = false
  ): Promise<ResearchResponse> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/bulk-research`, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ productNames, niche, questionsPerProduct, locations, saveToDb }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to bulk research products" }));
      throw new Error(error.message || "Failed to bulk research products");
    }

    return response.json();
  },

  /**
   * Get saved research sessions from database
   */
  async getSavedResearch(): Promise<SavedResearchSession[]> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/saved-research`,{
      credentials:"include"
    });
`${API_URL}/api/user/high-intent/saved-research`
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch saved research" }));
      throw new Error(error.message || "Failed to fetch saved research");
    }

    const data = await response.json();
    return data.sessions || [];
  },

  /**
   * Save a research session to database
   */
  async saveResearch(
    questions: ResearchedQuestion[],
    name: string,
    niche?: string,
    products?: string[],
    locations?: LocationTarget[]
  ): Promise<{ success: boolean; id: string; session: SavedResearchSession }> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/save-research`, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ questions, name, niche, products, locations }),
    });
`${API_URL}/api/user/high-intent/save-research`
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to save research" }));
      throw new Error(error.message || "Failed to save research");
    }

    return response.json();
  },

  /**
   * Delete a saved research session
   */
  async deleteResearch(researchId: string): Promise<{ success: boolean }> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/research/${researchId}`, {
      credentials:"include",
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete research" }));
      throw new Error(error.message || "Failed to delete research");
    }

    return response.json();
  },

  /**
   * Get questions by research session ID
   */
  async getQuestionsBySession(sessionId: string): Promise<ResearchedQuestion[]> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/research/${sessionId}/questions`,{
      credentials : "include"
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch questions" }));
      throw new Error(error.message || "Failed to fetch questions");
    }

    const data = await response.json();
    return data.questions || [];
  },

  /**
   * Export questions to Excel file
   */

  
  async exportToExcel(questions: ResearchedQuestion[]): Promise<Blob> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/export-excel`, {
      credentials : "include",
      method: "POST",
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to export to Excel" }));
      throw new Error(error.message || "Failed to export to Excel");
    }

    return response.blob();
  },

  /**
   * Generate a blog from a question
   * @param saveToDb - If true (default), saves blog to the database
   */


  async generateBlog(request: BlogGenerationRequest): Promise<GeneratedBlog> {
    const response = await fetchWithCredentials(  `${API_URL}/api/user/high-intent/generate-blog`, {
      credentials : "include",
      method: "POST",
      body: JSON.stringify({ ...request, saveToDb: request.saveToDb !== false }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate blog" }));
      throw new Error(error.message || "Failed to generate blog");
    }

    const data = await response.json();
    return data.blog;
  },

  /**
   * Generate blogs for multiple questions
   * @param saveToDb - If true (default), saves blogs to the database
   * @param saveQuestionsFirst - If true, saves questions to DB first so blogs can reference them
   */
  async bulkGenerateBlogs(
    questions: ResearchedQuestion[],
    settings: Omit<BlogGenerationRequest, "questionId" | "question" | "productName" | "questionData">,
    saveToDb: boolean = true,
    saveQuestionsFirst: boolean = true
  ): Promise<{ success: boolean; blogs: GeneratedBlog[]; failed: number; total: number; succeeded: number }> {
    const response = await fetchWithCredentials( `${API_URL}/api/user/high-intent/bulk-generate-blogs`, {
      credentials : "include",
      method: "POST",
      body: JSON.stringify({ questions, settings, saveToDb, saveQuestionsFirst }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate blogs" }));
      throw new Error(error.message || "Failed to generate blogs");
    }

    return response.json();
  },

  /**
   * Get all generated blogs for the user from database
   */
  async getGeneratedBlogs(): Promise<GeneratedBlog[]> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/blogs`,{
      credentials : "include"
    });
 
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch blogs" }));
      throw new Error(error.message || "Failed to fetch blogs");
    }

    const data = await response.json();
    return data.blogs || [];
  },

  /**
   * Get a specific blog by ID
   */

  
  async getBlogById(blogId: string): Promise<GeneratedBlog> {
    const response = await fetchWithCredentials(`${API_URL}/api/user/high-intent/blogs/${blogId}`,{
      credentials : "include"
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Blog not found" }));
      throw new Error(error.message || "Blog not found");
    }

    const data = await response.json();
    return data.blog;
  },

  /**
   * Download a blog in specified format
   */
  // async downloadBlog(blogId: string, format: "html" | "docx" | "md"): Promise<Blob> {
  //   const response = await fetchWithCredentials(
  //     `/api/user/high-intent/blogs/${blogId}/download?format=${format}`
  //   );

  //   if (!response.ok) {
  //     const error = await response.json().catch(() => ({ message: "Failed to download blog" }));
  //     throw new Error(error.message || "Failed to download blog");
  //   }

  //   return response.blob();
  // },


/**
 * Download a blog in specified format
 */
async downloadBlog(blogId: string, format: "html" | "docx" | "md"): Promise<Blob> {
  try {
    console.log(`📥 Downloading blog ${blogId} as ${format}...`);
    
    const response = await fetch(
      `${API_URL}/api/user/high-intent/blogs/${blogId}/download?format=${format}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    console.log(`📡 Download response:`, {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Download failed:', response.status, errorText);
      throw new Error(`Download failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    
    console.log('✅ Downloaded blob:', {
      size: blob.size,
      type: blob.type,
      format,
    });
    
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }
    
    return blob;
    
  } catch (error: any) {
    console.error('❌ Download error:', error);
    throw new Error(error.message || 'Failed to download blog');
  }
},



  /**
   * Delete a generated blog
   */


  async deleteBlog(blogId: string): Promise<{ success: boolean }> {
    const response = await fetchWithCredentials(  `${API_URL}/api/user/high-intent/blogs/${blogId}`, {
      credentials : "include",
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete blog" }));
      throw new Error(error.message || "Failed to delete blog");
    }

    return response.json();
  },

  /**
   * Update blog content
   */
  async updateBlog(
    blogId: string,
    updates: Partial<Pick<GeneratedBlog, "title" | "content" | "metaDescription" | "faqs" | "status">>
  ): Promise<GeneratedBlog> {

     
    const response = await fetchWithCredentials( `${API_URL}/api/user/high-intent/blogs/${blogId}`, {
      credentials : "include",
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update blog" }));
      throw new Error(error.message || "Failed to update blog");
    }

    const data = await response.json();
    return data.blog;
  },

  /**
   * Get available locations (countries, states, provinces, cities)
   */


  async getAvailableLocations(): Promise<CountryData[]> {
    const response = await fetchWithCredentials(   `${API_URL}/api/user/high-intent/locations`,{
      credentials : "include"
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch locations" }));
      throw new Error(error.message || "Failed to fetch locations");
    }

    const data = await response.json();
    return data.locations || [];
  },
};

// Utility functions for the High Intent Collection page
export const highIntentUtils = {
  /**
   * Download a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Format number with K/M suffix
   */
  formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },

  /**
   * Get color class for popularity
   */
  getPopularityColor(popularity: string): string {
    switch (popularity) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },

  /**
   * Get color class for competition
   */
  getCompetitionColor(competition: string): string {
    switch (competition) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  },

  /**
   * Get background color class for competition badges
   */
  getCompetitionBadgeColor(competition: string): string {
    switch (competition) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },

  /**
   * Get SEO score color
   */
  getSeoScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  },

  /**
   * Parse bulk product input
   */
  parseBulkProducts(input: string): string[] {
    return input
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  },

  /**
   * Generate safe filename from title
   */
  sanitizeFilename(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");
  },

  /**
   * Filter questions by competition level
   */
  filterByCompetition(
    questions: ResearchedQuestion[],
    competition: "low" | "medium" | "high" | "all"
  ): ResearchedQuestion[] {
    if (competition === "all") return questions;
    return questions.filter((q) => q.competition === competition);
  },

  /**
   * Get location display name
   */
  getLocationDisplayName(location: LocationTarget): string {
    if (location.type === "city" && location.parentCode) {
      const parentParts = location.parentCode.split("-");
      const stateCode = parentParts[parentParts.length - 1].toUpperCase();
      return `${location.name}, ${stateCode}`;
    }
    return location.name;
  },

  /**
   * Group questions by location
   */
  groupQuestionsByLocation(questions: ResearchedQuestion[]): Record<string, ResearchedQuestion[]> {
    const grouped: Record<string, ResearchedQuestion[]> = {};
    
    questions.forEach((q) => {
      const locationKey = q.locationData?.city || q.locationData?.state || q.locationData?.province || q.locationData?.country || "Global";
      if (!grouped[locationKey]) {
        grouped[locationKey] = [];
      }
      grouped[locationKey].push(q);
    });
    
    return grouped;
  },

  /**
   * Format date for display
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Format date with time
   */
  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Get status badge color
   */
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "downloaded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "archived":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },
};

export default highIntentApi;