// server/routes/high-intent-routes.ts
// Express routes for High Intent Collection feature

import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { highIntentService } from "../services/high-intent-service";

import ExcelJS from "exceljs";

const router = Router();

// Extend Express Request to include user (from your auth middleware)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        isAdmin?: boolean;
      };
    }
  }
}

// Middleware to ensure user is authenticated
const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

// =============================================================================
// RESEARCH ENDPOINTS
// =============================================================================

// POST /api/user/high-intent/research-product
router.post("/research-product", (async (req: Request, res: Response) => {
  try {
    const { productName, niche, questionsCount = 10 } = req.body;
    const userId = req.user!.id;

    if (!productName || typeof productName !== "string" || !productName.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }
    if (!niche || typeof niche !== "string" || !niche.trim()) {
      res.status(400).json({ message: "Niche is required" });
      return;
    }
    if (questionsCount < 1 || questionsCount > 20) {
      res.status(400).json({ message: "Questions count must be between 1 and 20" });
      return;
    }

    console.log(`🔍 Researching questions for "${productName}" in ${niche} niche`);
    const questions = await highIntentService.researchProductQuestions(
      productName.trim(), niche.trim(), questionsCount, userId
    );

    res.json({ success: true, questions, count: questions.length });
  } catch (error: any) {
    console.error("Research product error:", error);
    res.status(500).json({ message: error.message || "Failed to research product" });
  }
}) as RequestHandler);

// POST /api/user/high-intent/bulk-research
router.post("/bulk-research", (async (req: Request, res: Response) => {
  try {
    const { products, niche, questionsPerProduct = 10 } = req.body;
    const userId = req.user!.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: "Products array is required" });
      return;
    }
    if (!niche || typeof niche !== "string" || !niche.trim()) {
      res.status(400).json({ message: "Niche is required" });
      return;
    }
    if (products.length > 100) {
      res.status(400).json({ message: "Maximum 100 products per request" });
      return;
    }
    if (questionsPerProduct < 1 || questionsPerProduct > 20) {
      res.status(400).json({ message: "Questions per product must be between 1 and 20" });
      return;
    }

    const cleanProducts = products
      .filter((p: any) => typeof p === "string" && p.trim().length > 0)
      .map((p: string) => p.trim());

    if (cleanProducts.length === 0) {
      res.status(400).json({ message: "No valid product names provided" });
      return;
    }

    console.log(`🔍 Bulk researching ${cleanProducts.length} products in ${niche} niche`);
    const allQuestions = await highIntentService.bulkResearchQuestions(
      cleanProducts, niche.trim(), questionsPerProduct, userId
    );

    res.json({
      success: true,
      questions: allQuestions,
      totalProducts: cleanProducts.length,
      totalQuestions: allQuestions.length,
    });
  } catch (error: any) {
    console.error("Bulk research error:", error);
    res.status(500).json({ message: error.message || "Failed to bulk research products" });
  }
}) as RequestHandler);

// GET /api/user/high-intent/saved-research
router.get("/saved-research", (async (req: Request, res: Response) => {
  try {
    const savedResearch = await highIntentService.getSavedResearch(req.user!.id);
    res.json(savedResearch);
  } catch (error: any) {
    console.error("Get saved research error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch saved research" });
  }
}) as RequestHandler);

// POST /api/user/high-intent/save-research
router.post("/save-research", (async (req: Request, res: Response) => {
  try {
    const { questions, name } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }
    const sessionName = name || `Research Session - ${new Date().toLocaleDateString()}`;
    const savedId = await highIntentService.saveResearchSession(req.user!.id, questions, sessionName);
    res.json({ success: true, id: savedId });
  } catch (error: any) {
    console.error("Save research error:", error);
    res.status(500).json({ message: error.message || "Failed to save research" });
  }
}) as RequestHandler);

// DELETE /api/user/high-intent/research/:researchId
router.delete("/research/:researchId", (async (req: Request, res: Response) => {
  try {
    await highIntentService.deleteResearchSession(req.params.researchId, req.user!.id);
    res.json({ success: true, message: "Research session deleted" });
  } catch (error: any) {
    console.error("Delete research error:", error);
    res.status(500).json({ message: error.message || "Failed to delete research session" });
  }
}) as RequestHandler);

// =============================================================================
// EXPORT ENDPOINTS
// =============================================================================

