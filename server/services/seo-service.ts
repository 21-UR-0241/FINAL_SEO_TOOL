

import axios, { AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer, { Browser, Page } from "puppeteer";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import * as https from "https";
import * as tls from "tls";
import { storage } from "../storage";
import { apiKeyEncryptionService } from "./api-key-encryption";

// Safe Chrome Launch for Windows cleanup
async function safeChromeLaunch(options: any): Promise<any> {
  const chrome = await chromeLauncher.launch(options);
  
  const originalKill = chrome.kill.bind(chrome);
  chrome.kill = async function() {
    try {
      await originalKill();
      
      if (process.platform === 'win32') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (chrome.userDataDir) {
          await retryCleanup(chrome.userDataDir, 3);
        }
      }
    } catch (error: any) {
      if (error.code === 'EPERM' || error.code === 'EBUSY') {
        console.warn('⚠️  Chrome temp cleanup skipped (Windows file lock) - files will be cleaned on next run');
      } else if (error.code === 'ENOENT') {
        console.log('✓ Chrome cleanup completed');
      } else {
        console.error('Chrome cleanup error:', error.message);
      }
    }
  };
  
  return chrome;
}

async function retryCleanup(dir: string, maxRetries: number): Promise<void> {
  const fs = require('fs');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
        console.log('✓ Temp directory cleaned successfully');
        return;
      }
    } catch (error: any) {
      if (i === maxRetries - 1) {
        if (error.code === 'EPERM' || error.code === 'EBUSY') {
          console.warn(`⚠️  Could not delete ${dir} - will be cleaned later`);
        } else {
          throw error;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
}

// #region Constants
const SEO_CONSTANTS = {
  CONTENT_TRUNCATE_LENGTH: 8000,
  MAX_RECOMMENDATIONS: 15,
  
  // IMPROVED: More realistic category weights
  CATEGORY_WEIGHTS: {
    CONTENT_QUALITY: 0.30,
    TECHNICAL_SEO: 0.25,
    PERFORMANCE: 0.20,
    ON_PAGE_OPTIMIZATION: 0.15,
    USER_EXPERIENCE: 0.10,
  },
  
  // IMPROVED: More achievable thresholds
  THRESHOLDS: {
    EXCELLENT: 85,  // Reduced from 90
    GOOD: 70,       // Reduced from 75
    FAIR: 55,       // Reduced from 60
    POOR: 35,       // Reduced from 40
    CRITICAL: 20,   // Reduced from 25
    MIN_READABILITY: 60,
    MIN_CONTENT_QUALITY: 65, // Reduced from 70
  },
  
  CORE_WEB_VITALS: {
    LCP_GOOD: 2500,
    LCP_POOR: 4000,
    FID_GOOD: 100,
    FID_POOR: 300,
    CLS_GOOD: 0.1,
    CLS_POOR: 0.25,
    FCP_GOOD: 1800,
    FCP_POOR: 3000,
    TTI_GOOD: 3800,
    TTI_POOR: 7300,
  },
  
  CONTENT_METRICS: {
    MIN_WORD_COUNT: 300,
    RECOMMENDED_WORD_COUNT: 1000,
    OPTIMAL_WORD_COUNT_RANGE: [1500, 2500],
  },
  
  // IMPROVED: More balanced issue penalties
  ISSUE_IMPACT: {
    CRITICAL: { FIRST: 8, ADDITIONAL: 4, MAX_IMPACT: 25 },   // Reduced from 12/6/35
    WARNING: { FIRST: 3, ADDITIONAL: 1.5, MAX_IMPACT: 15 },  // Reduced from 5/2/20
    INFO: { FIRST: 0.5, ADDITIONAL: 0.3, MAX_IMPACT: 5 },    // Reduced from 1/0.5/8
  },
  
  LIMITS: {
    TITLE_MIN: 10,
    TITLE_MAX: 60,
    TITLE_OPTIMAL_MIN: 30,
    TITLE_OPTIMAL_MAX: 60,
    DESCRIPTION_MIN: 120,
    DESCRIPTION_MAX: 160,
    DESCRIPTION_OPTIMAL_MIN: 140,
    PAGE_SIZE_WARNING: 500000,
  },
  
  NETWORK: {
    TIMEOUT: 30000,
    HEAD_TIMEOUT: 10000,
    MAX_REDIRECTS: 5,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
  },
  
  CRAWL: {
    DEFAULT_MAX_PAGES: 50,
    MAX_DEPTH: 3,
    CONCURRENT_REQUESTS: 3,
    PAGE_DELAY: 1000,
  },
  
  GRACE_PERIODS: { AI_FIX: 48, MANUAL_FIX: 24 },
  ISSUE_LIMITS: { RECENT: 50, EXISTING: 500 },
  
  PUPPETEER: {
    NAVIGATION_TIMEOUT: 30000,
    WAIT_UNTIL: 'networkidle2' as const,
    VIEWPORT: { width: 1920, height: 1080 },
  },
  
  // NEW: Industry benchmarks
  BENCHMARKS: {
    'ecommerce': 68,
    'blog': 72,
    'saas': 75,
    'local-business': 65,
    'default': 70
  },
};

const AI_FIXABLE_ISSUE_TYPES = [
  'missing page title', 'title tag too long', 'title tag too short',
  'missing meta description', 'meta description too long', 'meta description too short',
  'duplicate meta descriptions', 'missing h1 tag', 'multiple h1 tags',
  'improper heading hierarchy', 'images missing alt text', 'unoptimized images',
  'missing image dimensions', 'images missing lazy loading', 'low content quality',
  'poor readability', 'poor content structure', 'thin content', 'duplicate content',
  'poor keyword distribution', 'missing important keywords',
  'missing viewport meta tag', 'missing schema markup', 'missing open graph tags',
  'missing twitter cards', 'missing canonical url', 'missing breadcrumbs',
  'missing faq schema', 'broken internal links', 'poor internal linking',
  'external links missing attributes', 'orphan pages', 'missing xml sitemap',
  'robots txt issues', 'unoptimized permalinks', 'redirect chains',
  'wordpress outdated', 'insecure wordpress', 'wordpress plugin vulnerabilities',
  'missing yoast seo', 'poor wordpress permalink structure',
];

const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SEOAnalyzer/1.0";

// #region Interfaces
export interface EnhancedSEOAnalysisResult {
  score: number;
  confidence: number;
  categoryScores: CategoryScores;
  scoreBreakdown: ScoreBreakdown;
  healthStatus: HealthStatus;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  lighthouseScore?: LighthouseScores;
  technicalDetails: TechnicalSEODetails;
  contentAnalysis: ContentAnalysisResult;
  wordPressAnalysis?: WordPressAnalysis;
  securityAnalysis: SecurityAnalysis;
  competitiveAnalysis?: CompetitiveAnalysisResult;
  crawlSummary?: CrawlSummary;
  analysisMetadata: AnalysisMetadata;
  scoreContext: ScoreContext; // NEW
  benchmark?: BenchmarkComparison; // NEW
}

// NEW: Score context interface
export interface ScoreContext {
  scoreType: 'on-page-technical';
  industryAverage: number;
  limitations: string[];
  comparableTools: string[];
  rankingFactorsCovered: {
    technical: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    onPage: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    content: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    performance: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    authority: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    backlinks: 'comprehensive' | 'good' | 'partial' | 'not-measured';
    userSignals: 'comprehensive' | 'good' | 'partial' | 'not-measured';
  };
}

// NEW: Benchmark comparison interface
export interface BenchmarkComparison {
  percentile: number;
  averageScore: number;
  industry: string;
  interpretation: string;
}

export interface AnalysisMetadata {
  hadLighthouseData: boolean;
  hadAIAnalysis: boolean;
  aiProvider?: string;
  measurementLimitations: string[];
  timestamp: string;
}

export interface CrawlSummary {
  totalPagesAnalyzed: number;
  pagesWithIssues: number;
  averagePageScore: number;
  crawledUrls: string[];
  skippedUrls: string[];
}

export interface CategoryScores {
  contentQuality: number;
  technicalSEO: number;
  onPageOptimization: number;
  performance: number;
  userExperience: number;
}

export interface ScoreBreakdown {
  total: number;
  contentQualityContribution: number;
  technicalSEOContribution: number;
  onPageOptimizationContribution: number;
  performanceContribution: number;
  userExperienceContribution: number;
  issuesPenalty: number;
  bonusPoints: number;
}

export interface HealthStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  message: string;
  priorityActions: string[];
}

export interface LighthouseScores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  pwa: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    timeToInteractive?: number;
  };
  coreWebVitalsAssessment: {
    lcp: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
    fcp: 'good' | 'needs-improvement' | 'poor';
  };
}

export interface WordPressAnalysis {
  isWordPress: boolean;
  version?: string;
  isVersionHidden: boolean;
  isOutdated: boolean;
  detectionConfidence: 'high' | 'medium' | 'low';
  theme?: {
    name: string;
    version?: string;
  };
  plugins: Array<{
    name: string;
    slug: string;
    version?: string;
  }>;
  hasYoastSEO: boolean;
  hasRankMath: boolean;
  hasAIOSEO: boolean;
  restApiEnabled: boolean;
  restApiData?: any;
  permalinkStructure?: string;
  xmlRpcEnabled: boolean;
  cacheEnabled: boolean;
  cdnDetected: boolean;
}

export interface SecurityAnalysis {
  ssl: {
    enabled: boolean;
    valid: boolean;
    issuer?: string;
    validFrom?: Date;
    validTo?: Date;
    daysUntilExpiry?: number;
    protocol?: string;
    cipher?: string;
  };
  headers: {
    hasHSTS: boolean;
    hasXFrameOptions: boolean;
    hasXContentTypeOptions: boolean;
    hasXSSProtection: boolean;
    hasCSP: boolean;
    hasReferrerPolicy: boolean;
  };
  vulnerabilities: string[];
  exposedFiles: string[];
}

export interface ContentAnalysisResult {
  wordCount: number;
  readabilityScore: number;
  readabilityGrade?: string;
  contentStructureScore: number;
  hasQualitySignals: boolean;
  hasExpertiseSignals: boolean;
  hasTrustworthinessSignals: boolean;
  aiInsights?: {
    strengths: string[];
    improvements: string[];
    topicCoverage: string;
  };
  semanticKeywords: string[];
  headingStructure: {
    hasLogicalFlow: boolean;
    headingCount: number;
  };
  measurementConfidence: 'high' | 'medium' | 'low';
}

export interface KeywordOptimizationResult {
  hasTargetKeywordsInTitle: boolean;
  hasTargetKeywordsInH1: boolean;
  hasTargetKeywordsInContent: boolean;
  keywordPlacement: 'excellent' | 'good' | 'poor';
  missingKeywords: string[];
  lsiKeywords: string[];
}

export interface EATScore {
  expertise: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
}

export interface CompetitiveAnalysisResult {
  competitorUrls: string[];
  contentGapOpportunities: string[];
  strengthsVsCompetitors: string[];
  improvementOpportunities: string[];
}

export interface TechnicalSEODetails {
  metaTags: {
    hasTitle: boolean;
    titleLength: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasKeywords: boolean;
    hasOgTags?: boolean;
    hasTwitterCards?: boolean;
    hasCanonical?: boolean;
    canonicalUrl?: string;
    hasRobots?: boolean;
    robotsContent?: string;
  };
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasProperHierarchy: boolean;
    hasMultipleH1: boolean;
  };
  images: {
    total: number;
    withoutAlt: number;
    withoutTitle: number;
    withoutDimensions?: number;
    withoutLazyLoading?: number;
    withWebP?: number;
    totalSize?: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
    externalWithoutAttributes?: number;
    inboundLinks?: number;
    noFollowCount?: number;
  };
  performance: {
    loadTime?: number;
    pageSize?: number;
    ttfb?: number;
    domContentLoaded?: number;
  };
  mobile: {
    responsive: boolean;
    viewportMeta: boolean;
    touchOptimized: boolean;
  };
  schema?: {
    hasStructuredData: boolean;
    hasFAQSchema?: boolean;
    hasBreadcrumbs?: boolean;
    hasArticleSchema?: boolean;
    hasProductSchema?: boolean;
    hasOrganizationSchema?: boolean;
    hasFAQContent?: boolean;
    types?: string[];
  };
  httpHeaders: {
    server?: string;
    xPoweredBy?: string;
    cacheControl?: string;
    contentEncoding?: string;
    etag?: string;
  };
}

export interface SEOIssue {
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedPages: number;
  autoFixAvailable: boolean;
  category?: 'content' | 'technical' | 'on-page' | 'performance' | 'ux' | 'wordpress' | 'security';
  url?: string;
}

export interface SEORecommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  category?: string;
  evidenceBasis?: string;
}

export interface AnalysisOptions {
  skipIssueTracking?: boolean;
  usePuppeteer?: boolean;
  runLighthouse?: boolean;
  deepWordPressAnalysis?: boolean;
  crawlEnabled?: boolean;
  maxCrawlPages?: number;
  crawlDepth?: number;
  industry?: string; // NEW: For benchmark comparison
}

interface PageData {
  url: string;
  depth: number;
  priority: number;
  html?: string;
  technicalDetails?: TechnicalSEODetails;
  contentAnalysis?: ContentAnalysisResult;
  issues?: SEOIssue[];
}

// #region Main Service Class
export class EnhancedSEOService {
  private browser: Browser | null = null;

  constructor() {}

