// client/src/lib/high-intent-api.ts
// Frontend API client for High Intent Collection Page

// Types
export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
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
  relatedQuestions: string[];
  source: string;
  trend: "rising" | "stable" | "declining";
  intent: "informational" | "commercial" | "transactional" | "navigational";
  estimatedClicks: number;
  competition: "low" | "medium" | "high";
  lastUpdated: Date;
  selected?: boolean;
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
}

export interface GeneratedBlog {
  id: string;
  questionId: string;
  title: string;
  content: string;
  wordCount: number;
  faqs: Array<{ question: string; answer: string }>;
  metaDescription: string;
  seoScore: number;
  status: "draft" | "downloaded";
  createdAt: Date;
}

export interface ResearchResponse {
  success: boolean;
  questions: ResearchedQuestion[];
  count?: number;
  totalProducts?: number;
  totalQuestions?: number;
}

export interface SavedResearchSession {
  id: string;
  name: string;
  niche: string;
  products: string[];
  questions: ResearchedQuestion[];
  createdAt: Date;
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
   * Research questions for a single product
   */
  async researchProduct(
    productName: string,
    niche: string,
    questionsCount: number = 10
  ): Promise<ResearchResponse> {
    const response = await fetchWithCredentials("/api/user/high-intent/research-product", {
      method: "POST",
      body: JSON.stringify({ productName, niche, questionsCount }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to research product" }));
      throw new Error(error.message || "Failed to research product");
    }

    return response.json();
  },

  /**
   * Bulk research multiple products at once
   */
  async bulkResearch(
    products: string[],
    niche: string,
    questionsPerProduct: number = 10
  ): Promise<ResearchResponse> {
    const response = await fetchWithCredentials("/api/user/high-intent/bulk-research", {
      method: "POST",
      body: JSON.stringify({ products, niche, questionsPerProduct }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to bulk research products" }));
      throw new Error(error.message || "Failed to bulk research products");
    }

    return response.json();
  },

  /**
   * Get saved research sessions
   */
  async getSavedResearch(): Promise<SavedResearchSession[]> {
    const response = await fetchWithCredentials("/api/user/high-intent/saved-research");

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch saved research" }));
      throw new Error(error.message || "Failed to fetch saved research");
    }

    return response.json();
  },

  /**
   * Save a research session for later
   */
  async saveResearch(
    questions: ResearchedQuestion[],
    name: string
  ): Promise<{ success: boolean; id: string }> {
    const response = await fetchWithCredentials("/api/user/high-intent/save-research", {
      method: "POST",
      body: JSON.stringify({ questions, name }),
    });

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
    const response = await fetchWithCredentials(`/api/user/high-intent/research/${researchId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete research" }));
      throw new Error(error.message || "Failed to delete research");
    }

    return response.json();
  },

  /**
   * Export questions to Excel file
   */
  async exportToExcel(questions: ResearchedQuestion[]): Promise<Blob> {
    const response = await fetchWithCredentials("/api/user/high-intent/export-excel", {
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
   */
  async generateBlog(request: BlogGenerationRequest): Promise<GeneratedBlog> {
    const response = await fetchWithCredentials("/api/user/high-intent/generate-blog", {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate blog" }));
      throw new Error(error.message || "Failed to generate blog");
    }

    return response.json();
  },

  /**
   * Generate blogs for multiple questions
   */
  async bulkGenerateBlogs(
    questions: ResearchedQuestion[],
    settings: Omit<BlogGenerationRequest, "questionId" | "question" | "productName">
  ): Promise<{ success: boolean; blogs: GeneratedBlog[]; failed: number }> {
    const response = await fetchWithCredentials("/api/user/high-intent/bulk-generate-blogs", {
      method: "POST",
      body: JSON.stringify({ questions, settings }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to generate blogs" }));
      throw new Error(error.message || "Failed to generate blogs");
    }

    return response.json();
  },

  /**
   * Get all generated blogs for the user
   */
  async getGeneratedBlogs(): Promise<GeneratedBlog[]> {
    const response = await fetchWithCredentials("/api/user/high-intent/blogs");

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch blogs" }));
      throw new Error(error.message || "Failed to fetch blogs");
    }

    return response.json();
  },

  /**
   * Get a specific blog by ID
   */
  async getBlogById(blogId: string): Promise<GeneratedBlog> {
    const response = await fetchWithCredentials(`/api/user/high-intent/blogs/${blogId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Blog not found" }));
      throw new Error(error.message || "Blog not found");
    }

    return response.json();
  },

  /**
   * Download a blog in specified format
   */
  async downloadBlog(blogId: string, format: "html" | "docx" | "md"): Promise<Blob> {
    const response = await fetchWithCredentials(
      `/api/user/high-intent/blogs/${blogId}/download?format=${format}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to download blog" }));
      throw new Error(error.message || "Failed to download blog");
    }

    return response.blob();
  },

  /**
   * Delete a generated blog
   */
  async deleteBlog(blogId: string): Promise<{ success: boolean }> {
    const response = await fetchWithCredentials(`/api/user/high-intent/blogs/${blogId}`, {
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
    updates: Partial<Pick<GeneratedBlog, "title" | "content" | "metaDescription" | "faqs">>
  ): Promise<GeneratedBlog> {
    const response = await fetchWithCredentials(`/api/user/high-intent/blogs/${blogId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update blog" }));
      throw new Error(error.message || "Failed to update blog");
    }

    return response.json();
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
};

export default highIntentApi;