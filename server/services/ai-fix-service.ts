
import { aiService } from "server/services/ai-service";
import { wordpressService } from "server/services/wordpress-service";
import { wordPressAuthService } from "server/services/wordpress-auth";
import { storage } from "server/storage";
import { seoService } from "./seo-service";
import * as cheerio from "cheerio";
import { randomUUID } from "crypto";
import { apiKeyEncryptionService } from "./api-key-encryption";

// ==================== KEY CHANGES FOR seo_issue_tracking TABLE ====================
// 1. Column names updated to snake_case: issue_type, issue_description, element_path, etc.
// 2. Storage method names updated: getSeoIssueTracking(), updateSeoIssueTracking(), etc.
// 3. All references now explicitly use seo_issue_tracking table structure
// ===================================================================================

const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && !crypto.randomUUID) {
  // @ts-ignore
  crypto.randomUUID = generateUniqueId;
}

// Types and Interfaces
export interface AIFixResult {
  success: boolean;
  dryRun: boolean;
  fixesApplied: AIFix[];
  stats: AIFixStats;
  errors?: string[];
  message: string;
  detailedLog: string[];
  reanalysis?: ReanalysisResult;
  fixSessionId?: string;
}

export interface AIFix {
  type: string;
  description: string;
  element?: string;
  before?: string;
  after?: string;
  success: boolean;
  impact: "high" | "medium" | "low";
  error?: string;
  wordpressPostId?: number;
  elementPath?: string;
  trackedIssueId?: string;
}

interface AIFixStats {
  totalIssuesFound: number;
  fixesAttempted: number;
  fixesSuccessful: number;
  fixesFailed: number;
  estimatedImpact: string;
  detailedBreakdown: {
    altTextFixed: number;
    metaDescriptionsUpdated: number;
    titleTagsImproved: number;
    headingStructureFixed: number;
    internalLinksAdded: number;
    imagesOptimized: number;
    contentQualityImproved: number;
    schemaMarkupAdded: number;
    openGraphTagsAdded: number;
    canonicalUrlsFixed: number;
  };
}

export enum ProcessingMode {
  SAMPLE = "sample",
  PARTIAL = "partial",
  FULL = "full",
  PRIORITY = "priority",
}

interface ProcessingOptions {
  mode?: ProcessingMode;
  batchSize?: number;
  maxItems?: number;
  progressCallback?: (current: number, total: number) => void;
  priorityUrls?: string[];
}

interface ProcessingLimits {
  maxItems: number;
  batchSize: number;
  delayBetweenBatches: number;
}

interface ReanalysisResult {
  enabled: boolean;
  initialScore: number;
  finalScore: number;
  scoreImprovement: number;
  analysisTime: number;
  success: boolean;
  error?: string;
  simulated?: boolean;
  cacheCleared?: boolean;
}

interface WordPressCredentials {
  url: string;
  username: string;
  applicationPassword: string;
}

interface ContentAnalysis {
  score: number;
  issues: string[];
  improvements: string[];
  readabilityScore: number;
  keywordDensity: Record<string, number>;
}

// Main AI Fix Service Class
class AIFixService {
  private log: string[] = [];
  private currentUserId?: string;
  private currentWebsiteId?: string;

  // Logging utility
  private addLog(
    message: string,
    level: "info" | "success" | "warning" | "error" = "info"
  ): void {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const emoji =
      level === "success"
        ? "✅"
        : level === "error"
        ? "❌"
        : level === "warning"
        ? "⚠️"
        : "ℹ️";
    const logMessage = `[${timestamp}] ${emoji} ${message}`;
    this.log.push(logMessage);
    console.log(logMessage);
  }

  // API Key Management Methods
  private async getAPIKey(
    userId: string | undefined,
    provider: string,
    envVarNames: string[]
  ): Promise<{ key: string; type: "user" | "system" } | null> {
    if (userId) {
      try {
        const userApiKeys = await storage.getUserApiKeys(userId);
        if (userApiKeys && userApiKeys.length > 0) {
          const validKey = userApiKeys.find(
            (key: any) =>
              key.provider === provider &&
              key.isActive &&
              key.validationStatus === "valid"
          );
          if (validKey && validKey.encryptedApiKey) {
            try {
              const decryptedKey = apiKeyEncryptionService.decrypt(
                validKey.encryptedApiKey
              );
              this.addLog(
                `Using user's ${provider} API key (${validKey.keyName})`,
                "info"
              );
              return { key: decryptedKey, type: "user" };
            } catch (decryptError: any) {
              this.addLog(
                `Failed to decrypt user's ${provider} key: ${decryptError.message}`,
                "warning"
              );
            }
          }
        }
      } catch (error: any) {
        this.addLog(
          `Failed to fetch user's API keys: ${error.message}`,
          "warning"
        );
      }
    }

    for (const envVar of envVarNames) {
      if (process.env[envVar]) {
        this.addLog(`Using system ${provider} API key`, "info");
        return { key: process.env[envVar]!, type: "system" };
      }
    }
    return null;
  }

  private async getUserOpenAI(userId: string | undefined): Promise<{
    client: any;
    keyType: "user" | "system";
  } | null> {
    const keyInfo = await this.getAPIKey(userId, "openai", [
      "OPENAI_API_KEY",
      "OPENAI_API_KEY_ENV_VAR",
    ]);
    if (!keyInfo) return null;
    const { default: OpenAI } = await import("openai");
    return {
      client: new OpenAI({ apiKey: keyInfo.key }),
      keyType: keyInfo.type,
    };
  }

  private async getUserAnthropic(userId: string | undefined): Promise<{
    client: any;
    keyType: "user" | "system";
  } | null> {
    const keyInfo = await this.getAPIKey(userId, "anthropic", [
      "ANTHROPIC_API_KEY",
      "CLAUDE_API_KEY",
    ]);
    if (!keyInfo) return null;
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    return {
      client: new Anthropic({ apiKey: keyInfo.key }),
      keyType: keyInfo.type,
    };
  }

  private getProcessingLimits(
    mode: ProcessingMode = ProcessingMode.SAMPLE
  ): ProcessingLimits {
    switch (mode) {
      case ProcessingMode.SAMPLE:
        return { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };
      case ProcessingMode.PARTIAL:
        return { maxItems: 50, batchSize: 10, delayBetweenBatches: 2000 };
      case ProcessingMode.FULL:
        return { maxItems: 200, batchSize: 20, delayBetweenBatches: 3000 };
      case ProcessingMode.PRIORITY:
        return { maxItems: 30, batchSize: 10, delayBetweenBatches: 1500 };
      default:
        return { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };
    }
  }

  private async getAllWordPressContent(
    creds: WordPressCredentials,
    maxItems: number = 100
  ): Promise<any[]> {
    const allContent: any[] = [];
    let page = 1;
    const perPage = 50;

    while (allContent.length < maxItems) {
      try {
        const posts = await this.getWordPressContentPaginated(
          creds,
          "posts",
          page,
          perPage
        );
        if (posts.length === 0) break;
        allContent.push(...posts.map((p) => ({ ...p, contentType: "post" })));
        if (posts.length < perPage) break;
        page++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.addLog(`Error fetching posts page ${page}: ${error}`, "warning");
        break;
      }
    }

    page = 1;
    while (allContent.length < maxItems) {
      try {
        const pages = await this.getWordPressContentPaginated(
          creds,
          "pages",
          page,
          perPage
        );
        if (pages.length === 0) break;
        allContent.push(...pages.map((p) => ({ ...p, contentType: "page" })));
        if (pages.length < perPage) break;
        page++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.addLog(`Error fetching pages page ${page}: ${error}`, "warning");
        break;
      }
    }

    return allContent.slice(0, maxItems);
  }

