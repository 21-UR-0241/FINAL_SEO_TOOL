

import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import highIntentService from "../services/high-intent-service";
import ExcelJS from "exceljs";

const router = Router();

// Note: Request.user type should already be declared in your auth.ts or types file
// If not, add this to your existing Express type declarations (not here to avoid conflicts):
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { id: string; username: string; email?: string; isAdmin?: boolean; };
//     }
//   }
// }

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
    const { productName, niche, questionsCount = 10, locations, saveToDb = false } = req.body;
    const userId = req.user!.id;

    // Validation
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

    // Validate locations if provided
    if (locations && Array.isArray(locations)) {
      if (locations.length > 10) {
        res.status(400).json({ message: "Maximum 10 locations per request" });
        return;
      }
      if (locations.length > 0) {
        console.log(`🔍 Researching "${productName}" for ${locations.length} location(s)`);
      }
    }

    // Call service
    const questions = await highIntentService.researchProductQuestions(
      productName.trim(),
      niche.trim(),
      questionsCount,
      locations
    );

    console.log(`✅ Research complete: ${questions.length} questions found`);

    // Optionally save to database
    if (saveToDb && questions.length > 0) {
      await highIntentService.saveQuestions(userId, questions);
      console.log(`💾 Questions saved to database`);
    }

    res.json({
      success: true,
      questions,
      count: questions.length,
      source: questions[0]?.source || "Unknown",
    });
  } catch (error: any) {
    console.error("❌ Research product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to research product",
    });
  }
}) as RequestHandler);

// POST /api/user/high-intent/bulk-research
router.post("/bulk-research", (async (req: Request, res: Response) => {
  try {
    const { productNames, niche, questionsPerProduct = 10, locations, saveToDb = false } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!productNames || !Array.isArray(productNames) || productNames.length === 0) {
      res.status(400).json({ message: "Product names array is required" });
      return;
    }
    if (productNames.length > 10) {
      res.status(400).json({ message: "Maximum 10 products per bulk request" });
      return;
    }
    if (!niche || typeof niche !== "string" || !niche.trim()) {
      res.status(400).json({ message: "Niche is required" });
      return;
    }
    if (questionsPerProduct < 1 || questionsPerProduct > 20) {
      res.status(400).json({ message: "Questions per product must be between 1 and 20" });
      return;
    }

    // Validate locations
    if (locations && Array.isArray(locations) && locations.length > 10) {
      res.status(400).json({ message: "Maximum 10 locations per request" });
      return;
    }

    console.log(`🔍 Bulk researching ${productNames.length} products in ${niche} niche${
      locations && locations.length > 0 ? ` across ${locations.length} location(s)` : ""
    }`);

    const allQuestions: any[] = [];
    const locationBreakdown: Record<string, number> = {};

    // Research each product
    for (const productName of productNames) {
      console.log(`🌍 Researching "${productName}"...`);

      const questions = await highIntentService.researchProductQuestions(
        productName.trim(),
        niche.trim(),
        questionsPerProduct,
        locations
      );

      allQuestions.push(...questions);

      // Track location breakdown
      questions.forEach((q) => {
        if (q.locationData) {
          const locationKey =
            q.locationData.city ||
            q.locationData.state ||
            q.locationData.province ||
            q.locationData.country ||
            "Global";
          locationBreakdown[locationKey] = (locationBreakdown[locationKey] || 0) + 1;
        }
      });

      // Rate limiting between products
      if (productNames.indexOf(productName) < productNames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    console.log(`✅ Bulk research complete: ${allQuestions.length} questions across ${productNames.length} products`);

    // Optionally save to database
    if (saveToDb && allQuestions.length > 0) {
      await highIntentService.saveQuestions(userId, allQuestions);
      console.log(`💾 Questions saved to database`);
    }

    res.json({
      success: true,
      questions: allQuestions,
      totalProducts: productNames.length,
      totalQuestions: allQuestions.length,
      locationBreakdown,
      source: allQuestions[0]?.source || "Unknown",
    });
  } catch (error: any) {
    console.error("❌ Bulk research error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete bulk research",
    });
  }
}) as RequestHandler);

