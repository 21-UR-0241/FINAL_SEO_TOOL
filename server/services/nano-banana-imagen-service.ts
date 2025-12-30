// server/services/nano-banana-imagen-service.ts

import { GoogleGenerativeAI, GenerateContentResponse } from '@google/generative-ai';
import { storage } from '../storage';
import { apiKeyEncryptionService } from './api-key-encryption';

export interface NanoBananaImagenRequest {
  topic: string;
  count: number;
  contentContext?: string;
  keywords?: string[];
}

export interface NanoBananaImagenImage {
  base64: string;
  mimeType: string;
  filename: string;
  altText: string;
  prompt: string;
  cost: number;
}

export interface NanoBananaImagenResult {
  images: NanoBananaImagenImage[];
  totalCost: number;
  keyType?: 'user' | 'system';
}

interface UserApiKey {
  id: string;
  provider: string;
  keyName: string;
  encryptedApiKey: string;
  isActive: boolean;
  validationStatus: 'valid' | 'invalid' | 'pending';
  usageCount?: number;
  lastUsed?: Date;
}

export class NanoBananaImagenService {
  private readonly IMAGEN_COST = 0.02; // $0.02 per image
  private apiKeyCache: Map<string, { key: string; type: 'user' | 'system'; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private async getGoogleApiKey(userId?: string): Promise<{ key: string; type: 'user' | 'system' } | null> {
    if (!userId) {
      const envKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      return envKey ? { key: envKey, type: 'system' } : null;
    }

    const cacheKey = `${userId}-nanobana-google`;
    const cached = this.apiKeyCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { key: cached.key, type: cached.type };
    }

    try {
      const userApiKeys = await storage.getUserApiKeys(userId);
      
      if (userApiKeys && userApiKeys.length > 0) {
        const validKey = userApiKeys.find(
          (key: UserApiKey) => 
            key.provider === 'google' && 
            key.isActive && 
            key.validationStatus === 'valid'
        );

        if (validKey && validKey.encryptedApiKey) {
          const decryptedKey = apiKeyEncryptionService.decrypt(validKey.encryptedApiKey);
          this.apiKeyCache.set(cacheKey, { key: decryptedKey, type: 'user', timestamp: Date.now() });
          return { key: decryptedKey, type: 'user' };
        }
      }
    } catch (error: any) {
      console.warn(`Failed to fetch user's Google API keys: ${error.message}`);
    }

    const envKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (envKey) {
      this.apiKeyCache.set(cacheKey, { key: envKey, type: 'system', timestamp: Date.now() });
      return { key: envKey, type: 'system' };
    }
    
    return null;
  }

  private async createGoogleClient(userId?: string): Promise<{ client: GoogleGenerativeAI; keyType: 'user' | 'system' }> {
    const keyInfo = await this.getGoogleApiKey(userId);
    
    if (!keyInfo) {
      throw new Error('No Google API key available. Please add your Google API key in settings.');
    }

    return {
      client: new GoogleGenerativeAI(keyInfo.key),
      keyType: keyInfo.type
    };
  }

