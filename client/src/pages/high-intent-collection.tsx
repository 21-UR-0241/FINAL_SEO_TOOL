// client/src/pages/high-intent-collection.tsx
// High Intent Collection Page - Main Component

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  TrendingUp,
  HelpCircle,
  Globe,
  BarChart3,
  Target,
  X,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowUpDown,
  Copy,
  Zap,
  MapPin,
} from "lucide-react";

// Import API and utilities from separate file
import {
  highIntentApi,
  highIntentUtils,
  ResearchedQuestion,
  GeneratedBlog,
  Product,
} from "@/lib/high-intent-api";

// =============================================================================
// CONFIGURATION
// =============================================================================

const NICHES = [
  { value: "peptides", label: "Peptides & Performance Enhancement" },
  { value: "supplements", label: "Supplements & Nutrition" },
  { value: "skincare", label: "Skincare & Beauty" },
  { value: "fitness_equipment", label: "Fitness Equipment" },
  { value: "tech_gadgets", label: "Tech & Gadgets" },
  { value: "home_improvement", label: "Home Improvement" },
  { value: "pet_products", label: "Pet Products" },
  { value: "baby_products", label: "Baby & Child Products" },
  { value: "outdoor_gear", label: "Outdoor & Camping Gear" },
  { value: "kitchen_appliances", label: "Kitchen Appliances" },
  { value: "ecommerce", label: "E-commerce / Online Retail" },
  { value: "custom", label: "Custom Niche" },
];

const REGIONS = [
  { value: "global", label: "Global" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "eu", label: "European Union" },
];

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