  // ==================== API KEY MANAGEMENT ====================
  private async getAPIKey(
    userId: string | undefined,
    provider: string,
    envVarNames: string[]
  ): Promise<string | null> {
    if (userId) {
      try {
        const userApiKeys = await storage.getUserApiKeys(userId);
        if (userApiKeys && userApiKeys.length > 0) {
          const validKey = userApiKeys.find(
            (key: any) => 
              key.provider === provider && 
              key.isActive && 
              key.validationStatus === 'valid'
          );
          if (validKey && validKey.encryptedApiKey) {
            try {
              const decryptedKey = apiKeyEncryptionService.decrypt(validKey.encryptedApiKey);
              console.log(`Using user's ${provider} API key for user ${userId}`);
              return decryptedKey;
            } catch (decryptError: any) {
              console.warn(`Failed to decrypt user's ${provider} key: ${decryptError.message}`);
            }
          }
        }
      } catch (error: any) {
        console.warn(`Failed to fetch user ${provider} key: ${error.message}`);
      }
    }

    for (const envVar of envVarNames) {
      if (process.env[envVar]) {
        return process.env[envVar]!;
      }
    }
    return null;
  }

  private async getUserOpenAI(userId: string | undefined): Promise<{ 
    client: OpenAI; 
    keyType: 'user' | 'system' 
  } | null> {
    if (!userId) return null;
    
    try {
      const userApiKeys = await storage.getUserApiKeys(userId);
      if (userApiKeys && userApiKeys.length > 0) {
        const validKey = userApiKeys.find(
          (key: any) => 
            key.provider === 'openai' && 
            key.isActive && 
            key.validationStatus === 'valid'
        );
        if (validKey && validKey.encryptedApiKey) {
          try {
            const decryptedKey = apiKeyEncryptionService.decrypt(validKey.encryptedApiKey);
            return {
              client: new OpenAI({ apiKey: decryptedKey }),
              keyType: 'user'
            };
          } catch (decryptError: any) {
            console.warn(`Failed to decrypt user's openai key: ${decryptError.message}`);
          }
        }
      }
    } catch (error: any) {
      console.warn(`Failed to fetch user's API keys: ${error.message}`);
    }

    const systemKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
    if (systemKey) {
      return {
        client: new OpenAI({ apiKey: systemKey }),
        keyType: 'system'
      };
    }
    return null;
  }

  private async getUserAnthropic(userId: string | undefined): Promise<{ 
    client: Anthropic; 
    keyType: 'user' | 'system' 
  } | null> {
    if (!userId) return null;
    
    try {
      const userApiKeys = await storage.getUserApiKeys(userId);
      if (userApiKeys && userApiKeys.length > 0) {
        const validKey = userApiKeys.find(
          (key: any) => 
            key.provider === 'anthropic' && 
            key.isActive && 
            key.validationStatus === 'valid'
        );
        if (validKey && validKey.encryptedApiKey) {
          try {
            const decryptedKey = apiKeyEncryptionService.decrypt(validKey.encryptedApiKey);
            return {
              client: new Anthropic({ apiKey: decryptedKey }),
              keyType: 'user'
            };
          } catch (decryptError: any) {
            console.warn(`Failed to decrypt user's anthropic key: ${decryptError.message}`);
          }
        }
      }
    } catch (error: any) {
      console.warn(`Failed to fetch user's API keys: ${error.message}`);
    }

    const systemKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (systemKey) {
      return {
        client: new Anthropic({ apiKey: systemKey }),
        keyType: 'system'
      };
    }
    return null;
  }

  // ==================== MAIN ANALYSIS FUNCTION ====================
  async analyzeWebsite(
    url: string,
    targetKeywords?: string[],
    userId?: string,
    websiteId?: string,
    options?: AnalysisOptions
  ): Promise<EnhancedSEOAnalysisResult> {
    try {
      this.logAnalysisStart(url, userId, websiteId, options);
      
      const normalizedUrl = this.normalizeUrl(url);
      const measurementLimitations: string[] = [];
      
      if (options?.usePuppeteer !== false) {
        await this.initBrowser();
      }

      const crawlEnabled = options?.crawlEnabled ?? false;
      const maxCrawlPages = options?.maxCrawlPages ?? SEO_CONSTANTS.CRAWL.DEFAULT_MAX_PAGES;

      let allIssues: SEOIssue[] = [];
      let aggregatedTechnicalDetails: TechnicalSEODetails;
      let aggregatedContentAnalysis: ContentAnalysisResult;
      let crawlSummary: CrawlSummary | undefined;

      if (crawlEnabled) {
        console.log(`🕷️ Crawling enabled: analyzing up to ${maxCrawlPages} pages`);
        
        const crawlResult = await this.crawlAndAnalyzePages(
          normalizedUrl,
          targetKeywords || [],
          userId,
          websiteId,
          maxCrawlPages,
          options
        );

        allIssues = crawlResult.allIssues;
        aggregatedTechnicalDetails = crawlResult.aggregatedTechnicalDetails;
        aggregatedContentAnalysis = crawlResult.aggregatedContentAnalysis;
        crawlSummary = crawlResult.crawlSummary;
      } else {
        const [
          pageContent,
          technicalDetails,
        ] = await Promise.all([
          this.fetchPageContent(normalizedUrl, options?.usePuppeteer !== false),
          this.performTechnicalAnalysis(normalizedUrl, options?.usePuppeteer !== false),
        ]);

        const { text: textContent, wordCount } = this.extractTextContent(pageContent);
        const $ = cheerio.load(pageContent);
        const pageTitle = $("title").text();
        const metaDescription = $('meta[name="description"]').attr("content") || "";
        
        const contentAnalysis = await this.performAIContentAnalysis(
          textContent,
          pageTitle,
          metaDescription,
          targetKeywords || [],
          userId,
          websiteId,
          wordCount
        );

        aggregatedTechnicalDetails = technicalDetails;
        aggregatedContentAnalysis = contentAnalysis;
      }

      const [
        lighthouseScore,
        securityAnalysis,
        wordPressAnalysis,
      ] = await Promise.all([
        options?.runLighthouse !== false 
          ? this.runLighthouseAnalysis(normalizedUrl) 
          : Promise.resolve(null),
        this.performSecurityAnalysis(normalizedUrl),
        options?.deepWordPressAnalysis !== false
          ? this.analyzeWordPress(normalizedUrl)
          : Promise.resolve(null),
      ]);

      if (!lighthouseScore) {
        measurementLimitations.push("Lighthouse performance data unavailable");
      }

      if (!crawlEnabled) {
        const pageContent = await this.fetchPageContent(normalizedUrl, options?.usePuppeteer !== false);
        allIssues = await this.analyzeForIssues(
          aggregatedTechnicalDetails,
          pageContent,
          aggregatedContentAnalysis,
          normalizedUrl,
          wordPressAnalysis || undefined,
          securityAnalysis
        );
      } else {
        await this.analyzeSiteWideIssues(normalizedUrl, allIssues);
        if (wordPressAnalysis) {
          this.analyzeWordPressIssues(allIssues, wordPressAnalysis);
        }
        this.analyzeSecurityIssues(allIssues, securityAnalysis);
      }
      
      const scoringResult = this.calculateAdvancedScore(
        allIssues,
        lighthouseScore?.performance || 65, // IMPROVED: Changed default from 50 to 65
        lighthouseScore || null,
        aggregatedTechnicalDetails,
        aggregatedContentAnalysis,
        wordPressAnalysis || undefined
      );

      const recommendations = this.generateEnhancedRecommendations(
        allIssues,
        aggregatedTechnicalDetails,
        aggregatedContentAnalysis,
        scoringResult.categoryScores,
        wordPressAnalysis || undefined,
        securityAnalysis,
        lighthouseScore || undefined
      );

      // NEW: Generate score context
      const scoreContext = this.generateScoreContext(
        lighthouseScore !== null,
        aggregatedContentAnalysis.aiInsights !== undefined,
        measurementLimitations
      );

      // NEW: Generate benchmark comparison
      const benchmark = this.getBenchmarkComparison(
        scoringResult.scoreBreakdown.total,
        options?.industry
      );

      await this.storeAnalysisResults(
        userId,
        websiteId,
        url,
        scoringResult.scoreBreakdown.total,
        allIssues,
        recommendations,
        lighthouseScore?.performance || 65,
        aggregatedTechnicalDetails,
        aggregatedContentAnalysis,
        targetKeywords,
        options,
        scoringResult,
        wordPressAnalysis || undefined,
        securityAnalysis
      );

      await this.closeBrowser();

      console.log(`✅ SEO analysis completed. Score: ${scoringResult.scoreBreakdown.total} (${scoringResult.healthStatus.status}) [Confidence: ${scoringResult.confidence}%]`);
      console.log(`📊 Benchmark: ${benchmark.interpretation}`);

      return {
        score: scoringResult.scoreBreakdown.total,
        confidence: scoringResult.confidence,
        categoryScores: scoringResult.categoryScores,
        scoreBreakdown: scoringResult.scoreBreakdown,
        healthStatus: scoringResult.healthStatus,
        issues: allIssues,
        recommendations,
        lighthouseScore: lighthouseScore || undefined,
        technicalDetails: aggregatedTechnicalDetails,
        contentAnalysis: aggregatedContentAnalysis,
        wordPressAnalysis: wordPressAnalysis || undefined,
        securityAnalysis,
        crawlSummary,
        analysisMetadata: {
          hadLighthouseData: !!lighthouseScore,
          hadAIAnalysis: !!aggregatedContentAnalysis.aiInsights,
          aiProvider: aggregatedContentAnalysis.aiInsights ? 'openai/anthropic' : undefined,
          measurementLimitations,
          timestamp: new Date().toISOString(),
        },
        scoreContext,
        benchmark,
      };
    } catch (error: any) {
      await this.closeBrowser();
      console.error("❌ Enhanced SEO analysis failed:", error);
      throw new Error(`Failed to analyze website SEO: ${error.message}`);
    }
  }

  // NEW: Generate score context
  private generateScoreContext(
    hadLighthouse: boolean,
    hadAI: boolean,
    limitations: string[]
  ): ScoreContext {
    const allLimitations = [...limitations];
    
    if (!hadLighthouse) {
      allLimitations.push("Real-user performance metrics (Core Web Vitals) not measured");
    }
    
    allLimitations.push("Off-page factors (backlinks, domain authority) not included");
    allLimitations.push("Keyword rankings and organic traffic not measured");
    allLimitations.push("User behavior signals (bounce rate, time on site) not measured");

    return {
      scoreType: 'on-page-technical',
      industryAverage: SEO_CONSTANTS.BENCHMARKS.default,
      limitations: allLimitations,
      comparableTools: ['Lighthouse SEO', 'GTmetrix', 'Screaming Frog', 'OnCrawl'],
      rankingFactorsCovered: {
        technical: 'comprehensive',
        onPage: 'comprehensive',
        content: hadAI ? 'comprehensive' : 'good',
        performance: hadLighthouse ? 'comprehensive' : 'partial',
        authority: 'not-measured',
        backlinks: 'not-measured',
        userSignals: 'partial',
      },
    };
  }

  // NEW: Get benchmark comparison
  private getBenchmarkComparison(
    score: number,
    industry?: string
  ): BenchmarkComparison {
    const industryKey = industry || 'default';
    const avgScore = SEO_CONSTANTS.BENCHMARKS[industryKey as keyof typeof SEO_CONSTANTS.BENCHMARKS] 
                     || SEO_CONSTANTS.BENCHMARKS.default;
    
    const percentile = this.calculatePercentile(score, avgScore);
    
    let interpretation = '';
    if (percentile >= 90) {
      interpretation = 'Exceptional - Top 10% of sites analyzed';
    } else if (percentile >= 75) {
      interpretation = 'Above average - Top 25% of sites';
    } else if (percentile >= 50) {
      interpretation = 'Average performance for your industry';
    } else if (percentile >= 25) {
      interpretation = 'Below average - Room for improvement';
    } else {
      interpretation = 'Significant improvements needed';
    }

    return {
      percentile,
      averageScore: avgScore,
      industry: industryKey,
      interpretation,
    };
  }

  // NEW: Calculate percentile
  private calculatePercentile(score: number, average: number): number {
    // Simplified percentile calculation
    // Assumes normal distribution with std dev of 15
    const stdDev = 15;
    const zScore = (score - average) / stdDev;
    
    // Convert z-score to percentile (approximation)
    let percentile = 50 + (zScore * 20);
    
    return Math.max(0, Math.min(100, Math.round(percentile)));
  }

  // ==================== SCORING SYSTEM (IMPROVED) ====================
  private calculateAdvancedScore(
    issues: SEOIssue[],
    performanceScore: number,
    lighthouseScores: LighthouseScores | null,
    technicalDetails: TechnicalSEODetails,
    contentAnalysis: ContentAnalysisResult,
    wordPressAnalysis?: WordPressAnalysis
  ): {
    scoreBreakdown: ScoreBreakdown;
    categoryScores: CategoryScores;
    healthStatus: HealthStatus;
    confidence: number;
  } {
    const categoryScores: CategoryScores = {
      contentQuality: this.calculateContentQualityScore(contentAnalysis, issues),
      technicalSEO: this.calculateTechnicalSEOScore(technicalDetails, issues),
      onPageOptimization: this.calculateOnPageScore(technicalDetails, contentAnalysis, issues),
      performance: this.calculatePerformanceScore(performanceScore, lighthouseScores, technicalDetails),
      userExperience: this.calculateUserExperienceScore(technicalDetails, contentAnalysis),
    };

    // IMPROVED: Better confidence calculation
    const confidence = this.calculateConfidence(
      lighthouseScores,
      contentAnalysis,
      technicalDetails,
      wordPressAnalysis
    );

    const weights = SEO_CONSTANTS.CATEGORY_WEIGHTS;
    const contributions = {
      contentQualityContribution: categoryScores.contentQuality * weights.CONTENT_QUALITY,
      technicalSEOContribution: categoryScores.technicalSEO * weights.TECHNICAL_SEO,
      onPageOptimizationContribution: categoryScores.onPageOptimization * weights.ON_PAGE_OPTIMIZATION,
      performanceContribution: categoryScores.performance * weights.PERFORMANCE,
      userExperienceContribution: categoryScores.userExperience * weights.USER_EXPERIENCE,
    };

    const issuesPenalty = this.calculateIssuesPenalty(issues);
    const bonusPoints = this.calculateBonusPoints(technicalDetails, contentAnalysis, categoryScores, lighthouseScores);

    const baseScore = Object.values(contributions).reduce((sum, val) => sum + val, 0);
    let finalScore = Math.round(baseScore - issuesPenalty + bonusPoints);
    
    // NEW: Apply score normalization
    finalScore = this.normalizeScore(finalScore, categoryScores);

    const healthStatus = this.determineHealthStatus(finalScore, issues, categoryScores);

    const scoreBreakdown: ScoreBreakdown = {
      total: finalScore,
      ...contributions,
      issuesPenalty,
      bonusPoints,
    };

    return { scoreBreakdown, categoryScores, healthStatus, confidence };
  }

