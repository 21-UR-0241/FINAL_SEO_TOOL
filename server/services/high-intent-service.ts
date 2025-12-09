
// import Anthropic from "@anthropic-ai/sdk";
// import OpenAI from "openai";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
// import axios from "axios";

// // =============================================================================
// // TYPES
// // =============================================================================
// export interface ResearchedQuestion {
//   id: string;
//   productId: string;
//   productName: string;
//   question: string;
//   searchVolume: number;
//   difficulty: number;
//   cpc: number;
//   competition: "low" | "medium" | "high";
//   popularity: "high" | "medium" | "low";
//   region: string;
//   relatedQuestions: string[];
//   source: string;
//   trend: "rising" | "stable" | "declining";
//   intent: "informational" | "commercial" | "transactional" | "navigational";
//   estimatedClicks: number;
//   lastUpdated: Date;
// }

// export interface BlogGenerationParams {
//   questionId: string;
//   question: string;
//   productName: string;
//   targetWordCount: number;
//   includeFAQ: boolean;
//   faqCount: number;
//   aiProvider: "openai" | "anthropic" | "gemini";
//   tone: string;
//   includeProductSection: boolean;
//   userId: string;
// }

// export interface GeneratedBlog {
//   id: string;
//   questionId: string;
//   title: string;
//   content: string;
//   wordCount: number;
//   faqs: Array<{ question: string; answer: string }>;
//   metaDescription: string;
//   seoScore: number;
//   status: "draft" | "downloaded";
//   createdAt: Date;
//   userId: string;
// }

// export interface SavedResearchSession {
//   id: string;
//   name: string;
//   niche: string;
//   products: string[];
//   questions: ResearchedQuestion[];
//   createdAt: Date;
//   userId: string;
// }

