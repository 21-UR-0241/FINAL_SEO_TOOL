//server/index.ts
import express from "express";
import { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import { Pool } from '@neondatabase/serverless';
import pgSession from "connect-pg-simple";
import 'dotenv/config'; // must come before importing encryption-service
import { schedulerService } from './services/scheduler-service';
import autoSchedulesRouter from "./api/user/auto-schedules";
import helmet from 'helmet';
import rateLimit, { MemoryStore } from 'express-rate-limit';
import path from 'path';

// =============================================================================
// TYPE DECLARATIONS (moved to top)
// =============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email?: string;
        name?: string;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// =============================================================================
// SESSION STORE CONFIGURATION
// =============================================================================

const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool: new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }),
  tableName: 'sessions',
  createTableIfMissing: false,
});

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();

// =============================================================================
// TRUST PROXY - IMPORTANT FOR CLOUDFLARE
// =============================================================================

// Trust only the first proxy (Cloudflare) - prevents header spoofing
// This tells Express to trust the first proxy in the chain (Cloudflare)

app.set('trust proxy', 1);

// =============================================================================
// SECURITY MIDDLEWARE (Added - Early in the middleware stack)
// =============================================================================

// Custom JSON error handler for rate limiting
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.'
  });
};

// General rate limiter
// FIXED: Removed custom keyGenerator to use default which handles IPv6 properly
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip validation - we know we're behind Cloudflare and configured correctly
  validate: false,

});

// Auth rate limiter
// FIXED: Removed custom keyGenerator here as well
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip validation - we know we're behind Cloudflare and configured correctly
  validate: false,
});

// Apply rate limiting to routes
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/gsc/auth', authLimiter);
app.use('/api/gsc/auth-url', authLimiter);
app.use('/api/gsc/oauth-callback', authLimiter);

// JSON response handler for API redirects (AFTER rate limiters)
app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
  const originalRedirect = res.redirect.bind(res);
  res.redirect = function(url: string | number, status?: any) {
    if (typeof url === 'number') {
      return res.status(url).json({ 
        success: false, 
        message: 'Unauthorized', 
        redirect: status 
      });
    }
    return res.status(302).json({ 
      success: false, 
      message: 'Redirect required', 
      redirect: url 
    });
  };
  next();
});

// IMPORTANT: Custom COOP headers for OAuth popup communication
app.use((req: Request, res: Response, next: NextFunction) => {
  // Allow popup windows to communicate with parent window
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Special handling for OAuth callback
  if (req.path === '/api/gsc/oauth-callback') {
    res.removeHeader('X-Frame-Options');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  
  next();
});

// Helmet for security headers
app.use(helmet({
  crossOriginOpenerPolicy: false, // We set this manually above
  crossOriginEmbedderPolicy: false, // We set this manually above
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://www.googleapis.com", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "*.googleusercontent.com"],
      frameAncestors: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Simple input sanitization middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: any): any => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (!['password', 'token', 'refreshToken', 'accessToken', 'url', 'redirectUri', 'clientSecret'].includes(key)) {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  next();
});

// =============================================================================
// SESSION CONFIGURATION
// =============================================================================

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'ai-seo-session',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: undefined
  },
  rolling: true
}));

// =============================================================================
// LOGGING MIDDLEWARE
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});
// =============================================================================
// CORS CONFIGURATION
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://leaders-necklace-themselves-collective.trycloudflare.com',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  // Check if origin is allowed
  const isAllowed = origin && (
    allowedOrigins.includes(origin) || 
    origin.endsWith('.vercel.app') ||
    origin.includes('vercel.app')
  );

  if (isAllowed && origin) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    
    // Log CORS requests in development
    if (process.env.NODE_ENV === 'development') {
      log(`✅ CORS: Allowed ${req.method} from ${origin}`);
    }
  } else if (origin) {
    log(`⚠️ CORS: Blocked ${req.method} from ${origin}`);
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    if (isAllowed && origin) {
      return res.status(200).end();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Origin not allowed' 
      });
    }
  }

  next();
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

(async () => {
  try {
    // Register all API routes
    const server = await registerRoutes(app);
    
    // Manual trigger endpoint for testing scheduler
    app.post('/api/admin/trigger-scheduler', async (req: Request, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        const result = await schedulerService.manualProcess();
        res.json({ 
          success: true, 
          message: 'Scheduler triggered manually',
          result 
        });
      } catch (error: any) {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    });

    // Global error handler (must be after routes)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Global error handler:", err);
      
      const responseMessage = process.env.NODE_ENV === 'production' 
        ? status >= 500 ? 'Internal Server Error' : message
        : message;

      res.status(status).json({ 
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // Setup Vite for development or serve static files for production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } 

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      });
    });

    // 404 handler for unmatched routes
    app.use('*', (_req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Server configuration
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen({
      port,
      host,
    }, () => {
      log(`🚀 Server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      
      schedulerService.startScheduler(1); // Check every 1 minute
      log(`⏰ Content scheduler started - checking every minute for scheduled content`);
      
      if (process.env.NODE_ENV === 'development') {
        log(`🛠️  Development mode: Vite dev server enabled`);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();

app.use("/api/user/auto-schedules", autoSchedulesRouter);

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

process.on('SIGTERM', () => {
  log('🔴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('🔴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});