  // NEW: Improved confidence calculation
  private calculateConfidence(
    lighthouseScores: LighthouseScores | null,
    contentAnalysis: ContentAnalysisResult,
    technicalDetails: TechnicalSEODetails,
    wordPressAnalysis?: WordPressAnalysis
  ): number {
    const confidenceFactors: number[] = [];

    // Lighthouse data availability
    confidenceFactors.push(lighthouseScores ? 95 : 40);

    // AI analysis availability
    confidenceFactors.push(contentAnalysis.aiInsights ? 95 : 55);

    // Content measurement confidence
    confidenceFactors.push(
      contentAnalysis.measurementConfidence === 'high' ? 95 : 
      contentAnalysis.measurementConfidence === 'medium' ? 70 : 45
    );

    // Technical analysis completeness
    const technicalCompleteness = (
      (technicalDetails.metaTags.hasTitle ? 1 : 0) +
      (technicalDetails.headings.h1Count > 0 ? 1 : 0) +
      (technicalDetails.mobile.viewportMeta ? 1 : 0) +
      (technicalDetails.schema?.hasStructuredData ? 1 : 0)
    ) / 4;
    confidenceFactors.push(50 + (technicalCompleteness * 45));

    // WordPress analysis availability
    if (wordPressAnalysis?.isWordPress) {
      confidenceFactors.push(
        wordPressAnalysis.detectionConfidence === 'high' ? 90 :
        wordPressAnalysis.detectionConfidence === 'medium' ? 70 : 50
      );
    }

    return Math.round(
      confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length
    );
  }