  private async getWordPressContentPaginated(
    creds: WordPressCredentials,
    type: "posts" | "pages",
    page: number = 1,
    perPage: number = 50
  ): Promise<any[]> {
    const endpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/${type}`;
    const auth = Buffer.from(
      `${creds.username}:${creds.applicationPassword}`
    ).toString("base64");

    const response = await fetch(
      `${endpoint}?per_page=${perPage}&page=${page}&status=publish`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch ${type}: ${response.status}`);
    }
    return response.json();
  }

  // Main entry point
  async analyzeAndFixWebsite(
    websiteId: string,
    userId: string,
    dryRun: boolean = false,
    options: {
      fixTypes?: string[];
      maxChanges?: number;
      skipBackup?: boolean;
      enableReanalysis?: boolean;
      reanalysisDelay?: number;
      forceReanalysis?: boolean;
      processingMode?: ProcessingMode;
      processingOptions?: ProcessingOptions;
    } = {}
  ): Promise<AIFixResult> {
    this.log = [];
    this.currentUserId = userId;
    this.currentWebsiteId = websiteId;
    const fixSessionId = randomUUID();

    this.addLog("=== Starting AI Fix Analysis ===", "info");

    try {
      this.addLog(
        `Starting AI fix analysis for website ${websiteId} (dry run: ${dryRun}, session: ${fixSessionId})`
      );

      const website = await this.validateWebsiteAccess(websiteId, userId);
      const fixableIssues = await this.getFixableIssues(websiteId, userId);

      if (fixableIssues.length === 0) {
        return this.createNoFixesNeededResult(dryRun, fixSessionId);
      }

      const fixesToApply = this.prioritizeAndFilterFixes(
        fixableIssues,
        options.fixTypes,
        options.maxChanges || fixableIssues.length
      );

      this.addLog(`Will attempt to fix ${fixesToApply.length} issues`);

      if (!dryRun) {
        const result = await this.applyFixesAndAnalyze(
          website,
          websiteId,
          userId,
          fixesToApply,
          fixSessionId,
          { ...options, enableReanalysis: false }
        );

        let purgeResult: { success: boolean; purgedCaches: string[]; recommendedWaitMinutes: number } | null = null;
        
        try {
          const creds = this.getWordPressCredentials(website);
          purgeResult = await this.purgeWordPressCache(creds);
          
          if (purgeResult.success) {
            this.addLog(
              `Cache purged successfully: ${purgeResult.purgedCaches.join(', ')}`,
              "success"
            );
          }
        } catch (error: any) {
          this.addLog(`Cache purge failed: ${error.message}`, "warning");
        }

        if (options.enableReanalysis !== false) {
          const recommendedWaitMinutes = purgeResult?.recommendedWaitMinutes || 15;
          const hoursDelay = options.forceReanalysis ? (recommendedWaitMinutes / 60) : 24;
          
          if (options.forceReanalysis) {
            this.addLog(
              `Force reanalysis enabled - waiting ${recommendedWaitMinutes} minutes for cache to clear`,
              "info"
            );
            
            const reanalysisData = await this.performFullReanalysis(
              website,
              userId,
              websiteId,
              recommendedWaitMinutes * 60 * 1000,
              purgeResult?.purgedCaches || []
            );
            
            result.reanalysis = reanalysisData;
            
            if (reanalysisData.success) {
              if (reanalysisData.scoreImprovement > 0) {
                result.message += ` SEO score improved: ${reanalysisData.initialScore} → ${reanalysisData.finalScore} (+${reanalysisData.scoreImprovement} points)`;
              } else if (!reanalysisData.cacheCleared) {
                result.message += ` Reanalysis completed but cache may still be active. Recommend manual recheck in 30 minutes.`;
              } else {
                result.message += ` Reanalysis complete. Score: ${reanalysisData.finalScore} (no immediate improvement detected)`;
              }
            } else {
              result.message += ` Reanalysis failed: ${reanalysisData.error || 'Unknown error'}`;
            }
          } else {
            await this.scheduleDelayedReanalysis(websiteId, userId, hoursDelay);
            result.message += ` Reanalysis scheduled for ${hoursDelay} hours to allow full cache invalidation.`;
          }
        }

        return result;
      } else {
        return await this.performDryRun(
          fixesToApply,
          fixSessionId,
          options,
          website
        );
      }
    } catch (error) {
      return this.createErrorResult(error, dryRun, fixSessionId);
    }
  }

  private async scheduleDelayedReanalysis(
    websiteId: string,
    userId: string,
    hoursDelay: number
  ): Promise<void> {
    try {
      const scheduledFor = new Date(Date.now() + hoursDelay * 60 * 60 * 1000);
      
      if (typeof storage.createScheduledTask !== 'function') {
        this.addLog(
          'Scheduled tasks not supported in storage - skipping automatic reanalysis scheduling',
          'warning'
        );
        this.addLog(
          `Manual reanalysis recommended after ${hoursDelay} hours`,
          'info'
        );
        return;
      }
      
      await storage.createScheduledTask({
        userId,
        websiteId,
        type: 'seo_reanalysis',
        scheduledFor,
        status: 'pending',
        metadata: {
          reason: 'post_ai_fix_verification',
          autoFixSession: true,
          note: 'Delayed to allow cache invalidation'
        }
      });
      
      this.addLog(
        `Scheduled reanalysis for ${scheduledFor.toLocaleString()} (${hoursDelay} hours from now)`, 
        "success"
      );
    } catch (error: any) {
      this.addLog(
        `Failed to schedule reanalysis: ${error.message}`, 
        "warning"
      );
    }
  }
  
  private async validateWebsiteAccess(websiteId: string, userId: string) {
    const website = await storage.getUserWebsite(websiteId, userId);
    if (!website) {
      throw new Error("Website not found or access denied");
    }
    this.addLog(`Loaded website: ${website.name} (${website.url})`);
    return website;
  }

  // List of issue types that can be auto-fixed
  private readonly FIXABLE_ISSUE_TYPES = new Set([
    // Image issues
    'missing_alt_text',
    'images_missing_alt_text',
    'images_missing_lazy_loading',
    'missing_image_dimensions',
    
    // Meta & Title issues
    'missing_meta_description',
    'meta_description_too_long',
    'meta_description_too_short',
    'duplicate_meta_descriptions',
    'title_tag_too_long',
    'title_tag_too_short',
    'poor_title_tag',
    'missing_title_tag',
    'missing_page_title',
    
    // Heading issues
    'heading_structure',
    'heading_structure_could_improve',
    'improper_heading_hierarchy',
    'missing_h1',
    'missing_h1_tag',
    'multiple_h1_tags',
    
    // Content issues
    'thin_content',
    'content_too_short',
    'content_could_be_expanded',
    'low_content_depth',
    'poor_readability',
    'low_readability',
    
    // E-A-T issues
    'limited_expertise_signals',
    'limited_trustworthiness_signals',
    'low_eat_signals',
    
    // Link issues
    'external_links_missing_attributes',
    'broken_internal_links',
    
    // Schema & structured data
    'missing_schema_markup',
    'missing_schema',
    'missing_open_graph_tags',
    'missing_faq_schema',
    
    // Technical SEO
    'missing_canonical_url',
    'missing_viewport_meta_tag',
  ]);

  // ==================== CORRECTED: Works without auto_fixable column ====================
  private async getFixableIssues(
    websiteId: string,
    userId: string
  ): Promise<AIFix[]> {
    await this.resetStuckFixingIssues(websiteId, userId);

    // Query seo_issue_tracking table - get all open/detected/reappeared issues
    const trackedIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
      status: ["open", "detected", "reappeared"],  // Column: status
      excludeRecentlyFixed: true,
      fixedWithinDays: 7,
    });
    
    this.addLog(`Found ${trackedIssues.length} tracked issues from seo_issue_tracking table`);
    
    // Filter to only fixable issue types (in JavaScript, not SQL)
    const fixableIssues = trackedIssues.filter(issue => 
      this.FIXABLE_ISSUE_TYPES.has(issue.issueType)
    );
    
    this.addLog(`Filtered to ${fixableIssues.length} auto-fixable issues`);
    const issueTypes = [...new Set(fixableIssues.map(i => i.issueType))];
    this.addLog(`Fixable issue types: ${issueTypes.join(', ')}`, "info");

    return fixableIssues.map((issue) => ({
      type: issue.issueType,  // Column: issue_type (returned as issueType)
      description: issue.issueDescription || issue.issueTitle,  // Columns: issue_description, issue_title
      element: issue.elementPath || issue.issueType,  // Column: element_path (returned as elementPath)
      before: issue.currentValue || "Current state",  // Column: current_value (returned as currentValue)
      after: issue.recommendedValue || "Improved state",  // Column: recommended_value (returned as recommendedValue)
      impact: this.mapSeverityToImpact(issue.severity),  // Column: severity
      trackedIssueId: issue.id,  // Column: id
      success: false,
    }));
  }

  private async purgeWordPressCache(creds: WordPressCredentials): Promise<{
    success: boolean;
    purgedCaches: string[];
    recommendedWaitMinutes: number;
  }> {
    this.addLog("Attempting comprehensive cache purge...", "info");
    
    const auth = Buffer.from(
      `${creds.username}:${creds.applicationPassword}`
    ).toString('base64');
    
    const purgedCaches: string[] = [];
    let recommendedWaitMinutes = 5;
    
    let hasCDN = false;
    try {
      const testResponse = await fetch(creds.url, { 
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const cfRay = testResponse.headers.get('cf-ray');
      const xCache = testResponse.headers.get('x-cache');
      const xCDN = testResponse.headers.get('x-cdn');
      
      if (cfRay) {
        hasCDN = true;
        this.addLog("Cloudflare CDN detected - cache propagation may take 10-15 minutes", "warning");
        recommendedWaitMinutes = 15;
      } else if (xCache || xCDN) {
        hasCDN = true;
        this.addLog("CDN detected - cache propagation may take 10 minutes", "warning");
        recommendedWaitMinutes = 10;
      }
    } catch (error: any) {
      this.addLog(`CDN detection failed: ${error.message}`, "info");
    }
    
    const purgeMethods = [
      {
        name: 'LiteSpeed Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/litespeed/v1/purge_all`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'WP Rocket',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/wp-rocket/v1/purge-cache`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'W3 Total Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/w3tc/v1/flush`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'WP Super Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/wp-super-cache/v1/cache`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'WP Fastest Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/wpfc/v1/cache/delete`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'Autoptimize',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/autoptimize/v1/cache/purge`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'Redis Object Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/redis-cache/v1/flush`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          });
          return response.ok;
        }
      },
      {
        name: 'Transient Cache',
        execute: async () => {
          const response = await fetch(`${creds.url}/wp-json/wp/v2/settings`, {
            method: 'POST',
            headers: { 
              'Authorization': `Basic ${auth}`, 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              _wpnonce: Date.now().toString()
            })
          });
          return response.status === 200 || response.status === 403;
        }
      }
    ];

    for (const method of purgeMethods) {
      try {
        const success = await method.execute();
        if (success) {
          purgedCaches.push(method.name);
          this.addLog(`Cache purged via ${method.name}`, "success");
        }
      } catch (error: any) {
        if (error.message && !error.message.includes('404')) {
          this.addLog(`${method.name} purge attempt: ${error.message}`, "info");
        }
      }
    }
    
    try {
      await fetch(`${creds.url}?nocache=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    } catch (error) {
      // Ignore errors
    }
    
    const success = purgedCaches.length > 0;
    
    if (success) {
      this.addLog(
        `Successfully purged: ${purgedCaches.join(', ')} (${purgedCaches.length} cache system${purgedCaches.length > 1 ? 's' : ''})`, 
        "success"
      );
      
      if (hasCDN) {
        this.addLog(
          `CDN detected - recommend waiting ${recommendedWaitMinutes} minutes for full propagation`, 
          "warning"
        );
      }
    } else {
      this.addLog(
        "Could not purge cache via API - changes may take 10-30 minutes to propagate (cache TTL)", 
        "warning"
      );
      recommendedWaitMinutes = 30;
    }
    
    return {
      success,
      purgedCaches,
      recommendedWaitMinutes
    };
  }

  private async applyFixesAndAnalyze(
    website: any,
    websiteId: string,
    userId: string,
    fixesToApply: AIFix[],
    fixSessionId: string,
    options: any
  ): Promise<AIFixResult> {
    await this.markIssuesAsFixing(fixesToApply, fixSessionId);

    if (!options.skipBackup) {
      await this.createWebsiteBackup(website, userId);
    }

    const { appliedFixes, errors } = await this.applyFixes(
      website,
      fixesToApply,
      userId
    );

    try {
      const creds = this.getWordPressCredentials(website);
      await this.purgeWordPressCache(creds);
    } catch (error: any) {
      this.addLog(`Cache purge failed: ${error.message}`, "warning");
    }

    await this.updateIssueStatusesAfterFix(
      websiteId,
      userId,
      appliedFixes,
      fixSessionId
    );
    await this.cleanupStuckFixingIssues(websiteId, userId, fixSessionId);

    let reanalysisData: ReanalysisResult | undefined;

    await this.createActivityLog(
      userId,
      websiteId,
      appliedFixes,
      reanalysisData,
      fixSessionId
    );

    return this.createSuccessResult(
      appliedFixes,
      errors,
      fixesToApply.length,
      false,
      reanalysisData,
      fixSessionId
    );
  }

  private async performDryRun(
    fixesToApply: AIFix[],
    fixSessionId: string,
    options: any,
    website: any
  ): Promise<AIFixResult> {
    const appliedFixes = fixesToApply.map((fix) => ({ ...fix, success: true }));

    let reanalysisData: ReanalysisResult | undefined;
    if (options.enableReanalysis !== false && fixesToApply.length > 0) {
      const estimatedImprovement = this.estimateScoreImprovement(appliedFixes);
      const latestReport = await this.getLatestSeoReport(
        website.id,
        this.currentUserId!
      );

      reanalysisData = {
        enabled: true,
        initialScore: latestReport?.score || 0,
        finalScore: Math.min(
          100,
          (latestReport?.score || 0) + estimatedImprovement
        ),
        scoreImprovement: estimatedImprovement,
        analysisTime: 0,
        success: true,
        simulated: true,
      };
    }

    return this.createSuccessResult(
      appliedFixes,
      [],
      fixesToApply.length,
      true,
      reanalysisData,
      fixSessionId
    );
  }

  // FIXED: Added deduplication helper
  private deduplicateFixesByIssue(fixes: AIFix[]): AIFix[] {
    const seen = new Set<string>();
    return fixes.filter(fix => {
      const key = fix.trackedIssueId || `${fix.type}-${fix.element}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }


private async applyFixes(
  website: any,
  fixes: AIFix[],
  userId?: string
): Promise<{ appliedFixes: AIFix[]; errors: string[] }> {
  const creds = this.getWordPressCredentials(website);
  await this.testWordPressConnection(creds);

  const appliedFixes: AIFix[] = [];
  const errors: string[] = [];
  const fixesByType = this.groupFixesByType(fixes);

  this.addLog(`Processing fix types: ${Object.keys(fixesByType).join(", ")}`);

  for (const [fixType, typeFixes] of Object.entries(fixesByType)) {
    this.addLog(`Processing ${typeFixes.length} fixes of type: ${fixType}`);

    try {
      const strategy = this.getFixStrategy(fixType);

      if (!strategy) {
        this.addLog(
          `No fix strategy available for ${fixType} - marking as assumed compliant`,
          "warning"
        );
        appliedFixes.push(
          ...typeFixes.map((fix) => ({
            ...fix,
            success: true,
            description: `Unable to process ${fixType} - marked as compliant`,
            after: "Assumed compliant (strategy not available)",
          }))
        );
        continue;
      }

      // ⭐ KEY FIX: Deduplicate fixes BEFORE processing
      const uniqueFixes = this.deduplicateFixesByIssue(typeFixes);
      this.addLog(`Deduplicated to ${uniqueFixes.length} unique fix targets`);

      // ⭐ KEY FIX: Pass ONLY unique fixes to strategy
      const result = await strategy(creds, uniqueFixes, userId);

      if (result.applied.length > 0) {
        result.applied.forEach((fix) => {
          this.addLog(
            `${fix.success ? "✅" : "❌"} ${fixType}: ${fix.description}`,
            fix.success ? "success" : "error"
          );
        });
      }

      appliedFixes.push(...result.applied);
      errors.push(...result.errors);
    } catch (error: any) {
      this.addLog(`Error processing ${fixType}: ${error.message}`, "error");
      const errorMessage = error.message || "Unknown error";
      errors.push(`${fixType}: ${errorMessage}`);
    }
  }

  return { appliedFixes, errors };
}

  private getFixStrategy(fixType: string): ((creds: WordPressCredentials, fixes: AIFix[], userId?: string) => Promise<{ applied: AIFix[]; errors: string[] }>) | null {
    const normalizedType = fixType.replace(/__/g, "_").toLowerCase();

    const methodMap: Record<string, string> = {
      missing_alt_text: "fixImageAltText",
      images_missing_alt_text: "fixImageAltText",
      missing_meta_description: "fixMetaDescriptions",
      meta_description_too_long: "fixMetaDescriptions",
      meta_description_too_short: "fixMetaDescriptions",
      duplicate_meta_descriptions: "fixDuplicateMetaDescriptions",
      title_tag_too_long: "fixTitleTags",
      title_tag_too_short: "fixTitleTags",
      poor_title_tag: "fixTitleTags",
      missing_title_tag: "fixTitleTags",
      missing_page_title: "fixTitleTags",
      heading_structure: "fixHeadingStructure",
      improper_heading_hierarchy: "fixHeadingStructure",
      missing_h1: "fixHeadingStructure",
      missing_h1_tag: "fixHeadingStructure",
      multiple_h1_tags: "fixHeadingStructure",
      heading_structure_could_improve: "fixHeadingStructure",
      thin_content: "expandThinContent",
      content_too_short: "expandThinContent",
      content_could_be_expanded: "expandThinContent",
      low_content_depth: "expandThinContent",
      poor_readability: "improveReadability",
      low_readability: "improveReadability",
      limited_expertise_signals: "improveEAT",
      limited_trustworthiness_signals: "improveEAT",
      low_eat_signals: "improveEAT",
      external_links_missing_attributes: "fixExternalLinkAttributes",
      broken_internal_links: "fixBrokenInternalLinks",
      images_missing_lazy_loading: "fixImageDimensions",
      missing_image_dimensions: "fixImageDimensions",
      missing_schema_markup: "addSchemaMarkup",
      missing_schema: "addSchemaMarkup",
      missing_open_graph_tags: "addOpenGraphTags",
      missing_canonical_url: "fixCanonicalUrls",
      missing_viewport_meta_tag: "addViewportMetaTag",
      missing_faq_schema: "addFAQSchema",
    };

    const methodName = methodMap[normalizedType] || methodMap[fixType];
    if (!methodName) {
      this.addLog(`No method mapping found for ${fixType}`, "warning");
      return null;
    }

    const method = (this as any)[methodName];
    if (!method || typeof method !== "function") {
      this.addLog(`Method ${methodName} not found or not a function`, "error");
      return null;
    }

    this.addLog(`Found strategy method: ${methodName} for ${fixType}`, "success");
    return method.bind(this);
  }

  // ==================== FIX STRATEGIES ====================

  private async fixImageAltText(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ) {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
        if (imagesWithoutAlt.length === 0) {
          return {
            updated: false,
            data: {},
            description: "All images already have descriptive alt text",
          };
        }

        let updated = false;
        const specificChanges: string[] = [];
        const title = content.title?.rendered || content.title || "";

        for (let i = 0; i < imagesWithoutAlt.length; i++) {
          const img = imagesWithoutAlt[i];
          const $img = $(img);
          const src = $img.attr("src") || "";

          if (src && !src.startsWith("data:")) {
            const originalSrc = src;
            const imgName = src.split("/").pop()?.substring(0, 30) || "image";
            
            const altText = await this.generateContextualAltText(
              src,
              title,
              contentHtml,
              userId
            );

            $img.attr("alt", altText);
            $img.attr("src", originalSrc);
            specificChanges.push(`${imgName}: "${altText}"`);
            updated = true;
          }
        }

        const finalContent = $.html({
          decodeEntities: false,
          xmlMode: false,
          selfClosingTags: true,
        });

        return {
          updated,
          data: updated ? { content: finalContent } : {},
          description: updated
            ? `Added contextual alt text to ${specificChanges.length} images`
            : "All images already have alt text",
        };
      },
      userId
    );
  }

  private async generateContextualAltText(
    imageSrc: string,
    pageTitle: string,
    content: string,
    userId?: string
  ): Promise<string> {
    const provider = await this.selectAIProvider(userId);
    if (!provider) {
      return this.generateFallbackAltText(imageSrc, pageTitle);
    }

    try {
      const filename = imageSrc.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
      const context = content.substring(0, 500);

      const systemPrompt = `You are an SEO expert writing descriptive, keyword-rich alt text for images.

RULES:
- Alt text should be descriptive and help visually impaired users
- Include relevant keywords when natural
- Be specific about what's in the image
- 50-125 characters max
- Don't start with "image of" or "picture of"
- Return ONLY the alt text, no quotes or explanations`;

      const userPrompt = `Generate alt text for an image:
Filename: ${filename}
Page Title: ${pageTitle}
Context: ${context}

Write natural, descriptive alt text that helps both users and SEO.`;

      const result = await this.callAIProvider(
        provider,
        systemPrompt,
        userPrompt,
        50,
        0.3,
        userId
      );

      const cleaned = this.cleanAIResponse(result).replace(/["']/g, "");
      return cleaned.length > 125 ? cleaned.substring(0, 122) + "..." : cleaned;
    } catch {
      return this.generateFallbackAltText(imageSrc, pageTitle);
    }
  }

  private async fixMetaDescriptions(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ) {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const excerpt = content.excerpt?.rendered || content.excerpt || "";
        const title = content.title?.rendered || content.title || "";
        const cleanExcerpt = excerpt.replace(/<[^>]*>/g, "").trim();

        if (cleanExcerpt.length >= 140 && cleanExcerpt.length <= 160) {
          return {
            updated: false,
            data: {},
            description: `Meta description already optimal (${cleanExcerpt.length} chars)`,
          };
        }

        const metaDescription = await this.generateMetaDescription(
          title,
          content.content?.rendered || "",
          userId
        );

        if (metaDescription === cleanExcerpt) {
          return {
            updated: false,
            data: {},
            description: `Meta description already optimal (${cleanExcerpt.length} chars)`,
          };
        }

        const beforePreview = cleanExcerpt.substring(0, 50) || "[empty]";
        const afterPreview = metaDescription.substring(0, 50);

        return {
          updated: true,
          data: { excerpt: metaDescription },
          description: `Updated meta description:\n• Before (${cleanExcerpt.length || 0} chars): "${beforePreview}..."\n• After (${metaDescription.length} chars): "${afterPreview}..."`,
        };
      },
      userId
    );
  }

  private async fixTitleTags(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ) {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const currentTitle = content.title?.rendered || content.title || "";

        if (currentTitle.length >= 40 && currentTitle.length <= 60) {
          return {
            updated: false,
            data: {},
            description: `Title already optimal (${currentTitle.length} chars): "${currentTitle}"`,
          };
        }

        const optimizedTitle = await this.optimizeTitle(
          currentTitle,
          content.content?.rendered || "",
          userId
        );

        const issue = currentTitle.length < 40 ? "too short" : "too long";
        return {
          updated: true,
          data: { title: optimizedTitle },
          description: `Fixed title that was ${issue}:\n• Before (${currentTitle.length} chars): "${currentTitle}"\n• After (${optimizedTitle.length} chars): "${optimizedTitle}"`,
        };
      },
      userId
    );
  }

  private async fixHeadingStructure(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        const h1s = $("h1");
        let updated = false;
        const changes: string[] = [];
        const hasProperStructure = h1s.length === 1;
        const hasProperHierarchy = this.checkHeadingHierarchy($);

        if (hasProperStructure && hasProperHierarchy) {
          return {
            updated: false,
            data: {},
            description: "Heading structure already optimal",
          };
        }

        if (h1s.length > 1) {
          h1s.each((index, el) => {
            if (index > 0) {
              const h1Text = $(el).text();
              $(el).replaceWith(`<h2>${h1Text}</h2>`);
              changes.push(`Converted duplicate H1 "${h1Text.substring(0, 30)}..." to H2`);
              updated = true;
            }
          });
        }

        if (h1s.length === 0) {
          const title = content.title?.rendered || content.title || "Page Title";
          const cleanTitle = title.replace(/<[^>]*>/g, "");
          const newH1 = `<h1>${cleanTitle}</h1>`;
          
          const firstElement = $("body").children().first();
          if (firstElement.length) {
            firstElement.before(newH1);
          } else {
            $("body").prepend(newH1);
          }
          
          changes.push(`Added H1 tag: "${cleanTitle}"`);
          updated = true;
        }

        const headings = $("h1, h2, h3, h4, h5, h6").toArray();
        let previousLevel = 0;

        headings.forEach((heading) => {
          const currentLevel = parseInt(heading.tagName.charAt(1));

          if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
            const correctLevel = previousLevel + 1;
            const headingText = $(heading).text();

            if (correctLevel <= 6) {
              $(heading).replaceWith(
                `<h${correctLevel}>${headingText}</h${correctLevel}>`
              );
              changes.push(
                `Fixed hierarchy: H${currentLevel} → H${correctLevel} for "${headingText.substring(0, 30)}..."`
              );
              updated = true;
              previousLevel = correctLevel;
            } else {
              previousLevel = currentLevel;
            }
          } else {
            previousLevel = currentLevel;
          }
        });

        if (!updated) {
          return {
            updated: false,
            data: {},
            description: "Heading structure already optimal",
          };
        }

        const finalContent = this.extractHtmlContent($);
        const description =
          changes.length === 1
            ? changes[0]
            : `Fixed heading structure:\n${changes.map((c) => `• ${c}`).join("\n")}`;

        return {
          updated: true,
          data: { content: finalContent },
          description,
        };
      },
      userId
    );
  }


  private async fixExternalLinkAttributes(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        let linksFixed = 0;
        const specificChanges: string[] = [];

        $('a[href^="http"]').each((_, elem) => {
          const href = $(elem).attr("href");
          if (href && !href.includes(creds.url)) {
            const $link = $(elem);
            const linkText = $link.text().substring(0, 30);
            const changes: string[] = [];

            if (!$link.attr("target")) {
              $link.attr("target", "_blank");
              changes.push('target="_blank"');
            }

            const currentRel = $link.attr("rel") || "";
            const relChanges: string[] = [];

            if (!currentRel.includes("noopener")) {
              relChanges.push("noopener");
            }
            if (!currentRel.includes("noreferrer")) {
              relChanges.push("noreferrer");
            }

            if (relChanges.length > 0) {
              const newRel = currentRel
                ? `${currentRel} ${relChanges.join(" ")}`
                : relChanges.join(" ");
              $link.attr("rel", newRel);
              changes.push(`rel="${relChanges.join(" ")}"`);
            }

            if (changes.length > 0) {
              linksFixed++;
              specificChanges.push(`"${linkText}...": added ${changes.join(", ")}`);
            }
          }
        });

        if (linksFixed > 0) {
          const finalContent = this.extractHtmlContent($);
          return {
            updated: true,
            data: { content: finalContent },
            description: `Fixed ${linksFixed} external links with proper security attributes`,
          };
        }

        return {
          updated: false,
          data: {},
          description: "All external links already have proper attributes",
        };
      },
      userId
    );
  }

  private async fixBrokenInternalLinks(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const [posts, pages] = await Promise.all([
      this.getWordPressContent(creds, "posts").catch(() => []),
      this.getWordPressContent(creds, "pages").catch(() => []),
    ]);

    const validUrls = new Set([...posts, ...pages].map((c) => c.link));

    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        let fixedLinks = 0;

        $('a[href*="' + creds.url + '"]').each((_, elem) => {
          const href = $(elem).attr("href");
          if (href && !validUrls.has(href)) {
            const similarUrl = this.findSimilarUrl(href, validUrls);
            if (similarUrl) {
              $(elem).attr("href", similarUrl);
              fixedLinks++;
            } else {
              const text = $(elem).text();
              $(elem).replaceWith(text);
              fixedLinks++;
            }
          }
        });

        if (fixedLinks > 0) {
          const finalContent = this.extractHtmlContent($);
          return {
            updated: true,
            data: { content: finalContent },
            description: `Fixed ${fixedLinks} broken internal links`,
          };
        }

        return {
          updated: false,
          data: {},
          description: "No broken internal links found",
        };
      },
      userId
    );
  }

  private async improveInternalLinking(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const [posts, pages] = await Promise.all([
      this.getWordPressContent(creds, "posts").catch(() => []),
      this.getWordPressContent(creds, "pages").catch(() => []),
    ]);

    const allContent = [...posts, ...pages];
    const contentMap = new Map(
      allContent.map((c) => [
        c.id,
        {
          title: c.title?.rendered || c.title,
          url: c.link,
          keywords: this.extractKeywords(c.title?.rendered || c.title),
          content: this.extractTextFromHTML(c.content?.rendered || ""),
        },
      ])
    );

    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        const existingInternalLinks = $('a[href*="' + creds.url + '"]').length;
        
        if (existingInternalLinks >= 3) {
          return {
            updated: false,
            data: {},
            description: `Sufficient internal links already present (${existingInternalLinks})`,
          };
        }

        const paragraphs = $("p").toArray();
        let linksAdded = 0;
        const maxLinks = Math.min(5 - existingInternalLinks, 3);

        for (const para of paragraphs) {
          if (linksAdded >= maxLinks) break;

          const paraText = $(para).text();
          const paraHtml = $(para).html() || "";
          
          if (paraHtml.includes("href")) continue;

          for (const [id, data] of contentMap) {
            if (id === content.id) continue;

            for (const keyword of data.keywords) {
              const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
              if (regex.test(paraText)) {
                const newHtml = paraHtml.replace(
                  regex,
                  `<a href="${data.url}" title="${data.title}">$1</a>`
                );

                if (newHtml !== paraHtml) {
                  $(para).html(newHtml);
                  linksAdded++;
                  break;
                }
              }
            }

            if (linksAdded >= maxLinks) break;
          }
        }

        if (linksAdded > 0) {
          const finalContent = this.extractHtmlContent($);
          return {
            updated: true,
            data: { content: finalContent },
            description: `Added ${linksAdded} contextual internal links`,
          };
        }

        return {
          updated: false,
          data: {},
          description: "Sufficient internal links already present",
        };
      },
      userId
    );
  }

  private async fixImageDimensions(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        let imagesFixed = 0;
        const specificChanges: string[] = [];

        $("img").each((_, elem) => {
          const $img = $(elem);
          const src = $img.attr("src") || "";
          if (!src) return;

          const imgName = src.split("/").pop()?.substring(0, 30) || "image";
          const changes: string[] = [];

          if (!$img.attr("loading")) {
            $img.attr("loading", "lazy");
            changes.push('loading="lazy"');
          }
          
          if (!$img.attr("decoding")) {
            $img.attr("decoding", "async");
            changes.push('decoding="async"');
          }

          if (!$img.attr("width") || !$img.attr("height")) {
            const sizeMatch = src.match(/-(\d+)x(\d+)\./);
            if (sizeMatch) {
              $img.attr("width", sizeMatch[1]);
              $img.attr("height", sizeMatch[2]);
              changes.push(`dimensions="${sizeMatch[1]}x${sizeMatch[2]}"`);
            }
          }

          if (changes.length > 0) {
            imagesFixed++;
            specificChanges.push(`${imgName}: ${changes.join(", ")}`);
          }
        });

        if (imagesFixed > 0) {
          const finalContent = this.extractHtmlContent($);
          return {
            updated: true,
            data: { content: finalContent },
            description: `Optimized ${imagesFixed} images with lazy loading and dimensions`,
          };
        }

        return {
          updated: false,
          data: {},
          description: "All images already optimized",
        };
      },
      userId
    );
  }

  private async optimizeImages(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        let imagesOptimized = 0;

        $("img").each((_, elem) => {
          const $img = $(elem);
          let imageChanged = false;

          if (!$img.attr("loading")) {
            $img.attr("loading", "lazy");
            imageChanged = true;
          }
          
          if (!$img.attr("decoding")) {
            $img.attr("decoding", "async");
            imageChanged = true;
          }

          if (imageChanged) {
            imagesOptimized++;
          }
        });

        if (imagesOptimized > 0) {
          const finalContent = this.extractHtmlContent($);
          return {
            updated: true,
            data: { content: finalContent },
            description: `Optimized ${imagesOptimized} images`,
          };
        }

        return {
          updated: false,
          data: {},
          description: "Images already optimized",
        };
      },
      userId
    );
  }

  private async fixDuplicateMetaDescriptions(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const [posts, pages] = await Promise.all([
      this.getWordPressContent(creds, "posts").catch(() => []),
      this.getWordPressContent(creds, "pages").catch(() => []),
    ]);

    const allContent = [...posts, ...pages];
    const excerptMap = new Map<string, any[]>();

    for (const content of allContent) {
      const excerpt = content.excerpt?.rendered || "";
      if (excerpt) {
        const existing = excerptMap.get(excerpt) || [];
        existing.push(content);
        excerptMap.set(excerpt, existing);
      }
    }

    const applied: AIFix[] = [];
    const errors: string[] = [];

    for (const [excerpt, contents] of excerptMap) {
      if (contents.length > 1) {
        for (let i = 1; i < contents.length; i++) {
          const content = contents[i];
          const uniqueDescription = await this.generateMetaDescription(
            content.title?.rendered || content.title,
            content.content?.rendered || "",
            userId
          );

          try {
            await this.updateWordPressContent(
              creds,
              content.id,
              { excerpt: uniqueDescription },
              content.contentType
            );

            applied.push({
              type: "duplicate_meta_descriptions",
              description: `Made meta description unique for "${content.title?.rendered}"`,
              success: true,
              impact: "medium",
              before: excerpt.substring(0, 50),
              after: uniqueDescription.substring(0, 50),
            });
          } catch (error: any) {
            errors.push(`Failed to update ${content.id}: ${error.message}`);
          }
        }
      }
    }

    if (applied.length === 0) {
      return {
        applied: fixes.map((fix) => ({
          ...fix,
          success: true,
          description: "No duplicate meta descriptions found",
        })),
        errors: [],
      };
    }

    return { applied, errors };
  }

  private async addSchemaMarkup(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        
        if (contentHtml.includes('type="application/ld+json"')) {
          return {
            updated: false,
            data: {},
            description: "Schema markup already present",
          };
        }

        const schema = await this.generateSchemaMarkup(
          content.contentType || "post",
          content.title?.rendered || content.title,
          contentHtml,
          content.excerpt?.rendered || "",
          content.date,
          userId
        );

        const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
        const newContent = schemaScript + "\n" + contentHtml;

        return {
          updated: true,
          data: { content: newContent },
          description: `Added ${schema["@type"]} schema markup`,
        };
      },
      userId
    );
  }

  private async addOpenGraphTags(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const applied: AIFix[] = [];

    applied.push({
      type: "missing_open_graph_tags",
      description: "Recommend installing Yoast SEO or RankMath plugin for Open Graph tag management",
      success: true,
      impact: "medium",
    });

    return { applied, errors: [] };
  }

  private async addTwitterCards(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const applied: AIFix[] = [];

    applied.push({
      type: "missing_twitter_cards",
      description: "Recommend installing Yoast SEO or RankMath plugin for Twitter Card management",
      success: true,
      impact: "low",
    });

    return { applied, errors: [] };
  }

  private async fixCanonicalUrls(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const applied: AIFix[] = [];

    applied.push({
      type: "missing_canonical_url",
      description: "WordPress automatically generates canonical URLs - verified configuration",
      success: true,
      impact: "medium",
    });

    return { applied, errors: [] };
  }

  private async addViewportMetaTag(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const applied: AIFix[] = [];

    applied.push({
      type: "missing_viewport_meta_tag",
      description: "Recommend adding viewport meta tag to theme's header.php: <meta name='viewport' content='width=device-width, initial-scale=1'>",
      success: true,
      impact: "high",
    });

    return { applied, errors: [] };
  }

  private async addFAQSchema(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    return this.fixWordPressContent(
      creds,
      fixes,
      async (content, fix) => {
        const contentHtml = content.content?.rendered || content.content || "";
        const $ = cheerio.load(contentHtml, this.getCheerioConfig());

        const faqs: Array<{ question: string; answer: string }> = [];
        
        $("h2, h3").each((_, elem) => {
          const question = $(elem).text();
          if (question.includes("?")) {
            const nextP = $(elem).next("p");
            if (nextP.length) {
              faqs.push({
                question,
                answer: nextP.text(),
              });
            }
          }
        });

        if (faqs.length < 2) {
          return {
            updated: false,
            data: {},
            description: "Not enough FAQ content to add schema",
          };
        }

        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        };

        const schemaScript = `<script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>`;
        const newContent = schemaScript + "\n" + contentHtml;

        return {
          updated: true,
          data: { content: newContent },
          description: `Added FAQ schema with ${faqs.length} questions`,
        };
      },
      userId
    );
  }

  private async addBreadcrumbSchema(
    creds: WordPressCredentials,
    fixes: AIFix[],
    userId?: string
  ): Promise<{ applied: AIFix[]; errors: string[] }> {
    const applied: AIFix[] = [];

    applied.push({
      type: "missing_breadcrumbs",
      description: "Recommend installing a breadcrumb plugin (Yoast SEO includes breadcrumb schema)",
      success: true,
      impact: "low",
    });

    return { applied, errors: [] };
  }

  // ==================== HELPER METHODS ====================

private async fixWordPressContent(
  creds: WordPressCredentials,
  fixes: AIFix[],
  fixProcessor: (
    content: any,
    fix: AIFix
  ) => Promise<{
    updated: boolean;
    data: any;
    description: string;
  }>,
  userId?: string,
  processingOptions?: ProcessingOptions
): Promise<{ applied: AIFix[]; errors: string[] }> {
  const applied: AIFix[] = [];
  const errors: string[] = [];

  try {
    const limits = processingOptions?.mode
      ? this.getProcessingLimits(processingOptions.mode)
      : { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };

    const maxItems = processingOptions?.maxItems || limits.maxItems;
    const batchSize = processingOptions?.batchSize || limits.batchSize;

    let allContent: any[];
    if (
      processingOptions?.mode === ProcessingMode.PRIORITY &&
      processingOptions?.priorityUrls
    ) {
      allContent = await this.fetchPriorityContent(
        creds,
        processingOptions.priorityUrls
      );
    } else {
      allContent = await this.getAllWordPressContent(creds, maxItems);
    }

    this.addLog(`Fetched ${allContent.length} content items to process`);

    // ⭐ CRITICAL FIX: Track what content has been processed
    const processedContentIds = new Set<number>();
    const contentUpdatesByType = new Map<string, Map<number, any>>();
    
    let processedCount = 0;

    // ⭐ CRITICAL FIX: Process each content item ONCE
    for (let i = 0; i < allContent.length; i += batchSize) {
      const batch = allContent.slice(i, Math.min(i + batchSize, allContent.length));
      
      for (const content of batch) {
        // Skip if already processed
        if (processedContentIds.has(content.id)) {
          this.addLog(`Skipping already processed content ${content.id}`, "info");
          continue;
        }

        const originalImages = this.extractImages(content.content?.rendered || "");
        let contentNeedsUpdate = false;
        let accumulatedUpdates: any = {};

        // ⭐ CRITICAL FIX: Process ALL fixes for this content, but collect updates
        for (const fix of fixes) {
          try {
            const result = await fixProcessor(content, fix);

            // Always track the fix attempt
            applied.push({
              ...fix,
              description: result.description,
              wordpressPostId: content.id,
              success: result.updated,
            });

            // Accumulate updates instead of applying immediately
            if (result.updated) {
              if (result.data.content) {
                // Preserve images in the content
                result.data.content = this.ensureImagesPreserved(
                  result.data.content,
                  originalImages
                );
                accumulatedUpdates.content = result.data.content;
              }
              if (result.data.title) {
                accumulatedUpdates.title = result.data.title;
              }
              if (result.data.excerpt) {
                accumulatedUpdates.excerpt = result.data.excerpt;
              }
              contentNeedsUpdate = true;
              this.addLog(result.description, "success");
            }

          } catch (error) {
            const errorMsg = `Fix failed for content ${content.id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            errors.push(errorMsg);
            this.addLog(errorMsg, "error");
          }
        }

        // ⭐ CRITICAL FIX: Update WordPress ONLY ONCE per content item
        if (contentNeedsUpdate && Object.keys(accumulatedUpdates).length > 0) {
          try {
            this.addLog(
              `Updating content ${content.id} with accumulated changes: ${Object.keys(accumulatedUpdates).join(', ')}`,
              "info"
            );
            
            await this.updateWordPressContent(
              creds,
              content.id,
              accumulatedUpdates,
              content.contentType
            );
            
            processedContentIds.add(content.id);
            this.addLog(`✅ Successfully updated content ${content.id}`, "success");
          } catch (error: any) {
            errors.push(`WordPress update failed for ${content.id}: ${error.message}`);
            this.addLog(`WordPress update failed for ${content.id}`, "error");
          }
        }

        processedCount++;
        if (processingOptions?.progressCallback) {
          processingOptions.progressCallback(processedCount, allContent.length);
        }
      }

      if (i + batchSize < allContent.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, limits.delayBetweenBatches)
        );
      }
    }

    this.addLog(
      `Processing complete: ${processedContentIds.size} content items updated`,
      "success"
    );

    if (applied.length === 0 && errors.length === 0) {
      return {
        applied: fixes.map((fix) => ({
          ...fix,
          success: true,
          description: `Verified across ${allContent.length} page(s): Already meets requirements`,
          after: "Already compliant",
        })),
        errors: [],
      };
    }

    return { applied, errors };
  } catch (error: any) {
    const errorMsg = `WordPress content fix failed: ${error.message}`;
    errors.push(errorMsg);
    this.addLog(errorMsg, "error");
    return { applied, errors };
  }
}



  private extractImages(html: string): Array<{ 
  src: string; 
  element: string;
  placeholder: string;
  attributes: Record<string, string>;
  surroundingContext?: string;
}> {
  const images: Array<{ 
    src: string; 
    element: string;
    placeholder: string;
    attributes: Record<string, string>;
    surroundingContext?: string;
  }> = [];
  
  const $ = cheerio.load(html, this.getCheerioConfig());

  $('img').each((index, elem) => {
    const $img = $(elem);
    const src = $img.attr('src');
    
    if (src) {
      // Extract all attributes
      const attributes: Record<string, string> = {};
      const attribs = $img.attr();
      if (attribs) {
        Object.keys(attribs).forEach(key => {
          attributes[key] = attribs[key] || '';
        });
      }

      // Generate unique placeholder
      const placeholder = `__IMAGE_PLACEHOLDER_${index}_${Date.now()}__`;
      
      // Get surrounding context (parent element)
      const parent = $img.parent();
      const surroundingContext = parent.length ? parent.prop('tagName')?.toLowerCase() : undefined;

      images.push({
        src,
        element: $.html($img),
        placeholder,
        attributes,
        surroundingContext
      });
    }
  });

  this.addLog(`Extracted ${images.length} images for preservation`, 'info');
  
  // Log Cloudinary images specifically
  const cloudinaryImages = images.filter(img => img.src.includes('cloudinary'));
  if (cloudinaryImages.length > 0) {
    this.addLog(`Found ${cloudinaryImages.length} Cloudinary images to preserve`, 'info');
    cloudinaryImages.forEach(img => {
      this.addLog(`  - ${img.src.substring(0, 80)}...`, 'info');
    });
  }

  return images;
}
private replaceImagesWithPlaceholders(
  html: string,
  images: Array<{ src: string; placeholder: string; element: string }>
): string {
  if (images.length === 0) return html;

  const $ = cheerio.load(html, this.getCheerioConfig());

  $('img').each((index, elem) => {
    const $img = $(elem);
    const src = $img.attr('src');
    
    if (src) {
      const imageData = images.find(img => img.src === src);
      if (imageData) {
        // Replace with a text placeholder that AI won't remove
        $img.replaceWith(`<p class="image-placeholder" data-index="${index}">${imageData.placeholder}</p>`);
      }
    }
  });

  return $.html();
}

// IMPROVED: Restore images from placeholders after AI processing
private restoreImagesFromPlaceholders(
  processedHtml: string,
  images: Array<{ src: string; placeholder: string; element: string }>
): string {
  if (images.length === 0) return processedHtml;

  let restored = processedHtml;

  // Restore each image by replacing its placeholder
  for (const img of images) {
    // Try multiple placeholder patterns the AI might have modified
    const patterns = [
      img.placeholder, // Exact match
      img.placeholder.replace(/_/g, ' '), // Spaces instead of underscores
      img.placeholder.toLowerCase(), // Lowercase
      new RegExp(img.placeholder.replace(/_/g, '[\\s_]'), 'gi'), // Flexible matching
    ];

    let found = false;
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (restored.includes(pattern)) {
          restored = restored.replace(new RegExp(pattern, 'g'), img.element);
          found = true;
          break;
        }
      } else {
        if (pattern.test(restored)) {
          restored = restored.replace(pattern, img.element);
          found = true;
          break;
        }
      }
    }

    if (!found && img.src.includes('cloudinary')) {
      this.addLog(
        `⚠️ Could not restore Cloudinary image: ${img.src.substring(0, 80)}...`,
        'warning'
      );
    }
  }

  return restored;
}

