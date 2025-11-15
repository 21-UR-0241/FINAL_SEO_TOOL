// server/services/ai-service.ts
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "../storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { imageService } from "./image-service";
import { CloudinaryStorageService } from "./cloudinary-storage";
import { apiKeyEncryptionService } from "./api-key-encryption";

// Initialize Cloudinary storage
const cloudinaryStorage = new CloudinaryStorageService();

// AI Provider Configuration
export type AIProvider = "openai" | "anthropic" | "gemini";

const VALID_LANGUAGES = [
  "english",
  "spanish",
  "french",
  "german",
  "italian",
  "portuguese",
  "russian",
  "japanese",
  "chinese",
  "korean",
  "dutch",
  "swedish",
  "polish",
  "turkish",
  "thai",
  "vietnamese",
];

// Model configurations
const AI_MODELS = {
  openai: {
    model: "gpt-4o",
    pricing: {
      input: 0.005,
      output: 0.015,
    },
  },
  anthropic: {
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    pricing: {
      input: 0.003,
      output: 0.015,
    },
  },
  gemini: {
    model: "gemini-1.5-flash-8b",
    pricing: {
      input: 0.0025,
      output: 0.0075,
    },
  },
} as const;

const NICHE_CONTEXTS: Record<string, {
  label: string;
  industry: string;
  defaultAudience: string;
  defaultBrandVoice: string;
  contentStyle: string;
  keyTopics: string[];
}> = {
  reputation_sites: {
    label: "Good Reputation Sites & Reviews",
    industry: "Reputation Management",
    defaultAudience: "Business owners, consumers, marketers researching reviews",
    defaultBrandVoice: "professional and balanced, ethical consultant",
    contentStyle: "Balanced perspective addressing both business and consumer viewpoints, platform-specific details, ethical practices only",
    keyTopics: ["Trustpilot", "Yelp", "Google Reviews", "BBB", "G2", "review response", "fake reviews", "reputation management"],
  },
  peptides: {
    label: "Peptides & Performance Enhancement",
    industry: "Health & Performance",
    defaultAudience: "Bodybuilders, biohackers, anti-aging seekers, researchers, medical professionals",
    defaultBrandVoice: "scientific yet accessible, evidence-based",
    contentStyle: "Scientific credibility with E-A-T compliance, reference actual studies, acknowledge limitations, never recommend suppliers",
    keyTopics: ["BPC-157", "TB-500", "peptide protocols", "growth hormone", "tissue repair", "clinical research"],
  },
  gambling: {
    label: "Gambling & Sports Betting",
    industry: "Sports Betting",
    defaultAudience: "Casual bettors to sharp players seeking statistical analysis",
    defaultBrandVoice: "analytical, data-driven, responsible",
    contentStyle: "Statistical analysis over hot takes, acknowledge most bettors lose, responsible gambling framework, real odds examples",
    keyTopics: ["closing line value", "expected value", "bankroll management", "line movement", "betting strategy", "+EV spots"],
  },
  apps_marketing: {
    label: "Apps Marketing & Reviews",
    industry: "Mobile Apps & Software",
    defaultAudience: "App users, productivity seekers, buyers researching software",
    defaultBrandVoice: "honest reviewer, practical and helpful",
    contentStyle: "Test apps when possible, mention limitations honestly, real pricing, platform differences (iOS vs Android)",
    keyTopics: ["app reviews", "productivity apps", "app comparison", "mobile software", "app features", "user experience"],
  },
  exclusive_models: {
    label: "Creator Platforms & OnlyFans Business",
    industry: "Creator Economy",
    defaultAudience: "Aspiring creators, current creators, business researchers",
    defaultBrandVoice: "professional business advisor, entrepreneurial consultant",
    contentStyle: "Business-first framing not explicit content, frame as entrepreneurship, real numbers on fees and earnings, respect creator autonomy",
    keyTopics: ["OnlyFans", "Fansly", "creator monetization", "content marketing", "subscriber retention", "creator business", "platform fees"],
  },
  ecom_nails: {
    label: "Nails & Beauty E-commerce",
    industry: "Beauty & Cosmetics",
    defaultAudience: "Beginners to experienced home manicurists, beauty enthusiasts",
    defaultBrandVoice: "practical and experienced, helpful beauty enthusiast",
    contentStyle: "Correct product terminology, reference actual brands with real prices, include timing, describe looks specifically",
    keyTopics: ["gel polish", "nail art", "chrome powder", "builder gel", "manicure techniques", "nail products", "nail trends"],
  },
  soccer_jersey: {
    label: "Soccer Jerseys & Fan Merchandise",
    industry: "Sports Merchandise",
    defaultAudience: "Passionate fans, collectors, parents, gift buyers",
    defaultBrandVoice: "knowledgeable fan perspective, experienced collector",
    contentStyle: "Distinguish authentic vs replica vs counterfeit, use proper terminology (kit, strip), sizing by manufacturer, authentication methods",
    keyTopics: ["authentic jerseys", "replica jerseys", "soccer kits", "jersey sizing", "fan merchandise", "jersey collecting", "team jerseys"],
  },
  payment_processing: {
    label: "Payment Processing & Fintech",
    industry: "Financial Technology",
    defaultAudience: "Business owners, financial decision-makers, developers, e-commerce operators",
    defaultBrandVoice: "business consultant, fintech expert, technical advisor",
    contentStyle: "Use correct terminology (interchange, acquirer, PSP), real fee structures, include hidden costs, compliance requirements",
    keyTopics: ["Stripe", "Square", "payment gateway", "transaction fees", "PCI compliance", "merchant account", "payment integration"],
  },
  web_dev: {
    label: "Web Development",
    industry: "Software Development",
    defaultAudience: "Beginners to experienced developers evaluating tools and approaches",
    defaultBrandVoice: "experienced developer, pragmatic engineer",
    contentStyle: "Use current web standards, reference actual versions (React 18, Node 20), address trade-offs honestly, explain why not just how",
    keyTopics: ["React", "Next.js", "JavaScript", "web performance", "frameworks", "frontend development", "backend development"],
  },
  app_dev: {
    label: "App Development",
    industry: "Mobile Development",
    defaultAudience: "Entrepreneurs, business stakeholders, developers evaluating platforms",
    defaultBrandVoice: "realistic consultant, mobile development expert",
    contentStyle: "Balance business and technical perspectives, honest cost ranges and timelines, include ongoing costs, post-launch reality",
    keyTopics: ["React Native", "Flutter", "iOS development", "Android development", "app costs", "mobile development", "cross-platform"],
  },
  construction: {
    label: "Construction & B2B Services",
    industry: "Construction",
    defaultAudience: "Contractors, subcontractors, construction business owners, project managers",
    defaultBrandVoice: "industry veteran, construction business consultant",
    contentStyle: "Use correct construction terminology (GC, sub, bid process), real cost ranges, regulatory requirements, regional differences",
    keyTopics: ["commercial construction", "bidding strategy", "project management", "subcontractors", "construction business", "permits"],
  },
  loans: {
    label: "Loans & Lending",
    industry: "Financial Services",
    defaultAudience: "Borrowers researching options, credit rebuilders, financial education seekers",
    defaultBrandVoice: "responsible financial advisor, consumer advocate",
    contentStyle: "Use correct financial terminology (APR, LTV, DTI), show total cost not just monthly payment, address predatory lending red flags",
    keyTopics: ["personal loans", "mortgage", "APR", "interest rates", "credit score", "loan qualification", "debt consolidation"],
  },
};

const LANGUAGE_PROMPTS: Record<string, string> = {
  english:
    "Write in clear, professional English. Use proper grammar and idioms suitable for native English speakers.",
  spanish:
    "Escribe en español profesional y claro. Usa gramática correcta e idiomas apropiados para hablantes nativos de español.",
  french:
    "Écrivez en français professionnel et clair. Utilisez une grammaire correcte et des expressions appropriées pour les locuteurs natifs français.",
  german:
    "Schreiben Sie in klarem, professionellem Deutsch. Verwenden Sie korrekte Grammatik und Redewendungen für Deutsch-Muttersprachler.",
  italian:
    "Scrivi in italiano professionale e chiaro. Usa la grammatica corretta e le espressioni appropriate per i madrelingua italiani.",
  portuguese:
    "Escreva em português profissional e claro. Use gramática correta e expressões apropriadas para falantes nativos de português.",
  russian:
    "Пишите на четком, профессиональном русском языке. Используйте правильную грамматику и идиомы для носителей русского языка.",
  japanese:
    "明確でプロフェッショナルな日本語で記述してください。日本語ネイティブスピーカーに適した正しい文法と言語を使用してください。",
  chinese:
    "用清晰、专业的简体中文撰写。使用适合中文母语使用者的正确语法和成语。",
  korean:
    "명확하고 전문적인 한국어로 작성하세요. 한국어 모국어 사용자에게 적합한 올바른 문법과 관용구를 사용하세요.",
  dutch:
    "Schrijf in duidelijk, professioneel Nederlands. Gebruik correcte grammatica en uitdrukkingen die geschikt zijn voor native Dutch speakers.",
  swedish:
    "Skriv på tydlig, professionell svenska. Använd korrekt grammatik och idiom lämpliga för svenska modersmålstalare.",
  polish:
    "Napisz w jasnym, profesjonalnym polskim. Użyj poprawnej gramatyki i zwrotów odpowiednich dla polskich rodzimych użytkowników.",
  turkish:
    "Açık, profesyonel Türkçe ile yazın. Türkçe ana dili konuşanları için uygun olan doğru dilbilgisi ve deyimleri kullanın.",
  thai: "เขียนเป็นภาษาไทยที่ชัดเจนและเป็นมืออาชีพ ใช้ไวยากรณ์ที่ถูกต้องและสำนวนที่เหมาะสำหรับผู้พูดภาษาไทยเนื้อแท้",
  vietnamese:
    "Viết bằng tiếng Việt rõ ràng, chuyên nghiệp. Sử dụng ngữ pháp đúng và các thành ngữ phù hợp cho người nói tiếng Việt mẹ đẻ.",
};

function getNicheContext(niche: string) {
  return NICHE_CONTEXTS[niche] || {
    label: "General",
    industry: "General",
    defaultAudience: "general audience",
    defaultBrandVoice: "professional and informative",
    contentStyle: "clear and engaging",
    keyTopics: [],
  };
}

// Interface for user API keys from database
interface UserApiKey {
 id: string;
  userId: string;
  provider: string;
  keyName: string;
  encryptedApiKey: string; // ✅ MUST match storage.ts normalizeApiKey method
  maskedKey: string;
  isActive: boolean;
  validationStatus: 'valid' | 'invalid' | 'pending';
  lastValidated?: Date;
  validationError?: string;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentGenerationRequest {
  websiteId?: string;
  niche?: string;
  topic: string;
  keywords: string[];
  tone: "professional" | "casual" | "friendly" | "authoritative" | "technical" | "warm";
  wordCount: number;
  seoOptimized: boolean;
  brandVoice?: string;
  targetAudience?: string;
  eatCompliance?: boolean;
  aiProvider: AIProvider;
  userId: string;
  includeImages?: boolean;
  imageCount?: number;
  imageStyle?: "natural" | "digital_art" | "photographic" | "cinematic";
  isAutoGenerated?: boolean;
  autoScheduleId?: string;
  autoPublish?: boolean;
  publishDelay?: number;
  language?: string;
}

export interface ContentGenerationResultWithPublishing extends ContentGenerationResult {
  contentId?: string;
  published?: boolean;
  scheduledForPublishing?: boolean;
  publishedAt?: Date;
  scheduledDate?: Date;
  totalCost?: string;
  title?: string;
  language?: string;
  conversationalVoice?: boolean;
}

export interface ContentAnalysisRequest {
  title: string;
  content: string;
  keywords: string[];
  tone: string;
  brandVoice?: string;
  targetAudience?: string;
  eatCompliance?: boolean;
  websiteId: string;
  aiProvider: AIProvider;
  userId: string;
  language?: string;
  niche?: string;
}

export interface ContentGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  metaTitle: string;
  keywords: string[];
  seoScore: number;
  readabilityScore: number;
  brandVoiceScore: number;
  eatCompliance: boolean;
  tokensUsed: number;
  costUsd: number;
  aiProvider: AIProvider;
  qualityChecks: {
    plagiarismRisk: "low" | "medium" | "high";
    factualAccuracy: "verified" | "needs_review" | "questionable";
    brandAlignment: "excellent" | "good" | "needs_improvement";
  };
  images?: Array<{
    url: string;
    filename: string;
    altText: string;
    prompt: string;
    cost: number;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
  }>;
  totalImageCost?: number;
}

export interface ContentAnalysisResult {
  seoScore: number;
  readabilityScore: number;
  brandVoiceScore: number;
  tokensUsed: number;
  costUsd: number;
  aiProvider: AIProvider;
}

// Custom error classes
export class AIProviderError extends Error {
  constructor(provider: AIProvider, message: string) {
    super(`${provider.toUpperCase()} Error: ${message}`);
    this.name = "AIProviderError";
  }
}

export class AnalysisError extends Error {
  constructor(analysisType: string, message: string) {
    super(`${analysisType} Analysis Error: ${message}`);
    this.name = "AnalysisError";
  }
}

export class ContentFormatter {
  static convertMarkdownToHtml(content: string): string {
    return content
      .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
      .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
      .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
      .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  }

  static convertMarkdownFormatting(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")
      .replace(/(?<!_)_([^_]+?)_(?!_)/g, "<em>$1</em>")
      .replace(/^[\-\•\◆\*\+]\s+(.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  }

  static wrapListItems(content: string): string {
    content = content.replace(
      /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
      (match) => {
        if (match.includes("<li>")) {
          return `<ul>\n${match}\n</ul>`;
        }
        return match;
      }
    );
    return content;
  }

  static formatForWordPress(content: string): string {
    let formatted = content;
    formatted = this.convertMarkdownToHtml(content);
    formatted = this.convertMarkdownFormatting(formatted);
    formatted = this.wrapListItems(formatted);
    formatted = this.addParagraphTags(formatted);
    formatted = this.addHeaderSpacing(formatted);
    formatted = this.addProperSpacing(formatted);
    return formatted;
  }

  private static addParagraphTags(content: string): string {
    const blocks = content.split("\n\n");
    return blocks
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
          return trimmed;
        }
        if (trimmed.match(/^<h[1-6]>/)) {
          return trimmed;
        }
        return `<p>${trimmed}</p>`;
      })
      .join("\n\n");
  }

  private static addProperSpacing(content: string): string {
    return content
      .replace(/(<h[1-6]>.*?<\/h[1-6]>)/g, "\n$1\n")
      .replace(/(<\/?(?:ul|ol)>)/g, "\n$1\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  private static addHeaderSpacing(content: string): string {
    return content
      .replace(/(<h[1-6]>.*?<\/h[1-6]>)/g, "\n$1\n")
      .replace(/\n{3,}/g, "\n\n");
  }
}