  public clearApiKeyCache(userId: string): void {
    this.apiKeyCache.delete(`${userId}-nanobana-google`);
  }

async generateImages(
  request: NanoBananaImagenRequest,
  userId?: string,
  websiteId?: string
): Promise<NanoBananaImagenResult> {
  const { client, keyType } = await this.createGoogleClient(userId);

  console.log(`🍌 Starting Nano Banana (Gemini Image): ${request.count} images for "${request.topic}"`);

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash-image', // ✅ Nano Banana
  });

  const images: NanoBananaImagenImage[] = [];
  let totalCost = 0;

  for (let i = 0; i < request.count; i++) {
    try {
      const prompt = this.createNanoBananaPrompt(
        request.topic,
        i + 1,
        request.count,
        request.keywords
      );

      console.log(`🖼️ Generating image ${i + 1}/${request.count}`);
      console.log(`📝 Prompt: ${prompt.substring(0, 150)}...`);

      const result: GenerateContentResponse = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
        },
      });

      const parts = result.response.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error('No image parts returned');

      const imagePart = parts.find(p => p.inlineData);
      if (!imagePart?.inlineData?.data) {
        throw new Error('No image data found in Gemini response');
      }

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/png';

      totalCost += this.IMAGEN_COST;

      images.push({
        base64: base64Data,
        mimeType,
        filename: this.generateFilename(request.topic, i + 1),
        altText: this.generateAltText(request.topic, i + 1, request.count),
        prompt,
        cost: this.IMAGEN_COST,
      });

      // Track usage
      if (userId && websiteId) {
        try {
          await storage.trackAiUsage({
            userId,
            websiteId,
            model: 'gemini-2.5-flash-image',
            operation: 'image_generation',
            tokensUsed: 0,
            costUsd: Math.round(this.IMAGEN_COST * 100),
            keyType,
          });
        } catch (err) {
          console.warn('Failed to track usage:', err);
        }
      }

      if (i < request.count - 1) {
        await new Promise(res => setTimeout(res, 1500));
      }
    } catch (error: any) {
      console.error(`❌ Failed image ${i + 1}:`, error.message);

      if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('403')) {
        if (userId) this.clearApiKeyCache(userId);
        throw new Error('Invalid Google API key.');
      }
    }
  }

  if (images.length === 0) {
    throw new Error('Failed to generate any images');
  }

  console.log(`🎉 Nano Banana complete: ${images.length}/${request.count}`);

  return { images, totalCost, keyType };
}

  private createNanoBananaPrompt(
    topic: string,
    imageNumber: number,
    totalImages: number,
    keywords?: string[]
  ): string {
    // Determine topic category for appropriate styling
    const topicCategory = this.getTopicCategory(topic, keywords);
    const styleConfig = this.getStyleConfig(topicCategory);

    let imageContext = "";
    if (totalImages === 1) {
      imageContext = styleConfig.imageContext.single;
    } else if (imageNumber === 1) {
      imageContext = styleConfig.imageContext.first;
    } else if (imageNumber === 2) {
      imageContext = styleConfig.imageContext.second;
    } else {
      imageContext = styleConfig.imageContext.third;
    }

    const visualTopic = this.convertToNanoBananaVisual(topic, keywords);
    const keywordContext = keywords && keywords.length > 0 ? ` Focus: ${keywords.slice(0, 3).join(", ")}.` : "";

    const basePrompt = `${styleConfig.style}, ${imageContext} of ${visualTopic}.${keywordContext}`;
    const guidance = ` ${styleConfig.guidance}`;
    const instructions = ` ${styleConfig.instructions} NO text, NO watermarks, NO logos. Professional, clean composition.`;

    return `${basePrompt}${guidance}${instructions}`;
  }

  private getTopicCategory(topic: string, keywords?: string[]): string {
    const topicLower = topic.toLowerCase();
    const keywordStr = keywords?.join(' ').toLowerCase() || '';
    const combined = `${topicLower} ${keywordStr}`;

    // Medical/Scientific (peptides, health)
    if (combined.match(/peptide|protein|supplement|hormone|medical|clinical|pharmaceutical|treatment|therapy|research|study|science|biology|chemistry|drug|medicine|performance enhancement/i)) {
      return 'medical';
    }

    // Finance/Fintech (loans, payment processing)
    if (combined.match(/loan|lending|payment|processing|fintech|banking|credit|mortgage|finance|financial|investment|cryptocurrency|blockchain/i)) {
      return 'finance';
    }

    // Technology/Development (web dev, app dev, apps marketing)
    if (combined.match(/web dev|app dev|software|developer|programming|coding|tech|digital|saas|platform|api|database|cloud|mobile app|application/i)) {
      return 'technology';
    }

    // E-commerce/Retail (nails, soccer jerseys, beauty)
    if (combined.match(/ecom|e-commerce|nails|beauty|jersey|merchandise|retail|product|shop|store|online store|dropshipping/i)) {
      return 'ecommerce';
    }

    // Gambling/Gaming (professional, not party style)
    if (combined.match(/gambling|casino|betting|sports betting|poker|slots|gaming|wagering/i)) {
      return 'gaming';
    }

    // Creator/Media Platforms (professional, not adult)
    if (combined.match(/creator|onlyfans|content creator|influencer|subscription|platform|monetization|fanbase/i)) {
      return 'creator';
    }

    // Construction/Industrial B2B
    if (combined.match(/construction|contractor|building|industrial|manufacturing|b2b|infrastructure|renovation|engineering/i)) {
      return 'industrial';
    }

    // Reputation/Reviews
    if (combined.match(/reputation|review|rating|testimonial|feedback|trust|credibility|social proof/i)) {
      return 'reputation';
    }

    // Business/Professional (general business, marketing)
    if (combined.match(/business|corporate|professional|marketing|strategy|consulting|entrepreneur|service/i)) {
      return 'business';
    }

    // Default to professional balanced style
    return 'professional';
  }

  private getStyleConfig(category: string): {
    style: string;
    guidance: string;
    instructions: string;
    imageContext: { single: string; first: string; second: string; third: string };
  } {
    const configs: Record<string, any> = {
      medical: {
        style: [
          "professional medical photography",
          "clean clinical aesthetic",
          "scientific accuracy",
          "trustworthy and credible",
          "modern laboratory setting",
          "high-quality professional lighting",
          "subtle blue and white tones"
        ].join(", "),
        guidance: "Crisp, clean composition. Professional medical imagery. Clinically proven aesthetic. Laboratory-grade quality. Evidence-based visual representation. Modern healthcare setting.",
        instructions: "EMPHASIZE professionalism, credibility, and scientific accuracy. Clinical setting, medical-grade presentation, trustworthy appearance.",
        imageContext: {
          single: "a professional clinical photograph",
          first: "a credible medical hero image",
          second: "a scientific supporting visual",
          third: "a detailed clinical close-up"
        }
      },
      finance: {
        style: [
          "professional financial photography",
          "sophisticated modern aesthetic",
          "trustworthy and secure",
          "clean business presentation",
          "premium quality imagery",
          "corporate credibility",
          "subtle blue and green professional tones"
        ].join(", "),
        guidance: "Sharp, professional composition. Financial sector credibility. Secure, trustworthy presentation. Modern fintech aesthetic. Premium business quality.",
        instructions: "EMPHASIZE trust, security, and financial professionalism. Corporate quality, sophisticated presentation, credible appearance.",
        imageContext: {
          single: "a professional financial photograph",
          first: "a trustworthy finance hero image",
          second: "a secure business visual",
          third: "a detailed financial close-up"
        }
      },
      technology: {
        style: [
          "modern tech photography",
          "sleek professional aesthetic",
          "innovative clean design",
          "high-tech presentation",
          "professional development setting",
          "contemporary digital imagery"
        ].join(", "),
        guidance: "Modern, professional composition. Tech-forward aesthetic. Clean digital representation. Professional development imagery. High-quality technical photography.",
        instructions: "EMPHASIZE innovation, professionalism, and technical excellence. Sleek design, modern aesthetic, professional quality.",
        imageContext: {
          single: "a professional technology photograph",
          first: "a modern tech hero image",
          second: "a technical visual",
          third: "a detailed tech close-up"
        }
      },
      ecommerce: {
        style: [
          "professional product photography",
          "clean e-commerce aesthetic",
          "high-quality commercial imagery",
          "appealing presentation",
          "modern retail photography",
          "professional lighting and composition"
        ].join(", "),
        guidance: "Clean, professional product presentation. Commercial quality imagery. Modern retail aesthetic. Appealing visual merchandising. High-end e-commerce photography.",
        instructions: "EMPHASIZE product quality, professional presentation, and commercial appeal. Clean background, professional lighting, retail-ready.",
        imageContext: {
          single: "a professional product photograph",
          first: "a commercial hero image",
          second: "a product detail visual",
          third: "a lifestyle product shot"
        }
      },
      gaming: {
        style: [
          "professional gaming photography",
          "sophisticated entertainment aesthetic",
          "modern premium presentation",
          "trustworthy and credible",
          "high-quality commercial imagery",
          "professional lighting"
        ].join(", "),
        guidance: "Professional, sophisticated composition. Premium gaming aesthetic. Trustworthy presentation. Modern entertainment imagery. High-quality commercial photography.",
        instructions: "EMPHASIZE professionalism, sophistication, and credibility. Premium quality, trustworthy appearance, modern aesthetic.",
        imageContext: {
          single: "a professional gaming photograph",
          first: "a premium gaming hero image",
          second: "an entertainment visual",
          third: "a detailed gaming close-up"
        }
      },
      creator: {
        style: [
          "professional media photography",
          "modern platform aesthetic",
          "sophisticated presentation",
          "business professional imagery",
          "contemporary digital media",
          "high-quality professional"
        ].join(", "),
        guidance: "Professional, business-focused composition. Modern platform aesthetic. Sophisticated media presentation. Professional digital imagery. High-quality photography.",
        instructions: "EMPHASIZE professionalism, business credibility, and modern platform aesthetic. Sophisticated, professional, business-ready.",
        imageContext: {
          single: "a professional media photograph",
          first: "a business platform hero image",
          second: "a professional media visual",
          third: "a detailed platform shot"
        }
      },
      industrial: {
        style: [
          "professional industrial photography",
          "modern construction aesthetic",
          "high-quality commercial imagery",
          "credible business presentation",
          "professional B2B photography",
          "clean industrial setting"
        ].join(", "),
        guidance: "Strong, professional composition. Industrial quality imagery. Modern construction aesthetic. B2B credibility. High-quality commercial photography.",
        instructions: "EMPHASIZE professionalism, industrial quality, and B2B credibility. Strong composition, professional setting, commercial quality.",
        imageContext: {
          single: "a professional industrial photograph",
          first: "an industrial hero image",
          second: "a construction visual",
          third: "a detailed industrial close-up"
        }
      },
      reputation: {
        style: [
          "professional trust-building photography",
          "clean credible aesthetic",
          "trustworthy presentation",
          "modern professional imagery",
          "high-quality business photography",
          "sophisticated composition"
        ].join(", "),
        guidance: "Professional, trust-building composition. Credible business imagery. Modern reputation aesthetic. Professional quality photography. Trustworthy presentation.",
        instructions: "EMPHASIZE trust, credibility, and professional quality. Clean presentation, trustworthy appearance, modern aesthetic.",
        imageContext: {
          single: "a professional trust-building photograph",
          first: "a credible hero image",
          second: "a trustworthy visual",
          third: "a detailed quality shot"
        }
      },
      business: {
        style: [
          "professional business photography",
          "modern corporate aesthetic",
          "sophisticated composition",
          "clean professional design",
          "confident and credible",
          "contemporary business setting"
        ].join(", "),
        guidance: "Sharp, professional composition. Modern business aesthetic. Sophisticated visual representation. Corporate credibility. Clean, confident imagery.",
        instructions: "EMPHASIZE professionalism, sophistication, and business credibility. Modern office aesthetic, corporate quality.",
        imageContext: {
          single: "a professional business photograph",
          first: "a corporate hero image",
          second: "a business concept visual",
          third: "a detailed professional shot"
        }
      },
      professional: {
        style: [
          "professional high-quality photography",
          "clean modern composition",
          "sophisticated aesthetic",
          "trustworthy presentation",
          "commercial grade imagery",
          "professional lighting and composition"
        ].join(", "),
        guidance: "Clean, professional composition. High-quality commercial imagery. Modern sophisticated aesthetic. Trustworthy presentation. Professional-grade photography.",
        instructions: "EMPHASIZE professionalism, quality, and sophistication. Clean modern aesthetic, professional presentation, commercial quality.",
        imageContext: {
          single: "a professional photograph",
          first: "a professional hero image",
          second: "a supporting visual",
          third: "a detailed close-up"
        }
      }
    };

    return configs[category] || configs.professional;
  }

  private convertToNanoBananaVisual(topic: string, keywords?: string[]): string {
    const topicLower = topic.toLowerCase();
    const keywordStr = keywords?.join(' ').toLowerCase() || '';
    const combined = `${topicLower} ${keywordStr}`;
    
    // Niche-specific professional mappings
    const nicheMappings: Record<string, string> = {
      // Medical/Peptides
      'peptide': 'professional peptide vials and molecular structure in modern clinical laboratory',
      'protein': 'premium protein supplement containers in professional medical setting',
      'supplement': 'high-quality supplement bottles in clean pharmaceutical environment',
      'performance enhancement': 'professional athletic performance testing equipment in modern facility',
      
      // Finance/Fintech
      'loan': 'modern financial technology interface with secure payment systems',
      'lending': 'professional banking technology and financial documents in corporate setting',
      'payment processing': 'secure payment terminal and fintech infrastructure in professional environment',
      'fintech': 'modern financial technology dashboard and secure transaction systems',
      'banking': 'professional banking interface and secure financial technology',
      
      // Technology/Development
      'web dev': 'modern web development workspace with clean code and professional monitors',
      'app dev': 'professional mobile app development environment with sleek interfaces',
      'software': 'clean software development workspace with modern technology',
      'programming': 'professional coding environment with multiple displays and clean workspace',
      'saas': 'modern SaaS platform interface on professional displays',
      
      // E-commerce
      'nails': 'premium nail products and professional manicure tools in clean beauty setting',
      'beauty': 'high-end beauty products professionally arranged in modern setting',
      'jersey': 'premium soccer jerseys professionally displayed in modern retail setting',
      'merchandise': 'professional product photography of high-quality merchandise',
      'ecom': 'professional e-commerce product display in modern clean setting',
      
      // Gambling/Gaming
      'gambling': 'professional casino environment with premium gaming interface',
      'betting': 'modern sports betting platform on sleek professional displays',
      'casino': 'sophisticated casino setting with premium gaming equipment',
      'poker': 'professional poker table in upscale gaming environment',
      
      // Creator Platforms
      'creator': 'professional content creation workspace with modern technology',
      'onlyfans': 'professional media platform interface and content creation workspace',
      'influencer': 'professional social media workspace with modern equipment',
      'platform': 'modern digital platform interface on professional displays',
      
      // Construction/Industrial
      'construction': 'modern construction site with professional equipment and clean safety standards',
      'contractor': 'professional contractor workspace with modern tools and blueprints',
      'building': 'contemporary building project with professional equipment',
      'industrial': 'modern industrial facility with professional equipment',
      
      // Reputation/Reviews
      'reputation': 'professional review system interface with five-star ratings',
      'review': 'modern customer feedback interface with testimonials',
      'rating': 'professional rating system display with trust badges',
      'testimonial': 'professional client testimonial display in modern format',
      
      // Business General
      'business': 'modern professional business environment with contemporary design',
      'corporate': 'sophisticated corporate office space with professional equipment',
      'marketing': 'professional marketing workspace with modern analytics displays',
      'consulting': 'contemporary consulting environment with professional presentation',
    };
    
    // Check niche mappings first (more specific)
    for (const [concept, visual] of Object.entries(nicheMappings)) {
      if (combined.includes(concept)) {
        console.log(`🎯 Matched niche: "${concept}" → Professional style`);
        return visual;
      }
    }
    
    // Default: professional interpretation
    return `professional high-quality photograph representing ${topic} in modern clean setting`;
  }

  private generateAltText(topic: string, imageNumber: number, totalImages: number): string {
    const cleanTopic = topic.replace(/[^\w\s]/g, "").trim();

    if (totalImages === 1) {
      return `Professional image representing ${cleanTopic}`;
    } else if (imageNumber === 1) {
      return `Hero image: ${cleanTopic}`;
    } else {
      return `Visual ${imageNumber}: ${cleanTopic}`;
    }
  }

  private generateFilename(topic: string, imageNumber: number): string {
    const slug = topic.toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
    const timestamp = Date.now();
    return `nano-banana-${slug}-${imageNumber}-${timestamp}.png`;
  }

  validateRequest(request: NanoBananaImagenRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.topic || request.topic.trim().length < 3) {
      errors.push("Topic must be at least 3 characters long");
    }

    if (request.count < 1 || request.count > 3) {
      errors.push("Image count must be between 1 and 3");
    }

    return { valid: errors.length === 0, errors };
  }

  async uploadToWordPress(
    base64Data: string,
    mimeType: string,
    filename: string,
    altText: string,
    wpCredentials: {
      url: string;
      username: string;
      applicationPassword: string;
    }
  ): Promise<{ id: number; url: string; filename: string }> {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mimeType });

      const formData = new FormData();
      formData.append("file", blob, filename);
      formData.append("title", altText);
      formData.append("alt_text", altText);
      formData.append("caption", `${altText} (Nano Banana)`);

      const wpUrl = wpCredentials.url.replace(/\/$/, "");
      const authHeader = Buffer.from(
        `${wpCredentials.username}:${wpCredentials.applicationPassword}`
      ).toString("base64");

      const response = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: { Authorization: `Basic ${authHeader}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`WordPress upload failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        id: result.id,
        url: result.source_url || result.guid?.rendered,
        filename: result.slug || filename,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload to WordPress: ${error.message}`);
    }
  }
}

export const nanoBananaImagenService = new NanoBananaImagenService();