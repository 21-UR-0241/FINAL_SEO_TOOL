import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import cors from 'cors';
import { schedulerService } from './services/scheduler-service.js';

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
// UTILITY
// =============================================================================

function log(message: string) {
  console.log(message);
}

// =============================================================================
// SCHEDULER HEARTBEAT
// =============================================================================

let lastSchedulerTickISO: string | null = null;
export function markSchedulerTick() {
  lastSchedulerTickISO = new Date().toISOString();
}

// =============================================================================
// DATABASE POOL FOR SESSION STORE
// =============================================================================

const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Test connection on startup
sessionPool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Failed to connect to session database:', err);
    console.error('⚠️  Session functionality may be impaired');
  } else {
    console.log('✅ Session database connected successfully');
  }
});

// Handle pool errors
sessionPool.on('error', (err) => {
  console.error('❌ Unexpected error on session database client:', err);
});

// =============================================================================
// SESSION STORE
// =============================================================================

const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool: sessionPool,
  tableName: 'sessions',
  createTableIfMissing: false,
});

// Optional: observe store errors without crashing
sessionStore.on('error', (error) => {
  console.error('❌ Session store error:', error);
});

// =============================================================================
// EXPRESS APP
// =============================================================================

const app = express();

// Trust the first proxy (Render/other platforms)
app.set('trust proxy', 1);

// =============================================================================
/* CORS CONFIG - EXPORTED FOR USE IN ROUTES */
// =============================================================================

const ALLOWED_ORIGIN_LIST = [
  'https://final-seo-tool-a3yfd06px-nitros-projects-deeabea9.vercel.app', // prod
  'http://localhost:3000', // dev
];

// Allow any *.vercel.app (supports multi-label previews)
const vercelPreviewRegex = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

// Helper function to check if origin is allowed - EXPORTED
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // allow curl/server-to-server/no-origin
  return ALLOWED_ORIGIN_LIST.includes(origin) || vercelPreviewRegex.test(origin);
}

// Helper to add CORS headers - EXPORTED
export function addCorsHeaders(res: Response, origin: string | undefined): void {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// =============================================================================
/* HANDLE OPTIONS REQUESTS FIRST - BEFORE ANY OTHER MIDDLEWARE */
// =============================================================================

app.options('*', (req: Request, res: Response) => {
  const origin = req.headers.origin as string | undefined;
  
  console.log('🔍 OPTIONS request received:', { 
    path: req.path, 
    origin, 
    allowed: isOriginAllowed(origin) 
  });
  
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  
  return res.status(204).end();
});

// =============================================================================
/* CORS MIDDLEWARE */
// =============================================================================

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    const allowed = isOriginAllowed(origin);
    cb(null, allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['Set-Cookie', 'Content-Type'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// CORS decision log (helps confirm what the server decided)
app.use((req, _res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allowed = isOriginAllowed(origin);
  console.log('🌐 CORS check', { method: req.method, path: req.path, origin, allowed });
  next();
});

// =============================================================================
// BODY PARSERS
// =============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// =============================================================================
// SECURITY HEADERS (after CORS)
// =============================================================================

// For API routes: relaxed CSP/COOP/COEP as you had
app.use(
  '/api',
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// For non-API routes: stronger defaults with a tuned CSP
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'https://www.googleapis.com',
          'https://accounts.google.com',
          'https://oauth2.googleapis.com',
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', '*.googleusercontent.com'],
        frameAncestors: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Extra headers specific to your GSC OAuth callback
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

  if (req.path === '/api/gsc/oauth-callback') {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  next();
});

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

app.use((req: Request, _res: Response, next: NextFunction) => {
  const sanitizeString = (str: any): any => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (
        ![
          'password',
          'token',
          'refreshToken',
          'accessToken',
          'url',
          'redirectUri',
          'clientSecret',
        ].includes(key)
      ) {
        (req.body as any)[key] = sanitizeString((req.body as any)[key]);
      }
    });
  }

  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach((key) => {
      const v = (req.query as any)[key];
      if (typeof v === 'string') {
        (req.query as any)[key] = sanitizeString(v);
      }
    });
  }

  next();
});

// =============================================================================
// SESSIONS
// =============================================================================

const sessionMiddleware = session({
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
  },
  rolling: true,
});

// Wrap to catch session init errors without breaking CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip session for OPTIONS requests (already handled above)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  sessionMiddleware(req, res, (err) => {
    if (err) {
      console.error('❌ Session middleware error:', err);
      addCorsHeaders(res, req.headers.origin as string | undefined);
      
      return res.status(500).json({
        success: false,
        message: 'Session initialization error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
    next();
  });
});

// =============================================================================
// RATE LIMITING (after CORS, before routes)
// =============================================================================

const rateLimitHandler = (req: Request, res: Response) => {
  addCorsHeaders(res, req.headers.origin as string | undefined);
  
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
  });
};

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => req.method === 'OPTIONS',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => req.method === 'OPTIONS',
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/gsc/auth', authLimiter);
app.use('/api/gsc/auth-url', authLimiter);
app.use('/api/gsc/oauth-callback', authLimiter);