// POST /api/user/high-intent/export-excel
router.post("/export-excel", (async (req: Request, res: Response) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }

    console.log(`📊 Exporting ${questions.length} questions to Excel`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "High Intent Collection Tool";
    workbook.created = new Date();

    // Sheet 1: All Questions
    const questionsSheet = workbook.addWorksheet("Questions", {
      properties: { tabColor: { argb: "7C3AED" } },
    });

    questionsSheet.columns = [
      { header: "Product", key: "productName", width: 25 },
      { header: "Question", key: "question", width: 60 },
      { header: "Search Volume", key: "searchVolume", width: 15 },
      { header: "Difficulty", key: "difficulty", width: 12 },
      { header: "Popularity", key: "popularity", width: 12 },
      { header: "Competition", key: "competition", width: 12 },
      { header: "Region", key: "region", width: 12 },
      { header: "Trend", key: "trend", width: 10 },
      { header: "Intent", key: "intent", width: 15 },
      { header: "Est. Clicks", key: "estimatedClicks", width: 12 },
      { header: "Source", key: "source", width: 15 },
      { header: "Related Questions", key: "relatedQuestions", width: 80 },
    ];

    const headerRow = questionsSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "7C3AED" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    questions.forEach((q: any, index: number) => {
      const row = questionsSheet.addRow({
        productName: q.productName || "",
        question: q.question || "",
        searchVolume: q.searchVolume || 0,
        difficulty: q.difficulty || 0,
        popularity: q.popularity || "medium",
        competition: q.competition || "medium",
        region: q.region || "global",
        trend: q.trend || "stable",
        intent: q.intent || "informational",
        estimatedClicks: q.estimatedClicks || 0,
        source: q.source || "Google PAA",
        relatedQuestions: (q.relatedQuestions || []).join(" | "),
      });
      if (index % 2 === 0) {
        row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F3F4F6" } };
      }
    });

    questionsSheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: questions.length + 1, column: 12 } };

    // Sheet 2: Summary
    const summarySheet = workbook.addWorksheet("Summary", {
      properties: { tabColor: { argb: "10B981" } },
    });

    const productStats: Record<string, { count: number; totalVolume: number; totalDifficulty: number }> = {};
    questions.forEach((q: any) => {
      const product = q.productName || "Unknown";
      if (!productStats[product]) productStats[product] = { count: 0, totalVolume: 0, totalDifficulty: 0 };
      productStats[product].count++;
      productStats[product].totalVolume += q.searchVolume || 0;
      productStats[product].totalDifficulty += q.difficulty || 0;
    });

    summarySheet.columns = [
      { header: "Product", key: "product", width: 30 },
      { header: "Questions", key: "count", width: 12 },
      { header: "Avg Search Vol", key: "avgVolume", width: 14 },
      { header: "Avg Difficulty", key: "avgDifficulty", width: 14 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
    summaryHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "10B981" } };

    Object.entries(productStats).forEach(([product, stats]) => {
      summarySheet.addRow({
        product,
        count: stats.count,
        avgVolume: Math.round(stats.totalVolume / stats.count),
        avgDifficulty: Math.round(stats.totalDifficulty / stats.count),
      });
    });

    // Sheet 3: Top Opportunities
    const opportunitiesSheet = workbook.addWorksheet("Top Opportunities", {
      properties: { tabColor: { argb: "F59E0B" } },
    });

    opportunitiesSheet.columns = [
      { header: "Rank", key: "rank", width: 8 },
      { header: "Product", key: "productName", width: 25 },
      { header: "Question", key: "question", width: 60 },
      { header: "Search Volume", key: "searchVolume", width: 15 },
      { header: "Difficulty", key: "difficulty", width: 12 },
      { header: "Score", key: "score", width: 12 },
    ];

    const oppHeaderRow = opportunitiesSheet.getRow(1);
    oppHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
    oppHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F59E0B" } };

    const sorted = [...questions].sort((a: any, b: any) => {
      const scoreA = (a.searchVolume || 0) * (100 - (a.difficulty || 50));
      const scoreB = (b.searchVolume || 0) * (100 - (b.difficulty || 50));
      return scoreB - scoreA;
    });

    sorted.slice(0, 50).forEach((q: any, i: number) => {
      opportunitiesSheet.addRow({
        rank: i + 1,
        productName: q.productName,
        question: q.question,
        searchVolume: q.searchVolume,
        difficulty: q.difficulty,
        score: Math.round(((q.searchVolume || 0) * (100 - (q.difficulty || 50))) / 1000),
      });
    });

    const filename = `high-intent-questions-${new Date().toISOString().split("T")[0]}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error("Export Excel error:", error);
    res.status(500).json({ message: error.message || "Failed to export to Excel" });
  }
}) as RequestHandler);

// =============================================================================
// BLOG GENERATION ENDPOINTS
// =============================================================================

// POST /api/user/high-intent/generate-blog
router.post("/generate-blog", (async (req: Request, res: Response) => {
  try {
    const {
      questionId, question, productName,
      targetWordCount = 2000, includeFAQ = true, faqCount = 5,
      aiProvider = "anthropic", tone = "professional", includeProductSection = true,
    } = req.body;
    const userId = req.user!.id;

    if (!question || typeof question !== "string" || !question.trim()) {
      res.status(400).json({ message: "Question is required" });
      return;
    }
    if (!productName || typeof productName !== "string" || !productName.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }
    if (targetWordCount < 500 || targetWordCount > 5000) {
      res.status(400).json({ message: "Word count must be between 500 and 5000" });
      return;
    }
    if (!["openai", "anthropic", "gemini"].includes(aiProvider)) {
      res.status(400).json({ message: "Invalid AI provider" });
      return;
    }

    console.log(`✍️ Generating blog for: "${question.substring(0, 50)}..."`);
    const blog = await highIntentService.generateBlogFromQuestion({
      questionId: questionId || `q-${Date.now()}`,
      question: question.trim(),
      productName: productName.trim(),
      targetWordCount, includeFAQ, faqCount, aiProvider, tone, includeProductSection, userId,
    });

    res.json(blog);
  } catch (error: any) {
    console.error("Generate blog error:", error);
    res.status(500).json({ message: error.message || "Failed to generate blog" });
  }
}) as RequestHandler);

// POST /api/user/high-intent/bulk-generate-blogs
router.post("/bulk-generate-blogs", (async (req: Request, res: Response) => {
  try {
    const { questions, settings } = req.body;
    const userId = req.user!.id;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }
    if (questions.length > 10) {
      res.status(400).json({ message: "Maximum 10 blogs per bulk request" });
      return;
    }

    const blogs: any[] = [];
    let failed = 0;

    for (const q of questions) {
      try {
        const blog = await highIntentService.generateBlogFromQuestion({
          questionId: q.id, question: q.question, productName: q.productName,
          targetWordCount: settings?.targetWordCount || 2000,
          includeFAQ: settings?.includeFAQ ?? true,
          faqCount: settings?.faqCount || 5,
          aiProvider: settings?.aiProvider || "anthropic",
          tone: settings?.tone || "professional",
          includeProductSection: settings?.includeProductSection ?? true,
          userId,
        });
        blogs.push(blog);
      } catch (err) {
        console.error(`Failed to generate blog for: ${q.question}`, err);
        failed++;
      }
    }

    res.json({ success: true, blogs, failed });
  } catch (error: any) {
    console.error("Bulk generate blogs error:", error);
    res.status(500).json({ message: error.message || "Failed to generate blogs" });
  }
}) as RequestHandler);

// GET /api/user/high-intent/blogs
router.get("/blogs", (async (req: Request, res: Response) => {
  try {
    const blogs = await highIntentService.getGeneratedBlogs(req.user!.id);
    res.json(blogs);
  } catch (error: any) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch blogs" });
  }
}) as RequestHandler);

// GET /api/user/high-intent/blogs/:blogId
router.get("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    const blog = await highIntentService.getBlogById(req.params.blogId, req.user!.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.json(blog);
  } catch (error: any) {
    console.error("Get blog error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch blog" });
  }
}) as RequestHandler);

// PUT /api/user/high-intent/blogs/:blogId
router.put("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    const updatedBlog = await highIntentService.updateBlog(req.params.blogId, req.user!.id, req.body);
    if (!updatedBlog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.json(updatedBlog);
  } catch (error: any) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: error.message || "Failed to update blog" });
  }
}) as RequestHandler);

// GET /api/user/high-intent/blogs/:blogId/download
router.get("/blogs/:blogId/download", (async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || "html";
    const blog = await highIntentService.getBlogById(req.params.blogId, req.user!.id);

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    const sanitizedTitle = blog.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    let content: string | Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "md":
        content = highIntentService.convertToMarkdown(blog);
        contentType = "text/markdown";
        filename = `${sanitizedTitle}.md`;
        break;
      case "docx":
        content = await highIntentService.convertToDocx(blog);
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = `${sanitizedTitle}.docx`;
        break;
      default:
        content = highIntentService.convertToFullHtml(blog);
        contentType = "text/html";
        filename = `${sanitizedTitle}.html`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error: any) {
    console.error("Download blog error:", error);
    res.status(500).json({ message: error.message || "Failed to download blog" });
  }
}) as RequestHandler);

// DELETE /api/user/high-intent/blogs/:blogId
router.delete("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    await highIntentService.deleteBlog(req.params.blogId, req.user!.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (error: any) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: error.message || "Failed to delete blog" });
  }
}) as RequestHandler);

export { router as highIntentRoutes };