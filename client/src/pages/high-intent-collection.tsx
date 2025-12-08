// // client/src/pages/high-intent-collection.tsx
// // High Intent Collection Page - Main Component

// import { useState, useEffect } from "react";
// import {
//   Search,
//   Download,
//   Sparkles,
//   Loader2,
//   FileSpreadsheet,
//   TrendingUp,
//   HelpCircle,
//   Globe,
//   BarChart3,
//   Target,
//   X,
//   Plus,
//   Trash2,
//   Eye,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   ArrowUpDown,
//   Copy,
//   Zap,
//   MapPin,
// } from "lucide-react";

// // Import API and utilities from separate file
// import {
//   highIntentApi,
//   highIntentUtils,
//   ResearchedQuestion,
//   GeneratedBlog,
//   Product,
// } from "@/lib/high-intent-api";

// // =============================================================================
// // CONFIGURATION
// // =============================================================================

// const NICHES = [
//   { value: "peptides", label: "Peptides & Performance Enhancement" },
//   { value: "supplements", label: "Supplements & Nutrition" },
//   { value: "skincare", label: "Skincare & Beauty" },
//   { value: "fitness_equipment", label: "Fitness Equipment" },
//   { value: "tech_gadgets", label: "Tech & Gadgets" },
//   { value: "home_improvement", label: "Home Improvement" },
//   { value: "pet_products", label: "Pet Products" },
//   { value: "baby_products", label: "Baby & Child Products" },
//   { value: "outdoor_gear", label: "Outdoor & Camping Gear" },
//   { value: "kitchen_appliances", label: "Kitchen Appliances" },
//   { value: "ecommerce", label: "E-commerce / Online Retail" },
//   { value: "custom", label: "Custom Niche" },
// ];

// const REGIONS = [
//   { value: "global", label: "Global" },
//   { value: "us", label: "United States" },
//   { value: "uk", label: "United Kingdom" },
//   { value: "ca", label: "Canada" },
//   { value: "au", label: "Australia" },
//   { value: "eu", label: "European Union" },
// ];

// // =============================================================================
// // UTILITY COMPONENTS
// // =============================================================================

// const TrendIcon = ({ trend }: { trend: string }) => {
//   switch (trend) {
//     case "rising":
//       return <TrendingUp className="w-4 h-4 text-green-500" />;
//     case "stable":
//       return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
//     case "declining":
//       return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
//     default:
//       return null;
//   }
// };

// // =============================================================================
// // MAIN COMPONENT
// // =============================================================================

// export default function HighIntentCollection() {
//   // Tab State
//   const [activeTab, setActiveTab] = useState<"research" | "questions" | "blogs">("research");

//   // Research State
//   const [selectedNiche, setSelectedNiche] = useState("");
//   const [customNiche, setCustomNiche] = useState("");
//   const [products, setProducts] = useState<Product[]>([]);
//   const [newProduct, setNewProduct] = useState("");
//   const [bulkProductInput, setBulkProductInput] = useState("");
//   const [questionsPerProduct, setQuestionsPerProduct] = useState(10);
//   const [selectedRegion, setSelectedRegion] = useState("global");
//   const [showBulkInput, setShowBulkInput] = useState(false);

//   // Research Progress
//   const [isResearching, setIsResearching] = useState(false);
//   const [researchProgress, setResearchProgress] = useState(0);
//   const [currentResearchProduct, setCurrentResearchProduct] = useState("");

//   // Questions State
//   const [researchedQuestions, setResearchedQuestions] = useState<ResearchedQuestion[]>([]);
//   const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
//   const [questionFilter, setQuestionFilter] = useState("");
//   const [sortBy, setSortBy] = useState<"searchVolume" | "difficulty" | "popularity">("searchVolume");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
//   const [filterByProduct, setFilterByProduct] = useState("");
//   const [filterByPopularity, setFilterByPopularity] = useState("");
//   const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

//   // Blog State
//   const [generatedBlogs, setGeneratedBlogs] = useState<GeneratedBlog[]>([]);
//   const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
//   const [blogSettings, setBlogSettings] = useState({
//     targetWordCount: 2000,
//     includeFAQ: true,
//     faqCount: 5,
//     aiProvider: "anthropic" as "openai" | "anthropic" | "gemini",
//     tone: "professional",
//     includeProductSection: true,
//   });
//   const [previewBlog, setPreviewBlog] = useState<GeneratedBlog | null>(null);

//   // UI State
//   const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);
//   const [isExporting, setIsExporting] = useState(false);

//   // ===========================================================================
//   // HANDLERS
//   // ===========================================================================

//   const showToast = (title: string, message: string, type: string = "default") => {
//     setToast({ title, message, type });
//     setTimeout(() => setToast(null), 5000);
//   };

//   const addProduct = () => {
//     if (!newProduct.trim()) return;
//     const product: Product = {
//       id: `product-${Date.now()}`,
//       name: newProduct.trim(),
//     };
//     setProducts([...products, product]);
//     setNewProduct("");
//     showToast("Product Added", `"${product.name}" added to research list`);
//   };

//   const addBulkProducts = () => {
//     if (!bulkProductInput.trim()) return;
//     const newProducts = highIntentUtils
//       .parseBulkProducts(bulkProductInput)
//       .map((name, index) => ({
//         id: `product-${Date.now()}-${index}`,
//         name,
//       }));
//     setProducts([...products, ...newProducts]);
//     setBulkProductInput("");
//     setShowBulkInput(false);
//     showToast("Products Added", `${newProducts.length} products added to research list`);
//   };

//   const removeProduct = (id: string) => {
//     setProducts(products.filter((p) => p.id !== id));
//   };

//   const startResearch = async () => {
//     if (products.length === 0) {
//       showToast("Error", "Please add at least one product to research", "destructive");
//       return;
//     }

//     const niche = selectedNiche === "custom" ? customNiche : selectedNiche;
//     if (!niche) {
//       showToast("Error", "Please select or enter a niche", "destructive");
//       return;
//     }

//     setIsResearching(true);
//     setResearchProgress(0);
//     setResearchedQuestions([]);

//     try {
//       const productNames = products.map((p) => p.name);

//       // Show progress for each product
//       for (let i = 0; i < products.length; i++) {
//         setCurrentResearchProduct(products[i].name);
//         setResearchProgress(Math.round(((i + 0.5) / products.length) * 100));
//       }

//       const result = await highIntentApi.bulkResearch(productNames, niche, questionsPerProduct);

//       setResearchedQuestions(result.questions || []);
//       setResearchProgress(100);

//       showToast(
//         "Research Complete",
//         `Found ${result.questions?.length || 0} questions across ${products.length} products`
//       );
//       setActiveTab("questions");
//     } catch (error: any) {
//       showToast("Research Failed", error.message, "destructive");
//     } finally {
//       setIsResearching(false);
//       setCurrentResearchProduct("");
//     }
//   };

//   const toggleQuestionSelection = (questionId: string) => {
//     const newSelected = new Set<string>();
//     selectedQuestions.forEach((id) => newSelected.add(id));
//     if (newSelected.has(questionId)) {
//       newSelected.delete(questionId);
//     } else {
//       newSelected.add(questionId);
//     }
//     setSelectedQuestions(newSelected);
//   };

//   const selectAllQuestions = () => {
//     const ids = filteredQuestions.map((q) => q.id);
//     const newSet = new Set<string>();
//     ids.forEach((id) => newSet.add(id));
//     setSelectedQuestions(newSet);
//   };

//   const deselectAllQuestions = () => {
//     setSelectedQuestions(new Set());
//   };

//   const exportToExcel = async () => {
//     const questionsToExport =
//       selectedQuestions.size > 0
//         ? researchedQuestions.filter((q) => selectedQuestions.has(q.id))
//         : researchedQuestions;

