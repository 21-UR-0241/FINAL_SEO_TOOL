import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { schedulerService } from './services/scheduler-service';

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
        isAdmin?: boolean;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    username?: string;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function log(message: string) {
  console.log(message);
}

// =============================================================================
// SESSION STORE CONFIGURATION
// =============================================================================

const PgSession = pgSession(session);
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

const sessionStore = new PgSession({
  pool,
  tableName: 'sessions',
  createTableIfMissing: false,
});

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();

// =============================================================================
// ☢️ NUCLEAR CORS FIX - RUNS FIRST, BEFORE EVERYTHING ☢️
// This ensures CORS headers on ALL responses, especially OPTIONS preflight
// =============================================================================

app.use('*', (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || req.headers.referer || '*';
  
  console.log(`☢️ NUCLEAR CORS: ${req.method} ${req.path} from ${origin}`);
  
  // Force CORS headers on EVERY response
  res.setHeader('Access-Control-Allow-Origin', origin === '*' ? '*' : origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  
  // Handle OPTIONS preflight immediately - don't let it reach other middleware
  if (req.method === 'OPTIONS') {
    console.log(`☢️ NUCLEAR CORS: Handling OPTIONS preflight - sending 204`);
    return res.status(204).end();
  }
  
  next();
});

console.log('☢️ NUCLEAR CORS ACTIVATED - All requests will have CORS headers');

// =============================================================================
// 1. TRUST PROXY (CRITICAL FOR RENDER)
// =============================================================================

app.set('trust proxy', 1);

// =============================================================================
// 2. ULTRA-AGGRESSIVE CORS - FIRST MIDDLEWARE
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  console.log(`🌐 CORS: ${req.method} ${req.path}`);
  console.log(`   Origin: ${origin || 'NO ORIGIN'}`);
  
  // ULTRA-PERMISSIVE: Allow the requesting origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  
  // Handle OPTIONS preflight immediately
  if (req.method === 'OPTIONS') {
    console.log(`   ⚡ OPTIONS preflight - sending 204`);
    return res.status(204).end();
  }

  next();
});

// =============================================================================
// 3. RESPONSE INTERCEPTOR - Ensure CORS on ALL responses
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  
  const originalSend = res.send;
  const originalJson = res.json;
  const originalStatus = res.status;
  const originalEnd = res.end;
  
  // Override status
  res.status = function(code: number) {
    if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
      this.setHeader('Access-Control-Allow-Origin', origin);
      this.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return originalStatus.call(this, code);
  };
  
  // Override send
  res.send = function(data: any) {
    if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
      this.setHeader('Access-Control-Allow-Origin', origin);
      this.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return originalSend.call(this, data);
  };
  
  // Override json
  res.json = function(data: any) {
    if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
      this.setHeader('Access-Control-Allow-Origin', origin);
      this.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return originalJson.call(this, data);
  };
  
  // Override end
  res.end = function(chunk?: any, encoding?: any) {
    if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
      this.setHeader('Access-Control-Allow-Origin', origin);
      this.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// =============================================================================
// 4. BASIC MIDDLEWARE
// =============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// =============================================================================
// 5. CORS & SESSION TEST ENDPOINTS
// =============================================================================

app.get('/api/cors-test', (req: Request, res: Response) => {
  console.log('🧪 CORS Test GET Hit');
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/cors-test', (req: Request, res: Response) => {
  console.log('🧪 CORS Test POST Hit');
  res.json({ 
    success: true, 
    message: 'CORS POST is working!',
    origin: req.headers.origin,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// 6. RATE LIMITING
// =============================================================================

const rateLimitHandler = (req: Request, res: Response) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
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
// 7. SECURITY HEADERS
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
// 8. INPUT SANITIZATION
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
// 9. SESSION CONFIGURATION
// =============================================================================

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'ai-seo-session',
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: undefined,
    path: '/'
  },
  rolling: true
}));

// =============================================================================
// 10. SESSION MIDDLEWARE - Log session info on each request
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') && !req.path.includes('cors-test')) {
    console.log(`🔑 Session Info: ${req.method} ${req.path}`, {
      sessionID: req.sessionID?.substring(0, 8) + '...',
      hasSession: !!req.session,
      userId: req.session?.userId || 'none',
      cookie: req.headers.cookie?.substring(0, 50) + '...' || 'none'
    });
  }
  next();
});

// =============================================================================
// 11. SESSION DEBUG ENDPOINT
// =============================================================================

app.get('/api/session-debug', (req: Request, res: Response) => {
  console.log('🔍 Session Debug Full:', {
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    origin: req.headers.origin,
    secure: req.secure,
    protocol: req.protocol
  });
  
  res.json({
    success: true,
    hasSession: !!req.session,
    sessionID: req.sessionID,
    userId: req.session?.userId || null,
    username: req.session?.username || null,
    cookies: req.headers.cookie || 'none',
    origin: req.headers.origin || 'none',
    secure: req.secure,
    protocol: req.protocol,
    environment: process.env.NODE_ENV || 'development'
  });
});

// =============================================================================
// 12. LOGGING
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
        const preview = JSON.stringify(capturedJsonResponse).substring(0, 100);
        logLine += ` :: ${preview}${preview.length >= 100 ? '...' : ''}`;
      }

      log(logLine);
    }
  });

  next();
});

// =============================================================================
// 13. API REDIRECT HANDLER
// =============================================================================