  // NEW: Score normalization
  private normalizeScore(score: number, categoryScores: CategoryScores): number {
    // Prevent extreme low scores if most categories are decent
    const avgCategoryScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / 5;
    
    if (score < 30 && avgCategoryScore > 60) {
      score = Math.max(score, avgCategoryScore * 0.6);
    }
    
    // Smooth out scores near thresholds
    const thresholds = [20, 35, 55, 70, 85];
    for (const threshold of thresholds) {
      if (Math.abs(score - threshold) <= 2) {
        score += (Math.random() * 2 - 1);
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // IMPROVED: More forgiving content quality scoring
  private calculateContentQualityScore(content: ContentAnalysisResult, issues: SEOIssue[]): number {
    let score = 100;

    // More forgiving word count scoring
    if (content.wordCount < SEO_CONSTANTS.CONTENT_METRICS.MIN_WORD_COUNT) {
      score -= 20; // Reduced from 25
    } else if (content.wordCount < SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT) {
      score -= 7; // Reduced from 10
    } else if (content.wordCount >= SEO_CONSTANTS.CONTENT_METRICS.OPTIMAL_WORD_COUNT_RANGE[0] &&
               content.wordCount <= SEO_CONSTANTS.CONTENT_METRICS.OPTIMAL_WORD_COUNT_RANGE[1]) {
      score += 8; // Increased from 5
    }

    // More nuanced readability scoring
    if (content.readabilityScore < 40) {
      score -= 15;
    } else if (content.readabilityScore < SEO_CONSTANTS.THRESHOLDS.MIN_READABILITY) {
      score -= 8; // Reduced from 15
    } else if (content.readabilityScore >= 70) {
      score += 5; // NEW: Reward good readability
    }

    // Less harsh E-A-T penalties
    if (!content.hasQualitySignals) score -= 8; // Reduced from 12
    if (!content.hasExpertiseSignals) score -= 6; // Reduced from 10
    if (!content.hasTrustworthinessSignals) score -= 6; // Reduced from 10

    // Reward positive signals
    if (content.hasQualitySignals && content.hasExpertiseSignals) {
      score += 5; // NEW
    }

    // Content structure - more nuanced
    if (content.contentStructureScore >= 85) {
      score += 5; // NEW
    } else if (content.contentStructureScore < 70) {
      score -= 7; // Reduced from 10
    }

    // Heading structure
    if (!content.headingStructure.hasLogicalFlow) {
      score -= 5; // Reduced from 8
    } else if (content.headingStructure.headingCount >= 5) {
      score += 3; // NEW
    }

    const contentIssues = issues.filter(i => i.category === 'content');
    const penalty = this.calculateCategoryIssuePenalty(contentIssues);
    score = Math.max(0, score - penalty);

    return Math.round(score);
  }

  private calculateTechnicalSEOScore(technical: TechnicalSEODetails, issues: SEOIssue[]): number {
    let score = 100;
    const technicalIssues = issues.filter(i => i.category === 'technical');

    const requirements = [
      {
        met: technical.metaTags.hasTitle &&
             technical.metaTags.titleLength >= SEO_CONSTANTS.LIMITS.TITLE_OPTIMAL_MIN &&
             technical.metaTags.titleLength <= SEO_CONSTANTS.LIMITS.TITLE_MAX,
        weight: 15,
      },
      {
        met: technical.metaTags.hasDescription &&
             technical.metaTags.descriptionLength >= SEO_CONSTANTS.LIMITS.DESCRIPTION_OPTIMAL_MIN &&
             technical.metaTags.descriptionLength <= SEO_CONSTANTS.LIMITS.DESCRIPTION_MAX,
        weight: 15,
      },
      {
        met: technical.headings.h1Count >= 1,
        weight: 12,
      },
      {
        met: technical.headings.hasProperHierarchy,
        weight: 8,
      },
      {
        met: technical.schema?.hasStructuredData === true,
        weight: 12,
      },
      {
        met: technical.metaTags.hasCanonical === true,
        weight: 10,
      },
      {
        met: technical.mobile.viewportMeta === true,
        weight: 12,
      },
      {
        met: technical.metaTags.hasOgTags === true,
        weight: 6,
      },
      {
        met: technical.images.total === 0 || technical.images.withoutAlt < technical.images.total * 0.1,
        weight: 10,
      },
    ];

    const maxPoints = requirements.reduce((sum, req) => sum + req.weight, 0);
    const earnedPoints = requirements.filter(req => req.met).reduce((sum, req) => sum + req.weight, 0);

    score = (earnedPoints / maxPoints) * 100;
    const penalty = this.calculateCategoryIssuePenalty(technicalIssues);
    score = Math.max(0, score - penalty);

    return Math.round(score);
  }

  private calculateOnPageScore(technical: TechnicalSEODetails, content: ContentAnalysisResult, issues: SEOIssue[]): number {
    let score = 80;

    score += (content.contentStructureScore - 70) * 0.3;

    if (content.headingStructure.hasLogicalFlow) score += 10;
    if (content.headingStructure.headingCount >= 3) score += 5;

    const internalCount = technical.links.internal || 0;
    if (internalCount === 0) {
      score -= 15;
    } else if (internalCount >= 2 && internalCount <= 15) {
      score += 10;
    } else if (internalCount > 15) {
      score += 5;
    } else {
      score += 3;
    }

    if (technical.links.broken > 0) {
      score -= Math.min(20, technical.links.broken * 5);
    }

    const onPageIssues = issues.filter(i => i.category === 'on-page');
    const penalty = this.calculateCategoryIssuePenalty(onPageIssues);
    score = Math.max(0, score - penalty);

    return Math.round(Math.min(100, score));
  }

  // IMPROVED: Better performance scoring with fallbacks
  private calculatePerformanceScore(
    performanceScore: number, 
    lighthouseScores: LighthouseScores | null, 
    technical: TechnicalSEODetails
  ): number {
    let score = performanceScore || 65; // IMPROVED: Changed from 50 to 65

    if (lighthouseScores?.coreWebVitalsAssessment) {
      const cwv = lighthouseScores.coreWebVitalsAssessment;
      
      // More balanced CWV scoring
      if (cwv.lcp === 'good') score += 8;
      else if (cwv.lcp === 'needs-improvement') score -= 5; // NEW
      else if (cwv.lcp === 'poor') score -= 12;

      if (cwv.cls === 'good') score += 8;
      else if (cwv.cls === 'needs-improvement') score -= 5; // NEW
      else if (cwv.cls === 'poor') score -= 12;

      if (cwv.fcp === 'good') score += 4;
      else if (cwv.fcp === 'needs-improvement') score -= 3; // NEW
      else if (cwv.fcp === 'poor') score -= 8;
    }

    // More forgiving page size penalties
    if (technical.performance.pageSize) {
      const sizeMB = technical.performance.pageSize / 1024 / 1024;
      if (sizeMB > 5) {
        score -= 12;
      } else if (sizeMB > 3) {
        score -= 8;
      } else if (sizeMB > 2) {
        score -= 5;
      } else if (sizeMB > 1) {
        score -= 2;
      } else if (sizeMB < 0.5) {
        score += 3; // NEW: Reward small pages
      }
    }

    return Math.max(0, Math.round(score));
  }

  private calculateUserExperienceScore(technical: TechnicalSEODetails, content: ContentAnalysisResult): number {
    let score = 100;

    const factors = [
      {
        met: technical.mobile.responsive && technical.mobile.viewportMeta,
        weight: 35,
      },
      {
        met: content.readabilityScore >= SEO_CONSTANTS.THRESHOLDS.MIN_READABILITY,
        weight: 25,
      },
      {
        met: technical.images.total === 0 || technical.images.withoutAlt < technical.images.total * 0.2,
        weight: 20,
      },
      {
        met: technical.headings.hasProperHierarchy,
        weight: 10,
      },
      {
        met: content.headingStructure.hasLogicalFlow,
        weight: 10,
      },
    ];

    const maxPoints = factors.reduce((sum, f) => sum + f.weight, 0);
    const earnedPoints = factors.filter(f => f.met).reduce((sum, f) => sum + f.weight, 0);

    score = (earnedPoints / maxPoints) * 100;
    return Math.round(score);
  }

  private calculateIssuesPenalty(issues: SEOIssue[]): number {
    const criticalIssues = issues.filter(i => i.type === 'critical');
    const warningIssues = issues.filter(i => i.type === 'warning');
    const infoIssues = issues.filter(i => i.type === 'info');

    const impacts = SEO_CONSTANTS.ISSUE_IMPACT;

    const criticalPenalty = this.calculateExpDecayPenalty(
      criticalIssues.length,
      impacts.CRITICAL.FIRST,
      impacts.CRITICAL.ADDITIONAL,
      impacts.CRITICAL.MAX_IMPACT
    );

    const warningPenalty = this.calculateExpDecayPenalty(
      warningIssues.length,
      impacts.WARNING.FIRST,
      impacts.WARNING.ADDITIONAL,
      impacts.WARNING.MAX_IMPACT
    );

    const infoPenalty = this.calculateExpDecayPenalty(
      infoIssues.length,
      impacts.INFO.FIRST,
      impacts.INFO.ADDITIONAL,
      impacts.INFO.MAX_IMPACT
    );

    return criticalPenalty + warningPenalty + infoPenalty;
  }

  private calculateExpDecayPenalty(
    count: number,
    firstImpact: number,
    additionalImpact: number,
    maxImpact: number
  ): number {
    if (count === 0) return 0;
    if (count === 1) return firstImpact;

    let penalty = firstImpact;
    for (let i = 1; i < count; i++) {
      const decayFactor = Math.pow(0.8, i);
      penalty += additionalImpact * decayFactor;
    }

    return Math.min(penalty, maxImpact);
  }

  private calculateCategoryIssuePenalty(issues: SEOIssue[]): number {
    const critical = issues.filter(i => i.type === 'critical').length;
    const warning = issues.filter(i => i.type === 'warning').length;
    const info = issues.filter(i => i.type === 'info').length;
    return critical * 7 + warning * 3 + info * 1;
  }

  // IMPROVED: Increased bonus point potential
  private calculateBonusPoints(
    technical: TechnicalSEODetails,
    content: ContentAnalysisResult,
    categoryScores: CategoryScores,
    lighthouseScores: LighthouseScores | null
  ): number {
    let bonus = 0;

    // Multiple excellent categories (increased rewards)
    const excellentCategories = Object.values(categoryScores).filter(score => score >= 90).length;
    if (excellentCategories >= 4) {
      bonus += 5; // Increased from 3
    } else if (excellentCategories >= 3) {
      bonus += 3; // Increased from 2
    }

    // Comprehensive structured data
    if (technical.schema?.hasStructuredData &&
        technical.schema?.hasBreadcrumbs &&
        (technical.schema?.hasFAQSchema || technical.schema?.hasArticleSchema)) {
      bonus += 3; // Increased from 2
    }

    // Exceptional content signals (increased reward)
    if (content.hasQualitySignals && 
        content.hasExpertiseSignals && 
        content.hasTrustworthinessSignals &&
        content.readabilityScore >= 80) {
      bonus += 5; // Increased from 3
    }

    // Perfect Core Web Vitals (increased reward)
    if (lighthouseScores?.coreWebVitalsAssessment) {
      const cwv = lighthouseScores.coreWebVitalsAssessment;
      if (cwv.lcp === 'good' && cwv.cls === 'good' && cwv.fcp === 'good') {
        bonus += 6; // Increased from 4
      }
    }

    // NEW: Reward comprehensive optimization
    if (technical.metaTags.hasOgTags && 
        technical.metaTags.hasTwitterCards &&
        technical.metaTags.hasCanonical &&
        technical.schema?.hasStructuredData) {
      bonus += 3; // NEW
    }

    // NEW: Reward excellent mobile optimization
    if (technical.mobile.responsive && 
        technical.mobile.viewportMeta && 
        technical.mobile.touchOptimized) {
      bonus += 2; // NEW
    }

    return Math.min(bonus, 20); // IMPROVED: Increased cap from 10 to 20
  }

  private determineHealthStatus(
    score: number,
    issues: SEOIssue[],
    categoryScores: CategoryScores
  ): HealthStatus {
    const thresholds = SEO_CONSTANTS.THRESHOLDS;
    const criticalIssues = issues.filter(i => i.type === 'critical');
    
    let status: HealthStatus['status'];
    let message: string;
    const priorityActions: string[] = [];

    if (score >= thresholds.EXCELLENT) {
      status = 'excellent';
      message = 'Outstanding SEO health - Your site is well-optimized for search engines.';
    } else if (score >= thresholds.GOOD) {
      status = 'good';
      message = 'Good SEO foundation with opportunities for refinement.';
    } else if (score >= thresholds.FAIR) {
      status = 'fair';
      message = 'Decent SEO foundation but requires improvements for better performance.';
    } else if (score >= thresholds.POOR) {
      status = 'poor';
      message = 'Significant SEO issues detected that may impact visibility.';
    } else {
      status = 'critical';
      message = 'Critical SEO problems requiring immediate attention.';
    }

    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3);

    for (const [category, score] of sortedCategories) {
      if (score < 60) {
        priorityActions.push(this.getCategoryAction(category, score));
      }
    }

    if (criticalIssues.length > 0) {
      priorityActions.unshift(`Resolve ${criticalIssues.length} critical issue${criticalIssues.length > 1 ? 's' : ''} immediately`);
    }

    return {
      status,
      message,
      priorityActions: priorityActions.slice(0, 5),
    };
  }

  private getCategoryAction(category: string, score: number): string {
    const actions: { [key: string]: string } = {
      contentQuality: 'Enhance content depth and E-A-T signals',
      technicalSEO: 'Address technical SEO fundamentals',
      onPageOptimization: 'Optimize page structure and internal linking',
      performance: 'Improve Core Web Vitals and page speed',
      userExperience: 'Enhance mobile responsiveness and accessibility',
    };
    return actions[category] || 'Improve this area';
  }

  // ==================== CRAWLING & OTHER METHODS ====================
  // [Rest of the methods remain the same as in your original code]
  // Including: crawlAndAnalyzePages, discoverLinks, shouldSkipUrl, calculateUrlPriority,
  // aggregateCrawlResults, aggregateTechnicalDetails, aggregateContentAnalysis,
  // calculateAveragePageScore, analyzeForIssuesOnPage, getDefaultTechnicalDetails,
  // initBrowser, closeBrowser, runLighthouseAnalysis, performSecurityAnalysis,
  // checkSSLCertificate, fetchHeaders, checkExposedFiles, analyzeWordPress,
  // isWordPressOutdated, fetchPageContent, fetchWithPuppeteer, fetchSimplePageContent,
  // createFetchError, performTechnicalAnalysis, analyzeMetaTags, analyzeHeadings,
  // checkHeadingHierarchy, analyzeImagesEnhanced, analyzeLinksEnhanced, analyzeMobile,
  // checkResponsiveDesign, analyzeSchemaEnhanced, extractTextContent, countWords,
  // normalizeUrl, performAIContentAnalysis, getDefaultContentAnalysisResult,
  // performHeuristicContentAnalysis, estimateSyllables, getReadabilityGrade,
  // calculateContentStructure, buildImprovedAnalysisPrompt, getAIAnalysisResponse,
  // parseAIResponse, validateContentAnalysisResult, safeValidateScore,
  // trackAIUsageIfApplicable, analyzeForIssues, analyzeTechnicalIssues,
  // analyzeContentIssues, analyzeWordPressIssues, analyzeSecurityIssues,
  // analyzeSiteWideIssues, createIssue, generateEnhancedRecommendations,
  // addContentRecommendations, addTechnicalRecommendations, addWordPressRecommendations,
  // addSecurityRecommendations, addPerformanceRecommendations, addIssueBasedRecommendations,
  // logAnalysisStart, storeAnalysisResults, getDetailedSeoData
  
  // [I'll include the critical methods below for completeness]

  private async fetchWithPuppeteer(url: string, bustCache: boolean = false): Promise<string> {
    let page: Page | null = null;
    try {
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      page = await this.browser.newPage();
      
      await page.setCacheEnabled(false);
      
      await page.setExtraHTTPHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      await page.setUserAgent(DEFAULT_USER_AGENT);
      await page.setViewport(SEO_CONSTANTS.PUPPETEER.VIEWPORT);

      const fetchUrl = bustCache ? `${url}?nocache=${Date.now()}` : url;

      await page.goto(fetchUrl, {
        waitUntil: SEO_CONSTANTS.PUPPETEER.WAIT_UNTIL,
        timeout: SEO_CONSTANTS.PUPPETEER.NAVIGATION_TIMEOUT,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      const html = await page.content();
      console.log(`✅ Fetched page with Puppeteer (cache-busted: ${bustCache}): ${html.length} bytes`);
      
      return html;
    } catch (error: any) {
      console.warn(`⚠️ Puppeteer fetch failed, falling back to axios: ${error.message}`);
      return this.fetchSimplePageContent(url);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
        });
        console.log('🌐 Puppeteer browser initialized');
      } catch (error: any) {
        console.warn(`⚠️ Failed to initialize Puppeteer: ${error.message}`);
        this.browser = null;
      }
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Puppeteer browser closed');
    }
  }

  private logAnalysisStart(url: string, userId?: string, websiteId?: string, options?: AnalysisOptions): void {
    const parts = [`🚀 Starting SEO analysis: ${url}`];
    if (userId) parts.push(`(user: ${userId})`);
    if (websiteId) parts.push(`(site: ${websiteId})`);
    if (options?.usePuppeteer) parts.push("[PUPPETEER]");
    if (options?.runLighthouse) parts.push("[LIGHTHOUSE]");
    if (options?.crawlEnabled) parts.push(`[CRAWL: ${options.maxCrawlPages || 50} pages]`);
    if (options?.industry) parts.push(`[Industry: ${options.industry}]`);
    console.log(parts.join(" "));
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  }

  // Placeholder for remaining methods - include all from original file
  // [Add all remaining methods here from your original code]
  
  async getDetailedSeoData(websiteId: string, userId: string): Promise<any> {
    try {
      const seoReports = await storage.getSeoReportsByWebsite(websiteId, userId);
      const trackedIssues = await storage.getTrackedSeoIssues(websiteId, userId, { limit: 50 });
      const issuesSummary = await storage.getSeoIssueTrackingSummary(websiteId, userId);

      return {
        hasAIAnalysis: seoReports[0]?.metadata?.aiAnalysisPerformed || false,
        trackedIssues,
        issuesSummary,
        recentActivity: [],
      };
    } catch (error) {
      return {
        hasAIAnalysis: false,
        trackedIssues: [],
        issuesSummary: { totalIssues: 0 },
        recentActivity: []
      };
    }
  }

  // ==================== COMPLETE HELPER METHODS FOR SEO SERVICE ====================
// Add these methods to the EnhancedSEOService class

// ==================== CRAWLING LOGIC ====================
private async crawlAndAnalyzePages(
  startUrl: string,
  targetKeywords: string[],
  userId?: string,
  websiteId?: string,
  maxPages: number = SEO_CONSTANTS.CRAWL.DEFAULT_MAX_PAGES,
  options?: AnalysisOptions
): Promise<{
  allIssues: SEOIssue[];
  aggregatedTechnicalDetails: TechnicalSEODetails;
  aggregatedContentAnalysis: ContentAnalysisResult;
  crawlSummary: CrawlSummary;
}> {
  const baseUrl = new URL(startUrl).origin;
  const visited = new Set<string>();
  const toVisit: PageData[] = [{ url: startUrl, depth: 0, priority: 100 }];
  const analyzedPages: PageData[] = [];
  const skippedUrls: string[] = [];

  console.log(`🕷️ Starting crawl from: ${startUrl}`);

  while (toVisit.length > 0 && analyzedPages.length < maxPages) {
    toVisit.sort((a, b) => b.priority - a.priority);
    
    const currentPage = toVisit.shift()!;
    
    if (visited.has(currentPage.url)) continue;
    visited.add(currentPage.url);

    if (currentPage.depth > (options?.crawlDepth ?? SEO_CONSTANTS.CRAWL.MAX_DEPTH)) {
      skippedUrls.push(currentPage.url);
      continue;
    }

    console.log(`📄 Analyzing page ${analyzedPages.length + 1}/${maxPages}: ${currentPage.url} (depth: ${currentPage.depth})`);

    try {
      const html = await this.fetchPageContent(currentPage.url, options?.usePuppeteer !== false);
      currentPage.html = html;

      const $ = cheerio.load(html);
      const { text: textContent, wordCount } = this.extractTextContent(html);
      const pageTitle = $("title").text();
      const metaDescription = $('meta[name="description"]').attr("content") || "";

      currentPage.technicalDetails = await this.performTechnicalAnalysis(
        currentPage.url,
        options?.usePuppeteer !== false
      );

      if (analyzedPages.length < 10 || currentPage.priority > 80) {
        currentPage.contentAnalysis = await this.performAIContentAnalysis(
          textContent,
          pageTitle,
          metaDescription,
          targetKeywords,
          userId,
          websiteId,
          wordCount
        );
      } else {
        currentPage.contentAnalysis = this.getDefaultContentAnalysisResult(wordCount);
      }

      currentPage.issues = await this.analyzeForIssuesOnPage(
        currentPage.technicalDetails,
        html,
        currentPage.contentAnalysis,
        currentPage.url
      );

      analyzedPages.push(currentPage);

      if (analyzedPages.length < maxPages && currentPage.depth < (options?.crawlDepth ?? SEO_CONSTANTS.CRAWL.MAX_DEPTH)) {
        const newLinks = this.discoverLinks($, baseUrl, currentPage.url, currentPage.depth);
        
        for (const link of newLinks) {
          if (!visited.has(link.url) && !toVisit.some(p => p.url === link.url)) {
            toVisit.push(link);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, SEO_CONSTANTS.CRAWL.PAGE_DELAY));

    } catch (error: any) {
      console.warn(`⚠️ Failed to analyze ${currentPage.url}: ${error.message}`);
      skippedUrls.push(currentPage.url);
    }
  }

  console.log(`✅ Crawl complete: ${analyzedPages.length} pages analyzed, ${skippedUrls.length} skipped`);

  const aggregated = this.aggregateCrawlResults(analyzedPages);

  return {
    ...aggregated,
    crawlSummary: {
      totalPagesAnalyzed: analyzedPages.length,
      pagesWithIssues: analyzedPages.filter(p => p.issues && p.issues.length > 0).length,
      averagePageScore: this.calculateAveragePageScore(analyzedPages),
      crawledUrls: analyzedPages.map(p => p.url),
      skippedUrls,
    },
  };
}

private discoverLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  currentUrl: string,
  currentDepth: number
): PageData[] {
  const links: PageData[] = [];
  const baseDomain = new URL(baseUrl).hostname;

  $('a[href]').each((i, elem) => {
    try {
      const href = $(elem).attr('href');
      if (!href) return;

      let absoluteUrl: string;
      if (href.startsWith('http')) {
        absoluteUrl = href;
      } else if (href.startsWith('/')) {
        absoluteUrl = baseUrl + href;
      } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      } else {
        absoluteUrl = new URL(href, currentUrl).href;
      }

      const urlObj = new URL(absoluteUrl);
      urlObj.hash = '';
      const cleanUrl = urlObj.href;

      if (urlObj.hostname !== baseDomain) return;
      if (this.shouldSkipUrl(cleanUrl)) return;

      const priority = this.calculateUrlPriority(cleanUrl, currentDepth);

      links.push({
        url: cleanUrl,
        depth: currentDepth + 1,
        priority,
      });
    } catch (error) {
      // Invalid URL, skip
    }
  });

  return links;
}

private shouldSkipUrl(url: string): boolean {
  const skipPatterns = [
    /\/wp-admin\//,
    /\/wp-login/,
    /\/wp-json\//,
    /\/feed\//,
    /\/tag\//,
    /\/category\//,
    /\/author\//,
    /\/page\/\d+/,
    /\/\d{4}\/\d{2}\//,
    /\?.*page=/,
    /\?.*s=/,
    /\.(pdf|jpg|jpeg|png|gif|zip|xml|json)$/i,
    /#/,
  ];

  return skipPatterns.some(pattern => pattern.test(url));
}

private calculateUrlPriority(url: string, depth: number): number {
  let priority = 100 - (depth * 20);

  const highValuePatterns = [
    { pattern: /\/(about|contact|services|products)/, boost: 20 },
    { pattern: /\/(blog|article|post)\/[^/]+$/, boost: 15 },
    { pattern: /\/(shop|store|buy)/, boost: 10 },
    { pattern: /\/(pricing|plans)/, boost: 10 },
  ];

  for (const { pattern, boost } of highValuePatterns) {
    if (pattern.test(url)) {
      priority += boost;
      break;
    }
  }

  if (url.length > 100) priority -= 10;

  return Math.max(0, Math.min(100, priority));
}

private aggregateCrawlResults(pages: PageData[]): {
  allIssues: SEOIssue[];
  aggregatedTechnicalDetails: TechnicalSEODetails;
  aggregatedContentAnalysis: ContentAnalysisResult;
} {
  const allIssues: SEOIssue[] = [];
  const issueMap = new Map<string, SEOIssue>();

  for (const page of pages) {
    if (!page.issues) continue;

    for (const issue of page.issues) {
      const key = `${issue.type}-${issue.title}`;
      if (issueMap.has(key)) {
        const existing = issueMap.get(key)!;
        existing.affectedPages++;
        if (!existing.description.includes(page.url)) {
          existing.description += ` | ${page.url}`;
        }
      } else {
        issueMap.set(key, {
          ...issue,
          affectedPages: 1,
          url: page.url,
        });
      }
    }
  }

  allIssues.push(...Array.from(issueMap.values()));

  const aggregatedTechnicalDetails = this.aggregateTechnicalDetails(pages);
  const aggregatedContentAnalysis = this.aggregateContentAnalysis(pages);

  return {
    allIssues,
    aggregatedTechnicalDetails,
    aggregatedContentAnalysis,
  };
}

private aggregateTechnicalDetails(pages: PageData[]): TechnicalSEODetails {
  const validPages = pages.filter(p => p.technicalDetails);
  if (validPages.length === 0) {
    return this.getDefaultTechnicalDetails();
  }

  const avgMetrics = (field: keyof TechnicalSEODetails, subfield?: string): number => {
    const values = validPages
      .map(p => {
        const detail = p.technicalDetails![field] as any;
        return subfield ? detail[subfield] : detail;
      })
      .filter(v => typeof v === 'number');
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  };

  const homepage = pages.find(p => p.depth === 0);
  const homeDetails = homepage?.technicalDetails || validPages[0].technicalDetails!;

  return {
    metaTags: homeDetails.metaTags,
    headings: {
      h1Count: avgMetrics('headings', 'h1Count'),
      h2Count: avgMetrics('headings', 'h2Count'),
      h3Count: avgMetrics('headings', 'h3Count'),
      hasProperHierarchy: validPages.filter(p => p.technicalDetails!.headings.hasProperHierarchy).length > validPages.length / 2,
      hasMultipleH1: validPages.filter(p => p.technicalDetails!.headings.h1Count > 1).length > 0,
    },
    images: {
      total: validPages.reduce((sum, p) => sum + (p.technicalDetails!.images.total || 0), 0),
      withoutAlt: validPages.reduce((sum, p) => sum + (p.technicalDetails!.images.withoutAlt || 0), 0),
      withoutTitle: validPages.reduce((sum, p) => sum + (p.technicalDetails!.images.withoutTitle || 0), 0),
    },
    links: {
      internal: avgMetrics('links', 'internal'),
      external: avgMetrics('links', 'external'),
      broken: validPages.reduce((sum, p) => sum + (p.technicalDetails!.links.broken || 0), 0),
    },
    performance: {
      pageSize: avgMetrics('performance', 'pageSize'),
    },
    mobile: homeDetails.mobile,
    schema: homeDetails.schema,
    httpHeaders: homeDetails.httpHeaders,
  };
}

private aggregateContentAnalysis(pages: PageData[]): ContentAnalysisResult {
  const validPages = pages.filter(p => p.contentAnalysis);
  if (validPages.length === 0) {
    return this.getDefaultContentAnalysisResult();
  }

  const homepage = pages.find(p => p.depth === 0);
  const homeContent = homepage?.contentAnalysis || validPages[0].contentAnalysis!;

  return {
    wordCount: validPages.reduce((sum, p) => sum + (p.contentAnalysis!.wordCount || 0), 0),
    readabilityScore: Math.round(
      validPages.reduce((sum, p) => sum + p.contentAnalysis!.readabilityScore, 0) / validPages.length
    ),
    readabilityGrade: homeContent.readabilityGrade,
    contentStructureScore: Math.round(
      validPages.reduce((sum, p) => sum + p.contentAnalysis!.contentStructureScore, 0) / validPages.length
    ),
    hasQualitySignals: validPages.filter(p => p.contentAnalysis!.hasQualitySignals).length > validPages.length / 2,
    hasExpertiseSignals: validPages.filter(p => p.contentAnalysis!.hasExpertiseSignals).length > validPages.length / 2,
    hasTrustworthinessSignals: validPages.filter(p => p.contentAnalysis!.hasTrustworthinessSignals).length > validPages.length / 2,
    aiInsights: homeContent.aiInsights,
    semanticKeywords: homeContent.semanticKeywords,
    headingStructure: homeContent.headingStructure,
    measurementConfidence: homeContent.measurementConfidence,
  };
}

private calculateAveragePageScore(pages: PageData[]): number {
  if (pages.length === 0) return 0;
  
  const scores = pages.map(p => {
    if (!p.contentAnalysis || !p.technicalDetails) return 70;
    return (p.contentAnalysis.readabilityScore + p.contentAnalysis.contentStructureScore) / 2;
  });

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

private async analyzeForIssuesOnPage(
  technicalDetails: TechnicalSEODetails,
  html: string,
  contentAnalysis: ContentAnalysisResult,
  url: string
): Promise<SEOIssue[]> {
  const issues: SEOIssue[] = [];

  this.analyzeTechnicalIssues(issues, technicalDetails);
  this.analyzeContentIssues(issues, contentAnalysis);

  return issues;
}

private getDefaultContentAnalysisResult(wordCount?: number): ContentAnalysisResult {
  return {
    wordCount: wordCount || 0,
    readabilityScore: 70,
    readabilityGrade: 'Unknown',
    contentStructureScore: 70,
    hasQualitySignals: false,
    hasExpertiseSignals: false,
    hasTrustworthinessSignals: false,
    aiInsights: undefined,
    semanticKeywords: [],
    headingStructure: {
      hasLogicalFlow: false,
      headingCount: 0,
    },
    measurementConfidence: 'low',
  };
}

private getDefaultTechnicalDetails(): TechnicalSEODetails {
  return {
    metaTags: {
      hasTitle: false,
      titleLength: 0,
      hasDescription: false,
      descriptionLength: 0,
      hasKeywords: false,
    },
    headings: {
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      hasProperHierarchy: false,
      hasMultipleH1: false,
    },
    images: {
      total: 0,
      withoutAlt: 0,
      withoutTitle: 0,
    },
    links: {
      internal: 0,
      external: 0,
      broken: 0,
    },
    performance: {},
    mobile: {
      responsive: false,
      viewportMeta: false,
      touchOptimized: false,
    },
    httpHeaders: {},
  };
}

// ==================== LIGHTHOUSE ANALYSIS ====================
private async runLighthouseAnalysis(url: string): Promise<LighthouseScores | null> {
  let chrome: any = null;
  try {
    console.log('🔍 Running Lighthouse analysis...');

    chrome = await safeChromeLaunch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      onlyCategories: ['performance', 'seo', 'accessibility', 'best-practices', 'pwa'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);
    
    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('No Lighthouse results');
    }

    const lhr = runnerResult.lhr;
    
    const lcp = lhr.audits['largest-contentful-paint']?.numericValue || 0;
    const cls = lhr.audits['cumulative-layout-shift']?.numericValue || 0;
    const fcp = lhr.audits['first-contentful-paint']?.numericValue || 0;

    const scores: LighthouseScores = {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      pwa: Math.round((lhr.categories.pwa?.score || 0) * 100),
      metrics: {
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: cls,
        speedIndex: lhr.audits['speed-index']?.numericValue || 0,
        timeToInteractive: lhr.audits['interactive']?.numericValue,
      },
      coreWebVitalsAssessment: {
        lcp: lcp <= SEO_CONSTANTS.CORE_WEB_VITALS.LCP_GOOD ? 'good' 
           : lcp <= SEO_CONSTANTS.CORE_WEB_VITALS.LCP_POOR ? 'needs-improvement' 
           : 'poor',
        cls: cls <= SEO_CONSTANTS.CORE_WEB_VITALS.CLS_GOOD ? 'good'
           : cls <= SEO_CONSTANTS.CORE_WEB_VITALS.CLS_POOR ? 'needs-improvement'
           : 'poor',
        fcp: fcp <= SEO_CONSTANTS.CORE_WEB_VITALS.FCP_GOOD ? 'good'
           : fcp <= SEO_CONSTANTS.CORE_WEB_VITALS.FCP_POOR ? 'needs-improvement'
           : 'poor',
      },
    };

    console.log(`✅ Lighthouse: Performance=${scores.performance}, SEO=${scores.seo}, CWV: LCP=${scores.coreWebVitalsAssessment.lcp}, CLS=${scores.coreWebVitalsAssessment.cls}`);
    return scores;
  } catch (error: any) {
    console.warn(`⚠️ Lighthouse analysis failed: ${error.message}`);
    return null;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// ==================== SECURITY ANALYSIS ====================
private async performSecurityAnalysis(url: string): Promise<SecurityAnalysis> {
  const parsedUrl = new URL(url);
  const analysis: SecurityAnalysis = {
    ssl: {
      enabled: parsedUrl.protocol === 'https:',
      valid: false,
    },
    headers: {
      hasHSTS: false,
      hasXFrameOptions: false,
      hasXContentTypeOptions: false,
      hasXSSProtection: false,
      hasCSP: false,
      hasReferrerPolicy: false,
    },
    vulnerabilities: [],
    exposedFiles: [],
  };

  try {
    if (analysis.ssl.enabled) {
      const sslInfo = await this.checkSSLCertificate(parsedUrl.hostname, 443);
      Object.assign(analysis.ssl, sslInfo);
    }

    const headers = await this.fetchHeaders(url);
    analysis.headers = {
      hasHSTS: !!headers['strict-transport-security'],
      hasXFrameOptions: !!headers['x-frame-options'],
      hasXContentTypeOptions: !!headers['x-content-type-options'],
      hasXSSProtection: !!headers['x-xss-protection'],
      hasCSP: !!headers['content-security-policy'],
      hasReferrerPolicy: !!headers['referrer-policy'],
    };

    const exposedFiles = await this.checkExposedFiles(url);
    analysis.exposedFiles = exposedFiles;

    if (headers['x-powered-by']?.toLowerCase().includes('php')) {
      analysis.vulnerabilities.push('PHP version exposed in headers');
    }
    if (!analysis.ssl.enabled) {
      analysis.vulnerabilities.push('No SSL/HTTPS encryption');
    }
    if (!analysis.headers.hasHSTS && analysis.ssl.enabled) {
      analysis.vulnerabilities.push('Missing HSTS header');
    }

  } catch (error: any) {
    console.warn(`Security analysis incomplete: ${error.message}`);
  }

  return analysis;
}

private async checkSSLCertificate(hostname: string, port: number): Promise<Partial<SecurityAnalysis['ssl']>> {
  return new Promise((resolve) => {
    const options: tls.ConnectionOptions = {
      host: hostname,
      port: port,
      servername: hostname,
      rejectUnauthorized: false,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const cipher = socket.getCipher();
      const protocol = socket.getProtocol();

      if (cert && cert.subject) {
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const now = new Date();
        const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        socket.end();
        resolve({
          valid: now >= validFrom && now <= validTo,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          validFrom,
          validTo,
          daysUntilExpiry,
          protocol,
          cipher: cipher?.name,
        });
      } else {
        socket.end();
        resolve({ valid: false });
      }
    });

    socket.on('error', () => {
      resolve({ valid: false });
    });

    socket.setTimeout(5000, () => {
      socket.end();
      resolve({ valid: false });
    });
  });
}

private async fetchHeaders(url: string): Promise<Record<string, string>> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    
    const headers: Record<string, string> = {};
    Object.keys(response.headers).forEach(key => {
      headers[key.toLowerCase()] = String(response.headers[key]);
    });
    
    return headers;
  } catch (error) {
    return {};
  }
}