// // =============================================================================
// // SEO DATA API CLIENTS
// // =============================================================================
// class SerperClient {
//   private apiKey: string;

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async search(query: string): Promise<{
//     peopleAlsoAsk: Array<{ question: string; snippet: string; link: string }>;
//     relatedSearches: Array<{ query: string }>;
//     organic: Array<{ title?: string; snippet?: string; link?: string }>;
//   }> {
//     try {
//       const response = await axios.post(
//         "https://google.serper.dev/search",
//         {
//           q: query,
//           gl: "us",
//           hl: "en",
//           num: 10,
//         },
//         {
//           headers: {
//             "X-API-KEY": this.apiKey,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const data = response.data || {};
//       console.log("Serper raw keys:", Object.keys(data));

//       // Surface any error payloads returned with 200
//       if (data.error || data.status === "error" || data.message) {
//         console.error("Serper reported error payload:", JSON.stringify(data, null, 2));
//         return { peopleAlsoAsk: [], relatedSearches: [], organic: [] };
//       }

//       const peopleAlsoAsk = data.peopleAlsoAsk || [];
//       const relatedSearches = data.relatedSearches || [];
//       const organic = data.organic || [];

//       console.log(
//         `Serper search("${query}") => PAA: ${peopleAlsoAsk.length}, Related: ${relatedSearches.length}, Organic: ${organic.length}`
//       );

//       if (!peopleAlsoAsk.length && !relatedSearches.length && organic.length) {
//         console.log(
//           `Serper returned ${organic.length} organic results for "${query}" but no PAA/relatedSearches`
//         );
//       }

//       return {
//         peopleAlsoAsk,
//         relatedSearches,
//         organic,
//       };
//     } catch (error: any) {
//       if (error.response) {
//         console.error(
//           `Serper search failed for "${query}":`,
//           error.message,
//           "status:",
//           error.response.status,
//           "data:",
//           JSON.stringify(error.response.data, null, 2)
//         );
//       } else {
//         console.error(`Serper search failed for "${query}":`, error.message);
//       }
//       return { peopleAlsoAsk: [], relatedSearches: [], organic: [] };
//     }
//   }
// }

// class DataForSEOClient {
//   private auth: string;

//   constructor(login: string, password: string) {
//     this.auth = Buffer.from(`${login}:${password}`).toString("base64");
//   }

//   async getKeywordMetrics(
//     keywords: string[]
//   ): Promise<
//     Map<
//       string,
//       {
//         searchVolume: number;
//         cpc: number;
//         competition: number;
//         monthlySearches: Array<{ year: number; month: number; search_volume: number }>;
//       }
//     >
//   > {
//     const results = new Map();
//     if (keywords.length === 0) return results;

//     try {
//       const response = await axios.post(
//         "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
//         [
//           {
//             keywords: keywords.slice(0, 700),
//             location_name: "United States",
//             language_name: "English",
//           },
//         ],
//         {
//           headers: {
//             Authorization: `Basic ${this.auth}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const items = response.data?.tasks?.[0]?.result || [];
//       for (const item of items) {
//         results.set(item.keyword?.toLowerCase(), {
//           searchVolume: item.search_volume || 0,
//           cpc: item.cpc || 0,
//           competition: item.competition || 0,
//           monthlySearches: item.monthly_searches || [],
//         });
//       }
//     } catch (error: any) {
//       console.error("DataForSEO request failed:", error.message);
//     }

//     return results;
//   }

//   async getKeywordDifficulty(keywords: string[]): Promise<Map<string, number>> {
//     const results = new Map();
//     if (keywords.length === 0) return results;

//     try {
//       const response = await axios.post(
//         "https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
//         [
//           {
//             keywords: keywords.slice(0, 1000),
//             location_code: 2840,
//             language_code: "en",
//           },
//         ],
//         {
//           headers: {
//             Authorization: `Basic ${this.auth}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const items = response.data?.tasks?.[0]?.result || [];
//       for (const item of items) {
//         if (item.keyword && item.keyword_difficulty !== undefined) {
//           results.set(item.keyword.toLowerCase(), item.keyword_difficulty);
//         }
//       }
//     } catch (error: any) {
//       console.error("DataForSEO difficulty request failed:", error.message);
//     }

//     return results;
//   }
// }

// // =============================================================================
// // NICHE CONTEXTS
// // =============================================================================
// const NICHE_CONTEXTS: Record<
//   string,
//   {
//     industry: string;
//     searchQueries: string[];
//     audienceProfile: string;
//   }
// > = {
//   peptides: {
//     industry: "Health & Performance Enhancement",
//     searchQueries: [
//       "benefits",
//       "side effects",
//       "dosage",
//       "how to use",
//       "results",
//       "before and after",
//       "reviews",
//       "vs",
//     ],
//     audienceProfile: "Researchers, biohackers, bodybuilders, anti-aging enthusiasts",
//   },
//   supplements: {
//     industry: "Health & Nutrition",
//     searchQueries: [
//       "benefits",
//       "side effects",
//       "dosage",
//       "when to take",
//       "best",
//       "vs",
//       "reviews",
//       "natural",
//     ],
//     audienceProfile: "Health-conscious consumers, athletes, wellness seekers",
//   },
//   skincare: {
//     industry: "Beauty & Cosmetics",
//     searchQueries: [
//       "how to use",
//       "benefits",
//       "before and after",
//       "reviews",
//       "for acne",
//       "for wrinkles",
//       "vs",
//     ],
//     audienceProfile: "Beauty enthusiasts, skincare beginners",
//   },
//   ecommerce: {
//     industry: "E-commerce & Online Retail",
//     searchQueries: ["review", "vs", "best", "price", "where to buy", "alternative", "worth it"],
//     audienceProfile: "Online shoppers, comparison shoppers",
//   },
// };

// // =============================================================================
// // HIGH INTENT SERVICE CLASS
// // =============================================================================
// class HighIntentService {
//   private anthropic: Anthropic | null = null;
//   private openai: OpenAI | null = null;
//   private gemini: GoogleGenerativeAI | null = null;
//   private serper: SerperClient | null = null;
//   private dataForSEO: DataForSEOClient | null = null;

//   // In-memory storage (replace with database in production)
//   private savedResearch: Map<string, SavedResearchSession[]> = new Map();
//   private generatedBlogs: Map<string, GeneratedBlog[]> = new Map();

//   constructor() {
//     this.initializeProviders();
//   }

//   private initializeProviders(): void {
//     if (process.env.ANTHROPIC_API_KEY) {
//       this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//       console.log("✅ Anthropic AI initialized");
//     }

//     if (process.env.OPENAI_API_KEY) {
//       this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//       console.log("✅ OpenAI initialized");
//     }

//     if (process.env.GOOGLE_GEMINI_API_KEY) {
//       this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
//       console.log("✅ Google Gemini initialized");
//     }

//     if (process.env.SERPER_API_KEY) {
//       this.serper = new SerperClient(process.env.SERPER_API_KEY);
//       console.log("✅ Serper.dev initialized (Real Google PAA data)");
//     }

//     if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
//       this.dataForSEO = new DataForSEOClient(
//         process.env.DATAFORSEO_LOGIN,
//         process.env.DATAFORSEO_PASSWORD
//       );
//       console.log("✅ DataForSEO initialized (Real search volume data)");
//     }

//     if (!this.serper && !this.dataForSEO) {
//       console.warn("⚠️ No SEO data APIs configured. Using AI-estimated metrics.");
//       console.warn(
//         "   For real data, add SERPER_API_KEY and/or DATAFORSEO_LOGIN/PASSWORD to .env"
//       );
//     }
//   }

//   // ===========================================================================
//   // RESEARCH METHODS
//   // ===========================================================================
//   async researchProductQuestions(
//     productName: string,
//     niche: string,
//     questionsCount: number,
//     locations?: any // currently unused, kept for compatibility with routes
//   ): Promise<ResearchedQuestion[]> {
//     console.log(`\n🔍 Researching "${productName}" in ${niche} niche...`);

//     const nicheContext = NICHE_CONTEXTS[niche] || this.getDefaultNicheContext(niche);
//     const allQuestions: string[] = [];
//     const relatedQuestionsMap: Map<string, string[]> = new Map();
//     let usedFallbackQuestions = false;

//     if (this.serper) {
//       console.log("📡 Fetching real 'People Also Ask' data from Google...");

//       const searchQueries = [
//         productName,
//         `what is ${productName}`,
//         ...nicheContext.searchQueries.slice(0, 4).map((q) => `${productName} ${q}`),
//       ];

//       for (const query of searchQueries) {
//         try {
//           const result = await this.serper.search(query);

//           // Primary: PAA questions
//           const paaQuestions = result.peopleAlsoAsk.map((paa) => paa.question);

//           // Fallback: derive question-like text from organic results when PAA empty
//           if (paaQuestions.length === 0 && result.organic && result.organic.length > 0) {
//             const derivedQuestions: string[] = [];

//             for (const item of result.organic) {
//               const candidates = [item.title, item.snippet].filter(
//                 (t): t is string => !!t
//               );
//               for (const text of candidates) {
//                 const trimmed = text.trim();
//                 if (
//                   trimmed.endsWith("?") ||
//                   /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(trimmed)
//                 ) {
//                   derivedQuestions.push(trimmed);
//                 }
//               }
//             }

//             if (derivedQuestions.length) {
//               console.log(
//                 `Derived ${derivedQuestions.length} question-like queries from organic results for "${query}"`
//               );
//               allQuestions.push(...derivedQuestions);
//             }
//           }

//           allQuestions.push(...paaQuestions);

//           paaQuestions.forEach((q) => {
//             relatedQuestionsMap.set(
//               q,
//               paaQuestions.filter((rq) => rq !== q).slice(0, 3)
//             );
//           });

//           // Related searches that look like questions and include the product name
//           const questionSearches = result.relatedSearches
//             .map((r) => r.query)
//             .filter(
//               (q) =>
//                 q.toLowerCase().includes(productName.toLowerCase()) &&
//                 (q.includes("?") ||
//                   /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(q))
//             );

//           allQuestions.push(...questionSearches);

//           await this.delay(200);
//         } catch (err: any) {
//           console.error(`Failed to search "${query}":`, err.message);
//         }
//       }

//       console.log(`✅ Found ${allQuestions.length} real questions from Google (incl. organic-derived)`);

//       // Try to expand by searching PAA questions themselves
//       if (allQuestions.length > 0 && allQuestions.length < questionsCount) {
//         console.log("🔄 Expanding PAA by searching PAA-derived questions themselves...");
//         const seeds = Array.from(new Set(allQuestions)).slice(0, 5);
//         await this.expandPAAWithSerper(seeds, allQuestions, relatedQuestionsMap);
//         console.log(`✅ After expansion: ${allQuestions.length} questions`);
//       }

//       if (allQuestions.length === 0) {
//         console.log(
//           "⚠️ Serper returned no PAA/related (or organic-question) results. Falling back to AI-generated questions..."
//         );
//         const aiQuestions = await this.generateQuestionsWithAI(
//           productName,
//           nicheContext,
//           questionsCount
//         );
//         allQuestions.push(...aiQuestions);
//         usedFallbackQuestions = true;
//       }
//     } else {
//       console.log("⚠️ Serper not configured. Using AI-generated questions...");
//       const aiQuestions = await this.generateQuestionsWithAI(
//         productName,
//         nicheContext,
//         questionsCount
//       );
//       allQuestions.push(...aiQuestions);
//       usedFallbackQuestions = true;
//     }

//     const uniqueQuestions = Array.from(new Set(allQuestions))
//       .filter((q) => q && q.length > 10)
//       .slice(0, questionsCount * 2);

//     let keywordMetrics = new Map<string, any>();
//     let keywordDifficulty = new Map<string, number>();

//     if (this.dataForSEO && uniqueQuestions.length > 0) {
//       console.log("📊 Fetching real search volume from DataForSEO...");
//       try {
//         keywordMetrics = await this.dataForSEO.getKeywordMetrics(uniqueQuestions);
//         keywordDifficulty = await this.dataForSEO.getKeywordDifficulty(uniqueQuestions);
//         console.log(`✅ Got metrics for ${keywordMetrics.size} keywords`);
//       } catch (err: any) {
//         console.error("Failed to get keyword metrics:", err.message);
//       }
//     }

//     const questions: ResearchedQuestion[] = [];

//     for (let i = 0; i < uniqueQuestions.length && questions.length < questionsCount; i++) {
//       const questionText = uniqueQuestions[i];
//       const metrics = keywordMetrics.get(questionText.toLowerCase());
//       const difficulty = keywordDifficulty.get(questionText.toLowerCase());

//       const searchVolume =
//         metrics?.searchVolume || this.estimateSearchVolume(questionText);
//       const kwDifficulty =
//         difficulty ??
//         (metrics ? Math.round(metrics.competition * 100) : this.estimateDifficulty(questionText));
//       const cpc = metrics?.cpc || 0;
//       const competition = metrics?.competition || 0.5;

//       // If we have real metrics and the term is basically dead, skip it
//       if (metrics && searchVolume < 10) continue;

//       const isRealMetrics = !!metrics;
//       let source: string;

//       if (usedFallbackQuestions) {
//         source = isRealMetrics
//           ? "AI / fallback questions + DataForSEO metrics"
//           : "AI / fallback questions (estimated metrics)";
//       } else {
//         source = isRealMetrics
//           ? "Google SERP + DataForSEO (Real Data)"
//           : "Google SERP (Estimated Metrics)";
//       }

//       questions.push({
//         id: `q-${productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${i}`,
//         productId: `prod-${productName.toLowerCase().replace(/\s+/g, "-")}`,
//         productName,
//         question: questionText,
//         searchVolume,
//         difficulty: kwDifficulty,
//         cpc,
//         competition: competition < 0.33 ? "low" : competition < 0.66 ? "medium" : "high",
//         popularity: searchVolume > 5000 ? "high" : searchVolume > 1000 ? "medium" : "low",
//         region: "United States",
//         relatedQuestions: relatedQuestionsMap.get(questionText) || [],
//         source,
//         trend: this.determineTrend(metrics?.monthlySearches),
//         intent: this.classifyIntent(questionText),
//         estimatedClicks: Math.floor(searchVolume * 0.03),
//         lastUpdated: new Date(),
//       });
//     }

//     questions.sort((a, b) => b.searchVolume - a.searchVolume);
//     console.log(`✅ Returning ${questions.length} questions for "${productName}"\n`);

//     return questions.slice(0, questionsCount);
//   }

//   async bulkResearchQuestions(
//     products: string[],
//     niche: string,
//     questionsPerProduct: number,
//     locations?: any
//   ): Promise<ResearchedQuestion[]> {
//     const allQuestions: ResearchedQuestion[] = [];

//     console.log(`\n🚀 Starting bulk research for ${products.length} products...`);
//     console.log(`   Questions per product: ${questionsPerProduct}`);
//     console.log(
//       `   Total expected: ~${products.length * questionsPerProduct} questions\n`
//     );

//     for (let i = 0; i < products.length; i++) {
//       const product = products[i];
//       console.log(`[${i + 1}/${products.length}] Processing: ${product}`);

//       try {
//         const questions = await this.researchProductQuestions(
//           product,
//           niche,
//           questionsPerProduct,
//           locations
//         );
//         allQuestions.push(...questions);
//       } catch (err: any) {
//         console.error(`❌ Failed to research "${product}":`, err.message);
//       }

//       if (i < products.length - 1) {
//         await this.delay(1500);
//       }
//     }

//     console.log(`\n✅ Bulk research complete!`);
//     console.log(`   Products processed: ${products.length}`);
//     console.log(`   Total questions: ${allQuestions.length}\n`);

//     return allQuestions;
//   }

//   private async expandPAAWithSerper(
//     seedQuestions: string[],
//     allQuestions: string[],
//     relatedQuestionsMap: Map<string, string[]>
//   ): Promise<void> {
//     if (!this.serper) return;

//     const seen = new Set(allQuestions);

//     for (const seed of seedQuestions) {
//       try {
//         const result = await this.serper.search(seed);

//         const paaQuestions = result.peopleAlsoAsk.map((paa) => paa.question);
//         const relatedForSeed: string[] = [];

//         // Add new PAA questions
//         for (const q of paaQuestions) {
//           if (!seen.has(q)) {
//             seen.add(q);
//             allQuestions.push(q);
//             relatedForSeed.push(q);
//           }
//         }

//         if (relatedForSeed.length) {
//           relatedQuestionsMap.set(
//             seed,
//             (relatedQuestionsMap.get(seed) || []).concat(relatedForSeed).slice(0, 5)
//           );
//         }

//         // Related searches that look like questions
//         const questionSearches = result.relatedSearches
//           .map((r) => r.query)
//           .filter(
//             (q) =>
//               (q.includes("?") ||
//                 /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(q)) &&
//               !seen.has(q)
//           );

//         for (const q of questionSearches) {
//           seen.add(q);
//           allQuestions.push(q);
//         }

//         // Fallback: derive questions from organic results if no PAA/related
//         if (!paaQuestions.length && !questionSearches.length && result.organic?.length) {
//           const derivedFromOrganic: string[] = [];

//           for (const item of result.organic) {
//             const candidates = [item.title, item.snippet].filter(
//               (t): t is string => !!t
//             );
//             for (const text of candidates) {
//               const trimmed = text.trim();
//               if (
//                 trimmed.endsWith("?") ||
//                 /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(trimmed)
//               ) {
//                 if (!seen.has(trimmed)) {
//                   seen.add(trimmed);
//                   allQuestions.push(trimmed);
//                   derivedFromOrganic.push(trimmed);
//                 }
//               }
//             }
//           }

//           if (derivedFromOrganic.length) {
//             console.log(
//               `Expanded from seed "${seed}" with ${derivedFromOrganic.length} organic-derived questions`
//             );
//             relatedQuestionsMap.set(
//               seed,
//               (relatedQuestionsMap.get(seed) || []).concat(derivedFromOrganic).slice(0, 5)
//             );
//           }
//         }

//         await this.delay(200);
//       } catch (err: any) {
//         console.error(`Failed to expand from seed "${seed}":`, err.message);
//       }
//     }
//   }

//   private async generateQuestionsWithAI(
//     productName: string,
//     nicheContext: any,
//     count: number
//   ): Promise<string[]> {
//     const prompt = `Generate ${count * 2} realistic questions that people commonly search on Google about "${productName}".
// Focus on:
// - "People Also Ask" style questions
// - How-to questions
// - Comparison questions (vs, alternative)
// - Safety and side effects questions
// - Dosage/usage questions
// - Before/after and results questions
// Return ONLY a JSON array of question strings, nothing else:
// ["Question 1?", "Question 2?", ...]`;

//     try {
//       const response = await this.callAnyAI(prompt, 2000);
//       const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, "").trim());
//       return Array.isArray(parsed) ? parsed : [];
//     } catch (err) {
//       console.error("AI question generation failed (all providers):", err);
//       return [
//         `What is ${productName}?`,
//         `How to use ${productName}?`,
//         `${productName} benefits`,
//         `${productName} side effects`,
//         `${productName} dosage`,
//         `Is ${productName} safe?`,
//         `${productName} reviews`,
//         `${productName} results`,
//         `Best ${productName}`,
//         `${productName} before and after`,
//       ].slice(0, count);
//     }
//   }

//   // ===========================================================================
//   // HELPER METHODS
//   // ===========================================================================
//   private estimateSearchVolume(question: string): number {
//     const lower = question.toLowerCase();
//     if (lower.includes("what is") || lower.includes("how to")) return 2500;
//     if (lower.includes("best") || lower.includes("vs")) return 3500;
//     if (lower.includes("side effects") || lower.includes("safe")) return 2000;
//     if (lower.includes("dosage") || lower.includes("results")) return 1500;
//     return 1000;
//   }

//   private estimateDifficulty(question: string): number {
//     const lower = question.toLowerCase();
//     if (lower.includes("buy") || lower.includes("best")) return 55;
//     if (lower.includes("review") || lower.includes("vs")) return 50;
//     if (lower.includes("how to") || lower.includes("what is")) return 40;
//     return 35;
//   }

//   private determineTrend(monthlySearches?: any[]): "rising" | "stable" | "declining" {
//     if (!monthlySearches || monthlySearches.length < 6) return "stable";

//     const recent =
//       monthlySearches
//         .slice(0, 3)
//         .reduce((a, b) => a + (b.search_volume || 0), 0) / 3;
//     const older =
//       monthlySearches
//         .slice(3, 6)
//         .reduce((a, b) => a + (b.search_volume || 0), 0) / 3;

//     if (older === 0) return "stable";
//     if (recent > older * 1.2) return "rising";
//     if (recent < older * 0.8) return "declining";
//     return "stable";
//   }

//   private classifyIntent(
//     question: string
//   ): "informational" | "commercial" | "transactional" | "navigational" {
//     const lower = question.toLowerCase();

//     if (
//       lower.includes("buy") ||
//       lower.includes("price") ||
//       lower.includes("order") ||
//       lower.includes("discount")
//     ) {
//       return "transactional";
//     }

//     if (
//       lower.includes("best") ||
//       lower.includes("vs") ||
//       lower.includes("review") ||
//       lower.includes("compare")
//     ) {
//       return "commercial";
//     }

//     if (
//       lower.includes("website") ||
//       lower.includes("login") ||
//       lower.includes("official")
//     ) {
//       return "navigational";
//     }

//     return "informational";
//   }

//   private getDefaultNicheContext(niche: string) {
//     return {
//       industry: niche.charAt(0).toUpperCase() + niche.slice(1),
//       searchQueries: ["benefits", "side effects", "how to use", "reviews", "best", "vs"],
//       audienceProfile: "General consumers",
//     };
//   }

//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   // ===========================================================================
//   // BLOG GENERATION
//   // ===========================================================================
//   async generateBlogFromQuestion(params: BlogGenerationParams): Promise<GeneratedBlog> {
//     const prompt = this.buildBlogPrompt(params);

//     try {
//       const response = await this.callAnyAI(prompt, 8000);
//       const parsed = this.parseJsonResponse(response);

//       const textContent = (parsed.content || "")
//         .replace(/<[^>]*>/g, " ")
//         .replace(/\s+/g, " ")
//         .trim();

//       const wordCount = textContent
//         .split(" ")
//         .filter((w: string) => w.length > 0).length;

//       const seoScore = this.calculateSeoScore(
//         parsed.title,
//         parsed.metaDescription,
//         parsed.content,
//         params.question
//       );

//       const blog: GeneratedBlog = {
//         id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//         questionId: params.questionId,
//         title: parsed.title || `Guide: ${params.question}`,
//         content: parsed.content || "",
//         wordCount,
//         faqs: parsed.faqs || [],
//         metaDescription: parsed.metaDescription || "",
//         seoScore,
//         status: "draft",
//         createdAt: new Date(),
//         userId: params.userId,
//       };

//       console.log(
//         `✅ Generated blog: "${blog.title}" (${wordCount} words, SEO: ${seoScore}%)`
//       );

//       return blog;
//     } catch (error: any) {
//       console.error("❌ Blog generation failed:", error.message);
//       throw new Error(`Failed to generate blog: ${error.message}`);
//     }
//   }

//   private buildBlogPrompt(params: BlogGenerationParams): string {
//     return `You are an expert content writer specializing in SEO-optimized blog articles.
// Write a comprehensive blog post answering: "${params.question}"
// Product/Topic: ${params.productName}
// Target Word Count: ${params.targetWordCount} words
// Tone: ${params.tone}
// ${
//   params.includeProductSection
//     ? "Include [PRODUCT SECTION] placeholder for product recommendations."
//     : ""
// }
// REQUIRED STRUCTURE:
// 1. SEO Title (60-70 characters)
// 2. Meta Description (150-160 characters)
// 3. Introduction (150-200 words) - Hook + preview
// 4. Main Content (${params.targetWordCount - 500} words) - 4-6 H2 sections with actionable info
// 5. Expert Tips - 3-5 actionable tips
// 6. Conclusion - Summary + CTA
// ${
//   params.includeFAQ
//     ? `7. FAQ Section - EXACTLY ${params.faqCount} FAQs with thorough answers`
//     : ""
// }
// Use semantic HTML (h2, h3, p, ul, li). Include [IMAGE: description] placeholders.
// Return ONLY this JSON:
// {
//   "title": "SEO title here",
//   "metaDescription": "Meta description here",
//   "content": "<article>HTML content here</article>",
//   "faqs": [{"question": "Q1?", "answer": "A1"}, ...]
// }`;
//   }

//   // Wrapper used by routes: generateBlog({...}) WITHOUT userId
//   async generateBlog(params: {
//     questionId: string;
//     question: string;
//     productName: string;
//     targetWordCount: number;
//     includeFAQ: boolean;
//     faqCount: number;
//     tone: string;
//     includeProductSection: boolean;
//     aiProvider: "openai" | "anthropic" | "gemini";
//   }): Promise<GeneratedBlog> {
//     const fullParams: BlogGenerationParams = {
//       ...params,
//       userId: "temp-user", // real userId is applied in saveBlog()
//     };
//     return this.generateBlogFromQuestion(fullParams);
//   }

//   // ===========================================================================
//   // STORAGE METHODS (RESEARCH)
//   // ===========================================================================
//   async getSavedResearch(userId: string): Promise<SavedResearchSession[]> {
//     return this.savedResearch.get(userId) || [];
//   }

//   async getSavedResearchSessions(userId: string): Promise<SavedResearchSession[]> {
//     return this.getSavedResearch(userId);
//   }

//   async saveResearchSession(
//     userId: string,
//     name: string,
//     niche: string,
//     products: string[],
//     questions: ResearchedQuestion[],
//     locations?: any
//   ): Promise<SavedResearchSession> {
//     const session: SavedResearchSession = {
//       id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//       name,
//       niche,
//       products,
//       questions,
//       createdAt: new Date(),
//       userId,
//     };

//     const userSessions = this.savedResearch.get(userId) || [];
//     userSessions.unshift(session);
//     this.savedResearch.set(userId, userSessions);

//     return session;
//   }

//   async deleteResearchSession(userId: string, researchId: string): Promise<boolean> {
//     const userSessions = this.savedResearch.get(userId) || [];
//     const originalLength = userSessions.length;
//     const filtered = userSessions.filter((s) => s.id !== researchId);
//     this.savedResearch.set(userId, filtered);
//     return filtered.length !== originalLength;
//   }

//   async getQuestionsBySession(
//     userId: string,
//     researchId: string
//   ): Promise<ResearchedQuestion[]> {
//     const userSessions = this.savedResearch.get(userId) || [];
//     const session = userSessions.find((s) => s.id === researchId);
//     return session?.questions || [];
//   }

//   async saveQuestions(
//     userId: string,
//     questions: ResearchedQuestion[]
//   ): Promise<ResearchedQuestion[]> {
//     const sessionName = "Auto-saved questions";
//     const userSessions = this.savedResearch.get(userId) || [];
//     let session = userSessions.find((s) => s.name === sessionName);

//     if (!session) {
//       session = {
//         id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
//         name: sessionName,
//         niche: "custom",
//         products: Array.from(new Set(questions.map((q) => q.productName))),
//         questions: [],
//         createdAt: new Date(),
//         userId,
//       };
//       userSessions.unshift(session);
//       this.savedResearch.set(userId, userSessions);
//     }

//     session.questions.push(...questions);
//     return questions;
//   }

//   // ===========================================================================
//   // STORAGE METHODS (BLOGS)
//   // ===========================================================================
//   async getGeneratedBlogs(userId: string): Promise<GeneratedBlog[]> {
//     return this.generatedBlogs.get(userId) || [];
//   }

//   async getBlogsByUser(userId: string): Promise<GeneratedBlog[]> {
//     return this.getGeneratedBlogs(userId);
//   }

//   async getBlogById(userId: string, blogId: string): Promise<GeneratedBlog | null> {
//     const userBlogs = this.generatedBlogs.get(userId) || [];
//     return userBlogs.find((b) => b.id === blogId) || null;
//   }

//   async updateBlog(
//     userId: string,
//     blogId: string,
//     updates: Partial<GeneratedBlog>
//   ): Promise<GeneratedBlog | null> {
//     const userBlogs = this.generatedBlogs.get(userId) || [];
//     const index = userBlogs.findIndex((b) => b.id === blogId);
//     if (index === -1) return null;

//     userBlogs[index] = { ...userBlogs[index], ...updates };
//     this.generatedBlogs.set(userId, userBlogs);
//     return userBlogs[index];
//   }

//   async deleteBlog(userId: string, blogId: string): Promise<boolean> {
//     const userBlogs = this.generatedBlogs.get(userId) || [];
//     const originalLength = userBlogs.length;
//     const filtered = userBlogs.filter((b) => b.id !== blogId);
//     this.generatedBlogs.set(userId, filtered);
//     return filtered.length !== originalLength;
//   }

//   private saveBlogToStorage(blog: GeneratedBlog): void {
//     const userBlogs = this.generatedBlogs.get(blog.userId) || [];
//     userBlogs.unshift(blog);
//     this.generatedBlogs.set(blog.userId, userBlogs);
//   }

//   async saveBlog(
//     userId: string,
//     blog: GeneratedBlog,
//     questionId: string
//   ): Promise<GeneratedBlog> {
//     const stored: GeneratedBlog = {
//       ...blog,
//       userId,
//       questionId,
//     };
//     this.saveBlogToStorage(stored);
//     return stored;
//   }

//   async trackBlogDownload(
//     userId: string,
//     blogId: string,
//     format: string
//   ): Promise<void> {
//     const userBlogs = this.generatedBlogs.get(userId) || [];
//     const index = userBlogs.findIndex((b) => b.id === blogId);
//     if (index !== -1) {
//       userBlogs[index].status = "downloaded";
//       this.generatedBlogs.set(userId, userBlogs);
//     }
//   }

//   // ===========================================================================
//   // EXPORT METHODS
//   // ===========================================================================
//   convertToMarkdown(blog: GeneratedBlog): string {
//     let markdown = `# ${blog.title}\n\n*${blog.metaDescription}*\n\n---\n\n`;

//     let content = blog.content
//       .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n\n")
//       .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n\n")
//       .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
//       .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
//       .replace(/<em>(.*?)<\/em>/gi, "*$1*")
//       .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
//       .replace(/<ul[^>]*>|<\/ul>/gi, "\n")
//       .replace(/<ol[^>]*>|<\/ol>/gi, "\n")
//       .replace(/<[^>]+>/g, "")
//       .replace(/\n{3,}/g, "\n\n");

//     markdown += content;

//     if (blog.faqs?.length > 0) {
//       markdown += "\n\n## Frequently Asked Questions\n\n";
//       blog.faqs.forEach((faq) => {
//         markdown += `### ${faq.question}\n\n${faq.answer}\n\n`;
//       });
//     }

//     return markdown;
//   }

//   convertToFullHtml(blog: GeneratedBlog): string {
//     let faqHtml = "";
//     if (blog.faqs?.length > 0) {
//       faqHtml = `<section class="faq-section"><h2>Frequently Asked Questions</h2>${blog.faqs
//         .map(
//           (faq) =>
//             `<div class="faq-item"><h3>${faq.question}</h3><p>${faq.answer}</p></div>`
//         )
//         .join("")}</section>`;
//     }

//     return `<!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8">
// <meta name="viewport" content="width=device-width, initial-scale=1.0">
// <meta name="description" content="${this.escapeHtml(blog.metaDescription)}">
// <title>${this.escapeHtml(blog.title)}</title>
// <style>
// body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.8;max-width:800px;margin:0 auto;padding:40px 20px;color:#333}
// h1{font-size:2.5em;margin-bottom:.5em;color:#1a1a1a}
// h2{font-size:1.75em;margin-top:2em;border-bottom:2px solid #eee;padding-bottom:.3em}
// h3{font-size:1.25em;margin-top:1.5em}
// .meta-info{color:#666;font-size:.9em;margin-bottom:2em;padding-bottom:1em;border-bottom:1px solid #eee}
// .faq-section{background:#f9f9f9;padding:2em;border-radius:8px;margin-top:3em}
// .faq-item{margin-bottom:1.5em;padding-bottom:1.5em;border-bottom:1px solid #ddd}
// .faq-item:last-child{border-bottom:none}
// .faq-item h3{color:#7c3aed;margin-top:0}
// </style>
// </head>
// <body>
// <article>
// <h1>${this.escapeHtml(blog.title)}</h1>
// <div class="meta-info">📝 ${blog.wordCount.toLocaleString()} words • 📊 SEO: ${
//       blog.seoScore
//     }% • 📅 ${new Date(blog.createdAt).toLocaleDateString()}</div>
// ${blog.content}
// ${faqHtml}
// </article>
// </body>
// </html>`;
//   }

//   async convertToDocx(blog: GeneratedBlog): Promise<Buffer> {
//     const children: Paragraph[] = [
//       new Paragraph({
//         text: blog.title,
//         heading: HeadingLevel.HEADING_1,
//         spacing: { after: 400 },
//       }),
//       new Paragraph({
//         children: [
//           new TextRun({
//             text: blog.metaDescription,
//             italics: true,
//             color: "666666",
//           }),
//         ],
//         spacing: { after: 400 },
//       }),
//       new Paragraph({
//         children: [
//           new TextRun({
//             text: `Words: ${blog.wordCount} | SEO: ${blog.seoScore}%`,
//             size: 20,
//             color: "888888",
//           }),
//         ],
//         spacing: { after: 600 },
//       }),
//     ];

//     const contentText = blog.content
//       .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n[H2]$1[/H2]\n")
//       .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n[H3]$1[/H3]\n")
//       .replace(/<p[^>]*>(.*?)<\/p>/gi, "[P]$1[/P]\n")
//       .replace(/<li>(.*?)<\/li>/gi, "[LI]$1[/LI]\n")
//       .replace(/<[^>]+>/g, "");

//     for (const section of contentText.split(/\n+/).filter((s) => s.trim())) {
//       const trimmed = section.trim();

//       if (trimmed.startsWith("[H2]")) {
//         children.push(
//           new Paragraph({
//             text: trimmed.replace("[H2]", "").replace("[/H2]", ""),
//             heading: HeadingLevel.HEADING_2,
//             spacing: { before: 400, after: 200 },
//           })
//         );
//       } else if (trimmed.startsWith("[H3]")) {
//         children.push(
//           new Paragraph({
//             text: trimmed.replace("[H3]", "").replace("[/H3]", ""),
//             heading: HeadingLevel.HEADING_3,
//             spacing: { before: 300, after: 150 },
//           })
//         );
//       } else if (trimmed.startsWith("[LI]")) {
//         children.push(
//           new Paragraph({
//             text: `• ${trimmed.replace("[LI]", "").replace("[/LI]", "")}`,
//             spacing: { after: 100 },
//           })
//         );
//       } else if (trimmed.startsWith("[P]")) {
//         children.push(
//           new Paragraph({
//             text: trimmed.replace("[P]", "").replace("[/P]", ""),
//             spacing: { after: 200 },
//           })
//         );
//       }
//     }

//     if (blog.faqs?.length > 0) {
//       children.push(
//         new Paragraph({
//           text: "Frequently Asked Questions",
//           heading: HeadingLevel.HEADING_2,
//           spacing: { before: 600, after: 300 },
//         })
//       );

//       for (const faq of blog.faqs) {
//         children.push(
//           new Paragraph({
//             text: faq.question,
//             heading: HeadingLevel.HEADING_3,
//             spacing: { before: 200, after: 100 },
//           }),
//           new Paragraph({ text: faq.answer, spacing: { after: 200 } })
//         );
//       }
//     }

//     const doc = new Document({ sections: [{ children }] });
//     return await Packer.toBuffer(doc);
//   }

//   async exportBlogToDocx(blog: GeneratedBlog): Promise<Buffer> {
//     return this.convertToDocx(blog);
//   }

//   // ===========================================================================
//   // PRIVATE HELPERS (AI calls, SEO, etc.)
//   // ===========================================================================
//   private async callAnyAI(prompt: string, maxTokens: number = 4000): Promise<string> {
//     const providers: Array<"anthropic" | "openai" | "gemini"> = [];
//     if (this.anthropic) providers.push("anthropic");
//     if (this.openai) providers.push("openai");
//     if (this.gemini) providers.push("gemini");

//     if (providers.length === 0) {
//       throw new Error("No AI provider available (Anthropic/OpenAI/Gemini all missing)");
//     }

//     let lastError: any = null;

//     for (const provider of providers) {
//       try {
//         console.log(`🤖 callAnyAI: trying ${provider}...`);
//         return await this.callAI(prompt, provider, maxTokens);
//       } catch (err: any) {
//         console.error(`callAnyAI: ${provider} failed:`, err?.message || err);
//         lastError = err;
//       }
//     }

//     throw lastError || new Error("All AI providers failed");
//   }

//   private async callAI(
//     prompt: string,
//     provider: "openai" | "anthropic" | "gemini",
//     maxTokens: number = 4000
//   ): Promise<string> {
//     if (provider === "anthropic" && this.anthropic) {
//       const result = await this.anthropic.messages.create({
//         model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
//         max_tokens: maxTokens,
//         messages: [{ role: "user", content: prompt }],
//       });
//       return (result.content[0] as any).text;
//     }

//     if (provider === "openai" && this.openai) {
//       const result = await this.openai.chat.completions.create({
//         model: "gpt-4o",
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: maxTokens,
//       });
//       return result.choices[0].message.content || "";
//     }

//     if (provider === "gemini" && this.gemini) {
//       const model = this.gemini.getGenerativeModel({
//         model: "gemini-flash-latest",
//       });
//       const result = await model.generateContent(prompt);
//       return result.response.text();
//     }

//     // Fallback if provider string doesn't match but anthropic is available
//     if (this.anthropic) {
//       const result = await this.anthropic.messages.create({
//         model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
//         max_tokens: maxTokens,
//         messages: [{ role: "user", content: prompt }],
//       });
//       return (result.content[0] as any).text;
//     }

//     throw new Error("No AI provider available");
//   }

//   private parseJsonResponse(response: string): any {
//     const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
//     try {
//       return JSON.parse(cleaned);
//     } catch (error) {
//       console.error("JSON parse failed:", cleaned.substring(0, 200));
//       throw new Error("Failed to parse AI response");
//     }
//   }

//   private calculateSeoScore(
//     title: string,
//     meta: string,
//     content: string,
//     keyword: string
//   ): number {
//     let score = 0;
//     const kw = keyword.toLowerCase().split(" ")[0];

//     if (title?.length >= 50 && title?.length <= 70) score += 10;
//     if (title?.toLowerCase().includes(kw)) score += 15;

//     if (meta?.length >= 140 && meta?.length <= 160) score += 10;
//     if (meta?.toLowerCase().includes(kw)) score += 10;

//     if (content) {
//       const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).length;
//       if (words >= 1500) score += 10;
//       if (words >= 2000) score += 5;

//       const h2s = (content.match(/<h2/g) || []).length;
//       if (h2s >= 3 && h2s <= 10) score += 10;

//       if (content.includes("<ul") || content.includes("<ol")) score += 5;
//       if (content.includes("[IMAGE:")) score += 5;

//       const kwMatches = (content.toLowerCase().match(new RegExp(kw, "g")) || []).length;
//       if (kwMatches >= 3 && kwMatches <= 15) score += 15;
//     }

//     return Math.min(100, Math.max(0, score));
//   }

//   private escapeHtml(text: string): string {
//     return text
//       .replace(/&/g, "&amp;")
//       .replace(/</g, "&lt;")
//       .replace(/>/g, "&gt;")
//       .replace(/"/g, "&quot;");
//   }
// }

// export const highIntentService = new HighIntentService();
// export default highIntentService;




import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import axios from "axios";

// =============================================================================
// TYPES
// =============================================================================
export interface ResearchedQuestion {
  id: string;
  productId: string;
  productName: string;
  question: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  popularity: "high" | "medium" | "low";
  region: string;
  relatedQuestions: string[];
  source: string;
  trend: "rising" | "stable" | "declining";
  intent: "informational" | "commercial" | "transactional" | "navigational";
  estimatedClicks: number;
  lastUpdated: Date;
}

export interface BlogGenerationParams {
  questionId: string;
  question: string;
  productName: string;
  targetWordCount: number;
  includeFAQ: boolean;
  faqCount: number;
  aiProvider: "openai" | "anthropic" | "gemini";
  tone: string;
  includeProductSection: boolean;
  userId: string;
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
  userId: string;
}

export interface SavedResearchSession {
  id: string;
  name: string;
  niche: string;
  products: string[];
  questions: ResearchedQuestion[];
  createdAt: Date;
  userId: string;
}

// =============================================================================
// SEO DATA API CLIENTS
// =============================================================================
class SerperClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<{
    peopleAlsoAsk: Array<{ question: string; snippet: string; link: string }>;
    relatedSearches: Array<{ query: string }>;
    organic: Array<{ title?: string; snippet?: string; link?: string }>;
  }> {
    try {
      const response = await axios.post(
        "https://google.serper.dev/search",
        {
          q: query,
          gl: "us",
          hl: "en",
          num: 10,
        },
        {
          headers: {
            "X-API-KEY": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data || {};
      console.log("Serper raw keys:", Object.keys(data));

      // Surface any error payloads returned with 200
      if (data.error || data.status === "error" || data.message) {
        console.error("Serper reported error payload:", JSON.stringify(data, null, 2));
        return { peopleAlsoAsk: [], relatedSearches: [], organic: [] };
      }

      const peopleAlsoAsk = data.peopleAlsoAsk || [];
      const relatedSearches = data.relatedSearches || [];
      const organic = data.organic || [];

      console.log(
        `Serper search("${query}") => PAA: ${peopleAlsoAsk.length}, Related: ${relatedSearches.length}, Organic: ${organic.length}`
      );

      if (!peopleAlsoAsk.length && !relatedSearches.length && organic.length) {
        console.log(
          `Serper returned ${organic.length} organic results for "${query}" but no PAA/relatedSearches`
        );
      }

      return {
        peopleAlsoAsk,
        relatedSearches,
        organic,
      };
    } catch (error: any) {
      if (error.response) {
        console.error(
          `Serper search failed for "${query}":`,
          error.message,
          "status:",
          error.response.status,
          "data:",
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        console.error(`Serper search failed for "${query}":`, error.message);
      }
      return { peopleAlsoAsk: [], relatedSearches: [], organic: [] };
    }
  }
}

class DataForSEOClient {
  private auth: string;

  constructor(login: string, password: string) {
    this.auth = Buffer.from(`${login}:${password}`).toString("base64");
  }

  async getKeywordMetrics(
    keywords: string[]
  ): Promise<
    Map<
      string,
      {
        searchVolume: number;
        cpc: number;
        competition: number;
        monthlySearches: Array<{ year: number; month: number; search_volume: number }>;
      }
    >
  > {
    const results = new Map();
    if (keywords.length === 0) return results;

    try {
      const response = await axios.post(
        "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
        [
          {
            keywords: keywords.slice(0, 700),
            location_name: "United States",
            language_name: "English",
          },
        ],
        {
          headers: {
            Authorization: `Basic ${this.auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      const items = response.data?.tasks?.[0]?.result || [];
      for (const item of items) {
        results.set(item.keyword?.toLowerCase(), {
          searchVolume: item.search_volume || 0,
          cpc: item.cpc || 0,
          competition: item.competition || 0,
          monthlySearches: item.monthly_searches || [],
        });
      }
    } catch (error: any) {
      console.error("DataForSEO request failed:", error.message);
    }

    return results;
  }

  async getKeywordDifficulty(keywords: string[]): Promise<Map<string, number>> {
    const results = new Map();
    if (keywords.length === 0) return results;

    try {
      const response = await axios.post(
        "https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
        [
          {
            keywords: keywords.slice(0, 1000),
            location_code: 2840,
            language_code: "en",
          },
        ],
        {
          headers: {
            Authorization: `Basic ${this.auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      const items = response.data?.tasks?.[0]?.result || [];
      for (const item of items) {
        if (item.keyword && item.keyword_difficulty !== undefined) {
          results.set(item.keyword.toLowerCase(), item.keyword_difficulty);
        }
      }
    } catch (error: any) {
      console.error("DataForSEO difficulty request failed:", error.message);
    }

    return results;
  }
}

// =============================================================================
// NICHE CONTEXTS
// =============================================================================
const NICHE_CONTEXTS: Record<
  string,
  {
    industry: string;
    searchQueries: string[];
    audienceProfile: string;
  }
> = {
  peptides: {
    industry: "Health & Performance Enhancement",
    searchQueries: [
      "benefits",
      "side effects",
      "dosage",
      "how to use",
      "results",
      "before and after",
      "reviews",
      "vs",
    ],
    audienceProfile: "Researchers, biohackers, bodybuilders, anti-aging enthusiasts",
  },
  supplements: {
    industry: "Health & Nutrition",
    searchQueries: [
      "benefits",
      "side effects",
      "dosage",
      "when to take",
      "best",
      "vs",
      "reviews",
      "natural",
    ],
    audienceProfile: "Health-conscious consumers, athletes, wellness seekers",
  },
  skincare: {
    industry: "Beauty & Cosmetics",
    searchQueries: [
      "how to use",
      "benefits",
      "before and after",
      "reviews",
      "for acne",
      "for wrinkles",
      "vs",
    ],
    audienceProfile: "Beauty enthusiasts, skincare beginners",
  },
  ecommerce: {
    industry: "E-commerce & Online Retail",
    searchQueries: ["review", "vs", "best", "price", "where to buy", "alternative", "worth it"],
    audienceProfile: "Online shoppers, comparison shoppers",
  },
};

// =============================================================================
// HIGH INTENT SERVICE CLASS
// =============================================================================
class HighIntentService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private serper: SerperClient | null = null;
  private dataForSEO: DataForSEOClient | null = null;

  // In-memory storage (replace with database in production)
  private savedResearch: Map<string, SavedResearchSession[]> = new Map();
  private generatedBlogs: Map<string, GeneratedBlog[]> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      console.log("✅ Anthropic AI initialized");
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("✅ OpenAI initialized");
    }

    if (process.env.GOOGLE_GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      console.log("✅ Google Gemini initialized");
    }

    if (process.env.SERPER_API_KEY) {
      this.serper = new SerperClient(process.env.SERPER_API_KEY);
      console.log("✅ Serper.dev initialized (Real Google PAA data)");
    }

    if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
      this.dataForSEO = new DataForSEOClient(
        process.env.DATAFORSEO_LOGIN,
        process.env.DATAFORSEO_PASSWORD
      );
      console.log("✅ DataForSEO initialized (Real search volume data)");
    }

    if (!this.serper && !this.dataForSEO) {
      console.warn("⚠️ No SEO data APIs configured. Using AI-estimated metrics.");
      console.warn(
        "   For real data, add SERPER_API_KEY and/or DATAFORSEO_LOGIN/PASSWORD to .env"
      );
    }
  }

  // ===========================================================================
  // RESEARCH METHODS
  // ===========================================================================
  async researchProductQuestions(
    productName: string,
    niche: string,
    questionsCount: number,
    locations?: any // currently unused, kept for compatibility with routes
  ): Promise<ResearchedQuestion[]> {
    console.log(`\n🔍 Researching "${productName}" in ${niche} niche...`);

    const nicheContext = NICHE_CONTEXTS[niche] || this.getDefaultNicheContext(niche);
    const allQuestions: string[] = [];
    const relatedQuestionsMap: Map<string, string[]> = new Map();
    let usedFallbackQuestions = false;

    if (this.serper) {
      console.log("📡 Fetching real 'People Also Ask' data from Google...");

      const searchQueries = [
        productName,
        `what is ${productName}`,
        ...nicheContext.searchQueries.slice(0, 4).map((q) => `${productName} ${q}`),
      ];

      for (const query of searchQueries) {
        try {
          const result = await this.serper.search(query);

          // Primary: PAA questions
          const paaQuestions = result.peopleAlsoAsk.map((paa) => paa.question);

          // Fallback: derive question-like text from organic results when PAA empty
          if (paaQuestions.length === 0 && result.organic && result.organic.length > 0) {
            const derivedQuestions: string[] = [];

            for (const item of result.organic) {
              const candidates = [item.title, item.snippet].filter(
                (t): t is string => !!t
              );
              for (const text of candidates) {
                const trimmed = text.trim();
                if (
                  trimmed.endsWith("?") ||
                  /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(trimmed)
                ) {
                  derivedQuestions.push(trimmed);
                }
              }
            }

            if (derivedQuestions.length) {
              console.log(
                `Derived ${derivedQuestions.length} question-like queries from organic results for "${query}"`
              );
              allQuestions.push(...derivedQuestions);
            }
          }

          allQuestions.push(...paaQuestions);

          paaQuestions.forEach((q) => {
            relatedQuestionsMap.set(
              q,
              paaQuestions.filter((rq) => rq !== q).slice(0, 3)
            );
          });

          // Related searches that look like questions and include the product name
          const questionSearches = result.relatedSearches
            .map((r) => r.query)
            .filter(
              (q) =>
                q.toLowerCase().includes(productName.toLowerCase()) &&
                (q.includes("?") ||
                  /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(q))
            );

          allQuestions.push(...questionSearches);

          await this.delay(200);
        } catch (err: any) {
          console.error(`Failed to search "${query}":`, err.message);
        }
      }

      console.log(`✅ Found ${allQuestions.length} real questions from Google (incl. organic-derived)`);

      // Try to expand by searching PAA questions themselves
      if (allQuestions.length > 0 && allQuestions.length < questionsCount) {
        console.log("🔄 Expanding PAA by searching PAA-derived questions themselves...");
        const seeds = Array.from(new Set(allQuestions)).slice(0, 5);
        await this.expandPAAWithSerper(seeds, allQuestions, relatedQuestionsMap);
        console.log(`✅ After expansion: ${allQuestions.length} questions`);
      }

      if (allQuestions.length === 0) {
        console.log(
          "⚠️ Serper returned no PAA/related (or organic-question) results. Falling back to AI-generated questions..."
        );
        const aiQuestions = await this.generateQuestionsWithAI(
          productName,
          nicheContext,
          questionsCount
        );
        allQuestions.push(...aiQuestions);
        usedFallbackQuestions = true;
      }
    } else {
      console.log("⚠️ Serper not configured. Using AI-generated questions...");
      const aiQuestions = await this.generateQuestionsWithAI(
        productName,
        nicheContext,
        questionsCount
      );
      allQuestions.push(...aiQuestions);
      usedFallbackQuestions = true;
    }

    const uniqueQuestions = Array.from(new Set(allQuestions))
      .filter((q) => q && q.length > 10)
      .slice(0, questionsCount * 2);

    let keywordMetrics = new Map<string, any>();
    let keywordDifficulty = new Map<string, number>();

    if (this.dataForSEO && uniqueQuestions.length > 0) {
      console.log("📊 Fetching real search volume from DataForSEO...");
      try {
        keywordMetrics = await this.dataForSEO.getKeywordMetrics(uniqueQuestions);
        keywordDifficulty = await this.dataForSEO.getKeywordDifficulty(uniqueQuestions);
        console.log(`✅ Got metrics for ${keywordMetrics.size} keywords`);
      } catch (err: any) {
        console.error("Failed to get keyword metrics:", err.message);
      }
    }

    const questions: ResearchedQuestion[] = [];

    for (let i = 0; i < uniqueQuestions.length && questions.length < questionsCount; i++) {
      const questionText = uniqueQuestions[i];
      const metrics = keywordMetrics.get(questionText.toLowerCase());
      const difficulty = keywordDifficulty.get(questionText.toLowerCase());

      const searchVolume =
        metrics?.searchVolume || this.estimateSearchVolume(questionText);
      const kwDifficulty =
        difficulty ??
        (metrics ? Math.round(metrics.competition * 100) : this.estimateDifficulty(questionText));
      const cpc = metrics?.cpc || 0;
      const competition = metrics?.competition || 0.5;

      // If we have real metrics and the term is basically dead, skip it
      if (metrics && searchVolume < 10) continue;

      const isRealMetrics = !!metrics;
      let source: string;

      if (usedFallbackQuestions) {
        source = isRealMetrics
          ? "AI / fallback questions + DataForSEO metrics"
          : "AI / fallback questions (estimated metrics)";
      } else {
        source = isRealMetrics
          ? "Google SERP + DataForSEO (Real Data)"
          : "Google SERP (Estimated Metrics)";
      }

      questions.push({
        id: `q-${productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${i}`,
        productId: `prod-${productName.toLowerCase().replace(/\s+/g, "-")}`,
        productName,
        question: questionText,
        searchVolume,
        difficulty: kwDifficulty,
        cpc,
        competition: competition < 0.33 ? "low" : competition < 0.66 ? "medium" : "high",
        popularity: searchVolume > 5000 ? "high" : searchVolume > 1000 ? "medium" : "low",
        region: "United States",
        relatedQuestions: relatedQuestionsMap.get(questionText) || [],
        source,
        trend: this.determineTrend(metrics?.monthlySearches),
        intent: this.classifyIntent(questionText),
        estimatedClicks: Math.floor(searchVolume * 0.03),
        lastUpdated: new Date(),
      });
    }

    questions.sort((a, b) => b.searchVolume - a.searchVolume);
    console.log(`✅ Returning ${questions.length} questions for "${productName}"\n`);

    return questions.slice(0, questionsCount);
  }

  async bulkResearchQuestions(
    products: string[],
    niche: string,
    questionsPerProduct: number,
    locations?: any
  ): Promise<ResearchedQuestion[]> {
    const allQuestions: ResearchedQuestion[] = [];

    console.log(`\n🚀 Starting bulk research for ${products.length} products...`);
    console.log(`   Questions per product: ${questionsPerProduct}`);
    console.log(
      `   Total expected: ~${products.length * questionsPerProduct} questions\n`
    );

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] Processing: ${product}`);

      try {
        const questions = await this.researchProductQuestions(
          product,
          niche,
          questionsPerProduct,
          locations
        );
        allQuestions.push(...questions);
      } catch (err: any) {
        console.error(`❌ Failed to research "${product}":`, err.message);
      }

      if (i < products.length - 1) {
        await this.delay(1500);
      }
    }

    console.log(`\n✅ Bulk research complete!`);
    console.log(`   Products processed: ${products.length}`);
    console.log(`   Total questions: ${allQuestions.length}\n`);

    return allQuestions;
  }

  private async expandPAAWithSerper(
    seedQuestions: string[],
    allQuestions: string[],
    relatedQuestionsMap: Map<string, string[]>
  ): Promise<void> {
    if (!this.serper) return;

    const seen = new Set(allQuestions);

    for (const seed of seedQuestions) {
      try {
        const result = await this.serper.search(seed);

        const paaQuestions = result.peopleAlsoAsk.map((paa) => paa.question);
        const relatedForSeed: string[] = [];

        // Add new PAA questions
        for (const q of paaQuestions) {
          if (!seen.has(q)) {
            seen.add(q);
            allQuestions.push(q);
            relatedForSeed.push(q);
          }
        }

        if (relatedForSeed.length) {
          relatedQuestionsMap.set(
            seed,
            (relatedQuestionsMap.get(seed) || []).concat(relatedForSeed).slice(0, 5)
          );
        }

        // Related searches that look like questions
        const questionSearches = result.relatedSearches
          .map((r) => r.query)
          .filter(
            (q) =>
              (q.includes("?") ||
                /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(q)) &&
              !seen.has(q)
          );

        for (const q of questionSearches) {
          seen.add(q);
          allQuestions.push(q);
        }

        // Fallback: derive questions from organic results if no PAA/related
        if (!paaQuestions.length && !questionSearches.length && result.organic?.length) {
          const derivedFromOrganic: string[] = [];

          for (const item of result.organic) {
            const candidates = [item.title, item.snippet].filter(
              (t): t is string => !!t
            );
            for (const text of candidates) {
              const trimmed = text.trim();
              if (
                trimmed.endsWith("?") ||
                /^(how|what|why|when|where|is|can|does|do|should)\b/i.test(trimmed)
              ) {
                if (!seen.has(trimmed)) {
                  seen.add(trimmed);
                  allQuestions.push(trimmed);
                  derivedFromOrganic.push(trimmed);
                }
              }
            }
          }

          if (derivedFromOrganic.length) {
            console.log(
              `Expanded from seed "${seed}" with ${derivedFromOrganic.length} organic-derived questions`
            );
            relatedQuestionsMap.set(
              seed,
              (relatedQuestionsMap.get(seed) || []).concat(derivedFromOrganic).slice(0, 5)
            );
          }
        }

        await this.delay(200);
      } catch (err: any) {
        console.error(`Failed to expand from seed "${seed}":`, err.message);
      }
    }
  }

  private async generateQuestionsWithAI(
    productName: string,
    nicheContext: any,
    count: number
  ): Promise<string[]> {
    const prompt = `Generate ${count * 2} realistic questions that people commonly search on Google about "${productName}".
Focus on:
- "People Also Ask" style questions
- How-to questions
- Comparison questions (vs, alternative)
- Safety and side effects questions
- Dosage/usage questions
- Before/after and results questions
Return ONLY a JSON array of question strings, nothing else:
["Question 1?", "Question 2?", ...]`;

    try {
      const response = await this.callAnyAI(prompt, 2000);
      const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, "").trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("AI question generation failed (all providers):", err);
      return [
        `What is ${productName}?`,
        `How to use ${productName}?`,
        `${productName} benefits`,
        `${productName} side effects`,
        `${productName} dosage`,
        `Is ${productName} safe?`,
        `${productName} reviews`,
        `${productName} results`,
        `Best ${productName}`,
        `${productName} before and after`,
      ].slice(0, count);
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================
  private estimateSearchVolume(question: string): number {
    const lower = question.toLowerCase();
    if (lower.includes("what is") || lower.includes("how to")) return 2500;
    if (lower.includes("best") || lower.includes("vs")) return 3500;
    if (lower.includes("side effects") || lower.includes("safe")) return 2000;
    if (lower.includes("dosage") || lower.includes("results")) return 1500;
    return 1000;
  }

  private estimateDifficulty(question: string): number {
    const lower = question.toLowerCase();
    if (lower.includes("buy") || lower.includes("best")) return 55;
    if (lower.includes("review") || lower.includes("vs")) return 50;
    if (lower.includes("how to") || lower.includes("what is")) return 40;
    return 35;
  }

  private determineTrend(monthlySearches?: any[]): "rising" | "stable" | "declining" {
    if (!monthlySearches || monthlySearches.length < 6) return "stable";

    const recent =
      monthlySearches
        .slice(0, 3)
        .reduce((a, b) => a + (b.search_volume || 0), 0) / 3;
    const older =
      monthlySearches
        .slice(3, 6)
        .reduce((a, b) => a + (b.search_volume || 0), 0) / 3;

    if (older === 0) return "stable";
    if (recent > older * 1.2) return "rising";
    if (recent < older * 0.8) return "declining";
    return "stable";
  }

  private classifyIntent(
    question: string
  ): "informational" | "commercial" | "transactional" | "navigational" {
    const lower = question.toLowerCase();

    if (
      lower.includes("buy") ||
      lower.includes("price") ||
      lower.includes("order") ||
      lower.includes("discount")
    ) {
      return "transactional";
    }

    if (
      lower.includes("best") ||
      lower.includes("vs") ||
      lower.includes("review") ||
      lower.includes("compare")
    ) {
      return "commercial";
    }

    if (
      lower.includes("website") ||
      lower.includes("login") ||
      lower.includes("official")
    ) {
      return "navigational";
    }

    return "informational";
  }

  private getDefaultNicheContext(niche: string) {
    return {
      industry: niche.charAt(0).toUpperCase() + niche.slice(1),
      searchQueries: ["benefits", "side effects", "how to use", "reviews", "best", "vs"],
      audienceProfile: "General consumers",
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===========================================================================
  // BLOG GENERATION
  // ===========================================================================
  async generateBlogFromQuestion(params: BlogGenerationParams): Promise<GeneratedBlog> {
    const prompt = this.buildBlogPrompt(params);

    try {
      const response = await this.callAnyAI(prompt, 8000);
      const parsed = this.parseJsonResponse(response);

      const textContent = (parsed.content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const wordCount = textContent
        .split(" ")
        .filter((w: string) => w.length > 0).length;

      const seoScore = this.calculateSeoScore(
        parsed.title,
        parsed.metaDescription,
        parsed.content,
        params.question
      );

      const blog: GeneratedBlog = {
        id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        questionId: params.questionId,
        title: parsed.title || `Guide: ${params.question}`,
        content: parsed.content || "",
        wordCount,
        faqs: parsed.faqs || [],
        metaDescription: parsed.metaDescription || "",
        seoScore,
        status: "draft",
        createdAt: new Date(),
        userId: params.userId,
      };

      console.log(
        `✅ Generated blog: "${blog.title}" (${wordCount} words, SEO: ${seoScore}%)`
      );

      return blog;
    } catch (error: any) {
      console.error("❌ Blog generation failed:", error.message);
      throw new Error(`Failed to generate blog: ${error.message}`);
    }
  }

  private buildBlogPrompt(params: BlogGenerationParams): string {
    // Ensure minimum word count of 1500
    const targetWordCount = Math.max(1500, params.targetWordCount);
    const mainContentWords = targetWordCount - 500;
    
    return `You are an expert content writer specializing in SEO-optimized blog articles.
Write a comprehensive, in-depth blog post answering: "${params.question}"
Product/Topic: ${params.productName}
MINIMUM Word Count: ${targetWordCount} words (THIS IS CRITICAL - DO NOT WRITE LESS)
Tone: ${params.tone}
${
  params.includeProductSection
    ? "Include [PRODUCT SECTION] placeholder for product recommendations."
    : ""
}

REQUIRED STRUCTURE (MINIMUM ${targetWordCount} WORDS TOTAL):
1. SEO Title (60-70 characters) - Compelling and keyword-rich

2. Meta Description (150-160 characters) - Engaging summary with call-to-action

3. Introduction (200-250 words)
   - Attention-grabbing hook
   - Brief context and relevance
   - Clear preview of what readers will learn
   - Establish credibility

4. Main Content (${mainContentWords}+ words) - 5-7 H2 sections, each with 2-4 H3 subsections
   - Each H2 section should be 200-300 words minimum
   - Include detailed explanations, examples, and actionable insights
   - Use statistics, data, or research when relevant
   - Add real-world applications and case studies
   - Include specific step-by-step instructions where applicable
   - Use bullet points and numbered lists for clarity
   - Add [IMAGE: detailed description] placeholders (at least 3-5 images)
   
5. Expert Tips Section (150-200 words)
   - 5-7 actionable, specific tips
   - Each tip should be 2-3 sentences with explanation
   
6. Key Takeaways (100-150 words)
   - Summary of main points in bullet format
   - Reinforce the most important information
   
7. Conclusion (150-200 words)
   - Recap the main benefits/insights
   - Strong call-to-action
   - Encourage next steps
${
  params.includeFAQ
    ? `\n8. FAQ Section - EXACTLY ${params.faqCount} FAQs with comprehensive answers
   - Each answer should be 80-120 words
   - Provide detailed, helpful responses`
    : ""
}

CRITICAL REQUIREMENTS:
- Use semantic HTML tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>
- Make content comprehensive and thorough - NO SHALLOW OR BRIEF SECTIONS
- Each section must provide real value and detailed information
- Include specific examples, data points, and practical advice
- Write naturally and engagingly while maintaining ${params.tone} tone
- Ensure the final word count is AT LEAST ${targetWordCount} words

Return ONLY this JSON (no markdown formatting):
{
  "title": "SEO title here",
  "metaDescription": "Meta description here",
  "content": "<article>HTML content here with ALL sections</article>",
  "faqs": [{"question": "Q1?", "answer": "Comprehensive answer here"}, ...]
}`;
  }

  // Wrapper used by routes: generateBlog({...}) WITHOUT userId
  async generateBlog(params: {
    questionId: string;
    question: string;
    productName: string;
    targetWordCount: number;
    includeFAQ: boolean;
    faqCount: number;
    tone: string;
    includeProductSection: boolean;
    aiProvider: "openai" | "anthropic" | "gemini";
  }): Promise<GeneratedBlog> {
    const fullParams: BlogGenerationParams = {
      ...params,
      userId: "temp-user", // real userId is applied in saveBlog()
    };
    return this.generateBlogFromQuestion(fullParams);
  }

  // ===========================================================================
  // STORAGE METHODS (RESEARCH)
  // ===========================================================================
  async getSavedResearch(userId: string): Promise<SavedResearchSession[]> {
    return this.savedResearch.get(userId) || [];
  }

  async getSavedResearchSessions(userId: string): Promise<SavedResearchSession[]> {
    return this.getSavedResearch(userId);
  }

  async saveResearchSession(
    userId: string,
    name: string,
    niche: string,
    products: string[],
    questions: ResearchedQuestion[],
    locations?: any
  ): Promise<SavedResearchSession> {
    const session: SavedResearchSession = {
      id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      niche,
      products,
      questions,
      createdAt: new Date(),
      userId,
    };

    const userSessions = this.savedResearch.get(userId) || [];
    userSessions.unshift(session);
    this.savedResearch.set(userId, userSessions);

    return session;
  }

  async deleteResearchSession(userId: string, researchId: string): Promise<boolean> {
    const userSessions = this.savedResearch.get(userId) || [];
    const originalLength = userSessions.length;
    const filtered = userSessions.filter((s) => s.id !== researchId);
    this.savedResearch.set(userId, filtered);
    return filtered.length !== originalLength;
  }

  async getQuestionsBySession(
    userId: string,
    researchId: string
  ): Promise<ResearchedQuestion[]> {
    const userSessions = this.savedResearch.get(userId) || [];
    const session = userSessions.find((s) => s.id === researchId);
    return session?.questions || [];
  }

  async saveQuestions(
    userId: string,
    questions: ResearchedQuestion[]
  ): Promise<ResearchedQuestion[]> {
    const sessionName = "Auto-saved questions";
    const userSessions = this.savedResearch.get(userId) || [];
    let session = userSessions.find((s) => s.name === sessionName);

    if (!session) {
      session = {
        id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: sessionName,
        niche: "custom",
        products: Array.from(new Set(questions.map((q) => q.productName))),
        questions: [],
        createdAt: new Date(),
        userId,
      };
      userSessions.unshift(session);
      this.savedResearch.set(userId, userSessions);
    }

    session.questions.push(...questions);
    return questions;
  }

  // ===========================================================================
  // STORAGE METHODS (BLOGS)
  // ===========================================================================
  async getGeneratedBlogs(userId: string): Promise<GeneratedBlog[]> {
    return this.generatedBlogs.get(userId) || [];
  }

  async getBlogsByUser(userId: string): Promise<GeneratedBlog[]> {
    return this.getGeneratedBlogs(userId);
  }

  async getBlogById(userId: string, blogId: string): Promise<GeneratedBlog | null> {
    const userBlogs = this.generatedBlogs.get(userId) || [];
    return userBlogs.find((b) => b.id === blogId) || null;
  }

  async updateBlog(
    userId: string,
    blogId: string,
    updates: Partial<GeneratedBlog>
  ): Promise<GeneratedBlog | null> {
    const userBlogs = this.generatedBlogs.get(userId) || [];
    const index = userBlogs.findIndex((b) => b.id === blogId);
    if (index === -1) return null;

    userBlogs[index] = { ...userBlogs[index], ...updates };
    this.generatedBlogs.set(userId, userBlogs);
    return userBlogs[index];
  }

  async deleteBlog(userId: string, blogId: string): Promise<boolean> {
    const userBlogs = this.generatedBlogs.get(userId) || [];
    const originalLength = userBlogs.length;
    const filtered = userBlogs.filter((b) => b.id !== blogId);
    this.generatedBlogs.set(userId, filtered);
    return filtered.length !== originalLength;
  }

  private saveBlogToStorage(blog: GeneratedBlog): void {
    const userBlogs = this.generatedBlogs.get(blog.userId) || [];
    userBlogs.unshift(blog);
    this.generatedBlogs.set(blog.userId, userBlogs);
  }

  async saveBlog(
    userId: string,
    blog: GeneratedBlog,
    questionId: string
  ): Promise<GeneratedBlog> {
    const stored: GeneratedBlog = {
      ...blog,
      userId,
      questionId,
    };
    this.saveBlogToStorage(stored);
    return stored;
  }

  async trackBlogDownload(
    userId: string,
    blogId: string,
    format: string
  ): Promise<void> {
    const userBlogs = this.generatedBlogs.get(userId) || [];
    const index = userBlogs.findIndex((b) => b.id === blogId);
    if (index !== -1) {
      userBlogs[index].status = "downloaded";
      this.generatedBlogs.set(userId, userBlogs);
    }
  }

  // ===========================================================================
  // EXPORT METHODS
  // ===========================================================================
  convertToMarkdown(blog: GeneratedBlog): string {
    let markdown = `# ${blog.title}\n\n*${blog.metaDescription}*\n\n---\n\n`;

    let content = blog.content
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul[^>]*>|<\/ul>/gi, "\n")
      .replace(/<ol[^>]*>|<\/ol>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n");

    markdown += content;

    if (blog.faqs?.length > 0) {
      markdown += "\n\n## Frequently Asked Questions\n\n";
      blog.faqs.forEach((faq) => {
        markdown += `### ${faq.question}\n\n${faq.answer}\n\n`;
      });
    }

    return markdown;
  }

  convertToFullHtml(blog: GeneratedBlog): string {
    let faqHtml = "";
    if (blog.faqs?.length > 0) {
      faqHtml = `<section class="faq-section"><h2>Frequently Asked Questions</h2>${blog.faqs
        .map(
          (faq) =>
            `<div class="faq-item"><h3>${faq.question}</h3><p>${faq.answer}</p></div>`
        )
        .join("")}</section>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${this.escapeHtml(blog.metaDescription)}">
<title>${this.escapeHtml(blog.title)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.8;max-width:800px;margin:0 auto;padding:40px 20px;color:#333}
h1{font-size:2.5em;margin-bottom:.5em;color:#1a1a1a}
h2{font-size:1.75em;margin-top:2em;border-bottom:2px solid #eee;padding-bottom:.3em}
h3{font-size:1.25em;margin-top:1.5em}
.meta-info{color:#666;font-size:.9em;margin-bottom:2em;padding-bottom:1em;border-bottom:1px solid #eee}
.faq-section{background:#f9f9f9;padding:2em;border-radius:8px;margin-top:3em}
.faq-item{margin-bottom:1.5em;padding-bottom:1.5em;border-bottom:1px solid #ddd}
.faq-item:last-child{border-bottom:none}
.faq-item h3{color:#7c3aed;margin-top:0}
</style>
</head>
<body>
<article>
<h1>${this.escapeHtml(blog.title)}</h1>
<div class="meta-info">📝 ${blog.wordCount.toLocaleString()} words • 📊 SEO: ${
      blog.seoScore
    }% • 📅 ${new Date(blog.createdAt).toLocaleDateString()}</div>
${blog.content}
${faqHtml}
</article>
</body>
</html>`;
  }

  async convertToDocx(blog: GeneratedBlog): Promise<Buffer> {
    const children: Paragraph[] = [
      new Paragraph({
        text: blog.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: blog.metaDescription,
            italics: true,
            color: "666666",
          }),
        ],
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Words: ${blog.wordCount} | SEO: ${blog.seoScore}%`,
            size: 20,
            color: "888888",
          }),
        ],
        spacing: { after: 600 },
      }),
    ];

    const contentText = blog.content
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n[H2]$1[/H2]\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n[H3]$1[/H3]\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "[P]$1[/P]\n")
      .replace(/<li>(.*?)<\/li>/gi, "[LI]$1[/LI]\n")
      .replace(/<[^>]+>/g, "");

    for (const section of contentText.split(/\n+/).filter((s) => s.trim())) {
      const trimmed = section.trim();

      if (trimmed.startsWith("[H2]")) {
        children.push(
          new Paragraph({
            text: trimmed.replace("[H2]", "").replace("[/H2]", ""),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        );
      } else if (trimmed.startsWith("[H3]")) {
        children.push(
          new Paragraph({
            text: trimmed.replace("[H3]", "").replace("[/H3]", ""),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 300, after: 150 },
          })
        );
      } else if (trimmed.startsWith("[LI]")) {
        children.push(
          new Paragraph({
            text: `• ${trimmed.replace("[LI]", "").replace("[/LI]", "")}`,
            spacing: { after: 100 },
          })
        );
      } else if (trimmed.startsWith("[P]")) {
        children.push(
          new Paragraph({
            text: trimmed.replace("[P]", "").replace("[/P]", ""),
            spacing: { after: 200 },
          })
        );
      }
    }

    if (blog.faqs?.length > 0) {
      children.push(
        new Paragraph({
          text: "Frequently Asked Questions",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 600, after: 300 },
        })
      );

      for (const faq of blog.faqs) {
        children.push(
          new Paragraph({
            text: faq.question,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ text: faq.answer, spacing: { after: 200 } })
        );
      }
    }

    const doc = new Document({ sections: [{ children }] });
    return await Packer.toBuffer(doc);
  }

  async exportBlogToDocx(blog: GeneratedBlog): Promise<Buffer> {
    return this.convertToDocx(blog);
  }

  // ===========================================================================
  // PRIVATE HELPERS (AI calls, SEO, etc.)
  // ===========================================================================
  private async callAnyAI(prompt: string, maxTokens: number = 4000): Promise<string> {
    const providers: Array<"anthropic" | "openai" | "gemini"> = [];
    if (this.anthropic) providers.push("anthropic");
    if (this.openai) providers.push("openai");
    if (this.gemini) providers.push("gemini");

    if (providers.length === 0) {
      throw new Error("No AI provider available (Anthropic/OpenAI/Gemini all missing)");
    }

    let lastError: any = null;

    for (const provider of providers) {
      try {
        console.log(`🤖 callAnyAI: trying ${provider}...`);
        return await this.callAI(prompt, provider, maxTokens);
      } catch (err: any) {
        console.error(`callAnyAI: ${provider} failed:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All AI providers failed");
  }

  private async callAI(
    prompt: string,
    provider: "openai" | "anthropic" | "gemini",
    maxTokens: number = 4000
  ): Promise<string> {
    if (provider === "anthropic" && this.anthropic) {
      const result = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      return (result.content[0] as any).text;
    }

    if (provider === "openai" && this.openai) {
      const result = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      });
      return result.choices[0].message.content || "";
    }

    if (provider === "gemini" && this.gemini) {
      const model = this.gemini.getGenerativeModel({
        model: "gemini-flash-latest",
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }

    // Fallback if provider string doesn't match but anthropic is available
    if (this.anthropic) {
      const result = await this.anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      return (result.content[0] as any).text;
    }

    throw new Error("No AI provider available");
  }

  private parseJsonResponse(response: string): any {
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("JSON parse failed:", cleaned.substring(0, 200));
      throw new Error("Failed to parse AI response");
    }
  }

  private calculateSeoScore(
    title: string,
    meta: string,
    content: string,
    keyword: string
  ): number {
    let score = 0;
    const kw = keyword.toLowerCase().split(" ")[0];

    if (title?.length >= 50 && title?.length <= 70) score += 10;
    if (title?.toLowerCase().includes(kw)) score += 15;

    if (meta?.length >= 140 && meta?.length <= 160) score += 10;
    if (meta?.toLowerCase().includes(kw)) score += 10;

    if (content) {
      const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).length;
      if (words >= 1500) score += 10;
      if (words >= 2000) score += 5;

      const h2s = (content.match(/<h2/g) || []).length;
      if (h2s >= 3 && h2s <= 10) score += 10;

      if (content.includes("<ul") || content.includes("<ol")) score += 5;
      if (content.includes("[IMAGE:")) score += 5;

      const kwMatches = (content.toLowerCase().match(new RegExp(kw, "g")) || []).length;
      if (kwMatches >= 3 && kwMatches <= 15) score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

export const highIntentService = new HighIntentService();
export default highIntentService;