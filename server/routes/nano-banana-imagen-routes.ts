// server/routes/nano-banana-imagen-routes.ts

import express, { Request, Response } from 'express';
import { nanoBananaImagenService, NanoBananaImagenRequest } from '../services/nano-banana-imagen-service';
import { storage } from '../storage';

const router = express.Router();

// POST /api/nano-banana-imagen/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { topic, count, contentContext, keywords, websiteId } = req.body;
    const userId = (req as any).session?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const request: NanoBananaImagenRequest = {
      topic,
      count: parseInt(count) || 1,
      contentContext,
      keywords: keywords || []
    };

    const validation = nanoBananaImagenService.validateRequest(request);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: validation.errors
      });
    }

    const result = await nanoBananaImagenService.generateImages(request, userId, websiteId);

    // Log activity
    try {
      await storage.createActivityLog({
        userId,
        type: 'nano_banana_imagen_generation',
        description: `Generated ${result.images.length} Nano Banana Imagen images for "${topic}"`,
        metadata: {
          topic,
          imageCount: result.images.length,
          totalCost: result.totalCost,
          keyType: result.keyType,
          websiteId
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      data: {
        images: result.images.map(img => ({
          base64: img.base64,
          mimeType: img.mimeType,
          filename: img.filename,
          altText: img.altText,
          cost: img.cost
        })),
        totalCost: result.totalCost,
        keyType: result.keyType,
        message: `Successfully generated ${result.images.length} vibrant Nano Banana image${result.images.length > 1 ? 's' : ''}! 🍌`
      }
    });

  } catch (error: any) {
    console.error('Nano Banana Imagen generation error:', error);
    
    let statusCode = 500;
    if (error.message.includes('API key')) {
      statusCode = 401;
    } else if (error.message.includes('Invalid')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to generate images'
    });
  }
});

// POST /api/nano-banana-imagen/validate
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { topic, count, keywords } = req.body;

    const request: NanoBananaImagenRequest = {
      topic,
      count: parseInt(count) || 1,
      keywords: keywords || []
    };

    const validation = nanoBananaImagenService.validateRequest(request);

    res.json({
      success: true,
      data: {
        valid: validation.valid,
        errors: validation.errors,
        estimatedCost: validation.valid ? (request.count * 0.02).toFixed(2) : null
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to validate request' });
  }
});

// POST /api/nano-banana-imagen/upload-to-wordpress
router.post('/upload-to-wordpress', async (req: Request, res: Response) => {
  try {
    const { base64, mimeType, filename, altText, wpCredentials } = req.body;
    const userId = (req as any).session?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!base64 || !mimeType || !filename || !altText || !wpCredentials) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await nanoBananaImagenService.uploadToWordPress(
      base64,
      mimeType,
      filename,
      altText,
      wpCredentials
    );

    res.json({
      success: true,
      data: {
        id: result.id,
        url: result.url,
        filename: result.filename,
        message: 'Uploaded to WordPress successfully'
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to WordPress'
    });
  }
});

// GET /api/nano-banana-imagen/usage-stats
router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const usageStats = await storage.getAiUsageStats({
      userId,
      model: 'imagen-nano-banana'
    });

    res.json({ success: true, data: usageStats });

  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve usage statistics' });
  }
});

// DELETE /api/nano-banana-imagen/cache/:userId
router.delete('/cache/:userId', async (req: Request, res: Response) => {
  try {
    const requestUserId = (req as any).session?.userId || (req as any).user?.id;
    const targetUserId = req.params.userId;

    const isAdmin = (req as any).user?.role === 'admin';
    if (!isAdmin && requestUserId !== targetUserId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    nanoBananaImagenService.clearApiKeyCache(targetUserId);
    res.json({ success: true, message: 'Cache cleared successfully' });

  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to clear cache' });
  }
});

// GET /api/nano-banana-imagen/pricing
router.get('/pricing', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      pricePerImage: 0.02,
      currency: 'USD',
      minImages: 1,
      maxImages: 3,
      provider: 'Google Imagen',
      features: [
        'Ultra vibrant colors',
        'Perfect for social media',
        'Youth-focused aesthetic',
        'High energy compositions',
        'Cheaper than DALL-E'
      ]
    }
  });
});

// GET /api/nano-banana-imagen/health
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Nano Banana Imagen (Google)',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;