//     if (questionsToExport.length === 0) {
//       showToast("Error", "No questions to export", "destructive");
//       return;
//     }

//     setIsExporting(true);
//     try {
//       const blob = await highIntentApi.exportToExcel(questionsToExport);
//       const filename = `high-intent-questions-${new Date().toISOString().split("T")[0]}.xlsx`;
//       highIntentUtils.downloadBlob(blob, filename);
//       showToast("Export Complete", `Exported ${questionsToExport.length} questions to Excel`);
//     } catch (error: any) {
//       showToast("Export Failed", error.message, "destructive");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const generateBlog = async (question: ResearchedQuestion) => {
//     setIsGeneratingBlog(true);
//     try {
//       const result = await highIntentApi.generateBlog({
//         questionId: question.id,
//         question: question.question,
//         productName: question.productName,
//         ...blogSettings,
//       });

//       setGeneratedBlogs([result, ...generatedBlogs]);
//       showToast("Blog Generated", `Created ${result.wordCount} word article`);
//       setActiveTab("blogs");
//     } catch (error: any) {
//       showToast("Generation Failed", error.message, "destructive");
//     } finally {
//       setIsGeneratingBlog(false);
//     }
//   };

//   const generateBulkBlogs = async () => {
//     if (selectedQuestions.size === 0) {
//       showToast("Error", "Please select questions to generate blogs for", "destructive");
//       return;
//     }

//     const questionsToGenerate = researchedQuestions.filter((q) => selectedQuestions.has(q.id));

//     setIsGeneratingBlog(true);
//     let generated = 0;

//     for (const question of questionsToGenerate) {
//       try {
//         const result = await highIntentApi.generateBlog({
//           questionId: question.id,
//           question: question.question,
//           productName: question.productName,
//           ...blogSettings,
//         });
//         setGeneratedBlogs((prev) => [result, ...prev]);
//         generated++;
//       } catch (error) {
//         console.error(`Failed to generate blog for: ${question.question}`, error);
//       }
//     }

//     setIsGeneratingBlog(false);
//     showToast("Bulk Generation Complete", `Generated ${generated}/${questionsToGenerate.length} blogs`);
//     setActiveTab("blogs");
//   };

//   const downloadBlog = async (blog: GeneratedBlog, format: "html" | "docx" | "md") => {
//     try {
//       const blob = await highIntentApi.downloadBlog(blog.id, format);
//       const filename = `${highIntentUtils.sanitizeFilename(blog.title)}.${format}`;
//       highIntentUtils.downloadBlob(blob, filename);
//       showToast("Download Complete", `Downloaded "${blog.title}"`);
//     } catch (error: any) {
//       showToast("Download Failed", error.message, "destructive");
//     }
//   };

//   // ===========================================================================
//   // COMPUTED VALUES
//   // ===========================================================================

//   const filteredQuestions = researchedQuestions
//     .filter((q) => {
//       if (questionFilter && !q.question.toLowerCase().includes(questionFilter.toLowerCase())) {
//         return false;
//       }
//       if (filterByProduct && q.productName !== filterByProduct) {
//         return false;
//       }
//       if (filterByPopularity && q.popularity !== filterByPopularity) {
//         return false;
//       }
//       return true;
//     })
//     .sort((a, b) => {
//       const modifier = sortOrder === "asc" ? 1 : -1;
//       if (sortBy === "searchVolume") return (a.searchVolume - b.searchVolume) * modifier;
//       if (sortBy === "difficulty") return (a.difficulty - b.difficulty) * modifier;
//       if (sortBy === "popularity") {
//         const order = { high: 3, medium: 2, low: 1 };
//         return (order[a.popularity] - order[b.popularity]) * modifier;
//       }
//       return 0;
//     });

//   const uniqueProducts = Array.from(new Set(researchedQuestions.map((q) => q.productName)));

//   // ===========================================================================
//   // RENDER
//   // ===========================================================================

//   return (
//     <div className="space-y-6">
//       {/* Toast Notification */}
//       {toast && (
//         <div
//           className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
//             toast.type === "destructive"
//               ? "bg-red-50 border-red-300 text-red-800"
//               : "bg-green-50 border-green-300 text-green-800"
//           }`}
//         >
//           <div className="flex items-center justify-between gap-4">
//             <div>
//               <h4 className="font-semibold">{toast.title}</h4>
//               <p className="text-sm">{toast.message}</p>
//             </div>
//             <button onClick={() => setToast(null)}>
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold flex items-center gap-2">
//               <Target className="w-8 h-8" />
//               High Intent Collection Page
//             </h1>
//             <p className="mt-2 text-purple-100">
//               Research high-intent questions, analyze SEO metrics, and generate optimized blog content
//             </p>
//           </div>
//           <div className="flex items-center gap-6">
//             <div className="text-right">
//               <div className="text-3xl font-bold">{researchedQuestions.length}</div>
//               <div className="text-purple-200 text-sm">Questions</div>
//             </div>
//             <div className="text-right">
//               <div className="text-3xl font-bold">{generatedBlogs.length}</div>
//               <div className="text-purple-200 text-sm">Blogs</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="border-b">
//           <nav className="flex -mb-px">
//             {[
//               { id: "research", label: "Research Products", icon: Search },
//               { id: "questions", label: `Questions (${researchedQuestions.length})`, icon: HelpCircle },
//               { id: "blogs", label: `Generated Blogs (${generatedBlogs.length})`, icon: FileText },
//             ].map(({ id, label, icon: Icon }) => (
//               <button
//                 key={id}
//                 onClick={() => setActiveTab(id as any)}
//                 className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
//                   activeTab === id
//                     ? "border-purple-500 text-purple-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {label}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Research Tab Content */}
//         {activeTab === "research" && (
//           <div className="p-6 space-y-6">
//             {/* Niche & Region Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Niche <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={selectedNiche}
//                   onChange={(e) => setSelectedNiche(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 >
//                   <option value="">Choose a niche...</option>
//                   {NICHES.map((niche) => (
//                     <option key={niche.value} value={niche.value}>
//                       {niche.label}
//                     </option>
//                   ))}
//                 </select>
//                 {selectedNiche === "custom" && (
//                   <input
//                     type="text"
//                     value={customNiche}
//                     onChange={(e) => setCustomNiche(e.target.value)}
//                     placeholder="Enter your custom niche..."
//                     className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                   />
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Target Region</label>
//                 <select
//                   value={selectedRegion}
//                   onChange={(e) => setSelectedRegion(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                 >
//                   {REGIONS.map((region) => (
//                     <option key={region.value} value={region.value}>
//                       {region.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Questions per Product Slider */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Questions per Product: <span className="font-bold text-purple-600">{questionsPerProduct}</span>
//               </label>
//               <input
//                 type="range"
//                 min="5"
//                 max="20"
//                 value={questionsPerProduct}
//                 onChange={(e) => setQuestionsPerProduct(parseInt(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
//               />
//               <div className="flex justify-between text-xs text-gray-500 mt-1">
//                 <span>5</span>
//                 <span>10</span>
//                 <span>15</span>
//                 <span>20</span>
//               </div>
//             </div>

//             {/* Product Input */}
//             <div className="border rounded-lg p-4">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Products to Research</h3>
//                 <button
//                   onClick={() => setShowBulkInput(!showBulkInput)}
//                   className="text-sm text-purple-600 hover:text-purple-700 font-medium"
//                 >
//                   {showBulkInput ? "← Single Input" : "Bulk Input →"}
//                 </button>
//               </div>

