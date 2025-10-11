import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { schedulerService } from './services/scheduler-service';
import autoSchedulesRouter from "./api/user/auto-schedules";

// =============================================================================
// TYPE DECLARATIONS
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
// UTILITY FUNCTIONS
// =============================================================================

// Simple logger function (inline to avoid import issues)
function log(message: string) {
  console.log(message);
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
// 1. TRUST PROXY
// =============================================================================

app.set('trust proxy', 1);

// =============================================================================
// 2. CORS - CRITICAL: MUST BE BEFORE ALL OTHER MIDDLEWARE
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  console.log(`🌐 CORS: ${req.method} ${req.path}`);
  console.log(`   Origin: ${origin || 'none'}`);
  
  // Define allowed origins (all Vercel deployments + production domains + local dev)
  const allowedOrigins = [
    'https://final-seo-tool.vercel.app',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Allow all Vercel preview deployments
  const isVercelPreview = origin && origin.includes('.vercel.app');
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);
  
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    console.log(`   ✅ CORS allowed for: ${origin}`);
  } else if (origin) {
    // For unknown origins, still allow but without credentials
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`   ⚠️ CORS allowed without credentials for: ${origin}`);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log(`   ⚡ Handling OPTIONS preflight`);
    return res.status(204).end();
  }

  next();
});

// =============================================================================
// 3. BASIC MIDDLEWARE
// =============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// =============================================================================
// 4. RATE LIMITING
// =============================================================================

const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.'
  });
};

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/gsc/auth', authLimiter);
app.use('/api/gsc/auth-url', authLimiter);
app.use('/api/gsc/oauth-callback', authLimiter);

// =============================================================================
// 5. SECURITY HEADERS
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  if (req.path === '/api/gsc/oauth-callback') {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  
  next();
});

app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
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

// =============================================================================
// 6. INPUT SANITIZATION
// =============================================================================

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
// 7. SESSION
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
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: undefined
  },
  rolling: true
}));

// =============================================================================
// 8. LOGGING
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
// 9. API REDIRECT HANDLER
// =============================================================================

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

// =============================================================================
// SERVER STARTUP
// =============================================================================

(async () => {
  try {
    // Dynamic imports to handle optional modules
    const { registerRoutes } = await import('./routes').catch(() => ({ 
      registerRoutes: async (app: any) => app 
    }));
    
    const server = await registerRoutes(app);
    
    app.use("/api/user/auto-schedules", autoSchedulesRouter);
    
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

    // =============================================================================
    // GLOBAL ERROR HANDLER (with CORS headers)
    // =============================================================================

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      // Ensure CORS headers are present on errors too
      const origin = req.headers.origin;
      const isVercelPreview = origin && origin.includes('.vercel.app');
      const allowedOrigins = [
        'https://final-seo-tool.vercel.app',
        'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);
      
      if (isAllowedOrigin && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
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

    // Setup Vite in development
    if (app.get("env") === "development") {
      try {
        const { setupVite } = await import('./vite');
        await setupVite(app, server);
      } catch (e) {
        console.log('Vite setup not available or failed, continuing without it');
      }
    } 

    app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      });
    });

    // =============================================================================
    // 404 HANDLER (with CORS headers)
    // =============================================================================

    app.use('*', (req: Request, res: Response) => {
      // Ensure CORS headers on 404s
      const origin = req.headers.origin;
      const isVercelPreview = origin && origin.includes('.vercel.app');
      const allowedOrigins = [
        'https://final-seo-tool.vercel.app',
        'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isVercelPreview);
      
      if (isAllowedOrigin && origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen({ port, host }, () => {
      log(`🚀 Server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      log(`🌐 CORS: Enabled for all Vercel deployments`);
      
      schedulerService.startScheduler(1);
      log(`⏰ Content scheduler started`);
      
      if (process.env.NODE_ENV === 'development') {
        log(`🛠️  Development mode: Vite dev server enabled`);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();

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