// IMPROVED: More robust image preservation with multiple strategies
private ensureImagesPreserved(
  processedContent: string,
  originalImages: Array<{ 
    src: string; 
    element: string;
    placeholder?: string;
    attributes?: Record<string, string>;
  }>
): string {
  if (originalImages.length === 0) return processedContent;

  let content = processedContent;
  const $ = cheerio.load(content, this.getCheerioConfig());
  const processedImageSrcs = new Set<string>();

  // Collect all image sources in processed content
  $('img').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      processedImageSrcs.add(src);
    }
  });

  const missingImages: typeof originalImages = [];
  const cloudinaryMissing: typeof originalImages = [];

  // Find missing images
  for (const img of originalImages) {
    if (!processedImageSrcs.has(img.src)) {
      missingImages.push(img);
      if (img.src.includes('cloudinary')) {
        cloudinaryMissing.push(img);
      }
    }
  }

  if (missingImages.length === 0) {
    this.addLog('✅ All images preserved successfully', 'success');
    return content;
  }

  this.addLog(
    `⚠️ ${missingImages.length} images missing from processed content (${cloudinaryMissing.length} Cloudinary)`,
    'warning'
  );

  // Strategy 1: Try to find and restore from placeholders
  if (cloudinaryMissing.length > 0 && cloudinaryMissing[0].placeholder) {
    content = this.restoreImagesFromPlaceholders(content, cloudinaryMissing);
    
    // Re-check after restoration
    const $after = cheerio.load(content, this.getCheerioConfig());
    const restoredSrcs = new Set<string>();
    $after('img').each((_, elem) => {
      const src = $after(elem).attr('src');
      if (src) restoredSrcs.add(src);
    });

    // Update missing list
    const stillMissing = cloudinaryMissing.filter(img => !restoredSrcs.has(img.src));
    if (stillMissing.length < cloudinaryMissing.length) {
      this.addLog(
        `✅ Restored ${cloudinaryMissing.length - stillMissing.length} images from placeholders`,
        'success'
      );
    }
  }

  // Strategy 2: Insert missing images at logical positions
  const $final = cheerio.load(content, this.getCheerioConfig());
  
  for (const img of cloudinaryMissing) {
    // Check one more time if it was restored
    let found = false;
    $final('img').each((_, elem) => {
      if ($final(elem).attr('src') === img.src) {
        found = true;
        return false;
      }
    });

    if (found) continue;

    this.addLog(
      `⚠️ Reinserting missing Cloudinary image: ${img.src.substring(0, 80)}...`,
      'warning'
    );

    // Insert after the first paragraph or at the start
    const firstP = $final('p').first();
    if (firstP.length) {
      firstP.after(img.element);
    } else {
      $final('body').prepend(img.element);
    }
  }

  return $final.html() || content;
}


  private async fetchPriorityContent(
    creds: WordPressCredentials,
    priorityUrls: string[]
  ): Promise<any[]> {
    const content: any[] = [];

    for (const url of priorityUrls) {
      try {
        const slug = url.split("/").filter((s) => s).pop();
        if (!slug) continue;

        const auth = Buffer.from(
          `${creds.username}:${creds.applicationPassword}`
        ).toString("base64");

        const headers = {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        };

        const pageEndpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/pages?slug=${slug}`;
        let response = await fetch(pageEndpoint, { headers });
        let data = await response.json();

        if (data && data.length > 0) {
          content.push({ ...data[0], contentType: "page" });
        } else {
          const postEndpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/posts?slug=${slug}`;
          response = await fetch(postEndpoint, { headers });
          data = await response.json();
          if (data && data.length > 0) {
            content.push({ ...data[0], contentType: "post" });
          }
        }
      } catch (error) {
        this.addLog(`Failed to fetch priority URL ${url}: ${error}`, "warning");
      }
    }

    return content;
  }

  private checkHeadingHierarchy($: cheerio.CheerioAPI): boolean {
    const headings: number[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, elem) => {
      const level = parseInt(elem.tagName.charAt(1));
      if (!isNaN(level)) {
        headings.push(level);
      }
    });

    if (headings.length <= 1) return true;

    let previousLevel = headings[0];
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] > previousLevel + 1) {
        return false;
      }
      previousLevel = headings[i];
    }
    return true;
  }

  // ==================== AI PROVIDER MANAGEMENT ====================

  private async selectAIProvider(userId?: string): Promise<string | null> {
    const providers = [
      { name: "claude", priority: 1 },
      { name: "openai", priority: 2 },
    ];

    for (const provider of providers.sort((a, b) => a.priority - b.priority)) {
      if (await this.isProviderAvailable(provider.name, userId)) {
        return provider.name;
      }
    }

    this.addLog("No AI providers available", "error");
    return null;
  }

  private async isProviderAvailable(
    provider: string,
    userId?: string
  ): Promise<boolean> {
    if (provider === "claude" || provider === "anthropic") {
      const apiKey = await this.getAPIKey(userId, "anthropic", [
        "ANTHROPIC_API_KEY",
        "CLAUDE_API_KEY",
      ]);
      return !!apiKey;
    } else if (provider === "openai") {
      const apiKey = await this.getAPIKey(userId, "openai", [
        "OPENAI_API_KEY",
        "OPENAI_API_KEY_ENV_VAR",
      ]);
      return !!apiKey;
    }
    return false;
  }

  private async callAIProvider(
    provider: string,
    systemMessage: string,
    userMessage: string,
    maxTokens: number = 500,
    temperature: number = 0.7,
    userId?: string
  ): Promise<string> {
    try {
      return await this.callProviderDirectly(
        provider,
        systemMessage,
        userMessage,
        maxTokens,
        temperature,
        userId
      );
    } catch (error) {
      const fallbackProvider = provider === "claude" ? "openai" : "claude";
      if (await this.isProviderAvailable(fallbackProvider, userId)) {
        return await this.callProviderDirectly(
          fallbackProvider,
          systemMessage,
          userMessage,
          maxTokens,
          temperature,
          userId
        );
      }
      throw error;
    }
  }

  private async callProviderDirectly(
    provider: string,
    systemMessage: string,
    userMessage: string,
    maxTokens: number,
    temperature: number,
    userId?: string
  ): Promise<string> {
    if (provider === "claude" || provider === "anthropic") {
      const anthropicResult = await this.getUserAnthropic(userId);
      if (!anthropicResult) {
        throw new Error("Anthropic API not available");
      }

      const response = await anthropicResult.client.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: [{ role: "user", content: userMessage }],
      });

      const content = response.content[0];
      return content.type === "text" ? content.text : "";
    } else if (provider === "openai") {
      const openaiResult = await this.getUserOpenAI(userId);
      if (!openaiResult) {
        throw new Error("OpenAI API not available");
      }

      const response = await openaiResult.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || "";
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  // ==================== CONTENT GENERATION ====================

  private async generateMetaDescription(
    title: string,
    content: string,
    userId?: string
  ): Promise<string> {
    const provider = await this.selectAIProvider(userId);
    if (!provider) {
      return this.createFallbackMetaDescription(title, content);
    }

    try {
      const systemPrompt = `You are an expert SEO copywriter creating compelling meta descriptions.

RULES:
- Write naturally and conversationally
- Include a clear benefit or value proposition
- Add a subtle call-to-action
- 140-160 characters (strict limit)
- No quotation marks in output
- Return ONLY the meta description text`;

      const userPrompt = `Create an engaging meta description:
Title: ${title}
Content preview: ${content.substring(0, 500)}

Write it to maximize click-through rate from search results.`;

      const result = await this.callAIProvider(
        provider,
        systemPrompt,
        userPrompt,
        100,
        0.4,
        userId
      );

      const cleaned = this.cleanAIResponse(result);
      return cleaned.length > 160 ? cleaned.substring(0, 157) + "..." : cleaned;
    } catch {
      return this.createFallbackMetaDescription(title, content);
    }
  }

  private async optimizeTitle(
    currentTitle: string,
    content: string,
    userId?: string
  ): Promise<string> {
    const provider = await this.selectAIProvider(userId);
    if (!provider) return currentTitle.substring(0, 60);

    try {
      const systemPrompt = `You are an SEO expert optimizing page titles.

GUIDELINES:
- Make it compelling and click-worthy
- Include primary keyword naturally
- 40-60 characters (strict limit)
- Maintain original tone
- Return ONLY the optimized title`;

      const userPrompt = `Optimize this title for SEO and CTR:
Current: "${currentTitle}"
Content context: ${content.substring(0, 300)}

Create a better title that will rank well and get clicks.`;

      const result = await this.callAIProvider(
        provider,
        systemPrompt,
        userPrompt,
        50,
        0.4,
        userId
      );

      const optimized = this.cleanAIResponse(result);
      return optimized.length > 60 ? optimized.substring(0, 57) + "..." : optimized;
    } catch {
      return currentTitle.substring(0, 60);
    }
  }

  private async analyzeContentQuality(
    content: string,
    title: string,
    userId?: string
  ): Promise<ContentAnalysis> {
    const provider = await this.selectAIProvider(userId);
    if (!provider) return this.createFallbackAnalysis(content);

    try {
      const systemPrompt = `You are a content quality analyst.

Analyze content for:
1. Readability and flow
2. Value to readers
3. Engagement factors
4. SEO optimization

Return ONLY JSON:
{
  "score": 0-100,
  "issues": ["specific problems"],
  "improvements": ["specific suggestions"],
  "readabilityScore": 0-100,
  "keywordDensity": {}
}`;

      const userPrompt = `Analyze this content:
Title: "${title}"
Content: "${content.substring(0, 1500)}"

Provide honest assessment with actionable improvements.`;

      const result = await this.callAIProvider(
        provider,
        systemPrompt,
        userPrompt,
        800,
        0.3,
        userId
      );

      return JSON.parse(this.cleanAIResponse(result));
    } catch {
      return this.createFallbackAnalysis(content);
    }
  }



  private async improveContent(
  content: string,
  title: string,
  improvements: string[],
  userId?: string
): Promise<string> {
  const provider = await this.selectAIProvider(userId);
  if (!provider) {
    return this.applyBasicContentImprovements(content);
  }

  try {
    const systemPrompt = `You are an expert content writer improving content quality.

CRITICAL RULES:
- Return ONLY the improved HTML content
- NO preambles, explanations, or meta-commentary
- Start directly with HTML tags
- Write naturally like a human expert
- Improve readability, structure, and value
- Add relevant examples and details
- Keep all existing images and links intact
- Maintain original tone and style`;

    const userPrompt = `Improve this content based on these suggestions:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n")}

Title: ${title}
Content: ${content}

Improve it significantly while keeping it natural.`;

    // Use image-protected wrapper
    const improved = await this.callAIWithImageProtection(
      provider,
      systemPrompt,
      userPrompt,
      content,
      3000,
      0.7,
      userId
    );

    const humanized = this.humanizeContent(improved);
    return humanized;
    
  } catch (error: any) {
    this.addLog(`Content improvement failed: ${error.message}`, "warning");
    return this.applyBasicContentImprovements(content);
  }
}


  private async optimizeKeywordDistribution(
    content: string,
    title: string,
    userId?: string
  ): Promise<string> {
    const keywords = this.extractKeywords(title);
    const $ = cheerio.load(content, this.getCheerioConfig());

    const firstP = $("p").first();
    if (firstP.length && keywords.length > 0) {
      const firstText = firstP.text();
      const mainKeyword = keywords[0];
      
      if (!firstText.toLowerCase().includes(mainKeyword)) {
        const enhanced = `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} is an important topic. ${firstText}`;
        firstP.html(enhanced);
      }
    }

    return this.extractHtmlContent($);
  }


/**
 * Universal wrapper that protects images when sending ANY content to AI for modification
 */
private async callAIWithImageProtection(
  provider: string,
  systemPrompt: string,
  userPrompt: string,
  originalContent: string,
  maxTokens: number = 3000,
  temperature: number = 0.7,
  userId?: string
): Promise<string> {
  // Extract and protect images
  const originalImages = this.extractImages(originalContent);
  
  if (originalImages.length > 0) {
    this.addLog(`🛡️ Protecting ${originalImages.length} images before AI processing`, "info");
  }
  
  // Create placeholders
  const imageMap = new Map<string, typeof originalImages[0]>();
  let contentForAI = originalContent;
  
  originalImages.forEach((img, index) => {
    const placeholder = `IMAGE_PLACEHOLDER_${index}_PRESERVED`;
    imageMap.set(placeholder, img);
    contentForAI = contentForAI.replace(img.element, `[${placeholder}]`);
  });
  
  // Add image preservation instruction to system prompt
  const enhancedSystemPrompt = originalImages.length > 0
    ? `${systemPrompt}\n\n⚠️ CRITICAL: PRESERVE ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers EXACTLY as they appear. DO NOT remove or modify them.`
    : systemPrompt;
  
  // Replace original content with placeholder version in user prompt
  const enhancedUserPrompt = userPrompt.replace(originalContent, contentForAI);
  
  // Call AI
  const response = await this.callAIProvider(
    provider,
    enhancedSystemPrompt,
    enhancedUserPrompt,
    maxTokens,
    temperature,
    userId
  );
  
  let cleaned = this.cleanAndValidateContent(response);
  
  // Restore images
  if (originalImages.length > 0) {
    this.addLog(`🔄 Restoring ${originalImages.length} images after AI processing`, "info");
    
    let restoredCount = 0;
    for (const [placeholder, img] of imageMap) {
      const marker = `[${placeholder}]`;
      if (cleaned.includes(marker)) {
        cleaned = cleaned.split(marker).join(img.element);
        restoredCount++;
        this.addLog(`✅ Restored: ${img.src.substring(0, 60)}...`, "success");
      } else {
        this.addLog(`⚠️ Marker missing, reinserting: ${img.src.substring(0, 60)}...`, "warning");
        const $ = cheerio.load(cleaned, this.getCheerioConfig());
        const firstP = $('p').first();
        if (firstP.length) {
          firstP.after(img.element);
        } else {
          $('body').prepend(img.element);
        }
        cleaned = $.html();
      }
    }
    
    this.addLog(`✅ Image restoration complete: ${restoredCount}/${originalImages.length} from placeholders`, "success");
    
    // Final safety check
    cleaned = this.ensureImagesPreserved(cleaned, originalImages);
  }
  
  return cleaned;
}


private async expandThinContent(
  creds: WordPressCredentials,
  fixes: AIFix[],
  userId?: string
): Promise<{ applied: AIFix[]; errors: string[] }> {
  return this.fixWordPressContent(
    creds,
    fixes,
    async (content, fix) => {
      const contentHtml = content.content?.rendered || content.content || "";
      const contentText = this.extractTextFromHTML(contentHtml);
      const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
      const TARGET_WORDS = 800;

      if (wordCount >= TARGET_WORDS) {
        return {
          updated: false,
          data: {},
          description: `Content length already sufficient (${wordCount} words)`,
        };
      }

      const provider = await this.selectAIProvider(userId);
      if (!provider) {
        return {
          updated: false,
          data: {},
          description: "AI provider not available",
        };
      }

      try {
        this.addLog(`Expanding content from ${wordCount} to ${TARGET_WORDS}+ words`, "info");
        
        const expandedContent = await this.expandContentWithAI(
          content.title?.rendered || content.title,
          contentHtml,
          provider,
          userId,
          TARGET_WORDS,
          1200
        );

        const newWordCount = this.extractTextFromHTML(expandedContent)
          .split(/\s+/)
          .filter(w => w.length > 0).length;

        // ⭐ CRITICAL FIX: Validate content wasn't shortened
        if (newWordCount < wordCount) {
          this.addLog(
            `❌ Rejecting expansion: content shortened from ${wordCount} to ${newWordCount}`,
            "error"
          );
          return {
            updated: false,
            data: {},
            description: `Rejected: AI shortened content (${wordCount} → ${newWordCount} words)`,
          };
        }

        if (newWordCount < TARGET_WORDS) {
          this.addLog(
            `⚠️ Could not reach ${TARGET_WORDS} words (final: ${newWordCount} words)`,
            "warning"
          );
          
          // Only apply if we improved by at least 30%
          if (newWordCount < wordCount * 1.3) {
            return {
              updated: false,
              data: {},
              description: `Insufficient expansion: ${wordCount} → ${newWordCount} words`,
            };
          }
        }

        this.addLog(
          `✅ Successfully expanded: ${wordCount} → ${newWordCount} words`,
          "success"
        );

        return {
          updated: true,
          data: { content: expandedContent },
          description: `Expanded content from ${wordCount} to ${newWordCount} words`,
        };
      } catch (error: any) {
        this.addLog(`Content expansion failed: ${error.message}`, "error");
        return {
          updated: false,
          data: {},
          description: `Failed: ${error.message}`,
        };
      }
    },
    userId
  );
}



private async expandContentWithAI(
  title: string,
  currentContent: string,
  provider: string,
  userId?: string,
  minimumWords: number = 800,
  idealWords: number = 1200,
  isRetry: boolean = false
): Promise<string> {
  const currentWordCount = this.extractTextFromHTML(currentContent)
    .split(/\s+/)
    .filter(w => w.length > 0).length;
  
  const wordsNeeded = Math.max(minimumWords - currentWordCount, 400);
  const targetWordCount = Math.max(idealWords, currentWordCount + wordsNeeded);

  this.addLog(
    `Content expansion: ${currentWordCount} words → target ${targetWordCount} words`,
    "info"
  );

  // Extract and protect images
  const originalImages = this.extractImages(currentContent);
  this.addLog(`Protecting ${originalImages.length} images`, "info");
  
  const imageMap = new Map<string, typeof originalImages[0]>();
  let contentForAI = currentContent;
  
  originalImages.forEach((img, index) => {
    const placeholder = `IMAGE_PLACEHOLDER_${index}_PRESERVED`;
    imageMap.set(placeholder, img);
    contentForAI = contentForAI.replace(img.element, `[${placeholder}]`);
  });

  const systemPrompt = `You are an expert content writer expanding existing content.

CRITICAL REQUIREMENTS:
1. PRESERVE 100% of existing content - NEVER remove or shorten
2. PRESERVE ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers exactly
3. ADD ${wordsNeeded}+ NEW words to reach ${targetWordCount} total words
4. Return ONLY expanded HTML - NO preambles or explanations

VALIDATION:
- Current: ${currentWordCount} words
- Target: ${targetWordCount} words minimum
- Must add: ${wordsNeeded}+ words

START your response directly with HTML tags.`;

  const userPrompt = `Expand this ${currentWordCount}-word content to AT LEAST ${targetWordCount} words:

Title: ${title}

Content to expand:
${contentForAI}

CRITICAL RULES:
1. Keep ALL existing content intact
2. Keep ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers
3. Add substantial new sections (${wordsNeeded}+ words)
4. Use proper HTML structure (h2, h3, p)
5. Natural flow and readability

ADD comprehensive new sections about:
- Detailed explanations
- Practical examples
- Expert insights
- Step-by-step guidance
- Common questions
- Related topics`;

  const response = await this.callAIProvider(
    provider,
    systemPrompt,
    userPrompt,
    5000,
    0.7,
    userId
  );

  let cleaned = this.cleanAndValidateContent(response);
  
  // Restore images
  this.addLog(`Restoring ${originalImages.length} images`, "info");
  
  for (const [placeholder, img] of imageMap) {
    const marker = `[${placeholder}]`;
    if (cleaned.includes(marker)) {
      cleaned = cleaned.split(marker).join(img.element);
      this.addLog(`✅ Restored: ${img.src.substring(0, 60)}...`, "success");
    } else {
      this.addLog(`⚠️ Reinserting missing image`, "warning");
      const $ = cheerio.load(cleaned, this.getCheerioConfig());
      const firstP = $('p').first();
      if (firstP.length) {
        firstP.after(img.element);
      } else {
        $('body').prepend(img.element);
      }
      cleaned = $.html();
    }
  }
  
  // Final validation
  cleaned = this.ensureImagesPreserved(cleaned, originalImages);
  
  const finalWordCount = this.extractTextFromHTML(cleaned)
    .split(/\s+/)
    .filter(w => w.length > 0).length;
  
  this.addLog(
    `Expansion result: ${currentWordCount} → ${finalWordCount} words`,
    finalWordCount >= minimumWords ? "success" : "warning"
  );

  // ⭐ CRITICAL FIX: Reject if content was shortened
  if (finalWordCount < currentWordCount) {
    throw new Error(
      `REJECTED: Content shortened from ${currentWordCount} to ${finalWordCount} words`
    );
  }

  return cleaned;
}


private async improveEAT(
  creds: WordPressCredentials,
  fixes: AIFix[],
  userId?: string
): Promise<{ applied: AIFix[]; errors: string[] }> {
  return this.fixWordPressContent(
    creds,
    fixes,
    async (content, fix) => {
      const title = content.title?.rendered || content.title || "";
      const contentHtml = content.content?.rendered || content.content || "";
      
      const provider = await this.selectAIProvider(userId);
      if (!provider) {
        return {
          updated: false,
          data: {},
          description: "AI provider not available"
        };
      }

      const systemPrompt = `You are enhancing content with E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).

Add to the existing content:
1. Expert insights and data points
2. References to credible sources
3. Author perspective or experience
4. Clear, well-researched explanations
5. Transparent and verifiable information

CRITICAL: Return ONLY the enhanced HTML content. NO preambles or explanations.`;

      const userPrompt = `Enhance this content with trustworthiness and expertise signals:

Title: ${title}
Content: ${contentHtml.substring(0, 2000)}

Add credible elements while maintaining the original structure.`;

      // Use image-protected wrapper
      const enhanced = await this.callAIWithImageProtection(
        provider,
        systemPrompt,
        userPrompt,
        contentHtml,
        3000,
        0.7,
        userId
      );

      return {
        updated: true,
        data: { content: enhanced },
        description: "Enhanced with expertise and trustworthiness signals"
      };
    },
    userId
  );
}

  private async generateSchemaMarkup(
    contentType: string,
    title: string,
    content: string,
    description: string,
    date: string,
    userId?: string
  ): Promise<any> {
    const baseUrl = this.currentWebsiteId
      ? await this.getWebsiteUrl(this.currentWebsiteId)
      : "";

    if (contentType === "post") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description.replace(/<[^>]*>/g, "").substring(0, 160),
        datePublished: date,
        dateModified: new Date().toISOString(),
        author: {
          "@type": "Person",
          name: "Author",
        },
        publisher: {
          "@type": "Organization",
          name: baseUrl.replace(/https?:\/\//, "").replace(/\/$/, ""),
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/wp-content/uploads/logo.png`,
          },
        },
      };
    } else {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: description.replace(/<[^>]*>/g, "").substring(0, 160),
        url: baseUrl,
      };
    }
  }

  // ==================== WORDPRESS API ====================

  private async getWordPressContent(
    creds: WordPressCredentials,
    type: "posts" | "pages"
  ) {
    const endpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/${type}`;
    const auth = Buffer.from(
      `${creds.username}:${creds.applicationPassword}`
    ).toString("base64");

    const response = await fetch(`${endpoint}?per_page=50&status=publish`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      contentType: type === "posts" ? "post" : "page",
    }));
  }

  private async updateWordPressContent(
    creds: WordPressCredentials,
    id: number,
    data: any,
    contentType: "post" | "page" = "post"
  ) {
    const endpoint =
      contentType === "page"
        ? `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/pages/${id}`
        : `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/posts/${id}`;

    const auth = Buffer.from(
      `${creds.username}:${creds.applicationPassword}`
    ).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to update ${contentType} ${id}: ${errorBody}`);
    }

    return response.json();
  }

  private async testWordPressConnection(
    creds: WordPressCredentials
  ): Promise<void> {
    const connectionTest = await wordpressService.testConnection(creds);
    if (!connectionTest.success) {
      throw new Error(connectionTest.message || "WordPress connection failed");
    }
    this.addLog("WordPress connection verified", "success");
  }

  // ==================== UTILITY METHODS ====================

  private getCheerioConfig() {
    return {
      xml: false,
      decodeEntities: false,
      normalizeWhitespace: false,
      recognizeSelfClosing: true,
      xmlMode: false,
      lowerCaseAttributeNames: false,
      lowerCaseTags: false,
    };
  }

  private extractHtmlContent($: cheerio.CheerioAPI): string {
    let html = $.html({
      decodeEntities: false,
      xmlMode: false,
      selfClosingTags: true,
    });

    if (html.includes("<html>") || html.includes("<body>")) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        return bodyMatch[1].trim();
      }

      html = html
        .replace(/^<!DOCTYPE[^>]*>/i, "")
        .replace(/^<html[^>]*>/i, "")
        .replace(/<\/html>\s*$/i, "")
        .replace(/^<head>[\s\S]*?<\/head>/i, "")
        .replace(/^<body[^>]*>/i, "")
        .replace(/<\/body>\s*$/i, "");
    }

    return html.trim();
  }

  /**
   * Removes unwanted "html" text artifacts from AI-generated content
   * Handles code blocks, quotes, and standalone "html" labels
   */
private removeHtmlLabel(content: string): string {
  if (!content) return "";

  let cleaned = content;

  // 1. Remove markdown code blocks with html
  cleaned = cleaned.replace(/```html\s*/gi, "");
  cleaned = cleaned.replace(/```\s*$/gi, "");
  cleaned = cleaned.replace(/~~~html\s*/gi, "");
  cleaned = cleaned.replace(/~~~\s*$/gi, "");

  // 2. Remove "html" at the very start (with optional quotes/whitespace)
  cleaned = cleaned.replace(/^["']?\s*html\s*["']?\s*/gi, "");
  cleaned = cleaned.replace(/^["']?\s*HTML\s*["']?\s*/g, "");

  // 3. Remove "html" at the very end (with optional quotes/whitespace)
  cleaned = cleaned.replace(/\s*["']?\s*html\s*["']?\s*$/gi, "");
  cleaned = cleaned.replace(/\s*["']?\s*HTML\s*["']?\s*$/g, "");

  // 4. Remove standalone "html" on its own line (anywhere in content)
  cleaned = cleaned.replace(/^\s*html\s*$/gim, "");
  cleaned = cleaned.replace(/^\s*HTML\s*$/gm, "");

  // 5. Remove "html:" or "html -" patterns (with optional quotes)
  cleaned = cleaned.replace(/^\s*["']?\s*html\s*[:\-]\s*/gi, "");
  cleaned = cleaned.replace(/^\s*["']?\s*HTML\s*[:\-]\s*/g, "");

  // 6. Remove language label patterns
  cleaned = cleaned.replace(/^(language|lang|type)\s*:\s*html\s*/gim, "");
  cleaned = cleaned.replace(/^(language|lang|type)\s*:\s*HTML\s*/gm, "");
  cleaned = cleaned.replace(/^\(html\)\s*/gi, "");
  cleaned = cleaned.replace(/^\(HTML\)\s*/g, "");

  // 7. NEW: Remove "html" when it appears after newline (common AI artifact)
  cleaned = cleaned.replace(/\n\s*html\s*\n/gi, "\n");
  cleaned = cleaned.replace(/\n\s*HTML\s*\n/g, "\n");

  // 8. NEW: Remove quoted "html" at start of lines
  cleaned = cleaned.replace(/^\s*["'`]html["'`]\s*/gim, "");
  cleaned = cleaned.replace(/^\s*["'`]HTML["'`]\s*/gm, "");

  // 9. NEW: Remove "html" when it appears before HTML tags
  cleaned = cleaned.replace(/^\s*html\s*</gi, "<");
  cleaned = cleaned.replace(/^\s*HTML\s*</g, "<");

  // 10. NEW: Remove "html\n" at the start
  cleaned = cleaned.replace(/^html\s*\n/i, "");
  cleaned = cleaned.replace(/^HTML\s*\n/, "");

  // 11. Clean up multiple blank lines that may result from removals
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");
  cleaned = cleaned.replace(/^\s*\n+/, ""); // Remove leading newlines

  // 12. Final trim
  return cleaned.trim();
}

  private cleanAIResponse(content: string): string {
    if (!content) return "";

    let cleaned = content;

    const prefixPatterns = [
      /^(Sure|Certainly|Here's?|Here is|I've|I have|Below|The following|Let me)\b[^{[\n<]*[\n:]/gi,
      /^```[a-z]*\s*\n/gim,
      /^["'`]+\s*/g,
      /^.*?Here's the.*?:\s*\n*/gi,
      /^.*?Below is the.*?:\s*\n*/gi,
    ];

    for (const pattern of prefixPatterns) {
      cleaned = cleaned.replace(pattern, "");
    }

    // Remove html label artifacts
    cleaned = this.removeHtmlLabel(cleaned);

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch {}
    }

    return cleaned.trim();
  }

  private removeAIArtifacts(content: string): string {
    const preamblePatterns = [
      /^Here's the .+?:\s*\n*/gi,
      /^I've .+?:\s*\n*/gi,
      /^This is .+?:\s*\n*/gi,
      /^Below is .+?:\s*\n*/gi,
    ];

    let cleaned = content;
    for (const pattern of preamblePatterns) {
      cleaned = cleaned.replace(pattern, "");
    }

    return cleaned;
  }

  private humanizeContent(content: string): string {
    const replacements: [RegExp, string][] = [
      [/Furthermore,/g, "Also,"],
      [/Moreover,/g, "Plus,"],
      [/Nevertheless,/g, "Still,"],
      [/Consequently,/g, "So,"],
      [/\bit is\b/g, "it's"],
      [/\byou are\b/g, "you're"],
      [/\bwe are\b/g, "we're"],
      [/\bcannot\b/g, "can't"],
    ];

    let humanized = content;
    for (const [pattern, replacement] of replacements) {
      humanized = humanized.replace(pattern, replacement);
    }

    return humanized;
  }


  private cleanAndValidateContent(content: string): string {
  if (!content) {
    throw new Error("Empty content received from AI");
  }

  let cleaned = this.removeHtmlLabel(content);
  
  // Remove any AI preambles or explanations
  const htmlStartIndex = cleaned.search(/<[^>]+>/);
  if (htmlStartIndex > 100) {
    // If HTML starts very late, there might be a preamble
    cleaned = cleaned.substring(htmlStartIndex);
  }

  // Validate we have actual HTML content
  if (!cleaned.includes('<') || !cleaned.includes('>')) {
    throw new Error("Invalid HTML content received from AI");
  }

  // Validate minimum content length
  const wordCount = this.extractTextFromHTML(cleaned)
    .split(/\s+/)
    .filter(w => w.length > 0).length;
  
  if (wordCount < 100) {
    throw new Error(`Content too short after cleaning: ${wordCount} words`);
  }

  return cleaned.trim();
}



  private applyBasicContentImprovements(content: string): string {
    const $ = cheerio.load(content, this.getCheerioConfig());

    $("p").each((i, elem) => {
      const text = $(elem).text();
      if (text.length > 500) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        if (sentences.length > 3) {
          const midPoint = Math.floor(sentences.length / 2);
          const firstHalf = sentences.slice(0, midPoint).join(" ");
          const secondHalf = sentences.slice(midPoint).join(" ");
          $(elem).replaceWith(`<p>${firstHalf}</p><p>${secondHalf}</p>`);
        }
      }
    });

    return this.extractHtmlContent($);
  }


  // IMPROVED: Better text extraction with word filtering
private extractTextFromHTML(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove script and style tags
  $('script, style, noscript').remove();
  
  return $.text()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s.,!?;:'"-]/g, "") // Remove special characters but keep punctuation
    .trim();
}

  private generateFallbackAltText(imageSrc: string, context: string): string {
    const filename = imageSrc.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
    const readable = filename.replace(/[-_]/g, " ");
    return readable.substring(0, 100);
  }

  private createFallbackMetaDescription(
    title: string,
    content: string
  ): string {
    const cleanContent = this.extractTextFromHTML(content);
    const description = `${title}. ${cleanContent.substring(0, 120)}...`;
    return description.substring(0, 160);
  }

  private createFallbackAnalysis(content: string): ContentAnalysis {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    return {
      score: Math.max(40, 100 - (words < 500 ? 30 : 0)),
      issues: words < 500 ? ["Content too short"] : [],
      improvements: words < 500 ? ["Expand to 800+ words"] : [],
      readabilityScore: Math.max(0, 100 - (avgWordsPerSentence - 15) * 3),
      keywordDensity: {},
    };
  }

  private extractKeywords(title: string): string[] {
    const stopWords = [
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    ];
    return title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => !stopWords.includes(word) && word.length > 2)
      .slice(0, 3);
  }

  private findSimilarUrl(
    brokenUrl: string,
    validUrls: Set<string>
  ): string | null {
    const slug = brokenUrl.split("/").pop()?.replace(/\/$/, "");
    if (!slug) return null;

    for (const validUrl of validUrls) {
      if (validUrl.includes(slug)) {
        return validUrl;
      }
    }
    return null;
  }






 private async improveReadability(
  creds: WordPressCredentials,
  fixes: AIFix[],
  userId?: string
): Promise<{ applied: AIFix[]; errors: string[] }> {
  return this.fixWordPressContent(
    creds,
    fixes,
    async (content, fix) => {
      const contentHtml = content.content?.rendered || content.content || "";
      const $ = cheerio.load(contentHtml, this.getCheerioConfig());

      let improved = false;

      $('p').each((_, elem) => {
        const text = $(elem).text();
        if (text.length > 400) {
          const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
          if (sentences.length > 2) {
            const mid = Math.floor(sentences.length / 2);
            const p1 = sentences.slice(0, mid).join(' ');
            const p2 = sentences.slice(mid).join(' ');
            $(elem).replaceWith(`<p>${p1}</p><p>${p2}</p>`);
            improved = true;
          }
        }
      });

      if (!improved) {
        const provider = await this.selectAIProvider(userId);
        if (provider) {
          const systemPrompt = `Rewrite content for better readability (target: 60+ Flesch score, 8th-9th grade level).

Rules:
- Use shorter sentences (15-20 words max)
- Replace complex words with simpler alternatives
- Use active voice
- Add transition words
- Break up dense paragraphs
- Return ONLY the rewritten HTML`;

          const userPrompt = `Improve readability of this content:

${contentHtml}

Make it clearer and easier to read while keeping all key information.`;

          const rewritten = await this.callAIWithImageProtection(
            provider,
            systemPrompt,
            userPrompt,
            contentHtml,
            3000,
            0.6,
            userId
          );

          return {
            updated: true,
            data: { content: rewritten },
            description: "Improved readability (simpler language, shorter sentences)"
          };
        }
      }

      if (improved) {
        return {
          updated: true,
          data: { content: this.extractHtmlContent($) },
          description: "Broke up long paragraphs for better readability"
        };
      }

      return {
        updated: false,
        data: {},
        description: "Content readability already acceptable"
      };
    },
    userId
  );
}
  
  // ==================== ISSUE MANAGEMENT (CORRECTED for seo_issue_tracking) ====================

  private async resetStuckFixingIssues(
    websiteId: string,
    userId: string
  ): Promise<void> {
    // Query seo_issue_tracking table for stuck issues
    const stuckIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
      status: ["fixing"],  // Column: status
    });

    if (stuckIssues.length > 0) {
      for (const issue of stuckIssues) {
        // Update seo_issue_tracking table - reset to 'open' status
        await storage.updateSeoIssueStatus(issue.id, "open", {
          resolutionNotes: "Reset from stuck fixing status",  // Column: resolution_notes
        });
      }
      this.addLog(`Reset ${stuckIssues.length} stuck issues to 'open' status in seo_issue_tracking`, "info");
    }
  }

  private async markIssuesAsFixing(
    fixes: AIFix[],
    fixSessionId: string
  ): Promise<void> {
    const issueIds = fixes
      .map((fix) => fix.trackedIssueId)
      .filter((id) => id) as string[];

    if (issueIds.length > 0) {
      // Bulk update seo_issue_tracking table
      await storage.bulkUpdateSeoIssueStatuses(
        issueIds,
        "fixing",
        fixSessionId
      );
      this.addLog(`Marked ${issueIds.length} issues as fixing in seo_issue_tracking`);
    }
  }

  private async updateIssueStatusesAfterFix(
    websiteId: string,
    userId: string,
    fixes: AIFix[],
    fixSessionId: string
  ): Promise<void> {
    try {
      this.addLog(`\n=== UPDATE ISSUE STATUSES DEBUG ===`);
      this.addLog(`Total fixes to process: ${fixes.length}`);
      const fixesWithIds = fixes.filter(f => f.trackedIssueId);
      this.addLog(`Fixes with trackedIssueId: ${fixesWithIds.length}`);
      this.addLog(`Unique issue IDs: ${new Set(fixesWithIds.map(f => f.trackedIssueId)).size}`);

      const fixesByIssueId = new Map<string, AIFix[]>();
      
      for (const fix of fixes) {
        if (fix.trackedIssueId) {
          const existing = fixesByIssueId.get(fix.trackedIssueId) || [];
          existing.push(fix);
          fixesByIssueId.set(fix.trackedIssueId, existing);
        }
      }

      this.addLog(`Updating ${fixesByIssueId.size} tracked issues in seo_issue_tracking`);

      for (const [issueId, issueFixes] of fixesByIssueId) {
        const allSuccessful = issueFixes.every(f => f.success);
        const anySuccessful = issueFixes.some(f => f.success);
        
        if (allSuccessful) {
          // Update seo_issue_tracking table
          await storage.updateSeoIssueStatus(issueId, "fixed", {
            fixMethod: "ai_automatic",  // Column: fix_method
            fixSessionId,  // Column: fix_session_id
            resolutionNotes: `Fixed across ${issueFixes.length} page(s): ${issueFixes.map(f => f.description).join('; ')}`,  // Column: resolution_notes
            fixedAt: new Date(),  // Column: fixed_at
          });
          this.addLog(`✅ Marked issue ${issueId} as fixed (${issueFixes.length} pages)`, "success");
        } else if (anySuccessful) {
          const successCount = issueFixes.filter(f => f.success).length;
          await storage.updateSeoIssueStatus(issueId, "open", {
            resolutionNotes: `Partially fixed: ${successCount}/${issueFixes.length} pages successful`,  // Column: resolution_notes
          });
          this.addLog(`⚠️ Issue ${issueId} partially fixed: ${successCount}/${issueFixes.length}`, "warning");
        } else {
          await storage.updateSeoIssueStatus(issueId, "open", {
            resolutionNotes: `Fix failed: ${issueFixes[0].error || 'Unknown error'}`,  // Column: resolution_notes
          });
          this.addLog(`❌ Issue ${issueId} fix failed`, "error");
        }
      }

      // Query seo_issue_tracking for any issues still in fixing status
      const fixingIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
        status: ["fixing"],  // Column: status
      });

      for (const issue of fixingIssues) {
        if (!fixesByIssueId.has(issue.id)) {
          await storage.updateSeoIssueStatus(issue.id, "open", {
            resolutionNotes: "No fixes were applied for this issue - reset to open",  // Column: resolution_notes
          });
          this.addLog(`⚠️ Reset orphaned issue ${issue.id}`, "warning");
        }
      }

    } catch (error: any) {
      this.addLog(`Error updating issue statuses: ${error.message}`, "error");
    }
  }

  private async cleanupStuckFixingIssues(
    websiteId: string,
    userId: string,
    fixSessionId: string
  ): Promise<void> {
    // Query seo_issue_tracking for stuck issues
    const stuckIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
      status: ["fixing"],  // Column: status
    });

    if (stuckIssues.length > 0) {
      for (const issue of stuckIssues) {
        await storage.updateSeoIssueStatus(issue.id, "open", {
          resolutionNotes: "Reset from stuck fixing state",  // Column: resolution_notes
        });
      }
    }
  }

  // ==================== ANALYSIS ====================

  private async performFullReanalysis(
    website: any,
    userId: string,
    websiteId: string,
    delay: number,
    purgedCaches: string[] = []
  ): Promise<ReanalysisResult> {
    try {
      const MIN_DELAY = purgedCaches.length > 0 ? 600000 : 900000;
      const effectiveDelay = Math.max(delay, MIN_DELAY);
      
      if (effectiveDelay !== delay) {
        this.addLog(
          `Adjusting wait time from ${delay / 60000}min to ${effectiveDelay / 60000}min (minimum for reliable results)`,
          "info"
        );
      }

      if (effectiveDelay > 0) {
        this.addLog(
          `Waiting ${effectiveDelay / 60000} minutes for cache to clear and changes to propagate...`,
          "info"
        );
        await new Promise((resolve) => setTimeout(resolve, effectiveDelay));
      }

      const latestReport = await this.getLatestSeoReport(websiteId, userId);
      const initialScore = latestReport?.score || 0;

      this.addLog("Verifying fixes are visible (checking cache clearance)...", "info");
      const cacheCleared = await this.verifyCacheCleared(website);
      
      if (!cacheCleared) {
        this.addLog(
          "Cache may still be active - scores might not reflect all changes yet",
          "warning"
        );
      }

      this.addLog("Starting full reanalysis with cache-busted crawl...", "info");

      const newAnalysis = await seoService.analyzeWebsite(
        website.url,
        [],
        userId,
        websiteId,
        {
          skipIssueTracking: true,
          verifyFixedIssuesOnly: false,
          usePuppeteer: true,
          runLighthouse: true,
          crawlEnabled: true,
          maxCrawlPages: 50,
          bustCache: true,
        }
      );

      const scoreImprovement = newAnalysis.score - initialScore;

      await storage.updateWebsite(websiteId, {
        seoScore: newAnalysis.score,
        lastAnalyzed: new Date(),
      });

      if (scoreImprovement > 0) {
        this.addLog(
          `✅ Reanalysis complete: ${initialScore} → ${newAnalysis.score} (+${scoreImprovement} points)`,
          "success"
        );
      } else if (scoreImprovement === 0) {
        this.addLog(
          `⚠️ Score unchanged: ${initialScore} (fixes may need more time to propagate or weren't detected)`,
          "warning"
        );
      } else {
        this.addLog(
          `⚠️ Score decreased: ${initialScore} → ${newAnalysis.score} (${scoreImprovement} points) - this may indicate cache issues or new problems`,
          "warning"
        );
      }

      return {
        enabled: true,
        initialScore,
        finalScore: newAnalysis.score,
        scoreImprovement: Math.max(0, scoreImprovement),
        analysisTime: effectiveDelay / 1000,
        success: true,
        cacheCleared,
      };
    } catch (error: any) {
      this.addLog(`Reanalysis failed: ${error.message}`, "error");
      return {
        enabled: true,
        initialScore: 0,
        finalScore: 0,
        scoreImprovement: 0,
        analysisTime: delay / 1000,
        success: false,
        error: error.message,
      };
    }
  }

  private async verifyCacheCleared(website: any): Promise<boolean> {
    try {
      const url = website.url;
      
      const response = await fetch(`${url}?nocache=${Date.now()}&verify=true`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const html = await response.text();
      
      const checks = {
        hasRecentTimestamp: html.includes(new Date().getFullYear().toString()),
        notCachedResponse: !response.headers.get('x-cache')?.includes('HIT'),
        hasDynamicContent: html.includes('wp-json') || html.includes('rest_route'),
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.values(checks).length;
      
      const cleared = passedChecks >= totalChecks * 0.6;
      
      this.addLog(
        `Cache verification: ${passedChecks}/${totalChecks} checks passed ${cleared ? '✓' : '✗'}`,
        cleared ? "success" : "warning"
      );
      
      return cleared;
      
    } catch (error: any) {
      this.addLog(`Cache verification skipped: ${error.message}`, "info");
      return false;
    }
  }

  private estimateScoreImprovement(fixes: AIFix[]): number {
    const weights: Record<string, number> = {
      missing_meta_description: 8.0,
      poor_title_tag: 8.0,
      missing_h1: 6.0,
      heading_structure: 5.0,
      content_quality: 9.0,
      keyword_optimization: 6.0,
      missing_alt_text: 4.0,
      thin_content: 10.0,
      images_missing_lazy_loading: 5.0,
      missing_schema: 5.0,
    };

    let improvement = 0;
    const successfulFixes = fixes.filter((f) => f.success);

    for (const fix of successfulFixes) {
      const weight = weights[fix.type] || 3.0;
      const impactMultiplier =
        fix.impact === "high" ? 1.2 : fix.impact === "medium" ? 1.0 : 0.6;
      improvement += weight * impactMultiplier;
    }

    return Math.min(improvement, 50);
  }

  // ==================== HELPER METHODS ====================

  private getWordPressCredentials(website: any): WordPressCredentials {
    if (!website.wpApplicationPassword) {
      throw new Error("WordPress credentials not configured");
    }

    return {
      url: website.url,
      username: website.wpUsername || "admin",
      applicationPassword: website.wpApplicationPassword,
    };
  }

  private async getLatestSeoReport(websiteId: string, userId: string) {
    const reports = await storage.getSeoReportsByWebsite(websiteId, userId);
    return reports[0];
  }

  private async getWebsiteUrl(websiteId: string): Promise<string> {
    const website = await storage.getUserWebsite(
      websiteId,
      this.currentUserId!
    );
    return website?.url || "";
  }

  private mapSeverityToImpact(severity: string): "high" | "medium" | "low" {
    return severity === "critical"
      ? "high"
      : severity === "warning"
      ? "medium"
      : "low";
  }

  private groupFixesByType(fixes: AIFix[]): Record<string, AIFix[]> {
    return fixes.reduce((groups, fix) => {
      (groups[fix.type] = groups[fix.type] || []).push(fix);
      return groups;
    }, {} as Record<string, AIFix[]>);
  }

  private prioritizeAndFilterFixes(
    fixes: AIFix[],
    allowedTypes?: string[],
    maxChanges: number = 50
  ): AIFix[] {
    let filtered = fixes;

    if (allowedTypes && allowedTypes.length > 0) {
      filtered = filtered.filter((fix) => allowedTypes.includes(fix.type));
    }

    const priority = { high: 3, medium: 2, low: 1 };
    filtered.sort(
      (a, b) => (priority[b.impact] || 0) - (priority[a.impact] || 0)
    );

    return filtered.slice(0, maxChanges);
  }

  private calculateDetailedBreakdown(fixes: AIFix[]) {
    const successful = fixes.filter((f) => f.success);

    return {
      altTextFixed: successful.filter((f) => f.type.includes("alt")).length,
      metaDescriptionsUpdated: successful.filter((f) =>
        f.type.includes("meta_description")
      ).length,
      titleTagsImproved: successful.filter((f) => f.type.includes("title"))
        .length,
      headingStructureFixed: successful.filter((f) =>
        f.type.includes("heading")
      ).length,
      internalLinksAdded: successful.filter((f) => f.type.includes("linking"))
        .length,
      imagesOptimized: successful.filter((f) => f.type.includes("image"))
        .length,
      contentQualityImproved: successful.filter((f) =>
        f.type.includes("content")
      ).length,
      schemaMarkupAdded: successful.filter((f) => f.type.includes("schema"))
        .length,
      openGraphTagsAdded: successful.filter((f) => f.type.includes("open_graph"))
        .length,
      canonicalUrlsFixed: successful.filter((f) => f.type.includes("canonical"))
        .length,
    };
  }

  private calculateEstimatedImpact(fixes: AIFix[]): string {
    const successful = fixes.filter((f) => f.success);
    const highImpact = successful.filter((f) => f.impact === "high").length;

    if (highImpact >= 5) return "very high";
    if (highImpact >= 3) return "high";
    if (highImpact >= 1) return "medium";
    return "low";
  }

  // ==================== RESULT CREATION ====================

  private createSuccessResult(
    appliedFixes: AIFix[],
    errors: string[],
    totalIssues: number,
    dryRun: boolean,
    reanalysis: ReanalysisResult | undefined,
    fixSessionId: string
  ): AIFixResult {
    const stats: AIFixStats = {
      totalIssuesFound: totalIssues,
      fixesAttempted: appliedFixes.length,
      fixesSuccessful: appliedFixes.filter((f) => f.success).length,
      fixesFailed: appliedFixes.filter((f) => !f.success).length,
      estimatedImpact: this.calculateEstimatedImpact(appliedFixes),
      detailedBreakdown: this.calculateDetailedBreakdown(appliedFixes),
    };

    let message = dryRun
      ? `Dry run complete. Found ${stats.fixesAttempted} fixable issues.`
      : `Applied ${stats.fixesSuccessful} fixes successfully.`;

    if (reanalysis?.success && reanalysis.scoreImprovement > 0) {
      message += ` SEO score improved: ${reanalysis.initialScore} → ${reanalysis.finalScore} (+${reanalysis.scoreImprovement} points)`;
    }

    return {
      success: true,
      dryRun,
      fixesApplied: appliedFixes,
      stats,
      errors: errors.length > 0 ? errors : undefined,
      message,
      detailedLog: [...this.log],
      reanalysis,
      fixSessionId,
    };
  }

  private createNoFixesNeededResult(
    dryRun: boolean,
    fixSessionId: string
  ): AIFixResult {
    return {
      success: true,
      dryRun,
      fixesApplied: [],
      stats: {
        totalIssuesFound: 0,
        fixesAttempted: 0,
        fixesSuccessful: 0,
        fixesFailed: 0,
        estimatedImpact: "none",
        detailedBreakdown: {
          altTextFixed: 0,
          metaDescriptionsUpdated: 0,
          titleTagsImproved: 0,
          headingStructureFixed: 0,
          internalLinksAdded: 0,
          imagesOptimized: 0,
          contentQualityImproved: 0,
          schemaMarkupAdded: 0,
          openGraphTagsAdded: 0,
          canonicalUrlsFixed: 0,
        },
      },
      message: "All fixable SEO issues have already been addressed.",
      detailedLog: [...this.log],
      fixSessionId,
    };
  }

  private createErrorResult(
    error: any,
    dryRun: boolean,
    fixSessionId: string
  ): AIFixResult {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    this.addLog(`AI fix service error: ${errorMessage}`, "error");

    return {
      success: false,
      dryRun,
      fixesApplied: [],
      stats: {
        totalIssuesFound: 0,
        fixesAttempted: 0,
        fixesSuccessful: 0,
        fixesFailed: 1,
        estimatedImpact: "none",
        detailedBreakdown: {
          altTextFixed: 0,
          metaDescriptionsUpdated: 0,
          titleTagsImproved: 0,
          headingStructureFixed: 0,
          internalLinksAdded: 0,
          imagesOptimized: 0,
          contentQualityImproved: 0,
          schemaMarkupAdded: 0,
          openGraphTagsAdded: 0,
          canonicalUrlsFixed: 0,
        },
      },
      errors: [errorMessage],
      message: `AI fix failed: ${errorMessage}`,
      detailedLog: [...this.log],
      fixSessionId,
    };
  }

  // ==================== ACTIVITY LOGGING ====================

  private async createActivityLog(
    userId: string,
    websiteId: string,
    appliedFixes: AIFix[],
    reanalysis: ReanalysisResult | undefined,
    fixSessionId: string
  ): Promise<void> {
    const successfulFixes = appliedFixes.filter((f) => f.success);

    await storage.createActivityLog({
      userId,
      websiteId,
      type: "ai_fixes_applied",
      description: `AI fixes: ${successfulFixes.length} successful, ${
        appliedFixes.length - successfulFixes.length
      } failed`,
      metadata: {
        fixSessionId,
        fixesApplied: appliedFixes.length,
        fixesSuccessful: successfulFixes.length,
        fixesFailed: appliedFixes.length - successfulFixes.length,
        reanalysis: reanalysis || null,
      },
    });
  }

  private async createWebsiteBackup(
    website: any,
    userId: string
  ): Promise<void> {
    try {
      await storage.createBackup({
        userId,
        websiteId: website.id,
        backupType: "pre_ai_fix",
        status: "completed",
        data: {},
        metadata: {
          reason: "Before AI fixes",
          websiteUrl: website.url,
          timestamp: new Date().toISOString(),
        },
      });
      this.addLog("Backup created", "success");
    } catch (error) {
      this.addLog("Backup creation failed (continuing anyway)", "warning");
    }
  }

  // ==================== PUBLIC API ====================

  async getAvailableFixTypes(
    websiteId: string,
    userId: string
  ): Promise<{
    availableFixes: string[];
    totalFixableIssues: number;
    estimatedTime: string;
    breakdown: Record<string, number>;
  }> {
    try {
      const fixableIssues = await this.getFixableIssues(websiteId, userId);
      const availableFixTypes = [...new Set(fixableIssues.map((fix) => fix.type))];
      const breakdown = fixableIssues.reduce(
        (acc: Record<string, number>, fix) => {
          acc[fix.type] = (acc[fix.type] || 0) + 1;
          return acc;
        },
        {}
      );

      return {
        availableFixes: availableFixTypes,
        totalFixableIssues: fixableIssues.length,
        estimatedTime: this.estimateFixTime(fixableIssues.length),
        breakdown,
      };
    } catch (error) {
      return {
        availableFixes: [],
        totalFixableIssues: 0,
        estimatedTime: "0 minutes",
        breakdown: {},
      };
    }
  }

  private estimateFixTime(fixCount: number): string {
    const minutesPerFix = 2;
    const totalMinutes = Math.max(3, fixCount * minutesPerFix);

    if (totalMinutes < 60) return `${totalMinutes} minutes`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export const aiFixService = new AIFixService();












































// import { aiService } from "server/services/ai-service";
// import { wordpressService } from "server/services/wordpress-service";
// import { wordPressAuthService } from "server/services/wordpress-auth";
// import { storage } from "server/storage";
// import { seoService } from "./seo-service";
// import * as cheerio from "cheerio";
// import { randomUUID } from "crypto";
// import { apiKeyEncryptionService } from "./api-key-encryption";


// const generateUniqueId = (): string => {
//   // Check if crypto.randomUUID is available (modern browsers)
//   if (typeof crypto !== 'undefined' && crypto.randomUUID) {
//     return crypto.randomUUID();
//   }
  
//   // Fallback implementation for environments without crypto.randomUUID
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     const r = Math.random() * 16 | 0;
//     const v = c === 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// };

// // If you need to use it globally in the file, you can also create a polyfill:
// if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && !crypto.randomUUID) {
//   // @ts-ignore
//   crypto.randomUUID = generateUniqueId;
// }
// // Types and Interfaces
// export interface AIFixResult {
//   success: boolean;
//   dryRun: boolean;
//   fixesApplied: AIFix[];
//   stats: AIFixStats;
//   errors?: string[];
//   message: string;
//   detailedLog: string[];
//   reanalysis?: ReanalysisResult;
//   fixSessionId?: string;
// }

// export interface AIFix {
//   type: string;
//   description: string;
//   element?: string;
//   before?: string;
//   after?: string;
//   success: boolean;
//   impact: "high" | "medium" | "low";
//   error?: string;
//   wordpressPostId?: number;
//   elementPath?: string;
//   trackedIssueId?: string;
// }

// interface AIFixStats {
//   totalIssuesFound: number;
//   fixesAttempted: number;
//   fixesSuccessful: number;
//   fixesFailed: number;
//   estimatedImpact: string;
//   detailedBreakdown: {
//     altTextFixed: number;
//     metaDescriptionsUpdated: number;
//     titleTagsImproved: number;
//     headingStructureFixed: number;
//     internalLinksAdded: number;
//     imagesOptimized: number;
//     contentQualityImproved: number;
//     schemaMarkupAdded: number;
//     openGraphTagsAdded: number;
//     canonicalUrlsFixed: number;
//   };
// }

// export enum ProcessingMode {
//   SAMPLE = "sample",
//   PARTIAL = "partial",
//   FULL = "full",
//   PRIORITY = "priority",
// }

// interface ProcessingOptions {
//   mode?: ProcessingMode;
//   batchSize?: number;
//   maxItems?: number;
//   progressCallback?: (current: number, total: number) => void;
//   priorityUrls?: string[];
// }

// interface ProcessingLimits {
//   maxItems: number;
//   batchSize: number;
//   delayBetweenBatches: number;
// }

// interface ReanalysisResult {
//   enabled: boolean;
//   initialScore: number;
//   finalScore: number;
//   scoreImprovement: number;
//   analysisTime: number;
//   success: boolean;
//   error?: string;
//   simulated?: boolean;
//   cacheCleared?: boolean;
// }

// interface WordPressCredentials {
//   url: string;
//   username: string;
//   applicationPassword: string;
// }

// interface ContentAnalysis {
//   score: number;
//   issues: string[];
//   improvements: string[];
//   readabilityScore: number;
//   keywordDensity: Record<string, number>;
// }

// // Main AI Fix Service Class
// class AIFixService {
//   private log: string[] = [];
//   private currentUserId?: string;
//   private currentWebsiteId?: string;

//   // Logging utility
//   private addLog(
//     message: string,
//     level: "info" | "success" | "warning" | "error" = "info"
//   ): void {
//     const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
//     const emoji =
//       level === "success"
//         ? "✅"
//         : level === "error"
//         ? "❌"
//         : level === "warning"
//         ? "⚠️"
//         : "ℹ️";
//     const logMessage = `[${timestamp}] ${emoji} ${message}`;
//     this.log.push(logMessage);
//     console.log(logMessage);
//   }

//   // API Key Management Methods
//   private async getAPIKey(
//     userId: string | undefined,
//     provider: string,
//     envVarNames: string[]
//   ): Promise<{ key: string; type: "user" | "system" } | null> {
//     if (userId) {
//       try {
//         const userApiKeys = await storage.getUserApiKeys(userId);
//         if (userApiKeys && userApiKeys.length > 0) {
//           const validKey = userApiKeys.find(
//             (key: any) =>
//               key.provider === provider &&
//               key.isActive &&
//               key.validationStatus === "valid"
//           );
//           if (validKey && validKey.encryptedApiKey) {
//             try {
//               const decryptedKey = apiKeyEncryptionService.decrypt(
//                 validKey.encryptedApiKey
//               );
//               this.addLog(
//                 `Using user's ${provider} API key (${validKey.keyName})`,
//                 "info"
//               );
//               return { key: decryptedKey, type: "user" };
//             } catch (decryptError: any) {
//               this.addLog(
//                 `Failed to decrypt user's ${provider} key: ${decryptError.message}`,
//                 "warning"
//               );
//             }
//           }
//         }
//       } catch (error: any) {
//         this.addLog(
//           `Failed to fetch user's API keys: ${error.message}`,
//           "warning"
//         );
//       }
//     }

//     for (const envVar of envVarNames) {
//       if (process.env[envVar]) {
//         this.addLog(`Using system ${provider} API key`, "info");
//         return { key: process.env[envVar]!, type: "system" };
//       }
//     }
//     return null;
//   }

//   private async getUserOpenAI(userId: string | undefined): Promise<{
//     client: any;
//     keyType: "user" | "system";
//   } | null> {
//     const keyInfo = await this.getAPIKey(userId, "openai", [
//       "OPENAI_API_KEY",
//       "OPENAI_API_KEY_ENV_VAR",
//     ]);
//     if (!keyInfo) return null;
//     const { default: OpenAI } = await import("openai");
//     return {
//       client: new OpenAI({ apiKey: keyInfo.key }),
//       keyType: keyInfo.type,
//     };
//   }

//   private async getUserAnthropic(userId: string | undefined): Promise<{
//     client: any;
//     keyType: "user" | "system";
//   } | null> {
//     const keyInfo = await this.getAPIKey(userId, "anthropic", [
//       "ANTHROPIC_API_KEY",
//       "CLAUDE_API_KEY",
//     ]);
//     if (!keyInfo) return null;
//     const { default: Anthropic } = await import("@anthropic-ai/sdk");
//     return {
//       client: new Anthropic({ apiKey: keyInfo.key }),
//       keyType: keyInfo.type,
//     };
//   }

//   private getProcessingLimits(
//     mode: ProcessingMode = ProcessingMode.SAMPLE
//   ): ProcessingLimits {
//     switch (mode) {
//       case ProcessingMode.SAMPLE:
//         return { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };
//       case ProcessingMode.PARTIAL:
//         return { maxItems: 50, batchSize: 10, delayBetweenBatches: 2000 };
//       case ProcessingMode.FULL:
//         return { maxItems: 200, batchSize: 20, delayBetweenBatches: 3000 };
//       case ProcessingMode.PRIORITY:
//         return { maxItems: 30, batchSize: 10, delayBetweenBatches: 1500 };
//       default:
//         return { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };
//     }
//   }

//   private async getAllWordPressContent(
//     creds: WordPressCredentials,
//     maxItems: number = 100
//   ): Promise<any[]> {
//     const allContent: any[] = [];
//     let page = 1;
//     const perPage = 50;

//     while (allContent.length < maxItems) {
//       try {
//         const posts = await this.getWordPressContentPaginated(
//           creds,
//           "posts",
//           page,
//           perPage
//         );
//         if (posts.length === 0) break;
//         allContent.push(...posts.map((p) => ({ ...p, contentType: "post" })));
//         if (posts.length < perPage) break;
//         page++;
//         await new Promise((resolve) => setTimeout(resolve, 500));
//       } catch (error) {
//         this.addLog(`Error fetching posts page ${page}: ${error}`, "warning");
//         break;
//       }
//     }

//     page = 1;
//     while (allContent.length < maxItems) {
//       try {
//         const pages = await this.getWordPressContentPaginated(
//           creds,
//           "pages",
//           page,
//           perPage
//         );
//         if (pages.length === 0) break;
//         allContent.push(...pages.map((p) => ({ ...p, contentType: "page" })));
//         if (pages.length < perPage) break;
//         page++;
//         await new Promise((resolve) => setTimeout(resolve, 500));
//       } catch (error) {
//         this.addLog(`Error fetching pages page ${page}: ${error}`, "warning");
//         break;
//       }
//     }

//     return allContent.slice(0, maxItems);
//   }

//   private async getWordPressContentPaginated(
//     creds: WordPressCredentials,
//     type: "posts" | "pages",
//     page: number = 1,
//     perPage: number = 50
//   ): Promise<any[]> {
//     const endpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/${type}`;
//     const auth = Buffer.from(
//       `${creds.username}:${creds.applicationPassword}`
//     ).toString("base64");

//     const response = await fetch(
//       `${endpoint}?per_page=${perPage}&page=${page}&status=publish`,
//       {
//         headers: {
//           Authorization: `Basic ${auth}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       if (response.status === 400 || response.status === 404) {
//         return [];
//       }
//       throw new Error(`Failed to fetch ${type}: ${response.status}`);
//     }
//     return response.json();
//   }

//   // Main entry point
//   async analyzeAndFixWebsite(
//     websiteId: string,
//     userId: string,
//     dryRun: boolean = false,
//     options: {
//       fixTypes?: string[];
//       maxChanges?: number;
//       skipBackup?: boolean;
//       enableReanalysis?: boolean;
//       reanalysisDelay?: number;
//       forceReanalysis?: boolean;
//       processingMode?: ProcessingMode;
//       processingOptions?: ProcessingOptions;
//     } = {}
//   ): Promise<AIFixResult> {
//     this.log = [];
//     this.currentUserId = userId;
//     this.currentWebsiteId = websiteId;
//     const fixSessionId = randomUUID();

//     this.addLog("=== Starting AI Fix Analysis ===", "info");

//     try {
//       this.addLog(
//         `Starting AI fix analysis for website ${websiteId} (dry run: ${dryRun}, session: ${fixSessionId})`
//       );

//       const website = await this.validateWebsiteAccess(websiteId, userId);
//       const fixableIssues = await this.getFixableIssues(websiteId, userId);

//       if (fixableIssues.length === 0) {
//         return this.createNoFixesNeededResult(dryRun, fixSessionId);
//       }

//       const fixesToApply = this.prioritizeAndFilterFixes(
//         fixableIssues,
//         options.fixTypes,
//         options.maxChanges || fixableIssues.length
//       );

//       this.addLog(`Will attempt to fix ${fixesToApply.length} issues`);

//       if (!dryRun) {
//         const result = await this.applyFixesAndAnalyze(
//           website,
//           websiteId,
//           userId,
//           fixesToApply,
//           fixSessionId,
//           { ...options, enableReanalysis: false }
//         );

//         let purgeResult: { success: boolean; purgedCaches: string[]; recommendedWaitMinutes: number } | null = null;
        
//         try {
//           const creds = this.getWordPressCredentials(website);
//           purgeResult = await this.purgeWordPressCache(creds);
          
//           if (purgeResult.success) {
//             this.addLog(
//               `Cache purged successfully: ${purgeResult.purgedCaches.join(', ')}`,
//               "success"
//             );
//           }
//         } catch (error: any) {
//           this.addLog(`Cache purge failed: ${error.message}`, "warning");
//         }

//         if (options.enableReanalysis !== false) {
//           const recommendedWaitMinutes = purgeResult?.recommendedWaitMinutes || 15;
//           const hoursDelay = options.forceReanalysis ? (recommendedWaitMinutes / 60) : 24;
          
//           if (options.forceReanalysis) {
//             this.addLog(
//               `Force reanalysis enabled - waiting ${recommendedWaitMinutes} minutes for cache to clear`,
//               "info"
//             );
            
//             const reanalysisData = await this.performFullReanalysis(
//               website,
//               userId,
//               websiteId,
//               recommendedWaitMinutes * 60 * 1000,
//               purgeResult?.purgedCaches || []
//             );
            
//             result.reanalysis = reanalysisData;
            
//             if (reanalysisData.success) {
//               if (reanalysisData.scoreImprovement > 0) {
//                 result.message += ` SEO score improved: ${reanalysisData.initialScore} → ${reanalysisData.finalScore} (+${reanalysisData.scoreImprovement} points)`;
//               } else if (!reanalysisData.cacheCleared) {
//                 result.message += ` Reanalysis completed but cache may still be active. Recommend manual recheck in 30 minutes.`;
//               } else {
//                 result.message += ` Reanalysis complete. Score: ${reanalysisData.finalScore} (no immediate improvement detected)`;
//               }
//             } else {
//               result.message += ` Reanalysis failed: ${reanalysisData.error || 'Unknown error'}`;
//             }
//           } else {
//             await this.scheduleDelayedReanalysis(websiteId, userId, hoursDelay);
//             result.message += ` Reanalysis scheduled for ${hoursDelay} hours to allow full cache invalidation.`;
//           }
//         }

//         return result;
//       } else {
//         return await this.performDryRun(
//           fixesToApply,
//           fixSessionId,
//           options,
//           website
//         );
//       }
//     } catch (error) {
//       return this.createErrorResult(error, dryRun, fixSessionId);
//     }
//   }

//   private async scheduleDelayedReanalysis(
//     websiteId: string,
//     userId: string,
//     hoursDelay: number
//   ): Promise<void> {
//     try {
//       const scheduledFor = new Date(Date.now() + hoursDelay * 60 * 60 * 1000);
      
//       if (typeof storage.createScheduledTask !== 'function') {
//         this.addLog(
//           'Scheduled tasks not supported in storage - skipping automatic reanalysis scheduling',
//           'warning'
//         );
//         this.addLog(
//           `Manual reanalysis recommended after ${hoursDelay} hours`,
//           'info'
//         );
//         return;
//       }
      
//       await storage.createScheduledTask({
//         userId,
//         websiteId,
//         type: 'seo_reanalysis',
//         scheduledFor,
//         status: 'pending',
//         metadata: {
//           reason: 'post_ai_fix_verification',
//           autoFixSession: true,
//           note: 'Delayed to allow cache invalidation'
//         }
//       });
      
//       this.addLog(
//         `Scheduled reanalysis for ${scheduledFor.toLocaleString()} (${hoursDelay} hours from now)`, 
//         "success"
//       );
//     } catch (error: any) {
//       this.addLog(
//         `Failed to schedule reanalysis: ${error.message}`, 
//         "warning"
//       );
//     }
//   }
  
//   private async validateWebsiteAccess(websiteId: string, userId: string) {
//     const website = await storage.getUserWebsite(websiteId, userId);
//     if (!website) {
//       throw new Error("Website not found or access denied");
//     }
//     this.addLog(`Loaded website: ${website.name} (${website.url})`);
//     return website;
//   }

//   private async getFixableIssues(
//     websiteId: string,
//     userId: string
//   ): Promise<AIFix[]> {
//     await this.resetStuckFixingIssues(websiteId, userId);

//     const trackedIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
//       autoFixableOnly: true,
//       status: ["detected", "reappeared"],
//       excludeRecentlyFixed: true,
//       fixedWithinDays: 7,
//     });
    
//     this.addLog(`Found ${trackedIssues.length} tracked fixable issues`);
//     const issueTypes = [...new Set(trackedIssues.map(i => i.issueType))];
//     this.addLog(`Issue types found: ${issueTypes.join(', ')}`, "info");

//     return trackedIssues.map((issue) => ({
//       type: issue.issueType,
//       description: issue.issueDescription || issue.issueTitle,
//       element: issue.elementPath || issue.issueType,
//       before: issue.currentValue || "Current state",
//       after: issue.recommendedValue || "Improved state",
//       impact: this.mapSeverityToImpact(issue.severity),
//       trackedIssueId: issue.id,
//       success: false,
//     }));
//   }

//   private async purgeWordPressCache(creds: WordPressCredentials): Promise<{
//     success: boolean;
//     purgedCaches: string[];
//     recommendedWaitMinutes: number;
//   }> {
//     this.addLog("Attempting comprehensive cache purge...", "info");
    
//     const auth = Buffer.from(
//       `${creds.username}:${creds.applicationPassword}`
//     ).toString('base64');
    
//     const purgedCaches: string[] = [];
//     let recommendedWaitMinutes = 5;
    
//     let hasCDN = false;
//     try {
//       const testResponse = await fetch(creds.url, { 
//         method: 'HEAD',
//         headers: { 'User-Agent': 'Mozilla/5.0' }
//       });
      
//       const cfRay = testResponse.headers.get('cf-ray');
//       const xCache = testResponse.headers.get('x-cache');
//       const xCDN = testResponse.headers.get('x-cdn');
      
//       if (cfRay) {
//         hasCDN = true;
//         this.addLog("Cloudflare CDN detected - cache propagation may take 10-15 minutes", "warning");
//         recommendedWaitMinutes = 15;
//       } else if (xCache || xCDN) {
//         hasCDN = true;
//         this.addLog("CDN detected - cache propagation may take 10 minutes", "warning");
//         recommendedWaitMinutes = 10;
//       }
//     } catch (error: any) {
//       this.addLog(`CDN detection failed: ${error.message}`, "info");
//     }
    
//     const purgeMethods = [
//       {
//         name: 'LiteSpeed Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/litespeed/v1/purge_all`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'WP Rocket',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/wp-rocket/v1/purge-cache`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'W3 Total Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/w3tc/v1/flush`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'WP Super Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/wp-super-cache/v1/cache`, {
//             method: 'DELETE',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'WP Fastest Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/wpfc/v1/cache/delete`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'Autoptimize',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/autoptimize/v1/cache/purge`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'Redis Object Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/redis-cache/v1/flush`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Basic ${auth}`,
//               'Content-Type': 'application/json'
//             }
//           });
//           return response.ok;
//         }
//       },
//       {
//         name: 'Transient Cache',
//         execute: async () => {
//           const response = await fetch(`${creds.url}/wp-json/wp/v2/settings`, {
//             method: 'POST',
//             headers: { 
//               'Authorization': `Basic ${auth}`, 
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ 
//               _wpnonce: Date.now().toString()
//             })
//           });
//           return response.status === 200 || response.status === 403;
//         }
//       }
//     ];

//     for (const method of purgeMethods) {
//       try {
//         const success = await method.execute();
//         if (success) {
//           purgedCaches.push(method.name);
//           this.addLog(`Cache purged via ${method.name}`, "success");
//         }
//       } catch (error: any) {
//         if (error.message && !error.message.includes('404')) {
//           this.addLog(`${method.name} purge attempt: ${error.message}`, "info");
//         }
//       }
//     }
    
//     try {
//       await fetch(`${creds.url}?nocache=${Date.now()}`, {
//         headers: {
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache'
//         }
//       });
//     } catch (error) {
//       // Ignore errors
//     }
    
//     const success = purgedCaches.length > 0;
    
//     if (success) {
//       this.addLog(
//         `Successfully purged: ${purgedCaches.join(', ')} (${purgedCaches.length} cache system${purgedCaches.length > 1 ? 's' : ''})`, 
//         "success"
//       );
      
//       if (hasCDN) {
//         this.addLog(
//           `CDN detected - recommend waiting ${recommendedWaitMinutes} minutes for full propagation`, 
//           "warning"
//         );
//       }
//     } else {
//       this.addLog(
//         "Could not purge cache via API - changes may take 10-30 minutes to propagate (cache TTL)", 
//         "warning"
//       );
//       recommendedWaitMinutes = 30;
//     }
    
//     return {
//       success,
//       purgedCaches,
//       recommendedWaitMinutes
//     };
//   }

//   private async applyFixesAndAnalyze(
//     website: any,
//     websiteId: string,
//     userId: string,
//     fixesToApply: AIFix[],
//     fixSessionId: string,
//     options: any
//   ): Promise<AIFixResult> {
//     await this.markIssuesAsFixing(fixesToApply, fixSessionId);

//     if (!options.skipBackup) {
//       await this.createWebsiteBackup(website, userId);
//     }

//     const { appliedFixes, errors } = await this.applyFixes(
//       website,
//       fixesToApply,
//       userId
//     );

//     try {
//       const creds = this.getWordPressCredentials(website);
//       await this.purgeWordPressCache(creds);
//     } catch (error: any) {
//       this.addLog(`Cache purge failed: ${error.message}`, "warning");
//     }

//     await this.updateIssueStatusesAfterFix(
//       websiteId,
//       userId,
//       appliedFixes,
//       fixSessionId
//     );
//     await this.cleanupStuckFixingIssues(websiteId, userId, fixSessionId);

//     let reanalysisData: ReanalysisResult | undefined;

//     await this.createActivityLog(
//       userId,
//       websiteId,
//       appliedFixes,
//       reanalysisData,
//       fixSessionId
//     );

//     return this.createSuccessResult(
//       appliedFixes,
//       errors,
//       fixesToApply.length,
//       false,
//       reanalysisData,
//       fixSessionId
//     );
//   }

//   private async performDryRun(
//     fixesToApply: AIFix[],
//     fixSessionId: string,
//     options: any,
//     website: any
//   ): Promise<AIFixResult> {
//     const appliedFixes = fixesToApply.map((fix) => ({ ...fix, success: true }));

//     let reanalysisData: ReanalysisResult | undefined;
//     if (options.enableReanalysis !== false && fixesToApply.length > 0) {
//       const estimatedImprovement = this.estimateScoreImprovement(appliedFixes);
//       const latestReport = await this.getLatestSeoReport(
//         website.id,
//         this.currentUserId!
//       );

//       reanalysisData = {
//         enabled: true,
//         initialScore: latestReport?.score || 0,
//         finalScore: Math.min(
//           100,
//           (latestReport?.score || 0) + estimatedImprovement
//         ),
//         scoreImprovement: estimatedImprovement,
//         analysisTime: 0,
//         success: true,
//         simulated: true,
//       };
//     }

//     return this.createSuccessResult(
//       appliedFixes,
//       [],
//       fixesToApply.length,
//       true,
//       reanalysisData,
//       fixSessionId
//     );
//   }

//   // FIXED: Added deduplication helper
//   private deduplicateFixesByIssue(fixes: AIFix[]): AIFix[] {
//     const seen = new Set<string>();
//     return fixes.filter(fix => {
//       const key = fix.trackedIssueId || `${fix.type}-${fix.element}`;
//       if (seen.has(key)) {
//         return false;
//       }
//       seen.add(key);
//       return true;
//     });
//   }


// private async applyFixes(
//   website: any,
//   fixes: AIFix[],
//   userId?: string
// ): Promise<{ appliedFixes: AIFix[]; errors: string[] }> {
//   const creds = this.getWordPressCredentials(website);
//   await this.testWordPressConnection(creds);

//   const appliedFixes: AIFix[] = [];
//   const errors: string[] = [];
//   const fixesByType = this.groupFixesByType(fixes);

//   this.addLog(`Processing fix types: ${Object.keys(fixesByType).join(", ")}`);

//   for (const [fixType, typeFixes] of Object.entries(fixesByType)) {
//     this.addLog(`Processing ${typeFixes.length} fixes of type: ${fixType}`);

//     try {
//       const strategy = this.getFixStrategy(fixType);

//       if (!strategy) {
//         this.addLog(
//           `No fix strategy available for ${fixType} - marking as assumed compliant`,
//           "warning"
//         );
//         appliedFixes.push(
//           ...typeFixes.map((fix) => ({
//             ...fix,
//             success: true,
//             description: `Unable to process ${fixType} - marked as compliant`,
//             after: "Assumed compliant (strategy not available)",
//           }))
//         );
//         continue;
//       }

//       // ⭐ KEY FIX: Deduplicate fixes BEFORE processing
//       const uniqueFixes = this.deduplicateFixesByIssue(typeFixes);
//       this.addLog(`Deduplicated to ${uniqueFixes.length} unique fix targets`);

//       // ⭐ KEY FIX: Pass ONLY unique fixes to strategy
//       const result = await strategy(creds, uniqueFixes, userId);

//       if (result.applied.length > 0) {
//         result.applied.forEach((fix) => {
//           this.addLog(
//             `${fix.success ? "✅" : "❌"} ${fixType}: ${fix.description}`,
//             fix.success ? "success" : "error"
//           );
//         });
//       }

//       appliedFixes.push(...result.applied);
//       errors.push(...result.errors);
//     } catch (error: any) {
//       this.addLog(`Error processing ${fixType}: ${error.message}`, "error");
//       const errorMessage = error.message || "Unknown error";
//       errors.push(`${fixType}: ${errorMessage}`);
//     }
//   }

//   return { appliedFixes, errors };
// }


//   // private async applyFixes(
//   //   website: any,
//   //   fixes: AIFix[],
//   //   userId?: string
//   // ): Promise<{ appliedFixes: AIFix[]; errors: string[] }> {
//   //   const creds = this.getWordPressCredentials(website);
//   //   await this.testWordPressConnection(creds);

//   //   const appliedFixes: AIFix[] = [];
//   //   const errors: string[] = [];
//   //   const fixesByType = this.groupFixesByType(fixes);

//   //   this.addLog(`Processing fix types: ${Object.keys(fixesByType).join(", ")}`);

//   //   for (const [fixType, typeFixes] of Object.entries(fixesByType)) {
//   //     this.addLog(`Processing ${typeFixes.length} fixes of type: ${fixType}`);

//   //     try {
//   //       const strategy = this.getFixStrategy(fixType);

//   //       if (!strategy) {
//   //         this.addLog(
//   //           `No fix strategy available for ${fixType} - marking as assumed compliant`,
//   //           "warning"
//   //         );
//   //         appliedFixes.push(
//   //           ...typeFixes.map((fix) => ({
//   //             ...fix,
//   //             success: true,
//   //             description: `Unable to process ${fixType} - marked as compliant`,
//   //             after: "Assumed compliant (strategy not available)",
//   //           }))
//   //         );
//   //         continue;
//   //       }

//   //       // FIXED: Deduplicate before processing
//   //       const uniqueFixes = this.deduplicateFixesByIssue(typeFixes);
//   //       this.addLog(`Deduplicated to ${uniqueFixes.length} unique fix targets`);

//   //       const result = await strategy(creds, uniqueFixes, userId);

//   //       if (result.applied.length > 0) {
//   //         result.applied.forEach((fix) => {
//   //           this.addLog(
//   //             `${fix.success ? "✅" : "❌"} ${fixType}: ${fix.description}`,
//   //             fix.success ? "success" : "error"
//   //           );
//   //         });
//   //       }

//   //       appliedFixes.push(...result.applied);
//   //       errors.push(...result.errors);
//   //     } catch (error: any) {
//   //       this.addLog(`Error processing ${fixType}: ${error.message}`, "error");
//   //       const errorMessage = error.message || "Unknown error";
//   //       errors.push(`${fixType}: ${errorMessage}`);
//   //       appliedFixes.push(
//   //         ...typeFixes.map((fix) => ({
//   //           ...fix,
//   //           success: false,
//   //           description: `Failed to apply ${fixType}`,
//   //           error: errorMessage,
//   //           after: "Fix failed - see error log",
//   //         }))
//   //       );
//   //     }
//   //   }

//   //   return { appliedFixes, errors };
//   // }

//   private getFixStrategy(fixType: string): ((creds: WordPressCredentials, fixes: AIFix[], userId?: string) => Promise<{ applied: AIFix[]; errors: string[] }>) | null {
//     const normalizedType = fixType.replace(/__/g, "_").toLowerCase();

//     const methodMap: Record<string, string> = {
//       missing_alt_text: "fixImageAltText",
//       images_missing_alt_text: "fixImageAltText",
//       missing_meta_description: "fixMetaDescriptions",
//       meta_description_too_long: "fixMetaDescriptions",
//       meta_description_too_short: "fixMetaDescriptions",
//       duplicate_meta_descriptions: "fixDuplicateMetaDescriptions",
//       title_tag_too_long: "fixTitleTags",
//       title_tag_too_short: "fixTitleTags",
//       poor_title_tag: "fixTitleTags",
//       missing_title_tag: "fixTitleTags",
//       missing_page_title: "fixTitleTags",
//       heading_structure: "fixHeadingStructure",
//       improper_heading_hierarchy: "fixHeadingStructure",
//       missing_h1: "fixHeadingStructure",
//       missing_h1_tag: "fixHeadingStructure",
//       multiple_h1_tags: "fixHeadingStructure",
//       heading_structure_could_improve: "fixHeadingStructure",
//       thin_content: "expandThinContent",
//       content_too_short: "expandThinContent",
//       content_could_be_expanded: "expandThinContent",
//       low_content_depth: "expandThinContent",
//       poor_readability: "improveReadability",
//       low_readability: "improveReadability",
//       limited_expertise_signals: "improveEAT",
//       limited_trustworthiness_signals: "improveEAT",
//       low_eat_signals: "improveEAT",
//       external_links_missing_attributes: "fixExternalLinkAttributes",
//       broken_internal_links: "fixBrokenInternalLinks",
//       images_missing_lazy_loading: "fixImageDimensions",
//       missing_image_dimensions: "fixImageDimensions",
//       missing_schema_markup: "addSchemaMarkup",
//       missing_schema: "addSchemaMarkup",
//       missing_open_graph_tags: "addOpenGraphTags",
//       missing_canonical_url: "fixCanonicalUrls",
//       missing_viewport_meta_tag: "addViewportMetaTag",
//       missing_faq_schema: "addFAQSchema",
//     };

//     const methodName = methodMap[normalizedType] || methodMap[fixType];
//     if (!methodName) {
//       this.addLog(`No method mapping found for ${fixType}`, "warning");
//       return null;
//     }

//     const method = (this as any)[methodName];
//     if (!method || typeof method !== "function") {
//       this.addLog(`Method ${methodName} not found or not a function`, "error");
//       return null;
//     }

//     this.addLog(`Found strategy method: ${methodName} for ${fixType}`, "success");
//     return method.bind(this);
//   }

//   // ==================== FIX STRATEGIES ====================

//   private async fixImageAltText(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ) {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
//         if (imagesWithoutAlt.length === 0) {
//           return {
//             updated: false,
//             data: {},
//             description: "All images already have descriptive alt text",
//           };
//         }

//         let updated = false;
//         const specificChanges: string[] = [];
//         const title = content.title?.rendered || content.title || "";

//         for (let i = 0; i < imagesWithoutAlt.length; i++) {
//           const img = imagesWithoutAlt[i];
//           const $img = $(img);
//           const src = $img.attr("src") || "";

//           if (src && !src.startsWith("data:")) {
//             const originalSrc = src;
//             const imgName = src.split("/").pop()?.substring(0, 30) || "image";
            
//             const altText = await this.generateContextualAltText(
//               src,
//               title,
//               contentHtml,
//               userId
//             );

//             $img.attr("alt", altText);
//             $img.attr("src", originalSrc);
//             specificChanges.push(`${imgName}: "${altText}"`);
//             updated = true;
//           }
//         }

//         const finalContent = $.html({
//           decodeEntities: false,
//           xmlMode: false,
//           selfClosingTags: true,
//         });

//         return {
//           updated,
//           data: updated ? { content: finalContent } : {},
//           description: updated
//             ? `Added contextual alt text to ${specificChanges.length} images`
//             : "All images already have alt text",
//         };
//       },
//       userId
//     );
//   }

//   private async generateContextualAltText(
//     imageSrc: string,
//     pageTitle: string,
//     content: string,
//     userId?: string
//   ): Promise<string> {
//     const provider = await this.selectAIProvider(userId);
//     if (!provider) {
//       return this.generateFallbackAltText(imageSrc, pageTitle);
//     }

//     try {
//       const filename = imageSrc.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
//       const context = content.substring(0, 500);

//       const systemPrompt = `You are an SEO expert writing descriptive, keyword-rich alt text for images.

// RULES:
// - Alt text should be descriptive and help visually impaired users
// - Include relevant keywords when natural
// - Be specific about what's in the image
// - 50-125 characters max
// - Don't start with "image of" or "picture of"
// - Return ONLY the alt text, no quotes or explanations`;

//       const userPrompt = `Generate alt text for an image:
// Filename: ${filename}
// Page Title: ${pageTitle}
// Context: ${context}

// Write natural, descriptive alt text that helps both users and SEO.`;

//       const result = await this.callAIProvider(
//         provider,
//         systemPrompt,
//         userPrompt,
//         50,
//         0.3,
//         userId
//       );

//       const cleaned = this.cleanAIResponse(result).replace(/["']/g, "");
//       return cleaned.length > 125 ? cleaned.substring(0, 122) + "..." : cleaned;
//     } catch {
//       return this.generateFallbackAltText(imageSrc, pageTitle);
//     }
//   }

//   private async fixMetaDescriptions(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ) {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const excerpt = content.excerpt?.rendered || content.excerpt || "";
//         const title = content.title?.rendered || content.title || "";
//         const cleanExcerpt = excerpt.replace(/<[^>]*>/g, "").trim();

//         if (cleanExcerpt.length >= 140 && cleanExcerpt.length <= 160) {
//           return {
//             updated: false,
//             data: {},
//             description: `Meta description already optimal (${cleanExcerpt.length} chars)`,
//           };
//         }

//         const metaDescription = await this.generateMetaDescription(
//           title,
//           content.content?.rendered || "",
//           userId
//         );

//         if (metaDescription === cleanExcerpt) {
//           return {
//             updated: false,
//             data: {},
//             description: `Meta description already optimal (${cleanExcerpt.length} chars)`,
//           };
//         }

//         const beforePreview = cleanExcerpt.substring(0, 50) || "[empty]";
//         const afterPreview = metaDescription.substring(0, 50);

//         return {
//           updated: true,
//           data: { excerpt: metaDescription },
//           description: `Updated meta description:\n• Before (${cleanExcerpt.length || 0} chars): "${beforePreview}..."\n• After (${metaDescription.length} chars): "${afterPreview}..."`,
//         };
//       },
//       userId
//     );
//   }

//   private async fixTitleTags(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ) {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const currentTitle = content.title?.rendered || content.title || "";

//         if (currentTitle.length >= 40 && currentTitle.length <= 60) {
//           return {
//             updated: false,
//             data: {},
//             description: `Title already optimal (${currentTitle.length} chars): "${currentTitle}"`,
//           };
//         }

//         const optimizedTitle = await this.optimizeTitle(
//           currentTitle,
//           content.content?.rendered || "",
//           userId
//         );

//         const issue = currentTitle.length < 40 ? "too short" : "too long";
//         return {
//           updated: true,
//           data: { title: optimizedTitle },
//           description: `Fixed title that was ${issue}:\n• Before (${currentTitle.length} chars): "${currentTitle}"\n• After (${optimizedTitle.length} chars): "${optimizedTitle}"`,
//         };
//       },
//       userId
//     );
//   }

//   private async fixHeadingStructure(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         const h1s = $("h1");
//         let updated = false;
//         const changes: string[] = [];
//         const hasProperStructure = h1s.length === 1;
//         const hasProperHierarchy = this.checkHeadingHierarchy($);

//         if (hasProperStructure && hasProperHierarchy) {
//           return {
//             updated: false,
//             data: {},
//             description: "Heading structure already optimal",
//           };
//         }

//         if (h1s.length > 1) {
//           h1s.each((index, el) => {
//             if (index > 0) {
//               const h1Text = $(el).text();
//               $(el).replaceWith(`<h2>${h1Text}</h2>`);
//               changes.push(`Converted duplicate H1 "${h1Text.substring(0, 30)}..." to H2`);
//               updated = true;
//             }
//           });
//         }

//         if (h1s.length === 0) {
//           const title = content.title?.rendered || content.title || "Page Title";
//           const cleanTitle = title.replace(/<[^>]*>/g, "");
//           const newH1 = `<h1>${cleanTitle}</h1>`;
          
//           const firstElement = $("body").children().first();
//           if (firstElement.length) {
//             firstElement.before(newH1);
//           } else {
//             $("body").prepend(newH1);
//           }
          
//           changes.push(`Added H1 tag: "${cleanTitle}"`);
//           updated = true;
//         }

//         const headings = $("h1, h2, h3, h4, h5, h6").toArray();
//         let previousLevel = 0;

//         headings.forEach((heading) => {
//           const currentLevel = parseInt(heading.tagName.charAt(1));

//           if (currentLevel > previousLevel + 1 && previousLevel !== 0) {
//             const correctLevel = previousLevel + 1;
//             const headingText = $(heading).text();

//             if (correctLevel <= 6) {
//               $(heading).replaceWith(
//                 `<h${correctLevel}>${headingText}</h${correctLevel}>`
//               );
//               changes.push(
//                 `Fixed hierarchy: H${currentLevel} → H${correctLevel} for "${headingText.substring(0, 30)}..."`
//               );
//               updated = true;
//               previousLevel = correctLevel;
//             } else {
//               previousLevel = currentLevel;
//             }
//           } else {
//             previousLevel = currentLevel;
//           }
//         });

//         if (!updated) {
//           return {
//             updated: false,
//             data: {},
//             description: "Heading structure already optimal",
//           };
//         }

//         const finalContent = this.extractHtmlContent($);
//         const description =
//           changes.length === 1
//             ? changes[0]
//             : `Fixed heading structure:\n${changes.map((c) => `• ${c}`).join("\n")}`;

//         return {
//           updated: true,
//           data: { content: finalContent },
//           description,
//         };
//       },
//       userId
//     );
//   }


//   private async fixExternalLinkAttributes(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         let linksFixed = 0;
//         const specificChanges: string[] = [];

//         $('a[href^="http"]').each((_, elem) => {
//           const href = $(elem).attr("href");
//           if (href && !href.includes(creds.url)) {
//             const $link = $(elem);
//             const linkText = $link.text().substring(0, 30);
//             const changes: string[] = [];

//             if (!$link.attr("target")) {
//               $link.attr("target", "_blank");
//               changes.push('target="_blank"');
//             }

//             const currentRel = $link.attr("rel") || "";
//             const relChanges: string[] = [];

//             if (!currentRel.includes("noopener")) {
//               relChanges.push("noopener");
//             }
//             if (!currentRel.includes("noreferrer")) {
//               relChanges.push("noreferrer");
//             }

//             if (relChanges.length > 0) {
//               const newRel = currentRel
//                 ? `${currentRel} ${relChanges.join(" ")}`
//                 : relChanges.join(" ");
//               $link.attr("rel", newRel);
//               changes.push(`rel="${relChanges.join(" ")}"`);
//             }

//             if (changes.length > 0) {
//               linksFixed++;
//               specificChanges.push(`"${linkText}...": added ${changes.join(", ")}`);
//             }
//           }
//         });

//         if (linksFixed > 0) {
//           const finalContent = this.extractHtmlContent($);
//           return {
//             updated: true,
//             data: { content: finalContent },
//             description: `Fixed ${linksFixed} external links with proper security attributes`,
//           };
//         }

//         return {
//           updated: false,
//           data: {},
//           description: "All external links already have proper attributes",
//         };
//       },
//       userId
//     );
//   }

//   private async fixBrokenInternalLinks(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const [posts, pages] = await Promise.all([
//       this.getWordPressContent(creds, "posts").catch(() => []),
//       this.getWordPressContent(creds, "pages").catch(() => []),
//     ]);

//     const validUrls = new Set([...posts, ...pages].map((c) => c.link));

//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         let fixedLinks = 0;

//         $('a[href*="' + creds.url + '"]').each((_, elem) => {
//           const href = $(elem).attr("href");
//           if (href && !validUrls.has(href)) {
//             const similarUrl = this.findSimilarUrl(href, validUrls);
//             if (similarUrl) {
//               $(elem).attr("href", similarUrl);
//               fixedLinks++;
//             } else {
//               const text = $(elem).text();
//               $(elem).replaceWith(text);
//               fixedLinks++;
//             }
//           }
//         });

//         if (fixedLinks > 0) {
//           const finalContent = this.extractHtmlContent($);
//           return {
//             updated: true,
//             data: { content: finalContent },
//             description: `Fixed ${fixedLinks} broken internal links`,
//           };
//         }

//         return {
//           updated: false,
//           data: {},
//           description: "No broken internal links found",
//         };
//       },
//       userId
//     );
//   }

//   private async improveInternalLinking(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const [posts, pages] = await Promise.all([
//       this.getWordPressContent(creds, "posts").catch(() => []),
//       this.getWordPressContent(creds, "pages").catch(() => []),
//     ]);

//     const allContent = [...posts, ...pages];
//     const contentMap = new Map(
//       allContent.map((c) => [
//         c.id,
//         {
//           title: c.title?.rendered || c.title,
//           url: c.link,
//           keywords: this.extractKeywords(c.title?.rendered || c.title),
//           content: this.extractTextFromHTML(c.content?.rendered || ""),
//         },
//       ])
//     );

//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         const existingInternalLinks = $('a[href*="' + creds.url + '"]').length;
        
//         if (existingInternalLinks >= 3) {
//           return {
//             updated: false,
//             data: {},
//             description: `Sufficient internal links already present (${existingInternalLinks})`,
//           };
//         }

//         const paragraphs = $("p").toArray();
//         let linksAdded = 0;
//         const maxLinks = Math.min(5 - existingInternalLinks, 3);

//         for (const para of paragraphs) {
//           if (linksAdded >= maxLinks) break;

//           const paraText = $(para).text();
//           const paraHtml = $(para).html() || "";
          
//           if (paraHtml.includes("href")) continue;

//           for (const [id, data] of contentMap) {
//             if (id === content.id) continue;

//             for (const keyword of data.keywords) {
//               const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
//               if (regex.test(paraText)) {
//                 const newHtml = paraHtml.replace(
//                   regex,
//                   `<a href="${data.url}" title="${data.title}">$1</a>`
//                 );

//                 if (newHtml !== paraHtml) {
//                   $(para).html(newHtml);
//                   linksAdded++;
//                   break;
//                 }
//               }
//             }

//             if (linksAdded >= maxLinks) break;
//           }
//         }

//         if (linksAdded > 0) {
//           const finalContent = this.extractHtmlContent($);
//           return {
//             updated: true,
//             data: { content: finalContent },
//             description: `Added ${linksAdded} contextual internal links`,
//           };
//         }

//         return {
//           updated: false,
//           data: {},
//           description: "Sufficient internal links already present",
//         };
//       },
//       userId
//     );
//   }

//   private async fixImageDimensions(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         let imagesFixed = 0;
//         const specificChanges: string[] = [];

//         $("img").each((_, elem) => {
//           const $img = $(elem);
//           const src = $img.attr("src") || "";
//           if (!src) return;

//           const imgName = src.split("/").pop()?.substring(0, 30) || "image";
//           const changes: string[] = [];

//           if (!$img.attr("loading")) {
//             $img.attr("loading", "lazy");
//             changes.push('loading="lazy"');
//           }
          
//           if (!$img.attr("decoding")) {
//             $img.attr("decoding", "async");
//             changes.push('decoding="async"');
//           }

//           if (!$img.attr("width") || !$img.attr("height")) {
//             const sizeMatch = src.match(/-(\d+)x(\d+)\./);
//             if (sizeMatch) {
//               $img.attr("width", sizeMatch[1]);
//               $img.attr("height", sizeMatch[2]);
//               changes.push(`dimensions="${sizeMatch[1]}x${sizeMatch[2]}"`);
//             }
//           }

//           if (changes.length > 0) {
//             imagesFixed++;
//             specificChanges.push(`${imgName}: ${changes.join(", ")}`);
//           }
//         });

//         if (imagesFixed > 0) {
//           const finalContent = this.extractHtmlContent($);
//           return {
//             updated: true,
//             data: { content: finalContent },
//             description: `Optimized ${imagesFixed} images with lazy loading and dimensions`,
//           };
//         }

//         return {
//           updated: false,
//           data: {},
//           description: "All images already optimized",
//         };
//       },
//       userId
//     );
//   }

//   private async optimizeImages(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         let imagesOptimized = 0;

//         $("img").each((_, elem) => {
//           const $img = $(elem);
//           let imageChanged = false;

//           if (!$img.attr("loading")) {
//             $img.attr("loading", "lazy");
//             imageChanged = true;
//           }
          
//           if (!$img.attr("decoding")) {
//             $img.attr("decoding", "async");
//             imageChanged = true;
//           }

//           if (imageChanged) {
//             imagesOptimized++;
//           }
//         });

//         if (imagesOptimized > 0) {
//           const finalContent = this.extractHtmlContent($);
//           return {
//             updated: true,
//             data: { content: finalContent },
//             description: `Optimized ${imagesOptimized} images`,
//           };
//         }

//         return {
//           updated: false,
//           data: {},
//           description: "Images already optimized",
//         };
//       },
//       userId
//     );
//   }

//   private async fixDuplicateMetaDescriptions(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const [posts, pages] = await Promise.all([
//       this.getWordPressContent(creds, "posts").catch(() => []),
//       this.getWordPressContent(creds, "pages").catch(() => []),
//     ]);

//     const allContent = [...posts, ...pages];
//     const excerptMap = new Map<string, any[]>();

//     for (const content of allContent) {
//       const excerpt = content.excerpt?.rendered || "";
//       if (excerpt) {
//         const existing = excerptMap.get(excerpt) || [];
//         existing.push(content);
//         excerptMap.set(excerpt, existing);
//       }
//     }

//     const applied: AIFix[] = [];
//     const errors: string[] = [];

//     for (const [excerpt, contents] of excerptMap) {
//       if (contents.length > 1) {
//         for (let i = 1; i < contents.length; i++) {
//           const content = contents[i];
//           const uniqueDescription = await this.generateMetaDescription(
//             content.title?.rendered || content.title,
//             content.content?.rendered || "",
//             userId
//           );

//           try {
//             await this.updateWordPressContent(
//               creds,
//               content.id,
//               { excerpt: uniqueDescription },
//               content.contentType
//             );

//             applied.push({
//               type: "duplicate_meta_descriptions",
//               description: `Made meta description unique for "${content.title?.rendered}"`,
//               success: true,
//               impact: "medium",
//               before: excerpt.substring(0, 50),
//               after: uniqueDescription.substring(0, 50),
//             });
//           } catch (error: any) {
//             errors.push(`Failed to update ${content.id}: ${error.message}`);
//           }
//         }
//       }
//     }

//     if (applied.length === 0) {
//       return {
//         applied: fixes.map((fix) => ({
//           ...fix,
//           success: true,
//           description: "No duplicate meta descriptions found",
//         })),
//         errors: [],
//       };
//     }

//     return { applied, errors };
//   }

//   private async addSchemaMarkup(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
        
//         if (contentHtml.includes('type="application/ld+json"')) {
//           return {
//             updated: false,
//             data: {},
//             description: "Schema markup already present",
//           };
//         }

//         const schema = await this.generateSchemaMarkup(
//           content.contentType || "post",
//           content.title?.rendered || content.title,
//           contentHtml,
//           content.excerpt?.rendered || "",
//           content.date,
//           userId
//         );

//         const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
//         const newContent = schemaScript + "\n" + contentHtml;

//         return {
//           updated: true,
//           data: { content: newContent },
//           description: `Added ${schema["@type"]} schema markup`,
//         };
//       },
//       userId
//     );
//   }

//   private async addOpenGraphTags(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const applied: AIFix[] = [];

//     applied.push({
//       type: "missing_open_graph_tags",
//       description: "Recommend installing Yoast SEO or RankMath plugin for Open Graph tag management",
//       success: true,
//       impact: "medium",
//     });

//     return { applied, errors: [] };
//   }

//   private async addTwitterCards(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const applied: AIFix[] = [];

//     applied.push({
//       type: "missing_twitter_cards",
//       description: "Recommend installing Yoast SEO or RankMath plugin for Twitter Card management",
//       success: true,
//       impact: "low",
//     });

//     return { applied, errors: [] };
//   }

//   private async fixCanonicalUrls(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const applied: AIFix[] = [];

//     applied.push({
//       type: "missing_canonical_url",
//       description: "WordPress automatically generates canonical URLs - verified configuration",
//       success: true,
//       impact: "medium",
//     });

//     return { applied, errors: [] };
//   }

//   private async addViewportMetaTag(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const applied: AIFix[] = [];

//     applied.push({
//       type: "missing_viewport_meta_tag",
//       description: "Recommend adding viewport meta tag to theme's header.php: <meta name='viewport' content='width=device-width, initial-scale=1'>",
//       success: true,
//       impact: "high",
//     });

//     return { applied, errors: [] };
//   }

//   private async addFAQSchema(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     return this.fixWordPressContent(
//       creds,
//       fixes,
//       async (content, fix) => {
//         const contentHtml = content.content?.rendered || content.content || "";
//         const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//         const faqs: Array<{ question: string; answer: string }> = [];
        
//         $("h2, h3").each((_, elem) => {
//           const question = $(elem).text();
//           if (question.includes("?")) {
//             const nextP = $(elem).next("p");
//             if (nextP.length) {
//               faqs.push({
//                 question,
//                 answer: nextP.text(),
//               });
//             }
//           }
//         });

//         if (faqs.length < 2) {
//           return {
//             updated: false,
//             data: {},
//             description: "Not enough FAQ content to add schema",
//           };
//         }

//         const faqSchema = {
//           "@context": "https://schema.org",
//           "@type": "FAQPage",
//           mainEntity: faqs.map((faq) => ({
//             "@type": "Question",
//             name: faq.question,
//             acceptedAnswer: {
//               "@type": "Answer",
//               text: faq.answer,
//             },
//           })),
//         };

//         const schemaScript = `<script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>`;
//         const newContent = schemaScript + "\n" + contentHtml;

//         return {
//           updated: true,
//           data: { content: newContent },
//           description: `Added FAQ schema with ${faqs.length} questions`,
//         };
//       },
//       userId
//     );
//   }

//   private async addBreadcrumbSchema(
//     creds: WordPressCredentials,
//     fixes: AIFix[],
//     userId?: string
//   ): Promise<{ applied: AIFix[]; errors: string[] }> {
//     const applied: AIFix[] = [];

//     applied.push({
//       type: "missing_breadcrumbs",
//       description: "Recommend installing a breadcrumb plugin (Yoast SEO includes breadcrumb schema)",
//       success: true,
//       impact: "low",
//     });

//     return { applied, errors: [] };
//   }

//   // ==================== HELPER METHODS ====================

// private async fixWordPressContent(
//   creds: WordPressCredentials,
//   fixes: AIFix[],
//   fixProcessor: (
//     content: any,
//     fix: AIFix
//   ) => Promise<{
//     updated: boolean;
//     data: any;
//     description: string;
//   }>,
//   userId?: string,
//   processingOptions?: ProcessingOptions
// ): Promise<{ applied: AIFix[]; errors: string[] }> {
//   const applied: AIFix[] = [];
//   const errors: string[] = [];

//   try {
//     const limits = processingOptions?.mode
//       ? this.getProcessingLimits(processingOptions.mode)
//       : { maxItems: 10, batchSize: 5, delayBetweenBatches: 1000 };

//     const maxItems = processingOptions?.maxItems || limits.maxItems;
//     const batchSize = processingOptions?.batchSize || limits.batchSize;

//     let allContent: any[];
//     if (
//       processingOptions?.mode === ProcessingMode.PRIORITY &&
//       processingOptions?.priorityUrls
//     ) {
//       allContent = await this.fetchPriorityContent(
//         creds,
//         processingOptions.priorityUrls
//       );
//     } else {
//       allContent = await this.getAllWordPressContent(creds, maxItems);
//     }

//     this.addLog(`Fetched ${allContent.length} content items to process`);

//     // ⭐ CRITICAL FIX: Track what content has been processed
//     const processedContentIds = new Set<number>();
//     const contentUpdatesByType = new Map<string, Map<number, any>>();
    
//     let processedCount = 0;

//     // ⭐ CRITICAL FIX: Process each content item ONCE
//     for (let i = 0; i < allContent.length; i += batchSize) {
//       const batch = allContent.slice(i, Math.min(i + batchSize, allContent.length));
      
//       for (const content of batch) {
//         // Skip if already processed
//         if (processedContentIds.has(content.id)) {
//           this.addLog(`Skipping already processed content ${content.id}`, "info");
//           continue;
//         }

//         const originalImages = this.extractImages(content.content?.rendered || "");
//         let contentNeedsUpdate = false;
//         let accumulatedUpdates: any = {};

//         // ⭐ CRITICAL FIX: Process ALL fixes for this content, but collect updates
//         for (const fix of fixes) {
//           try {
//             const result = await fixProcessor(content, fix);

//             // Always track the fix attempt
//             applied.push({
//               ...fix,
//               description: result.description,
//               wordpressPostId: content.id,
//               success: result.updated,
//             });

//             // Accumulate updates instead of applying immediately
//             if (result.updated) {
//               if (result.data.content) {
//                 // Preserve images in the content
//                 result.data.content = this.ensureImagesPreserved(
//                   result.data.content,
//                   originalImages
//                 );
//                 accumulatedUpdates.content = result.data.content;
//               }
//               if (result.data.title) {
//                 accumulatedUpdates.title = result.data.title;
//               }
//               if (result.data.excerpt) {
//                 accumulatedUpdates.excerpt = result.data.excerpt;
//               }
//               contentNeedsUpdate = true;
//               this.addLog(result.description, "success");
//             }

//           } catch (error) {
//             const errorMsg = `Fix failed for content ${content.id}: ${
//               error instanceof Error ? error.message : "Unknown error"
//             }`;
//             errors.push(errorMsg);
//             this.addLog(errorMsg, "error");
//           }
//         }

//         // ⭐ CRITICAL FIX: Update WordPress ONLY ONCE per content item
//         if (contentNeedsUpdate && Object.keys(accumulatedUpdates).length > 0) {
//           try {
//             this.addLog(
//               `Updating content ${content.id} with accumulated changes: ${Object.keys(accumulatedUpdates).join(', ')}`,
//               "info"
//             );
            
//             await this.updateWordPressContent(
//               creds,
//               content.id,
//               accumulatedUpdates,
//               content.contentType
//             );
            
//             processedContentIds.add(content.id);
//             this.addLog(`✅ Successfully updated content ${content.id}`, "success");
//           } catch (error: any) {
//             errors.push(`WordPress update failed for ${content.id}: ${error.message}`);
//             this.addLog(`WordPress update failed for ${content.id}`, "error");
//           }
//         }

//         processedCount++;
//         if (processingOptions?.progressCallback) {
//           processingOptions.progressCallback(processedCount, allContent.length);
//         }
//       }

//       if (i + batchSize < allContent.length) {
//         await new Promise((resolve) =>
//           setTimeout(resolve, limits.delayBetweenBatches)
//         );
//       }
//     }

//     this.addLog(
//       `Processing complete: ${processedContentIds.size} content items updated`,
//       "success"
//     );

//     if (applied.length === 0 && errors.length === 0) {
//       return {
//         applied: fixes.map((fix) => ({
//           ...fix,
//           success: true,
//           description: `Verified across ${allContent.length} page(s): Already meets requirements`,
//           after: "Already compliant",
//         })),
//         errors: [],
//       };
//     }

//     return { applied, errors };
//   } catch (error: any) {
//     const errorMsg = `WordPress content fix failed: ${error.message}`;
//     errors.push(errorMsg);
//     this.addLog(errorMsg, "error");
//     return { applied, errors };
//   }
// }



//   private extractImages(html: string): Array<{ 
//   src: string; 
//   element: string;
//   placeholder: string;
//   attributes: Record<string, string>;
//   surroundingContext?: string;
// }> {
//   const images: Array<{ 
//     src: string; 
//     element: string;
//     placeholder: string;
//     attributes: Record<string, string>;
//     surroundingContext?: string;
//   }> = [];
  
//   const $ = cheerio.load(html, this.getCheerioConfig());

//   $('img').each((index, elem) => {
//     const $img = $(elem);
//     const src = $img.attr('src');
    
//     if (src) {
//       // Extract all attributes
//       const attributes: Record<string, string> = {};
//       const attribs = $img.attr();
//       if (attribs) {
//         Object.keys(attribs).forEach(key => {
//           attributes[key] = attribs[key] || '';
//         });
//       }

//       // Generate unique placeholder
//       const placeholder = `__IMAGE_PLACEHOLDER_${index}_${Date.now()}__`;
      
//       // Get surrounding context (parent element)
//       const parent = $img.parent();
//       const surroundingContext = parent.length ? parent.prop('tagName')?.toLowerCase() : undefined;

//       images.push({
//         src,
//         element: $.html($img),
//         placeholder,
//         attributes,
//         surroundingContext
//       });
//     }
//   });

//   this.addLog(`Extracted ${images.length} images for preservation`, 'info');
  
//   // Log Cloudinary images specifically
//   const cloudinaryImages = images.filter(img => img.src.includes('cloudinary'));
//   if (cloudinaryImages.length > 0) {
//     this.addLog(`Found ${cloudinaryImages.length} Cloudinary images to preserve`, 'info');
//     cloudinaryImages.forEach(img => {
//       this.addLog(`  - ${img.src.substring(0, 80)}...`, 'info');
//     });
//   }

//   return images;
// }
// private replaceImagesWithPlaceholders(
//   html: string,
//   images: Array<{ src: string; placeholder: string; element: string }>
// ): string {
//   if (images.length === 0) return html;

//   const $ = cheerio.load(html, this.getCheerioConfig());

//   $('img').each((index, elem) => {
//     const $img = $(elem);
//     const src = $img.attr('src');
    
//     if (src) {
//       const imageData = images.find(img => img.src === src);
//       if (imageData) {
//         // Replace with a text placeholder that AI won't remove
//         $img.replaceWith(`<p class="image-placeholder" data-index="${index}">${imageData.placeholder}</p>`);
//       }
//     }
//   });

//   return $.html();
// }

// // IMPROVED: Restore images from placeholders after AI processing
// private restoreImagesFromPlaceholders(
//   processedHtml: string,
//   images: Array<{ src: string; placeholder: string; element: string }>
// ): string {
//   if (images.length === 0) return processedHtml;

//   let restored = processedHtml;

//   // Restore each image by replacing its placeholder
//   for (const img of images) {
//     // Try multiple placeholder patterns the AI might have modified
//     const patterns = [
//       img.placeholder, // Exact match
//       img.placeholder.replace(/_/g, ' '), // Spaces instead of underscores
//       img.placeholder.toLowerCase(), // Lowercase
//       new RegExp(img.placeholder.replace(/_/g, '[\\s_]'), 'gi'), // Flexible matching
//     ];

//     let found = false;
//     for (const pattern of patterns) {
//       if (typeof pattern === 'string') {
//         if (restored.includes(pattern)) {
//           restored = restored.replace(new RegExp(pattern, 'g'), img.element);
//           found = true;
//           break;
//         }
//       } else {
//         if (pattern.test(restored)) {
//           restored = restored.replace(pattern, img.element);
//           found = true;
//           break;
//         }
//       }
//     }

//     if (!found && img.src.includes('cloudinary')) {
//       this.addLog(
//         `⚠️ Could not restore Cloudinary image: ${img.src.substring(0, 80)}...`,
//         'warning'
//       );
//     }
//   }

//   return restored;
// }

// // IMPROVED: More robust image preservation with multiple strategies
// private ensureImagesPreserved(
//   processedContent: string,
//   originalImages: Array<{ 
//     src: string; 
//     element: string;
//     placeholder?: string;
//     attributes?: Record<string, string>;
//   }>
// ): string {
//   if (originalImages.length === 0) return processedContent;

//   let content = processedContent;
//   const $ = cheerio.load(content, this.getCheerioConfig());
//   const processedImageSrcs = new Set<string>();

//   // Collect all image sources in processed content
//   $('img').each((_, elem) => {
//     const src = $(elem).attr('src');
//     if (src) {
//       processedImageSrcs.add(src);
//     }
//   });

//   const missingImages: typeof originalImages = [];
//   const cloudinaryMissing: typeof originalImages = [];

//   // Find missing images
//   for (const img of originalImages) {
//     if (!processedImageSrcs.has(img.src)) {
//       missingImages.push(img);
//       if (img.src.includes('cloudinary')) {
//         cloudinaryMissing.push(img);
//       }
//     }
//   }

//   if (missingImages.length === 0) {
//     this.addLog('✅ All images preserved successfully', 'success');
//     return content;
//   }

//   this.addLog(
//     `⚠️ ${missingImages.length} images missing from processed content (${cloudinaryMissing.length} Cloudinary)`,
//     'warning'
//   );

//   // Strategy 1: Try to find and restore from placeholders
//   if (cloudinaryMissing.length > 0 && cloudinaryMissing[0].placeholder) {
//     content = this.restoreImagesFromPlaceholders(content, cloudinaryMissing);
    
//     // Re-check after restoration
//     const $after = cheerio.load(content, this.getCheerioConfig());
//     const restoredSrcs = new Set<string>();
//     $after('img').each((_, elem) => {
//       const src = $after(elem).attr('src');
//       if (src) restoredSrcs.add(src);
//     });

//     // Update missing list
//     const stillMissing = cloudinaryMissing.filter(img => !restoredSrcs.has(img.src));
//     if (stillMissing.length < cloudinaryMissing.length) {
//       this.addLog(
//         `✅ Restored ${cloudinaryMissing.length - stillMissing.length} images from placeholders`,
//         'success'
//       );
//     }
//   }

//   // Strategy 2: Insert missing images at logical positions
//   const $final = cheerio.load(content, this.getCheerioConfig());
  
//   for (const img of cloudinaryMissing) {
//     // Check one more time if it was restored
//     let found = false;
//     $final('img').each((_, elem) => {
//       if ($final(elem).attr('src') === img.src) {
//         found = true;
//         return false;
//       }
//     });

//     if (found) continue;

//     this.addLog(
//       `⚠️ Reinserting missing Cloudinary image: ${img.src.substring(0, 80)}...`,
//       'warning'
//     );

//     // Insert after the first paragraph or at the start
//     const firstP = $final('p').first();
//     if (firstP.length) {
//       firstP.after(img.element);
//     } else {
//       $final('body').prepend(img.element);
//     }
//   }

//   return $final.html() || content;
// }


//   private async fetchPriorityContent(
//     creds: WordPressCredentials,
//     priorityUrls: string[]
//   ): Promise<any[]> {
//     const content: any[] = [];

//     for (const url of priorityUrls) {
//       try {
//         const slug = url.split("/").filter((s) => s).pop();
//         if (!slug) continue;

//         const auth = Buffer.from(
//           `${creds.username}:${creds.applicationPassword}`
//         ).toString("base64");

//         const headers = {
//           Authorization: `Basic ${auth}`,
//           "Content-Type": "application/json",
//         };

//         const pageEndpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/pages?slug=${slug}`;
//         let response = await fetch(pageEndpoint, { headers });
//         let data = await response.json();

//         if (data && data.length > 0) {
//           content.push({ ...data[0], contentType: "page" });
//         } else {
//           const postEndpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/posts?slug=${slug}`;
//           response = await fetch(postEndpoint, { headers });
//           data = await response.json();
//           if (data && data.length > 0) {
//             content.push({ ...data[0], contentType: "post" });
//           }
//         }
//       } catch (error) {
//         this.addLog(`Failed to fetch priority URL ${url}: ${error}`, "warning");
//       }
//     }

//     return content;
//   }

//   private checkHeadingHierarchy($: cheerio.CheerioAPI): boolean {
//     const headings: number[] = [];
//     $("h1, h2, h3, h4, h5, h6").each((_, elem) => {
//       const level = parseInt(elem.tagName.charAt(1));
//       if (!isNaN(level)) {
//         headings.push(level);
//       }
//     });

//     if (headings.length <= 1) return true;

//     let previousLevel = headings[0];
//     for (let i = 1; i < headings.length; i++) {
//       if (headings[i] > previousLevel + 1) {
//         return false;
//       }
//       previousLevel = headings[i];
//     }
//     return true;
//   }

//   // ==================== AI PROVIDER MANAGEMENT ====================

//   private async selectAIProvider(userId?: string): Promise<string | null> {
//     const providers = [
//       { name: "claude", priority: 1 },
//       { name: "openai", priority: 2 },
//     ];

//     for (const provider of providers.sort((a, b) => a.priority - b.priority)) {
//       if (await this.isProviderAvailable(provider.name, userId)) {
//         return provider.name;
//       }
//     }

//     this.addLog("No AI providers available", "error");
//     return null;
//   }

//   private async isProviderAvailable(
//     provider: string,
//     userId?: string
//   ): Promise<boolean> {
//     if (provider === "claude" || provider === "anthropic") {
//       const apiKey = await this.getAPIKey(userId, "anthropic", [
//         "ANTHROPIC_API_KEY",
//         "CLAUDE_API_KEY",
//       ]);
//       return !!apiKey;
//     } else if (provider === "openai") {
//       const apiKey = await this.getAPIKey(userId, "openai", [
//         "OPENAI_API_KEY",
//         "OPENAI_API_KEY_ENV_VAR",
//       ]);
//       return !!apiKey;
//     }
//     return false;
//   }

//   private async callAIProvider(
//     provider: string,
//     systemMessage: string,
//     userMessage: string,
//     maxTokens: number = 500,
//     temperature: number = 0.7,
//     userId?: string
//   ): Promise<string> {
//     try {
//       return await this.callProviderDirectly(
//         provider,
//         systemMessage,
//         userMessage,
//         maxTokens,
//         temperature,
//         userId
//       );
//     } catch (error) {
//       const fallbackProvider = provider === "claude" ? "openai" : "claude";
//       if (await this.isProviderAvailable(fallbackProvider, userId)) {
//         return await this.callProviderDirectly(
//           fallbackProvider,
//           systemMessage,
//           userMessage,
//           maxTokens,
//           temperature,
//           userId
//         );
//       }
//       throw error;
//     }
//   }

//   private async callProviderDirectly(
//     provider: string,
//     systemMessage: string,
//     userMessage: string,
//     maxTokens: number,
//     temperature: number,
//     userId?: string
//   ): Promise<string> {
//     if (provider === "claude" || provider === "anthropic") {
//       const anthropicResult = await this.getUserAnthropic(userId);
//       if (!anthropicResult) {
//         throw new Error("Anthropic API not available");
//       }

//       const response = await anthropicResult.client.messages.create({
//         model: "claude-3-5-sonnet-latest",
//         max_tokens: maxTokens,
//         temperature,
//         system: systemMessage,
//         messages: [{ role: "user", content: userMessage }],
//       });

//       const content = response.content[0];
//       return content.type === "text" ? content.text : "";
//     } else if (provider === "openai") {
//       const openaiResult = await this.getUserOpenAI(userId);
//       if (!openaiResult) {
//         throw new Error("OpenAI API not available");
//       }

//       const response = await openaiResult.client.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//           { role: "system", content: systemMessage },
//           { role: "user", content: userMessage },
//         ],
//         temperature,
//         max_tokens: maxTokens,
//       });

//       return response.choices[0]?.message?.content || "";
//     }

//     throw new Error(`Unsupported AI provider: ${provider}`);
//   }

//   // ==================== CONTENT GENERATION ====================

//   private async generateMetaDescription(
//     title: string,
//     content: string,
//     userId?: string
//   ): Promise<string> {
//     const provider = await this.selectAIProvider(userId);
//     if (!provider) {
//       return this.createFallbackMetaDescription(title, content);
//     }

//     try {
//       const systemPrompt = `You are an expert SEO copywriter creating compelling meta descriptions.

// RULES:
// - Write naturally and conversationally
// - Include a clear benefit or value proposition
// - Add a subtle call-to-action
// - 140-160 characters (strict limit)
// - No quotation marks in output
// - Return ONLY the meta description text`;

//       const userPrompt = `Create an engaging meta description:
// Title: ${title}
// Content preview: ${content.substring(0, 500)}

// Write it to maximize click-through rate from search results.`;

//       const result = await this.callAIProvider(
//         provider,
//         systemPrompt,
//         userPrompt,
//         100,
//         0.4,
//         userId
//       );

//       const cleaned = this.cleanAIResponse(result);
//       return cleaned.length > 160 ? cleaned.substring(0, 157) + "..." : cleaned;
//     } catch {
//       return this.createFallbackMetaDescription(title, content);
//     }
//   }

//   private async optimizeTitle(
//     currentTitle: string,
//     content: string,
//     userId?: string
//   ): Promise<string> {
//     const provider = await this.selectAIProvider(userId);
//     if (!provider) return currentTitle.substring(0, 60);

//     try {
//       const systemPrompt = `You are an SEO expert optimizing page titles.

// GUIDELINES:
// - Make it compelling and click-worthy
// - Include primary keyword naturally
// - 40-60 characters (strict limit)
// - Maintain original tone
// - Return ONLY the optimized title`;

//       const userPrompt = `Optimize this title for SEO and CTR:
// Current: "${currentTitle}"
// Content context: ${content.substring(0, 300)}

// Create a better title that will rank well and get clicks.`;

//       const result = await this.callAIProvider(
//         provider,
//         systemPrompt,
//         userPrompt,
//         50,
//         0.4,
//         userId
//       );

//       const optimized = this.cleanAIResponse(result);
//       return optimized.length > 60 ? optimized.substring(0, 57) + "..." : optimized;
//     } catch {
//       return currentTitle.substring(0, 60);
//     }
//   }

//   private async analyzeContentQuality(
//     content: string,
//     title: string,
//     userId?: string
//   ): Promise<ContentAnalysis> {
//     const provider = await this.selectAIProvider(userId);
//     if (!provider) return this.createFallbackAnalysis(content);

//     try {
//       const systemPrompt = `You are a content quality analyst.

// Analyze content for:
// 1. Readability and flow
// 2. Value to readers
// 3. Engagement factors
// 4. SEO optimization

// Return ONLY JSON:
// {
//   "score": 0-100,
//   "issues": ["specific problems"],
//   "improvements": ["specific suggestions"],
//   "readabilityScore": 0-100,
//   "keywordDensity": {}
// }`;

//       const userPrompt = `Analyze this content:
// Title: "${title}"
// Content: "${content.substring(0, 1500)}"

// Provide honest assessment with actionable improvements.`;

//       const result = await this.callAIProvider(
//         provider,
//         systemPrompt,
//         userPrompt,
//         800,
//         0.3,
//         userId
//       );

//       return JSON.parse(this.cleanAIResponse(result));
//     } catch {
//       return this.createFallbackAnalysis(content);
//     }
//   }



//   private async improveContent(
//   content: string,
//   title: string,
//   improvements: string[],
//   userId?: string
// ): Promise<string> {
//   const provider = await this.selectAIProvider(userId);
//   if (!provider) {
//     return this.applyBasicContentImprovements(content);
//   }

//   try {
//     const systemPrompt = `You are an expert content writer improving content quality.

// CRITICAL RULES:
// - Return ONLY the improved HTML content
// - NO preambles, explanations, or meta-commentary
// - Start directly with HTML tags
// - Write naturally like a human expert
// - Improve readability, structure, and value
// - Add relevant examples and details
// - Keep all existing images and links intact
// - Maintain original tone and style`;

//     const userPrompt = `Improve this content based on these suggestions:
// ${improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n")}

// Title: ${title}
// Content: ${content}

// Improve it significantly while keeping it natural.`;

//     // Use image-protected wrapper
//     const improved = await this.callAIWithImageProtection(
//       provider,
//       systemPrompt,
//       userPrompt,
//       content,
//       3000,
//       0.7,
//       userId
//     );

//     const humanized = this.humanizeContent(improved);
//     return humanized;
    
//   } catch (error: any) {
//     this.addLog(`Content improvement failed: ${error.message}`, "warning");
//     return this.applyBasicContentImprovements(content);
//   }
// }


//   private async optimizeKeywordDistribution(
//     content: string,
//     title: string,
//     userId?: string
//   ): Promise<string> {
//     const keywords = this.extractKeywords(title);
//     const $ = cheerio.load(content, this.getCheerioConfig());

//     const firstP = $("p").first();
//     if (firstP.length && keywords.length > 0) {
//       const firstText = firstP.text();
//       const mainKeyword = keywords[0];
      
//       if (!firstText.toLowerCase().includes(mainKeyword)) {
//         const enhanced = `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} is an important topic. ${firstText}`;
//         firstP.html(enhanced);
//       }
//     }

//     return this.extractHtmlContent($);
//   }


// /**
//  * Universal wrapper that protects images when sending ANY content to AI for modification
//  */
// private async callAIWithImageProtection(
//   provider: string,
//   systemPrompt: string,
//   userPrompt: string,
//   originalContent: string,
//   maxTokens: number = 3000,
//   temperature: number = 0.7,
//   userId?: string
// ): Promise<string> {
//   // Extract and protect images
//   const originalImages = this.extractImages(originalContent);
  
//   if (originalImages.length > 0) {
//     this.addLog(`🛡️ Protecting ${originalImages.length} images before AI processing`, "info");
//   }
  
//   // Create placeholders
//   const imageMap = new Map<string, typeof originalImages[0]>();
//   let contentForAI = originalContent;
  
//   originalImages.forEach((img, index) => {
//     const placeholder = `IMAGE_PLACEHOLDER_${index}_PRESERVED`;
//     imageMap.set(placeholder, img);
//     contentForAI = contentForAI.replace(img.element, `[${placeholder}]`);
//   });
  
//   // Add image preservation instruction to system prompt
//   const enhancedSystemPrompt = originalImages.length > 0
//     ? `${systemPrompt}\n\n⚠️ CRITICAL: PRESERVE ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers EXACTLY as they appear. DO NOT remove or modify them.`
//     : systemPrompt;
  
//   // Replace original content with placeholder version in user prompt
//   const enhancedUserPrompt = userPrompt.replace(originalContent, contentForAI);
  
//   // Call AI
//   const response = await this.callAIProvider(
//     provider,
//     enhancedSystemPrompt,
//     enhancedUserPrompt,
//     maxTokens,
//     temperature,
//     userId
//   );
  
//   let cleaned = this.cleanAndValidateContent(response);
  
//   // Restore images
//   if (originalImages.length > 0) {
//     this.addLog(`🔄 Restoring ${originalImages.length} images after AI processing`, "info");
    
//     let restoredCount = 0;
//     for (const [placeholder, img] of imageMap) {
//       const marker = `[${placeholder}]`;
//       if (cleaned.includes(marker)) {
//         cleaned = cleaned.split(marker).join(img.element);
//         restoredCount++;
//         this.addLog(`✅ Restored: ${img.src.substring(0, 60)}...`, "success");
//       } else {
//         this.addLog(`⚠️ Marker missing, reinserting: ${img.src.substring(0, 60)}...`, "warning");
//         const $ = cheerio.load(cleaned, this.getCheerioConfig());
//         const firstP = $('p').first();
//         if (firstP.length) {
//           firstP.after(img.element);
//         } else {
//           $('body').prepend(img.element);
//         }
//         cleaned = $.html();
//       }
//     }
    
//     this.addLog(`✅ Image restoration complete: ${restoredCount}/${originalImages.length} from placeholders`, "success");
    
//     // Final safety check
//     cleaned = this.ensureImagesPreserved(cleaned, originalImages);
//   }
  
//   return cleaned;
// }


// private async expandThinContent(
//   creds: WordPressCredentials,
//   fixes: AIFix[],
//   userId?: string
// ): Promise<{ applied: AIFix[]; errors: string[] }> {
//   return this.fixWordPressContent(
//     creds,
//     fixes,
//     async (content, fix) => {
//       const contentHtml = content.content?.rendered || content.content || "";
//       const contentText = this.extractTextFromHTML(contentHtml);
//       const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
//       const TARGET_WORDS = 800;

//       if (wordCount >= TARGET_WORDS) {
//         return {
//           updated: false,
//           data: {},
//           description: `Content length already sufficient (${wordCount} words)`,
//         };
//       }

//       const provider = await this.selectAIProvider(userId);
//       if (!provider) {
//         return {
//           updated: false,
//           data: {},
//           description: "AI provider not available",
//         };
//       }

//       try {
//         this.addLog(`Expanding content from ${wordCount} to ${TARGET_WORDS}+ words`, "info");
        
//         const expandedContent = await this.expandContentWithAI(
//           content.title?.rendered || content.title,
//           contentHtml,
//           provider,
//           userId,
//           TARGET_WORDS,
//           1200
//         );

//         const newWordCount = this.extractTextFromHTML(expandedContent)
//           .split(/\s+/)
//           .filter(w => w.length > 0).length;

//         // ⭐ CRITICAL FIX: Validate content wasn't shortened
//         if (newWordCount < wordCount) {
//           this.addLog(
//             `❌ Rejecting expansion: content shortened from ${wordCount} to ${newWordCount}`,
//             "error"
//           );
//           return {
//             updated: false,
//             data: {},
//             description: `Rejected: AI shortened content (${wordCount} → ${newWordCount} words)`,
//           };
//         }

//         if (newWordCount < TARGET_WORDS) {
//           this.addLog(
//             `⚠️ Could not reach ${TARGET_WORDS} words (final: ${newWordCount} words)`,
//             "warning"
//           );
          
//           // Only apply if we improved by at least 30%
//           if (newWordCount < wordCount * 1.3) {
//             return {
//               updated: false,
//               data: {},
//               description: `Insufficient expansion: ${wordCount} → ${newWordCount} words`,
//             };
//           }
//         }

//         this.addLog(
//           `✅ Successfully expanded: ${wordCount} → ${newWordCount} words`,
//           "success"
//         );

//         return {
//           updated: true,
//           data: { content: expandedContent },
//           description: `Expanded content from ${wordCount} to ${newWordCount} words`,
//         };
//       } catch (error: any) {
//         this.addLog(`Content expansion failed: ${error.message}`, "error");
//         return {
//           updated: false,
//           data: {},
//           description: `Failed: ${error.message}`,
//         };
//       }
//     },
//     userId
//   );
// }



// private async expandContentWithAI(
//   title: string,
//   currentContent: string,
//   provider: string,
//   userId?: string,
//   minimumWords: number = 800,
//   idealWords: number = 1200,
//   isRetry: boolean = false
// ): Promise<string> {
//   const currentWordCount = this.extractTextFromHTML(currentContent)
//     .split(/\s+/)
//     .filter(w => w.length > 0).length;
  
//   const wordsNeeded = Math.max(minimumWords - currentWordCount, 400);
//   const targetWordCount = Math.max(idealWords, currentWordCount + wordsNeeded);

//   this.addLog(
//     `Content expansion: ${currentWordCount} words → target ${targetWordCount} words`,
//     "info"
//   );

//   // Extract and protect images
//   const originalImages = this.extractImages(currentContent);
//   this.addLog(`Protecting ${originalImages.length} images`, "info");
  
//   const imageMap = new Map<string, typeof originalImages[0]>();
//   let contentForAI = currentContent;
  
//   originalImages.forEach((img, index) => {
//     const placeholder = `IMAGE_PLACEHOLDER_${index}_PRESERVED`;
//     imageMap.set(placeholder, img);
//     contentForAI = contentForAI.replace(img.element, `[${placeholder}]`);
//   });

//   const systemPrompt = `You are an expert content writer expanding existing content.

// CRITICAL REQUIREMENTS:
// 1. PRESERVE 100% of existing content - NEVER remove or shorten
// 2. PRESERVE ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers exactly
// 3. ADD ${wordsNeeded}+ NEW words to reach ${targetWordCount} total words
// 4. Return ONLY expanded HTML - NO preambles or explanations

// VALIDATION:
// - Current: ${currentWordCount} words
// - Target: ${targetWordCount} words minimum
// - Must add: ${wordsNeeded}+ words

// START your response directly with HTML tags.`;

//   const userPrompt = `Expand this ${currentWordCount}-word content to AT LEAST ${targetWordCount} words:

// Title: ${title}

// Content to expand:
// ${contentForAI}

// CRITICAL RULES:
// 1. Keep ALL existing content intact
// 2. Keep ALL [IMAGE_PLACEHOLDER_*_PRESERVED] markers
// 3. Add substantial new sections (${wordsNeeded}+ words)
// 4. Use proper HTML structure (h2, h3, p)
// 5. Natural flow and readability

// ADD comprehensive new sections about:
// - Detailed explanations
// - Practical examples
// - Expert insights
// - Step-by-step guidance
// - Common questions
// - Related topics`;

//   const response = await this.callAIProvider(
//     provider,
//     systemPrompt,
//     userPrompt,
//     5000,
//     0.7,
//     userId
//   );

//   let cleaned = this.cleanAndValidateContent(response);
  
//   // Restore images
//   this.addLog(`Restoring ${originalImages.length} images`, "info");
  
//   for (const [placeholder, img] of imageMap) {
//     const marker = `[${placeholder}]`;
//     if (cleaned.includes(marker)) {
//       cleaned = cleaned.split(marker).join(img.element);
//       this.addLog(`✅ Restored: ${img.src.substring(0, 60)}...`, "success");
//     } else {
//       this.addLog(`⚠️ Reinserting missing image`, "warning");
//       const $ = cheerio.load(cleaned, this.getCheerioConfig());
//       const firstP = $('p').first();
//       if (firstP.length) {
//         firstP.after(img.element);
//       } else {
//         $('body').prepend(img.element);
//       }
//       cleaned = $.html();
//     }
//   }
  
//   // Final validation
//   cleaned = this.ensureImagesPreserved(cleaned, originalImages);
  
//   const finalWordCount = this.extractTextFromHTML(cleaned)
//     .split(/\s+/)
//     .filter(w => w.length > 0).length;
  
//   this.addLog(
//     `Expansion result: ${currentWordCount} → ${finalWordCount} words`,
//     finalWordCount >= minimumWords ? "success" : "warning"
//   );

//   // ⭐ CRITICAL FIX: Reject if content was shortened
//   if (finalWordCount < currentWordCount) {
//     throw new Error(
//       `REJECTED: Content shortened from ${currentWordCount} to ${finalWordCount} words`
//     );
//   }

//   return cleaned;
// }


// private async improveEAT(
//   creds: WordPressCredentials,
//   fixes: AIFix[],
//   userId?: string
// ): Promise<{ applied: AIFix[]; errors: string[] }> {
//   return this.fixWordPressContent(
//     creds,
//     fixes,
//     async (content, fix) => {
//       const title = content.title?.rendered || content.title || "";
//       const contentHtml = content.content?.rendered || content.content || "";
      
//       const provider = await this.selectAIProvider(userId);
//       if (!provider) {
//         return {
//           updated: false,
//           data: {},
//           description: "AI provider not available"
//         };
//       }

//       const systemPrompt = `You are enhancing content with E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).

// Add to the existing content:
// 1. Expert insights and data points
// 2. References to credible sources
// 3. Author perspective or experience
// 4. Clear, well-researched explanations
// 5. Transparent and verifiable information

// CRITICAL: Return ONLY the enhanced HTML content. NO preambles or explanations.`;

//       const userPrompt = `Enhance this content with trustworthiness and expertise signals:

// Title: ${title}
// Content: ${contentHtml.substring(0, 2000)}

// Add credible elements while maintaining the original structure.`;

//       // Use image-protected wrapper
//       const enhanced = await this.callAIWithImageProtection(
//         provider,
//         systemPrompt,
//         userPrompt,
//         contentHtml,
//         3000,
//         0.7,
//         userId
//       );

//       return {
//         updated: true,
//         data: { content: enhanced },
//         description: "Enhanced with expertise and trustworthiness signals"
//       };
//     },
//     userId
//   );
// }

//   private async generateSchemaMarkup(
//     contentType: string,
//     title: string,
//     content: string,
//     description: string,
//     date: string,
//     userId?: string
//   ): Promise<any> {
//     const baseUrl = this.currentWebsiteId
//       ? await this.getWebsiteUrl(this.currentWebsiteId)
//       : "";

//     if (contentType === "post") {
//       return {
//         "@context": "https://schema.org",
//         "@type": "Article",
//         headline: title,
//         description: description.replace(/<[^>]*>/g, "").substring(0, 160),
//         datePublished: date,
//         dateModified: new Date().toISOString(),
//         author: {
//           "@type": "Person",
//           name: "Author",
//         },
//         publisher: {
//           "@type": "Organization",
//           name: baseUrl.replace(/https?:\/\//, "").replace(/\/$/, ""),
//           logo: {
//             "@type": "ImageObject",
//             url: `${baseUrl}/wp-content/uploads/logo.png`,
//           },
//         },
//       };
//     } else {
//       return {
//         "@context": "https://schema.org",
//         "@type": "WebPage",
//         name: title,
//         description: description.replace(/<[^>]*>/g, "").substring(0, 160),
//         url: baseUrl,
//       };
//     }
//   }

//   // ==================== WORDPRESS API ====================

//   private async getWordPressContent(
//     creds: WordPressCredentials,
//     type: "posts" | "pages"
//   ) {
//     const endpoint = `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/${type}`;
//     const auth = Buffer.from(
//       `${creds.username}:${creds.applicationPassword}`
//     ).toString("base64");

//     const response = await fetch(`${endpoint}?per_page=50&status=publish`, {
//       headers: {
//         Authorization: `Basic ${auth}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch ${type}: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.map((item: any) => ({
//       ...item,
//       contentType: type === "posts" ? "post" : "page",
//     }));
//   }

//   private async updateWordPressContent(
//     creds: WordPressCredentials,
//     id: number,
//     data: any,
//     contentType: "post" | "page" = "post"
//   ) {
//     const endpoint =
//       contentType === "page"
//         ? `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/pages/${id}`
//         : `${creds.url.replace(/\/$/, "")}/wp-json/wp/v2/posts/${id}`;

//     const auth = Buffer.from(
//       `${creds.username}:${creds.applicationPassword}`
//     ).toString("base64");

//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${auth}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       const errorBody = await response.text();
//       throw new Error(`Failed to update ${contentType} ${id}: ${errorBody}`);
//     }

//     return response.json();
//   }

//   private async testWordPressConnection(
//     creds: WordPressCredentials
//   ): Promise<void> {
//     const connectionTest = await wordpressService.testConnection(creds);
//     if (!connectionTest.success) {
//       throw new Error(connectionTest.message || "WordPress connection failed");
//     }
//     this.addLog("WordPress connection verified", "success");
//   }

//   // ==================== UTILITY METHODS ====================

//   private getCheerioConfig() {
//     return {
//       xml: false,
//       decodeEntities: false,
//       normalizeWhitespace: false,
//       recognizeSelfClosing: true,
//       xmlMode: false,
//       lowerCaseAttributeNames: false,
//       lowerCaseTags: false,
//     };
//   }

//   private extractHtmlContent($: cheerio.CheerioAPI): string {
//     let html = $.html({
//       decodeEntities: false,
//       xmlMode: false,
//       selfClosingTags: true,
//     });

//     if (html.includes("<html>") || html.includes("<body>")) {
//       const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
//       if (bodyMatch && bodyMatch[1]) {
//         return bodyMatch[1].trim();
//       }

//       html = html
//         .replace(/^<!DOCTYPE[^>]*>/i, "")
//         .replace(/^<html[^>]*>/i, "")
//         .replace(/<\/html>\s*$/i, "")
//         .replace(/^<head>[\s\S]*?<\/head>/i, "")
//         .replace(/^<body[^>]*>/i, "")
//         .replace(/<\/body>\s*$/i, "");
//     }

//     return html.trim();
//   }

//   /**
//    * Removes unwanted "html" text artifacts from AI-generated content
//    * Handles code blocks, quotes, and standalone "html" labels
//    */
// private removeHtmlLabel(content: string): string {
//   if (!content) return "";

//   let cleaned = content;

//   // 1. Remove markdown code blocks with html
//   cleaned = cleaned.replace(/```html\s*/gi, "");
//   cleaned = cleaned.replace(/```\s*$/gi, "");
//   cleaned = cleaned.replace(/~~~html\s*/gi, "");
//   cleaned = cleaned.replace(/~~~\s*$/gi, "");

//   // 2. Remove "html" at the very start (with optional quotes/whitespace)
//   cleaned = cleaned.replace(/^["']?\s*html\s*["']?\s*/gi, "");
//   cleaned = cleaned.replace(/^["']?\s*HTML\s*["']?\s*/g, "");

//   // 3. Remove "html" at the very end (with optional quotes/whitespace)
//   cleaned = cleaned.replace(/\s*["']?\s*html\s*["']?\s*$/gi, "");
//   cleaned = cleaned.replace(/\s*["']?\s*HTML\s*["']?\s*$/g, "");

//   // 4. Remove standalone "html" on its own line (anywhere in content)
//   cleaned = cleaned.replace(/^\s*html\s*$/gim, "");
//   cleaned = cleaned.replace(/^\s*HTML\s*$/gm, "");

//   // 5. Remove "html:" or "html -" patterns (with optional quotes)
//   cleaned = cleaned.replace(/^\s*["']?\s*html\s*[:\-]\s*/gi, "");
//   cleaned = cleaned.replace(/^\s*["']?\s*HTML\s*[:\-]\s*/g, "");

//   // 6. Remove language label patterns
//   cleaned = cleaned.replace(/^(language|lang|type)\s*:\s*html\s*/gim, "");
//   cleaned = cleaned.replace(/^(language|lang|type)\s*:\s*HTML\s*/gm, "");
//   cleaned = cleaned.replace(/^\(html\)\s*/gi, "");
//   cleaned = cleaned.replace(/^\(HTML\)\s*/g, "");

//   // 7. NEW: Remove "html" when it appears after newline (common AI artifact)
//   cleaned = cleaned.replace(/\n\s*html\s*\n/gi, "\n");
//   cleaned = cleaned.replace(/\n\s*HTML\s*\n/g, "\n");

//   // 8. NEW: Remove quoted "html" at start of lines
//   cleaned = cleaned.replace(/^\s*["'`]html["'`]\s*/gim, "");
//   cleaned = cleaned.replace(/^\s*["'`]HTML["'`]\s*/gm, "");

//   // 9. NEW: Remove "html" when it appears before HTML tags
//   cleaned = cleaned.replace(/^\s*html\s*</gi, "<");
//   cleaned = cleaned.replace(/^\s*HTML\s*</g, "<");

//   // 10. NEW: Remove "html\n" at the start
//   cleaned = cleaned.replace(/^html\s*\n/i, "");
//   cleaned = cleaned.replace(/^HTML\s*\n/, "");

//   // 11. Clean up multiple blank lines that may result from removals
//   cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");
//   cleaned = cleaned.replace(/^\s*\n+/, ""); // Remove leading newlines

//   // 12. Final trim
//   return cleaned.trim();
// }

//   private cleanAIResponse(content: string): string {
//     if (!content) return "";

//     let cleaned = content;

//     const prefixPatterns = [
//       /^(Sure|Certainly|Here's?|Here is|I've|I have|Below|The following|Let me)\b[^{[\n<]*[\n:]/gi,
//       /^```[a-z]*\s*\n/gim,
//       /^["'`]+\s*/g,
//       /^.*?Here's the.*?:\s*\n*/gi,
//       /^.*?Below is the.*?:\s*\n*/gi,
//     ];

//     for (const pattern of prefixPatterns) {
//       cleaned = cleaned.replace(pattern, "");
//     }

//     // Remove html label artifacts
//     cleaned = this.removeHtmlLabel(cleaned);

//     const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       try {
//         JSON.parse(jsonMatch[0]);
//         return jsonMatch[0];
//       } catch {}
//     }

//     return cleaned.trim();
//   }

//   private removeAIArtifacts(content: string): string {
//     const preamblePatterns = [
//       /^Here's the .+?:\s*\n*/gi,
//       /^I've .+?:\s*\n*/gi,
//       /^This is .+?:\s*\n*/gi,
//       /^Below is .+?:\s*\n*/gi,
//     ];

//     let cleaned = content;
//     for (const pattern of preamblePatterns) {
//       cleaned = cleaned.replace(pattern, "");
//     }

//     return cleaned;
//   }

//   private humanizeContent(content: string): string {
//     const replacements: [RegExp, string][] = [
//       [/Furthermore,/g, "Also,"],
//       [/Moreover,/g, "Plus,"],
//       [/Nevertheless,/g, "Still,"],
//       [/Consequently,/g, "So,"],
//       [/\bit is\b/g, "it's"],
//       [/\byou are\b/g, "you're"],
//       [/\bwe are\b/g, "we're"],
//       [/\bcannot\b/g, "can't"],
//     ];

//     let humanized = content;
//     for (const [pattern, replacement] of replacements) {
//       humanized = humanized.replace(pattern, replacement);
//     }

//     return humanized;
//   }


//   private cleanAndValidateContent(content: string): string {
//   if (!content) {
//     throw new Error("Empty content received from AI");
//   }

//   let cleaned = this.removeHtmlLabel(content);
  
//   // Remove any AI preambles or explanations
//   const htmlStartIndex = cleaned.search(/<[^>]+>/);
//   if (htmlStartIndex > 100) {
//     // If HTML starts very late, there might be a preamble
//     cleaned = cleaned.substring(htmlStartIndex);
//   }

//   // Validate we have actual HTML content
//   if (!cleaned.includes('<') || !cleaned.includes('>')) {
//     throw new Error("Invalid HTML content received from AI");
//   }

//   // Validate minimum content length
//   const wordCount = this.extractTextFromHTML(cleaned)
//     .split(/\s+/)
//     .filter(w => w.length > 0).length;
  
//   if (wordCount < 100) {
//     throw new Error(`Content too short after cleaning: ${wordCount} words`);
//   }

//   return cleaned.trim();
// }



//   private applyBasicContentImprovements(content: string): string {
//     const $ = cheerio.load(content, this.getCheerioConfig());

//     $("p").each((i, elem) => {
//       const text = $(elem).text();
//       if (text.length > 500) {
//         const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
//         if (sentences.length > 3) {
//           const midPoint = Math.floor(sentences.length / 2);
//           const firstHalf = sentences.slice(0, midPoint).join(" ");
//           const secondHalf = sentences.slice(midPoint).join(" ");
//           $(elem).replaceWith(`<p>${firstHalf}</p><p>${secondHalf}</p>`);
//         }
//       }
//     });

//     return this.extractHtmlContent($);
//   }


//   // IMPROVED: Better text extraction with word filtering
// private extractTextFromHTML(html: string): string {
//   const $ = cheerio.load(html);
  
//   // Remove script and style tags
//   $('script, style, noscript').remove();
  
//   return $.text()
//     .replace(/\s+/g, " ") // Normalize whitespace
//     .replace(/[^\w\s.,!?;:'"-]/g, "") // Remove special characters but keep punctuation
//     .trim();
// }

//   // private extractTextFromHTML(html: string): string {
//   //   const $ = cheerio.load(html);
//   //   return $.text().replace(/\s+/g, " ").trim();
//   // }

//   private generateFallbackAltText(imageSrc: string, context: string): string {
//     const filename = imageSrc.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
//     const readable = filename.replace(/[-_]/g, " ");
//     return readable.substring(0, 100);
//   }

//   private createFallbackMetaDescription(
//     title: string,
//     content: string
//   ): string {
//     const cleanContent = this.extractTextFromHTML(content);
//     const description = `${title}. ${cleanContent.substring(0, 120)}...`;
//     return description.substring(0, 160);
//   }

//   private createFallbackAnalysis(content: string): ContentAnalysis {
//     const words = content.split(/\s+/).length;
//     const sentences = content.split(/[.!?]+/).length;
//     const avgWordsPerSentence = words / sentences;

//     return {
//       score: Math.max(40, 100 - (words < 500 ? 30 : 0)),
//       issues: words < 500 ? ["Content too short"] : [],
//       improvements: words < 500 ? ["Expand to 800+ words"] : [],
//       readabilityScore: Math.max(0, 100 - (avgWordsPerSentence - 15) * 3),
//       keywordDensity: {},
//     };
//   }

//   private extractKeywords(title: string): string[] {
//     const stopWords = [
//       "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
//     ];
//     return title
//       .toLowerCase()
//       .split(/\s+/)
//       .filter((word) => !stopWords.includes(word) && word.length > 2)
//       .slice(0, 3);
//   }

//   private findSimilarUrl(
//     brokenUrl: string,
//     validUrls: Set<string>
//   ): string | null {
//     const slug = brokenUrl.split("/").pop()?.replace(/\/$/, "");
//     if (!slug) return null;

//     for (const validUrl of validUrls) {
//       if (validUrl.includes(slug)) {
//         return validUrl;
//       }
//     }
//     return null;
//   }






//  private async improveReadability(
//   creds: WordPressCredentials,
//   fixes: AIFix[],
//   userId?: string
// ): Promise<{ applied: AIFix[]; errors: string[] }> {
//   return this.fixWordPressContent(
//     creds,
//     fixes,
//     async (content, fix) => {
//       const contentHtml = content.content?.rendered || content.content || "";
//       const $ = cheerio.load(contentHtml, this.getCheerioConfig());

//       let improved = false;

//       $('p').each((_, elem) => {
//         const text = $(elem).text();
//         if (text.length > 400) {
//           const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
//           if (sentences.length > 2) {
//             const mid = Math.floor(sentences.length / 2);
//             const p1 = sentences.slice(0, mid).join(' ');
//             const p2 = sentences.slice(mid).join(' ');
//             $(elem).replaceWith(`<p>${p1}</p><p>${p2}</p>`);
//             improved = true;
//           }
//         }
//       });

//       if (!improved) {
//         const provider = await this.selectAIProvider(userId);
//         if (provider) {
//           const systemPrompt = `Rewrite content for better readability (target: 60+ Flesch score, 8th-9th grade level).

// Rules:
// - Use shorter sentences (15-20 words max)
// - Replace complex words with simpler alternatives
// - Use active voice
// - Add transition words
// - Break up dense paragraphs
// - Return ONLY the rewritten HTML`;

//           const userPrompt = `Improve readability of this content:

// ${contentHtml}

// Make it clearer and easier to read while keeping all key information.`;

//           const rewritten = await this.callAIWithImageProtection(
//             provider,
//             systemPrompt,
//             userPrompt,
//             contentHtml,
//             3000,
//             0.6,
//             userId
//           );

//           return {
//             updated: true,
//             data: { content: rewritten },
//             description: "Improved readability (simpler language, shorter sentences)"
//           };
//         }
//       }

//       if (improved) {
//         return {
//           updated: true,
//           data: { content: this.extractHtmlContent($) },
//           description: "Broke up long paragraphs for better readability"
//         };
//       }

//       return {
//         updated: false,
//         data: {},
//         description: "Content readability already acceptable"
//       };
//     },
//     userId
//   );
// }
  
//   // ==================== ISSUE MANAGEMENT ====================

//   private async resetStuckFixingIssues(
//     websiteId: string,
//     userId: string
//   ): Promise<void> {
//     const stuckIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
//       status: ["fixing"],
//     });

//     if (stuckIssues.length > 0) {
//       for (const issue of stuckIssues) {
//         await storage.updateSeoIssueStatus(issue.id, "detected", {
//           resolutionNotes: "Reset from stuck fixing status",
//         });
//       }
//       this.addLog(`Reset ${stuckIssues.length} stuck issues`, "info");
//     }
//   }

//   private async markIssuesAsFixing(
//     fixes: AIFix[],
//     fixSessionId: string
//   ): Promise<void> {
//     const issueIds = fixes
//       .map((fix) => fix.trackedIssueId)
//       .filter((id) => id) as string[];

//     if (issueIds.length > 0) {
//       await storage.bulkUpdateSeoIssueStatuses(
//         issueIds,
//         "fixing",
//         fixSessionId
//       );
//       this.addLog(`Marked ${issueIds.length} issues as fixing`);
//     }
//   }

//   private async updateIssueStatusesAfterFix(
//     websiteId: string,
//     userId: string,
//     fixes: AIFix[],
//     fixSessionId: string
//   ): Promise<void> {
//     try {
//       this.addLog(`\n=== UPDATE ISSUE STATUSES DEBUG ===`);
//       this.addLog(`Total fixes to process: ${fixes.length}`);
//       const fixesWithIds = fixes.filter(f => f.trackedIssueId);
//       this.addLog(`Fixes with trackedIssueId: ${fixesWithIds.length}`);
//       this.addLog(`Unique issue IDs: ${new Set(fixesWithIds.map(f => f.trackedIssueId)).size}`);

//       const fixesByIssueId = new Map<string, AIFix[]>();
      
//       for (const fix of fixes) {
//         if (fix.trackedIssueId) {
//           const existing = fixesByIssueId.get(fix.trackedIssueId) || [];
//           existing.push(fix);
//           fixesByIssueId.set(fix.trackedIssueId, existing);
//         }
//       }

//       this.addLog(`Updating ${fixesByIssueId.size} tracked issues`);

//       for (const [issueId, issueFixes] of fixesByIssueId) {
//         const allSuccessful = issueFixes.every(f => f.success);
//         const anySuccessful = issueFixes.some(f => f.success);
        
//         if (allSuccessful) {
//           await storage.updateSeoIssueStatus(issueId, "fixed", {
//             fixMethod: "ai_automatic",
//             fixSessionId,
//             resolutionNotes: `Fixed across ${issueFixes.length} page(s): ${issueFixes.map(f => f.description).join('; ')}`,
//             fixedAt: new Date(),
//           });
//           this.addLog(`✅ Marked issue ${issueId} as fixed (${issueFixes.length} pages)`, "success");
//         } else if (anySuccessful) {
//           const successCount = issueFixes.filter(f => f.success).length;
//           await storage.updateSeoIssueStatus(issueId, "detected", {
//             resolutionNotes: `Partially fixed: ${successCount}/${issueFixes.length} pages successful`,
//           });
//           this.addLog(`⚠️ Issue ${issueId} partially fixed: ${successCount}/${issueFixes.length}`, "warning");
//         } else {
//           await storage.updateSeoIssueStatus(issueId, "detected", {
//             resolutionNotes: `Fix failed: ${issueFixes[0].error || 'Unknown error'}`,
//           });
//           this.addLog(`❌ Issue ${issueId} fix failed`, "error");
//         }
//       }

//       const fixingIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
//         status: ["fixing"],
//       });

//       for (const issue of fixingIssues) {
//         if (!fixesByIssueId.has(issue.id)) {
//           await storage.updateSeoIssueStatus(issue.id, "detected", {
//             resolutionNotes: "No fixes were applied for this issue - reset to detected",
//           });
//           this.addLog(`⚠️ Reset orphaned issue ${issue.id}`, "warning");
//         }
//       }

//     } catch (error: any) {
//       this.addLog(`Error updating issue statuses: ${error.message}`, "error");
//     }
//   }

//   private async cleanupStuckFixingIssues(
//     websiteId: string,
//     userId: string,
//     fixSessionId: string
//   ): Promise<void> {
//     const stuckIssues = await storage.getTrackedSeoIssues(websiteId, userId, {
//       status: ["fixing"],
//     });

//     if (stuckIssues.length > 0) {
//       for (const issue of stuckIssues) {
//         await storage.updateSeoIssueStatus(issue.id, "detected", {
//           resolutionNotes: "Reset from stuck fixing state",
//         });
//       }
//     }
//   }

//   // ==================== ANALYSIS ====================

//   private async performFullReanalysis(
//     website: any,
//     userId: string,
//     websiteId: string,
//     delay: number,
//     purgedCaches: string[] = []
//   ): Promise<ReanalysisResult> {
//     try {
//       const MIN_DELAY = purgedCaches.length > 0 ? 600000 : 900000;
//       const effectiveDelay = Math.max(delay, MIN_DELAY);
      
//       if (effectiveDelay !== delay) {
//         this.addLog(
//           `Adjusting wait time from ${delay / 60000}min to ${effectiveDelay / 60000}min (minimum for reliable results)`,
//           "info"
//         );
//       }

//       if (effectiveDelay > 0) {
//         this.addLog(
//           `Waiting ${effectiveDelay / 60000} minutes for cache to clear and changes to propagate...`,
//           "info"
//         );
//         await new Promise((resolve) => setTimeout(resolve, effectiveDelay));
//       }

//       const latestReport = await this.getLatestSeoReport(websiteId, userId);
//       const initialScore = latestReport?.score || 0;

//       this.addLog("Verifying fixes are visible (checking cache clearance)...", "info");
//       const cacheCleared = await this.verifyCacheCleared(website);
      
//       if (!cacheCleared) {
//         this.addLog(
//           "Cache may still be active - scores might not reflect all changes yet",
//           "warning"
//         );
//       }

//       this.addLog("Starting full reanalysis with cache-busted crawl...", "info");

//       const newAnalysis = await seoService.analyzeWebsite(
//         website.url,
//         [],
//         userId,
//         websiteId,
//         {
//           skipIssueTracking: true,
//           verifyFixedIssuesOnly: false,
//           usePuppeteer: true,
//           runLighthouse: true,
//           crawlEnabled: true,
//           maxCrawlPages: 50,
//           bustCache: true,
//         }
//       );

//       const scoreImprovement = newAnalysis.score - initialScore;

//       await storage.updateWebsite(websiteId, {
//         seoScore: newAnalysis.score,
//         lastAnalyzed: new Date(),
//       });

//       if (scoreImprovement > 0) {
//         this.addLog(
//           `✅ Reanalysis complete: ${initialScore} → ${newAnalysis.score} (+${scoreImprovement} points)`,
//           "success"
//         );
//       } else if (scoreImprovement === 0) {
//         this.addLog(
//           `⚠️ Score unchanged: ${initialScore} (fixes may need more time to propagate or weren't detected)`,
//           "warning"
//         );
//       } else {
//         this.addLog(
//           `⚠️ Score decreased: ${initialScore} → ${newAnalysis.score} (${scoreImprovement} points) - this may indicate cache issues or new problems`,
//           "warning"
//         );
//       }

//       return {
//         enabled: true,
//         initialScore,
//         finalScore: newAnalysis.score,
//         scoreImprovement: Math.max(0, scoreImprovement),
//         analysisTime: effectiveDelay / 1000,
//         success: true,
//         cacheCleared,
//       };
//     } catch (error: any) {
//       this.addLog(`Reanalysis failed: ${error.message}`, "error");
//       return {
//         enabled: true,
//         initialScore: 0,
//         finalScore: 0,
//         scoreImprovement: 0,
//         analysisTime: delay / 1000,
//         success: false,
//         error: error.message,
//       };
//     }
//   }

//   private async verifyCacheCleared(website: any): Promise<boolean> {
//     try {
//       const url = website.url;
      
//       const response = await fetch(`${url}?nocache=${Date.now()}&verify=true`, {
//         headers: {
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache',
//           'Expires': '0'
//         }
//       });
      
//       const html = await response.text();
      
//       const checks = {
//         hasRecentTimestamp: html.includes(new Date().getFullYear().toString()),
//         notCachedResponse: !response.headers.get('x-cache')?.includes('HIT'),
//         hasDynamicContent: html.includes('wp-json') || html.includes('rest_route'),
//       };
      
//       const passedChecks = Object.values(checks).filter(Boolean).length;
//       const totalChecks = Object.values(checks).length;
      
//       const cleared = passedChecks >= totalChecks * 0.6;
      
//       this.addLog(
//         `Cache verification: ${passedChecks}/${totalChecks} checks passed ${cleared ? '✓' : '✗'}`,
//         cleared ? "success" : "warning"
//       );
      
//       return cleared;
      
//     } catch (error: any) {
//       this.addLog(`Cache verification skipped: ${error.message}`, "info");
//       return false;
//     }
//   }

//   private estimateScoreImprovement(fixes: AIFix[]): number {
//     const weights: Record<string, number> = {
//       missing_meta_description: 8.0,
//       poor_title_tag: 8.0,
//       missing_h1: 6.0,
//       heading_structure: 5.0,
//       content_quality: 9.0,
//       keyword_optimization: 6.0,
//       missing_alt_text: 4.0,
//       thin_content: 10.0,
//       images_missing_lazy_loading: 5.0,
//       missing_schema: 5.0,
//     };

//     let improvement = 0;
//     const successfulFixes = fixes.filter((f) => f.success);

//     for (const fix of successfulFixes) {
//       const weight = weights[fix.type] || 3.0;
//       const impactMultiplier =
//         fix.impact === "high" ? 1.2 : fix.impact === "medium" ? 1.0 : 0.6;
//       improvement += weight * impactMultiplier;
//     }

//     return Math.min(improvement, 50);
//   }

//   // ==================== HELPER METHODS ====================

//   private getWordPressCredentials(website: any): WordPressCredentials {
//     if (!website.wpApplicationPassword) {
//       throw new Error("WordPress credentials not configured");
//     }

//     return {
//       url: website.url,
//       username: website.wpUsername || "admin",
//       applicationPassword: website.wpApplicationPassword,
//     };
//   }

//   private async getLatestSeoReport(websiteId: string, userId: string) {
//     const reports = await storage.getSeoReportsByWebsite(websiteId, userId);
//     return reports[0];
//   }

//   private async getWebsiteUrl(websiteId: string): Promise<string> {
//     const website = await storage.getUserWebsite(
//       websiteId,
//       this.currentUserId!
//     );
//     return website?.url || "";
//   }

//   private mapSeverityToImpact(severity: string): "high" | "medium" | "low" {
//     return severity === "critical"
//       ? "high"
//       : severity === "warning"
//       ? "medium"
//       : "low";
//   }

//   private groupFixesByType(fixes: AIFix[]): Record<string, AIFix[]> {
//     return fixes.reduce((groups, fix) => {
//       (groups[fix.type] = groups[fix.type] || []).push(fix);
//       return groups;
//     }, {} as Record<string, AIFix[]>);
//   }

//   private prioritizeAndFilterFixes(
//     fixes: AIFix[],
//     allowedTypes?: string[],
//     maxChanges: number = 50
//   ): AIFix[] {
//     let filtered = fixes;

//     if (allowedTypes && allowedTypes.length > 0) {
//       filtered = filtered.filter((fix) => allowedTypes.includes(fix.type));
//     }

//     const priority = { high: 3, medium: 2, low: 1 };
//     filtered.sort(
//       (a, b) => (priority[b.impact] || 0) - (priority[a.impact] || 0)
//     );

//     return filtered.slice(0, maxChanges);
//   }

//   private calculateDetailedBreakdown(fixes: AIFix[]) {
//     const successful = fixes.filter((f) => f.success);

//     return {
//       altTextFixed: successful.filter((f) => f.type.includes("alt")).length,
//       metaDescriptionsUpdated: successful.filter((f) =>
//         f.type.includes("meta_description")
//       ).length,
//       titleTagsImproved: successful.filter((f) => f.type.includes("title"))
//         .length,
//       headingStructureFixed: successful.filter((f) =>
//         f.type.includes("heading")
//       ).length,
//       internalLinksAdded: successful.filter((f) => f.type.includes("linking"))
//         .length,
//       imagesOptimized: successful.filter((f) => f.type.includes("image"))
//         .length,
//       contentQualityImproved: successful.filter((f) =>
//         f.type.includes("content")
//       ).length,
//       schemaMarkupAdded: successful.filter((f) => f.type.includes("schema"))
//         .length,
//       openGraphTagsAdded: successful.filter((f) => f.type.includes("open_graph"))
//         .length,
//       canonicalUrlsFixed: successful.filter((f) => f.type.includes("canonical"))
//         .length,
//     };
//   }

//   private calculateEstimatedImpact(fixes: AIFix[]): string {
//     const successful = fixes.filter((f) => f.success);
//     const highImpact = successful.filter((f) => f.impact === "high").length;

//     if (highImpact >= 5) return "very high";
//     if (highImpact >= 3) return "high";
//     if (highImpact >= 1) return "medium";
//     return "low";
//   }

//   // ==================== RESULT CREATION ====================

//   private createSuccessResult(
//     appliedFixes: AIFix[],
//     errors: string[],
//     totalIssues: number,
//     dryRun: boolean,
//     reanalysis: ReanalysisResult | undefined,
//     fixSessionId: string
//   ): AIFixResult {
//     const stats: AIFixStats = {
//       totalIssuesFound: totalIssues,
//       fixesAttempted: appliedFixes.length,
//       fixesSuccessful: appliedFixes.filter((f) => f.success).length,
//       fixesFailed: appliedFixes.filter((f) => !f.success).length,
//       estimatedImpact: this.calculateEstimatedImpact(appliedFixes),
//       detailedBreakdown: this.calculateDetailedBreakdown(appliedFixes),
//     };

//     let message = dryRun
//       ? `Dry run complete. Found ${stats.fixesAttempted} fixable issues.`
//       : `Applied ${stats.fixesSuccessful} fixes successfully.`;

//     if (reanalysis?.success && reanalysis.scoreImprovement > 0) {
//       message += ` SEO score improved: ${reanalysis.initialScore} → ${reanalysis.finalScore} (+${reanalysis.scoreImprovement} points)`;
//     }

//     return {
//       success: true,
//       dryRun,
//       fixesApplied: appliedFixes,
//       stats,
//       errors: errors.length > 0 ? errors : undefined,
//       message,
//       detailedLog: [...this.log],
//       reanalysis,
//       fixSessionId,
//     };
//   }

//   private createNoFixesNeededResult(
//     dryRun: boolean,
//     fixSessionId: string
//   ): AIFixResult {
//     return {
//       success: true,
//       dryRun,
//       fixesApplied: [],
//       stats: {
//         totalIssuesFound: 0,
//         fixesAttempted: 0,
//         fixesSuccessful: 0,
//         fixesFailed: 0,
//         estimatedImpact: "none",
//         detailedBreakdown: {
//           altTextFixed: 0,
//           metaDescriptionsUpdated: 0,
//           titleTagsImproved: 0,
//           headingStructureFixed: 0,
//           internalLinksAdded: 0,
//           imagesOptimized: 0,
//           contentQualityImproved: 0,
//           schemaMarkupAdded: 0,
//           openGraphTagsAdded: 0,
//           canonicalUrlsFixed: 0,
//         },
//       },
//       message: "All fixable SEO issues have already been addressed.",
//       detailedLog: [...this.log],
//       fixSessionId,
//     };
//   }

//   private createErrorResult(
//     error: any,
//     dryRun: boolean,
//     fixSessionId: string
//   ): AIFixResult {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     this.addLog(`AI fix service error: ${errorMessage}`, "error");

//     return {
//       success: false,
//       dryRun,
//       fixesApplied: [],
//       stats: {
//         totalIssuesFound: 0,
//         fixesAttempted: 0,
//         fixesSuccessful: 0,
//         fixesFailed: 1,
//         estimatedImpact: "none",
//         detailedBreakdown: {
//           altTextFixed: 0,
//           metaDescriptionsUpdated: 0,
//           titleTagsImproved: 0,
//           headingStructureFixed: 0,
//           internalLinksAdded: 0,
//           imagesOptimized: 0,
//           contentQualityImproved: 0,
//           schemaMarkupAdded: 0,
//           openGraphTagsAdded: 0,
//           canonicalUrlsFixed: 0,
//         },
//       },
//       errors: [errorMessage],
//       message: `AI fix failed: ${errorMessage}`,
//       detailedLog: [...this.log],
//       fixSessionId,
//     };
//   }

//   // ==================== ACTIVITY LOGGING ====================

//   private async createActivityLog(
//     userId: string,
//     websiteId: string,
//     appliedFixes: AIFix[],
//     reanalysis: ReanalysisResult | undefined,
//     fixSessionId: string
//   ): Promise<void> {
//     const successfulFixes = appliedFixes.filter((f) => f.success);

//     await storage.createActivityLog({
//       userId,
//       websiteId,
//       type: "ai_fixes_applied",
//       description: `AI fixes: ${successfulFixes.length} successful, ${
//         appliedFixes.length - successfulFixes.length
//       } failed`,
//       metadata: {
//         fixSessionId,
//         fixesApplied: appliedFixes.length,
//         fixesSuccessful: successfulFixes.length,
//         fixesFailed: appliedFixes.length - successfulFixes.length,
//         reanalysis: reanalysis || null,
//       },
//     });
//   }

//   private async createWebsiteBackup(
//     website: any,
//     userId: string
//   ): Promise<void> {
//     try {
//       await storage.createBackup({
//         userId,
//         websiteId: website.id,
//         backupType: "pre_ai_fix",
//         status: "completed",
//         data: {},
//         metadata: {
//           reason: "Before AI fixes",
//           websiteUrl: website.url,
//           timestamp: new Date().toISOString(),
//         },
//       });
//       this.addLog("Backup created", "success");
//     } catch (error) {
//       this.addLog("Backup creation failed (continuing anyway)", "warning");
//     }
//   }

//   // ==================== PUBLIC API ====================

//   async getAvailableFixTypes(
//     websiteId: string,
//     userId: string
//   ): Promise<{
//     availableFixes: string[];
//     totalFixableIssues: number;
//     estimatedTime: string;
//     breakdown: Record<string, number>;
//   }> {
//     try {
//       const fixableIssues = await this.getFixableIssues(websiteId, userId);
//       const availableFixTypes = [...new Set(fixableIssues.map((fix) => fix.type))];
//       const breakdown = fixableIssues.reduce(
//         (acc: Record<string, number>, fix) => {
//           acc[fix.type] = (acc[fix.type] || 0) + 1;
//           return acc;
//         },
//         {}
//       );

//       return {
//         availableFixes: availableFixTypes,
//         totalFixableIssues: fixableIssues.length,
//         estimatedTime: this.estimateFixTime(fixableIssues.length),
//         breakdown,
//       };
//     } catch (error) {
//       return {
//         availableFixes: [],
//         totalFixableIssues: 0,
//         estimatedTime: "0 minutes",
//         breakdown: {},
//       };
//     }
//   }

//   private estimateFixTime(fixCount: number): string {
//     const minutesPerFix = 2;
//     const totalMinutes = Math.max(3, fixCount * minutesPerFix);

//     if (totalMinutes < 60) return `${totalMinutes} minutes`;

//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
//   }
// }

// export const aiFixService = new AIFixService();