const TrendIcon = ({ trend }: { trend: string }) => {
  switch (trend) {
    case "rising":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "stable":
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    case "declining":
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    default:
      return null;
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HighIntentCollection() {
  // Tab State
  const [activeTab, setActiveTab] = useState<"research" | "questions" | "blogs">("research");

  // Research State
  const [selectedNiche, setSelectedNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [bulkProductInput, setBulkProductInput] = useState("");
  const [questionsPerProduct, setQuestionsPerProduct] = useState(10);
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Research Progress
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [currentResearchProduct, setCurrentResearchProduct] = useState("");

  // Questions State
  const [researchedQuestions, setResearchedQuestions] = useState<ResearchedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [questionFilter, setQuestionFilter] = useState("");
  const [sortBy, setSortBy] = useState<"searchVolume" | "difficulty" | "popularity">("searchVolume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterByProduct, setFilterByProduct] = useState("");
  const [filterByPopularity, setFilterByPopularity] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Blog State
  const [generatedBlogs, setGeneratedBlogs] = useState<GeneratedBlog[]>([]);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [blogSettings, setBlogSettings] = useState({
    targetWordCount: 2000,
    includeFAQ: true,
    faqCount: 5,
    aiProvider: "anthropic" as "openai" | "anthropic" | "gemini",
    tone: "professional",
    includeProductSection: true,
  });
  const [previewBlog, setPreviewBlog] = useState<GeneratedBlog | null>(null);

  // UI State
  const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const showToast = (title: string, message: string, type: string = "default") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const addProduct = () => {
    if (!newProduct.trim()) return;
    const product: Product = {
      id: `product-${Date.now()}`,
      name: newProduct.trim(),
    };
    setProducts([...products, product]);
    setNewProduct("");
    showToast("Product Added", `"${product.name}" added to research list`);
  };

  const addBulkProducts = () => {
    if (!bulkProductInput.trim()) return;
    const newProducts = highIntentUtils
      .parseBulkProducts(bulkProductInput)
      .map((name, index) => ({
        id: `product-${Date.now()}-${index}`,
        name,
      }));
    setProducts([...products, ...newProducts]);
    setBulkProductInput("");
    setShowBulkInput(false);
    showToast("Products Added", `${newProducts.length} products added to research list`);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const startResearch = async () => {
    if (products.length === 0) {
      showToast("Error", "Please add at least one product to research", "destructive");
      return;
    }

    const niche = selectedNiche === "custom" ? customNiche : selectedNiche;
    if (!niche) {
      showToast("Error", "Please select or enter a niche", "destructive");
      return;
    }

    setIsResearching(true);
    setResearchProgress(0);
    setResearchedQuestions([]);

    try {
      const productNames = products.map((p) => p.name);

      // Show progress for each product
      for (let i = 0; i < products.length; i++) {
        setCurrentResearchProduct(products[i].name);
        setResearchProgress(Math.round(((i + 0.5) / products.length) * 100));
      }

      const result = await highIntentApi.bulkResearch(productNames, niche, questionsPerProduct);

      setResearchedQuestions(result.questions || []);
      setResearchProgress(100);

      showToast(
        "Research Complete",
        `Found ${result.questions?.length || 0} questions across ${products.length} products`
      );
      setActiveTab("questions");
    } catch (error: any) {
      showToast("Research Failed", error.message, "destructive");
    } finally {
      setIsResearching(false);
      setCurrentResearchProduct("");
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    const newSelected = new Set<string>();
    selectedQuestions.forEach((id) => newSelected.add(id));
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const selectAllQuestions = () => {
    const ids = filteredQuestions.map((q) => q.id);
    const newSet = new Set<string>();
    ids.forEach((id) => newSet.add(id));
    setSelectedQuestions(newSet);
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const exportToExcel = async () => {
    const questionsToExport =
      selectedQuestions.size > 0
        ? researchedQuestions.filter((q) => selectedQuestions.has(q.id))
        : researchedQuestions;

    if (questionsToExport.length === 0) {
      showToast("Error", "No questions to export", "destructive");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await highIntentApi.exportToExcel(questionsToExport);
      const filename = `high-intent-questions-${new Date().toISOString().split("T")[0]}.xlsx`;
      highIntentUtils.downloadBlob(blob, filename);
      showToast("Export Complete", `Exported ${questionsToExport.length} questions to Excel`);
    } catch (error: any) {
      showToast("Export Failed", error.message, "destructive");
    } finally {
      setIsExporting(false);
    }
  };

  const generateBlog = async (question: ResearchedQuestion) => {
    setIsGeneratingBlog(true);
    try {
      const result = await highIntentApi.generateBlog({
        questionId: question.id,
        question: question.question,
        productName: question.productName,
        ...blogSettings,
      });

      setGeneratedBlogs([result, ...generatedBlogs]);
      showToast("Blog Generated", `Created ${result.wordCount} word article`);
      setActiveTab("blogs");
    } catch (error: any) {
      showToast("Generation Failed", error.message, "destructive");
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const generateBulkBlogs = async () => {
    if (selectedQuestions.size === 0) {
      showToast("Error", "Please select questions to generate blogs for", "destructive");
      return;
    }

    const questionsToGenerate = researchedQuestions.filter((q) => selectedQuestions.has(q.id));

    setIsGeneratingBlog(true);
    let generated = 0;

    for (const question of questionsToGenerate) {
      try {
        const result = await highIntentApi.generateBlog({
          questionId: question.id,
          question: question.question,
          productName: question.productName,
          ...blogSettings,
        });
        setGeneratedBlogs((prev) => [result, ...prev]);
        generated++;
      } catch (error) {
        console.error(`Failed to generate blog for: ${question.question}`, error);
      }
    }

    setIsGeneratingBlog(false);
    showToast("Bulk Generation Complete", `Generated ${generated}/${questionsToGenerate.length} blogs`);
    setActiveTab("blogs");
  };

  const downloadBlog = async (blog: GeneratedBlog, format: "html" | "docx" | "md") => {
    try {
      const blob = await highIntentApi.downloadBlog(blog.id, format);
      const filename = `${highIntentUtils.sanitizeFilename(blog.title)}.${format}`;
      highIntentUtils.downloadBlob(blob, filename);
      showToast("Download Complete", `Downloaded "${blog.title}"`);
    } catch (error: any) {
      showToast("Download Failed", error.message, "destructive");
    }
  };

  // ===========================================================================
  // COMPUTED VALUES
  // ===========================================================================

  const filteredQuestions = researchedQuestions
    .filter((q) => {
      if (questionFilter && !q.question.toLowerCase().includes(questionFilter.toLowerCase())) {
        return false;
      }
      if (filterByProduct && q.productName !== filterByProduct) {
        return false;
      }
      if (filterByPopularity && q.popularity !== filterByPopularity) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const modifier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "searchVolume") return (a.searchVolume - b.searchVolume) * modifier;
      if (sortBy === "difficulty") return (a.difficulty - b.difficulty) * modifier;
      if (sortBy === "popularity") {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[a.popularity] - order[b.popularity]) * modifier;
      }
      return 0;
    });

  const uniqueProducts = Array.from(new Set(researchedQuestions.map((q) => q.productName)));

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            toast.type === "destructive"
              ? "bg-red-50 border-red-300 text-red-800"
              : "bg-green-50 border-green-300 text-green-800"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-8 h-8" />
              High Intent Collection Page
            </h1>
            <p className="mt-2 text-purple-100">
              Research high-intent questions, analyze SEO metrics, and generate optimized blog content
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold">{researchedQuestions.length}</div>
              <div className="text-purple-200 text-sm">Questions</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{generatedBlogs.length}</div>
              <div className="text-purple-200 text-sm">Blogs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: "research", label: "Research Products", icon: Search },
              { id: "questions", label: `Questions (${researchedQuestions.length})`, icon: HelpCircle },
              { id: "blogs", label: `Generated Blogs (${generatedBlogs.length})`, icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
                  activeTab === id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Research Tab Content */}
        {activeTab === "research" && (
          <div className="p-6 space-y-6">
            {/* Niche & Region Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Niche <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a niche...</option>
                  {NICHES.map((niche) => (
                    <option key={niche.value} value={niche.value}>
                      {niche.label}
                    </option>
                  ))}
                </select>
                {selectedNiche === "custom" && (
                  <input
                    type="text"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    placeholder="Enter your custom niche..."
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {REGIONS.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions per Product Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions per Product: <span className="font-bold text-purple-600">{questionsPerProduct}</span>
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={questionsPerProduct}
                onChange={(e) => setQuestionsPerProduct(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            {/* Product Input */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Products to Research</h3>
                <button
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showBulkInput ? "← Single Input" : "Bulk Input →"}
                </button>
              </div>

              {showBulkInput ? (
                <div className="space-y-3">
                  <textarea
                    value={bulkProductInput}
                    onChange={(e) => setBulkProductInput(e.target.value)}
                    placeholder={`Enter products, one per line or comma-separated...\n\nExample:\nBPC-157\nTB-500\nGHK-Cu\nPT-141`}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addBulkProducts}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add All Products
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addProduct()}
                    placeholder="Enter product name (e.g., BPC-157, GHK-Cu)..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addProduct}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Product List */}
              {products.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {products.length} product{products.length !== 1 ? "s" : ""} added
                    </span>
                    <button
                      onClick={() => setProducts([])}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {product.name}
                        <button onClick={() => removeProduct(product.id)} className="hover:text-purple-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Research Preview */}
            {products.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-3">Research Preview</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{products.length}</div>
                    <div className="text-sm text-purple-700">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{questionsPerProduct}</div>
                    <div className="text-sm text-purple-700">Questions/Product</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {products.length * questionsPerProduct}
                    </div>
                    <div className="text-sm text-purple-700">Total Questions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Research Button */}
            <div className="flex justify-center">
              <button
                onClick={startResearch}
                disabled={isResearching || products.length === 0 || (!selectedNiche && !customNiche)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-semibold shadow-lg"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Researching... {researchProgress}%
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Research
                  </>
                )}
              </button>
            </div>

            {/* Research Progress */}
            {isResearching && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    Researching: <span className="font-medium">{currentResearchProduct}</span>
                  </span>
                  <span className="text-purple-600 font-medium">{researchProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${researchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab Content */}
        {activeTab === "questions" && (
          <div className="p-6 space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    placeholder="Search questions..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-64"
                  />
                </div>
                <select
                  value={filterByProduct}
                  onChange={(e) => setFilterByProduct(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Products</option>
                  {uniqueProducts.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
                <select
                  value={filterByPopularity}
                  onChange={(e) => setFilterByPopularity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Popularity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="searchVolume-desc">Volume ↓</option>
                  <option value="searchVolume-asc">Volume ↑</option>
                  <option value="difficulty-asc">Difficulty ↑</option>
                  <option value="difficulty-desc">Difficulty ↓</option>
                  <option value="popularity-desc">Popularity ↓</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{selectedQuestions.size} selected</span>
                <button onClick={selectAllQuestions} className="px-3 py-1 text-sm text-purple-600 hover:underline">
                  Select All
                </button>
                <button onClick={deselectAllQuestions} className="px-3 py-1 text-sm text-gray-500 hover:underline">
                  Clear
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={isExporting || researchedQuestions.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Export Excel
                </button>
                <button
                  onClick={generateBulkBlogs}
                  disabled={isGeneratingBlog || selectedQuestions.size === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate ({selectedQuestions.size})
                </button>
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedQuestions.has(question.id)
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{question.question}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Product: <span className="font-medium text-purple-600">{question.productName}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${highIntentUtils.getPopularityColor(
                                question.popularity
                              )}`}
                            >
                              {question.popularity}
                            </span>
                            <TrendIcon trend={question.trend} />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{highIntentUtils.formatNumber(question.searchVolume)}</span>
                            <span className="text-gray-500">searches/mo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{question.difficulty}%</span>
                            <span className="text-gray-500">difficulty</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{question.region}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${highIntentUtils.getCompetitionColor(question.competition)}`}>
                            <Zap className="w-4 h-4" />
                            <span className="capitalize">{question.competition} competition</span>
                          </div>
                        </div>
                        {question.relatedQuestions && question.relatedQuestions.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              {expandedQuestion === question.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              {question.relatedQuestions.length} related questions
                            </button>
                            {expandedQuestion === question.id && (
                              <div className="mt-2 pl-4 border-l-2 border-purple-200 space-y-1">
                                {question.relatedQuestions.map((related, idx) => (
                                  <p key={idx} className="text-sm text-gray-600">
                                    • {related}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => generateBlog(question)}
                          disabled={isGeneratingBlog}
                          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Generate
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(question.question);
                            showToast("Copied", "Question copied to clipboard");
                          }}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {researchedQuestions.length === 0
                    ? "Start by researching products in the Research tab"
                    : "Try adjusting your filters"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blogs Tab Content */}
        {activeTab === "blogs" && (
          <div className="p-6 space-y-6">
            {/* Blog Generation Settings */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium mb-4">Blog Generation Settings</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Word Count</label>
                  <select
                    value={blogSettings.targetWordCount}
                    onChange={(e) => setBlogSettings({ ...blogSettings, targetWordCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value={1500}>1,500 words</option>
                    <option value={2000}>2,000 words</option>
                    <option value={2500}>2,500 words</option>
                    <option value={3000}>3,000 words</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">AI Provider</label>
                  <select
                    value={blogSettings.aiProvider}
                    onChange={(e) => setBlogSettings({ ...blogSettings, aiProvider: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="anthropic">Claude (Anthropic)</option>
                    <option value="openai">GPT-4 (OpenAI)</option>
                    <option value="gemini">Gemini (Google)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">FAQ Count</label>
                  <select
                    value={blogSettings.faqCount}
                    onChange={(e) => setBlogSettings({ ...blogSettings, faqCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value={3}>3 FAQs</option>
                    <option value={5}>5 FAQs</option>
                    <option value={7}>7 FAQs</option>
                    <option value={10}>10 FAQs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tone</label>
                  <select
                    value={blogSettings.tone}
                    onChange={(e) => setBlogSettings({ ...blogSettings, tone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogSettings.includeFAQ}
                    onChange={(e) => setBlogSettings({ ...blogSettings, includeFAQ: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm">Include FAQ Section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogSettings.includeProductSection}
                    onChange={(e) => setBlogSettings({ ...blogSettings, includeProductSection: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm">Include Product Section Placeholder</span>
                </label>
              </div>
            </div>

            {/* Generated Blogs List */}
            {generatedBlogs.length > 0 ? (
              <div className="space-y-4">
                {generatedBlogs.map((blog) => (
                  <div key={blog.id} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{blog.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.metaDescription}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <FileText className="w-4 h-4" />
                            {blog.wordCount.toLocaleString()} words
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <HelpCircle className="w-4 h-4" />
                            {blog.faqs.length} FAQs
                          </span>
                          <span className={`flex items-center gap-1 ${highIntentUtils.getSeoScoreColor(blog.seoScore)}`}>
                            <Target className="w-4 h-4" />
                            SEO: {blog.seoScore}%
                          </span>
                          <span className="text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewBlog(blog)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <div className="relative group">
                          <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                          <div className="absolute right-0 mt-1 py-1 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block z-10">
                            <button
                              onClick={() => downloadBlog(blog, "html")}
                              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              HTML
                            </button>
                            <button
                              onClick={() => downloadBlog(blog, "docx")}
                              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              DOCX
                            </button>
                            <button
                              onClick={() => downloadBlog(blog, "md")}
                              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                              Markdown
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs generated yet</h3>
                <p className="mt-1 text-sm text-gray-500">Select questions and generate blogs from the Questions tab</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Blog Preview Modal */}
      {previewBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setPreviewBlog(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold truncate pr-4">{previewBlog.title}</h2>
                <button onClick={() => setPreviewBlog(null)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewBlog.content }} />
                {previewBlog.faqs.length > 0 && (
                  <div className="mt-8 border-t pt-8">
                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {previewBlog.faqs.map((faq, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg text-purple-700">{faq.question}</h3>
                          <p className="mt-2 text-gray-700">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  onClick={() => setPreviewBlog(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadBlog(previewBlog, "html");
                    setPreviewBlog(null);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Download HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}