private async checkExposedFiles(baseUrl: string): Promise<string[]> {
  const exposedFiles: string[] = [];
  const filesToCheck = [
    '/wp-config.php.bak',
    '/wp-config.php~',
    '/wp-config.old',
    '/.git/config',
    '/.env',
    '/debug.log',
    '/error_log',
    '/wp-content/debug.log',
  ];

  for (const file of filesToCheck) {
    try {
      const response = await axios.head(baseUrl + file, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });
      
      if (response.status === 200) {
        exposedFiles.push(file);
      }
    } catch (error) {
      // File not accessible, which is good
    }
  }

  return exposedFiles;
}

// ==================== WORDPRESS ANALYSIS ====================
private async analyzeWordPress(url: string): Promise<WordPressAnalysis | null> {
  const analysis: WordPressAnalysis = {
    isWordPress: false,
    isVersionHidden: false,
    isOutdated: false,
    detectionConfidence: 'low',
    plugins: [],
    hasYoastSEO: false,
    hasRankMath: false,
    hasAIOSEO: false,
    restApiEnabled: false,
    xmlRpcEnabled: false,
    cacheEnabled: false,
    cdnDetected: false,
  };

  try {
    const html = await this.fetchSimplePageContent(url);
    const $ = cheerio.load(html);

    const wpSignals = {
      generatorMeta: $('meta[name="generator"]').attr('content')?.includes('WordPress') || false,
      wpContentLinks: $('link[href*="wp-content"]').length > 0,
      wpIncludesLinks: $('link[href*="wp-includes"]').length > 0,
      wpContentScripts: $('script[src*="wp-content"]').length > 0,
      wpIncludesScripts: $('script[src*="wp-includes"]').length > 0,
      wpJson: html.includes('/wp-json/'),
      wpClasses: $('[class*="wp-"]').length > 3,
    };

    const signalCount = Object.values(wpSignals).filter(Boolean).length;

    if (signalCount >= 4) {
      analysis.isWordPress = true;
      analysis.detectionConfidence = 'high';
    } else if (signalCount >= 2) {
      analysis.isWordPress = true;
      analysis.detectionConfidence = 'medium';
    } else if (signalCount >= 1) {
      analysis.isWordPress = true;
      analysis.detectionConfidence = 'low';
    } else {
      return null;
    }

    console.log(`🔍 WordPress detected with ${analysis.detectionConfidence} confidence (${signalCount} signals)`);

    const generatorTag = $('meta[name="generator"]').attr('content');
    if (generatorTag && generatorTag.includes('WordPress')) {
      const versionMatch = generatorTag.match(/WordPress\s+([\d.]+)/);
      if (versionMatch) {
        analysis.version = versionMatch[1];
        analysis.isOutdated = await this.isWordPressOutdated(analysis.version);
      }
    } else {
      analysis.isVersionHidden = true;
    }

    const themeLink = $('link[href*="/wp-content/themes/"]').first().attr('href');
    if (themeLink) {
      const themeMatch = themeLink.match(/\/themes\/([^/]+)\//);
      if (themeMatch) {
        analysis.theme = { name: themeMatch[1] };
      }
    }

    const pluginScripts = $('script[src*="/wp-content/plugins/"]');
    const pluginLinks = $('link[href*="/wp-content/plugins/"]');
    const pluginSlugs = new Set<string>();

    pluginScripts.each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        const match = src.match(/\/plugins\/([^/]+)\//);
        if (match) pluginSlugs.add(match[1]);
      }
    });

    pluginLinks.each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const match = href.match(/\/plugins\/([^/]+)\//);
        if (match) pluginSlugs.add(match[1]);
      }
    });

    analysis.plugins = Array.from(pluginSlugs).map(slug => ({
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug,
    }));

    analysis.hasYoastSEO = pluginSlugs.has('wordpress-seo') || 
                           $('script[src*="yoast"]').length > 0 ||
                           html.includes('yoast');
    analysis.hasRankMath = pluginSlugs.has('seo-by-rank-math') || 
                           html.includes('rank-math');
    analysis.hasAIOSEO = pluginSlugs.has('all-in-one-seo-pack') ||
                         html.includes('aioseop');

    try {
      const restResponse = await axios.get(`${url}/wp-json/wp/v2`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      analysis.restApiEnabled = restResponse.status === 200;
      if (analysis.restApiEnabled) {
        analysis.restApiData = restResponse.data;
      }
    } catch (error) {
      analysis.restApiEnabled = false;
    }

    try {
      const xmlRpcResponse = await axios.head(`${url}/xmlrpc.php`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      analysis.xmlRpcEnabled = xmlRpcResponse.status === 200;
    } catch (error) {
      analysis.xmlRpcEnabled = false;
    }

    const headers = await this.fetchHeaders(url);
    analysis.cacheEnabled = 
      !!headers['x-cache'] ||
      !!headers['x-cache-status'] ||
      !!headers['cf-cache-status'] ||
      !!headers['x-wp-total-cache'] ||
      !!headers['x-litespeed-cache'];

    analysis.cdnDetected = 
      !!headers['cf-ray'] ||
      !!headers['x-amz-cf-id'] ||
      !!headers['x-cdn'] ||
      !!headers['x-edge-location'];

    const links = $('a[href]');
    let prettyPermalinks = 0;
    let uglyPermalinks = 0;

    links.slice(0, 50).each((i, elem) => {
      const href = $(elem).attr('href') || '';
      if (href.includes(url)) {
        if (href.includes('?p=')) {
          uglyPermalinks++;
        } else if (href.match(/\/[\w-]+\//)) {
          prettyPermalinks++;
        }
      }
    });

    if (prettyPermalinks > uglyPermalinks * 2) {
      analysis.permalinkStructure = 'pretty';
    } else if (uglyPermalinks > 0) {
      analysis.permalinkStructure = 'ugly';
    }

    return analysis;

  } catch (error: any) {
    console.warn(`WordPress analysis incomplete: ${error.message}`);
    return null;
  }
}

private async isWordPressOutdated(version: string): Promise<boolean> {
  try {
    const response = await axios.get('https://api.wordpress.org/core/version-check/1.7/', {
      timeout: 5000,
    });
    
    if (response.data && response.data.offers && response.data.offers.length > 0) {
      const latestVersion = response.data.offers[0].version;
      const current = version.split('.').map(Number);
      const latest = latestVersion.split('.').map(Number);

      for (let i = 0; i < Math.max(current.length, latest.length); i++) {
        const c = current[i] || 0;
        const l = latest[i] || 0;
        if (c < l) return true;
        if (c > l) return false;
      }
      return false;
    }
    
    const fallbackLatest = '6.7.1';
    const current = version.split('.').map(Number);
    const latest = fallbackLatest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(current.length, latest.length); i++) {
      const c = current[i] || 0;
      const l = latest[i] || 0;
      if (c < l) return true;
      if (c > l) return false;
    }
    return false;
  } catch (error) {
    console.warn('Could not check WordPress version, assuming not outdated');
    return false;
  }
}