// =============================================================================
// REQUEST TIMEOUT HANDLER (before routes)
// =============================================================================

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const timeout = req.path.includes('/ai-fix') ? 300000 : 60000;
  
  req.setTimeout(timeout);
  res.setTimeout(timeout);
  
  const timeoutHandler = () => {
    if (!res.headersSent) {
      addCorsHeaders(res, req.headers.origin as string | undefined);
      
      res.status(504).json({
        success: false,
        message: 'Request timeout - operation took too long',
        error: 'The operation exceeded the maximum allowed time. For AI fixes, this usually means the operation is still running in the background.',
      });
    }
  };
  
  req.on('timeout', timeoutHandler);
  res.on('timeout', timeoutHandler);
  
  next();
});

// =============================================================================
// LOGGING (lightweight)
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const preview = JSON.stringify(capturedJsonResponse).substring(0, 100);
        line += ` :: ${preview}${preview.length >= 100 ? '...' : ''}`;
      }
      log(line);
    }
  });

  next();
});

// =============================================================================
// SIMPLE TEST + DIAGNOSTIC ENDPOINTS
// =============================================================================

app.get('/api/cors-test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/cors-test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CORS POST is working!',
    origin: req.headers.origin,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test-no-session', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'No session required!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/cors-dump', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    success: true,
    origin: req.headers.origin,
    sawAllowOrigin: !!res.getHeader('Access-Control-Allow-Origin'),
    allowOrigin: res.getHeader('Access-Control-Allow-Origin') || null,
    allowCreds: res.getHeader('Access-Control-Allow-Credentials') || null,
    note: 'If sawAllowOrigin is false, this origin was not allowed by the CORS middleware.',
  });
});

// =============================================================================
// API REDIRECT HANDLER (JSON-ify redirects under /api/*)
// =============================================================================

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const originalRedirect = res.redirect.bind(res);
  res.redirect = function (url: string | number, status?: any) {
    addCorsHeaders(res, req.headers.origin as string | undefined);
    
    if (typeof url === 'number') {
      return res.status(url).json({
        success: false,
        message: 'Unauthorized',
        redirect: status,
      });
    }
    return res.status(302).json({
      success: false,
      message: 'Redirect required',
      redirect: url,
    });
  };
  next();
});

// =============================================================================
// SPECIFIC ROUTE DEBUGGING (optional)
// =============================================================================

app.use('/api/user/websites/:id', (req, _res, next) => {
  console.log('🔍 Website-specific route hit:', {
    id: req.params.id,
    path: req.path,
    method: req.method,
    hasSession: !!req.session,
    sessionId: req.session?.userId,
  });
  next();
});

// =============================================================================
// SERVER STARTUP & ROUTES
// =============================================================================

(async () => {
  try {
    const { registerRoutes } = await import('./routes.js').catch(() => ({
      registerRoutes: async (x: any) => x,
    }));

    await registerRoutes(app);

    app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        port: process.env.PORT || '10000',
        database: sessionPool ? 'connected' : 'disconnected',
        lastSchedulerTick: lastSchedulerTickISO,
        pid: process.pid,
      });
    });

    // =============================================================================
    // GLOBAL ERROR HANDLER
    // =============================================================================

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      console.error('❌ Global Error Handler:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        statusCode: err.status || err.statusCode,
      });

      addCorsHeaders(res, req.headers.origin as string | undefined);

      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      const responseMessage =
        process.env.NODE_ENV === 'production'
          ? status >= 500
            ? 'Internal Server Error'
            : message
          : message;

      res.status(status).json({
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV === 'development' && {
          stack: err.stack,
          path: req.path,
          method: req.method,
        }),
      });
    });

    if (app.get('env') === 'development') {
      try {
        const { setupVite } = await import('./vite.js');
        const httpServerVite = createServer(app);
        await setupVite(app, httpServerVite);
      } catch (_e) {
        console.log('Vite setup not available or failed, continuing without it');
      }
    }

    // =============================================================================
    // 404 HANDLER
    // =============================================================================

    app.use('*', (req: Request, res: Response) => {
      console.log(`❌ 404: ${req.method} ${req.path}`);
      
      addCorsHeaders(res, req.headers.origin as string | undefined);
      
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
      });
    });

    // =============================================================================
    // START HTTP SERVER
    // =============================================================================

    const port = parseInt(process.env.PORT || '10000', 10);
    const host = '0.0.0.0';
    const httpServer = createServer(app);

    httpServer.listen(port, host, () => {
      log(`🚀 Server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      log(`🌐 CORS: Allowed origins + credentials`);
      log(`🧪 CORS Test: http://${host}:${port}/api/cors-test`);
      log(`🧪 CORS Dump: http://${host}:${port}/api/cors-dump`);
      log(`🧪 No-Session Test: http://${host}:${port}/api/test-no-session`);

      try {
        schedulerService.startScheduler(1);
        log(`⏰ Content scheduler started`);
      } catch (schedError) {
        console.error('⚠️  Scheduler failed to start:', schedError);
      }

      if (process.env.NODE_ENV === 'development') {
        log(`🛠️  Development mode: Vite dev server + verbose logging enabled`);
      }
    });

    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error(`⚠️  Check for duplicate server starts or circular imports`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

process.on('SIGTERM', () => {
  log('🔴 SIGTERM received, shutting down gracefully');
  sessionPool.end(() => {
    log('🔴 Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('🔴 SIGINT received, shutting down gracefully');
  sessionPool.end(() => {
    log('🔴 Database pool closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  setTimeout(() => process.exit(1), 300);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  setTimeout(() => process.exit(1), 300);
});