//               {showBulkInput ? (
//                 <div className="space-y-3">
//                   <textarea
//                     value={bulkProductInput}
//                     onChange={(e) => setBulkProductInput(e.target.value)}
//                     placeholder={`Enter products, one per line or comma-separated...\n\nExample:\nBPC-157\nTB-500\nGHK-Cu\nPT-141`}
//                     rows={6}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                   />
//                   <button
//                     onClick={addBulkProducts}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Add All Products
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={newProduct}
//                     onChange={(e) => setNewProduct(e.target.value)}
//                     onKeyPress={(e) => e.key === "Enter" && addProduct()}
//                     placeholder="Enter product name (e.g., BPC-157, GHK-Cu)..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                   />
//                   <button
//                     onClick={addProduct}
//                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                   >
//                     <Plus className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}

//               {/* Product List */}
//               {products.length > 0 && (
//                 <div className="mt-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm text-gray-600">
//                       {products.length} product{products.length !== 1 ? "s" : ""} added
//                     </span>
//                     <button
//                       onClick={() => setProducts([])}
//                       className="text-sm text-red-600 hover:text-red-700"
//                     >
//                       Clear All
//                     </button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {products.map((product) => (
//                       <span
//                         key={product.id}
//                         className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
//                       >
//                         {product.name}
//                         <button onClick={() => removeProduct(product.id)} className="hover:text-purple-900">
//                           <X className="w-3 h-3" />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Research Preview */}
//             {products.length > 0 && (
//               <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//                 <h4 className="font-medium text-purple-900 mb-3">Research Preview</h4>
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div>
//                     <div className="text-2xl font-bold text-purple-600">{products.length}</div>
//                     <div className="text-sm text-purple-700">Products</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-purple-600">{questionsPerProduct}</div>
//                     <div className="text-sm text-purple-700">Questions/Product</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-purple-600">
//                       {products.length * questionsPerProduct}
//                     </div>
//                     <div className="text-sm text-purple-700">Total Questions</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Start Research Button */}
//             <div className="flex justify-center">
//               <button
//                 onClick={startResearch}
//                 disabled={isResearching || products.length === 0 || (!selectedNiche && !customNiche)}
//                 className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-semibold shadow-lg"
//               >
//                 {isResearching ? (
//                   <>
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                     Researching... {researchProgress}%
//                   </>
//                 ) : (
//                   <>
//                     <Search className="w-5 h-5" />
//                     Start Research
//                   </>
//                 )}
//               </button>
//             </div>

//             {/* Research Progress */}
//             {isResearching && (
//               <div className="mt-4">
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-gray-600">
//                     Researching: <span className="font-medium">{currentResearchProduct}</span>
//                   </span>
//                   <span className="text-purple-600 font-medium">{researchProgress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
//                     style={{ width: `${researchProgress}%` }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Questions Tab Content */}
//         {activeTab === "questions" && (
//           <div className="p-6 space-y-6">
//             {/* Filters and Actions */}
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div className="flex flex-wrap items-center gap-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     value={questionFilter}
//                     onChange={(e) => setQuestionFilter(e.target.value)}
//                     placeholder="Search questions..."
//                     className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-64"
//                   />
//                 </div>
//                 <select
//                   value={filterByProduct}
//                   onChange={(e) => setFilterByProduct(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">All Products</option>
//                   {uniqueProducts.map((product) => (
//                     <option key={product} value={product}>
//                       {product}
//                     </option>
//                   ))}
//                 </select>
//                 <select
//                   value={filterByPopularity}
//                   onChange={(e) => setFilterByPopularity(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">All Popularity</option>
//                   <option value="high">High</option>
//                   <option value="medium">Medium</option>
//                   <option value="low">Low</option>
//                 </select>
//                 <select
//                   value={`${sortBy}-${sortOrder}`}
//                   onChange={(e) => {
//                     const [field, order] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
//                     setSortBy(field);
//                     setSortOrder(order);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="searchVolume-desc">Volume ↓</option>
//                   <option value="searchVolume-asc">Volume ↑</option>
//                   <option value="difficulty-asc">Difficulty ↑</option>
//                   <option value="difficulty-desc">Difficulty ↓</option>
//                   <option value="popularity-desc">Popularity ↓</option>
//                 </select>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm text-gray-600">{selectedQuestions.size} selected</span>
//                 <button onClick={selectAllQuestions} className="px-3 py-1 text-sm text-purple-600 hover:underline">
//                   Select All
//                 </button>
//                 <button onClick={deselectAllQuestions} className="px-3 py-1 text-sm text-gray-500 hover:underline">
//                   Clear
//                 </button>
//                 <button
//                   onClick={exportToExcel}
//                   disabled={isExporting || researchedQuestions.length === 0}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
//                   Export Excel
//                 </button>
//                 <button
//                   onClick={generateBulkBlogs}
//                   disabled={isGeneratingBlog || selectedQuestions.size === 0}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {isGeneratingBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
//                   Generate ({selectedQuestions.size})
//                 </button>
//               </div>
//             </div>