app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
  const originalRedirect = res.redirect.bind(res);
  res.redirect = function(url: string | number, status?: any) {
    const origin = req.headers.origin;
    if (origin) {
      this.setHeader('Access-Control-Allow-Origin', origin);
      this.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
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
// 14. DEBUG MIDDLEWARE (Development Only)
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      console.log(`📤 Response for ${req.method} ${req.path}:`, {
        status: res.statusCode,
        corsOrigin: res.getHeader('access-control-allow-origin'),
        corsCredentials: res.getHeader('access-control-allow-credentials'),
      });
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      console.log(`📤 JSON Response for ${req.method} ${req.path}:`, {
        status: res.statusCode,
        corsOrigin: res.getHeader('access-control-allow-origin'),
        corsCredentials: res.getHeader('access-control-allow-credentials'),
      });
      return originalJson.call(this, data);
    };
    
    next();
  });
}

// =============================================================================
// 15. HEALTH CHECK - REGISTER BEFORE ROUTE LOADING (CRITICAL FIX!)
// =============================================================================

app.get('/health', (_req: Request, res: Response) => {
  console.log('❤️ Health check endpoint hit');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    port: process.env.PORT || '10000',
    database: 'connected'
  });
});

// =============================================================================
// SERVER STARTUP & ROUTES
// =============================================================================

(async () => {
  try {
    // =============================================================================
    // LOAD ROUTES - DON'T HIDE ERRORS!
    // =============================================================================
    
    console.log('📂 Attempting to load routes module...');
    
    let registerRoutes;
    try {
      const routesModule = await import('./routes.ts');
      registerRoutes = routesModule.registerRoutes;
      console.log('✅ Routes module loaded successfully from ./routes.ts');
    } catch (routeError: any) {
      console.error('❌ CRITICAL: Failed to load routes module');
      console.error('Error message:', routeError.message);
      console.error('Stack trace:', routeError.stack);
      console.error('⚠️ Server will continue with basic endpoints only');
      // Don't exit - let server run with health endpoint
    }
    
    if (registerRoutes && typeof registerRoutes === 'function') {
      try {
        console.log('🔧 Registering routes...');
        await registerRoutes(app);
        console.log('✅ All routes registered successfully');
      } catch (registerError: any) {
        console.error('❌ Error during route registration:', registerError.message);
        console.error('Stack:', registerError.stack);
      }
    } else {
      console.error('⚠️ registerRoutes is not a function - skipping route registration');
    }

    // =============================================================================
    // GLOBAL ERROR HANDLER
    // =============================================================================

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const origin = req.headers.origin;
      
      console.error("❌ Global Error Handler:", {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        origin: origin,
        userId: req.session?.userId || 'none'
      });
      
      // CRITICAL: Force CORS headers on ALL errors
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
      res.setHeader('Vary', 'Origin');
      
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      const responseMessage = process.env.NODE_ENV === 'production' 
        ? status >= 500 ? 'Internal Server Error' : message
        : message;

      res.status(status).json({ 
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack,
          path: req.path,
          method: req.method
        })
      });
    });

    // =============================================================================
    // SETUP VITE (Development Only)
    // =============================================================================

    if (app.get("env") === "development") {
      try {
        const { setupVite } = await import('./vite.ts');
        const httpServer = createServer(app);
        await setupVite(app, httpServer);
        console.log('✅ Vite dev server setup complete');
      } catch (e) {
        console.log('ℹ️ Vite setup skipped (not required for production)');
      }
    }

    // =============================================================================
    // 404 HANDLER - MUST BE LAST!
    // =============================================================================

    app.use('*', (req: Request, res: Response) => {
      const origin = req.headers.origin;
      
      console.log(`❌ 404: ${req.method} ${req.path}`);
      console.log(`   Origin: ${origin || 'none'}`);
      
      // Ensure CORS headers on 404
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
      res.setHeader('Vary', 'Origin');
      
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
          'GET /health',
          'GET /api/cors-test',
          'POST /api/cors-test',
          'GET /api/session-debug'
        ]
      });
    });

    // =============================================================================
    // START HTTP SERVER - CRITICAL FOR RENDER
    // =============================================================================

    const port = parseInt(process.env.PORT || '10000', 10);
    const host = '0.0.0.0';

    // Create HTTP server explicitly
    const httpServer = createServer(app);

    // CRITICAL: Use proper listen signature for Render
    httpServer.listen(port, host, () => {
      log(`\n${'='.repeat(60)}`);
      log(`🚀 Server LIVE on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      log(`🌐 CORS: Ultra-permissive mode (allows all origins)`);
      log(`🧪 Test endpoints:`);
      log(`   - Health Check: http://${host}:${port}/health`);
      log(`   - CORS Test: http://${host}:${port}/api/cors-test`);
      log(`   - Session Debug: http://${host}:${port}/api/session-debug`);
      
      // Start scheduler after server is listening
      try {
        schedulerService.startScheduler(1);
        log(`⏰ Content scheduler started`);
      } catch (schedulerError: any) {
        log(`⚠️ Scheduler failed to start: ${schedulerError.message}`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        log(`🛠️  Development mode: Vite dev server + verbose logging enabled`);
      }
      
      if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-super-secret-key-change-in-production') {
        log(`⚠️  WARNING: Using default SESSION_SECRET - change this in production!`);
      }
      
      log(`${'='.repeat(60)}\n`);
    });

    // Handle server errors
    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error: any) {
    console.error("❌❌❌ FATAL: Failed to start server");
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
})();

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

process.on('SIGTERM', () => {
  log('🔴 SIGTERM received, shutting down gracefully');
  pool.end(() => {
    log('🔌 Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('🔴 SIGINT received, shutting down gracefully');
  pool.end(() => {
    log('🔌 Database pool closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});