// =============================================================================
// SAVED RESEARCH ENDPOINTS
// =============================================================================

// GET /api/user/high-intent/saved-research
router.get("/saved-research", (async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessions = await highIntentService.getSavedResearchSessions(userId);

    res.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error("❌ Get saved research error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved research",
    });
  }
}) as RequestHandler);

// POST /api/user/high-intent/save-research
router.post("/save-research", (async (req: Request, res: Response) => {
  try {
    const { questions, name, niche, products, locations } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Session name is required" });
      return;
    }

    // Extract unique products from questions if not provided
    const productNames = products || Array.from(new Set(questions.map((q: any) => q.productName)));
    const nicheValue = niche || questions[0]?.niche || "Unknown";

    const session = await highIntentService.saveResearchSession(
      userId,
      name.trim(),
      nicheValue,
      productNames,
      questions,
      locations
    );

    res.json({
      success: true,
      id: session.id,
      session,
    });
  } catch (error: any) {
    console.error("❌ Save research error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save research",
    });
  }
}) as RequestHandler);

// DELETE /api/user/high-intent/research/:researchId
router.delete("/research/:researchId", (async (req: Request, res: Response) => {
  try {
    const { researchId } = req.params;
    const userId = req.user!.id;

    const deleted = await highIntentService.deleteResearchSession(userId, researchId);

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Research session not found" });
    }
  } catch (error: any) {
    console.error("❌ Delete research error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete research",
    });
  }
}) as RequestHandler);

// GET /api/user/high-intent/research/:researchId/questions
router.get("/research/:researchId/questions", (async (req: Request, res: Response) => {
  try {
    const { researchId } = req.params;
    const userId = req.user!.id;

    const questions = await highIntentService.getQuestionsBySession(userId, researchId);

    res.json({
      success: true,
      questions,
      count: questions.length,
    });
  } catch (error: any) {
    console.error("❌ Get questions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions",
    });
  }
}) as RequestHandler);

// =============================================================================
// BLOG GENERATION ENDPOINTS
// =============================================================================

// POST /api/user/high-intent/generate-blog
router.post("/generate-blog", (async (req: Request, res: Response) => {
  try {
    const {
      questionId,
      question,
      productName,
      targetWordCount = 2000,
      includeFAQ = true,
      faqCount = 5,
      tone = "professional",
      includeProductSection = true,
      aiProvider = "anthropic",
      saveToDb = true,
      saveQuestionFirst = false,
      // Include full question data if we need to save it
      questionData,
    } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!questionId || !question || !productName) {
      res.status(400).json({ message: "Question ID, question, and product name are required" });
      return;
    }

    console.log(`✍️  Generating blog for: "${question.substring(0, 50)}..."`);

    // Optionally save the question first so blog can reference it
    let finalQuestionId = questionId;
    if (saveQuestionFirst && saveToDb && questionData) {
      console.log(`💾 Saving question to DB first...`);
      const [savedQuestion] = await highIntentService.saveQuestions(userId, [questionData]);
      if (savedQuestion) {
        finalQuestionId = savedQuestion.id;
      }
    }

    const blog = await highIntentService.generateBlog({
      questionId: finalQuestionId,
      question,
      productName,
      targetWordCount,
      includeFAQ,
      faqCount,
      tone,
      includeProductSection,
      aiProvider,
    });

    console.log(`✅ Blog generated: ${blog.wordCount} words, ${blog.faqs.length} FAQs`);

    // Save to database by default
    let savedBlog = null;
    if (saveToDb) {
      savedBlog = await highIntentService.saveBlog(userId, blog, finalQuestionId);
      console.log(`💾 Blog saved to database: ${savedBlog.id}`);
    }

    res.json({
      success: true,
      blog: savedBlog || blog,
    });
  } catch (error: any) {
    console.error("❌ Blog generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate blog",
    });
  }
}) as RequestHandler);