//             {/* Questions List */}
//             {filteredQuestions.length > 0 ? (
//               <div className="space-y-3">
//                 {filteredQuestions.map((question) => (
//                   <div
//                     key={question.id}
//                     className={`border rounded-lg p-4 transition-all ${
//                       selectedQuestions.has(question.id)
//                         ? "border-purple-500 bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                   >
//                     <div className="flex items-start gap-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedQuestions.has(question.id)}
//                         onChange={() => toggleQuestionSelection(question.id)}
//                         className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h3 className="font-medium text-gray-900">{question.question}</h3>
//                             <p className="text-sm text-gray-500 mt-1">
//                               Product: <span className="font-medium text-purple-600">{question.productName}</span>
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs font-medium ${highIntentUtils.getPopularityColor(
//                                 question.popularity
//                               )}`}
//                             >
//                               {question.popularity}
//                             </span>
//                             <TrendIcon trend={question.trend} />
//                           </div>
//                         </div>
//                         <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
//                           <div className="flex items-center gap-1">
//                             <BarChart3 className="w-4 h-4 text-gray-400" />
//                             <span className="font-medium">{highIntentUtils.formatNumber(question.searchVolume)}</span>
//                             <span className="text-gray-500">searches/mo</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <Target className="w-4 h-4 text-gray-400" />
//                             <span className="font-medium">{question.difficulty}%</span>
//                             <span className="text-gray-500">difficulty</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <MapPin className="w-4 h-4 text-gray-400" />
//                             <span className="text-gray-600">{question.region}</span>
//                           </div>
//                           <div className={`flex items-center gap-1 ${highIntentUtils.getCompetitionColor(question.competition)}`}>
//                             <Zap className="w-4 h-4" />
//                             <span className="capitalize">{question.competition} competition</span>
//                           </div>
//                         </div>
//                         {question.relatedQuestions && question.relatedQuestions.length > 0 && (
//                           <div className="mt-3">
//                             <button
//                               onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
//                               className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
//                             >
//                               {expandedQuestion === question.id ? (
//                                 <ChevronUp className="w-4 h-4" />
//                               ) : (
//                                 <ChevronDown className="w-4 h-4" />
//                               )}
//                               {question.relatedQuestions.length} related questions
//                             </button>
//                             {expandedQuestion === question.id && (
//                               <div className="mt-2 pl-4 border-l-2 border-purple-200 space-y-1">
//                                 {question.relatedQuestions.map((related, idx) => (
//                                   <p key={idx} className="text-sm text-gray-600">
//                                     • {related}
//                                   </p>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <button
//                           onClick={() => generateBlog(question)}
//                           disabled={isGeneratingBlog}
//                           className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
//                         >
//                           <Sparkles className="w-3 h-3" />
//                           Generate
//                         </button>
//                         <button
//                           onClick={() => {
//                             navigator.clipboard.writeText(question.question);
//                             showToast("Copied", "Question copied to clipboard");
//                           }}
//                           className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
//                         >
//                           <Copy className="w-3 h-3" />
//                           Copy
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   {researchedQuestions.length === 0
//                     ? "Start by researching products in the Research tab"
//                     : "Try adjusting your filters"}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Blogs Tab Content */}
//         {activeTab === "blogs" && (
//           <div className="p-6 space-y-6">
//             {/* Blog Generation Settings */}
//             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//               <h4 className="font-medium mb-4">Blog Generation Settings</h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Word Count</label>
//                   <select
//                     value={blogSettings.targetWordCount}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, targetWordCount: parseInt(e.target.value) })}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   >
//                     <option value={1500}>1,500 words</option>
//                     <option value={2000}>2,000 words</option>
//                     <option value={2500}>2,500 words</option>
//                     <option value={3000}>3,000 words</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">AI Provider</label>
//                   <select
//                     value={blogSettings.aiProvider}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, aiProvider: e.target.value as any })}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   >
//                     <option value="anthropic">Claude (Anthropic)</option>
//                     <option value="openai">GPT-4 (OpenAI)</option>
//                     <option value="gemini">Gemini (Google)</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">FAQ Count</label>
//                   <select
//                     value={blogSettings.faqCount}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, faqCount: parseInt(e.target.value) })}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   >
//                     <option value={3}>3 FAQs</option>
//                     <option value={5}>5 FAQs</option>
//                     <option value={7}>7 FAQs</option>
//                     <option value={10}>10 FAQs</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm text-gray-600 mb-1">Tone</label>
//                   <select
//                     value={blogSettings.tone}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, tone: e.target.value })}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   >
//                     <option value="professional">Professional</option>
//                     <option value="casual">Casual</option>
//                     <option value="authoritative">Authoritative</option>
//                     <option value="friendly">Friendly</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="flex items-center gap-6 mt-4">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={blogSettings.includeFAQ}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, includeFAQ: e.target.checked })}
//                     className="w-4 h-4 text-purple-600 rounded"
//                   />
//                   <span className="text-sm">Include FAQ Section</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={blogSettings.includeProductSection}
//                     onChange={(e) => setBlogSettings({ ...blogSettings, includeProductSection: e.target.checked })}
//                     className="w-4 h-4 text-purple-600 rounded"
//                   />
//                   <span className="text-sm">Include Product Section Placeholder</span>
//                 </label>
//               </div>
//             </div>

//             {/* Generated Blogs List */}
//             {generatedBlogs.length > 0 ? (
//               <div className="space-y-4">
//                 {generatedBlogs.map((blog) => (
//                   <div key={blog.id} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="font-medium text-lg">{blog.title}</h3>
//                         <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.metaDescription}</p>
//                         <div className="flex items-center gap-4 mt-3 text-sm">
//                           <span className="flex items-center gap-1 text-gray-600">
//                             <FileText className="w-4 h-4" />
//                             {blog.wordCount.toLocaleString()} words
//                           </span>
//                           <span className="flex items-center gap-1 text-gray-600">
//                             <HelpCircle className="w-4 h-4" />
//                             {blog.faqs.length} FAQs
//                           </span>
//                           <span className={`flex items-center gap-1 ${highIntentUtils.getSeoScoreColor(blog.seoScore)}`}>
//                             <Target className="w-4 h-4" />
//                             SEO: {blog.seoScore}%
//                           </span>
//                           <span className="text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => setPreviewBlog(blog)}
//                           className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
//                         >
//                           <Eye className="w-3 h-3" />
//                           Preview
//                         </button>
//                         <div className="relative group">
//                           <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1">
//                             <Download className="w-3 h-3" />
//                             Download
//                           </button>
//                           <div className="absolute right-0 mt-1 py-1 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block z-10">
//                             <button
//                               onClick={() => downloadBlog(blog, "html")}
//                               className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
//                             >
//                               HTML
//                             </button>
//                             <button
//                               onClick={() => downloadBlog(blog, "docx")}
//                               className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
//                             >
//                               DOCX
//                             </button>
//                             <button
//                               onClick={() => downloadBlog(blog, "md")}
//                               className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
//                             >
//                               Markdown
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <FileText className="mx-auto h-12 w-12 text-gray-400" />
//                 <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs generated yet</h3>
//                 <p className="mt-1 text-sm text-gray-500">Select questions and generate blogs from the Questions tab</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Blog Preview Modal */}
//       {previewBlog && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
//             <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setPreviewBlog(null)} />
//             <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//               <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
//                 <h2 className="text-xl font-semibold truncate pr-4">{previewBlog.title}</h2>
//                 <button onClick={() => setPreviewBlog(null)} className="text-gray-400 hover:text-gray-500">
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-6">
//                 <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewBlog.content }} />
//                 {previewBlog.faqs.length > 0 && (
//                   <div className="mt-8 border-t pt-8">
//                     <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
//                     <div className="space-y-4">
//                       {previewBlog.faqs.map((faq, idx) => (
//                         <div key={idx} className="border rounded-lg p-4">
//                           <h3 className="font-semibold text-lg text-purple-700">{faq.question}</h3>
//                           <p className="mt-2 text-gray-700">{faq.answer}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
//                 <button
//                   onClick={() => setPreviewBlog(null)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={() => {
//                     downloadBlog(previewBlog, "html");
//                     setPreviewBlog(null);
//                   }}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                 >
//                   Download HTML
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// client/src/pages/high-intent-collection.tsx
// Clean, Modern, User-Friendly High Intent Collection with Database Persistence

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
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowUpDown,
  MapPin,
  CheckCircle2,
  Settings,
  Eye,
  Save,
  FolderOpen,
  Trash2,
  Clock,
  RefreshCw,
} from "lucide-react";

import {
  highIntentApi,
  highIntentUtils,
  ResearchedQuestion,
  GeneratedBlog,
  Product,
  LocationTarget,
  SavedResearchSession,
} from "@/lib/high-intent-api";

// =============================================================================
// CONFIGURATION
// =============================================================================

const NICHES = [
  { value: "peptides", label: "Peptides", icon: "💊" },
  { value: "supplements", label: "Supplements", icon: "🌿" },
  { value: "skincare", label: "Skincare", icon: "✨" },
  { value: "fitness_equipment", label: "Fitness", icon: "💪" },
  { value: "tech_gadgets", label: "Tech", icon: "📱" },
  { value: "home_improvement", label: "Home", icon: "🏠" },
  { value: "pet_products", label: "Pet Products", icon: "🐾" },
  { value: "baby_products", label: "Baby", icon: "👶" },
  { value: "outdoor_gear", label: "Outdoor", icon: "⛺" },
  { value: "kitchen_appliances", label: "Kitchen", icon: "🍳" },
  { value: "ecommerce", label: "E-commerce", icon: "🛒" },
  { value: "custom", label: "Custom", icon: "✏️" },
];

const US_STATES = [
  { code: "ca", name: "California", topCities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"] },
  { code: "tx", name: "Texas", topCities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"] },
  { code: "fl", name: "Florida", topCities: ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale"] },
  { code: "ny", name: "New York", topCities: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"] },
  { code: "il", name: "Illinois", topCities: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford"] },
  { code: "pa", name: "Pennsylvania", topCities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"] },
  { code: "oh", name: "Ohio", topCities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"] },
  { code: "ga", name: "Georgia", topCities: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah"] },
  { code: "nc", name: "North Carolina", topCities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"] },
  { code: "mi", name: "Michigan", topCities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"] },
];

const CA_PROVINCES = [
  { code: "on", name: "Ontario", topCities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton"] },
  { code: "qc", name: "Quebec", topCities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"] },
  { code: "bc", name: "British Columbia", topCities: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford"] },
  { code: "ab", name: "Alberta", topCities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"] },
];

const COUNTRIES = [
  { code: "global", name: "Global" },
  { code: "us", name: "United States", states: US_STATES },
  { code: "ca", name: "Canada", provinces: CA_PROVINCES },
  { code: "uk", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "eu", name: "European Union" },
];

// =============================================================================
// COMPONENTS
// =============================================================================

type ButtonVariant = "primary" | "secondary" | "success" | "danger";

interface LoadingButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

const LoadingButton = ({
  onClick,
  loading,
  disabled,
  children,
  variant = "primary",
  icon: Icon,
  className = "",
}: LoadingButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2 justify-center
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};

const CompetitionBadge = ({ competition }: { competition: string }) => {
  const config = {
    low: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    medium: { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    high: { color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  }[competition] || { color: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {competition.charAt(0).toUpperCase() + competition.slice(1)}
    </span>
  );
};

const LocationBadge = ({ location }: { location: LocationTarget }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
      <MapPin className="w-3 h-3" />
      {highIntentUtils.getLocationDisplayName(location)}
    </span>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HighIntentCollection() {
  // Tab state - now includes "saved"
  const [activeTab, setActiveTab] = useState<"research" | "questions" | "blogs" | "saved">("research");
  
  // Research form state
  const [selectedNiche, setSelectedNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [bulkProductInput, setBulkProductInput] = useState("");
  const [questionsPerProduct, setQuestionsPerProduct] = useState(10);
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Location state
  const [selectedLocations, setSelectedLocations] = useState<LocationTarget[]>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [expandedState, setExpandedState] = useState<string | null>(null);

  // Research progress state
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [currentResearchProduct, setCurrentResearchProduct] = useState("");

  // Questions state
  const [researchedQuestions, setResearchedQuestions] = useState<ResearchedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [questionFilter, setQuestionFilter] = useState("");
  const [sortBy, setSortBy] = useState<"searchVolume" | "difficulty" | "popularity">("searchVolume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterByProduct, setFilterByProduct] = useState("");
  const [filterByPopularity, setFilterByPopularity] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filterByCompetition, setFilterByCompetition] = useState<"all" | "low" | "medium" | "high">("all");
  const [showOnlyLowCompetition, setShowOnlyLowCompetition] = useState(false);

  // Blog state
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
  const [showBlogSettings, setShowBlogSettings] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<GeneratedBlog | null>(null);

  // UI state
  const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // NEW: Database persistence state
  const [savedSessions, setSavedSessions] = useState<SavedResearchSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isSavingResearch, setIsSavingResearch] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState<string | null>(null);
  const [isDeletingBlog, setIsDeletingBlog] = useState<string | null>(null);

  // Get niche value
  const niche = selectedNiche === "custom" ? customNiche : selectedNiche;

  // ===========================================================================
  // EFFECTS - Load data from database
  // ===========================================================================

  // Load saved blogs from database on mount
  useEffect(() => {
    const loadSavedBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        const blogs = await highIntentApi.getGeneratedBlogs();
        if (blogs.length > 0) {
          setGeneratedBlogs(blogs);
          console.log(`📚 Loaded ${blogs.length} saved blogs from database`);
        }
      } catch (error) {
        console.error("Failed to load saved blogs:", error);
      }
      setIsLoadingBlogs(false);
    };
    loadSavedBlogs();
  }, []);

  // Load saved research sessions when "saved" tab is active
  useEffect(() => {
    if (activeTab === "saved") {
      loadSavedSessions();
    }
  }, [activeTab]);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const showToast = (title: string, message: string, type: string = "default") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Database handlers
  const loadSavedSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessions = await highIntentApi.getSavedResearch();
      setSavedSessions(sessions);
      console.log(`📂 Loaded ${sessions.length} saved research sessions`);
    } catch (error: any) {
      showToast("Load Failed", error.message || "Failed to load saved research", "destructive");
    }
    setIsLoadingSessions(false);
  };

  const saveCurrentResearch = async () => {
    if (researchedQuestions.length === 0) {
      showToast("Nothing to Save", "Research some questions first", "destructive");
      return;
    }

    const sessionName = prompt(
      "Enter a name for this research session:",
      `${niche || "Research"} - ${new Date().toLocaleDateString()}`
    );
    if (!sessionName) return;

    setIsSavingResearch(true);
    try {
      const uniqueProducts = Array.from(new Set(researchedQuestions.map((q) => q.productName)));
      await highIntentApi.saveResearch(
        researchedQuestions,
        sessionName,
        niche,
        uniqueProducts,
        selectedLocations
      );
      showToast("Research Saved", `Saved ${researchedQuestions.length} questions to "${sessionName}"`, "success");
      if (activeTab === "saved") {
        loadSavedSessions();
      }
    } catch (error: any) {
      showToast("Save Failed", error.message || "Failed to save research", "destructive");
    }
    setIsSavingResearch(false);
  };

  const restoreSession = async (session: SavedResearchSession) => {
    try {
      // Fetch the full questions for this session from the API
      const questions = await highIntentApi.getQuestionsBySession(session.id);
      setResearchedQuestions(questions);
      setSelectedNiche(session.niche);
      if (session.locations && session.locations.length > 0) {
        setSelectedLocations(session.locations);
      }
      setSelectedQuestions(new Set());
      showToast("Session Restored", `Loaded ${questions.length} questions from "${session.name}"`, "success");
      setActiveTab("questions");
    } catch (error: any) {
      showToast("Load Failed", error.message || "Failed to load session questions", "destructive");
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this saved research?")) return;

    setIsDeletingSession(sessionId);
    try {
      await highIntentApi.deleteResearch(sessionId);
      setSavedSessions(savedSessions.filter((s) => s.id !== sessionId));
      showToast("Deleted", "Research session deleted", "success");
    } catch (error: any) {
      showToast("Delete Failed", error.message || "Failed to delete", "destructive");
    }
    setIsDeletingSession(null);
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    setIsDeletingBlog(blogId);
    try {
      await highIntentApi.deleteBlog(blogId);
      setGeneratedBlogs(generatedBlogs.filter((b) => b.id !== blogId));
      showToast("Deleted", "Blog deleted", "success");
    } catch (error: any) {
      showToast("Delete Failed", error.message || "Failed to delete", "destructive");
    }
    setIsDeletingBlog(null);
  };

  const refreshBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const blogs = await highIntentApi.getGeneratedBlogs();
      setGeneratedBlogs(blogs);
      showToast("Refreshed", `Loaded ${blogs.length} blogs`, "success");
    } catch (error: any) {
      showToast("Refresh Failed", error.message || "Failed to refresh", "destructive");
    }
    setIsLoadingBlogs(false);
  };

  // Location handlers
  const toggleLocation = (location: LocationTarget) => {
    const exists = selectedLocations.some((loc) => loc.code === location.code && loc.type === location.type);
    if (exists) {
      setSelectedLocations(selectedLocations.filter((loc) => !(loc.code === location.code && loc.type === location.type)));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const isLocationSelected = (location: LocationTarget): boolean => {
    return selectedLocations.some((loc) => loc.code === location.code && loc.type === location.type);
  };

  const removeLocation = (location: LocationTarget) => {
    setSelectedLocations(selectedLocations.filter((loc) => !(loc.code === location.code && loc.type === location.type)));
  };

  const clearAllLocations = () => setSelectedLocations([]);

  // Product handlers
  const addProduct = () => {
    if (!newProduct.trim()) return;
    const product: Product = { id: `product-${Date.now()}`, name: newProduct.trim() };
    setProducts([...products, product]);
    setNewProduct("");
    showToast("Product Added", `"${product.name}" added successfully`, "success");
  };

  const addBulkProducts = () => {
    if (!bulkProductInput.trim()) return;
    const newProducts = highIntentUtils.parseBulkProducts(bulkProductInput).map((name, index) => ({
      id: `product-${Date.now()}-${index}`,
      name,
    }));
    setProducts([...products, ...newProducts]);
    setBulkProductInput("");
    setShowBulkInput(false);
    showToast("Products Added", `${newProducts.length} products added`, "success");
  };

  const removeProduct = (id: string) => setProducts(products.filter((p) => p.id !== id));

  // Research handler
  const startResearch = async () => {
    if (products.length === 0) {
      showToast("Error", "Please add at least one product", "destructive");
      return;
    }

    if (!niche) {
      showToast("Error", "Please select a niche", "destructive");
      return;
    }

    setIsResearching(true);
    setResearchProgress(0);
    setResearchedQuestions([]);

    try {
      const productNames = products.map((p) => p.name);
      const locations = selectedLocations.length > 0 ? selectedLocations : undefined;

      for (let i = 0; i < products.length; i++) {
        setCurrentResearchProduct(products[i].name);
        setResearchProgress(Math.round(((i + 0.5) / products.length) * 100));
      }

      const result = await highIntentApi.bulkResearch(productNames, niche, questionsPerProduct, locations);
      setResearchedQuestions(result.questions || []);
      setResearchProgress(100);

      const locationText = locations && locations.length > 0 ? ` across ${locations.length} location(s)` : "";
      showToast("Research Complete", `Found ${result.totalQuestions} questions${locationText}`, "success");

      setTimeout(() => {
        setActiveTab("questions");
        setIsResearching(false);
      }, 1500);
    } catch (error: any) {
      showToast("Research Failed", error.message || "An error occurred", "destructive");
      setIsResearching(false);
    }
  };

  // Question filtering and sorting
  const getFilteredAndSortedQuestions = (): ResearchedQuestion[] => {
    let filtered = [...researchedQuestions];

    if (questionFilter) {
      const searchLower = questionFilter.toLowerCase();
      filtered = filtered.filter(
        (q) => q.question.toLowerCase().includes(searchLower) || q.productName.toLowerCase().includes(searchLower)
      );
    }
    if (filterByProduct) filtered = filtered.filter((q) => q.productName === filterByProduct);
    if (filterByPopularity) filtered = filtered.filter((q) => q.popularity === filterByPopularity);
    if (filterByCompetition !== "all") filtered = filtered.filter((q) => q.competition === filterByCompetition);
    if (showOnlyLowCompetition) filtered = filtered.filter((q) => q.competition === "low");

    filtered.sort((a, b) => {
      let compareA: any, compareB: any;
      switch (sortBy) {
        case "searchVolume":
          compareA = a.searchVolume;
          compareB = b.searchVolume;
          break;
        case "difficulty":
          compareA = a.difficulty;
          compareB = b.difficulty;
          break;
        case "popularity":
          const popularityOrder = { high: 3, medium: 2, low: 1 };
          compareA = popularityOrder[a.popularity];
          compareB = popularityOrder[b.popularity];
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? compareA - compareB : compareB - compareA;
    });

    return filtered;
  };

  const toggleQuestionSelection = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedQuestions(newSelected);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredAndSortedQuestions();
    const newSelected = new Set(selectedQuestions);
    filtered.forEach((q) => newSelected.add(q.id));
    setSelectedQuestions(newSelected);
  };

  const deselectAll = () => setSelectedQuestions(new Set());

  // Export handler
  const exportToExcel = async () => {
    const questionsToExport = researchedQuestions.filter((q) => selectedQuestions.has(q.id));
    if (questionsToExport.length === 0) {
      showToast("No Selection", "Please select questions to export", "destructive");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await highIntentApi.exportToExcel(questionsToExport);
      highIntentUtils.downloadBlob(blob, `high-intent-questions-${new Date().toISOString().split("T")[0]}.xlsx`);
      showToast("Export Complete", `${questionsToExport.length} questions exported`, "success");
    } catch (error: any) {
      showToast("Export Failed", error.message || "Failed to export", "destructive");
    }
    setIsExporting(false);
  };

  // Blog generation handler - UPDATED to save questions first
  const generateBlogsForSelected = async () => {
    const questionsToGenerate = researchedQuestions.filter((q) => selectedQuestions.has(q.id));
    if (questionsToGenerate.length === 0) {
      showToast("No Selection", "Please select questions", "destructive");
      return;
    }
    if (questionsToGenerate.length > 10) {
      showToast("Too Many", "Maximum 10 blogs at once", "destructive");
      return;
    }

    setIsGeneratingBlog(true);
    try {
      // Pass saveToDb=true and saveQuestionsFirst=true to save questions before generating blogs
      const result = await highIntentApi.bulkGenerateBlogs(
        questionsToGenerate,
        blogSettings,
        true,  // saveToDb
        true   // saveQuestionsFirst - saves questions to DB first so blogs can reference them
      );
      setGeneratedBlogs([...generatedBlogs, ...result.blogs]);
      showToast(
        "Blogs Generated",
        `${result.succeeded} blog(s) created${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
        "success"
      );
      setActiveTab("blogs");
    } catch (error: any) {
      showToast("Generation Failed", error.message || "Failed to generate", "destructive");
    }
    setIsGeneratingBlog(false);
  };

  // Blog download handler
  const downloadBlog = async (blog: GeneratedBlog, format: "html" | "docx" | "md") => {
    try {
      const blob = await highIntentApi.downloadBlog(blog.id, format);
      const filename = `${highIntentUtils.sanitizeFilename(blog.title)}.${format}`;
      highIntentUtils.downloadBlob(blob, filename);
      showToast("Download Complete", `Blog saved as ${format.toUpperCase()}`, "success");
    } catch (error: any) {
      showToast("Download Failed", error.message || "Failed to download", "destructive");
    }
  };

  // Stats
  const getQuestionStats = () => {
    const filtered = getFilteredAndSortedQuestions();
    return {
      total: researchedQuestions.length,
      filtered: filtered.length,
      selected: selectedQuestions.size,
      lowCompetition: researchedQuestions.filter((q) => q.competition === "low").length,
    };
  };

  const stats = getQuestionStats();
  const uniqueProducts = Array.from(new Set(researchedQuestions.map((q) => q.productName)));

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === "destructive"
                ? "bg-red-50 border-red-200 text-red-800"
                : toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-purple-50 border-purple-200 text-purple-800"
            } max-w-md`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold text-sm">{toast.title}</div>
                <div className="text-sm mt-0.5 opacity-90">{toast.message}</div>
              </div>
              <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">High Intent Collection</h1>
              <p className="text-gray-600 mt-1">AI-powered research and content generation</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.lowCompetition}</div>
                <div className="text-xs text-gray-600 mt-1">Low Competition</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600 mt-1">Total Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Simple Tabs - Now includes Saved tab */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-lg shadow-sm w-fit">
          {[
            { id: "research", label: "Research", icon: Search },
            { id: "questions", label: "Questions", icon: HelpCircle, badge: stats.total },
            { id: "blogs", label: "Blogs", icon: FileText, badge: generatedBlogs.length },
            { id: "saved", label: "Saved", icon: FolderOpen, badge: savedSessions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all relative ${
                activeTab === tab.id ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-md bg-white/20">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* RESEARCH TAB */}
        {activeTab === "research" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
              {/* Niche */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Niche</label>
                <div className="grid grid-cols-4 gap-3">
                  {NICHES.map((nicheItem) => (
                    <button
                      key={nicheItem.value}
                      onClick={() => setSelectedNiche(nicheItem.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedNiche === nicheItem.value
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xl mb-1">{nicheItem.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{nicheItem.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedNiche === "custom" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Custom Niche</label>
                  <input
                    type="text"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                    placeholder="Enter your niche..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              )}

              {/* Locations */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Target Locations (Optional)</label>
                <button
                  onClick={() => setShowLocationSelector(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {selectedLocations.length === 0
                        ? "Select locations"
                        : `${selectedLocations.length} location(s) selected`}
                    </span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <LocationBadge location={loc} />
                        <button onClick={() => removeLocation(loc)} className="text-gray-400 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Products */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Add Products</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addProduct()}
                    placeholder="Enter product name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <LoadingButton onClick={addProduct} variant="primary" icon={Plus}>
                    Add
                  </LoadingButton>
                </div>
                <button
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2"
                >
                  Add multiple products
                </button>
              </div>

              {showBulkInput && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Add (comma or line-separated)</label>
                  <textarea
                    value={bulkProductInput}
                    onChange={(e) => setBulkProductInput(e.target.value)}
                    placeholder="Product 1, Product 2&#10;Product 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-3">
                    <LoadingButton onClick={addBulkProducts} variant="primary" icon={Plus}>
                      Add All
                    </LoadingButton>
                    <LoadingButton onClick={() => setShowBulkInput(false)} variant="secondary">
                      Cancel
                    </LoadingButton>
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">{products.length} product(s)</span>
                    <button onClick={() => setProducts([])} className="text-sm text-red-600 hover:text-red-700">
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm"
                      >
                        {product.name}
                        <button onClick={() => removeProduct(product.id)} className="text-gray-400 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Per Product */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Questions Per Product: <span className="text-purple-600">{questionsPerProduct}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={questionsPerProduct}
                  onChange={(e) => setQuestionsPerProduct(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>

              {/* Start Button */}
              {isResearching ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <div className="text-sm font-medium text-gray-800">
                      Researching {currentResearchProduct}... {researchProgress}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${researchProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <LoadingButton
                  onClick={startResearch}
                  loading={isResearching}
                  disabled={products.length === 0 || !selectedNiche}
                  variant="primary"
                  icon={Sparkles}
                  className="w-full py-3 text-base"
                >
                  Start Research
                </LoadingButton>
              )}
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            {researchedQuestions.length > 0 ? (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyLowCompetition}
                        onChange={(e) => setShowOnlyLowCompetition(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-emerald-800">Low Competition ({stats.lowCompetition})</span>
                    </label>

                    <select
                      value={filterByCompetition}
                      onChange={(e) => setFilterByCompetition(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Competition</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                    {uniqueProducts.length > 1 && (
                      <select
                        value={filterByProduct}
                        onChange={(e) => setFilterByProduct(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">All Products</option>
                        {uniqueProducts.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="searchVolume">Search Volume</option>
                      <option value="difficulty">Difficulty</option>
                      <option value="popularity">Popularity</option>
                    </select>

                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Blog Settings */}
                {stats.selected > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <button
                      onClick={() => setShowBlogSettings(!showBlogSettings)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Blog Settings</span>
                      </div>
                      {showBlogSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {showBlogSettings && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: "anthropic", label: "Claude" },
                            { value: "openai", label: "GPT-4" },
                            { value: "gemini", label: "Gemini" },
                          ].map((provider) => (
                            <button
                              key={provider.value}
                              onClick={() => setBlogSettings({ ...blogSettings, aiProvider: provider.value as any })}
                              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium ${
                                blogSettings.aiProvider === provider.value
                                  ? "border-purple-600 bg-purple-50 text-purple-700"
                                  : "border-gray-300 text-gray-700"
                              }`}
                            >
                              {provider.label}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Word Count: {blogSettings.targetWordCount}
                          </label>
                          <input
                            type="range"
                            min="1000"
                            max="5000"
                            step="500"
                            value={blogSettings.targetWordCount}
                            onChange={(e) => setBlogSettings({ ...blogSettings, targetWordCount: parseInt(e.target.value) })}
                            className="w-full accent-purple-600"
                          />
                        </div>

                        <div>
                          <select
                            value={blogSettings.tone}
                            onChange={(e) => setBlogSettings({ ...blogSettings, tone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Technical</option>
                            <option value="persuasive">Persuasive</option>
                            <option value="educational">Educational</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={blogSettings.includeFAQ}
                            onChange={(e) => setBlogSettings({ ...blogSettings, includeFAQ: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Include FAQ ({blogSettings.faqCount} questions)</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="bg-white p-4 rounded-lg border flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{stats.filtered}</span> of{" "}
                    <span className="font-medium text-gray-900">{stats.total}</span>
                    {stats.selected > 0 && (
                      <span className="ml-2">
                        • <span className="font-medium text-purple-600">{stats.selected}</span> selected
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {stats.selected > 0 ? (
                      <>
                        <LoadingButton onClick={deselectAll} variant="secondary">
                          Deselect
                        </LoadingButton>
                        <LoadingButton
                          onClick={saveCurrentResearch}
                          loading={isSavingResearch}
                          variant="secondary"
                          icon={Save}
                        >
                          Save
                        </LoadingButton>
                        <LoadingButton onClick={exportToExcel} loading={isExporting} variant="success" icon={FileSpreadsheet}>
                          Export
                        </LoadingButton>
                        <LoadingButton onClick={generateBlogsForSelected} loading={isGeneratingBlog} variant="primary" icon={Sparkles}>
                          Generate Blogs
                        </LoadingButton>
                      </>
                    ) : (
                      <>
                        <LoadingButton
                          onClick={saveCurrentResearch}
                          loading={isSavingResearch}
                          variant="secondary"
                          icon={Save}
                          disabled={researchedQuestions.length === 0}
                        >
                          Save Research
                        </LoadingButton>
                        <LoadingButton onClick={selectAllFiltered} variant="secondary">
                          Select All
                        </LoadingButton>
                      </>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {getFilteredAndSortedQuestions().map((question) => (
                    <div
                      key={question.id}
                      className={`bg-white p-6 rounded-lg border transition-all ${
                        selectedQuestions.has(question.id) ? "border-purple-600 bg-purple-50/30" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.has(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="mt-1"
                        />

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {question.locationData && (
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                                {question.locationData.city ||
                                  question.locationData.state ||
                                  question.locationData.province ||
                                  question.locationData.country}
                              </span>
                            )}
                            <CompetitionBadge competition={question.competition} />
                            <span
                              className={`text-xs px-2 py-1 rounded-md border ${highIntentUtils.getPopularityColor(
                                question.popularity
                              )}`}
                            >
                              {question.popularity}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-900">{question.question}</h3>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {highIntentUtils.formatNumber(question.searchVolume)}/mo
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Difficulty: {question.difficulty}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs">
                              {question.productName}
                            </span>
                          </div>

                          {expandedQuestion === question.id && question.relatedQuestions.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-2">Related:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {question.relatedQuestions.map((rq, idx) => (
                                  <li key={idx}>• {rq}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {question.relatedQuestions.length > 0 && (
                          <button
                            onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            {expandedQuestion === question.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border p-16 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 mb-6">Start by researching products or load saved research</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab("research")}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Go to Research
                  </button>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Load Saved
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BLOGS TAB */}
        {activeTab === "blogs" && (
          <div className="space-y-4">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generated Blogs ({generatedBlogs.length})</h2>
              <LoadingButton onClick={refreshBlogs} loading={isLoadingBlogs} variant="secondary" icon={RefreshCw}>
                Refresh
              </LoadingButton>
            </div>

            {isLoadingBlogs && generatedBlogs.length === 0 ? (
              <div className="bg-white rounded-lg border p-16 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading saved blogs...</p>
              </div>
            ) : generatedBlogs.length > 0 ? (
              generatedBlogs.map((blog) => (
                <div key={blog.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                        {blog.status && (
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${highIntentUtils.getStatusBadgeColor(
                              blog.status
                            )}`}
                          >
                            {blog.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{blog.metaDescription}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>{blog.wordCount.toLocaleString()} words</span>
                        <span>{blog.faqs?.length || 0} FAQs</span>
                        <span className={highIntentUtils.getSeoScoreColor(blog.seoScore)}>SEO: {blog.seoScore}%</span>
                        {blog.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {highIntentUtils.formatDate(blog.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton onClick={() => setPreviewBlog(blog)} variant="secondary" icon={Eye}>
                        Preview
                      </LoadingButton>
                      <div className="relative group">
                        <LoadingButton variant="success" icon={Download}>
                          Download
                        </LoadingButton>
                        <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block z-10">
                          <button
                            onClick={() => downloadBlog(blog, "html")}
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            HTML
                          </button>
                          <button
                            onClick={() => downloadBlog(blog, "docx")}
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            DOCX
                          </button>
                          <button
                            onClick={() => downloadBlog(blog, "md")}
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            Markdown
                          </button>
                        </div>
                      </div>
                      <LoadingButton
                        onClick={() => deleteBlog(blog.id)}
                        loading={isDeletingBlog === blog.id}
                        variant="danger"
                        icon={Trash2}
                      >
                        Delete
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg border p-16 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-600 mb-6">Generate blogs from your researched questions</p>
                <button
                  onClick={() => setActiveTab("questions")}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Go to Questions
                </button>
              </div>
            )}
          </div>
        )}

        {/* SAVED RESEARCH TAB */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Saved Research Sessions ({savedSessions.length})</h2>
              <LoadingButton onClick={loadSavedSessions} loading={isLoadingSessions} variant="secondary" icon={RefreshCw}>
                Refresh
              </LoadingButton>
            </div>

            {isLoadingSessions ? (
              <div className="bg-white rounded-lg border p-16 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading saved research...</p>
              </div>
            ) : savedSessions.length > 0 ? (
              <div className="grid gap-4">
                {savedSessions.map((session) => (
                  <div key={session.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{session.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {session.niche}
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-4 h-4" />
                            {session.totalQuestions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {session.products.length} products
                          </span>
                          {session.locations && session.locations.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {session.locations.length} locations
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {highIntentUtils.formatDate(session.createdAt)}
                          </span>
                        </div>
                        {/* Products preview */}
                        <div className="flex flex-wrap gap-1">
                          {session.products.slice(0, 5).map((product, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {product}
                            </span>
                          ))}
                          {session.products.length > 5 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                              +{session.products.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <LoadingButton onClick={() => restoreSession(session)} variant="primary" icon={FolderOpen}>
                          Load
                        </LoadingButton>
                        <LoadingButton
                          onClick={() => deleteSession(session.id)}
                          loading={isDeletingSession === session.id}
                          variant="danger"
                          icon={Trash2}
                        >
                          Delete
                        </LoadingButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-16 text-center">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved research</h3>
                <p className="text-gray-600 mb-6">Save your research sessions to access them later</p>
                <button
                  onClick={() => setActiveTab("research")}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Start Research
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Modal - Simplified */}
      {showLocationSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Select Locations</h2>
              <button onClick={() => setShowLocationSelector(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedLocations.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">{selectedLocations.length} selected</span>
                    <button onClick={clearAllLocations} className="text-xs text-blue-700 hover:underline">
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((loc, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <LocationBadge location={loc} />
                        <button onClick={() => removeLocation(loc)} className="text-blue-600 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {COUNTRIES.map((country) => (
                  <div key={country.code} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLocationSelected({ type: "country", code: country.code, name: country.name })}
                          onChange={() => toggleLocation({ type: "country", code: country.code, name: country.name })}
                          className="rounded"
                        />
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{country.name}</span>
                      </label>
                      {(country.states || country.provinces) && (
                        <button
                          onClick={() => setExpandedCountry(expandedCountry === country.code ? null : country.code)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedCountry === country.code ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    {expandedCountry === country.code && country.states && (
                      <div className="p-3 space-y-1">
                        {country.states.map((state) => (
                          <div key={state.code}>
                            <div className="flex items-center justify-between py-1">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isLocationSelected({
                                    type: "state",
                                    code: `us-${state.code}`,
                                    name: state.name,
                                    parentCode: "us",
                                  })}
                                  onChange={() =>
                                    toggleLocation({
                                      type: "state",
                                      code: `us-${state.code}`,
                                      name: state.name,
                                      parentCode: "us",
                                    })
                                  }
                                  className="rounded text-sm"
                                />
                                <span className="text-sm text-gray-700">{state.name}</span>
                              </label>
                              <button
                                onClick={() => setExpandedState(expandedState === `us-${state.code}` ? null : `us-${state.code}`)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {expandedState === `us-${state.code}` ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {expandedState === `us-${state.code}` && (
                              <div className="ml-6 space-y-1">
                                {state.topCities.map((city) => (
                                  <label key={city} className="flex items-center gap-2 py-0.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isLocationSelected({
                                        type: "city",
                                        code: `us-${state.code}-${city.toLowerCase().replace(/\s+/g, "-")}`,
                                        name: city,
                                        parentCode: `us-${state.code}`,
                                      })}
                                      onChange={() =>
                                        toggleLocation({
                                          type: "city",
                                          code: `us-${state.code}-${city.toLowerCase().replace(/\s+/g, "-")}`,
                                          name: city,
                                          parentCode: `us-${state.code}`,
                                        })
                                      }
                                      className="rounded text-xs"
                                    />
                                    <span className="text-xs text-gray-600">{city}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedCountry === country.code && country.provinces && (
                      <div className="p-3 space-y-1">
                        {country.provinces.map((province) => (
                          <div key={province.code}>
                            <div className="flex items-center justify-between py-1">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isLocationSelected({
                                    type: "province",
                                    code: `ca-${province.code}`,
                                    name: province.name,
                                    parentCode: "ca",
                                  })}
                                  onChange={() =>
                                    toggleLocation({
                                      type: "province",
                                      code: `ca-${province.code}`,
                                      name: province.name,
                                      parentCode: "ca",
                                    })
                                  }
                                  className="rounded text-sm"
                                />
                                <span className="text-sm text-gray-700">{province.name}</span>
                              </label>
                              <button
                                onClick={() => setExpandedState(expandedState === `ca-${province.code}` ? null : `ca-${province.code}`)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {expandedState === `ca-${province.code}` ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {expandedState === `ca-${province.code}` && (
                              <div className="ml-6 space-y-1">
                                {province.topCities.map((city) => (
                                  <label key={city} className="flex items-center gap-2 py-0.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isLocationSelected({
                                        type: "city",
                                        code: `ca-${province.code}-${city.toLowerCase().replace(/\s+/g, "-")}`,
                                        name: city,
                                        parentCode: `ca-${province.code}`,
                                      })}
                                      onChange={() =>
                                        toggleLocation({
                                          type: "city",
                                          code: `ca-${province.code}-${city.toLowerCase().replace(/\s+/g, "-")}`,
                                          name: city,
                                          parentCode: `ca-${province.code}`,
                                        })
                                      }
                                      className="rounded text-xs"
                                    />
                                    <span className="text-xs text-gray-600">{city}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedLocations.length === 0 ? "Global research" : `${selectedLocations.length} location(s)`}
              </div>
              <LoadingButton onClick={() => setShowLocationSelector(false)} variant="primary" icon={CheckCircle2}>
                Done
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Blog Preview Modal */}
      {previewBlog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">{previewBlog.title}</h2>
              <button onClick={() => setPreviewBlog(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                __html: previewBlog.content
                  .replace(/^```html\s*/gi, "")
                  .replace(/^```\s*/gi, "")
                  .replace(/```html\s*$/gi, "")
                  .replace(/```\s*$/gi, "")
                  .replace(/```html/gi, "")
                  .replace(/```/gi, "")
                  .trim()
              }} />
              {previewBlog.faqs && previewBlog.faqs.length > 0 && (
                <div className="mt-8 border-t pt-8">
                  <h2 className="text-2xl font-bold mb-6">FAQs</h2>
                  <div className="space-y-4">
                    {previewBlog.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2 bg-gray-50">
              <LoadingButton onClick={() => setPreviewBlog(null)} variant="secondary">
                Close
              </LoadingButton>
              <LoadingButton
                onClick={() => {
                  downloadBlog(previewBlog, "html");
                  setPreviewBlog(null);
                }}
                variant="primary"
                icon={Download}
              >
                Download
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}