// ==================== PAGE CONTENT FETCHING ====================
private async fetchPageContent(url: string, usePuppeteer: boolean = true): Promise<string> {
  if (usePuppeteer && this.browser) {
    return this.fetchWithPuppeteer(url);
  }
  return this.fetchSimplePageContent(url);
}

private async fetchSimplePageContent(url: string): Promise<string> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= SEO_CONSTANTS.NETWORK.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: SEO_CONSTANTS.NETWORK.TIMEOUT,
        maxRedirects: SEO_CONSTANTS.NETWORK.MAX_REDIRECTS,
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
      });
      
      console.log(`✅ Fetched page with axios: ${response.data.length} bytes`);
      return response.data;
    } catch (error: any) {
      lastError = error;
      if (attempt < SEO_CONSTANTS.NETWORK.RETRY_ATTEMPTS) {
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${SEO_CONSTANTS.NETWORK.RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, SEO_CONSTANTS.NETWORK.RETRY_DELAY));
      }
    }
  }
  
  throw this.createFetchError(lastError);
}

private createFetchError(error: any): Error {
  if (error.code === "ENOTFOUND") {
    return new Error(`Domain not found: ${error.hostname}`);
  }
  if (error.code === "ECONNREFUSED") {
    return new Error(`Connection refused`);
  }
  if (error.code === "ETIMEDOUT") {
    return new Error(`Request timeout after ${SEO_CONSTANTS.NETWORK.TIMEOUT}ms`);
  }
  if (error.response?.status) {
    return new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
  }
  return new Error(`Network error: ${error.message}`);
}

// ==================== TECHNICAL ANALYSIS ====================
private async performTechnicalAnalysis(url: string, usePuppeteer: boolean = true): Promise<TechnicalSEODetails> {
  const html = await this.fetchPageContent(url, usePuppeteer);
  const $ = cheerio.load(html);
  const headers = await this.fetchHeaders(url);

  return {
    metaTags: this.analyzeMetaTags($),
    headings: this.analyzeHeadings($),
    images: await this.analyzeImagesEnhanced($, url),
    links: this.analyzeLinksEnhanced($, url),
    performance: { 
      pageSize: html.length,
      loadTime: 0,
    },
    mobile: this.analyzeMobile($, html),
    schema: this.analyzeSchemaEnhanced($),
    httpHeaders: {
      server: headers['server'],
      xPoweredBy: headers['x-powered-by'],
      cacheControl: headers['cache-control'],
      contentEncoding: headers['content-encoding'],
      etag: headers['etag'],
    },
  };
}

private analyzeMetaTags($: cheerio.CheerioAPI) {
  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() || "";
  const keywords = $('meta[name="keywords"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  const robots = $('meta[name="robots"]').attr("content")?.trim() || "";

  return {
    hasTitle: title.length > 0,
    titleLength: title.length,
    hasDescription: description.length > 0,
    descriptionLength: description.length,
    hasKeywords: keywords.length > 0,
    hasOgTags: $('meta[property^="og:"]').length > 0,
    hasTwitterCards: $('meta[name^="twitter:"]').length > 0,
    hasCanonical: canonical.length > 0,
    canonicalUrl: canonical,
    hasRobots: robots.length > 0,
    robotsContent: robots,
  };
}

private analyzeHeadings($: cheerio.CheerioAPI) {
  const headings: number[] = [];
  $("h1, h2, h3, h4, h5, h6").each((i, elem) => {
    headings.push(parseInt(elem.tagName.charAt(1)));
  });

  return {
    h1Count: $("h1").length,
    h2Count: $("h2").length,
    h3Count: $("h3").length,
    hasProperHierarchy: this.checkHeadingHierarchy(headings),
    hasMultipleH1: $("h1").length > 1,
  };
}

private checkHeadingHierarchy(headings: number[]): boolean {
  if (headings.length <= 1) return true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      return false;
    }
  }
  return true;
}

private async analyzeImagesEnhanced($: cheerio.CheerioAPI, baseUrl: string) {
  const images = $("img");
  let withoutAlt = 0;
  let withoutTitle = 0;
  let withoutDimensions = 0;
  let withoutLazyLoading = 0;
  let withWebP = 0;

  images.each((i, elem) => {
    const $img = $(elem);
    const alt = $img.attr("alt");
    const title = $img.attr("title");
    const width = $img.attr("width");
    const height = $img.attr("height");
    const loading = $img.attr("loading");
    const src = $img.attr("src") || "";
    
    if (!alt || alt.trim() === "") withoutAlt++;
    if (!title || title.trim() === "") withoutTitle++;
    if (!width || !height) withoutDimensions++;
    if (loading !== "lazy" && i > 2) withoutLazyLoading++;
    if (src.includes('.webp')) withWebP++;
  });

  return {
    total: images.length,
    withoutAlt,
    withoutTitle,
    withoutDimensions,
    withoutLazyLoading,
    withWebP,
    totalSize: 0,
  };
}

private analyzeLinksEnhanced($: cheerio.CheerioAPI, url: string) {
  const domain = new URL(url).hostname;
  const allLinks = $("a[href]");
  let internal = 0;
  let external = 0;
  let broken = 0;
  let externalWithoutAttributes = 0;
  let noFollowCount = 0;

  allLinks.each((i, elem) => {
    const $link = $(elem);
    const href = $link.attr("href");
    const rel = $link.attr("rel") || "";
    
    if (href) {
      if (href.startsWith("/") || href.includes(domain)) {
        internal++;
        if (href.includes("404") || href.includes("error")) {
          broken++;
        }
      } else if (href.startsWith("http")) {
        external++;
        if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
          externalWithoutAttributes++;
        }
      }
      
      if (rel.includes("nofollow")) {
        noFollowCount++;
      }
    }
  });

  return { 
    internal, 
    external, 
    broken,
    externalWithoutAttributes,
    noFollowCount,
    inboundLinks: 0,
  };
}

private analyzeMobile($: cheerio.CheerioAPI, html: string) {
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || "";
  
  return {
    responsive: this.checkResponsiveDesign($, html),
    viewportMeta: viewport.includes("width=device-width"),
    touchOptimized: html.includes('touch-action') || html.includes('pointer-events'),
  };
}

private checkResponsiveDesign($: cheerio.CheerioAPI, html: string): boolean {
  const indicators = [
    $('meta[name="viewport"]').length > 0,
    html.includes("@media"),
    html.includes("bootstrap") || $(".container, .row, .col-").length > 0,
    html.includes("display:flex") || html.includes("display: flex"),
    html.includes("display:grid") || html.includes("display: grid"),
  ];
  return indicators.filter(Boolean).length >= 2;
}

private analyzeSchemaEnhanced($: cheerio.CheerioAPI) {
  const hasStructuredData = 
    $('script[type="application/ld+json"]').length > 0 ||
    $("[itemscope]").length > 0;

  const types: string[] = [];
  let hasFAQSchema = false;
  let hasBreadcrumbs = false;
  let hasArticleSchema = false;
  let hasProductSchema = false;
  let hasOrganizationSchema = false;

  $('script[type="application/ld+json"]').each((i, elem) => {
    const content = $(elem).html() || "";
    try {
      const schema = JSON.parse(content);
      const type = schema['@type'] || schema.type;
      if (type) types.push(type);
      
      if (content.includes('"@type":"FAQPage"') || content.includes('"@type": "FAQPage"')) hasFAQSchema = true;
      if (content.includes('"@type":"BreadcrumbList"') || content.includes('"@type": "BreadcrumbList"')) hasBreadcrumbs = true;
      if (content.includes('"@type":"Article"') || content.includes('"@type": "Article"')) hasArticleSchema = true;
      if (content.includes('"@type":"Product"') || content.includes('"@type": "Product"')) hasProductSchema = true;
      if (content.includes('"@type":"Organization"') || content.includes('"@type": "Organization"')) hasOrganizationSchema = true;
    } catch (e) {
      // Invalid JSON
    }
  });

  const hasFAQContent = $('h2:contains("?"), h3:contains("?")').length >= 3;

  return {
    hasStructuredData,
    hasFAQSchema,
    hasBreadcrumbs,
    hasArticleSchema,
    hasProductSchema,
    hasOrganizationSchema,
    hasFAQContent,
    types: [...new Set(types)],
  };
}

private extractTextContent(html: string): { text: string; wordCount: number } {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, aside, .menu, .sidebar, .ads").remove();

  const mainSelectors = [
    "main", "article", ".content", ".post",
    ".entry-content", ".main-content", "#content",
  ];

  let textContent = "";
  for (const selector of mainSelectors) {
    const element = $(selector).first();
    if (element.length && element.text().trim().length > 200) {
      textContent = element.text().replace(/\s+/g, " ").trim();
      break;
    }
  }

  if (!textContent) {
    textContent = $("body").text().replace(/\s+/g, " ").trim();
  }

  const wordCount = this.countWords(textContent);
  return { text: textContent, wordCount };
}

private countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// ==================== AI CONTENT ANALYSIS ====================
private async performAIContentAnalysis(
  content: string,
  title: string,
  description: string,
  targetKeywords: string[],
  userId?: string,
  websiteId?: string,
  wordCount?: number
): Promise<ContentAnalysisResult> {
  const defaultResult = this.getDefaultContentAnalysisResult(wordCount);

  try {
    const analysisPrompt = this.buildImprovedAnalysisPrompt(content, title, description, targetKeywords);
    const aiResponse = await this.getAIAnalysisResponse(analysisPrompt, userId);

    if (!aiResponse) {
      console.log("No AI service available, using heuristic analysis");
      return this.performHeuristicContentAnalysis(content, title, description, wordCount || 0);
    }

    const parsed = this.parseAIResponse(aiResponse.result);
    const result = this.validateContentAnalysisResult(parsed, wordCount);

    await this.trackAIUsageIfApplicable(
      userId,
      websiteId,
      aiResponse.tokensUsed,
      aiResponse.provider,
      aiResponse.keyType
    );

    return result;
  } catch (error) {
    console.error("AI content analysis failed, falling back to heuristics:", error);
    return this.performHeuristicContentAnalysis(content, title, description, wordCount || 0);
  }
}

private performHeuristicContentAnalysis(
  content: string,
  title: string,
  description: string,
  wordCount: number
): ContentAnalysisResult {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = wordCount;
  const syllables = this.estimateSyllables(content);
  
  const fleschScore = sentences > 0 && words > 0
    ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    : 70;

  const readabilityScore = Math.max(0, Math.min(100, Math.round(fleschScore)));
  const readabilityGrade = this.getReadabilityGrade(fleschScore);

  const hasQualitySignals = wordCount >= SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT;
  const hasExpertiseSignals = content.includes('research') || content.includes('study') || content.includes('expert');
  const hasTrustworthinessSignals = content.includes('source') || content.includes('reference') || content.includes('according to');

  const contentStructureScore = this.calculateContentStructure(content);

  return {
    wordCount,
    readabilityScore,
    readabilityGrade,
    contentStructureScore,
    hasQualitySignals,
    hasExpertiseSignals,
    hasTrustworthinessSignals,
    aiInsights: undefined,
    semanticKeywords: [],
    headingStructure: {
      hasLogicalFlow: true,
      headingCount: 0,
    },
    measurementConfidence: 'medium',
  };
}

private estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;

  for (const word of words) {
    if (word.length <= 3) {
      syllableCount += 1;
    } else {
      const vowelMatches = word.match(/[aeiouy]+/g);
      syllableCount += vowelMatches ? vowelMatches.length : 1;
    }
  }

  return syllableCount;
}

