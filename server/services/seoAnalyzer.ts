import puppeteer, { Browser, Page } from 'puppeteer';
import lighthouse from 'lighthouse';
import * as cheerio from 'cheerio';
import axios from 'axios';
import https from 'https';
import { URL } from 'url';

interface SEOIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  location: {
    type: string;
    url: string;
    name: string;
  };
  impact: number;
  recommendation: string;
}

interface WordPressInfo {
  isWordPress: boolean;
  version?: string;
  theme?: string;
  activePlugins?: string[];
  restApiEnabled: boolean;
  xmlrpcEnabled: boolean;
  debugMode: boolean;
  permalink_structure?: string;
}

interface PageAnalysis {
  url: string;
  type: string;
  title: string;
  score: number;
  issueCount: number;
  loadTime?: number;
  wordCount?: number;
}

interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  fcp: number;
  lcp: number;
  cls: number;
  tti: number;
}

export class WordPressSEOAnalyzer {
  private browser?: Browser;
  private progressCallback?: (progress: any) => void;

  setProgressCallback(callback: (progress: any) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message });
    }
  }

  async analyzeSite(url: string): Promise<any> {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      this.updateProgress('initializing', 5, 'Launching browser...');

      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.updateProgress('detecting', 10, 'Detecting WordPress...');
      const wpInfo = await this.detectWordPress(normalizedUrl);

      if (!wpInfo.isWordPress) {
        throw new Error('This site does not appear to be WordPress');
      }

      this.updateProgress('crawling', 20, 'Discovering WordPress content...');
      const pages = await this.discoverWordPressPages(normalizedUrl, wpInfo);

      this.updateProgress('lighthouse', 40, 'Running Lighthouse performance audit...');
      const lighthouseMetrics = await this.runLighthouse(normalizedUrl);

      this.updateProgress('analyzing', 55, 'Deep SEO analysis...');
      const issues: SEOIssue[] = [];

      // Analyze homepage in detail
      const homepageIssues = await this.analyzePageInDepth(normalizedUrl, 'homepage');
      issues.push(...homepageIssues);

      // Analyze WordPress-specific issues
      const wpIssues = await this.analyzeWordPressSpecifics(normalizedUrl, wpInfo);
      issues.push(...wpIssues);

      // Sample other pages (up to 5)
      for (const page of pages.slice(0, 5)) {
        if (page.url !== normalizedUrl) {
          const pageIssues = await this.analyzePageInDepth(page.url, page.type);
          issues.push(...pageIssues);
        }
      }

      this.updateProgress('technical', 75, 'Checking technical SEO...');
      const technicalIssues = await this.analyzeTechnicalSEO(normalizedUrl);
      issues.push(...technicalIssues);

      this.updateProgress('claude', 85, 'AI-powered analysis...');
      const claudeAnalysis = await this.performClaudeAnalysis(
        normalizedUrl,
        issues,
        pages,
        wpInfo,
        lighthouseMetrics
      );

      issues.push(...claudeAnalysis.additionalIssues);

      this.updateProgress('scoring', 95, 'Calculating scores...');
      const score = this.calculateScore(issues, lighthouseMetrics);

      this.updateProgress('complete', 100, 'Analysis complete!');

      return {
        url: normalizedUrl,
        analyzedAt: new Date().toISOString(),
        wordpress: wpInfo,
        lighthouse: lighthouseMetrics,
        score,
        issues: this.deduplicateIssues(issues),
        pagesAnalyzed: pages,
        recommendations: claudeAnalysis.recommendations,
        summary: this.generateSummary(issues)
      };
    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url.replace(/\/$/, '');
  }

  private async detectWordPress(url: string): Promise<WordPressInfo> {
    const page = await this.browser!.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      const html = await page.content();
      const $ = cheerio.load(html);

      // Multiple WordPress detection methods
      const wpSignals = {
        wpContent: html.includes('wp-content'),
        wpIncludes: html.includes('wp-includes'),
        metaGenerator: $('meta[name="generator"]').attr('content')?.includes('WordPress'),
        wpJson: false,
        wpEmoji: html.includes('wp-emoji'),
        bodyClass: $('body').hasClass('wordpress') || $('body').attr('class')?.includes('wp-')
      };

      const isWordPress = Object.values(wpSignals).filter(Boolean).length >= 2;

      if (!isWordPress) {
        return { isWordPress: false, restApiEnabled: false, xmlrpcEnabled: false, debugMode: false };
      }

      // Detect version
      let version: string | undefined;
      const generatorContent = $('meta[name="generator"]').attr('content');
      if (generatorContent) {
        const versionMatch = generatorContent.match(/WordPress\s+([0-9.]+)/i);
        version = versionMatch ? versionMatch[1] : undefined;
      }

      // Detect theme
      let theme: string | undefined;
      const themeLinks = html.match(/wp-content\/themes\/([^\/\?"']+)/g);
      if (themeLinks && themeLinks.length > 0) {
        const themeName = themeLinks[0].match(/themes\/([^\/\?"']+)/);
        theme = themeName ? themeName[1] : undefined;
      }

      // Detect active plugins
      const pluginMatches = html.match(/wp-content\/plugins\/([^\/\?"']+)/g) || [];
      const activePlugins = [...new Set(pluginMatches.map(p => {
        const match = p.match(/plugins\/([^\/\?"']+)/);
        return match ? match[1] : null;
      }).filter(Boolean))] as string[];

      // Check REST API
      let restApiEnabled = false;
      try {
        const restResponse = await axios.get(`${url}/wp-json/wp/v2/posts?per_page=1`, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        restApiEnabled = restResponse.status === 200;
      } catch {
        restApiEnabled = false;
      }

      // Check XML-RPC
      let xmlrpcEnabled = false;
      try {
        const xmlrpcResponse = await axios.post(`${url}/xmlrpc.php`, '', {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        xmlrpcEnabled = xmlrpcResponse.status !== 404;
      } catch {
        xmlrpcEnabled = false;
      }

      // Check debug mode
      const debugMode = html.includes('WP_DEBUG') || html.includes('wp-content/debug.log');

      // Try to detect permalink structure
      let permalink_structure: string | undefined;
      const links = $('a').map((_, el) => $(el).attr('href')).get();
      const internalLinks = links.filter(link => link?.includes(url));
      if (internalLinks.some(link => link?.includes('?p='))) {
        permalink_structure = 'plain';
      } else if (internalLinks.some(link => /\/\d{4}\/\d{2}\//.test(link || ''))) {
        permalink_structure = 'day-and-name';
      } else if (internalLinks.some(link => /\/[^\/]+\/$/.test(link || ''))) {
        permalink_structure = 'post-name';
      }

      return {
        isWordPress,
        version,
        theme,
        activePlugins,
        restApiEnabled,
        xmlrpcEnabled,
        debugMode,
        permalink_structure
      };
    } finally {
      await page.close();
    }
  }

  private async discoverWordPressPages(url: string, wpInfo: WordPressInfo): Promise<PageAnalysis[]> {
    const pages: PageAnalysis[] = [];

    // Add homepage
    pages.push({
      url,
      type: 'homepage',
      title: 'Homepage',
      score: 0,
      issueCount: 0
    });

    if (wpInfo.restApiEnabled) {
      try {
        // Fetch posts
        const postsRes = await axios.get(`${url}/wp-json/wp/v2/posts?per_page=10&_fields=id,link,title,word_count`);
        for (const post of postsRes.data) {
          pages.push({
            url: post.link,
            type: 'post',
            title: post.title?.rendered || 'Untitled Post',
            score: 0,
            issueCount: 0,
            wordCount: post.word_count
          });
        }

        // Fetch pages
        const pagesRes = await axios.get(`${url}/wp-json/wp/v2/pages?per_page=10&_fields=id,link,title`);
        for (const wpPage of pagesRes.data) {
          pages.push({
            url: wpPage.link,
            type: 'page',
            title: wpPage.title?.rendered || 'Untitled Page',
            score: 0,
            issueCount: 0
          });
        }
      } catch (error) {
        console.warn('REST API fetch failed:', error);
      }
    }

    // Fallback: Crawl sitemap
    if (pages.length === 1) {
      try {
        const sitemapUrl = `${url}/sitemap.xml`;
        const sitemapRes = await axios.get(sitemapUrl);
        const $ = cheerio.load(sitemapRes.data, { xmlMode: true });
        
        $('url > loc').each((_, el) => {
          const pageUrl = $(el).text();
          if (pages.length < 20 && !pages.find(p => p.url === pageUrl)) {
            pages.push({
              url: pageUrl,
              type: 'page',
              title: pageUrl.split('/').pop() || 'Page',
              score: 0,
              issueCount: 0
            });
          }
        });
      } catch {
        console.warn('Sitemap not accessible');
      }
    }

    return pages;
  }

  private async runLighthouse(url: string): Promise<LighthouseMetrics> {
    try {
      const result = await lighthouse(url, {
        port: (new URL(this.browser!.wsEndpoint())).port,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      });

      const categories = result?.lhr?.categories || {};
      const audits = result?.lhr?.audits || {};

      return {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
        pwa: Math.round((categories.pwa?.score || 0) * 100),
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        tti: audits['interactive']?.numericValue || 0
      };
    } catch (error) {
      console.error('Lighthouse failed:', error);
      return {
        performance: 0, accessibility: 0, bestPractices: 0,
        seo: 0, pwa: 0, fcp: 0, lcp: 0, cls: 0, tti: 0
      };
    }
  }

  private async analyzePageInDepth(url: string, pageType: string): Promise<SEOIssue[]> {
    const issues: SEOIssue[] = [];
    const page = await this.browser!.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      const html = await page.content();
      const $ = cheerio.load(html);

      // Meta tags analysis
      const title = $('title').text();
      const metaDesc = $('meta[name="description"]').attr('content');
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogDesc = $('meta[property="og:description"]').attr('content');
      const ogImage = $('meta[property="og:image"]').attr('content');

      if (!title || title.length === 0) {
        issues.push({
          id: `${pageType}-no-title`,
          severity: 'critical',
          category: 'meta-tags',
          title: 'Missing Title Tag',
          description: 'Page has no title tag',
          location: { type: pageType, url, name: pageType },
          impact: 10,
          recommendation: 'Add a descriptive title tag (50-60 characters)'
        });
      } else if (title.length < 30) {
        issues.push({
          id: `${pageType}-short-title`,
          severity: 'warning',
          category: 'meta-tags',
          title: 'Title Too Short',
          description: `Title is only ${title.length} characters`,
          location: { type: pageType, url, name: title },
          impact: 5,
          recommendation: 'Expand title to 50-60 characters for better SEO'
        });
      } else if (title.length > 60) {
        issues.push({
          id: `${pageType}-long-title`,
          severity: 'warning',
          category: 'meta-tags',
          title: 'Title Too Long',
          description: `Title is ${title.length} characters (may be truncated in search results)`,
          location: { type: pageType, url, name: title },
          impact: 3,
          recommendation: 'Shorten title to 50-60 characters'
        });
      }

      if (!metaDesc) {
        issues.push({
          id: `${pageType}-no-meta-desc`,
          severity: 'critical',
          category: 'meta-tags',
          title: 'Missing Meta Description',
          description: 'Page has no meta description',
          location: { type: pageType, url, name: title },
          impact: 8,
          recommendation: 'Add a meta description (150-160 characters)'
        });
      } else if (metaDesc.length < 120) {
        issues.push({
          id: `${pageType}-short-desc`,
          severity: 'warning',
          category: 'meta-tags',
          title: 'Meta Description Too Short',
          description: `Description is only ${metaDesc.length} characters`,
          location: { type: pageType, url, name: title },
          impact: 4,
          recommendation: 'Expand description to 150-160 characters'
        });
      }

      // Open Graph checks
      if (!ogTitle || !ogDesc || !ogImage) {
        issues.push({
          id: `${pageType}-incomplete-og`,
          severity: 'info',
          category: 'meta-tags',
          title: 'Incomplete Open Graph Tags',
          description: 'Missing OG tags for social media sharing',
          location: { type: pageType, url, name: title },
          impact: 3,
          recommendation: 'Add og:title, og:description, and og:image tags'
        });
      }

      // Heading structure
      const h1s = $('h1');
      if (h1s.length === 0) {
        issues.push({
          id: `${pageType}-no-h1`,
          severity: 'critical',
          category: 'headings',
          title: 'Missing H1 Tag',
          description: 'Page has no H1 heading',
          location: { type: pageType, url, name: title },
          impact: 9,
          recommendation: 'Add exactly one H1 tag as the main page heading'
        });
      } else if (h1s.length > 1) {
        issues.push({
          id: `${pageType}-multiple-h1`,
          severity: 'warning',
          category: 'headings',
          title: 'Multiple H1 Tags',
          description: `Page has ${h1s.length} H1 tags`,
          location: { type: pageType, url, name: title },
          impact: 6,
          recommendation: 'Use only one H1 tag per page'
        });
      }

      // Images analysis
      const images = $('img');
      let imagesWithoutAlt = 0;
      images.each((_, img) => {
        const alt = $(img).attr('alt');
        if (!alt || alt.trim() === '') {
          imagesWithoutAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          id: `${pageType}-missing-alt`,
          severity: 'warning',
          category: 'images',
          title: 'Images Missing Alt Text',
          description: `${imagesWithoutAlt} of ${images.length} images lack alt text`,
          location: { type: pageType, url, name: title },
          impact: 5,
          recommendation: 'Add descriptive alt text to all images for accessibility and SEO'
        });
      }

      // Links analysis
      const links = $('a[href]');
      let externalLinksWithoutNofollow = 0;
      const domain = new URL(url).hostname;

      links.each((_, link) => {
        const href = $(link).attr('href');
        const rel = $(link).attr('rel');
        
        if (href && href.startsWith('http')) {
          try {
            const linkDomain = new URL(href).hostname;
            if (linkDomain !== domain && !rel?.includes('nofollow')) {
              externalLinksWithoutNofollow++;
            }
          } catch {}
        }
      });

      // Content analysis
      const bodyText = $('body').text().trim();
      const wordCount = bodyText.split(/\s+/).length;

      if (wordCount < 300 && pageType !== 'homepage') {
        issues.push({
          id: `${pageType}-thin-content`,
          severity: 'warning',
          category: 'content',
          title: 'Thin Content',
          description: `Page has only ${wordCount} words`,
          location: { type: pageType, url, name: title },
          impact: 6,
          recommendation: 'Expand content to at least 300-500 words for better SEO'
        });
      }

      // Schema markup
      const hasSchema = $('script[type="application/ld+json"]').length > 0;
      if (!hasSchema) {
        issues.push({
          id: `${pageType}-no-schema`,
          severity: 'info',
          category: 'schema',
          title: 'No Schema Markup',
          description: 'Page lacks structured data',
          location: { type: pageType, url, name: title },
          impact: 4,
          recommendation: 'Add relevant Schema.org structured data (Article, Organization, etc.)'
        });
      }

    } catch (error) {
      console.error(`Failed to analyze ${url}:`, error);
    } finally {
      await page.close();
    }

    return issues;
  }

  private async analyzeWordPressSpecifics(url: string, wpInfo: WordPressInfo): Promise<SEOIssue[]> {
    const issues: SEOIssue[] = [];

    // Check for outdated WordPress version
    if (wpInfo.version) {
      const [major, minor] = wpInfo.version.split('.').map(Number);
      const isOutdated = major < 6 || (major === 6 && minor < 4);
      
      if (isOutdated) {
        issues.push({
          id: 'wp-outdated',
          severity: 'critical',
          category: 'technical',
          title: 'Outdated WordPress Version',
          description: `WordPress ${wpInfo.version} is outdated`,
          location: { type: 'global', url, name: 'WordPress Core' },
          impact: 9,
          recommendation: 'Update to the latest WordPress version for security and performance'
        });
      }
    }

    // XML-RPC security issue
    if (wpInfo.xmlrpcEnabled) {
      issues.push({
        id: 'wp-xmlrpc',
        severity: 'warning',
        category: 'technical',
        title: 'XML-RPC Enabled',
        description: 'XML-RPC is enabled and may be a security risk',
        location: { type: 'global', url, name: 'WordPress Configuration' },
        impact: 5,
        recommendation: 'Disable XML-RPC if not needed, or use a plugin to restrict access'
      });
    }

    // Debug mode warning
    if (wpInfo.debugMode) {
      issues.push({
        id: 'wp-debug',
        severity: 'critical',
        category: 'technical',
        title: 'Debug Mode Enabled',
        description: 'WP_DEBUG is enabled on production site',
        location: { type: 'global', url, name: 'WordPress Configuration' },
        impact: 8,
        recommendation: 'Disable WP_DEBUG in wp-config.php for production'
      });
    }

    // Permalink structure
    if (wpInfo.permalink_structure === 'plain') {
      issues.push({
        id: 'wp-ugly-permalinks',
        severity: 'warning',
        category: 'technical',
        title: 'Non-SEO-Friendly Permalinks',
        description: 'Using plain permalinks (?p=123)',
        location: { type: 'global', url, name: 'WordPress Settings' },
        impact: 7,
        recommendation: 'Change permalink structure to "Post name" or custom structure in Settings > Permalinks'
      });
    }

    // Check for common SEO plugins
    const seoPlugins = ['yoast', 'rank-math', 'all-in-one-seo', 'seopress'];
    const hasSEOPlugin = wpInfo.activePlugins?.some(plugin => 
      seoPlugins.some(seoPlugin => plugin.toLowerCase().includes(seoPlugin))
    );

    if (!hasSEOPlugin) {
      issues.push({
        id: 'wp-no-seo-plugin',
        severity: 'warning',
        category: 'technical',
        title: 'No SEO Plugin Detected',
        description: 'No major SEO plugin found',
        location: { type: 'global', url, name: 'WordPress Plugins' },
        impact: 6,
        recommendation: 'Install an SEO plugin like Yoast SEO or Rank Math for better optimization'
      });
    }

    return issues;
  }

  private async analyzeTechnicalSEO(url: string): Promise<SEOIssue[]> {
    const issues: SEOIssue[] = [];

    // SSL Check
    if (!url.startsWith('https://')) {
      issues.push({
        id: 'no-ssl',
        severity: 'critical',
        category: 'technical',
        title: 'No SSL Certificate',
        description: 'Site is not using HTTPS',
        location: { type: 'global', url, name: 'Server' },
        impact: 10,
        recommendation: 'Install and configure SSL certificate immediately'
      });
    }

    // Robots.txt check
    try {
      const robotsRes = await axios.get(`${url}/robots.txt`, { timeout: 5000 });
      if (robotsRes.status === 200) {
        const robotsTxt = robotsRes.data;
        if (robotsTxt.toLowerCase().includes('disallow: /')) {
          issues.push({
            id: 'robots-blocking',
            severity: 'critical',
            category: 'technical',
            title: 'Robots.txt Blocking Site',
            description: 'robots.txt contains "Disallow: /"',
            location: { type: 'global', url, name: 'robots.txt' },
            impact: 10,
            recommendation: 'Remove or modify the blocking rule in robots.txt'
          });
        }
      }
    } catch {
      issues.push({
        id: 'no-robots',
        severity: 'info',
        category: 'technical',
        title: 'No robots.txt Found',
        description: 'Site does not have a robots.txt file',
        location: { type: 'global', url, name: 'Server' },
        impact: 2,
        recommendation: 'Create a robots.txt file to guide search engines'
      });
    }

    // Sitemap check
    try {
      const sitemapRes = await axios.get(`${url}/sitemap.xml`, { timeout: 5000 });
      if (sitemapRes.status !== 200) {
        issues.push({
          id: 'no-sitemap',
          severity: 'warning',
          category: 'technical',
          title: 'No XML Sitemap',
          description: 'Site does not have an accessible sitemap.xml',
          location: { type: 'global', url, name: 'Server' },
          impact: 7,
          recommendation: 'Generate and submit XML sitemap using an SEO plugin or tool'
        });
      }
    } catch {
      issues.push({
        id: 'no-sitemap',
        severity: 'warning',
        category: 'technical',
        title: 'No XML Sitemap',
        description: 'Site does not have an accessible sitemap.xml',
        location: { type: 'global', url, name: 'Server' },
        impact: 7,
        recommendation: 'Generate and submit XML sitemap using an SEO plugin or tool'
      });
    }

    return issues;
  }

  private async performClaudeAnalysis(
    url: string,
    issues: SEOIssue[],
    pages: PageAnalysis[],
    wpInfo: WordPressInfo,
    lighthouse: LighthouseMetrics
  ): Promise<{ additionalIssues: SEOIssue[]; recommendations: string[] }> {
    const prompt = `You are an expert WordPress SEO consultant. Analyze this WordPress site's SEO data and provide strategic insights.

SITE: ${url}
WordPress Version: ${wpInfo.version || 'Unknown'}
Theme: ${wpInfo.theme || 'Unknown'}
Active Plugins: ${wpInfo.activePlugins?.join(', ') || 'Unknown'}

LIGHTHOUSE SCORES:
- Performance: ${lighthouse.performance}/100
- SEO: ${lighthouse.seo}/100
- Accessibility: ${lighthouse.accessibility}/100
- Best Practices: ${lighthouse.bestPractices}/100

CURRENT ISSUES FOUND: ${issues.length}
Critical: ${issues.filter(i => i.severity === 'critical').length}
Warnings: ${issues.filter(i => i.severity === 'warning').length}

PAGES ANALYZED: ${pages.length}

Based on this data, provide:
1. Any additional SEO issues not caught by automated checks
2. Top 5-8 actionable, prioritized recommendations specifically for WordPress

Respond ONLY with valid JSON (no markdown):
{
  "additionalIssues": [
    {
      "severity": "critical|warning|info",
      "category": "performance|technical|content|meta-tags",
      "title": "Issue title",
      "description": "Description",
      "location": {"type": "global", "url": "${url}", "name": "Site-wide"},
      "impact": 7,
      "recommendation": "Specific WordPress fix"
    }
  ],
  "recommendations": [
    "Top priority recommendations as strings"
  ]
}`;

    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );

      let responseText = response.data.content[0].text;
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const result = JSON.parse(responseText);
      
      // Add IDs to additional issues
      const additionalIssues = result.additionalIssues.map((issue: any, idx: number) => ({
        ...issue,
        id: `claude-${idx + 1}`
      }));

      return {
        additionalIssues,
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('Claude analysis failed:', error);
      return { additionalIssues: [], recommendations: [] };
    }
  }

  private calculateScore(issues: SEOIssue[], lighthouse: LighthouseMetrics): any {
    let score = 100;
    
    for (const issue of issues) {
      let deduction = issue.impact;
      if (issue.severity === 'critical') deduction *= 2.5;
      else if (issue.severity === 'warning') deduction *= 1.5;
      score -= deduction;
    }

    // Factor in Lighthouse scores
    const lighthouseAvg = (lighthouse.performance + lighthouse.seo + lighthouse.accessibility) / 3;
    score = (score * 0.7) + (lighthouseAvg * 0.3);

    return {
      overall: Math.max(0, Math.min(100, Math.round(score))),
      lighthouse
    };
  }

  private deduplicateIssues(issues: SEOIssue[]): SEOIssue[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.category}-${issue.title}-${issue.location.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private generateSummary(issues: SEOIssue[]): any {
    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      warningIssues: issues.filter(i => i.severity === 'warning').length,
      infoIssues: issues.filter(i => i.severity === 'info').length,
      categoryBreakdown: this.getCategoryBreakdown(issues)
    };
  }

  private getCategoryBreakdown(issues: SEOIssue[]): Record<string, number> {
    return issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const wpSEOAnalyzer = new WordPressSEOAnalyzer();