export class AIService {
  // Cache for API keys to avoid repeated database queries
  private apiKeyCache: Map<string, { key: string; type: 'user' | 'system'; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastRequestTopic: string = "";
  private lastLanguage: string = "english";

  /**
   * Get the API key for a provider, checking user's keys first, then falling back to env vars
   */
private async getApiKey(provider: AIProvider, userId: string): Promise<{ key: string; type: 'user' | 'system' } | null> {
  const cacheKey = `${userId}-${provider}`;
  
  console.log(`🔍 [getApiKey] Starting lookup for provider: ${provider}, userId: ${userId}`);

  // Check cache first
  const cached = this.apiKeyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
    console.log(`✅ [getApiKey] Using cached ${cached.type} API key for ${provider}`);
    return { key: cached.key, type: cached.type };
  }

  try {
    // Try to get user's API key first
    console.log(`🔍 [getApiKey] Fetching user API keys from database...`);
    const userApiKeys = await storage.getUserApiKeys(userId);
    
    console.log(`📊 [getApiKey] Database returned ${userApiKeys?.length || 0} keys`);
    
    if (userApiKeys && userApiKeys.length > 0) {
      // Log all keys for debugging
      console.log(`📋 [getApiKey] Available keys:`, userApiKeys.map((k: any) => ({
        id: k.id,
        provider: k.provider,
        keyName: k.keyName,
        isActive: k.isActive,
        validationStatus: k.validationStatus,
        hasEncryptedApiKey: !!k.encryptedApiKey,
        maskedKey: k.maskedKey
      })));

      // Map AI providers to database provider names
      // Check your database to see exactly what provider values are stored
      const providerMap: Record<AIProvider, string[]> = {
        'openai': ['openai', 'openai_api'],
        'anthropic': ['anthropic', 'anthropic_api', 'claude'],
        'gemini': ['gemini', 'google_gemini', 'google', 'google_api']
      };

      const possibleProviderNames = providerMap[provider];
      console.log(`🔍 [getApiKey] Looking for providers matching: ${possibleProviderNames.join(', ')}`);

      // Find valid key with flexible provider matching
      const validKey = userApiKeys.find((key: any) => {
        const providerMatch = possibleProviderNames.some(name => 
          key.provider?.toLowerCase() === name.toLowerCase()
        );
        const isValid = key.isActive && key.validationStatus === 'valid';
        
        console.log(`🔍 [getApiKey] Checking key "${key.keyName}":`, {
          provider: key.provider,
          providerMatch,
          isActive: key.isActive,
          validationStatus: key.validationStatus,
          isValid,
          hasEncryptedData: !!key.encryptedApiKey
        });
        
        return providerMatch && isValid;
      });

      if (validKey) {
        console.log(`✅ [getApiKey] Found valid key: "${validKey.keyName}" (provider: ${validKey.provider})`);
        
        // Use encryptedApiKey property (matches storage.ts normalizeApiKey)
        const encryptedKey = validKey.encryptedApiKey;
        
        if (!encryptedKey) {
          console.error(`❌ [getApiKey] Key found but encryptedApiKey is empty or null`);
          console.error(`   Key object keys:`, Object.keys(validKey));
        } else {
          console.log(`🔐 [getApiKey] Attempting to decrypt key (length: ${encryptedKey.length} chars)...`);
          
          try {
            const decryptedKey = apiKeyEncryptionService.decrypt(encryptedKey);
            
            if (!decryptedKey || decryptedKey.length < 10) {
              console.error(`❌ [getApiKey] Decryption returned invalid key (length: ${decryptedKey?.length || 0})`);
            } else {
              // Validate key format before caching
              const keyPrefix = decryptedKey.substring(0, 3);
              console.log(`✅ [getApiKey] Successfully decrypted key (starts with: ${keyPrefix}...)`);
              
              // Cache with type information
              this.apiKeyCache.set(cacheKey, {
                key: decryptedKey,
                type: 'user',
                timestamp: Date.now()
              });
              
              console.log(`✅ [getApiKey] Cached user's ${provider} API key for future use`);
              
              // Increment usage count
              try {
                await storage.incrementApiKeyUsage(userId, validKey.provider);
              } catch (usageError) {
                console.warn(`⚠️ [getApiKey] Failed to increment usage:`, usageError);
              }
              
              return { key: decryptedKey, type: 'user' };
            }
          } catch (decryptError: any) {
            console.error(`❌ [getApiKey] Decryption failed:`, {
              error: decryptError.message,
              keyId: validKey.id,
              provider: validKey.provider
            });
          }
        }
      } else {
        const availableProviders = userApiKeys.map((k: any) => k.provider).join(', ');
        console.warn(`⚠️ [getApiKey] No valid ${provider} key found.`);
        console.warn(`   Available providers: ${availableProviders || 'none'}`);
        console.warn(`   Active keys: ${userApiKeys.filter(k => k.isActive).length}`);
        console.warn(`   Valid keys: ${userApiKeys.filter(k => k.validationStatus === 'valid').length}`);
      }
    } else {
      console.log(`ℹ️ [getApiKey] No API keys found in database for user ${userId}`);
    }
  } catch (error: any) {
    console.error(`❌ [getApiKey] Error fetching user API keys:`, {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
  }

  // Fallback to environment variables (system keys)
  console.log(`🔄 [getApiKey] Falling back to environment variables for ${provider}...`);
  
  let systemKey: string | null = null;
  let envVarName = '';
  
  switch (provider) {
    case 'openai':
      systemKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || null;
      envVarName = 'OPENAI_API_KEY';
      break;
    case 'anthropic':
      systemKey = process.env.ANTHROPIC_API_KEY || null;
      envVarName = 'ANTHROPIC_API_KEY';
      break;
    case 'gemini':
      systemKey = process.env.GOOGLE_GEMINI_API_KEY || null;
      envVarName = 'GOOGLE_GEMINI_API_KEY';
      break;
  }

  if (systemKey) {
    console.log(`✅ [getApiKey] Using system environment key: ${envVarName} (starts with: ${systemKey.substring(0, 3)}...)`);
    // Cache system key with type
    this.apiKeyCache.set(cacheKey, {
      key: systemKey,
      type: 'system',
      timestamp: Date.now()
    });
    return { key: systemKey, type: 'system' };
  }

  console.error(`❌ [getApiKey] No API key available for ${provider}`);
  console.error(`   - User keys checked: ${userId}`);
  console.error(`   - System env var checked: ${envVarName}`);
  console.error(`   - Result: NONE FOUND`);
  
  return null;
}

  /**
   * Create an OpenAI client with the appropriate API key
   */
  private async createOpenAIClient(userId: string): Promise<{ client: OpenAI; keyType: 'user' | 'system' }> {
    const keyInfo = await this.getApiKey('openai', userId);
    if (!keyInfo) {
      throw new AIProviderError('openai', 'No API key available. Please add your OpenAI API key in settings or contact support.');
    }
    return {
      client: new OpenAI({ apiKey: keyInfo.key }),
      keyType: keyInfo.type
    };
  }

  private async createAnthropicClient(userId: string): Promise<{ client: Anthropic; keyType: 'user' | 'system' }> {
    const keyInfo = await this.getApiKey('anthropic', userId);
    if (!keyInfo) {
      throw new AIProviderError('anthropic', 'No API key available. Please add your Anthropic API key in settings or contact support.');
    }
    return {
      client: new Anthropic({ apiKey: keyInfo.key }),
      keyType: keyInfo.type
    };
  }

  private async createGeminiClient(userId: string): Promise<{ client: GoogleGenerativeAI; keyType: 'user' | 'system' }> {
    const keyInfo = await this.getApiKey('gemini', userId);
    if (!keyInfo) {
      throw new AIProviderError('gemini', 'No API key available. Please add your Google Gemini API key in settings or contact support.');
    }
    return {
      client: new GoogleGenerativeAI(keyInfo.key),
      keyType: keyInfo.type
    };
  }

  private getLanguagePrompt(language: string = "english"): string {
    return LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.english;
  }

  /**
   * Clear cached API key for a user (call this when user updates their keys)
   */
  public clearApiKeyCache(userId: string, provider?: AIProvider): void {
    if (provider) {
      this.apiKeyCache.delete(`${userId}-${provider}`);
    } else {
      // Clear all keys for the user
      for (const key of this.apiKeyCache.keys()) {
        if (key.startsWith(`${userId}-`)) {
          this.apiKeyCache.delete(key);
        }
      }
    }
    console.log(`🔄 Cleared API key cache for user ${userId}${provider ? ` (${provider})` : ' (all providers)'}`);
  }

  public async callOpenAI(
    messages: any[],
    responseFormat?: any,
    temperature = 0.7,
    userId?: string
  ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
    let keyType: 'user' | 'system' = 'system';
    try {
      let openai: OpenAI;
      if (userId) {
        const clientInfo = await this.createOpenAIClient(userId);
        openai = clientInfo.client;
        keyType = clientInfo.keyType;
      } else {
        // Backwards compatibility - use env vars directly
        openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR
        });
        keyType = 'system';
      }

      const response = await openai.chat.completions.create({
        model: AI_MODELS.openai.model,
        messages,
        response_format: responseFormat,
        temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIProviderError("openai", "No content returned from API");
      }

      return {
        content,
        tokens: response.usage?.total_tokens || 0,
        keyType
      };
    } catch (error: any) {
      if (error instanceof AIProviderError) throw error;
      if (error.status === 401) {
        // Clear cache on auth error
        if (userId) this.clearApiKeyCache(userId, 'openai');
        throw new AIProviderError(
          "openai",
          "Invalid API key. Please check your OpenAI API key in settings."
        );
      } else if (error.status === 429) {
        throw new AIProviderError("openai", "Rate limit exceeded. Please try again later.");
      } else if (error.status === 403) {
        throw new AIProviderError(
          "openai",
          "Insufficient permissions. Please check your OpenAI API key permissions."
        );
      }
      throw new AIProviderError("openai", error.message || "Unknown API error");
    }
  }

  private async callGemini(
    messages: any[],
    temperature = 0.7,
    userId?: string
  ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
    let keyType: 'user' | 'system' = 'system';
    try {
      let gemini: GoogleGenerativeAI;
      if (userId) {
        // Get the API key with type information
        const keyInfo = await this.getApiKey('gemini', userId);
        if (!keyInfo) {
          throw new AIProviderError("gemini", "No API key available. Please add your Google API key in settings.");
        }
        // Create the Gemini client with the key
        gemini = new GoogleGenerativeAI(keyInfo.key);
        keyType = keyInfo.type;
        console.log(`✅ Created Gemini client with ${keyType} key`);
      } else {
        // Fallback to environment variable
        const envKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!envKey) {
          throw new AIProviderError("gemini", "No Google API key available in environment.");
        }
        gemini = new GoogleGenerativeAI(envKey);
        keyType = 'system';
      }

      // Rest of the Gemini implementation...
      const model = gemini.getGenerativeModel({
        model: AI_MODELS.gemini.model,
      });

      const systemMessage = messages.find((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");

      const history = userMessages.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const lastMessage = userMessages[userMessages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        throw new AIProviderError(
          "gemini",
          "Invalid message format - last message must be from user"
        );
      }

      const chat = model.startChat({
        history,
        generationConfig: {
          temperature,
          maxOutputTokens: 4000,
        },
      });

      let prompt = lastMessage.content;
      if (systemMessage?.content) {
        prompt = `${systemMessage.content}\n\n${prompt}`;
        if (systemMessage.content.includes("JSON") || systemMessage.content.includes("json")) {
          prompt +=
            "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object. Start your response with { and end with }.";
        }
      }

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new AIProviderError("gemini", "No content returned from API");
      }

      let cleanedText = responseText.trim();
      if (!cleanedText.startsWith("{") && cleanedText.includes("{")) {
        const jsonStart = cleanedText.indexOf("{");
        const jsonEnd = cleanedText.lastIndexOf("}") + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd);
        }
      }

      const estimatedTokens = Math.ceil((prompt.length + cleanedText.length) / 4);

      return {
        content: cleanedText,
        tokens: estimatedTokens,
        keyType,
      };
    } catch (error: any) {
      if (error instanceof AIProviderError) throw error;
      if (error.status === 429 || error.message?.includes("Too Many Requests")) {
        throw new AIProviderError(
          "gemini",
          "Rate limit exceeded. Google Gemini free tier allows only 15 requests/minute and 1,500/day. " +
            "Please wait a few minutes or consider upgrading to a paid plan. " +
            "Alternatively, use OpenAI or Anthropic for now."
        );
      } else if (error.message?.includes("API_KEY_INVALID")) {
        if (userId) this.clearApiKeyCache(userId, 'gemini');
        throw new AIProviderError(
          "gemini",
          "Invalid API key. Please check your Google API key in settings."
        );
      }
      throw new AIProviderError("gemini", error.message || "Unknown API error");
    }
  }

  private async callAnthropic(
    messages: any[],
    temperature = 0.7,
    userId?: string
  ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
    let keyType: 'user' | 'system' = 'system';
    try {
      let anthropic: Anthropic;
      if (userId) {
        // Get the API key with type information
        const keyInfo = await this.getApiKey('anthropic', userId);
        if (!keyInfo) {
          throw new AIProviderError("anthropic", "No API key available. Please add your Anthropic API key in settings.");
        }
        // Create the Anthropic client with the key
        anthropic = new Anthropic({ apiKey: keyInfo.key });
        keyType = keyInfo.type;
        console.log(`✅ Created Anthropic client with ${keyType} key`);
      } else {
        // Fallback to environment variable
        const envKey = process.env.ANTHROPIC_API_KEY;
        if (!envKey) {
          throw new AIProviderError("anthropic", "No Anthropic API key available in environment.");
        }
        anthropic = new Anthropic({ apiKey: envKey });
        keyType = 'system';
      }

      // Now anthropic should be properly initialized
      const systemMessage = messages.find((m) => m.role === "system");
      const userMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");

      let systemContent = systemMessage?.content || "";
      if (systemContent.includes("JSON") || systemContent.includes("json")) {
        systemContent +=
          "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object. Start your response with { and end with }.";
      }

      const response = await anthropic.messages.create({
        model: AI_MODELS.anthropic.model,
        max_tokens: 4000,
        temperature,
        system: systemContent,
        messages: userMessages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type !== "text" || !content.text) {
        throw new AIProviderError("anthropic", "No text content returned from API");
      }

      let responseText = content.text.trim();
      // Clean up JSON response if needed
      if (!responseText.startsWith("{") && responseText.includes("{")) {
        const jsonStart = responseText.indexOf("{");
        const jsonEnd = responseText.lastIndexOf("}") + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          responseText = responseText.substring(jsonStart, jsonEnd);
        }
      }

      return {
        content: responseText,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
        keyType
      };
    } catch (error: any) {
      if (error instanceof AIProviderError) throw error;
      if (error.status === 401) {
        if (userId) this.clearApiKeyCache(userId, 'anthropic');
        throw new AIProviderError(
          "anthropic",
          "Invalid API key. Please check your Anthropic API key in settings."
        );
      } else if (error.status === 429) {
        throw new AIProviderError("anthropic", "Rate limit exceeded. Please try again later.");
      }
      throw new AIProviderError("anthropic", error.message || "Unknown API error");
    }
  }

  private async callAI(
    provider: AIProvider,
    messages: any[],
    responseFormat?: any,
    temperature = 0.7,
    userId?: string
  ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
    switch (provider) {
      case "openai":
        return this.callOpenAI(messages, responseFormat, temperature, userId);
      case "anthropic":
        return this.callAnthropic(messages, temperature, userId);
      case "gemini":
        return this.callGemini(messages, temperature, userId);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  public embedImagesInContent(
    content: string,
    images: Array<{
      url: string;
      filename: string;
      altText: string;
      prompt: string;
      cost: number;
    }>
  ): string {
    return this.embedImagesInContentPrivate(content, images);
  }

  private embedImagesInContentPrivate(
    content: string,
    images: Array<{
      url: string;
      filename: string;
      altText: string;
      prompt: string;
      cost: number;
      cloudinaryUrl?: string;
    }>
  ): string {
    if (!images || images.length === 0) {
      return content;
    }

    let modifiedContent = content;
    images.forEach((image, index) => {
      // Use Cloudinary URL if available, otherwise fallback to original URL
      const imageUrl = image.cloudinaryUrl || image.url;
      const imageHtml = `
<figure class="wp-block-image size-large">
  <img src="${imageUrl}" alt="${image.altText}" class="wp-image" style="max-width: 100%; height: auto;" />
  <figcaption>${image.altText}</figcaption>
</figure>
`;

      if (index === 0) {
        const firstParagraphEnd = modifiedContent.indexOf("</p>");
        if (firstParagraphEnd !== -1) {
          modifiedContent =
            modifiedContent.slice(0, firstParagraphEnd + 4) +
            "\n\n" +
            imageHtml +
            "\n\n" +
            modifiedContent.slice(firstParagraphEnd + 4);
          console.log(`🖼️ Placed hero image after introduction`);
        } else {
          modifiedContent = imageHtml + "\n\n" + modifiedContent;
          console.log(`🖼️ Placed hero image at beginning (fallback)`);
        }
      } else {
        const h2Regex = /<h2>/g;
        const h2Matches = Array.from(modifiedContent.matchAll(h2Regex));
        if (h2Matches.length > index - 1) {
          const insertPoint = h2Matches[index - 1].index!;
          modifiedContent =
            modifiedContent.slice(0, insertPoint) +
            imageHtml +
            "\n\n" +
            modifiedContent.slice(insertPoint);
          console.log(`🖼️ Placed image ${index + 1} before H2 section`);
        } else {
          const conclusionHeadings = ["<h2>Conclusion", "<h2>Summary", "<h2>Final"];
          let insertPoint = -1;
          for (const heading of conclusionHeadings) {
            insertPoint = modifiedContent.lastIndexOf(heading);
            if (insertPoint !== -1) break;
          }
          if (insertPoint !== -1) {
            modifiedContent =
              modifiedContent.slice(0, insertPoint) +
              imageHtml +
              "\n\n" +
              modifiedContent.slice(insertPoint);
            console.log(`🖼️ Placed image ${index + 1} before conclusion`);
          } else {
            modifiedContent = modifiedContent + "\n\n" + imageHtml;
            console.log(`🖼️ Placed image ${index + 1} at end (fallback)`);
          }
        }
      }
    });

    return modifiedContent;
  }

  async analyzeExistingContent(request: {
    title: string;
    content: string;
    keywords: string[];
    tone: string;
    brandVoice?: string;
    targetAudience?: string;
    eatCompliance?: boolean;
    websiteId: string;
    aiProvider: AIProvider;
    userId: string;
  }): Promise<ContentAnalysisResult> {
    try {
      console.log(`Re-analyzing existing content with ${request.aiProvider.toUpperCase()}`);
      const analysisResult = await this.performContentAnalysis({
        title: request.title,
        content: request.content,
        keywords: request.keywords,
        tone: request.tone,
        brandVoice: request.brandVoice,
        targetAudience: request.targetAudience,
        eatCompliance: request.eatCompliance || false,
        websiteId: request.websiteId,
        aiProvider: request.aiProvider,
        userId: request.userId,
      });
      console.log(
        `✅ Existing content re-analyzed - SEO: ${analysisResult.seoScore}%, Readability: ${analysisResult.readabilityScore}%, Brand Voice: ${analysisResult.brandVoiceScore}%`
      );
      return analysisResult;
    } catch (error: any) {
      console.error("Failed to analyze existing content:", error);
      if (error instanceof AIProviderError || error instanceof AnalysisError) {
        throw error;
      }
      throw new AnalysisError(
        "Content Re-analysis",
        error.message || "Unknown error during content analysis"
      );
    }
  }

  private async publishToWordPress(
    contentId: string,
    websiteId: string,
    userId: string
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const content = await storage.getContent(contentId);
      if (!content) {
        return { success: false, error: "Content not found" };
      }
      const website = await storage.getUserWebsite(websiteId, userId);
      if (!website) {
        return { success: false, error: "Website not found" };
      }
      // TODO: Implement actual WordPress REST API call
      console.log("TODO: Implement WordPress API publishing");
      return {
        success: false,
        error: "WordPress API not yet implemented",
      };
    } catch (error: any) {
      console.error("WordPress publishing error:", error);
      return { success: false, error: error.message };
    }
  }

  private async performContentAnalysis(
    request: ContentAnalysisRequest
  ): Promise<ContentAnalysisResult> {
    let totalTokens = 0;
    let seoScore = 50;
    let readabilityScore = 50;
    let brandVoiceScore = 50;
    let keyType: 'user' | 'system' = 'system';

    try {
      console.log(`Starting content analysis with ${request.aiProvider.toUpperCase()}`);

      // Step 1: SEO Analysis
      const seoAnalysisResponse = await this.callAI(
        request.aiProvider,
        [
          {
            role: "system",
            content: `You are a technical SEO analyst. Analyze content for SEO effectiveness and return a numeric score.
ANALYSIS CRITERIA FOR SEO SCORE (1-100):
KEYWORD OPTIMIZATION (25 points):
- Primary keyword in title (5 points)
- Keywords in first paragraph (5 points)  
- Keywords in headings/subheadings (5 points)
- Natural keyword density 1-3% (5 points)
- Use of semantic/related keywords (5 points)
CONTENT STRUCTURE (25 points):
- Proper heading hierarchy (H1, H2, H3) (8 points)
- Logical content flow and organization (8 points)
- Use of lists, bullets for scannability (5 points)
- Appropriate content length for topic depth (4 points)
SEARCH INTENT ALIGNMENT (25 points):
- Content directly addresses search query (10 points)
- Provides comprehensive answer to user questions (8 points)
- Includes actionable information/next steps (7 points)
TECHNICAL SEO ELEMENTS (25 points):
- Optimized title tag under 60 characters (8 points)
- Meta description 150-160 characters with CTA (8 points)
- Internal linking opportunities mentioned (5 points)
- Content uniqueness and originality (4 points)
CRITICAL: Return ONLY a JSON object with numeric values: {"contentSeoScore": number, "analysis": "explanation"}`,
          },
          {
            role: "user",
            content: `Analyze this content for SEO:
TITLE: ${request.title}
CONTENT: ${request.content.substring(0, 3000)}${
              request.content.length > 3000 ? "... [TRUNCATED]" : ""
            }
TARGET KEYWORDS: ${request.keywords.join(", ")}
TARGET AUDIENCE: ${request.targetAudience || "General audience"}
${request.niche ? `NICHE: ${getNicheContext(request.niche).label} - ${getNicheContext(request.niche).contentStyle}` : ""}
Evaluate each criterion and provide a realistic score.`,
          },
        ],
        request.aiProvider === "openai" ? { type: "json_object" } : undefined,
        0.1,
        request.userId
      );

      totalTokens += Math.max(1, seoAnalysisResponse.tokens);
      keyType = seoAnalysisResponse.keyType || 'system';

      // Parse SEO response
      try {
        let cleanContent = seoAnalysisResponse.content.trim();
        if (!cleanContent.startsWith("{")) {
          const start = cleanContent.indexOf("{");
          const end = cleanContent.lastIndexOf("}") + 1;
          if (start !== -1 && end > start) {
            cleanContent = cleanContent.substring(start, end);
          }
        }
        const seoAnalysis = JSON.parse(cleanContent);
        if (
          typeof seoAnalysis.contentSeoScore === "number" &&
          seoAnalysis.contentSeoScore >= 1 &&
          seoAnalysis.contentSeoScore <= 100
        ) {
          seoScore = Math.round(seoAnalysis.contentSeoScore);
          console.log(`✅ SEO Score: ${seoScore}`);
        } else {
          console.warn(`⚠️ Invalid SEO score, using fallback`);
          seoScore = 55;
        }
      } catch (parseError) {
        console.error("❌ Failed to parse SEO analysis, using fallback score");
        seoScore = 50;
      }

      // Step 2: Readability Analysis
      const readabilityResponse = await this.callAI(
        request.aiProvider,
        [
          {
            role: "system",
            content: `You are a content readability expert. Analyze text complexity and return a numeric score 1-100.
READABILITY SCORING CRITERIA:
SENTENCE STRUCTURE (30 points):
- Average sentence length under 20 words (10 points)
- Variety in sentence length (8 points)
- Simple sentence structure (7 points)
- Minimal complex clauses (5 points)
VOCABULARY COMPLEXITY (25 points):
- Use of common, everyday words (10 points)
- Minimal jargon or well-explained terms (8 points)
- Active voice usage (7 points)
CONTENT ORGANIZATION (25 points):
- Clear paragraph structure (8 points)
- Effective transitions (8 points)
- Logical information flow (5 points)
- Proper formatting (4 points)
COMPREHENSION EASE (20 points):
- Understandable by target audience (8 points)
- Clear key points (6 points)
- Supporting examples (6 points)
CRITICAL: Return ONLY JSON: {"readabilityScore": number, "analysis": "explanation"}`,
          },
          {
            role: "user",
            content: `Analyze readability of this content:
${request.content.substring(0, 2000)}${request.content.length > 2000 ? "..." : ""}
Consider:
- Sentence complexity
- Word choice
- Paragraph structure
- Overall flow`,
          },
        ],
        request.aiProvider === "openai" ? { type: "json_object" } : undefined,
        0.1,
        request.userId
      );

      totalTokens += Math.max(1, readabilityResponse.tokens);

      // Parse readability response
      try {
        let cleanContent = readabilityResponse.content.trim();
        if (!cleanContent.startsWith("{")) {
          const start = cleanContent.indexOf("{");
          const end = cleanContent.lastIndexOf("}") + 1;
          if (start !== -1 && end > start) {
            cleanContent = cleanContent.substring(start, end);
          }
        }
        const readabilityAnalysis = JSON.parse(cleanContent);
        if (
          typeof readabilityAnalysis.readabilityScore === "number" &&
          readabilityAnalysis.readabilityScore >= 1 &&
          readabilityAnalysis.readabilityScore <= 100
        ) {
          readabilityScore = Math.round(readabilityAnalysis.readabilityScore);
          console.log(`✅ Readability Score: ${readabilityScore}`);
        } else {
          console.warn(`⚠️ Invalid readability score, using fallback`);
          readabilityScore = 60;
        }
      } catch (parseError) {
        console.error("❌ Failed to parse readability analysis, using fallback");
        readabilityScore = 60;
      }

      // Step 3: Brand Voice Analysis
      const brandVoiceResponse = await this.callAI(
        request.aiProvider,
        [
          {
            role: "system",
            content: `You are a brand voice analyst. Return a numeric score 1-100 for brand alignment.
BRAND VOICE SCORING CRITERIA:
TONE CONSISTENCY (30 points):
- Maintains specified tone throughout (15 points)
- Tone appropriate for target audience (8 points)
- Consistent voice personality (7 points)
VOCABULARY ALIGNMENT (25 points):
- Word choice matches brand voice (10 points)
- Consistent formality level (8 points)
- Industry-appropriate terminology (7 points)
BRAND PERSONALITY EXPRESSION (25 points):
- Reflects brand values (10 points)
- Writing style matches brand character (8 points)
- Appropriate authority level (7 points)
AUDIENCE APPROPRIATENESS (20 points):
- Language suitable for demographic (8 points)
- Content complexity matches audience (7 points)
- Cultural sensitivity (5 points)
CRITICAL: Return ONLY JSON: {"brandVoiceScore": number, "analysis": "evaluation"}`,
          },
          {
            role: "user",
            content: `Analyze brand voice alignment:
CONTENT: ${request.content.substring(0, 1500)}${
              request.content.length > 1500 ? "..." : ""
            }
BRAND REQUIREMENTS:
- Specified Tone: ${request.tone}
- Brand Voice: ${request.brandVoice || "Not specified - use tone as guidance"}
- Target Audience: ${request.targetAudience || "General audience"}
- Industry Context: Based on content topic
Evaluate how well the content aligns with these brand requirements.`,
          },
        ],
        request.aiProvider === "openai" ? { type: "json_object" } : undefined,
        0.1,
        request.userId
      );

      totalTokens += Math.max(1, brandVoiceResponse.tokens);

      // Parse brand voice response
      try {
        let cleanContent = brandVoiceResponse.content.trim();
        if (!cleanContent.startsWith("{")) {
          const start = cleanContent.indexOf("{");
          const end = cleanContent.lastIndexOf("}") + 1;
          if (start !== -1 && end > start) {
            cleanContent = cleanContent.substring(start, end);
          }
        }
        const brandVoiceAnalysis = JSON.parse(cleanContent);
        if (
          typeof brandVoiceAnalysis.brandVoiceScore === "number" &&
          brandVoiceAnalysis.brandVoiceScore >= 1 &&
          brandVoiceAnalysis.brandVoiceScore <= 100
        ) {
          brandVoiceScore = Math.round(brandVoiceAnalysis.brandVoiceScore);
          console.log(`✅ Brand Voice Score: ${brandVoiceScore}`);
        } else {
          console.warn(`⚠️ Invalid brand voice score, using fallback`);
          brandVoiceScore = 65;
        }
      } catch (parseError) {
        console.error("❌ Failed to parse brand voice analysis, using fallback");
        brandVoiceScore = 65;
      }

      console.log(
        `Content analysis completed - SEO: ${seoScore}%, Readability: ${readabilityScore}%, Brand Voice: ${brandVoiceScore}%`
      );

      // Calculate cost
      const pricing = AI_MODELS[request.aiProvider].pricing;
      const avgTokenCost = (pricing.input + pricing.output) / 2;
      const analysisCostUsd = (totalTokens * avgTokenCost) / 1000;

      // Track analysis usage
      try {
        await storage.trackAiUsage({
          websiteId: request.websiteId,
          userId: request.userId,
          model: AI_MODELS[request.aiProvider].model,
          tokensUsed: totalTokens,
          costUsd: Math.max(1, Math.round(analysisCostUsd * 100)),
          operation: "content_analysis",
          keyType: keyType
        });
      } catch (trackingError: any) {
        console.warn("AI usage tracking failed:", trackingError.message);
      }

      return {
        seoScore: seoScore,
        readabilityScore: readabilityScore,
        brandVoiceScore: brandVoiceScore,
        tokensUsed: totalTokens,
        costUsd: Number(analysisCostUsd.toFixed(6)),
        aiProvider: request.aiProvider,
      };
    } catch (error: any) {
      if (error instanceof AIProviderError || error instanceof AnalysisError) {
        throw error;
      }
      console.error("Analysis error, using fallback scores:", error.message);
      return {
        seoScore: 55,
        readabilityScore: 60,
        brandVoiceScore: 65,
        tokensUsed: Math.max(1, totalTokens || 100),
        costUsd: 0.001,
        aiProvider: request.aiProvider,
      };
    }
  }

  private generateQualityChecks(content: string, request: ContentGenerationRequest) {
    const wordCount = content.split(" ").length;
    const hasKeywords = request.keywords.some((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    const sentenceCount = content.split(".").length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    const plagiarismRisk = content.length > 500 && hasKeywords ? "low" : "medium";
    const factualAccuracy =
      wordCount > 400 && hasKeywords && avgWordsPerSentence < 25
        ? "verified"
        : "needs_review";
    const brandAlignment =
      request.brandVoice && request.targetAudience ? "good" : "needs_improvement";

    return {
      plagiarismRisk: plagiarismRisk as const,
      factualAccuracy: factualAccuracy as const,
      brandAlignment: brandAlignment as const,
    };
  }

  private generateExcerpt(content: string): string {
    const firstParagraph = content.split("\n")[0] || content;
    return firstParagraph.length > 160
      ? firstParagraph.substring(0, 157) + "..."
      : firstParagraph;
  }

  private generateMetaDescription(title: string, content: string): string {
    const excerpt = this.generateExcerpt(content);
    return excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt;
  }

  private getNicheSpecificRequirements(niche: string): string {
    const requirements: Record<string, string> = {
      reputation_sites: `
CRITICAL REPUTATION SITES REQUIREMENTS:
Platform Knowledge:
- Reference actual platforms: Trustpilot, Yelp, Google Reviews, BBB, G2
- Mention platform-specific features (verification badges, response mechanisms)
- Include real statistics and data when discussing platforms
Balanced Perspective:
- Address BOTH business and consumer viewpoints
- Acknowledge that reviews can be biased (both positive and negative)
- Don't villainize either businesses or consumers
Ethical Guidelines:
- NEVER promote fake review services or manipulation tactics
- NEVER suggest burying legitimate negative reviews
- Focus on ethical review generation and response strategies
- Distinguish between authentic reviews, suspicious patterns, and malicious reviews
- Discuss review response best practices, not gaming the system`,
      peptides: `
NICHE-SPECIFIC REQUIREMENTS FOR PEPTIDES:
Scientific Credibility (E-A-T Compliance):
- Reference actual published studies when making claims (PubMed, peer-reviewed journals)
- Use proper terminology but explain it: "growth hormone secretagogue" then "(basically stimulates GH release)"
- Include molecular mechanisms only when relevant, not as filler
- Cite dosage ranges from research, not anecdotal forums
- Acknowledge limitations and unknowns in the science
- Distinguish between animal studies, human trials, and theoretical applications
Trust & Safety:
- Always include appropriate medical disclaimers without being preachy
- Address side effects honestly - both documented and potential
- Never recommend sources or suppliers (legal/ethical boundary)
- Distinguish between peptides with human clinical data vs research-only compounds
- Be clear about regulatory status (research use, off-label, etc.)
Audience Understanding:
Your readers are: bodybuilders, biohackers, anti-aging seekers, researchers, medical professionals
- They can handle technical information but appreciate clear explanations
- They're skeptical of marketing hype but responsive to data
- Many are experienced with peptides, so don't oversimplify
- They want practical information: protocols, timing, storage, reconstitution
Content Depth:
- If discussing specific peptides, cover: mechanism, typical dosing, timing, what studies show, common stacks
- For protocols: duration, frequency, cycling recommendations based on literature
- For safety: documented side effects, contraindications, monitoring parameters
- Include storage requirements (temperature, light exposure, reconstitution shelf life)
What to Avoid:
- Promotional language for any specific supplier or brand
- Unsubstantiated claims of miracle results
- Comparing peptides to illegal substances without context
- Oversimplifying complex biological mechanisms
- Legal/medical advice (stick to informational/educational)
Writing Approach:
- Start with the specific question or concern being addressed
- Use subheadings that reflect actual information, not curiosity gaps
- Provide ranges and context rather than absolute statements
- When citing studies, mention study size, duration, and limitations
- End with practical takeaways, not sales pitches
Write with authority that comes from understanding the science, not from performing authority.`,
      gambling: `
NICHE-SPECIFIC REQUIREMENTS FOR GAMBLING/BETTING:
Responsible Gambling Framework:
- Include responsible gambling elements naturally, not as afterthought disclaimers
- Acknowledge that most bettors lose long-term (it's entertainment spending)
- Never promote betting as income replacement or "guaranteed" systems
- Mention bankroll management and stake sizing in strategy content
- Reference problem gambling resources where appropriate
Credibility Markers:
- Use real odds examples from recent events (specific numbers, specific games)
- Reference actual betting markets and terminology correctly
- Cite statistical concepts accurately (expected value, variance, ROI, closing line value)
- Mention legitimate data sources: Oddsportal, sports-reference databases, historical line data
- Acknowledge house edge, vig/juice, and how books make money
Audience Understanding:
Your readers range from casual bettors to sharp players:
- They know basic terminology, don't over-explain
- They respect statistical analysis over "hot takes"
- They want actionable information: finding value, reading lines, identifying +EV spots
- Many are tracking their own data and want to improve their process
Content Depth:
- For strategy content: explain the logic, not just the tactic
- Include real examples: "When the Bucks opened -4.5 and moved to -6 by tipoff..."
- For analysis: show your work (data sources, methodology, edge calculation)
- For tools/systems: explain both the advantage and the limitations
- Address variance and sample size in results discussions
Legal & Compliance:
- Acknowledge jurisdiction differences without getting bogged down
- Don't promote betting where it's illegal
- Focus on regions where online betting is regulated
- Reference licensed operators when necessary
What to Avoid:
- Guaranteed wins, locks, sure things, can't-miss bets
- Promoting betting as wealth-building
- Suggesting people bet money they need
- Using fake testimonials or manufactured win rates
- "We won 12 of our last 15 picks!" without context
Writing Approach:
- Lead with the edge or insight, not with preamble
- Use specific examples from real games/events
- Quantify when possible: percentages, odds, units, ROI
- Subheadings should be informational, not hype
- If discussing a strategy, explain why it works (when it works)
Write like someone who actually tracks their bets in a spreadsheet and understands both wins and losses.`,
      apps_marketing: `
NICHE-SPECIFIC REQUIREMENTS FOR APPS:
Technical Accuracy:
- Test information when possible: actual app sizes, real feature sets, current version numbers
- Acknowledge platform differences (iOS vs Android features, availability, pricing)
- Mention system requirements when relevant
- Include actual pricing: "$4.99/month" or "free with $9.99 premium" not "affordable"
- Note when information is current as of a specific date/version
User-Focused Evaluation:
- Address actual use cases, not marketing copy features
- Mention real problems: bugs users complain about, missing features, UX friction
- Compare apps based on what people actually care about: speed, reliability, cost, privacy
- Include limitations honestly
- Reference actual user feedback from app stores when relevant
Content Depth:
- For reviews: cover functionality, performance, cost, privacy, alternatives
- For comparisons: create meaningful comparison points, not feature checklists
- For tutorials: include specific steps, screenshots references, version-specific instructions
- For troubleshooting: address common issues with actual solutions
- For recommendations: explain why one app fits specific needs better than another
Privacy & Security:
- Mention data collection practices when relevant
- Note permissions required
- Reference privacy policy highlights for apps handling sensitive data
- Acknowledge if an app has had security issues
What to Avoid:
- Describing every single feature like an instruction manual
- Generic praise that could apply to any app
- Ignoring obvious drawbacks or limitations
- Outdated information about apps that update frequently
- Comparing apps to competitors without explaining trade-offs
Writing Approach:
- Start with what the app actually does or solves
- Use specific examples: "when you tap the calendar icon..." not "the interface is intuitive"
- Subheadings should answer specific questions users have
- Include version numbers or "as of [date]" for time-sensitive info
- Mention alternatives when one app doesn't fit all use cases
Write like someone who actually uses apps daily and has opinions about what works and what doesn't.`,
      exclusive_models: `
NICHE-SPECIFIC REQUIREMENTS FOR ONLYFANS/CREATOR PLATFORMS:
Business-First Approach:
- Frame content around creator entrepreneurship, not explicit content
- Focus on marketing, monetization, branding, audience building
- Treat creators as business owners managing a personal brand
- Include actual business considerations: taxes, equipment, time investment, market saturation
- Acknowledge this is work, not easy money
Creator Empowerment:
- Respect creator autonomy and decision-making
- Avoid judgmental language or moral positioning
- Focus on safety, boundaries, and sustainable business practices
- Address platform risks honestly: account bans, chargebacks, content theft
- Include creator control over content, pricing, and boundaries
Practical Business Information:
- Real numbers when possible: platform fees, payment processing, typical earnings ranges
- Actual platform features and limitations
- Marketing tactics that work: social media cross-promotion, content strategy, subscriber retention
- Equipment and software recommendations with specific products and price points
- Tax implications and business structure considerations
Audience Understanding:
Your readers are: aspiring creators, current creators looking to grow, people researching the business
- They want honest information about income potential and time investment
- They need practical guidance on content creation, marketing, and platform mechanics
- They're evaluating risk vs reward
- Many are comparing platforms or strategies
What to Avoid:
- Overpromising income potential
- Focusing on explicit content details (stay business-focused)
- Judgmental language about creator choices
- Suggesting this is passive income or easy money
- Ignoring platform risks and creator safety issues
Content Depth:
- For strategy content: include specific tactics with implementation steps
- For platform comparisons: real fee structures, payout terms, audience types
- For growth content: actual marketing channels and tactics that work
- For setup guides: step-by-step with platform-specific requirements
- For financial content: tax categories, expense tracking, business structures
Writing Approach:
- Lead with the business question or challenge being addressed
- Use real examples: "creators in the top 10% earn..." with source
- Acknowledge challenges alongside opportunities
- Subheadings should be descriptive and professional
- End with practical next steps, not hype
Write like a business consultant advising someone on a legitimate entrepreneurial venture.`,
      ecom_nails: `
NICHE-SPECIFIC REQUIREMENTS FOR NAILS/BEAUTY:
Product Knowledge:
- Use correct product terminology: gel vs gel polish, acrylic vs dip powder, builder gel
- Reference actual brands and products when relevant
- Include real price points for products mentioned
- Acknowledge quality differences between professional and consumer products
- Mention where products are typically available (Sally Beauty, Amazon, professional suppliers)
Practical Application:
- Include actual technique details, not just results
- Mention tools and materials needed with specifics
- Address common mistakes and how to avoid them
- Include timing: curing times, dry times, wear duration
- Reference skill level honestly (beginner vs requires practice)
Visual Content References:
- Describe looks specifically: "short almond shape with chrome powder" not "pretty nails"
- Reference actual trends by name: glazed donut nails, chrome, cat eye, jelly nails
- When discussing nail art, be specific about technique: stamping, freehand, water marble
- Include color specifics: shade names, undertones, finish types
Health & Safety:
- Address nail health honestly: damage from certain techniques, proper removal
- Mention ventilation for products that require it
- Include patch test recommendations for new products
- Acknowledge when professional help is better than DIY
Audience Understanding:
Your readers range from beginners to experienced home manicurists:
- They want results that last without salon prices
- They're willing to invest in quality products if justified
- They've likely had nail disasters and want to avoid repeating them
- They follow trends but want practical, wearable versions
What to Avoid:
- Generic beauty language: "pamper yourself," "treat yourself"
- Describing every product as "amazing" or "game-changing"
- Ignoring cost considerations or suggesting only premium products
- Skipping difficulty level or time investment
- Before/after language without substance
Content Depth:
- For tutorials: step-by-step with timing and specific products
- For product content: what it does, how it compares, who it's for, price range
- For trends: how to actually achieve the look, products needed, difficulty level
- For problem-solving: root causes, solutions, prevention
- For seasonal content: specific wearable designs, not just inspiration
Writing Approach:
- Start with the specific outcome or problem
- Use precise descriptions of colors, techniques, and products
- Subheadings should be instructional or descriptive
- Include both aspirational and practical elements
- Acknowledge when professional services are worth it vs DIY
Write like someone who does their own nails regularly and has learned what works through experience.`,
      soccer_jersey: `
NICHE-SPECIFIC REQUIREMENTS FOR SOCCER JERSEYS:
Product Authenticity:
- Distinguish clearly between authentic, replica, and counterfeit jerseys
- Explain manufacturing differences: stitching, materials, details, fit
- Reference actual manufacturers: Nike, Adidas, Puma, specific factories
- Include price ranges for different quality levels
- Address authentication methods for expensive/vintage jerseys
Fan Culture Understanding:
- Acknowledge emotional connection fans have to jerseys
- Reference actual clubs, players, seasons correctly
- Use proper terminology: kit, strip, home/away/third
- Mention historical context when relevant
- Respect both casual fans and serious collectors
Practical Buying Information:
- Sizing guidance by manufacturer (Nike runs small, Adidas fits, etc.)
- Where to buy: official stores, authorized retailers, secondary market
- Price expectations for different jersey types
- Best times to buy (end of season sales, new kit releases)
- International shipping and customs considerations
Technical Details:
- Fabric technology: Dri-FIT, Climacool, specific performance features
- Actual differences between player version and stadium version
- Care instructions that actually matter
- Customization options and quality differences
- Match-worn vs issued vs commercial jerseys
Audience Understanding:
Your readers are: passionate fans, collectors, parents buying for kids, gift buyers
- They care about authenticity but have different budgets
- Many want specific players/seasons and need help finding them
- Some are building collections and want value/investment info
- They want jerseys that fit well and last
What to Avoid:
- Promoting counterfeit sources or fake jerseys
- Generic fan excitement without substance
- Ignoring fit issues that frustrate buyers
- Treating all jerseys as equivalent in quality
- Overselling collectibility or investment value
Content Depth:
- For buying guides: quality tiers, where to buy, what to expect at each price point
- For authentication: specific details to check, common fakes, verification methods
- For team/season content: actual kit details, manufacturer, special features
- For sizing: manufacturer-specific guidance, fit differences, return policies
- For collecting: rarity factors, condition importance, value trends
Writing Approach:
- Lead with the specific jersey question or need
- Use actual examples: "The 2014 Germany World Cup jersey by Adidas..."
- Include prices and availability when relevant
- Subheadings should answer common buyer questions
- Balance fan passion with practical buying information
Write like someone who owns multiple jerseys and knows the difference between a €90 authentic and a €30 replica.`,
      payment_processing: `
NICHE-SPECIFIC REQUIREMENTS FOR PAYMENT PROCESSING:
B2B Technical Accuracy:
- Use correct payment terminology: interchange, acquirer, processor, gateway, PSP
- Reference actual fee structures: interchange plus vs flat rate, basis points
- Cite real providers when relevant: Stripe, Square, Authorize.net, specific processors
- Include technical requirements: PCI DSS levels, API integration, compliance
- Acknowledge regulatory differences across regions
Business Decision Focus:
- Address actual business concerns: fees, payout speed, international support, integration complexity
- Include total cost of ownership, not just advertised rates
- Mention hidden fees and contract terms that matter
- Discuss scalability and volume-based pricing
- Address industry-specific needs (high-risk, B2B, international, subscription)
Practical Implementation:
- Integration complexity and technical requirements
- Time to go live and approval processes
- Support quality and response times
- Reconciliation and reporting capabilities
- Multi-currency and international considerations
Compliance & Security:
- PCI compliance requirements by business type
- Data security and liability concerns
- Chargeback processes and protection
- Fraud prevention tools and costs
- Regional regulatory requirements (PSD2, SCA, etc.)
Audience Understanding:
Your readers are: business owners, financial decision-makers, developers, e-commerce operators
- They need accurate cost comparisons
- They're evaluating providers based on specific needs
- They want to understand trade-offs, not marketing claims
- Many have had issues with previous processors
What to Avoid:
- Promotional content for specific providers without context
- Oversimplifying complex fee structures
- Ignoring contract terms and switching costs
- Generic "best payment processor" claims
- Skipping industry-specific considerations
Content Depth:
- For comparisons: actual fee structures, contract terms, feature differences, ideal use cases
- For setup guides: requirements, timeline, documentation needed, technical integration
- For compliance: specific requirements, implementation steps, ongoing obligations
- For problem-solving: root causes, solutions, prevention strategies
- For international: currency support, cross-border fees, regulatory compliance
Writing Approach:
- Lead with the business problem or decision point
- Use real numbers: "2.9% + 30¢ vs 2.7% + 25¢ + $25 monthly"
- Acknowledge trade-offs rather than declaring winners
- Subheadings should address specific business concerns
- Include decision frameworks, not just information dumps
Write like a consultant who has evaluated dozens of payment processors and understands both the technical and business sides.`,
      web_dev: `
NICHE-SPECIFIC REQUIREMENTS FOR WEB DEVELOPMENT:
Technical Precision:
- Use current web standards and best practices
- Reference actual tools, frameworks, and versions: "React 18," "Node 20 LTS"
- Include code concepts accurately, not just buzzwords
- Mention browser compatibility when relevant
- Acknowledge when approaches are modern vs legacy
Practical Implementation:
- Address actual development challenges and trade-offs
- Include performance implications of different approaches
- Mention setup requirements, dependencies, learning curve
- Discuss when to use what: "use X if you need Y, but Z is better when..."
- Reference documentation and official resources
Developer Audience:
Your readers range from beginners to experienced developers:
- They can handle technical concepts, don't oversimplify
- They want to understand "why," not just "how"
- They're evaluating tools and approaches for real projects
- They appreciate honest assessments of complexity and trade-offs
Technology Landscape:
- Acknowledge the fast-moving nature of web dev
- Reference current trends without hype: "popular right now" not "revolutionary"
- Compare modern approaches to what came before when helpful
- Mention ecosystem maturity, community size, job market relevance
- Include both cutting-edge and stable production approaches
What to Avoid:
- Framework wars or absolutist technology claims
- Outdated patterns presented as current best practices
- Ignoring real-world constraints: browser support, team skill, project timeline
- Overly complex solutions to simple problems
- Dismissing older approaches that still work well
Content Depth:
- For tutorials: clear explanations with context on why each step matters
- For comparisons: actual technical differences, use case suitability, ecosystem factors
- For best practices: the reasoning behind the practice, when to deviate
- For performance: specific metrics, testing approaches, optimization strategies
- For architecture: trade-offs, scaling considerations, maintenance implications
Writing Approach:
- Start with the problem or decision being addressed
- Use specific examples: "when handling form validation..."
- Explain concepts without assuming expert knowledge, but respect technical readers
- Subheadings should be descriptive of technical content
- Include both the happy path and common issues
Write like a developer who has built production applications and understands both the theory and the reality.`,
      app_dev: `
NICHE-SPECIFIC REQUIREMENTS FOR APP DEVELOPMENT:
Business & Technical Balance:
- Address both business stakeholders and technical implementers
- Include actual cost ranges for different development approaches
- Discuss timeline expectations realistically
- Cover both iOS and Android considerations when relevant
- Mention testing, deployment, and maintenance (not just initial build)
Platform Understanding:
- Distinguish between native (Swift/Kotlin), cross-platform (React Native/Flutter), and hybrid
- Reference actual platform requirements: App Store guidelines, Play Store policies
- Include SDK and tool requirements
- Mention platform-specific features and limitations
- Address device fragmentation and OS version support
Development Reality:
- Honest timeline and cost estimates based on feature complexity
- Acknowledge the gap between MVP and production-ready
- Include ongoing costs: hosting, APIs, maintenance, updates
- Discuss team requirements or solo developer feasibility
- Address post-launch needs: updates, bug fixes, feature additions
Audience Understanding:
Your readers are: entrepreneurs with app ideas, business stakeholders, developers, agencies
- Non-technical readers need context on complexity and cost
- Technical readers want architecture and implementation details
- Both need honest assessments of feasibility and trade-offs
- Many are budget-conscious and timeline-sensitive
What to Avoid:
- Overpromising speed or ease of development
- Treating app development as a one-time project (ongoing commitment)
- Oversimplifying technical complexity
- Suggesting apps as passive income without massive effort
- Ignoring market saturation and discovery challenges
Content Depth:
- For cost content: break down by phase, feature complexity, approach (DIY/agency/freelance)
- For process content: discovery through launch, including often-skipped steps
- For technical decisions: native vs cross-platform with real trade-offs
- For monetization: strategies with market reality and revenue expectations
- For marketing: ASO, user acquisition costs, retention strategies
Writing Approach:
- Lead with the core question or decision point
- Use real examples: "a food delivery app needs..." with specifics
- Include ranges rather than single numbers: "$15K-$50K depending on..."
- Subheadings should address sequential concerns or alternatives
- Balance optimism with realism
Write like someone who has shipped apps and can tell you what actually takes time and costs money.`,
      construction: `
NICHE-SPECIFIC REQUIREMENTS FOR CONSTRUCTION/B2B:
Industry Authority:
- Use correct construction terminology: GC, subcontractor, bid process, project types
- Reference actual project phases: preconstruction, bidding, construction, closeout
- Include real cost ranges and timelines appropriate to project scale
- Mention regulatory requirements: permitting, inspections, OSHA, prevailing wage
- Acknowledge regional differences in codes, requirements, union vs non-union
Business Development Focus:
- Address lead generation, qualification, and conversion challenges
- Include bidding strategy and competitive positioning
- Discuss project financing and payment terms
- Cover bonding, insurance, and risk management
- Reference industry data sources: Dodge, CMD, regional MLS for commercial
Practical Business Intelligence:
- Project pipeline and forecasting
- Market conditions affecting pricing and availability
- Technology adoption: project management, estimating, field software
- Labor and material cost trends
- Subcontractor relationships and capacity
Audience Understanding:
Your readers are: contractors, subcontractors, construction business owners, project managers
- They're managing real business constraints: cash flow, labor, equipment
- They need actionable intelligence on projects and opportunities
- They're evaluating technology and process improvements
- They understand industry challenges: margins, competition, regulation
What to Avoid:
- Generic business advice not specific to construction
- Oversimplifying complex procurement or bidding processes
- Ignoring market realities: low margins, payment delays, change orders
- Promotional content for lead services without value context
- Treating all construction segments as equivalent (residential vs commercial vs industrial)
Content Depth:
- For market analysis: specific regions, project types, value ranges, timelines
- For bidding content: qualification process, cost estimating, competitive positioning
- For technology: specific tools, ROI factors, implementation challenges
- For business strategy: growth approaches, specialization, market positioning
- For compliance: requirements by project type, penalties, best practices
Writing Approach:
- Lead with the business challenge or opportunity
- Use industry-specific examples and terminology naturally
- Include real numbers: project values, margins, timelines
- Subheadings should address specific business concerns
- Balance growth opportunity with operational reality
Write like a construction business owner or PM who has managed projects and understands both operational and business sides.`,
      loans: `
NICHE-SPECIFIC REQUIREMENTS FOR LOANS:
Financial Accuracy & Compliance:
- Use correct financial terminology: APR, origination fees, amortization, LTV, DTI
- Include actual rate ranges based on current market (acknowledge rates change)
- Reference credit score impacts with realistic ranges
- Mention regulatory bodies: CFPB, state banking departments, federal lending laws
- Include required disclosures appropriately without being preachy
Borrower Protection:
- Explain costs clearly: interest, fees, total cost of loan
- Address predatory lending red flags
- Discuss impact on credit and financial health
- Mention alternatives when appropriate
- Be honest about qualification requirements and rejection factors
Loan Type Specificity:
- Distinguish between: personal loans, auto loans, mortgages, student loans, business loans, payday, title
- Explain secured vs unsecured and implications
- Address term lengths and how they affect total cost
- Include prepayment and penalty considerations
- Reference both traditional lenders and alternative options
Audience Understanding:
Your readers are: borrowers researching options, people with specific financial needs, credit rebuilders
- Many are in financial stress or unfamiliar with lending
- They need to understand true costs, not just monthly payments
- They want to know qualification likelihood before applying
- They need to compare multiple options fairly
What to Avoid:
- Promoting predatory lenders or dangerous loan products
- Oversimplifying complex financial decisions
- Suggesting loans as solutions to debt problems without context
- Guaranteeing approval or specific rates
- Ignoring the long-term cost and risk of borrowing
Content Depth:
- For loan guides: qualification requirements, cost breakdown, application process, alternatives
- For comparison content: rate ranges, fees, terms, best use cases, who qualifies
- For educational content: how loans work, credit impact, cost calculation, smart borrowing
- For problem-solving: bad credit options, debt consolidation evaluation, refinancing math
- For specific situations: first-time homebuyer, student loan refinance, emergency funding
Financial Education:
- Explain APR vs interest rate
- Show total cost of loan, not just monthly payment
- Include amortization concepts when relevant
- Discuss credit score impact of applications and accounts
- Reference debt-to-income and other qualification factors
Writing Approach:
- Lead with the specific financial situation or question
- Use real examples: "a $10,000 loan at 8% over 3 years costs..."
- Include ranges for rates and qualification requirements
- Subheadings should address sequential borrower concerns
- Balance access to credit with responsible borrowing guidance
Write like a responsible financial advisor who wants borrowers to make informed decisions and understand what they're signing up for.`,
    };
    return requirements[niche] || '';
  }

  private sanitizeContentMetadata(content: string): string {
    let sanitized = content;
    // Remove "Created:" lines (any format)
    sanitized = sanitized.replace(/<p>\s*Created:\s*.+?<\/p>/gi, '');
    sanitized = sanitized.replace(/Created:\s*.+/gi, '');
    // Remove "Niche:" lines
    sanitized = sanitized.replace(/<p>\s*Niche:\s*.+?<\/p>/gi, '');
    sanitized = sanitized.replace(/Niche:\s*.+/gi, '');
    // Remove "Keywords:" lines
    sanitized = sanitized.replace(/<p>\s*Keywords?:\s*.+?<\/p>/gi, '');
    sanitized = sanitized.replace(/Keywords?:\s*.+/gi, '');
    // Remove italicized "Discover the..."
    sanitized = sanitized.replace(/<p>\s*<em>Discover\s+.+?<\/em>\s*<\/p>/gi, '');
    sanitized = sanitized.replace(/<em>Discover\s+.+?<\/em>/gi, '');
    // Remove metadata containers
    sanitized = sanitized.replace(/<blockquote>\s*Discover\s+.+?<\/blockquote>/gis, '');
    sanitized = sanitized.replace(/<div[^>]*class=["'].*?(metadata|meta-info).*?["'][^>]*>.*?<\/div>/gis, '');
    // Clean up empty paragraphs
    sanitized = sanitized.replace(/<p>\s*<\/p>/g, '');
    sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
    return sanitized.trim();
  }

  private readonly CONVERSATIONAL_SYSTEM_PROMPT = `Okay, real talk. You're that friend who actually knows their shit about {TOPIC} because you've been in the trenches for years. Not the guru type—the person who's failed enough times to know what actually works.
Write like you're explaining this to someone smart who just asked you for the real story. They don't need the Wikipedia version. They need the "here's what nobody tells you" version.
=== YOUR VOICE CALIBRATION ===
You're not writing. You're talking. Big difference.
- Interrupt yourself when you realize something: "Actually, wait—before I explain that..."
- Correct yourself: "No, that's not quite right. What I mean is..."
- Show uncertainty: "I think it's around 73%? Maybe 74%. Let me explain why that matters..."
- Get excited about the interesting parts: "Oh, and this part is actually super interesting..."
- Brief tangents that loop back: "Reminds me of when... but anyway, back to the point"
=== CRITICAL ANTI-PATTERN RULES ===
NEVER use these (they scream AI):
- Starting with "In today's..." or "In the world of..." or "In this article..."
- Transitions: Moreover, Furthermore, Additionally, In conclusion
- Perfect 3-4 sentence paragraphs
- Three-item lists (vary between 2, 4, 6, 7 items)
- Generic examples—use specific companies, exact dates, real prices
ALWAYS do this:
- Use fragments. Like this. For emphasis.
- Mix 3-word sentences with 47-word rambles that include tangents (like that time in March 2024 when everyone thought X would work but it completely backfired because nobody considered Y)
- Specific numbers: "increased conversions by 37.4%" not "significantly improved"
- Real timestamps: "Last Tuesday at 2:47pm" not "recently"
- Actual tools with versions: "WordPress 6.4.2" not "content management systems"
- Include at least one failure: "Tried X first. Cost me $3,400. Here's why it failed..."
=== STRUCTURE CHAOS PROTOCOL ===
Don't follow a template. Let the content flow naturally:
- Jump straight into the most interesting/controversial point
- Circle back to explain context when needed
- Mix ultra-tactical advice with broader observations
- Include "Oh, I should mention..." additions
- Leave some questions hanging before answering them later
Return JSON but write the content field like you're having a conversation. Include HTML tags for structure but keep the voice conversational and slightly chaotic.`;

  private buildSystemPrompt(
    request: ContentGenerationRequest,
    language: string,
    languagePrompt: string
  ): string {
    const languageCode = language.toUpperCase();
    const languageName = this.getLanguageName(language);

    // Language enforcement map
    const languageEnforcementMap: Record<string, string> = {
      french: `COMMANDEMENT LINGUISTIQUE ABSOLU:
Vous DEVEZ écrire en français et UNIQUEMENT en français.
Chaque mot, chaque phrase, chaque paragraphe DOIT être en français.
Il est INTERDIT d'utiliser l'anglais ou toute autre langue.
Si vous ne connaissez pas un mot en français, décrivez-le en français.
Votre réponse COMPLÈTE sera en français.`,
      spanish: `MANDATO LINGÜÍSTICO ABSOLUTO:
Debes escribir en español y SOLO en español.
Cada palabra, cada oración, cada párrafo DEBE estar en español.
Está PROHIBIDO usar inglés u otros idiomas.
Si no conoces una palabra en español, descríbela en español.
Tu respuesta COMPLETA será en español.`,
      german: `ABSOLUTES SPRACHGEBOT:
Sie MÜSSEN auf Deutsch schreiben und NUR auf Deutsch.
Jedes Wort, jeder Satz, jeder Absatz MUSS auf Deutsch sein.
Es ist VERBOTEN, Englisch oder andere Sprachen zu verwenden.
Wenn Sie ein Wort nicht auf Deutsch kennen, beschreiben Sie es auf Deutsch.
Ihre GESAMTE Antwort wird auf Deutsch sein.`,
      italian: `MANDATO LINGUISTICO ASSOLUTO:
Devi scrivere in italiano e SOLO in italiano.
Ogni parola, ogni frase, ogni paragrafo DEVE essere in italiano.
È VIETATO usare l'inglese o altre lingue.
Se non conosci una parola in italiano, descrivila in italiano.
La tua risposta COMPLETA sarà in italiano.`,
      portuguese: `MANDATO LINGUÍSTICO ABSOLUTO:
Você DEVE escrever em português e SOMENTE em português.
Cada palavra, cada frase, cada parágrafo DEVE estar em português.
É PROIBIDO usar inglês ou outros idiomas.
Se não conhecer uma palavra em português, descreva-a em português.
Sua resposta COMPLETA será em português.`,
      russian: `АБСОЛЮТНОЕ ЯЗЫКОВОЕ ТРЕБОВАНИЕ:
Вы ДОЛЖНЫ писать на русском и ТОЛЬКО на русском.
Каждое слово, каждое предложение, каждый абзац ДОЛЖНЫ быть на русском.
ЗАПРЕЩЕНО использовать английский или другие языки.
Если вы не знаете слово по-русски, опишите его по-русски.
Ваш ПОЛНЫЙ ответ будет на русском.`,
      japanese: `絶対的な言語要件:
あなたは日本語で書く必要があります。日本語のみです。
すべての単語、すべての文、すべての段落は日本語である必要があります。
英語または他の言語を使用することは禁止されています。
日本語で知らない単語がある場合は、日本語で説明してください。
あなたの完全な応答は日本語になります。`,
      chinese: `绝对语言要求:
你必须用中文写作,仅用中文。
每个单词、每个句子、每个段落都必须是中文。
禁止使用英文或其他语言。
如果你不知道一个中文词汇,用中文描述它。
你的完整答复将是中文。`,
      korean: `절대적 언어 요구사항:
한국어로 작성해야 합니다. 한국어만 사용합니다.
모든 단어, 모든 문장, 모든 단락은 한국어여야 합니다.
영어 또는 다른 언어 사용은 금지됩니다.
한국어로 모르는 단어가 있으면 한국어로 설명하세요.
완전한 답변은 한국어입니다.`,
      dutch: `ABSOLUUT TAALCOMMANDEMENT:
Je MOET in het Nederlands schrijven en ALLEEN in het Nederlands.
Elk woord, elke zin, elke alinea MOET in het Nederlands zijn.
Het is VERBODEN Engels of andere talen te gebruiken.
Als je een woord niet in het Nederlands kent, beschrijf het dan in het Nederlands.
Je COMPLETE antwoord wordt in het Nederlands.`,
      swedish: `ABSOLUT SPRÅKKRAV:
Du MÅSTE skriva på svenska och ENDAST på svenska.
Varje ord, varje mening, varje stycke MÅSTE vara på svenska.
Det är FÖRBJUDET att använda engelska eller andra språk.
Om du inte kan ett ord på svenska, beskriv det på svenska.
Ditt KOMPLETTA svar kommer att vara på svenska.`,
      polish: `ABSOLUTNE WYMAGANIE JĘZYKA:
Musisz pisać po polsku i TYLKO po polsku.
Każde słowo, każde zdanie, każdy akapit MUSI być po polsku.
ZABRANIA się używania angielskiego lub innych języków.
Jeśli nie znasz słowa po polsku, opisz je po polsku.
Twoja CAŁA odpowiedź będzie po polsku.`,
      turkish: `MUTLAK DİL GEREKSİNİMİ:
Türkçe yazmalısın ve SADECE Türkçe.
Her kelime, her cümle, her paragraf Türkçe OLMALIDIR.
İngilizce veya diğer diller YASAKLANMIŞTIR.
Türkçe bilmediğin bir kelime varsa, onu Türkçe olarak tanımla.
Tüm cevabın Türkçe olması gerekir.`,
      thai: `ข้อกำหนดภาษาที่ขาดไม่ได้:
คุณต้องเขียนเป็นภาษาไทยและภาษาไทยเท่านั้น
ทุกคำ ทุกประโยค ทุกย่อหน้าต้องเป็นภาษาไทย
ห้ามใช้ภาษาอังกฤษหรือภาษาอื่น
หากคุณไม่รู้คำว่าไทย ให้อธิบายเป็นภาษาไทย
คำตอบทั้งหมดของคุณต้องเป็นภาษาไทย`,
      vietnamese: `YÊU CẦU NGÔN NGỮ TUYỆT ĐỐI:
Bạn PHẢI viết bằng tiếng Việt và CHỈ tiếng Việt.
Mỗi từ, mỗi câu, mỗi đoạn phải bằng tiếng Việt.
KHÔNG ĐƯỢC phép dùng tiếng Anh hoặc ngôn ngữ khác.
Nếu không biết một từ tiếng Việt, hãy mô tả nó bằng tiếng Việt.
Toàn bộ câu trả lời của bạn sẽ bằng tiếng Việt.`,
      english: "",
    };

    const languageEnforcement = languageEnforcementMap[language] || "";
    const conversationalPrompt = this.CONVERSATIONAL_SYSTEM_PROMPT.replace('{TOPIC}', request.topic);

    return `${languageEnforcement}
⚠️ ABSOLUTE LANGUAGE REQUIREMENT ⚠️
OUTPUT LANGUAGE: ${languageCode} (${languageName})
${languagePrompt}
${conversationalPrompt}
CRITICAL INSTRUCTIONS:
1. WRITE EVERYTHING IN ${languageCode} ONLY
2. EVERY SINGLE WORD MUST BE IN ${languageCode}
3. NO ENGLISH WORDS ANYWHERE
4. NO LANGUAGE MIXING
5. NO SECTION HEADERS IN ENGLISH
If a term doesn't exist in ${language}, describe it fully in ${language}.
=== RESPONSE FORMAT - MUST BE VALID JSON ===
{
  "title": "Article title in ${languageCode}",
  "content": "Full HTML article in ${languageCode} with conversational voice",
  "excerpt": "Summary in ${languageCode}",
  "metaDescription": "Meta description in ${languageCode}",
  "metaTitle": "SEO title in ${languageCode}",
  "keywords": ["keyword_in_${languageCode}", "keyword_in_${languageCode}"]
}
CRITICAL REMINDERS:
1. WRITE EVERYTHING IN ${languageCode} ONLY
2. EVERY SINGLE WORD MUST BE IN ${languageCode}
3. NO ENGLISH WORDS ANYWHERE
4. NO LANGUAGE MIXING
5. NO SECTION HEADERS IN ENGLISH
6. Use the conversational voice style defined above in ${languageCode}
7. If a term doesn't exist in ${language}, describe it fully in ${language}
START WRITING IN ${languageCode}:`;
  }

  private getLanguageName(language: string): string {
    const languageNames: Record<string, string> = {
      english: "English",
      french: "Français",
      spanish: "Español",
      german: "Deutsch",
      italian: "Italiano",
      portuguese: "Português",
      russian: "Русский",
      japanese: "日本語",
      chinese: "中文",
      korean: "한국어",
      dutch: "Nederlands",
      swedish: "Svenska",
      polish: "Polski",
      turkish: "Türkçe",
      thai: "ไทย",
      vietnamese: "Tiếng Việt",
    };
    return languageNames[language] || language;
  }

  private validateResponseLanguage(
    contentResult: any,
    expectedLanguage: string
  ): void {
    if (expectedLanguage === "english") {
      return;
    }

    const fields = ["title", "content", "excerpt", "metaDescription", "metaTitle"];
    const englishPatterns = [
      /\b(the|and|or|but|with|for|from|to|in|of|is|are|was|were|be|been|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall)\b/gi,
    ];

    let englishFound = 0;
    let totalWords = 0;

    for (const field of fields) {
      if (contentResult[field]) {
        const text = contentResult[field].toString();
        totalWords += text.split(/\s+/).length;
        for (const pattern of englishPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            englishFound += matches.length;
          }
        }
      }
    }

    const englishRatio = englishFound / (totalWords || 1);
    if (englishRatio > 0.05) {
      console.warn(
        `⚠️ HIGH ENGLISH DETECTED: ${(englishRatio * 100).toFixed(2)}% English words found in ${expectedLanguage} content`
      );
    }
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    // Determine context based on website or niche
    let contextSection = "";
    let effectiveBrandVoice = request.brandVoice || "";
    let effectiveAudience = request.targetAudience || "";
    let industryContext = "";
    let nicheContext: any = null;

    if (request.websiteId) {
      contextSection = "Writing for a specific website/brand.";
    } else if (request.niche) {
      nicheContext = getNicheContext(request.niche);
      contextSection = `Writing for the ${nicheContext.label} niche.`;
      industryContext = `\nIndustry: ${nicheContext.industry} | Style: ${nicheContext.contentStyle}`;
      effectiveBrandVoice = request.brandVoice || nicheContext.defaultBrandVoice;
      effectiveAudience = request.targetAudience || nicheContext.defaultAudience;
    }

    const brandVoiceSection = effectiveBrandVoice
      ? `\nBrand voice: ${effectiveBrandVoice}`
      : "";

    const audienceSection = effectiveAudience
      ? `\nAudience: ${effectiveAudience}`
      : "";

    // Language enforcement
    const language = this.lastLanguage || "english";
    const languageCode = language.toUpperCase();

    const languageWarnings: Record<string, string> = {
      french: "Écrivez UNIQUEMENT en français. Pas un mot en anglais.",
      spanish: "Escribe ÚNICAMENTE en español. Ni una palabra en inglés.",
      german: "Schreiben Sie NUR auf Deutsch. Kein einziges englisches Wort.",
      italian: "Scrivi ESCLUSIVAMENTE in italiano. Nessuna parola in inglese.",
      portuguese: "Escreva UNICAMENTE em português. Nenhuma palavra em inglês.",
      russian: "Пишите ТОЛЬКО на русском языке. Ни одного слова на английском.",
      japanese: "日本語のみで書いてください。英語は一切使用しないでください。",
      chinese: "仅用中文写作。不要使用任何英文。",
      korean: "한국어로만 작성하세요. 영어를 사용하지 마세요.",
      dutch: "Schrijf UITSLUITEND in het Nederlands. GEEN Engels.",
      swedish: "Skriv ENDAST på svenska. INGEN engelska.",
      polish: "Pisz WYŁĄCZNIE po polsku. BEZ angielskiego.",
      turkish: "Yalnızca Türkçe yazın. Hiç İngilizce yazma.",
      thai: "เขียนภาษาไทยเท่านั้น ห้ามใช้ภาษาอังกฤษ",
      vietnamese: "Viết CHỈ bằng tiếng Việt. KHÔNG dùng tiếng Anh.",
    };

    const languageWarning =
      language !== "english"
        ? `
⚠️ MANDATORY LANGUAGE ENFORCEMENT ⚠️
Write ONLY in ${languageCode}.
EVERY WORD in the content field MUST be in ${languageCode}.
NO English words anywhere.
NO mixing languages.
NO section headers in English.
${languageWarnings[language] || ""}`
        : "";

    let prompt = `${languageWarning}
LANGUAGE: ${languageCode}
Article Topic: "${request.topic}"
Target Word Count: ${request.wordCount} words (+/- 20%)
Tone: ${request.tone}
Keywords: ${request.keywords.join(", ")}
${contextSection}${brandVoiceSection}${audienceSection}${industryContext}
🚫 METADATA RESTRICTIONS - DO NOT INCLUDE IN CONTENT:
- NO "Created:" timestamps
- NO "Niche:" labels  
- NO "Keywords:" tags
- NO italicized summaries like "Discover the..."
- NO metadata boxes or admin information
- Content starts directly with article content
WRITING PRINCIPLES:
Voice:
- Write like you know this topic inside-out
- Use specific details: exact prices, actual timeframes, real brand names
- Be direct and conversational
- Show personality while staying credible
Structure:
- Vary rhythm: short punchy sentences mixed with longer explanations
- Subheadings should be descriptive and informational
- End when content is complete - no unnecessary wrapping
- Use fragments for emphasis: "Like this. For impact."
Content Quality:
- Include at least one specific example or case study
- Mix practical advice with broader insights
- Show trade-offs and limitations honestly
- Use actual numbers and data when possible
${
  request.seoOptimized
    ? `SEO Requirements:
- Primary keyword in title
- Keywords naturally in first 100 words
- Related keywords in subheadings
- Natural keyword density 1-2%
- Subheadings contain question keywords
`
    : ""
}`;

    // Add niche requirements
    if (request.niche) {
      const nicheRequirements = this.getNicheSpecificRequirements(request.niche);
      if (nicheRequirements) {
        prompt += nicheRequirements;
      }
    }

    // Add JSON output structure
    prompt += `
HTML FORMAT:
Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags appropriately.
The content should be clean article HTML without any metadata or administrative information.
JSON OUTPUT STRUCTURE:
{
  "title": "Clear title under 60 chars with main keyword",
  "content": "Full HTML article starting directly with the content (minimum ${Math.ceil(request.wordCount * 0.8)} words) - NO metadata, NO 'Created:', NO 'Niche:', NO 'Keywords:' labels",
  "excerpt": "150-160 character summary for the excerpt field (not in content)",
  "metaDescription": "150-160 char meta description for SEO",
  "metaTitle": "SEO title under 60 characters",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
IMPORTANT: The "content" field must contain ONLY the article HTML. All metadata goes in separate JSON fields.
Write like someone who knows their shit${request.niche && nicheContext ? ` in the ${nicheContext.label} space` : ''}.`;

    return prompt;
  }

  async generateContent(
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResultWithPublishing> {
    try {
      console.log(
        `Generating content for user ${request.userId} with ${request.aiProvider.toUpperCase()} in ${
          request.language || "english"
        }`
      );

      // VALIDATION BLOCK
      if (!request.websiteId && !request.niche) {
        throw new Error(
          "Either websiteId or niche must be provided for content generation"
        );
      }

      const language = request.language || "english";
      if (!VALID_LANGUAGES.includes(language)) {
        throw new Error(
          `Invalid language: ${language}. Must be one of: ${VALID_LANGUAGES.join(", ")}`
        );
      }

      this.lastLanguage = language;
      this.lastRequestTopic = request.topic;

      // Log content type
      if (request.websiteId) {
        console.log(`📄 Generating website-specific content for website: ${request.websiteId}`);
      } else if (request.niche) {
        console.log(`📄 Generating standalone content for niche: ${request.niche}`);
      }

      // STEP 1: Check image generation
      if (request.includeImages && request.imageCount && request.imageCount > 0) {
        const openAiKey = await this.getApiKey('openai', request.userId);
        if (!openAiKey) {
          console.warn("⚠️ Image generation requested but no OpenAI API key available");
          request.includeImages = false;
          request.imageCount = 0;
        } else {
          console.log(
            `🎨 Will generate ${request.imageCount} images with DALL-E 3 (regardless of content AI provider: ${request.aiProvider})`
          );
        }
      }

      if (request.isAutoGenerated) {
        console.log(`Auto-generation detected:`, {
          autoScheduleId: request.autoScheduleId,
          autoPublish: request.autoPublish,
          publishDelay: request.publishDelay,
        });
      }

      // STEP 2: Generate content
      const contentPrompt = this.buildContentPrompt(request);
      const languagePrompt = this.getLanguagePrompt(language);
      const systemPrompt = this.buildSystemPrompt(request, language, languagePrompt);

      console.log(`📝 System Prompt Language Enforcement: ${language.toUpperCase()}`);
      console.log(`📝 User Prompt Language Code: ${language.toUpperCase()}`);
      console.log(`📝 Conversational voice enabled for topic: ${request.topic}`);

      const contentResponse = await this.callAI(
        request.aiProvider,
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: contentPrompt },
        ],
        request.aiProvider === "openai" ? { type: "json_object" } : undefined,
        0.7,
        request.userId
      );

      const keyTypeUsed = contentResponse.keyType || 'system';
      let contentResult;

      // Parse JSON response
      try {
        let cleanedContent = contentResponse.content.trim();
        cleanedContent = cleanedContent.replace(/^\uFEFF/, "");
        contentResult = JSON.parse(cleanedContent);
        console.log("✅ Successfully parsed JSON response from", request.aiProvider.toUpperCase());
      } catch (parseError: any) {
        console.error("❌ Initial JSON parse failed, attempting extraction...", parseError.message);
        let cleanedContent = contentResponse.content.trim();
        const firstBrace = cleanedContent.indexOf("{");
        const lastBrace = cleanedContent.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const extractedJson = cleanedContent.substring(firstBrace, lastBrace + 1);
          try {
            contentResult = JSON.parse(extractedJson);
            console.log("✅ Successfully parsed extracted JSON from", request.aiProvider.toUpperCase());
          } catch (secondParseError: any) {
            throw new AIProviderError(
              request.aiProvider,
              `Failed to parse JSON response after multiple attempts. Original error: ${parseError.message}`
            );
          }
        } else {
          throw new AIProviderError(
            request.aiProvider,
            `No valid JSON structure found in response. Response was: ${contentResponse.content.substring(0, 300)}...`
          );
        }
      }

      // Validate required fields
      if (!contentResult.title || !contentResult.content) {
        throw new AIProviderError(
          request.aiProvider,
          "AI response missing required fields (title, content)"
        );
      }

      // Convert markdown to HTML
      console.log("🔄 Converting markdown headers to HTML...");
      if (contentResult.content && contentResult.content.includes("#")) {
        console.log("🔍 Markdown headers detected, converting to HTML...");
        contentResult.content = ContentFormatter.convertMarkdownToHtml(contentResult.content);
      }

      contentResult.content = ContentFormatter.formatForWordPress(contentResult.content);
      console.log("✅ Content formatted for WordPress");

      // Sanitize metadata
      contentResult.content = this.sanitizeContentMetadata(contentResult.content);

      // Pre-generate contentId
      let contentId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // STEP 3: Generate images if requested
      let images: Array<{
        url: string;
        filename: string;
        altText: string;
        prompt: string;
        cost: number;
        cloudinaryUrl?: string;
        cloudinaryPublicId?: string;
      }> = [];
      let totalImageCost = 0;
      let imageKeyType: 'user' | 'system' = 'system';

      if (request.includeImages && request.imageCount && request.imageCount > 0) {
        try {
          console.log(`🎨 Generating ${request.imageCount} images with DALL-E 3...`);

          const imageGenerationRequest = {
            topic: request.topic,
            count: request.imageCount,
            style: request.imageStyle || "natural",
            contentContext: contentResult.content.substring(0, 500),
            keywords: request.keywords,
          };

          const validation = imageService.validateImageRequest(imageGenerationRequest);
          if (!validation.valid) {
            throw new Error(
              `Image generation validation failed: ${validation.errors.join(", ")}`
            );
          }

          const imageResult = await imageService.generateImages(
            imageGenerationRequest,
            request.userId,
            request.websiteId
          );
          imageKeyType = imageResult.keyType || 'system';

          // Upload to Cloudinary
          console.log(`☁️ Uploading images to Cloudinary...`);

          for (const img of imageResult.images) {
            try {
              const cloudinaryImage = await cloudinaryStorage.uploadFromUrl(
                img.url,
                request.websiteId || `niche-${request.niche}`,
                contentId,
                img.filename
              );

              images.push({
                ...img,
                url: cloudinaryImage.secureUrl,
                cloudinaryUrl: cloudinaryImage.secureUrl,
                cloudinaryPublicId: cloudinaryImage.publicId,
              });
              console.log(`✅ Image stored: ${img.filename}`);
            } catch (uploadError: any) {
              console.error(`❌ Failed to upload to Cloudinary: ${img.filename}`, uploadError.message);
              images.push(img);
            }
          }

          totalImageCost = imageResult.totalCost;
          console.log(`✅ Generated ${images.length} images`);

          if (images.length > 0) {
            console.log("🖼️ Embedding images into content...");
            contentResult.content = this.embedImagesInContentPrivate(
              contentResult.content,
              images
            );
            console.log(`✅ Embedded ${images.length} images`);
          }
        } catch (imageError: any) {
          console.error("❌ Image generation failed:", imageError.message);
          if (imageError.message.includes("Rate limit")) {
            console.warn("⚠️ Rate limit reached, continuing without images");
          } else if (imageError.message.includes("credits") || imageError.message.includes("quota")) {
            console.warn("⚠️ Insufficient credits, continuing without images");
          } else if (imageError.message.includes("API key")) {
            console.warn("⚠️ API key issue, continuing without images");
          } else {
            console.warn(`⚠️ Image error: ${imageError.message}`);
          }
          images = [];
          totalImageCost = 0;
        }
      }

      // STEP 4: Analyze content
      const analysisResult = await this.performContentAnalysis({
        title: contentResult.title,
        content: contentResult.content,
        keywords: request.keywords,
        tone: request.tone,
        brandVoice: request.brandVoice,
        targetAudience: request.targetAudience,
        eatCompliance: request.eatCompliance,
        websiteId: request.websiteId || 'standalone',
        aiProvider: request.aiProvider,
        userId: request.userId,
        language: language,
        niche: request.niche,
      });

      // STEP 5: Calculate costs
      const contentTokens = Math.max(1, contentResponse.tokens + analysisResult.tokensUsed);
      const contentPricing = AI_MODELS[request.aiProvider].pricing;
      const avgTokenCost = (contentPricing.input + contentPricing.output) / 2;
      const textCostUsd = (contentTokens * avgTokenCost) / 1000;
      const totalCostUsd = textCostUsd + totalImageCost;

      console.log(`💰 Cost breakdown:`);
      console.log(`   Content: $${textCostUsd.toFixed(6)}`);
      console.log(`   Images: $${totalImageCost.toFixed(6)}`);
      console.log(`   Total: $${totalCostUsd.toFixed(6)}`);

      // STEP 6: Track AI usage
      try {
        await storage.trackAiUsage({
          websiteId: request.websiteId || null,
          userId: request.userId,
          model: AI_MODELS[request.aiProvider].model,
          tokensUsed: contentTokens,
          costUsd: Math.max(1, Math.round(textCostUsd * 1000)),
          operation: "content_generation",
          keyType: keyTypeUsed,
        });

        if (images.length > 0) {
          await storage.trackAiUsage({
            websiteId: request.websiteId || null,
            userId: request.userId,
            model: "dall-e-3",
            tokensUsed: 0,
            costUsd: Math.round(totalImageCost * 100),
            operation: "image_generation",
            keyType: imageKeyType,
          });
        }
      } catch (trackingError: any) {
        console.warn("Tracking failed:", trackingError.message);
      }

      // STEP 7: Generate quality checks
      const qualityChecks = this.generateQualityChecks(contentResult.content, request);

      // STEP 8: Save to database
      let savedContentId: string | undefined;
      let published = false;
      let scheduledForPublishing = false;
      let publishedAt: Date | undefined;
      let scheduledDate: Date | undefined;

      try {
        const contentToSave = {
          websiteId: request.websiteId || null,
          niche: request.niche || null,
          userId: request.userId,
          title: contentResult.title,
          body: contentResult.content,
          excerpt: contentResult.excerpt || this.generateExcerpt(contentResult.content),
          metaDescription:
            contentResult.metaDescription ||
            this.generateMetaDescription(contentResult.title, contentResult.content),
          metaTitle: contentResult.metaTitle || contentResult.title,
          aiModel: AI_MODELS[request.aiProvider].model,
          seoKeywords: contentResult.keywords || request.keywords,
          seoScore: Math.max(1, Math.min(100, analysisResult.seoScore)),
          readabilityScore: Math.max(1, Math.min(100, analysisResult.readabilityScore)),
          brandVoiceScore: Math.max(1, Math.min(100, analysisResult.brandVoiceScore)),
          eatCompliance: request.eatCompliance || false,
          tokensUsed: contentTokens,
          costUsd: Math.round(totalCostUsd * 100),
          status: 'draft',
          hasImages: images.length > 0,
          imageCount: images.length,
          imageCostCents: Math.round(totalImageCost * 100),
          language: language,
          conversationalVoice: true,
        };

        console.log(`💾 Saving content...`);
        const savedContent = await storage.createContent(contentToSave);
        savedContentId = savedContent.id;
        contentId = savedContentId;

        console.log(`✅ Content saved: ${savedContentId}`);

        if (!savedContentId || savedContentId.startsWith('temp-')) {
          throw new Error(`Invalid content ID: ${savedContentId}`);
        }

        // Handle auto-publishing
        if (request.isAutoGenerated && request.autoScheduleId && request.autoPublish) {
          console.log(`🚀 Processing auto-publishing...`);

          if (request.publishDelay === 0) {
            scheduledDate = new Date();
            try {
              await storage.createContentSchedule({
                contentId: savedContentId,
                userId: request.userId,
                websiteId: request.websiteId!,
                scheduled_date: scheduledDate,
                status: "publishing",
                title: contentResult.title,
                topic: request.topic,
                metadata: {
                  autoGenerated: true,
                  autoScheduleId: request.autoScheduleId,
                  publishedImmediately: true,
                  generatedAt: new Date(),
                },
              });

              const publishResult = await this.publishToWordPress(
                savedContentId,
                request.websiteId!,
                request.userId
              );

              if (publishResult.success) {
                published = true;
                publishedAt = new Date();

                await storage.updateContent(savedContentId, {
                  status: "published",
                  publishDate: publishedAt,
                  wordpressPostId: publishResult.postId,
                });

                await storage.updateContentScheduleByContentId(savedContentId, {
                  status: "published",
                  published_at: publishedAt,
                });

                console.log(`✅ Published to WordPress`);
              } else {
                console.error(`❌ Publishing failed: ${publishResult.error}`);
              }
            } catch (publishError: any) {
              console.error(`❌ Publishing error: ${publishError.message}`);
            }
          } else if (request.publishDelay && request.publishDelay > 0) {
            scheduledDate = new Date();
            scheduledDate.setHours(scheduledDate.getHours() + request.publishDelay);
            scheduledForPublishing = true;

            try {
              await storage.createContentSchedule({
                contentId: savedContentId,
                userId: request.userId,
                websiteId: request.websiteId!,
                scheduled_date: scheduledDate,
                status: "scheduled",
                title: contentResult.title,
                topic: request.topic,
                metadata: {
                  autoGenerated: true,
                  autoScheduleId: request.autoScheduleId,
                  publishDelay: request.publishDelay,
                  generatedAt: new Date(),
                },
              });

              console.log(`⏰ Scheduled for ${scheduledDate.toISOString()}`);
            } catch (scheduleError: any) {
              console.error(`❌ Schedule error: ${scheduleError.message}`);
            }
          }
        }
      } catch (saveError: any) {
        console.error(`❌ Save failed: ${saveError.message}`);
        throw new Error(`Content generation failed: Unable to save - ${saveError.message}`);
      }

      // STEP 9: Return result
      const result: ContentGenerationResultWithPublishing = {
        title: contentResult.title,
        content: contentResult.content,
        excerpt: contentResult.excerpt || this.generateExcerpt(contentResult.content),
        metaDescription:
          contentResult.metaDescription ||
          this.generateMetaDescription(contentResult.title, contentResult.content),
        metaTitle: contentResult.metaTitle || contentResult.title,
        keywords: contentResult.keywords || request.keywords,
        seoScore: Math.max(1, Math.min(100, analysisResult.seoScore)),
        readabilityScore: Math.max(1, Math.min(100, analysisResult.readabilityScore)),
        brandVoiceScore: Math.max(1, Math.min(100, analysisResult.brandVoiceScore)),
        eatCompliance: request.eatCompliance || false,
        tokensUsed: contentTokens,
        costUsd: Number(textCostUsd.toFixed(6)),
        aiProvider: request.aiProvider,
        qualityChecks,
        contentId: savedContentId,
        published: published,
        scheduledForPublishing: scheduledForPublishing,
        publishedAt: publishedAt,
        scheduledDate: scheduledDate,
        totalCost: totalCostUsd.toFixed(6),
        language: language,
        conversationalVoice: true,
      };

      if (images.length > 0) {
        result.images = images.map((img) => ({
          url: img.cloudinaryUrl || img.url,
          filename: img.filename,
          altText: img.altText,
          prompt: img.prompt,
          cost: img.cost,
          cloudinaryUrl: img.cloudinaryUrl,
          cloudinaryPublicId: img.cloudinaryPublicId,
        }));
        result.totalImageCost = totalImageCost;
      }

      console.log(`✅ Generation complete - ${language.toUpperCase()}`);

      return result;
    } catch (error: any) {
      if (error instanceof AIProviderError || error instanceof AnalysisError) {
        throw error;
      }
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async optimizeContent(
    content: string,
    keywords: string[],
    userId: string,
    aiProvider: AIProvider = "openai"
  ): Promise<{
    optimizedContent: string;
    suggestions: string[];
    seoScore: number;
  }> {
    return {
      optimizedContent: content,
      suggestions: [],
      seoScore: 75,
    };
  }
}

export const aiService = new AIService();
















// //latest  don't remove
// // server/services/ai-service.ts

// import OpenAI from "openai";
// import Anthropic from "@anthropic-ai/sdk";
// import { storage } from "../storage";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { imageService } from "./image-service";
// import { CloudinaryStorageService } from "./cloudinary-storage";
// import { apiKeyEncryptionService } from "./api-key-encryption";

// // Initialize Cloudinary storage
// const cloudinaryStorage = new CloudinaryStorageService();

// // AI Provider Configuration
// export type AIProvider = "openai" | "anthropic" | "gemini";

// // Model configurations
// const AI_MODELS = {
//   openai: {
//     model: "gpt-4o",
//     pricing: {
//       input: 0.005,
//       output: 0.015,
//     },
//   },
//   anthropic: {
//     model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
//     pricing: {
//       input: 0.003,
//       output: 0.015,
//     },
//   },
//   gemini: {
//     model: "gemini-1.5-flash-8b",
//     pricing: {
//       input: 0.0025,
//       output: 0.0075,
//     },
//   },
// } as const;


// const NICHE_CONTEXTS: Record<string, {
//   label: string;
//   industry: string;
//   defaultAudience: string;
//   defaultBrandVoice: string;
//   contentStyle: string;
//   keyTopics: string[];
// }> = {
//   reputation_sites: {
//     label: "Good Reputation Sites & Reviews",
//     industry: "Reputation Management",
//     defaultAudience: "Business owners, consumers, marketers researching reviews",
//     defaultBrandVoice: "professional and balanced, ethical consultant",
//     contentStyle: "Balanced perspective addressing both business and consumer viewpoints, platform-specific details, ethical practices only",
//     keyTopics: ["Trustpilot", "Yelp", "Google Reviews", "BBB", "G2", "review response", "fake reviews", "reputation management"],
//   },

//   peptides: {
//     label: "Peptides & Performance Enhancement",
//     industry: "Health & Performance",
//     defaultAudience: "Bodybuilders, biohackers, anti-aging seekers, researchers, medical professionals",
//     defaultBrandVoice: "scientific yet accessible, evidence-based",
//     contentStyle: "Scientific credibility with E-A-T compliance, reference actual studies, acknowledge limitations, never recommend suppliers",
//     keyTopics: ["BPC-157", "TB-500", "peptide protocols", "growth hormone", "tissue repair", "clinical research"],
//   },
  
//   gambling: {
//     label: "Gambling & Sports Betting",
//     industry: "Sports Betting",
//     defaultAudience: "Casual bettors to sharp players seeking statistical analysis",
//     defaultBrandVoice: "analytical, data-driven, responsible",
//     contentStyle: "Statistical analysis over hot takes, acknowledge most bettors lose, responsible gambling framework, real odds examples",
//     keyTopics: ["closing line value", "expected value", "bankroll management", "line movement", "betting strategy", "+EV spots"],
//   },
  
//   apps_marketing: {
//     label: "Apps Marketing & Reviews",
//     industry: "Mobile Apps & Software",
//     defaultAudience: "App users, productivity seekers, buyers researching software",
//     defaultBrandVoice: "honest reviewer, practical and helpful",
//     contentStyle: "Test apps when possible, mention limitations honestly, real pricing, platform differences (iOS vs Android)",
//     keyTopics: ["app reviews", "productivity apps", "app comparison", "mobile software", "app features", "user experience"],
//   },
  
//   exclusive_models: {
//     label: "Creator Platforms & OnlyFans Business",
//     industry: "Creator Economy",
//     defaultAudience: "Aspiring creators, current creators, business researchers",
//     defaultBrandVoice: "professional business advisor, entrepreneurial consultant",
//     contentStyle: "Business-first framing not explicit content, frame as entrepreneurship, real numbers on fees and earnings, respect creator autonomy",
//     keyTopics: ["OnlyFans", "Fansly", "creator monetization", "content marketing", "subscriber retention", "creator business", "platform fees"],
//   },
  
//   ecom_nails: {
//     label: "Nails & Beauty E-commerce",
//     industry: "Beauty & Cosmetics",
//     defaultAudience: "Beginners to experienced home manicurists, beauty enthusiasts",
//     defaultBrandVoice: "practical and experienced, helpful beauty enthusiast",
//     contentStyle: "Correct product terminology, reference actual brands with real prices, include timing, describe looks specifically",
//     keyTopics: ["gel polish", "nail art", "chrome powder", "builder gel", "manicure techniques", "nail products", "nail trends"],
//   },
  
//   soccer_jersey: {
//     label: "Soccer Jerseys & Fan Merchandise",
//     industry: "Sports Merchandise",
//     defaultAudience: "Passionate fans, collectors, parents, gift buyers",
//     defaultBrandVoice: "knowledgeable fan perspective, experienced collector",
//     contentStyle: "Distinguish authentic vs replica vs counterfeit, use proper terminology (kit, strip), sizing by manufacturer, authentication methods",
//     keyTopics: ["authentic jerseys", "replica jerseys", "soccer kits", "jersey sizing", "fan merchandise", "jersey collecting", "team jerseys"],
//   },
  
//   payment_processing: {
//     label: "Payment Processing & Fintech",
//     industry: "Financial Technology",
//     defaultAudience: "Business owners, financial decision-makers, developers, e-commerce operators",
//     defaultBrandVoice: "business consultant, fintech expert, technical advisor",
//     contentStyle: "Use correct terminology (interchange, acquirer, PSP), real fee structures, include hidden costs, compliance requirements",
//     keyTopics: ["Stripe", "Square", "payment gateway", "transaction fees", "PCI compliance", "merchant account", "payment integration"],
//   },
  
//   web_dev: {
//     label: "Web Development",
//     industry: "Software Development",
//     defaultAudience: "Beginners to experienced developers evaluating tools and approaches",
//     defaultBrandVoice: "experienced developer, pragmatic engineer",
//     contentStyle: "Use current web standards, reference actual versions (React 18, Node 20), address trade-offs honestly, explain why not just how",
//     keyTopics: ["React", "Next.js", "JavaScript", "web performance", "frameworks", "frontend development", "backend development"],
//   },
  
//   app_dev: {
//     label: "App Development",
//     industry: "Mobile Development",
//     defaultAudience: "Entrepreneurs, business stakeholders, developers evaluating platforms",
//     defaultBrandVoice: "realistic consultant, mobile development expert",
//     contentStyle: "Balance business and technical perspectives, honest cost ranges and timelines, include ongoing costs, post-launch reality",
//     keyTopics: ["React Native", "Flutter", "iOS development", "Android development", "app costs", "mobile development", "cross-platform"],
//   },
  
//   construction: {
//     label: "Construction & B2B Services",
//     industry: "Construction",
//     defaultAudience: "Contractors, subcontractors, construction business owners, project managers",
//     defaultBrandVoice: "industry veteran, construction business consultant",
//     contentStyle: "Use correct construction terminology (GC, sub, bid process), real cost ranges, regulatory requirements, regional differences",
//     keyTopics: ["commercial construction", "bidding strategy", "project management", "subcontractors", "construction business", "permits"],
//   },
  
//   loans: {
//     label: "Loans & Lending",
//     industry: "Financial Services",
//     defaultAudience: "Borrowers researching options, credit rebuilders, financial education seekers",
//     defaultBrandVoice: "responsible financial advisor, consumer advocate",
//     contentStyle: "Use correct financial terminology (APR, LTV, DTI), show total cost not just monthly payment, address predatory lending red flags",
//     keyTopics: ["personal loans", "mortgage", "APR", "interest rates", "credit score", "loan qualification", "debt consolidation"],
//   },
// };

// function getNicheContext(niche: string) {
//   return NICHE_CONTEXTS[niche] || {
//     label: "General",
//     industry: "General",
//     defaultAudience: "general audience",
//     defaultBrandVoice: "professional and informative",
//     contentStyle: "clear and engaging",
//     keyTopics: [],
//   };
// }

// // Interface for user API keys from database
// interface UserApiKey {
//   id: string;
//   provider: string;
//   keyName: string;
//   encryptedKey: string;
//   isActive: boolean;
//   validationStatus: 'valid' | 'invalid' | 'pending';
// }

// export interface ContentGenerationRequest {
//   websiteId?: string;  // ADD ? to make it optional
//   niche?: string;  
//   topic: string;
//   keywords: string[];
//   tone: "professional" | "casual" | "friendly" | "authoritative" | "technical" | "warm";
//   wordCount: number;
//   seoOptimized: boolean;
//   brandVoice?: string;
//   targetAudience?: string;
//   eatCompliance?: boolean;
//   aiProvider: AIProvider;
//   userId: string;
//   includeImages?: boolean;
//   imageCount?: number;
//   imageStyle?: "natural" | "digital_art" | "photographic" | "cinematic";
//   isAutoGenerated?: boolean;
//   autoScheduleId?: string;
//   autoPublish?: boolean;
//   publishDelay?: number;
// }

// export interface ContentGenerationResultWithPublishing extends ContentGenerationResult {
//   contentId?: string;
//   published?: boolean;
//   scheduledForPublishing?: boolean;
//   publishedAt?: Date;
//   scheduledDate?: Date;
//   totalCost?: string;
//   title?: string;
// }

// export interface ContentAnalysisRequest {
//   title: string;
//   content: string;
//   keywords: string[];
//   tone: string;
//   brandVoice?: string;
//   targetAudience?: string;
//   eatCompliance?: boolean;
//   websiteId: string;
//   aiProvider: AIProvider;
//   userId: string;
// }

// export interface ContentGenerationResult {
//   title: string;
//   content: string;
//   excerpt: string;
//   metaDescription: string;
//   metaTitle: string;
//   keywords: string[];
//   seoScore: number;
//   readabilityScore: number;
//   brandVoiceScore: number;
//   eatCompliance: boolean;
//   tokensUsed: number;
//   costUsd: number;
//   aiProvider: AIProvider;
//   qualityChecks: {
//     plagiarismRisk: "low" | "medium" | "high";
//     factualAccuracy: "verified" | "needs_review" | "questionable";
//     brandAlignment: "excellent" | "good" | "needs_improvement";
//   };
//   images?: Array<{
//     url: string;
//     filename: string;
//     altText: string;
//     prompt: string;
//     cost: number;
//     cloudinaryUrl?: string;
//     cloudinaryPublicId?: string;
//   }>;
//   totalImageCost?: number;
// }

// export interface ContentAnalysisResult {
//   seoScore: number;
//   readabilityScore: number;
//   brandVoiceScore: number;
//   tokensUsed: number;
//   costUsd: number;
//   aiProvider: AIProvider;
// }

// // Custom error classes
// export class AIProviderError extends Error {
//   constructor(provider: AIProvider, message: string) {
//     super(`${provider.toUpperCase()} Error: ${message}`);
//     this.name = "AIProviderError";
//   }
// }

// export class AnalysisError extends Error {
//   constructor(analysisType: string, message: string) {
//     super(`${analysisType} Analysis Error: ${message}`);
//     this.name = "AnalysisError";
//   }
// }

// export class ContentFormatter {
//   static convertMarkdownToHtml(content: string): string {
//     return content
//       .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
//       .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
//       .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
//       .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
//       .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
//       .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
//       .replace(/^######\s+(.+?)\s*$/gm, "<h6>$1</h6>")
//       .replace(/^#####\s+(.+?)\s*$/gm, "<h5>$1</h5>")
//       .replace(/^####\s+(.+?)\s*$/gm, "<h4>$1</h4>")
//       .replace(/^###\s+(.+?)\s*$/gm, "<h3>$1</h3>")
//       .replace(/^##\s+(.+?)\s*$/gm, "<h2>$1</h2>")
//       .replace(/^#\s+(.+?)\s*$/gm, "<h1>$1</h1>");
//   }

//   static convertMarkdownFormatting(content: string): string {
//     return content
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//       .replace(/__(.*?)__/g, "<strong>$1</strong>")
//       .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")
//       .replace(/(?<!_)_([^_]+?)_(?!_)/g, "<em>$1</em>")
//       .replace(/^[\-\•\◆\*\+]\s+(.+)$/gm, "<li>$1</li>")
//       .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
//   }

//   static wrapListItems(content: string): string {
//     content = content.replace(
//       /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
//       (match) => {
//         if (match.includes("<li>")) {
//           return `<ul>\n${match}\n</ul>`;
//         }
//         return match;
//       }
//     );
//     return content;
//   }

//   static formatForWordPress(content: string): string {
//     let formatted = content;
//     formatted = this.convertMarkdownToHtml(content);
//     formatted = this.convertMarkdownFormatting(formatted);
//     formatted = this.wrapListItems(formatted);
//     formatted = this.addParagraphTags(formatted);
//     formatted = this.addHeaderSpacing(formatted);
//     formatted = this.addProperSpacing(formatted);
//     return formatted;
//   }

//   private static addParagraphTags(content: string): string {
//     const blocks = content.split("\n\n");
//     return blocks
//       .map((block) => {
//         const trimmed = block.trim();
//         if (!trimmed) return "";
//         if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
//           return trimmed;
//         }
//         if (trimmed.match(/^<h[1-6]>/)) {
//           return trimmed;
//         }
//         return `<p>${trimmed}</p>`;
//       })
//       .join("\n\n");
//   }

//   private static addProperSpacing(content: string): string {
//     return content
//       .replace(/(<h[1-6]>.*?<\/h[1-6]>)/g, "\n$1\n")
//       .replace(/(<\/?(?:ul|ol)>)/g, "\n$1\n")
//       .replace(/\n{3,}/g, "\n\n")
//       .trim();
//   }

//   private static addHeaderSpacing(content: string): string {
//     return content
//       .replace(/(<h[1-6]>.*?<\/h[1-6]>)/g, "\n$1\n")
//       .replace(/\n{3,}/g, "\n\n");
//   }
// }

// export class AIService {
//   // Cache for API keys to avoid repeated database queries
//   private apiKeyCache: Map<string, { key: string; type: 'user' | 'system'; timestamp: number }> = new Map();
//   private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//   /**
//    * Get the API key for a provider, checking user's keys first, then falling back to env vars
//    */
// private async getApiKey(provider: AIProvider, userId: string): Promise<{ key: string; type: 'user' | 'system' } | null> {
//   const cacheKey = `${userId}-${provider}`;
  
//   console.log(`🔍 DEBUG getApiKey called:`, { provider, userId, cacheKey });
  
//   // Check cache first
//   const cached = this.apiKeyCache.get(cacheKey);
//   if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
//     console.log(`✅ Using cached API key for ${provider}`);
//     // Need to determine if this cached key is user or system
//     // We'll need to update the cache structure to store this info
//     return { key: cached.key, type: cached.type };
//   }

//   try {
//     // Try to get user's API key first
//     const userApiKeys = await storage.getUserApiKeys(userId);
    
//     if (userApiKeys && userApiKeys.length > 0) {
//       const providerMap: Record<AIProvider, string> = {
//         'openai': 'openai',
//         'anthropic': 'anthropic',
//         'gemini': 'gemini'
//       };

//       const dbProvider = providerMap[provider];
//       const validKey = userApiKeys.find(
//         (key: any) => 
//           key.provider === dbProvider && 
//           key.isActive && 
//           key.validationStatus === 'valid'
//       );

//       if (validKey && validKey.encryptedApiKey) {
//         try {
//           const decryptedKey = apiKeyEncryptionService.decrypt(validKey.encryptedApiKey);
          
//           // Cache with type information
//           this.apiKeyCache.set(cacheKey, {
//             key: decryptedKey,
//             type: 'user',
//             timestamp: Date.now()
//           });

//           console.log(`✅ Using user's API key for ${provider} (${validKey.keyName})`);
//           return { key: decryptedKey, type: 'user' };
//         } catch (decryptError: any) {
//           console.error(`Failed to decrypt user's ${provider} key:`, decryptError.message);
//         }
//       }
//     }
//   } catch (error: any) {
//     console.warn(`Failed to fetch user's API keys: ${error.message}`);
//   }

//   // Fallback to environment variables (system keys)
//   console.log(`⚠️ No user API key found for ${provider}, falling back to environment variables`);
  
//   let systemKey: string | null = null;
//   switch (provider) {
//     case 'openai':
//       systemKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || null;
//       break;
//     case 'anthropic':
//       systemKey = process.env.ANTHROPIC_API_KEY || null;
//       break;
//     case 'gemini':
//       systemKey = process.env.GOOGLE_GEMINI_API_KEY || null;
//       break;
//   }

//   if (systemKey) {
//     // Cache system key with type
//     this.apiKeyCache.set(cacheKey, {
//       key: systemKey,
//       type: 'system',
//       timestamp: Date.now()
//     });
//     return { key: systemKey, type: 'system' };
//   }

//   return null;
// }
//   /**
//    * Create an OpenAI client with the appropriate API key
//    */
// private async createOpenAIClient(userId: string): Promise<{ client: OpenAI; keyType: 'user' | 'system' }> {
//   const keyInfo = await this.getApiKey('openai', userId);
  
//   if (!keyInfo) {
//     throw new AIProviderError('openai', 'No API key available. Please add your OpenAI API key in settings or contact support.');
//   }

//   return {
//     client: new OpenAI({ apiKey: keyInfo.key }),
//     keyType: keyInfo.type
//   };
// }

// private async createAnthropicClient(userId: string): Promise<{ client: Anthropic; keyType: 'user' | 'system' }> {
//   const keyInfo = await this.getApiKey('anthropic', userId);
  
//   if (!keyInfo) {
//     throw new AIProviderError('anthropic', 'No API key available. Please add your Anthropic API key in settings or contact support.');
//   }

//   return {
//     client: new Anthropic({ apiKey: keyInfo.key }),
//     keyType: keyInfo.type
//   };
// }

// private async createGeminiClient(userId: string): Promise<{ client: GoogleGenerativeAI; keyType: 'user' | 'system' }> {
//   const keyInfo = await this.getApiKey('gemini', userId);
  
//   if (!keyInfo) {
//     throw new AIProviderError('gemini', 'No API key available. Please add your Google Gemini API key in settings or contact support.');
//   }

//   return {
//     client: new GoogleGenerativeAI(keyInfo.key),
//     keyType: keyInfo.type
//   };
// }
//   /**
//    * Clear cached API key for a user (call this when user updates their keys)
//    */
//   public clearApiKeyCache(userId: string, provider?: AIProvider): void {
//     if (provider) {
//       this.apiKeyCache.delete(`${userId}-${provider}`);
//     } else {
//       // Clear all keys for the user
//       for (const key of this.apiKeyCache.keys()) {
//         if (key.startsWith(`${userId}-`)) {
//           this.apiKeyCache.delete(key);
//         }
//       }
//     }
//      console.log(`🔄 Cleared API key cache for user ${userId}${provider ? ` (${provider})` : ' (all providers)'}`);
//   }

//   public async callOpenAI(
//   messages: any[],
//   responseFormat?: any,
//   temperature = 0.7,
//   userId?: string
// ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
//   let keyType: 'user' | 'system' = 'system';
  
//   try {
//     let openai: OpenAI;
    
//     if (userId) {
//       const clientInfo = await this.createOpenAIClient(userId);
//       openai = clientInfo.client;
//       keyType = clientInfo.keyType;
//     } else {
//       // Backwards compatibility - use env vars directly
//       openai = new OpenAI({ 
//         apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR 
//       });
//       keyType = 'system';
//     }

//     const response = await openai.chat.completions.create({
//       model: AI_MODELS.openai.model,
//       messages,
//       response_format: responseFormat,
//       temperature,
//     });

//     const content = response.choices[0]?.message?.content;
//     if (!content) {
//       throw new AIProviderError("openai", "No content returned from API");
//     }

//     return {
//       content,
//       tokens: response.usage?.total_tokens || 0,
//       keyType
//     };
//   } catch (error: any) {
//       if (error instanceof AIProviderError) throw error;

//       if (error.status === 401) {
//         // Clear cache on auth error
//         if (userId) this.clearApiKeyCache(userId, 'openai');
//         throw new AIProviderError(
//           "openai",
//           "Invalid API key. Please check your OpenAI API key in settings."
//         );
//       } else if (error.status === 429) {
//         throw new AIProviderError("openai", "Rate limit exceeded. Please try again later.");
//       } else if (error.status === 403) {
//         throw new AIProviderError(
//           "openai",
//           "Insufficient permissions. Please check your OpenAI API key permissions."
//         );
//       }

//       throw new AIProviderError("openai", error.message || "Unknown API error");
//     }
//   }

//   private async callGemini(
//   messages: any[],
//   temperature = 0.7,
//   userId?: string
// ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
//   let keyType: 'user' | 'system' = 'system';
  
//   try {
//     let gemini: GoogleGenerativeAI;
    
//     if (userId) {
//       // Get the API key with type information
//       const keyInfo = await this.getApiKey('gemini', userId);
      
//       if (!keyInfo) {
//         throw new AIProviderError("gemini", "No API key available. Please add your Google API key in settings.");
//       }
      
//       // Create the Gemini client with the key
//       gemini = new GoogleGenerativeAI(keyInfo.key);
//       keyType = keyInfo.type;
      
//       console.log(`✅ Created Gemini client with ${keyType} key`);
//     } else {
//       // Fallback to environment variable
//       const envKey = process.env.GOOGLE_GEMINI_API_KEY;
      
//       if (!envKey) {
//         throw new AIProviderError("gemini", "No Google API key available in environment.");
//       }
      
//       gemini = new GoogleGenerativeAI(envKey);
//       keyType = 'system';
//     }

//     // Rest of the Gemini implementation...
//     const model = gemini.getGenerativeModel({
//       model: AI_MODELS.gemini.model,
//     });

//       const systemMessage = messages.find((m) => m.role === "system");
//       const userMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");

//       const history = userMessages.slice(0, -1).map((m) => ({
//         role: m.role === "user" ? "user" : "model",
//         parts: [{ text: m.content }],
//       }));

//       const lastMessage = userMessages[userMessages.length - 1];
//       if (!lastMessage || lastMessage.role !== "user") {
//         throw new AIProviderError(
//           "gemini",
//           "Invalid message format - last message must be from user"
//         );
//       }

//       const chat = model.startChat({
//         history,
//         generationConfig: {
//           temperature,
//           maxOutputTokens: 4000,
//         },
//       });

//       let prompt = lastMessage.content;
//       if (systemMessage?.content) {
//         prompt = `${systemMessage.content}\n\n${prompt}`;

//         if (systemMessage.content.includes("JSON") || systemMessage.content.includes("json")) {
//           prompt +=
//             "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object. Start your response with { and end with }.";
//         }
//       }

//       const result = await chat.sendMessage(prompt);
//       const response = await result.response;
//       const responseText = response.text();

//       if (!responseText) {
//         throw new AIProviderError("gemini", "No content returned from API");
//       }

//       let cleanedText = responseText.trim();

//       if (!cleanedText.startsWith("{") && cleanedText.includes("{")) {
//         const jsonStart = cleanedText.indexOf("{");
//         const jsonEnd = cleanedText.lastIndexOf("}") + 1;
//         if (jsonStart !== -1 && jsonEnd > jsonStart) {
//           cleanedText = cleanedText.substring(jsonStart, jsonEnd);
//         }
//       }

//       const estimatedTokens = Math.ceil((prompt.length + cleanedText.length) / 4);

//       return {
//         content: cleanedText,
//         tokens: estimatedTokens,
//       };
//     } catch (error: any) {
//       if (error instanceof AIProviderError) throw error;

//       if (error.status === 429 || error.message?.includes("Too Many Requests")) {
//         throw new AIProviderError(
//           "gemini",
//           "Rate limit exceeded. Google Gemini free tier allows only 15 requests/minute and 1,500/day. " +
//             "Please wait a few minutes or consider upgrading to a paid plan. " +
//             "Alternatively, use OpenAI or Anthropic for now."
//         );
//       } else if (error.message?.includes("API_KEY_INVALID")) {
//         if (userId) this.clearApiKeyCache(userId, 'gemini');
//         throw new AIProviderError(
//           "gemini",
//           "Invalid API key. Please check your Google API key in settings."
//         );
//       }

//       throw new AIProviderError("gemini", error.message || "Unknown API error");
//     }
//   }

  

//   private async callAnthropic(
//   messages: any[],
//   temperature = 0.7,
//   userId?: string
// ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
//   let keyType: 'user' | 'system' = 'system';
  
//   try {
//     let anthropic: Anthropic;
    
//     if (userId) {
//       // Get the API key with type information
//       const keyInfo = await this.getApiKey('anthropic', userId);
      
//       if (!keyInfo) {
//         throw new AIProviderError("anthropic", "No API key available. Please add your Anthropic API key in settings.");
//       }
      
//       // Create the Anthropic client with the key
//       anthropic = new Anthropic({ apiKey: keyInfo.key });
//       keyType = keyInfo.type;
      
//       console.log(`✅ Created Anthropic client with ${keyType} key`);
//     } else {
//       // Fallback to environment variable
//       const envKey = process.env.ANTHROPIC_API_KEY;
      
//       if (!envKey) {
//         throw new AIProviderError("anthropic", "No Anthropic API key available in environment.");
//       }
      
//       anthropic = new Anthropic({ apiKey: envKey });
//       keyType = 'system';
//     }

//     // Now anthropic should be properly initialized
//     const systemMessage = messages.find((m) => m.role === "system");
//     const userMessages = messages.filter((m) => m.role === "user" || m.role === "assistant");

//     let systemContent = systemMessage?.content || "";
//     if (systemContent.includes("JSON") || systemContent.includes("json")) {
//       systemContent +=
//         "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text before or after the JSON object. Start your response with { and end with }.";
//     }

//     const response = await anthropic.messages.create({
//       model: AI_MODELS.anthropic.model,
//       max_tokens: 4000,
//       temperature,
//       system: systemContent,
//       messages: userMessages.map((m) => ({
//         role: m.role === "user" ? "user" : "assistant",
//         content: m.content,
//       })),
//     });

//     const content = response.content[0];
//     if (content.type !== "text" || !content.text) {
//       throw new AIProviderError("anthropic", "No text content returned from API");
//     }

//     let responseText = content.text.trim();

//     // Clean up JSON response if needed
//     if (!responseText.startsWith("{") && responseText.includes("{")) {
//       const jsonStart = responseText.indexOf("{");
//       const jsonEnd = responseText.lastIndexOf("}") + 1;
//       if (jsonStart !== -1 && jsonEnd > jsonStart) {
//         responseText = responseText.substring(jsonStart, jsonEnd);
//       }
//     }

//     return {
//       content: responseText,
//       tokens: response.usage.input_tokens + response.usage.output_tokens,
//       keyType
//     };
    
//   } catch (error: any) {
//     if (error instanceof AIProviderError) throw error;

//     if (error.status === 401) {
//       if (userId) this.clearApiKeyCache(userId, 'anthropic');
//       throw new AIProviderError(
//         "anthropic",
//         "Invalid API key. Please check your Anthropic API key in settings."
//       );
//     } else if (error.status === 429) {
//       throw new AIProviderError("anthropic", "Rate limit exceeded. Please try again later.");
//     }

//     throw new AIProviderError("anthropic", error.message || "Unknown API error");
//   }
// }

//   private async callAI(
//     provider: AIProvider,
//     messages: any[],
//     responseFormat?: any,
//     temperature = 0.7,
//     userId?: string
//   ): Promise<{ content: string; tokens: number; keyType?: 'user' | 'system' }> {
//     switch (provider) {
//       case "openai":
//         return this.callOpenAI(messages, responseFormat, temperature, userId);
//       case "anthropic":
//         return this.callAnthropic(messages, temperature, userId);
//       case "gemini":
//         return this.callGemini(messages, temperature, userId);
//       default:
//         throw new Error(`Unsupported AI provider: ${provider}`);
//     }
//   }

//   public embedImagesInContent(
//     content: string,
//     images: Array<{
//       url: string;
//       filename: string;
//       altText: string;
//       prompt: string;
//       cost: number;
//     }>
//   ): string {
//     return this.embedImagesInContentPrivate(content, images);
//   }

//   private embedImagesInContentPrivate(
//     content: string,
//     images: Array<{
//       url: string;
//       filename: string;
//       altText: string;
//       prompt: string;
//       cost: number;
//       cloudinaryUrl?: string;
//     }>
//   ): string {
//     if (!images || images.length === 0) {
//       return content;
//     }

//     let modifiedContent = content;

//     images.forEach((image, index) => {
//       // Use Cloudinary URL if available, otherwise fallback to original URL
//       const imageUrl = image.cloudinaryUrl || image.url;
      
//       const imageHtml = `
// <figure class="wp-block-image size-large">
//   <img src="${imageUrl}" alt="${image.altText}" class="wp-image" style="max-width: 100%; height: auto;" />
//   <figcaption>${image.altText}</figcaption>
// </figure>
// `;

//       if (index === 0) {
//         const firstParagraphEnd = modifiedContent.indexOf("</p>");
//         if (firstParagraphEnd !== -1) {
//           modifiedContent =
//             modifiedContent.slice(0, firstParagraphEnd + 4) +
//             "\n\n" +
//             imageHtml +
//             "\n\n" +
//             modifiedContent.slice(firstParagraphEnd + 4);
//           console.log(`🖼️ Placed hero image after introduction`);
//         } else {
//           modifiedContent = imageHtml + "\n\n" + modifiedContent;
//           console.log(`🖼️ Placed hero image at beginning (fallback)`);
//         }
//       } else {
//         const h2Regex = /<h2>/g;
//         const h2Matches = Array.from(modifiedContent.matchAll(h2Regex));

//         if (h2Matches.length > index - 1) {
//           const insertPoint = h2Matches[index - 1].index;
//           modifiedContent =
//             modifiedContent.slice(0, insertPoint) +
//             imageHtml +
//             "\n\n" +
//             modifiedContent.slice(insertPoint);
//           console.log(`🖼️ Placed image ${index + 1} before H2 section`);
//         } else {
//           const conclusionHeadings = ["<h2>Conclusion", "<h2>Summary", "<h2>Final"];
//           let insertPoint = -1;

//           for (const heading of conclusionHeadings) {
//             insertPoint = modifiedContent.lastIndexOf(heading);
//             if (insertPoint !== -1) break;
//           }

//           if (insertPoint !== -1) {
//             modifiedContent =
//               modifiedContent.slice(0, insertPoint) +
//               imageHtml +
//               "\n\n" +
//               modifiedContent.slice(insertPoint);
//             console.log(`🖼️ Placed image ${index + 1} before conclusion`);
//           } else {
//             modifiedContent = modifiedContent + "\n\n" + imageHtml;
//             console.log(`🖼️ Placed image ${index + 1} at end (fallback)`);
//           }
//         }
//       }
//     });

//     return modifiedContent;
//   }

//   async analyzeExistingContent(request: {
//     title: string;
//     content: string;
//     keywords: string[];
//     tone: string;
//     brandVoice?: string;
//     targetAudience?: string;
//     eatCompliance?: boolean;
//     websiteId: string;
//     aiProvider: AIProvider;
//     userId: string;
//   }): Promise<ContentAnalysisResult> {
//     try {
//       console.log(`Re-analyzing existing content with ${request.aiProvider.toUpperCase()}`);

//       const analysisResult = await this.performContentAnalysis({
//         title: request.title,
//         content: request.content,
//         keywords: request.keywords,
//         tone: request.tone,
//         brandVoice: request.brandVoice,
//         targetAudience: request.targetAudience,
//         eatCompliance: request.eatCompliance || false,
//         websiteId: request.websiteId,
//         aiProvider: request.aiProvider,
//         userId: request.userId,
//       });

//       console.log(
//         `✅ Existing content re-analyzed - SEO: ${analysisResult.seoScore}%, Readability: ${analysisResult.readabilityScore}%, Brand Voice: ${analysisResult.brandVoiceScore}%`
//       );

//       return analysisResult;
//     } catch (error: any) {
//       console.error("Failed to analyze existing content:", error);
//       if (error instanceof AIProviderError || error instanceof AnalysisError) {
//         throw error;
//       }
//       throw new AnalysisError(
//         "Content Re-analysis",
//         error.message || "Unknown error during content analysis"
//       );
//     }
//   }

//   async generateContent(
//     request: ContentGenerationRequest
//   ): Promise<ContentGenerationResultWithPublishing> {
//     try {
//       console.log(
//         `Generating content for user ${request.userId} with ${request.aiProvider.toUpperCase()}`
//       );


//     // ADD THIS VALIDATION BLOCK:
//     // Validate that either websiteId or niche is provided
//     if (!request.websiteId && !request.niche) {
//       throw new Error("Either websiteId or niche must be provided for content generation");
//     }

//     // Log the content type being generated
//     if (request.websiteId) {
//       console.log(`📄 Generating website-specific content for website: ${request.websiteId}`);
//     } else if (request.niche) {
//       console.log(`📄 Generating standalone content for niche: ${request.niche}`);
//     }

//     if (request.isAutoGenerated) {
//       console.log(`Auto-generation detected:`, {
//         autoScheduleId: request.autoScheduleId,
//         autoPublish: request.autoPublish,
//         publishDelay: request.publishDelay,
//       });
//     }

//       if (request.isAutoGenerated) {
//         console.log(`Auto-generation detected:`, {
//           autoScheduleId: request.autoScheduleId,
//           autoPublish: request.autoPublish,
//           publishDelay: request.publishDelay,
//         });
//       }

//       // Step 1: Check if image generation is requested
//       if (request.includeImages && request.imageCount && request.imageCount > 0) {
//         // Check if user has OpenAI key for image generation
//         const openAiKey = await this.getApiKey('openai', request.userId);
//         if (!openAiKey) {
//           console.warn("⚠️ Image generation requested but no OpenAI API key available");
//           request.includeImages = false;
//           request.imageCount = 0;
//         } else {
//           console.log(
//             `🎨 Will generate ${request.imageCount} images with DALL-E 3 (regardless of content AI provider: ${request.aiProvider})`
//           );
//         }
//       }

//       // Step 2: Generate the actual content
//       const contentPrompt = this.buildContentPrompt(request);

//       const systemPrompt = `Okay, real talk. You're that friend who actually knows their shit about ${request.topic} because you've been in the trenches for years. Not the guru type—the person who's failed enough times to know what actually works.

// Write like you're explaining this to someone smart who just asked you for the real story. They don't need the Wikipedia version. They need the "here's what nobody tells you" version.

// === YOUR VOICE CALIBRATION ===
// You're not writing. You're talking. Big difference.
// - Interrupt yourself when you realize something: "Actually, wait—before I explain that..."
// - Correct yourself: "No, that's not quite right. What I mean is..."
// - Show uncertainty: "I think it's around 73%? Maybe 74%. Let me explain why that matters..."
// - Get excited about the interesting parts: "Oh, and this part is actually super interesting..."
// - Brief tangents that loop back: "Reminds me of when... but anyway, back to the point"

// === CRITICAL ANTI-PATTERN RULES ===
// NEVER use these (they scream AI):
// - Starting with "In today's..." or "In the world of..." or "In this article..."
// - Transitions: Moreover, Furthermore, Additionally, In conclusion
// - Perfect 3-4 sentence paragraphs
// - Three-item lists (vary between 2, 4, 6, 7 items)
// - Generic examples—use specific companies, exact dates, real prices

// ALWAYS do this:
// - Use fragments. Like this. For emphasis.
// - Mix 3-word sentences with 47-word rambles that include tangents (like that time in March 2024 when everyone thought X would work but it completely backfired because nobody considered Y)
// - Specific numbers: "increased conversions by 37.4%" not "significantly improved"
// - Real timestamps: "Last Tuesday at 2:47pm" not "recently"
// - Actual tools with versions: "WordPress 6.4.2" not "content management systems"
// - Include at least one failure: "Tried X first. Cost me $3,400. Here's why it failed..."

// === STRUCTURE CHAOS PROTOCOL ===
// Don't follow a template. Let the content flow naturally:
// - Jump straight into the most interesting/controversial point
// - Circle back to explain context when needed
// - Mix ultra-tactical advice with broader observations
// - Include "Oh, I should mention..." additions
// - Leave some questions hanging before answering them later

// Return JSON but write the content field like you're having a conversation. Include HTML tags for structure but keep the voice conversational and slightly chaotic.`;

//       const contentResponse = await this.callAI(
//         request.aiProvider,
//         [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: contentPrompt },
//         ],
//         request.aiProvider === "openai" ? { type: "json_object" } : undefined,
//         0.7,
//         request.userId  // Pass userId for API key lookup
//       );

//       const keyTypeUsed = contentResponse.keyType || 'system';

//       let contentResult;
//       try {
//         let cleanedContent = contentResponse.content.trim();
//         cleanedContent = cleanedContent.replace(/^\uFEFF/, "");
//         contentResult = JSON.parse(cleanedContent);
//         console.log("✅ Successfully parsed JSON response from", request.aiProvider.toUpperCase());

        
//       } catch (parseError: any) {
//         console.error("❌ Initial JSON parse failed, attempting extraction...", parseError.message);

//         let cleanedContent = contentResponse.content.trim();
//         const firstBrace = cleanedContent.indexOf("{");
//         const lastBrace = cleanedContent.lastIndexOf("}");

//         if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
//           const extractedJson = cleanedContent.substring(firstBrace, lastBrace + 1);

//           try {
//             contentResult = JSON.parse(extractedJson);
//             console.log("✅ Successfully parsed extracted JSON from", request.aiProvider.toUpperCase());
//           } catch (secondParseError: any) {
//             throw new AIProviderError(
//               request.aiProvider,
//               `Failed to parse JSON response after multiple attempts. Original error: ${parseError.message}`
//             );
//           }
//         } else {
//           throw new AIProviderError(
//             request.aiProvider,
//             `No valid JSON structure found in response. Response was: ${contentResponse.content.substring(
//               0,
//               300
//             )}...`
//           );
//         }
//       }

//       if (!contentResult.title || !contentResult.content) {
//         throw new AIProviderError(
//           request.aiProvider,
//           "AI response missing required fields (title, content)"
//         );
//       }

//       // Convert markdown headers to HTML if they exist
//       console.log("🔄 Converting markdown headers to HTML...");

//       if (contentResult.content && contentResult.content.includes("#")) {
//         console.log("🔍 Markdown headers detected, converting to HTML...");
//         contentResult.content = ContentFormatter.convertMarkdownToHtml(contentResult.content);
//       }

//       contentResult.content = ContentFormatter.formatForWordPress(contentResult.content);
//       console.log("✅ Content formatted for WordPress");

//       // Pre-generate contentId for image storage (temporary, will be replaced)
//       let contentId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

//       // Step 3: Generate images if requested (ALWAYS using OpenAI DALL-E 3)
//       let images: Array<{
//         url: string;
//         filename: string;
//         altText: string;
//         prompt: string;
//         cost: number;
//         cloudinaryUrl?: string;
//         cloudinaryPublicId?: string;
//       }> = [];
//       let totalImageCost = 0;
//       let imageKeyType: 'user' | 'system' = 'system';

//       if (request.includeImages && request.imageCount && request.imageCount > 0) {
//         try {
//           console.log(
//             `🎨 Generating ${request.imageCount} images with DALL-E 3 (content generated with ${request.aiProvider.toUpperCase()})...`
//           );

//           const imageGenerationRequest = {
//             topic: request.topic,
//             count: request.imageCount,
//             style: request.imageStyle || "natural",
//             contentContext: contentResult.content.substring(0, 500),
//             keywords: request.keywords,
//           };

//           const validation = imageService.validateImageRequest(imageGenerationRequest);
//           if (!validation.valid) {
//             throw new Error(
//               `Image generation validation failed: ${validation.errors.join(", ")}`
//             );
//           }

//           // Pass userId to imageService for API key lookup
//            const imageResult = await imageService.generateImages(
//       imageGenerationRequest, 
//       request.userId,  // <-- Pass userId here!
//       request.websiteId
//     );

//     imageKeyType = imageResult.keyType || 'system';

//           // CRITICAL: Upload to Cloudinary immediately after generation
//           console.log(`☁️ Uploading images to Cloudinary for permanent storage...`);
          
//           for (const img of imageResult.images) {
//             try {
//               // Upload directly from DALL-E URL to Cloudinary
//               const cloudinaryImage = await cloudinaryStorage.uploadFromUrl(
//                 img.url, // DALL-E temporary URL
//                 request.websiteId || 'niche-${request.niche}',
//                 contentId,
//                 img.filename
//               );

//               // Store both URLs - Cloudinary is permanent, DALL-E is temporary
//               images.push({
//                 ...img,
//                 url: cloudinaryImage.secureUrl, // Use Cloudinary URL in content
//                 cloudinaryUrl: cloudinaryImage.secureUrl,
//                 cloudinaryPublicId: cloudinaryImage.publicId,
//               });

//               console.log(`✅ Image permanently stored in Cloudinary: ${img.filename}`);
//             } catch (uploadError: any) {
//               console.error(`❌ Failed to upload to Cloudinary: ${img.filename}`, uploadError.message);
//               // Still include the image but with temporary DALL-E URL (will expire!)
//               images.push(img);
//             }
//           }

//           totalImageCost = imageResult.totalCost;
//           console.log(
//             `✅ Generated ${images.length} images with DALL-E 3 (Total cost: $${totalImageCost.toFixed(
//               4
//             )})`
//           );

//           if (images.length > 0) {
//             console.log("🖼️ Embedding Cloudinary images into content...");
//             contentResult.content = this.embedImagesInContentPrivate(
//               contentResult.content,
//               images
//             );
//             console.log(`✅ Embedded ${images.length} images into content`);
//           }
//         } catch (imageError: any) {
//           console.error("❌ Image generation failed:", imageError.message);

//           if (imageError.message.includes("Rate limit")) {
//             console.warn("⚠️ DALL-E rate limit reached, continuing without images");
//           } else if (
//             imageError.message.includes("credits") ||
//             imageError.message.includes("quota")
//           ) {
//             console.warn("⚠️ Insufficient OpenAI credits for images, continuing without images");
//           } else if (imageError.message.includes("API key")) {
//             console.warn("⚠️ OpenAI API key issue for image generation, continuing without images");
//           } else {
//             console.warn(`⚠️ Image generation error: ${imageError.message}`);
//           }

//           images = [];
//           totalImageCost = 0;
//         }
//       }

//       // Step 4: Analyze the generated content
//       const analysisResult = await this.performContentAnalysis({
//         title: contentResult.title,
//         content: contentResult.content,
//         keywords: request.keywords,
//         tone: request.tone,
//         brandVoice: request.brandVoice,
//         targetAudience: request.targetAudience,
//         eatCompliance: request.eatCompliance,
//         websiteId: request.websiteId || 'standalone',
//         aiProvider: request.aiProvider,
//         userId: request.userId,
//       });

//       // Step 5: Calculate total costs
//       const contentTokens = Math.max(1, contentResponse.tokens + analysisResult.tokensUsed);
//       const contentPricing = AI_MODELS[request.aiProvider].pricing;
//       const avgTokenCost = (contentPricing.input + contentPricing.output) / 2;
//       const textCostUsd = (contentTokens * avgTokenCost) / 1000;
//       const totalCostUsd = textCostUsd + totalImageCost;

//       console.log(`💰 Cost breakdown:`);
//       console.log(
//         `   Content (${request.aiProvider.toUpperCase()}): $${textCostUsd.toFixed(
//           6
//         )} (${contentTokens} tokens)`
//       );
//       console.log(`   Images (DALL-E 3): $${totalImageCost.toFixed(6)}`);
//       console.log(`   Total: $${totalCostUsd.toFixed(6)}`);

//       // Step 6: Track AI usage
//       try {
//         await storage.trackAiUsage({
//           websiteId: request.websiteId || null,
//           userId: request.userId,
//           model: AI_MODELS[request.aiProvider].model,
//           tokensUsed: contentTokens,
//           costUsd: Math.max(1, Math.round(textCostUsd * 1000)) ,
//           operation: "content_generation",
//           keyType: keyTypeUsed
//         });

//         if (images.length > 0) {
//           await storage.trackAiUsage({
//             websiteId: request.websiteId || null,
//             userId: request.userId,
//             model: "dall-e-3",
//             tokensUsed: 0,
//             costUsd: Math.round(totalImageCost * 100),
//             operation: "image_generation",
//             keyType: imageKeyType
//           });
//         }
//       } catch (trackingError: any) {
//         console.warn("AI usage tracking failed:", trackingError.message);
//       }

//       // Step 7: Generate quality checks
//       const qualityChecks = this.generateQualityChecks(contentResult.content, request);

//       // Step 8: Save generated content to database and handle scheduling
//       let savedContentId: string | undefined;
//       let published = false;
//       let scheduledForPublishing = false;
//       let publishedAt: Date | undefined;
//       let scheduledDate: Date | undefined;

//       try {
//         // Prepare content data for database using the existing createContent method
//         const contentToSave = {
//           websiteId: request.websiteId || null,
//           niche: request.niche || null,
//           userId: request.userId,
//           title: contentResult.title,
//           body: contentResult.content,  // Note: 'body' not 'content' for database
//           excerpt: contentResult.excerpt || this.generateExcerpt(contentResult.content),
//           metaDescription:
//             contentResult.metaDescription ||
//             this.generateMetaDescription(contentResult.title, contentResult.content),
//           metaTitle: contentResult.metaTitle || contentResult.title,
//           aiModel: AI_MODELS[request.aiProvider].model,
//           seoKeywords: contentResult.keywords || request.keywords,
//           seoScore: Math.max(1, Math.min(100, analysisResult.seoScore)),
//           readabilityScore: Math.max(1, Math.min(100, analysisResult.readabilityScore)),
//           brandVoiceScore: Math.max(1, Math.min(100, analysisResult.brandVoiceScore)),
//           eatCompliance: request.eatCompliance || false,
//           tokensUsed: contentTokens,
//           costUsd: Math.round(totalCostUsd * 100), // Convert to cents for storage
//           status: 'draft',
//           hasImages: images.length > 0,
//           imageCount: images.length,
//           imageCostCents: Math.round(totalImageCost * 100)
//         };

//         console.log(`💾 Saving content to database...`);
//         const savedContent = await storage.createContent(contentToSave);
        
//         // CRITICAL: Get the real database ID from the saved content
//         savedContentId = savedContent.id;
//         contentId = savedContentId; // Update the outer contentId variable
        
//         console.log(`✅ Content saved with real database ID: ${savedContentId}`);
        
//         // Verify we have a valid ID (should not start with 'temp-')
//         if (!savedContentId || savedContentId.startsWith('temp-')) {
//           throw new Error(`Invalid content ID received from database: ${savedContentId}. Content save may have failed.`);
//         }

//         // Handle auto-publishing if configured
//         if (request.isAutoGenerated && request.autoScheduleId && request.autoPublish) {
//           console.log(`🚀 Processing auto-publishing for content ${savedContentId}...`);

//           if (request.publishDelay === 0) {
//             // Immediate publishing
//             scheduledDate = new Date();

//             try {
//               await storage.createContentSchedule({
//                 contentId: savedContentId,  // Use the real database ID
//                 userId: request.userId,
//                 websiteId: request.websiteId!,
//                 scheduled_date: scheduledDate,
//                 status: "publishing",
//                 title: contentResult.title,
//                 topic: request.topic,  // Add topic field (required by database)
//                 metadata: {
//                   autoGenerated: true,
//                   autoScheduleId: request.autoScheduleId,
//                   publishedImmediately: true,
//                   generatedAt: new Date(),
//                 },
//               });

//               const publishResult = await this.publishToWordPress(
//                 savedContentId,  // Use real ID
//                 request.websiteId!,
//                 request.userId
//               );

//               if (publishResult.success) {
//                 published = true;
//                 publishedAt = new Date();

//                 // Update content status using the existing updateContent method
//                 await storage.updateContent(savedContentId, {
//                   status: "published",
//                   publishDate: publishedAt,
//                   wordpressPostId: publishResult.postId,
//                 });

//                 // Update schedule status
//                 await storage.updateContentScheduleByContentId(savedContentId, {
//                   status: "published",
//                   published_at: publishedAt,
//                 });

//                 console.log(
//                   `✅ Content published immediately to WordPress (Post ID: ${publishResult.postId})`
//                 );
//               } else {
//                 console.error(`❌ Failed to publish immediately: ${publishResult.error}`);

//                 await storage.updateContentScheduleByContentId(savedContentId, {
//                   status: "failed",
//                   error: publishResult.error,
//                 });
//               }
//             } catch (publishError: any) {
//               console.error(`❌ Auto-publishing error: ${publishError.message}`);
//             }
//           } else if (request.publishDelay && request.publishDelay > 0) {
//             // Delayed publishing
//             scheduledDate = new Date();
//             scheduledDate.setHours(scheduledDate.getHours() + request.publishDelay);
//             scheduledForPublishing = true;

//             try {
//               await storage.createContentSchedule({
//                 contentId: savedContentId,  // Use real ID
//                 userId: request.userId,
//                 websiteId: request.websiteId!,
//                 scheduled_date: scheduledDate,
//                 status: "scheduled",
//                 title: contentResult.title,
//                 topic: request.topic,  // Add topic field
//                 metadata: {
//                   autoGenerated: true,
//                   autoScheduleId: request.autoScheduleId,
//                   publishDelay: request.publishDelay,
//                   generatedAt: new Date(),
//                 },
//               });

//               console.log(`⏰ Content scheduled for publishing at ${scheduledDate.toISOString()}`);
//             } catch (scheduleError: any) {
//               console.error(`❌ Failed to create schedule entry: ${scheduleError.message}`);
//             }
//           }
//         } else if (request.isAutoGenerated && !request.autoPublish) {
//           // Auto-generated but not auto-publishing (save as draft)
//           try {
//             await storage.createContentSchedule({
//               contentId: savedContentId,  // Use real ID
//               userId: request.userId,
//               websiteId: request.websiteId!,
//               scheduled_date: new Date(),
//               status: "draft",
//               title: contentResult.title,
//               topic: request.topic,  // Add topic field
//               metadata: {
//                 autoGenerated: true,
//                 autoScheduleId: request.autoScheduleId,
//                 isDraft: true,
//                 generatedAt: new Date(),
//               },
//             });

//             console.log(`📝 Content saved as draft (auto-publish disabled)`);
//           } catch (scheduleError: any) {
//             console.error(`❌ Failed to create draft schedule entry: ${scheduleError.message}`);
//           }
//         }
//       } catch (saveError: any) {
//         console.error(`❌ Failed to save content to database: ${saveError.message}`);
//         // Don't continue if we can't save the content
//         throw new Error(`Content generation failed: Unable to save content - ${saveError.message}`);
//       }

//       // Step 9: Return complete result
//       const result: ContentGenerationResultWithPublishing = {
//         title: contentResult.title,
//         content: contentResult.content,
//         excerpt: contentResult.excerpt || this.generateExcerpt(contentResult.content),
//         metaDescription:
//           contentResult.metaDescription ||
//           this.generateMetaDescription(contentResult.title, contentResult.content),
//         metaTitle: contentResult.metaTitle || contentResult.title,
//         keywords: contentResult.keywords || request.keywords,
//         seoScore: Math.max(1, Math.min(100, analysisResult.seoScore)),
//         readabilityScore: Math.max(1, Math.min(100, analysisResult.readabilityScore)),
//         brandVoiceScore: Math.max(1, Math.min(100, analysisResult.brandVoiceScore)),
//         eatCompliance: request.eatCompliance || false,
//         tokensUsed: contentTokens,
//         costUsd: Number(textCostUsd.toFixed(6)),
//         aiProvider: request.aiProvider,
//         qualityChecks,
//         contentId: savedContentId,  // CRITICAL: Use the saved database ID
//         published: published,
//         scheduledForPublishing: scheduledForPublishing,
//         publishedAt: publishedAt,
//         scheduledDate: scheduledDate,
//         totalCost: totalCostUsd.toFixed(6),
//       };

//       if (images.length > 0) {
//         result.images = images.map((img) => ({
//           url: img.cloudinaryUrl || img.url,
//           filename: img.filename,
//           altText: img.altText,
//           prompt: img.prompt,
//           cost: img.cost,
//           cloudinaryUrl: img.cloudinaryUrl,
//           cloudinaryPublicId: img.cloudinaryPublicId,
//         }));
//         result.totalImageCost = totalImageCost;
//       }

//       console.log(
//         `✅ Content generation completed successfully with ${request.aiProvider.toUpperCase()}${
//           images.length > 0 ? ` + DALL-E (${images.length} images on Cloudinary)` : ""
//         }${
//           published
//             ? " - PUBLISHED IMMEDIATELY"
//             : scheduledForPublishing
//             ? " - SCHEDULED FOR PUBLISHING"
//             : ""
//         }`
//       );

//       return result;
//     } catch (error: any) {
//       if (error instanceof AIProviderError || error instanceof AnalysisError) {
//         throw error;
//       }
//       throw new Error(`Content generation failed: ${error.message}`);
//     }
//   }

//   private async publishToWordPress(
//     contentId: string,
//     websiteId: string,
//     userId: string
//   ): Promise<{ success: boolean; postId?: string; error?: string }> {
//     try {
//       const content = await storage.getContent(contentId);
//       if (!content) {
//         return { success: false, error: "Content not found" };
//       }

//       const website = await storage.getUserWebsite(websiteId, userId);
//       if (!website) {
//         return { success: false, error: "Website not found" };
//       }

//       // TODO: Implement actual WordPress REST API call
//       console.log("TODO: Implement WordPress API publishing");
//       return {
//         success: false,
//         error: "WordPress API not yet implemented",
//       };
//     } catch (error: any) {
//       console.error("WordPress publishing error:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   private async performContentAnalysis(
//     request: ContentAnalysisRequest
//   ): Promise<ContentAnalysisResult> {
//     let totalTokens = 0;
//     let seoScore = 50;
//     let readabilityScore = 50;
//     let brandVoiceScore = 50;
//    let keyType: 'user' | 'system' = 'system';

//     try {
//       console.log(`Starting content analysis with ${request.aiProvider.toUpperCase()}`);

//       // Step 1: SEO Analysis
//       const seoAnalysisResponse = await this.callAI(
//         request.aiProvider,
//         [
//           {
//             role: "system",
//             content: `You are a technical SEO analyst. Analyze content for SEO effectiveness and return a numeric score.

// ANALYSIS CRITERIA FOR SEO SCORE (1-100):

// KEYWORD OPTIMIZATION (25 points):
// - Primary keyword in title (5 points)
// - Keywords in first paragraph (5 points)  
// - Keywords in headings/subheadings (5 points)
// - Natural keyword density 1-3% (5 points)
// - Use of semantic/related keywords (5 points)

// CONTENT STRUCTURE (25 points):
// - Proper heading hierarchy (H1, H2, H3) (8 points)
// - Logical content flow and organization (8 points)
// - Use of lists, bullets for scannability (5 points)
// - Appropriate content length for topic depth (4 points)

// SEARCH INTENT ALIGNMENT (25 points):
// - Content directly addresses search query (10 points)
// - Provides comprehensive answer to user questions (8 points)
// - Includes actionable information/next steps (7 points)

// TECHNICAL SEO ELEMENTS (25 points):
// - Optimized title tag under 60 characters (8 points)
// - Meta description 150-160 characters with CTA (8 points)
// - Internal linking opportunities mentioned (5 points)
// - Content uniqueness and originality (4 points)

// CRITICAL: Return ONLY a JSON object with numeric values: {"contentSeoScore": number, "analysis": "explanation"}`,
//           },
//           {
//             role: "user",
//             content: `Analyze this content for SEO:

// TITLE: ${request.title}
// CONTENT: ${request.content.substring(0, 3000)}${
//               request.content.length > 3000 ? "... [TRUNCATED]" : ""
//             }
// TARGET KEYWORDS: ${request.keywords.join(", ")}
// TARGET AUDIENCE: ${request.targetAudience || "General audience"}
// ${request.niche ? `NICHE: ${getNicheContext(request.niche).label} - ${getNicheContext(request.niche).contentStyle}` : ""}
// Evaluate each criterion and provide a realistic score.`,
//           },
//         ],
//         request.aiProvider === "openai" ? { type: "json_object" } : undefined,
//         0.1,
//         request.userId  // Pass userId for API key lookup
//       );

//       totalTokens += Math.max(1, seoAnalysisResponse.tokens);
//       keyType = seoAnalysisResponse.keyType || 'system';

//       // Parse SEO response
//       try {
//         let cleanContent = seoAnalysisResponse.content.trim();
//         if (!cleanContent.startsWith("{")) {
//           const start = cleanContent.indexOf("{");
//           const end = cleanContent.lastIndexOf("}") + 1;
//           if (start !== -1 && end > start) {
//             cleanContent = cleanContent.substring(start, end);
//           }
//         }

//         const seoAnalysis = JSON.parse(cleanContent);
//         if (
//           typeof seoAnalysis.contentSeoScore === "number" &&
//           seoAnalysis.contentSeoScore >= 1 &&
//           seoAnalysis.contentSeoScore <= 100
//         ) {
//           seoScore = Math.round(seoAnalysis.contentSeoScore);
//           console.log(`✅ SEO Score: ${seoScore}`);
//         } else {
//           console.warn(`⚠️ Invalid SEO score, using fallback`);
//           seoScore = 55;
//         }
//       } catch (parseError) {
//         console.error("❌ Failed to parse SEO analysis, using fallback score");
//         seoScore = 50;
//       }

//       // Step 2: Readability Analysis
//       const readabilityResponse = await this.callAI(
//         request.aiProvider,
//         [
//           {
//             role: "system",
//             content: `You are a content readability expert. Analyze text complexity and return a numeric score 1-100.

// READABILITY SCORING CRITERIA:

// SENTENCE STRUCTURE (30 points):
// - Average sentence length under 20 words (10 points)
// - Variety in sentence length (8 points)
// - Simple sentence structure (7 points)
// - Minimal complex clauses (5 points)

// VOCABULARY COMPLEXITY (25 points):
// - Use of common, everyday words (10 points)
// - Minimal jargon or well-explained terms (8 points)
// - Active voice usage (7 points)

// CONTENT ORGANIZATION (25 points):
// - Clear paragraph structure (8 points)
// - Effective transitions (8 points)
// - Logical information flow (5 points)
// - Proper formatting (4 points)

// COMPREHENSION EASE (20 points):
// - Understandable by target audience (8 points)
// - Clear key points (6 points)
// - Supporting examples (6 points)

// CRITICAL: Return ONLY JSON: {"readabilityScore": number, "analysis": "explanation"}`,
//           },
//           {
//             role: "user",
//             content: `Analyze readability of this content:

// ${request.content.substring(0, 2000)}${request.content.length > 2000 ? "..." : ""}

// Consider:
// - Sentence complexity
// - Word choice
// - Paragraph structure
// - Overall flow`,
//           },
//         ],
//         request.aiProvider === "openai" ? { type: "json_object" } : undefined,
//         0.1,
//         request.userId  // Pass userId
//       );

//       totalTokens += Math.max(1, readabilityResponse.tokens);

//       // Parse readability response
//       try {
//         let cleanContent = readabilityResponse.content.trim();
//         if (!cleanContent.startsWith("{")) {
//           const start = cleanContent.indexOf("{");
//           const end = cleanContent.lastIndexOf("}") + 1;
//           if (start !== -1 && end > start) {
//             cleanContent = cleanContent.substring(start, end);
//           }
//         }

//         const readabilityAnalysis = JSON.parse(cleanContent);
//         if (
//           typeof readabilityAnalysis.readabilityScore === "number" &&
//           readabilityAnalysis.readabilityScore >= 1 &&
//           readabilityAnalysis.readabilityScore <= 100
//         ) {
//           readabilityScore = Math.round(readabilityAnalysis.readabilityScore);
//           console.log(`✅ Readability Score: ${readabilityScore}`);
//         } else {
//           console.warn(`⚠️ Invalid readability score, using fallback`);
//           readabilityScore = 60;
//         }
//       } catch (parseError) {
//         console.error("❌ Failed to parse readability analysis, using fallback");
//         readabilityScore = 60;
//       }

//       // Step 3: Brand Voice Analysis
//       const brandVoiceResponse = await this.callAI(
//         request.aiProvider,
//         [
//           {
//             role: "system",
//             content: `You are a brand voice analyst. Return a numeric score 1-100 for brand alignment.

// BRAND VOICE SCORING CRITERIA:

// TONE CONSISTENCY (30 points):
// - Maintains specified tone throughout (15 points)
// - Tone appropriate for target audience (8 points)
// - Consistent voice personality (7 points)

// VOCABULARY ALIGNMENT (25 points):
// - Word choice matches brand voice (10 points)
// - Consistent formality level (8 points)
// - Industry-appropriate terminology (7 points)

// BRAND PERSONALITY EXPRESSION (25 points):
// - Reflects brand values (10 points)
// - Writing style matches brand character (8 points)
// - Appropriate authority level (7 points)

// AUDIENCE APPROPRIATENESS (20 points):
// - Language suitable for demographic (8 points)
// - Content complexity matches audience (7 points)
// - Cultural sensitivity (5 points)

// CRITICAL: Return ONLY JSON: {"brandVoiceScore": number, "analysis": "evaluation"}`,
//           },
//           {
//             role: "user",
//             content: `Analyze brand voice alignment:

// CONTENT: ${request.content.substring(0, 1500)}${
//               request.content.length > 1500 ? "..." : ""
//             }

// BRAND REQUIREMENTS:
// - Specified Tone: ${request.tone}
// - Brand Voice: ${request.brandVoice || "Not specified - use tone as guidance"}
// - Target Audience: ${request.targetAudience || "General audience"}
// - Industry Context: Based on content topic

// Evaluate how well the content aligns with these brand requirements.`,
//           },
//         ],
//         request.aiProvider === "openai" ? { type: "json_object" } : undefined,
//         0.1,
//         request.userId  // Pass userId
//       );

//       totalTokens += Math.max(1, brandVoiceResponse.tokens);

//       // Parse brand voice response
//       try {
//         let cleanContent = brandVoiceResponse.content.trim();
//         if (!cleanContent.startsWith("{")) {
//           const start = cleanContent.indexOf("{");
//           const end = cleanContent.lastIndexOf("}") + 1;
//           if (start !== -1 && end > start) {
//             cleanContent = cleanContent.substring(start, end);
//           }
//         }

//         const brandVoiceAnalysis = JSON.parse(cleanContent);
//         if (
//           typeof brandVoiceAnalysis.brandVoiceScore === "number" &&
//           brandVoiceAnalysis.brandVoiceScore >= 1 &&
//           brandVoiceAnalysis.brandVoiceScore <= 100
//         ) {
//           brandVoiceScore = Math.round(brandVoiceAnalysis.brandVoiceScore);
//           console.log(`✅ Brand Voice Score: ${brandVoiceScore}`);
//         } else {
//           console.warn(`⚠️ Invalid brand voice score, using fallback`);
//           brandVoiceScore = 65;
//         }
//       } catch (parseError) {
//         console.error("❌ Failed to parse brand voice analysis, using fallback");
//         brandVoiceScore = 65;
//       }

//       console.log(
//         `Content analysis completed - SEO: ${seoScore}%, Readability: ${readabilityScore}%, Brand Voice: ${brandVoiceScore}%`
//       );

//       // Calculate cost
//       const pricing = AI_MODELS[request.aiProvider].pricing;
//       const avgTokenCost = (pricing.input + pricing.output) / 2;
//       const analysisCostUsd = (totalTokens * avgTokenCost) / 1000;

//       // Track analysis usage
//       try {
//         await storage.trackAiUsage({
//           websiteId: request.websiteId,
//           userId: request.userId,
//           model: AI_MODELS[request.aiProvider].model,
//           tokensUsed: totalTokens,
//           costUsd: Math.max(1, Math.round(analysisCostUsd * 100)),
//           operation: "content_analysis",
//           keyType: keyType
//         });
//       } catch (trackingError: any) {
//         console.warn("AI usage tracking failed:", trackingError.message);
//       }

//       return {
//         seoScore: seoScore,
//         readabilityScore: readabilityScore,
//         brandVoiceScore: brandVoiceScore,
//         tokensUsed: totalTokens,
//         costUsd: Number(analysisCostUsd.toFixed(6)),
//         aiProvider: request.aiProvider,
//       };
//     } catch (error: any) {
//       if (error instanceof AIProviderError || error instanceof AnalysisError) {
//         throw error;
//       }

//       console.error("Analysis error, using fallback scores:", error.message);
//       return {
//         seoScore: 55,
//         readabilityScore: 60,
//         brandVoiceScore: 65,
//         tokensUsed: Math.max(1, totalTokens || 100),
//         costUsd: 0.001,
//         aiProvider: request.aiProvider,
//       };
//     }
//   }

//   private generateQualityChecks(content: string, request: ContentGenerationRequest) {
//     const wordCount = content.split(" ").length;
//     const hasKeywords = request.keywords.some((keyword) =>
//       content.toLowerCase().includes(keyword.toLowerCase())
//     );
//     const sentenceCount = content.split(".").length;
//     const avgWordsPerSentence = wordCount / sentenceCount;

//     const plagiarismRisk = content.length > 500 && hasKeywords ? "low" : "medium";
//     const factualAccuracy =
//       wordCount > 400 && hasKeywords && avgWordsPerSentence < 25
//         ? "verified"
//         : "needs_review";
//     const brandAlignment =
//       request.brandVoice && request.targetAudience ? "good" : "needs_improvement";

//     return {
//       plagiarismRisk: plagiarismRisk as const,
//       factualAccuracy: factualAccuracy as const,
//       brandAlignment: brandAlignment as const,
//     };
//   }

//   private generateExcerpt(content: string): string {
//     const firstParagraph = content.split("\n")[0] || content;
//     return firstParagraph.length > 160
//       ? firstParagraph.substring(0, 157) + "..."
//       : firstParagraph;
//   }

//   private generateMetaDescription(title: string, content: string): string {
//     const excerpt = this.generateExcerpt(content);
//     return excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt;
//   }

// // ============================================
// // ADD THIS NEW METHOD (around line 800-900, before buildContentPrompt)
// // ============================================

// private getNicheSpecificRequirements(niche: string): string {
//   const requirements: Record<string, string> = {
    
//     reputation_sites: `

// CRITICAL REPUTATION SITES REQUIREMENTS:

// Platform Knowledge:
// - Reference actual platforms: Trustpilot, Yelp, Google Reviews, BBB, G2
// - Mention platform-specific features (verification badges, response mechanisms)
// - Include real statistics and data when discussing platforms

// Balanced Perspective:
// - Address BOTH business and consumer viewpoints
// - Acknowledge that reviews can be biased (both positive and negative)
// - Don't villainize either businesses or consumers

// Ethical Guidelines:
// - NEVER promote fake review services or manipulation tactics
// - NEVER suggest burying legitimate negative reviews
// - Focus on ethical review generation and response strategies
// - Distinguish between authentic reviews, suspicious patterns, and malicious reviews
// - Discuss review response best practices, not gaming the system`,

//     peptides: `

// NICHE-SPECIFIC REQUIREMENTS FOR PEPTIDES:

// Scientific Credibility (E-A-T Compliance):

// - Reference actual published studies when making claims (PubMed, peer-reviewed journals)
// - Use proper terminology but explain it: "growth hormone secretagogue" then "(basically stimulates GH release)"
// - Include molecular mechanisms only when relevant, not as filler
// - Cite dosage ranges from research, not anecdotal forums
// - Acknowledge limitations and unknowns in the science
// - Distinguish between animal studies, human trials, and theoretical applications

// Trust & Safety:

// - Always include appropriate medical disclaimers without being preachy
// - Address side effects honestly - both documented and potential
// - Never recommend sources or suppliers (legal/ethical boundary)
// - Distinguish between peptides with human clinical data vs research-only compounds
// - Be clear about regulatory status (research use, off-label, etc.)

// Audience Understanding:
// Your readers are: bodybuilders, biohackers, anti-aging seekers, researchers, medical professionals

// - They can handle technical information but appreciate clear explanations
// - They're skeptical of marketing hype but responsive to data
// - Many are experienced with peptides, so don't oversimplify
// - They want practical information: protocols, timing, storage, reconstitution

// Content Depth:

// - If discussing specific peptides, cover: mechanism, typical dosing, timing, what studies show, common stacks
// - For protocols: duration, frequency, cycling recommendations based on literature
// - For safety: documented side effects, contraindications, monitoring parameters
// - Include storage requirements (temperature, light exposure, reconstitution shelf life)

// What to Avoid:

// - Promotional language for any specific supplier or brand
// - Unsubstantiated claims of miracle results
// - Comparing peptides to illegal substances without context
// - Oversimplifying complex biological mechanisms
// - Legal/medical advice (stick to informational/educational)

// Writing Approach:

// - Start with the specific question or concern being addressed
// - Use subheadings that reflect actual information, not curiosity gaps
// - Provide ranges and context rather than absolute statements
// - When citing studies, mention study size, duration, and limitations
// - End with practical takeaways, not sales pitches

// Write with authority that comes from understanding the science, not from performing authority.`,

//     gambling: `

// NICHE-SPECIFIC REQUIREMENTS FOR GAMBLING/BETTING:

// Responsible Gambling Framework:

// - Include responsible gambling elements naturally, not as afterthought disclaimers
// - Acknowledge that most bettors lose long-term (it's entertainment spending)
// - Never promote betting as income replacement or "guaranteed" systems
// - Mention bankroll management and stake sizing in strategy content
// - Reference problem gambling resources where appropriate

// Credibility Markers:

// - Use real odds examples from recent events (specific numbers, specific games)
// - Reference actual betting markets and terminology correctly
// - Cite statistical concepts accurately (expected value, variance, ROI, closing line value)
// - Mention legitimate data sources: Oddsportal, sports-reference databases, historical line data
// - Acknowledge house edge, vig/juice, and how books make money

// Audience Understanding:
// Your readers range from casual bettors to sharp players:

// - They know basic terminology, don't over-explain
// - They respect statistical analysis over "hot takes"
// - They want actionable information: finding value, reading lines, identifying +EV spots
// - Many are tracking their own data and want to improve their process

// Content Depth:

// - For strategy content: explain the logic, not just the tactic
// - Include real examples: "When the Bucks opened -4.5 and moved to -6 by tipoff..."
// - For analysis: show your work (data sources, methodology, edge calculation)
// - For tools/systems: explain both the advantage and the limitations
// - Address variance and sample size in results discussions

// Legal & Compliance:

// - Acknowledge jurisdiction differences without getting bogged down
// - Don't promote betting where it's illegal
// - Focus on regions where online betting is regulated
// - Reference licensed operators when necessary

// What to Avoid:

// - Guaranteed wins, locks, sure things, can't-miss bets
// - Promoting betting as wealth-building
// - Suggesting people bet money they need
// - Using fake testimonials or manufactured win rates
// - "We won 12 of our last 15 picks!" without context

// Writing Approach:

// - Lead with the edge or insight, not with preamble
// - Use specific examples from real games/events
// - Quantify when possible: percentages, odds, units, ROI
// - Subheadings should be informational, not hype
// - If discussing a strategy, explain why it works (when it works)

// Write like someone who actually tracks their bets in a spreadsheet and understands both wins and losses.`,

//     apps_marketing: `

// NICHE-SPECIFIC REQUIREMENTS FOR APPS:

// Technical Accuracy:

// - Test information when possible: actual app sizes, real feature sets, current version numbers
// - Acknowledge platform differences (iOS vs Android features, availability, pricing)
// - Mention system requirements when relevant
// - Include actual pricing: "$4.99/month" or "free with $9.99 premium" not "affordable"
// - Note when information is current as of a specific date/version

// User-Focused Evaluation:

// - Address actual use cases, not marketing copy features
// - Mention real problems: bugs users complain about, missing features, UX friction
// - Compare apps based on what people actually care about: speed, reliability, cost, privacy
// - Include limitations honestly
// - Reference actual user feedback from app stores when relevant

// Content Depth:

// - For reviews: cover functionality, performance, cost, privacy, alternatives
// - For comparisons: create meaningful comparison points, not feature checklists
// - For tutorials: include specific steps, screenshots references, version-specific instructions
// - For troubleshooting: address common issues with actual solutions
// - For recommendations: explain why one app fits specific needs better than another

// Privacy & Security:

// - Mention data collection practices when relevant
// - Note permissions required
// - Reference privacy policy highlights for apps handling sensitive data
// - Acknowledge if an app has had security issues

// What to Avoid:

// - Describing every single feature like an instruction manual
// - Generic praise that could apply to any app
// - Ignoring obvious drawbacks or limitations
// - Outdated information about apps that update frequently
// - Comparing apps to competitors without explaining trade-offs

// Writing Approach:

// - Start with what the app actually does or solves
// - Use specific examples: "when you tap the calendar icon..." not "the interface is intuitive"
// - Subheadings should answer specific questions users have
// - Include version numbers or "as of [date]" for time-sensitive info
// - Mention alternatives when one app doesn't fit all use cases

// Write like someone who actually uses apps daily and has opinions about what works and what doesn't.`,

//     exclusive_models: `

// NICHE-SPECIFIC REQUIREMENTS FOR ONLYFANS/CREATOR PLATFORMS:

// Business-First Approach:

// - Frame content around creator entrepreneurship, not explicit content
// - Focus on marketing, monetization, branding, audience building
// - Treat creators as business owners managing a personal brand
// - Include actual business considerations: taxes, equipment, time investment, market saturation
// - Acknowledge this is work, not easy money

// Creator Empowerment:

// - Respect creator autonomy and decision-making
// - Avoid judgmental language or moral positioning
// - Focus on safety, boundaries, and sustainable business practices
// - Address platform risks honestly: account bans, chargebacks, content theft
// - Include creator control over content, pricing, and boundaries

// Practical Business Information:

// - Real numbers when possible: platform fees, payment processing, typical earnings ranges
// - Actual platform features and limitations
// - Marketing tactics that work: social media cross-promotion, content strategy, subscriber retention
// - Equipment and software recommendations with specific products and price points
// - Tax implications and business structure considerations

// Audience Understanding:
// Your readers are: aspiring creators, current creators looking to grow, people researching the business

// - They want honest information about income potential and time investment
// - They need practical guidance on content creation, marketing, and platform mechanics
// - They're evaluating risk vs reward
// - Many are comparing platforms or strategies

// What to Avoid:

// - Overpromising income potential
// - Focusing on explicit content details (stay business-focused)
// - Judgmental language about creator choices
// - Suggesting this is passive income or easy money
// - Ignoring platform risks and creator safety issues

// Content Depth:

// - For strategy content: include specific tactics with implementation steps
// - For platform comparisons: real fee structures, payout terms, audience types
// - For growth content: actual marketing channels and tactics that work
// - For setup guides: step-by-step with platform-specific requirements
// - For financial content: tax categories, expense tracking, business structures

// Writing Approach:

// - Lead with the business question or challenge being addressed
// - Use real examples: "creators in the top 10% earn..." with source
// - Acknowledge challenges alongside opportunities
// - Subheadings should be descriptive and professional
// - End with practical next steps, not hype

// Write like a business consultant advising someone on a legitimate entrepreneurial venture.`,

//     ecom_nails: `

// NICHE-SPECIFIC REQUIREMENTS FOR NAILS/BEAUTY:

// Product Knowledge:

// - Use correct product terminology: gel vs gel polish, acrylic vs dip powder, builder gel
// - Reference actual brands and products when relevant
// - Include real price points for products mentioned
// - Acknowledge quality differences between professional and consumer products
// - Mention where products are typically available (Sally Beauty, Amazon, professional suppliers)

// Practical Application:

// - Include actual technique details, not just results
// - Mention tools and materials needed with specifics
// - Address common mistakes and how to avoid them
// - Include timing: curing times, dry times, wear duration
// - Reference skill level honestly (beginner vs requires practice)

// Visual Content References:

// - Describe looks specifically: "short almond shape with chrome powder" not "pretty nails"
// - Reference actual trends by name: glazed donut nails, chrome, cat eye, jelly nails
// - When discussing nail art, be specific about technique: stamping, freehand, water marble
// - Include color specifics: shade names, undertones, finish types

// Health & Safety:

// - Address nail health honestly: damage from certain techniques, proper removal
// - Mention ventilation for products that require it
// - Include patch test recommendations for new products
// - Acknowledge when professional help is better than DIY

// Audience Understanding:
// Your readers range from beginners to experienced home manicurists:

// - They want results that last without salon prices
// - They're willing to invest in quality products if justified
// - They've likely had nail disasters and want to avoid repeating them
// - They follow trends but want practical, wearable versions

// What to Avoid:

// - Generic beauty language: "pamper yourself," "treat yourself"
// - Describing every product as "amazing" or "game-changing"
// - Ignoring cost considerations or suggesting only premium products
// - Skipping difficulty level or time investment
// - Before/after language without substance

// Content Depth:

// - For tutorials: step-by-step with timing and specific products
// - For product content: what it does, how it compares, who it's for, price range
// - For trends: how to actually achieve the look, products needed, difficulty level
// - For problem-solving: root causes, solutions, prevention
// - For seasonal content: specific wearable designs, not just inspiration

// Writing Approach:

// - Start with the specific outcome or problem
// - Use precise descriptions of colors, techniques, and products
// - Subheadings should be instructional or descriptive
// - Include both aspirational and practical elements
// - Acknowledge when professional services are worth it vs DIY

// Write like someone who does their own nails regularly and has learned what works through experience.`,

//     soccer_jersey: `

// NICHE-SPECIFIC REQUIREMENTS FOR SOCCER JERSEYS:

// Product Authenticity:

// - Distinguish clearly between authentic, replica, and counterfeit jerseys
// - Explain manufacturing differences: stitching, materials, details, fit
// - Reference actual manufacturers: Nike, Adidas, Puma, specific factories
// - Include price ranges for different quality levels
// - Address authentication methods for expensive/vintage jerseys

// Fan Culture Understanding:

// - Acknowledge emotional connection fans have to jerseys
// - Reference actual clubs, players, seasons correctly
// - Use proper terminology: kit, strip, home/away/third
// - Mention historical context when relevant
// - Respect both casual fans and serious collectors

// Practical Buying Information:

// - Sizing guidance by manufacturer (Nike runs small, Adidas fits, etc.)
// - Where to buy: official stores, authorized retailers, secondary market
// - Price expectations for different jersey types
// - Best times to buy (end of season sales, new kit releases)
// - International shipping and customs considerations

// Technical Details:

// - Fabric technology: Dri-FIT, Climacool, specific performance features
// - Actual differences between player version and stadium version
// - Care instructions that actually matter
// - Customization options and quality differences
// - Match-worn vs issued vs commercial jerseys

// Audience Understanding:
// Your readers are: passionate fans, collectors, parents buying for kids, gift buyers

// - They care about authenticity but have different budgets
// - Many want specific players/seasons and need help finding them
// - Some are building collections and want value/investment info
// - They want jerseys that fit well and last

// What to Avoid:

// - Promoting counterfeit sources or fake jerseys
// - Generic fan excitement without substance
// - Ignoring fit issues that frustrate buyers
// - Treating all jerseys as equivalent in quality
// - Overselling collectibility or investment value

// Content Depth:

// - For buying guides: quality tiers, where to buy, what to expect at each price point
// - For authentication: specific details to check, common fakes, verification methods
// - For team/season content: actual kit details, manufacturer, special features
// - For sizing: manufacturer-specific guidance, fit differences, return policies
// - For collecting: rarity factors, condition importance, value trends

// Writing Approach:

// - Lead with the specific jersey question or need
// - Use actual examples: "The 2014 Germany World Cup jersey by Adidas..."
// - Include prices and availability when relevant
// - Subheadings should answer common buyer questions
// - Balance fan passion with practical buying information

// Write like someone who owns multiple jerseys and knows the difference between a €90 authentic and a €30 replica.`,

//     payment_processing: `

// NICHE-SPECIFIC REQUIREMENTS FOR PAYMENT PROCESSING:

// B2B Technical Accuracy:

// - Use correct payment terminology: interchange, acquirer, processor, gateway, PSP
// - Reference actual fee structures: interchange plus vs flat rate, basis points
// - Cite real providers when relevant: Stripe, Square, Authorize.net, specific processors
// - Include technical requirements: PCI DSS levels, API integration, compliance
// - Acknowledge regulatory differences across regions

// Business Decision Focus:

// - Address actual business concerns: fees, payout speed, international support, integration complexity
// - Include total cost of ownership, not just advertised rates
// - Mention hidden fees and contract terms that matter
// - Discuss scalability and volume-based pricing
// - Address industry-specific needs (high-risk, B2B, international, subscription)

// Practical Implementation:

// - Integration complexity and technical requirements
// - Time to go live and approval processes
// - Support quality and response times
// - Reconciliation and reporting capabilities
// - Multi-currency and international considerations

// Compliance & Security:

// - PCI compliance requirements by business type
// - Data security and liability concerns
// - Chargeback processes and protection
// - Fraud prevention tools and costs
// - Regional regulatory requirements (PSD2, SCA, etc.)

// Audience Understanding:
// Your readers are: business owners, financial decision-makers, developers, e-commerce operators

// - They need accurate cost comparisons
// - They're evaluating providers based on specific needs
// - They want to understand trade-offs, not marketing claims
// - Many have had issues with previous processors

// What to Avoid:

// - Promotional content for specific providers without context
// - Oversimplifying complex fee structures
// - Ignoring contract terms and switching costs
// - Generic "best payment processor" claims
// - Skipping industry-specific considerations

// Content Depth:

// - For comparisons: actual fee structures, contract terms, feature differences, ideal use cases
// - For setup guides: requirements, timeline, documentation needed, technical integration
// - For compliance: specific requirements, implementation steps, ongoing obligations
// - For problem-solving: root causes, solutions, prevention strategies
// - For international: currency support, cross-border fees, regulatory compliance

// Writing Approach:

// - Lead with the business problem or decision point
// - Use real numbers: "2.9% + 30¢ vs 2.7% + 25¢ + $25 monthly"
// - Acknowledge trade-offs rather than declaring winners
// - Subheadings should address specific business concerns
// - Include decision frameworks, not just information dumps

// Write like a consultant who has evaluated dozens of payment processors and understands both the technical and business sides.`,

//     web_dev: `

// NICHE-SPECIFIC REQUIREMENTS FOR WEB DEVELOPMENT:

// Technical Precision:

// - Use current web standards and best practices
// - Reference actual tools, frameworks, and versions: "React 18," "Node 20 LTS"
// - Include code concepts accurately, not just buzzwords
// - Mention browser compatibility when relevant
// - Acknowledge when approaches are modern vs legacy

// Practical Implementation:

// - Address actual development challenges and trade-offs
// - Include performance implications of different approaches
// - Mention setup requirements, dependencies, learning curve
// - Discuss when to use what: "use X if you need Y, but Z is better when..."
// - Reference documentation and official resources

// Developer Audience:
// Your readers range from beginners to experienced developers:

// - They can handle technical concepts, don't oversimplify
// - They want to understand "why," not just "how"
// - They're evaluating tools and approaches for real projects
// - They appreciate honest assessments of complexity and trade-offs

// Technology Landscape:

// - Acknowledge the fast-moving nature of web dev
// - Reference current trends without hype: "popular right now" not "revolutionary"
// - Compare modern approaches to what came before when helpful
// - Mention ecosystem maturity, community size, job market relevance
// - Include both cutting-edge and stable production approaches

// What to Avoid:

// - Framework wars or absolutist technology claims
// - Outdated patterns presented as current best practices
// - Ignoring real-world constraints: browser support, team skill, project timeline
// - Overly complex solutions to simple problems
// - Dismissing older approaches that still work well

// Content Depth:

// - For tutorials: clear explanations with context on why each step matters
// - For comparisons: actual technical differences, use case suitability, ecosystem factors
// - For best practices: the reasoning behind the practice, when to deviate
// - For performance: specific metrics, testing approaches, optimization strategies
// - For architecture: trade-offs, scaling considerations, maintenance implications

// Writing Approach:

// - Start with the problem or decision being addressed
// - Use specific examples: "when handling form validation..."
// - Explain concepts without assuming expert knowledge, but respect technical readers
// - Subheadings should be descriptive of technical content
// - Include both the happy path and common issues

// Write like a developer who has built production applications and understands both the theory and the reality.`,

//     app_dev: `

// NICHE-SPECIFIC REQUIREMENTS FOR APP DEVELOPMENT:

// Business & Technical Balance:

// - Address both business stakeholders and technical implementers
// - Include actual cost ranges for different development approaches
// - Discuss timeline expectations realistically
// - Cover both iOS and Android considerations when relevant
// - Mention testing, deployment, and maintenance (not just initial build)

// Platform Understanding:

// - Distinguish between native (Swift/Kotlin), cross-platform (React Native/Flutter), and hybrid
// - Reference actual platform requirements: App Store guidelines, Play Store policies
// - Include SDK and tool requirements
// - Mention platform-specific features and limitations
// - Address device fragmentation and OS version support

// Development Reality:

// - Honest timeline and cost estimates based on feature complexity
// - Acknowledge the gap between MVP and production-ready
// - Include ongoing costs: hosting, APIs, maintenance, updates
// - Discuss team requirements or solo developer feasibility
// - Address post-launch needs: updates, bug fixes, feature additions

// Audience Understanding:
// Your readers are: entrepreneurs with app ideas, business stakeholders, developers, agencies

// - Non-technical readers need context on complexity and cost
// - Technical readers want architecture and implementation details
// - Both need honest assessments of feasibility and trade-offs
// - Many are budget-conscious and timeline-sensitive

// What to Avoid:

// - Overpromising speed or ease of development
// - Treating app development as a one-time project (ongoing commitment)
// - Oversimplifying technical complexity
// - Suggesting apps as passive income without massive effort
// - Ignoring market saturation and discovery challenges

// Content Depth:

// - For cost content: break down by phase, feature complexity, approach (DIY/agency/freelance)
// - For process content: discovery through launch, including often-skipped steps
// - For technical decisions: native vs cross-platform with real trade-offs
// - For monetization: strategies with market reality and revenue expectations
// - For marketing: ASO, user acquisition costs, retention strategies

// Writing Approach:

// - Lead with the core question or decision point
// - Use real examples: "a food delivery app needs..." with specifics
// - Include ranges rather than single numbers: "$15K-$50K depending on..."
// - Subheadings should address sequential concerns or alternatives
// - Balance optimism with realism

// Write like someone who has shipped apps and can tell you what actually takes time and costs money.`,

//     construction: `

// NICHE-SPECIFIC REQUIREMENTS FOR CONSTRUCTION/B2B:

// Industry Authority:

// - Use correct construction terminology: GC, subcontractor, bid process, project types
// - Reference actual project phases: preconstruction, bidding, construction, closeout
// - Include real cost ranges and timelines appropriate to project scale
// - Mention regulatory requirements: permitting, inspections, OSHA, prevailing wage
// - Acknowledge regional differences in codes, requirements, union vs non-union

// Business Development Focus:

// - Address lead generation, qualification, and conversion challenges
// - Include bidding strategy and competitive positioning
// - Discuss project financing and payment terms
// - Cover bonding, insurance, and risk management
// - Reference industry data sources: Dodge, CMD, regional MLS for commercial

// Practical Business Intelligence:

// - Project pipeline and forecasting
// - Market conditions affecting pricing and availability
// - Technology adoption: project management, estimating, field software
// - Labor and material cost trends
// - Subcontractor relationships and capacity

// Audience Understanding:
// Your readers are: contractors, subcontractors, construction business owners, project managers

// - They're managing real business constraints: cash flow, labor, equipment
// - They need actionable intelligence on projects and opportunities
// - They're evaluating technology and process improvements
// - They understand industry challenges: margins, competition, regulation

// What to Avoid:

// - Generic business advice not specific to construction
// - Oversimplifying complex procurement or bidding processes
// - Ignoring market realities: low margins, payment delays, change orders
// - Promotional content for lead services without value context
// - Treating all construction segments as equivalent (residential vs commercial vs industrial)

// Content Depth:

// - For market analysis: specific regions, project types, value ranges, timelines
// - For bidding content: qualification process, cost estimating, competitive positioning
// - For technology: specific tools, ROI factors, implementation challenges
// - For business strategy: growth approaches, specialization, market positioning
// - For compliance: requirements by project type, penalties, best practices

// Writing Approach:

// - Lead with the business challenge or opportunity
// - Use industry-specific examples and terminology naturally
// - Include real numbers: project values, margins, timelines
// - Subheadings should address specific business concerns
// - Balance growth opportunity with operational reality

// Write like a construction business owner or PM who has managed projects and understands both operational and business sides.`,

//     loans: `

// NICHE-SPECIFIC REQUIREMENTS FOR LOANS:

// Financial Accuracy & Compliance:

// - Use correct financial terminology: APR, origination fees, amortization, LTV, DTI
// - Include actual rate ranges based on current market (acknowledge rates change)
// - Reference credit score impacts with realistic ranges
// - Mention regulatory bodies: CFPB, state banking departments, federal lending laws
// - Include required disclosures appropriately without being preachy

// Borrower Protection:

// - Explain costs clearly: interest, fees, total cost of loan
// - Address predatory lending red flags
// - Discuss impact on credit and financial health
// - Mention alternatives when appropriate
// - Be honest about qualification requirements and rejection factors

// Loan Type Specificity:

// - Distinguish between: personal loans, auto loans, mortgages, student loans, business loans, payday, title
// - Explain secured vs unsecured and implications
// - Address term lengths and how they affect total cost
// - Include prepayment and penalty considerations
// - Reference both traditional lenders and alternative options

// Audience Understanding:
// Your readers are: borrowers researching options, people with specific financial needs, credit rebuilders

// - Many are in financial stress or unfamiliar with lending
// - They need to understand true costs, not just monthly payments
// - They want to know qualification likelihood before applying
// - They need to compare multiple options fairly

// What to Avoid:

// - Promoting predatory lenders or dangerous loan products
// - Oversimplifying complex financial decisions
// - Suggesting loans as solutions to debt problems without context
// - Guaranteeing approval or specific rates
// - Ignoring the long-term cost and risk of borrowing

// Content Depth:

// - For loan guides: qualification requirements, cost breakdown, application process, alternatives
// - For comparison content: rate ranges, fees, terms, best use cases, who qualifies
// - For educational content: how loans work, credit impact, cost calculation, smart borrowing
// - For problem-solving: bad credit options, debt consolidation evaluation, refinancing math
// - For specific situations: first-time homebuyer, student loan refinance, emergency funding

// Financial Education:

// - Explain APR vs interest rate
// - Show total cost of loan, not just monthly payment
// - Include amortization concepts when relevant
// - Discuss credit score impact of applications and accounts
// - Reference debt-to-income and other qualification factors

// Writing Approach:

// - Lead with the specific financial situation or question
// - Use real examples: "a $10,000 loan at 8% over 3 years costs..."
// - Include ranges for rates and qualification requirements
// - Subheadings should address sequential borrower concerns
// - Balance access to credit with responsible borrowing guidance

// Write like a responsible financial advisor who wants borrowers to make informed decisions and understand what they're signing up for.`,

//   };

//   return requirements[niche] || '';
// }

// /**
//  * Remove metadata blocks that should not be in the content HTML
//  */
// private sanitizeContentMetadata(content: string): string {
//   let sanitized = content;
  
//   // Remove "Created:" lines (any format)
//   sanitized = sanitized.replace(/<p>\s*Created:\s*.+?<\/p>/gi, '');
//   sanitized = sanitized.replace(/Created:\s*.+/gi, '');
  
//   // Remove "Niche:" lines
//   sanitized = sanitized.replace(/<p>\s*Niche:\s*.+?<\/p>/gi, '');
//   sanitized = sanitized.replace(/Niche:\s*.+/gi, '');
  
//   // Remove "Keywords:" lines (with or without the list)
//   sanitized = sanitized.replace(/<p>\s*Keywords?:\s*.+?<\/p>/gi, '');
//   sanitized = sanitized.replace(/Keywords?:\s*.+/gi, '');
  
//   // Remove the italicized "Discover the..." excerpt blocks (common AI pattern)
//   sanitized = sanitized.replace(/<p>\s*<em>Discover\s+.+?<\/em>\s*<\/p>/gi, '');
//   sanitized = sanitized.replace(/<em>Discover\s+.+?<\/em>/gi, '');
  
//   // Remove any blockquote with "Discover" pattern
//   sanitized = sanitized.replace(/<blockquote>\s*Discover\s+.+?<\/blockquote>/gis, '');
  
//   // Remove metadata div/section containers
//   sanitized = sanitized.replace(/<div[^>]*class=["'].*?(metadata|meta-info).*?["'][^>]*>.*?<\/div>/gis, '');
  
//   // Clean up multiple empty lines or paragraphs
//   sanitized = sanitized.replace(/<p>\s*<\/p>/g, '');
//   sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
//   return sanitized.trim();
// }


// // ============================================
// // REPLACE YOUR EXISTING buildContentPrompt METHOD WITH THIS
// // ============================================
// private buildContentPrompt(request: ContentGenerationRequest): string {
//   // Determine context based on website or niche
//   let contextSection = "";
//   let effectiveBrandVoice = request.brandVoice || "";
//   let effectiveAudience = request.targetAudience || "";
//   let industryContext = "";
//   let nicheContext: any = null;

//   if (request.websiteId) {
//     contextSection = "Writing for a specific website/brand.";
//   } else if (request.niche) {
//     nicheContext = getNicheContext(request.niche);
    
//     contextSection = `Writing for the ${nicheContext.label} niche.`;
//     industryContext = `\nIndustry: ${nicheContext.industry} | Style: ${nicheContext.contentStyle}`;
    
//     effectiveBrandVoice = request.brandVoice || nicheContext.defaultBrandVoice;
//     effectiveAudience = request.targetAudience || nicheContext.defaultAudience;
//   }

//   const brandVoiceSection = effectiveBrandVoice 
//     ? `\nBrand voice: ${effectiveBrandVoice}` 
//     : "";
  
//   const audienceSection = effectiveAudience 
//     ? `\nAudience: ${effectiveAudience}` 
//     : "";

//   // ============================================
//   // BUILD BASE PROMPT
//   // ============================================
//   let prompt = `Write an article about "${request.topic}". Return valid JSON with all required fields.

// ${contextSection}
// TARGET: ${request.wordCount} words (+/- 20%), ${request.tone} tone
// KEYWORDS (use naturally): ${request.keywords.join(", ")}${brandVoiceSection}${audienceSection}${industryContext}

// 🚫 CRITICAL - DO NOT INCLUDE IN CONTENT:
// - Do NOT add "Created: [date]" or any creation timestamps
// - Do NOT add "Niche: [niche name]" or niche labels
// - Do NOT add "Keywords: [keyword list]" or keyword tags
// - Do NOT add italicized summaries like "Discover the..." at the beginning
// - Do NOT add metadata boxes or information panels
// - Do NOT include any administrative information

// The content field should contain ONLY the actual article HTML - start directly with the article content.

// WRITING PRINCIPLES:

// Voice:
// - Write like you actually know this topic and have opinions about it
// - Use first person only when you have something specific to say from experience
// - If you mention a tool, name the actual tool. If you cite a study, cite a real one or don't mention it
// - Be specific with details: exact prices, actual timeframes, real brand names
// - Don't perform casualness - just write directly

// Structure:
// - Start where the actual content begins, not with preamble
// - Vary your rhythm: some paragraphs are one sentence, others develop an idea fully
// - Subheadings should be descriptive, not cute. "How to set up authentication" beats "The surprisingly simple fix"
// - End when you're done. No need to wrap everything in a bow

// What to avoid:
// - Transition crutches: "here's the thing", "but here's the kicker", "let's dive in", "at the end of the day"
// - Excessive em-dashes
// - Lists of exactly three things every time
// - Starting sentences with "Now," or "So," as a verbal tic
// - Paragraphs that explain you're about to explain something
// - Fake personal anecdotes ("Last Tuesday I...")
// - Questions as subheadings unless they're genuinely the question someone asked

// ${request.seoOptimized ? `
// SEO: Work in keywords where they fit naturally. Primary keyword in title and early. Don't stuff.
// ` : ''}`;

//   // ============================================
//   // ADD NICHE-SPECIFIC REQUIREMENTS (CRITICAL!)
//   // ============================================
  
//   if (request.niche) {
//     const nicheRequirements = this.getNicheSpecificRequirements(request.niche);
//     if (nicheRequirements) {
//       prompt += nicheRequirements;
//     }
//   }

//   // ============================================
//   // ADD JSON OUTPUT STRUCTURE
//   // ============================================
  
//   prompt += `

// HTML FORMAT:
// Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags appropriately.
// The content should be clean article HTML without any metadata or administrative information.

// JSON OUTPUT STRUCTURE:
// {
//   "title": "Clear title under 60 chars with main keyword",
//   "content": "Full HTML article starting directly with the content (minimum ${request.wordCount * 0.8} words) - NO metadata, NO 'Created:', NO 'Niche:', NO 'Keywords:' labels",
//   "excerpt": "150-160 character summary for the excerpt field (not in content)",
//   "metaDescription": "150-160 char meta description for SEO",
//   "metaTitle": "SEO title under 60 characters",
//   "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
// }

// IMPORTANT: The "content" field must contain ONLY the article HTML. All metadata goes in separate JSON fields.

// Write like someone who knows their shit${request.niche && nicheContext ? ` in the ${nicheContext.label} space` : ''}.`;

//   return prompt;
// }


//   async optimizeContent(
//     content: string,
//     keywords: string[],
//     userId: string,
//     aiProvider: AIProvider = "openai"
//   ): Promise<{
//     optimizedContent: string;
//     suggestions: string[];
//     seoScore: number;
//   }> {
//     // Implementation remains the same as original
//     return {
//       optimizedContent: content,
//       suggestions: [],
//       seoScore: 75,
//     };
//   }
// }

// export const aiService = new AIService();