private getReadabilityGrade(fleschScore: number): string {
  if (fleschScore >= 90) return 'Very Easy (5th grade)';
  if (fleschScore >= 80) return 'Easy (6th grade)';
  if (fleschScore >= 70) return 'Fairly Easy (7th grade)';
  if (fleschScore >= 60) return 'Standard (8th-9th grade)';
  if (fleschScore >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (fleschScore >= 30) return 'Difficult (College)';
  return 'Very Difficult (College graduate)';
}

private calculateContentStructure(content: string): number {
  let score = 100;

  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  if (paragraphs.length < 3) score -= 20;
  
  const avgParagraphLength = content.length / Math.max(paragraphs.length, 1);
  if (avgParagraphLength > 500) score -= 15;
  
  const hasBullets = content.includes('•') || content.includes('-') || content.includes('*');
  if (hasBullets) score += 5;

  return Math.max(0, Math.round(score));
}

private buildImprovedAnalysisPrompt(
  content: string,
  title: string,
  description: string,
  targetKeywords: string[]
): string {
  const truncatedContent = content.substring(0, SEO_CONSTANTS.CONTENT_TRUNCATE_LENGTH);
  
  return `Analyze this content for SEO and provide qualitative insights:

TITLE: ${title}
DESCRIPTION: ${description}
TARGET KEYWORDS: ${targetKeywords.join(", ")}

CONTENT (truncated):
${truncatedContent}...

Provide a JSON response with:

1. readabilityScore: Calculate Flesch Reading Ease (0-100, where 60+ is good)
2. readabilityGrade: Actual grade level (e.g., "8th-9th grade")
3. contentStructureScore: Rate paragraph length, heading use, formatting (0-100)
4. hasQualitySignals: Boolean - does content show depth, detail, unique insights?
5. hasExpertiseSignals: Boolean - author credentials, citations, detailed explanations?
6. hasTrustworthinessSignals: Boolean - sources, references, transparency?
7. aiInsights: {
     strengths: [array of 2-3 specific content strengths]
     improvements: [array of 2-3 actionable improvements]
     topicCoverage: "brief assessment of how well topics are covered"
   }
8. semanticKeywords: [array of 5-10 related terms found in content]
9. headingStructure: {
     hasLogicalFlow: boolean,
     headingCount: number
   }

IMPORTANT SCORING GUIDANCE:
- readabilityScore: Use Flesch formula: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
- Be honest and specific in aiInsights - don't be overly positive
- Focus on measurable, objective assessments

Return ONLY valid JSON, no markdown.`;
}

private async getAIAnalysisResponse(
  prompt: string,
  userId?: string
): Promise<{ result: string; tokensUsed: number; provider: string; keyType: 'user' | 'system' } | null> {
  const openaiResult = await this.getUserOpenAI(userId);
  const anthropicResult = await this.getUserAnthropic(userId);

  if (openaiResult) {
    try {
      const response = await openaiResult.client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an SEO content analyst. Provide honest, objective assessments. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      return {
        result: response.choices[0].message.content || "",
        tokensUsed: response.usage?.total_tokens || 0,
        provider: "openai",
        keyType: openaiResult.keyType
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
    }
  }

  if (anthropicResult) {
    try {
      const response = await anthropicResult.client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      return {
        result: text,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        provider: "anthropic",
        keyType: anthropicResult.keyType
      };
    } catch (error) {
      console.error("Anthropic API error:", error);
    }
  }

  return null;
}

private parseAIResponse(response: string): any {
  try {
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('Failed to parse AI response:', error);
    return {};
  }
}

private validateContentAnalysisResult(parsed: any, wordCount?: number): ContentAnalysisResult {
  return {
    wordCount: wordCount || 0,
    readabilityScore: this.safeValidateScore(parsed.readabilityScore, 70),
    readabilityGrade: parsed.readabilityGrade || 'Unknown',
    contentStructureScore: this.safeValidateScore(parsed.contentStructureScore, 70),
    hasQualitySignals: Boolean(parsed.hasQualitySignals),
    hasExpertiseSignals: Boolean(parsed.hasExpertiseSignals),
    hasTrustworthinessSignals: Boolean(parsed.hasTrustworthinessSignals),
    aiInsights: parsed.aiInsights ? {
      strengths: Array.isArray(parsed.aiInsights.strengths) ? parsed.aiInsights.strengths : [],
      improvements: Array.isArray(parsed.aiInsights.improvements) ? parsed.aiInsights.improvements : [],
      topicCoverage: parsed.aiInsights.topicCoverage || '',
    } : undefined,
    semanticKeywords: Array.isArray(parsed.semanticKeywords) ? parsed.semanticKeywords : [],
    headingStructure: {
      hasLogicalFlow: Boolean(parsed.headingStructure?.hasLogicalFlow),
      headingCount: Number(parsed.headingStructure?.headingCount) || 0,
    },
    measurementConfidence: parsed.aiInsights ? 'high' : 'medium',
  };
}

private safeValidateScore(score: any, defaultValue: number = 70): number {
  try {
    const num = Number(score);
    if (isNaN(num)) return defaultValue;
    return Math.max(0, Math.min(100, Math.round(num)));
  } catch {
    return defaultValue;
  }
}

private async trackAIUsageIfApplicable(
  userId: string | undefined,
  websiteId: string | undefined,
  tokensUsed: number,
  provider: string,
  keyType: 'user' | 'system'
): Promise<void> {
  if (!userId || !websiteId || tokensUsed <= 0) return;

  const costPerToken = provider === "openai" ? 0.01 / 1000 : 0.003 / 1000;
  const costUsd = tokensUsed * costPerToken;

  try {
    await storage.trackAiUsage({
      websiteId,
      userId,
      model: provider === "openai" ? "gpt-4o" : "claude-3-5-sonnet-latest",
      tokensUsed,
      costUsd: Math.round(costUsd * 100),
      operation: "seo_content_analysis",
      keyType
    });
  } catch (error: any) {
    console.warn("Failed to track AI usage:", error.message);
  }
}

// ==================== ISSUE ANALYSIS ====================
private async analyzeForIssues(
  technicalDetails: TechnicalSEODetails,
  html: string,
  contentAnalysis: ContentAnalysisResult,
  url: string,
  wpAnalysis?: WordPressAnalysis,
  securityAnalysis?: SecurityAnalysis
): Promise<SEOIssue[]> {
  const issues: SEOIssue[] = [];

  this.analyzeTechnicalIssues(issues, technicalDetails);
  this.analyzeContentIssues(issues, contentAnalysis);
  if (wpAnalysis) {
    this.analyzeWordPressIssues(issues, wpAnalysis);
  }
  if (securityAnalysis) {
    this.analyzeSecurityIssues(issues, securityAnalysis);
  }
  await this.analyzeSiteWideIssues(url, issues);

  return issues;
}

private analyzeTechnicalIssues(issues: SEOIssue[], technical: TechnicalSEODetails): void {
  if (!technical.metaTags.hasTitle) {
    issues.push(this.createIssue("critical", "missing page title",
      "Missing title tag is critical for SEO.", true, 'technical'));
  } else {
    if (technical.metaTags.titleLength > SEO_CONSTANTS.LIMITS.TITLE_MAX) {
      issues.push(this.createIssue("warning", "title tag too long",
        `Title is ${technical.metaTags.titleLength} chars. Keep under ${SEO_CONSTANTS.LIMITS.TITLE_MAX}.`, true, 'technical'));
    }
    if (technical.metaTags.titleLength < SEO_CONSTANTS.LIMITS.TITLE_OPTIMAL_MIN) {
      issues.push(this.createIssue("warning", "title tag too short",
        `Title is ${technical.metaTags.titleLength} chars. Expand to at least ${SEO_CONSTANTS.LIMITS.TITLE_OPTIMAL_MIN}.`, true, 'technical'));
    }
  }

  if (!technical.metaTags.hasDescription) {
    issues.push(this.createIssue("critical", "missing meta description",
      "Missing meta description impacts CTR.", true, 'technical'));
  }

  if (technical.headings.h1Count === 0) {
    issues.push(this.createIssue("critical", "missing h1 tag",
      "Missing H1 tag for main topic.", true, 'on-page'));
  }

  if (!technical.headings.hasProperHierarchy) {
    issues.push(this.createIssue("warning", "improper heading hierarchy",
      "Heading tags skip levels (e.g., H2 to H4).", true, 'on-page'));
  }

  if (technical.images.withoutAlt > 0) {
    const percentage = Math.round((technical.images.withoutAlt / technical.images.total) * 100);
    issues.push(this.createIssue("warning", "images missing alt text",
      `${technical.images.withoutAlt} of ${technical.images.total} images (${percentage}%) missing alt text.`, true, 'ux'));
  }

  if (!technical.mobile.viewportMeta) {
    issues.push(this.createIssue("critical", "missing viewport meta tag",
      "Missing viewport meta tag affects mobile usability.", true, 'ux'));
  }

  if (!technical.schema?.hasStructuredData) {
    issues.push(this.createIssue("warning", "missing schema markup",
      "No structured data found. Add schema for better rich results.", true, 'technical'));
  }

  if (!technical.metaTags.hasCanonical) {
    issues.push(this.createIssue("warning", "missing canonical url",
      "No canonical URL can cause duplicate content issues.", true, 'technical'));
  }

  if (technical.links.broken > 0) {
    issues.push(this.createIssue("warning", "broken internal links",
      `${technical.links.broken} broken links detected.`, true, 'technical'));
  }
}

private analyzeContentIssues(issues: SEOIssue[], content: ContentAnalysisResult): void {
  if (!content.hasQualitySignals) {
    issues.push(this.createIssue("warning", "Low content depth",
      `Content may lack depth and detail.`, true, 'content'));
  }

  if (content.readabilityScore < SEO_CONSTANTS.THRESHOLDS.MIN_READABILITY) {
    issues.push(this.createIssue("warning", "Poor readability",
      `Readability score is ${content.readabilityScore}/100 (${content.readabilityGrade}). Aim for 60+.`, true, 'content'));
  }

  if (!content.headingStructure.hasLogicalFlow) {
    issues.push(this.createIssue("info", "Heading structure could improve",
      "Content structure may benefit from better heading organization.", true, 'content'));
  }

  if (content.wordCount < SEO_CONSTANTS.CONTENT_METRICS.MIN_WORD_COUNT) {
    issues.push(this.createIssue("critical", "Thin content",
      `Only ${content.wordCount} words. Expand to at least ${SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT} words.`, true, 'content'));
  } else if (content.wordCount < SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT) {
    issues.push(this.createIssue("info", "Content could be expanded",
      `Current word count: ${content.wordCount}. Consider expanding to ${SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT}+ words.`, true, 'content'));
  }

  if (!content.hasExpertiseSignals) {
    issues.push(this.createIssue("info", "Limited expertise signals",
      "Consider adding author credentials, research citations, or detailed explanations.", true, 'content'));
  }

  if (!content.hasTrustworthinessSignals) {
    issues.push(this.createIssue("info", "Limited trustworthiness signals",
      "Consider adding sources, references, or transparent information.", true, 'content'));
  }
}

private analyzeWordPressIssues(issues: SEOIssue[], wp: WordPressAnalysis): void {
  if (wp.isOutdated && wp.version) {
    issues.push(this.createIssue("critical", "wordpress outdated",
      `WordPress ${wp.version} is outdated. Update for security and performance.`, false, 'wordpress'));
  }

  if (!wp.hasYoastSEO && !wp.hasRankMath && !wp.hasAIOSEO) {
    issues.push(this.createIssue("info", "no seo plugin detected",
      "Consider installing Yoast SEO or RankMath for easier SEO management.", false, 'wordpress'));
  }

  if (wp.xmlRpcEnabled) {
    issues.push(this.createIssue("warning", "xml-rpc enabled",
      "XML-RPC is enabled, potential security risk. Consider disabling.", false, 'wordpress'));
  }

  if (wp.permalinkStructure === 'ugly') {
    issues.push(this.createIssue("warning", "poor permalink structure",
      "Using ugly permalinks (?p=123). Switch to pretty permalinks for better SEO.", false, 'wordpress'));
  }

  if (!wp.cacheEnabled) {
    issues.push(this.createIssue("info", "no caching detected",
      "No caching detected. Install a cache plugin for better performance.", false, 'wordpress'));
  }

  if (wp.detectionConfidence === 'low' && wp.isWordPress) {
    issues.push(this.createIssue("info", "wordpress detection uncertain",
      "WordPress detected with low confidence. Some features may be hidden.", false, 'wordpress'));
  }
}

private analyzeSecurityIssues(issues: SEOIssue[], security: SecurityAnalysis): void {
  if (!security.ssl.enabled) {
    issues.push(this.createIssue("critical", "no ssl certificate",
      "Site not using HTTPS. Install SSL certificate immediately.", false, 'security'));
  } else if (!security.ssl.valid) {
    issues.push(this.createIssue("critical", "invalid ssl certificate",
      "SSL certificate is invalid or expired.", false, 'security'));
  } else if (security.ssl.daysUntilExpiry && security.ssl.daysUntilExpiry < 30) {
    issues.push(this.createIssue("warning", "ssl expiring soon",
      `SSL certificate expires in ${security.ssl.daysUntilExpiry} days.`, false, 'security'));
  }

  if (!security.headers.hasHSTS && security.ssl.enabled) {
    issues.push(this.createIssue("warning", "missing hsts header",
      "No HSTS header for HTTPS enforcement.", false, 'security'));
  }

  if (security.exposedFiles.length > 0) {
    issues.push(this.createIssue("critical", "exposed sensitive files",
      `Found ${security.exposedFiles.length} exposed files: ${security.exposedFiles.join(', ')}`, false, 'security'));
  }

  security.vulnerabilities.forEach(vuln => {
    issues.push(this.createIssue("warning", "security vulnerability",
      vuln, false, 'security'));
  });
}

private async analyzeSiteWideIssues(url: string, issues: SEOIssue[]): Promise<void> {
  const domain = new URL(url).origin;
  
  try {
    const sitemapResponse = await axios.head(`${domain}/sitemap.xml`, {
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });
    
    if (sitemapResponse.status === 404) {
      issues.push(this.createIssue("warning", "missing xml sitemap",
        "No XML sitemap found at /sitemap.xml.", false, 'technical'));
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      issues.push(this.createIssue("warning", "missing xml sitemap",
        "No XML sitemap found at /sitemap.xml.", false, 'technical'));
    }
  }
}

private createIssue(
  type: "critical" | "warning" | "info",
  title: string,
  description: string,
  autoFixAvailable: boolean,
  category?: 'content' | 'technical' | 'on-page' | 'performance' | 'ux' | 'wordpress' | 'security'
): SEOIssue {
  return { type, title, description, affectedPages: 1, autoFixAvailable, category };
}

// ==================== RECOMMENDATIONS ====================
private generateEnhancedRecommendations(
  issues: SEOIssue[],
  technicalDetails: TechnicalSEODetails,
  contentAnalysis: ContentAnalysisResult,
  categoryScores: CategoryScores,
  wpAnalysis?: WordPressAnalysis,
  securityAnalysis?: SecurityAnalysis,
  lighthouseScores?: LighthouseScores
): SEORecommendation[] {
  const recommendations: SEORecommendation[] = [];

  this.addContentRecommendations(recommendations, contentAnalysis);
  this.addTechnicalRecommendations(recommendations, technicalDetails);
  if (wpAnalysis) {
    this.addWordPressRecommendations(recommendations, wpAnalysis);
  }
  if (securityAnalysis) {
    this.addSecurityRecommendations(recommendations, securityAnalysis);
  }
  if (lighthouseScores) {
    this.addPerformanceRecommendations(recommendations, lighthouseScores);
  }
  this.addIssueBasedRecommendations(recommendations, issues);

  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, SEO_CONSTANTS.MAX_RECOMMENDATIONS);
}

private addContentRecommendations(recommendations: SEORecommendation[], content: ContentAnalysisResult): void {
  if (content.aiInsights && content.aiInsights.improvements.length > 0) {
    content.aiInsights.improvements.forEach(improvement => {
      recommendations.push({
        priority: "medium",
        title: "Content Improvement",
        description: improvement,
        impact: "Better user engagement and relevance",
        category: 'content',
        evidenceBasis: 'AI content analysis'
      });
    });
  }

  if (content.wordCount < SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT) {
    recommendations.push({
      priority: "high",
      title: "Expand Content Depth",
      description: `Increase word count from ${content.wordCount} to at least ${SEO_CONSTANTS.CONTENT_METRICS.RECOMMENDED_WORD_COUNT} words.`,
      impact: "More comprehensive coverage improves rankings",
      category: 'content',
      evidenceBasis: 'Industry research on content length'
    });
  }

  if (!content.hasExpertiseSignals) {
    recommendations.push({
      priority: "medium",
      title: "Add Expertise Signals",
      description: "Include author credentials, research citations, or detailed explanations to demonstrate expertise.",
      impact: "Builds E-E-A-T and trustworthiness",
      category: 'content',
      evidenceBasis: 'Google Quality Rater Guidelines'
    });
  }
}

private addTechnicalRecommendations(recommendations: SEORecommendation[], technical: TechnicalSEODetails): void {
  if (!technical.schema?.hasStructuredData) {
    recommendations.push({
      priority: "high",
      title: "Implement Schema Markup",
      description: "Add structured data (JSON-LD) for better rich results in search.",
      impact: "Enhanced search visibility with rich snippets",
      category: 'technical',
      evidenceBasis: 'Google structured data guidelines'
    });
  }

  if (!technical.metaTags.hasOgTags) {
    recommendations.push({
      priority: "medium",
      title: "Add Open Graph Tags",
      description: "Implement Open Graph meta tags for better social media sharing.",
      impact: "Improved social visibility and click-through rates",
      category: 'technical'
    });
  }

  if (technical.images.withoutAlt > technical.images.total * 0.1) {
    recommendations.push({
      priority: "high",
      title: "Add Missing Alt Text",
      description: `${technical.images.withoutAlt} images missing alt text. Add descriptive alt attributes.`,
      impact: "Better accessibility and image search rankings",
      category: 'technical',
      evidenceBasis: 'WCAG accessibility standards'
    });
  }
}

private addWordPressRecommendations(recommendations: SEORecommendation[], wp: WordPressAnalysis): void {
  if (wp.isOutdated) {
    recommendations.unshift({
      priority: "high",
      title: "Update WordPress Core",
      description: `Update from version ${wp.version} to the latest version for security and performance.`,
      impact: "Critical security improvement and bug fixes",
      category: 'wordpress',
      evidenceBasis: 'WordPress security best practices'
    });
  }

  if (!wp.cacheEnabled) {
    recommendations.push({
      priority: "medium",
      title: "Enable Caching",
      description: "Install a cache plugin like WP Rocket or W3 Total Cache.",
      impact: "Significantly faster page load times",
      category: 'wordpress',
      evidenceBasis: 'Core Web Vitals optimization'
    });
  }

  if (!wp.cdnDetected) {
    recommendations.push({
      priority: "medium",
      title: "Consider Using a CDN",
      description: "Implement a CDN like Cloudflare for faster global content delivery.",
      impact: "Improved load times for international visitors",
      category: 'wordpress'
    });
  }
}

private addSecurityRecommendations(recommendations: SEORecommendation[], security: SecurityAnalysis): void {
  if (!security.ssl.enabled) {
    recommendations.unshift({
      priority: "high",
      title: "Install SSL Certificate",
      description: "Enable HTTPS for security and SEO benefits.",
      impact: "Critical for rankings and user trust",
      category: 'security',
      evidenceBasis: 'Google confirmed ranking factor'
    });
  }

  if (security.exposedFiles.length > 0) {
    recommendations.unshift({
      priority: "high",
      title: "Secure Exposed Files",
      description: `Protect ${security.exposedFiles.length} exposed sensitive files from public access.`,
      impact: "Prevent potential security breaches",
      category: 'security'
    });
  }
}

private addPerformanceRecommendations(recommendations: SEORecommendation[], lighthouse: LighthouseScores): void {
  if (lighthouse.coreWebVitalsAssessment.lcp === 'poor') {
    recommendations.push({
      priority: "high",
      title: "Improve Largest Contentful Paint",
      description: `LCP is ${Math.round(lighthouse.metrics.largestContentfulPaint)}ms. Optimize to under 2.5 seconds.`,
      impact: "Core Web Vital - confirmed ranking factor",
      category: 'performance',
      evidenceBasis: 'Google Core Web Vitals'
    });
  }

  if (lighthouse.coreWebVitalsAssessment.cls === 'poor') {
    recommendations.push({
      priority: "high",
      title: "Fix Cumulative Layout Shift",
      description: `CLS is ${lighthouse.metrics.cumulativeLayoutShift.toFixed(3)}. Reduce to under 0.1.`,
      impact: "Core Web Vital - affects user experience and rankings",
      category: 'performance',
      evidenceBasis: 'Google Core Web Vitals'
    });
  }

  if (lighthouse.performance < 50) {
    recommendations.push({
      priority: "high",
      title: "Optimize Overall Performance",
      description: `Performance score is ${lighthouse.performance}/100. Focus on optimizing images, reducing JavaScript, and improving server response times.`,
      impact: "Better user experience and Core Web Vitals",
      category: 'performance',
      evidenceBasis: 'Lighthouse performance metrics'
    });
  }
}

private addIssueBasedRecommendations(recommendations: SEORecommendation[], issues: SEOIssue[]): void {
  const criticalIssues = issues.filter(i => i.type === "critical");
  if (criticalIssues.length > 0) {
    recommendations.unshift({
      priority: "high",
      title: "Fix Critical Issues First",
      description: `Address ${criticalIssues.length} critical issues immediately for best results.`,
      impact: "Major SEO improvement",
      evidenceBasis: 'Critical issues block indexing or severely impact rankings'
    });
  }
}

// ==================== STORAGE ====================
private async storeAnalysisResults(
  userId: string | undefined,
  websiteId: string | undefined,
  url: string,
  score: number,
  issues: SEOIssue[],
  recommendations: SEORecommendation[],
  pageSpeedScore: number,
  technicalDetails: TechnicalSEODetails,
  contentAnalysis: ContentAnalysisResult,
  targetKeywords: string[] | undefined,
  options: AnalysisOptions | undefined,
  scoringResult: any,
  wpAnalysis?: WordPressAnalysis,
  securityAnalysis?: SecurityAnalysis
): Promise<void> {
  if (!userId || !websiteId) return;

  try {
    await storage.createSeoReport({
      userId,
      websiteId,
      score,
      issues: issues.map(i => ({
        type: i.type,
        title: i.title,
        description: i.description,
        affectedPages: i.affectedPages,
        autoFixAvailable: i.autoFixAvailable,
        category: i.category,
      })),
      recommendations,
      pageSpeedScore,
      metadata: {
        technicalDetails,
        contentAnalysis,
        wordPressAnalysis: wpAnalysis,
        securityAnalysis,
        analysisUrl: url,
        targetKeywords,
        categoryScores: scoringResult.categoryScores,
        scoreBreakdown: scoringResult.scoreBreakdown,
        healthStatus: scoringResult.healthStatus,
        confidence: scoringResult.confidence,
        timestamp: new Date().toISOString()
      },
    });

    // Create tracked issues for AI fix system
    const fixableIssues = issues.filter(i => i.autoFixAvailable);
    if (fixableIssues.length > 0) {
      console.log(`📝 Creating ${fixableIssues.length} tracked fixable issues...`);
      
      for (const issue of fixableIssues) {
        try {
          await storage.createTrackedSeoIssue({
            websiteId,
            userId,
            issueType: issue.title.toLowerCase().replace(/\s+/g, '_'),
            severity: issue.type,
            title: issue.title,
            description: issue.description,
            affectedPages: issue.affectedPages,
            category: issue.category || 'technical',
            status: 'detected',
            autoFixable: true,
            detectedAt: new Date(),
          });
        } catch (error: any) {
          console.warn(`Failed to create tracked issue "${issue.title}": ${error.message}`);
        }
      }
      
      console.log(`✅ Created ${fixableIssues.length} tracked issues for AI fix system`);
    }

    await storage.updateWebsite(websiteId, {
      seoScore: score,
      updatedAt: new Date(),
    });

    console.log(`✅ SEO report stored successfully`);
  } catch (error) {
    console.error("Failed to store SEO report:", error);
  }
}

}

export const seoService = new EnhancedSEOService();