// POST /api/user/high-intent/bulk-generate-blogs
router.post("/bulk-generate-blogs", (async (req: Request, res: Response) => {
  try {
    const { questions, settings, saveToDb = true, saveQuestionsFirst = false } = req.body;
    const userId = req.user!.id;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }
    if (questions.length > 10) {
      res.status(400).json({ message: "Maximum 10 blogs per bulk request" });
      return;
    }

    console.log(`✍️  Bulk generating ${questions.length} blogs...`);

    // Optionally save questions to DB first so blogs can reference them
    if (saveQuestionsFirst && saveToDb) {
      console.log(`💾 Saving ${questions.length} questions to DB first...`);
      const savedQuestions = await highIntentService.saveQuestions(userId, questions);
      // Update question IDs to match saved ones
      questions.forEach((q: any, index: number) => {
        if (savedQuestions[index]) {
          q.id = savedQuestions[index].id;
        }
      });
    }

    const blogs: any[] = [];
    let failed = 0;

    for (const question of questions) {
      try {
        const blog = await highIntentService.generateBlog({
          questionId: question.id,
          question: question.question,
          productName: question.productName,
          targetWordCount: settings?.targetWordCount || 2000,
          includeFAQ: settings?.includeFAQ !== false,
          faqCount: settings?.faqCount || 5,
          tone: settings?.tone || "professional",
          includeProductSection: settings?.includeProductSection !== false,
          aiProvider: settings?.aiProvider || "anthropic",
        });

        // Save to database
        if (saveToDb) {
          const savedBlog = await highIntentService.saveBlog(userId, blog, question.id);
          blogs.push(savedBlog);
        } else {
          blogs.push(blog);
        }

        console.log(`✅ Blog ${blogs.length}/${questions.length} generated`);

        // Rate limiting
        if (questions.indexOf(question) < questions.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error(`❌ Failed to generate blog for question: ${question.id}`, error);
        failed++;
      }
    }

    console.log(`✅ Bulk blog generation complete: ${blogs.length} succeeded, ${failed} failed`);

    res.json({
      success: true,
      blogs,
      total: questions.length,
      succeeded: blogs.length,
      failed,
    });
  } catch (error: any) {
    console.error("❌ Bulk blog generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate blogs",
    });
  }
}) as RequestHandler);

// =============================================================================
// BLOG CRUD ENDPOINTS
// =============================================================================

// GET /api/user/high-intent/blogs
router.get("/blogs", (async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const blogs = await highIntentService.getBlogsByUser(userId);

    res.json({
      success: true,
      blogs,
      count: blogs.length,
    });
  } catch (error: any) {
    console.error("❌ Get blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
}) as RequestHandler);

// GET /api/user/high-intent/blogs/:blogId
router.get("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.id;

    const blog = await highIntentService.getBlogById(userId, blogId);

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error: any) {
    console.error("❌ Get blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
}) as RequestHandler);

// PUT /api/user/high-intent/blogs/:blogId
router.put("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    const blog = await highIntentService.updateBlog(userId, blogId, updates);

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error: any) {
    console.error("❌ Update blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
}) as RequestHandler);

// DELETE /api/user/high-intent/blogs/:blogId
router.delete("/blogs/:blogId", (async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.id;

    const deleted = await highIntentService.deleteBlog(userId, blogId);

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Blog not found" });
    }
  } catch (error: any) {
    console.error("❌ Delete blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
}) as RequestHandler);

// GET /api/user/high-intent/blogs/:blogId/download
router.get("/blogs/:blogId/download", (async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const { format = "html" } = req.query;
    const userId = req.user!.id;

    const blog = await highIntentService.getBlogById(userId, blogId);

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found" });
      return;
    }

    // Track download
    await highIntentService.trackBlogDownload(userId, blogId, format as string);

    const filename = blog.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");

    switch (format) {
      case "html":
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.html"`);
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="description" content="${blog.metaDescription}">
            <title>${blog.title}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
              h1 { color: #333; }
              .meta { color: #666; font-style: italic; margin-bottom: 20px; }
              .faq { margin-top: 30px; }
              .faq h3 { color: #444; }
            </style>
          </head>
          <body>
            <h1>${blog.title}</h1>
            <p class="meta">${blog.metaDescription}</p>
            ${blog.content}
            ${blog.faqs && (blog.faqs as any[]).length > 0 ? `
              <div class="faq">
                <h2>Frequently Asked Questions</h2>
                ${(blog.faqs as any[]).map((faq: any) => `
                  <h3>${faq.question}</h3>
                  <p>${faq.answer}</p>
                `).join("")}
              </div>
            ` : ""}
          </body>
          </html>
        `);
        break;

      case "md":
        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.md"`);
        
        // Convert HTML to markdown (basic conversion)
        const mdContent = blog.content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
          .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
          .replace(/<ul[^>]*>/gi, "")
          .replace(/<\/ul>/gi, "\n")
          .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
          .replace(/<[^>]*>/g, "");

        res.send(`# ${blog.title}

*${blog.metaDescription}*

${mdContent}

${blog.faqs && (blog.faqs as any[]).length > 0 ? `
## Frequently Asked Questions

${(blog.faqs as any[]).map((faq: any) => `### ${faq.question}

${faq.answer}
`).join("\n")}
` : ""}
`);
        break;

      case "docx":
        const buffer = await highIntentService.exportBlogToDocx(blog);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.docx"`);
        res.send(buffer);
        break;

      default:
        res.status(400).json({ message: "Invalid format. Use: html, docx, or md" });
    }
  } catch (error: any) {
    console.error("❌ Download blog error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to download blog",
    });
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

    console.log(`📊 Exporting ${questions.length} questions to Excel...`);

    const workbook = new ExcelJS.Workbook();

    // Questions Sheet
    const questionsSheet = workbook.addWorksheet("Questions");

    // Define columns
    questionsSheet.columns = [
      { header: "Product", key: "product", width: 20 },
      { header: "Question", key: "question", width: 50 },
      { header: "Search Volume", key: "searchVolume", width: 15 },
      { header: "Difficulty", key: "difficulty", width: 12 },
      { header: "Competition", key: "competition", width: 15 },
      { header: "Popularity", key: "popularity", width: 12 },
      { header: "Intent", key: "intent", width: 15 },
      { header: "Trend", key: "trend", width: 12 },
      { header: "Est. Clicks", key: "estimatedClicks", width: 12 },
      { header: "Country", key: "country", width: 15 },
      { header: "State/Province", key: "stateProvince", width: 20 },
      { header: "City", key: "city", width: 20 },
      { header: "Local Volume", key: "localVolume", width: 15 },
      { header: "Source", key: "source", width: 15 },
      { header: "Related Questions", key: "relatedQuestions", width: 60 },
    ];

    // Style header row
    questionsSheet.getRow(1).font = { bold: true, size: 12 };
    questionsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    questionsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Add data rows
    questions.forEach((q: any) => {
      const row = questionsSheet.addRow({
        product: q.productName,
        question: q.question,
        searchVolume: q.searchVolume,
        difficulty: q.difficulty,
        competition: q.competition,
        popularity: q.popularity,
        intent: q.intent,
        trend: q.trend,
        estimatedClicks: q.estimatedClicks,
        country: q.locationData?.country || "",
        stateProvince: q.locationData?.state || q.locationData?.province || "",
        city: q.locationData?.city || "",
        localVolume: q.locationData?.localSearchVolume || "",
        source: q.source,
        relatedQuestions: q.relatedQuestions?.join("; ") || "",
      });

      // Color code competition
      const competitionCell = row.getCell("competition");
      if (q.competition === "low") {
        competitionCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD1FAE5" },
        };
      } else if (q.competition === "medium") {
        competitionCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF3C7" },
        };
      } else if (q.competition === "high") {
        competitionCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFECACA" },
        };
      }
    });

    // Statistics Sheet
    const statsSheet = workbook.addWorksheet("Statistics");

    statsSheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];

    statsSheet.getRow(1).font = { bold: true, size: 12 };
    statsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    statsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Calculate stats
    const uniqueProducts = new Set(questions.map((q: any) => q.productName));
    const avgSearchVolume = Math.round(
      questions.reduce((sum: number, q: any) => sum + q.searchVolume, 0) / questions.length
    );
    const avgDifficulty = Math.round(
      questions.reduce((sum: number, q: any) => sum + q.difficulty, 0) / questions.length
    );
    const lowCompetitionCount = questions.filter((q: any) => q.competition === "low").length;
    const locationBreakdown: Record<string, number> = {};

    questions.forEach((q: any) => {
      if (q.locationData) {
        const key =
          q.locationData.city ||
          q.locationData.state ||
          q.locationData.province ||
          q.locationData.country ||
          "Global";
        locationBreakdown[key] = (locationBreakdown[key] || 0) + 1;
      }
    });

    statsSheet.addRow({ metric: "Total Questions", value: questions.length });
    statsSheet.addRow({ metric: "Unique Products", value: uniqueProducts.size });
    statsSheet.addRow({ metric: "Average Search Volume", value: avgSearchVolume });
    statsSheet.addRow({ metric: "Average Difficulty", value: avgDifficulty });
    statsSheet.addRow({ metric: "Low Competition Count", value: lowCompetitionCount });
    statsSheet.addRow({ metric: "", value: "" });
    statsSheet.addRow({ metric: "Location Breakdown", value: "" }).font = { bold: true };

    Object.entries(locationBreakdown).forEach(([location, count]) => {
      statsSheet.addRow({ metric: `  ${location}`, value: count });
    });

    statsSheet.addRow({ metric: "", value: "" });
    statsSheet.addRow({ metric: "Data Source", value: questions[0]?.source || "Unknown" });
    statsSheet.addRow({
      metric: "Export Date",
      value: new Date().toISOString().split("T")[0],
    });

    // Top Opportunities Sheet
    const topSheet = workbook.addWorksheet("Top Opportunities");

    topSheet.columns = [
      { header: "Rank", key: "rank", width: 8 },
      { header: "Question", key: "question", width: 50 },
      { header: "Product", key: "product", width: 20 },
      { header: "Search Volume", key: "searchVolume", width: 15 },
      { header: "Competition", key: "competition", width: 15 },
      { header: "Location", key: "location", width: 25 },
      { header: "Score", key: "score", width: 10 },
    ];

    topSheet.getRow(1).font = { bold: true, size: 12 };
    topSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };
    topSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Score and sort
    const scoredQuestions = questions
      .map((q: any) => {
        const competitionScore: Record<"low" | "medium" | "high", number> = { low: 3, medium: 2, high: 1 };
        const volumeScore = Math.min(q.searchVolume / 1000, 5);
        const score = (competitionScore[q.competition as "low" | "medium" | "high"] || 1) * volumeScore;
        return { ...q, score };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 20);

    scoredQuestions.forEach((q: any, index: number) => {
      topSheet.addRow({
        rank: index + 1,
        question: q.question,
        product: q.productName,
        searchVolume: q.searchVolume,
        competition: q.competition,
        location:
          q.locationData?.city ||
          q.locationData?.state ||
          q.locationData?.province ||
          q.locationData?.country ||
          "Global",
        score: Math.round(q.score * 10) / 10,
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="high-intent-questions-${Date.now()}.xlsx"`);

    console.log(`✅ Excel export complete: ${questions.length} questions`);

    res.send(buffer);
  } catch (error: any) {
    console.error("❌ Excel export error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to export to Excel",
    });
  }
}) as RequestHandler);

// =============================================================================
// LOCATION DATA ENDPOINT
// =============================================================================

// GET /api/user/high-intent/locations
router.get("/locations", (async (req: Request, res: Response) => {
  try {
    // Return static location data
    const locations = [
      {
        code: "global",
        name: "Global",
      },
      {
        code: "us",
        name: "United States",
        states: [
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
        ],
      },
      {
        code: "ca",
        name: "Canada",
        provinces: [
          { code: "on", name: "Ontario", topCities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton"] },
          { code: "qc", name: "Quebec", topCities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"] },
          { code: "bc", name: "British Columbia", topCities: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Abbotsford"] },
          { code: "ab", name: "Alberta", topCities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"] },
        ],
      },
      {
        code: "uk",
        name: "United Kingdom",
      },
      {
        code: "au",
        name: "Australia",
      },
      {
        code: "eu",
        name: "European Union",
      },
    ];

    res.json({
      success: true,
      locations,
    });
  } catch (error: any) {
    console.error("❌ Get locations error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch locations",
    });
  }
}) as RequestHandler);

export default router;