// import 'dotenv/config';
// import express, { Request, Response, NextFunction } from 'express';
// import session from 'express-session';
// import pgSession from 'connect-pg-simple';
// import { Pool } from 'pg';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import { createServer } from 'http';
// import { schedulerService } from './services/scheduler-service.ts';

// // =============================================================================
// // TYPE DECLARATIONS
// // =============================================================================

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         username: string;
//         email?: string;
//         name?: string;
//         isAdmin?: boolean;
//       };
//     }
//   }
// }

// declare module 'express-session' {
//   interface SessionData {
//     userId: string;
//     username?: string;
//   }
// }

// // =============================================================================
// // UTILITY FUNCTIONS
// // =============================================================================

// function log(message: string) {
//   console.log(message);
// }

// // =============================================================================
// // CORS CONFIGURATION
// // =============================================================================

// const ALLOWED_ORIGINS = [
//   'https://final-seo-tool.vercel.app',
//   'http://localhost:5173',
//   'http://localhost:3000',
//   'http://localhost:5000'
// ];

// // Helper function to check if origin is allowed
// const isAllowedOrigin = (origin: string | undefined): boolean => {
//   if (!origin) return false;
  
//   // In production (Render), allow all vercel.app domains if enabled via env variable
//   if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && origin.includes('.vercel.app')) {
//     return true;
//   }
  
//   // Check against explicit allowed origins
//   return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
// };

// // =============================================================================
// // SESSION STORE CONFIGURATION
// // =============================================================================

// const PgSession = pgSession(session);
// const pool = new Pool({ 
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// // Test database connection
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('❌ Database connection failed:', err);
//   } else {
//     console.log('✅ Database connected:', res.rows[0].now);
//   }
// });

// const sessionStore = new PgSession({
//   pool,
//   tableName: 'sessions',
//   createTableIfMissing: false,
// });

// // =============================================================================
// // EXPRESS APP SETUP
// // =============================================================================

// const app = express();

// // =============================================================================
// // 1. TRUST PROXY - MUST BE FIRST
// // =============================================================================

// app.set('trust proxy', 1);

// // =============================================================================
// // 2. NUCLEAR OPTIONS HANDLER - HANDLES ALL PREFLIGHT REQUESTS
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   // Handle OPTIONS IMMEDIATELY before anything else can interfere
//   if (req.method === 'OPTIONS') {
//     const origin = req.headers.origin;
    
//     console.log(`⚡ OPTIONS ${req.path} from ${origin || 'unknown'}`);
    
//     // Check if origin is allowed
//     if (origin && isAllowedOrigin(origin)) {
//       res.setHeader('Access-Control-Allow-Origin', origin);
//       res.setHeader('Access-Control-Allow-Credentials', 'true');
//     } else {
//       // For development or non-browser requests
//       res.setHeader('Access-Control-Allow-Origin', '*');
//     }
    
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
//     res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Type');
//     res.setHeader('Access-Control-Max-Age', '86400');
//     res.setHeader('Vary', 'Origin');
    
//     // Send 200 immediately - don't let anything else process this
//     return res.status(200).end();
//   }
  
//   // Not an OPTIONS request, continue to next middleware
//   next();
// });

// // =============================================================================
// // 3. CORS FOR ALL OTHER REQUESTS
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const origin = req.headers.origin;
  
//   // Set CORS headers based on origin
//   if (origin && isAllowedOrigin(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     console.log(`✅ CORS allowed for: ${origin}`);
//   } else if (!origin) {
//     // For non-browser requests (like server-to-server)
//     res.setHeader('Access-Control-Allow-Origin', '*');
//   } else {
//     // Origin not in allowed list
//     console.log(`⚠️ CORS blocked for: ${origin}`);
//     res.setHeader('Access-Control-Allow-Origin', '*');
//   }
  
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
//   res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Type');
//   res.setHeader('Vary', 'Origin');
  
//   next();
// });

// // =============================================================================
// // 4. BODY PARSERS
// // =============================================================================

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: false }));

// // =============================================================================
// // 5. CORS TEST ENDPOINTS (Before rate limiting)
// // =============================================================================

// app.get('/api/cors-test', (req: Request, res: Response) => {
//   console.log('🧪 CORS Test GET Hit');
//   res.json({ 
//     success: true, 
//     message: 'CORS is working!',
//     origin: req.headers.origin,
//     isAllowed: isAllowedOrigin(req.headers.origin),
//     allowedOrigins: ALLOWED_ORIGINS,
//     allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === 'true',
//     timestamp: new Date().toISOString()
//   });
// });

// app.post('/api/cors-test', (req: Request, res: Response) => {
//   console.log('🧪 CORS Test POST Hit');
//   res.json({ 
//     success: true, 
//     message: 'CORS POST is working!',
//     origin: req.headers.origin,
//     isAllowed: isAllowedOrigin(req.headers.origin),
//     body: req.body,
//     timestamp: new Date().toISOString()
//   });
// });

// // =============================================================================
// // 6. RATE LIMITING (Skip OPTIONS)
// // =============================================================================

// const rateLimitHandler = (req: Request, res: Response) => {
//   const origin = req.headers.origin;
//   if (origin && isAllowedOrigin(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//   }
//   res.status(429).json({
//     success: false,
//     message: 'Too many requests, please try again later.'
//   });
// };

// const generalLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 500,
//   handler: rateLimitHandler,
//   standardHeaders: true,
//   legacyHeaders: false,
//   validate: false,
//   skip: (req) => req.method === 'OPTIONS',
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   handler: rateLimitHandler,
//   skipSuccessfulRequests: true,
//   standardHeaders: true,
//   legacyHeaders: false,
//   validate: false,
//   skip: (req) => req.method === 'OPTIONS',
// });

// app.use('/api/', generalLimiter);
// app.use('/api/auth/', authLimiter);
// app.use('/api/gsc/auth', authLimiter);
// app.use('/api/gsc/auth-url', authLimiter);
// app.use('/api/gsc/oauth-callback', authLimiter);

// // =============================================================================
// // 7. SECURITY HEADERS
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
//   res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
//   if (req.path === '/api/gsc/oauth-callback' || req.path === '/api/auth/google/callback') {
//     res.setHeader('X-Frame-Options', 'SAMEORIGIN');
//   }
  
//   next();
// });

// app.use(helmet({
//   crossOriginOpenerPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       connectSrc: ["'self'", "https://www.googleapis.com", "https://accounts.google.com", "https://oauth2.googleapis.com"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
//       imgSrc: ["'self'", "data:", "https:", "*.googleusercontent.com"],
//       frameAncestors: ["'self'"],
//     },
//   },
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   }
// }));

// // =============================================================================
// // 8. INPUT SANITIZATION
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const sanitizeString = (str: any): any => {
//     if (typeof str !== 'string') return str;
//     return str
//       .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
//       .replace(/on\w+\s*=/gi, '')
//       .trim();
//   };

//   if (req.body && typeof req.body === 'object') {
//     Object.keys(req.body).forEach(key => {
//       if (!['password', 'token', 'refreshToken', 'accessToken', 'url', 'redirectUri', 'clientSecret'].includes(key)) {
//         req.body[key] = sanitizeString(req.body[key]);
//       }
//     });
//   }

//   if (req.query && typeof req.query === 'object') {
//     Object.keys(req.query).forEach(key => {
//       if (typeof req.query[key] === 'string') {
//         req.query[key] = sanitizeString(req.query[key] as string);
//       }
//     });
//   }

//   next();
// });

// // =============================================================================
// // 9. SESSION CONFIGURATION
// // =============================================================================

// app.use(session({
//   store: sessionStore,
//   secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
//   resave: false,
//   saveUninitialized: false,
//   name: 'ai-seo-session',
//   proxy: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     domain: undefined,
//     path: '/'
//   },
//   rolling: true
// }));

// // =============================================================================
// // 10. REQUEST LOGGER
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   if (req.path.startsWith('/api') && !req.path.includes('cors-test')) {
//     console.log(`📥 ${req.method} ${req.path}`, {
//       origin: req.headers.origin || 'none',
//       allowed: req.headers.origin ? isAllowedOrigin(req.headers.origin) : 'N/A',
//       cookie: req.headers.cookie ? 'present' : 'missing',
//       sessionID: req.sessionID?.substring(0, 8) + '...' || 'none',
//       userId: req.session?.userId || 'none'
//     });
//   }
//   next();
// });

// // =============================================================================
// // 11. SESSION DEBUG ENDPOINT
// // =============================================================================

// app.get('/api/session-debug', (req: Request, res: Response) => {
//   console.log('🔍 Session Debug Full:', {
//     sessionID: req.sessionID,
//     session: req.session,
//     cookies: req.headers.cookie,
//     origin: req.headers.origin,
//     secure: req.secure,
//     protocol: req.protocol
//   });
  
//   res.json({
//     success: true,
//     hasSession: !!req.session,
//     sessionID: req.sessionID,
//     userId: req.session?.userId || null,
//     username: req.session?.username || null,
//     cookies: req.headers.cookie || 'none',
//     origin: req.headers.origin || 'none',
//     originAllowed: isAllowedOrigin(req.headers.origin),
//     allowedOrigins: ALLOWED_ORIGINS,
//     allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === 'true',
//     secure: req.secure,
//     protocol: req.protocol,
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // =============================================================================
// // 12. LOGGING MIDDLEWARE
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson: any, ...args: any[]) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         const preview = JSON.stringify(capturedJsonResponse).substring(0, 100);
//         logLine += ` :: ${preview}${preview.length >= 100 ? '...' : ''}`;
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// // =============================================================================
// // SERVER STARTUP & ROUTES
// // =============================================================================

// (async () => {
//   try {
//     // Dynamic imports to handle optional modules
//     const { registerRoutes } = await import('./routes.ts').catch(() => ({ 
//       registerRoutes: async (app: any) => app 
//     }));
    
//     await registerRoutes(app);
    
//     // Health check endpoint
//     app.get('/health', (_req: Request, res: Response) => {
//       res.json({
//         status: 'healthy',
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV || 'development',
//         uptime: process.uptime(),
//         port: process.env.PORT || '10000',
//         database: 'connected',
//         allowedOrigins: ALLOWED_ORIGINS,
//         allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === 'true'
//       });
//     });

//     // Root endpoint
//     app.get('/', (req: Request, res: Response) => {
//       res.json({ 
//         message: 'SEO Tool API Server',
//         version: '1.0.0',
//         status: 'running',
//         endpoints: {
//           health: '/health',
//           api: '/api/*',
//           corsTest: '/api/cors-test',
//           sessionDebug: '/api/session-debug'
//         }
//       });
//     });

//     // =============================================================================
//     // GLOBAL ERROR HANDLER
//     // =============================================================================

//     app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
//       const origin = req.headers.origin;
      
//       console.error("❌ Global Error Handler:", {
//         message: err.message,
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//         path: req.path,
//         method: req.method,
//         origin: origin,
//         userId: req.session?.userId || 'none'
//       });
      
//       // CRITICAL: Force CORS headers on ALL errors
//       if (origin && isAllowedOrigin(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         res.setHeader('Access-Control-Allow-Credentials', 'true');
//       } else {
//         res.setHeader('Access-Control-Allow-Origin', '*');
//       }
//       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//       res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
//       res.setHeader('Vary', 'Origin');
      
//       const status = err.status || err.statusCode || 500;
//       const message = err.message || "Internal Server Error";
      
//       const responseMessage = process.env.NODE_ENV === 'production' 
//         ? status >= 500 ? 'Internal Server Error' : message
//         : message;

//       res.status(status).json({ 
//         success: false,
//         message: responseMessage,
//         ...(process.env.NODE_ENV === 'development' && { 
//           stack: err.stack,
//           path: req.path,
//           method: req.method
//         })
//       });
//     });

//     // Setup Vite in development only
//     // In production, vite won't be available and this will safely skip
//     if (process.env.NODE_ENV !== 'production') {
//       try {
//         console.log('🛠️ Development mode: Attempting to load Vite...');
//         const { setupVite } = await import('./vite.ts').catch(() => ({ setupVite: null }));
//         if (setupVite) {
//           const httpServer = createServer(app);
//           await setupVite(app, httpServer);
//           console.log('✅ Vite dev server initialized');
//         } else {
//           console.log('⚠️ Vite module not found, continuing without it');
//         }
//       } catch (e: any) {
//         console.log('⚠️ Vite setup failed:', e.message);
//       }
//     } else {
//       console.log('✅ Production mode: Skipping Vite (as expected)');
//     }

//     // =============================================================================
//     // 404 HANDLER
//     // =============================================================================

//     app.use('*', (req: Request, res: Response) => {
//       const origin = req.headers.origin;
      
//       console.log(`❌ 404: ${req.method} ${req.path}`);
//       console.log(`   Origin: ${origin || 'none'}`);
      
//       // Ensure CORS headers on 404
//       if (origin && isAllowedOrigin(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//         res.setHeader('Access-Control-Allow-Credentials', 'true');
//       } else {
//         res.setHeader('Access-Control-Allow-Origin', '*');
//       }
//       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//       res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
//       res.setHeader('Vary', 'Origin');
      
//       res.status(404).json({
//         success: false,
//         message: 'Route not found',
//         path: req.path,
//         method: req.method
//       });
//     });

//     // =============================================================================
//     // START HTTP SERVER - CRITICAL FOR RENDER
//     // =============================================================================

//     const port = parseInt(process.env.PORT || '10000', 10);
//     const host = '0.0.0.0';

//     // Create HTTP server explicitly
//     const httpServer = createServer(app);

//     // CRITICAL: Use proper listen signature for Render
//     httpServer.listen(port, host, () => {
//       log(`\n${'='.repeat(60)}`);
//       log(`🚀 Server running on http://${host}:${port}`);
//       log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
//       log(`🔐 Session store: PostgreSQL`);
//       log(`🛡️ Security: Helmet + Rate Limiting enabled`);
//       log(`📡 API available at: http://${host}:${port}/api`);
//       log(`🌐 CORS: Whitelist mode`);
//       log(`   Allowed origins:`);
//       ALLOWED_ORIGINS.forEach(origin => log(`   - ${origin}`));
//       if (process.env.ALLOW_VERCEL_PREVIEWS === 'true') {
//         log(`   ✅ Vercel preview deployments: ENABLED`);
//         log(`   - All *.vercel.app domains allowed`);
//       } else {
//         log(`   ⚠️ Vercel preview deployments: DISABLED`);
//         log(`   - Set ALLOW_VERCEL_PREVIEWS=true to enable`);
//       }
//       log(`🧪 Test endpoints:`);
//       log(`   - CORS Test: http://${host}:${port}/api/cors-test`);
//       log(`   - Session Debug: http://${host}:${port}/api/session-debug`);
//       log(`   - Health Check: http://${host}:${port}/health`);
      
//       // Start scheduler after server is listening
//       schedulerService.startScheduler(1);
//       log(`⏰ Content scheduler started`);
      
//       if (process.env.NODE_ENV === 'development') {
//         log(`🛠️  Development mode: Vite dev server + verbose logging enabled`);
//       }
      
//       if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-super-secret-key-change-in-production') {
//         log(`⚠️  WARNING: Using default SESSION_SECRET - change this in production!`);
//       }
      
//       log(`${'='.repeat(60)}\n`);
//     });

//     // Handle server errors
//     httpServer.on('error', (error: any) => {
//       if (error.code === 'EADDRINUSE') {
//         console.error(`❌ Port ${port} is already in use`);
//         process.exit(1);
//       } else {
//         console.error('❌ Server error:', error);
//         process.exit(1);
//       }
//     });

//   } catch (error) {
//     console.error("❌ Failed to start server:", error);
//     process.exit(1);
//   }
// })();

// // =============================================================================
// // GRACEFUL SHUTDOWN
// // =============================================================================

// process.on('SIGTERM', () => {
//   log('🔴 SIGTERM received, shutting down gracefully');
//   pool.end(() => {
//     log('🔌 Database pool closed');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   log('🔴 SIGINT received, shutting down gracefully');
//   pool.end(() => {
//     log('🔌 Database pool closed');
//     process.exit(0);
//   });
// });

// process.on('uncaughtException', (error) => {
//   console.error('❌ Uncaught Exception:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });



import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { schedulerService } from "./services/scheduler-service.ts";
// Import billing routes (single file)
import billingRoutes from "./routes/billing";

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
        stripeCustomerId?: string;
      };
    }
  }
}

declare module "express-session" {
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
// CORS CONFIGURATION
// =============================================================================

const ALLOWED_ORIGINS = [
  "https://final-seo-tool.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

// Helper function to check if origin is allowed
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;

  // In production (Render), allow all vercel.app domains if enabled via env variable
  if (
    process.env.ALLOW_VERCEL_PREVIEWS === "true" &&
    origin.includes(".vercel.app")
  ) {
    return true;
  }

  // Check against explicit allowed origins
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
};

// =============================================================================
// SESSION STORE CONFIGURATION
// =============================================================================

const PgSession = pgSession(session);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : (false as any),
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected:", res.rows[0].now);
  }
});

const sessionStore = new PgSession({
  pool,
  tableName: "sessions",
  createTableIfMissing: false,
});

// Export pool for use in billing routes
export { pool };

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();

// =============================================================================
// 1. TRUST PROXY - MUST BE FIRST
// =============================================================================

app.set("trust proxy", 1);

// =============================================================================
// 2. NUCLEAR OPTIONS HANDLER - HANDLES ALL PREFLIGHT REQUESTS
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  // Handle OPTIONS IMMEDIATELY before anything else can interfere
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    console.log(`⚡ OPTIONS ${req.path} from ${origin || "unknown"}`);

    // Check if origin is allowed
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      // For development or non-browser requests
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token",
    );
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Vary", "Origin");

    // Send 200 immediately - don't let anything else process this
    return res.status(200).end();
  }

  // Not an OPTIONS request, continue to next middleware
  next();
});

// =============================================================================
// 3. CORS FOR ALL OTHER REQUESTS
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Set CORS headers based on origin
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    console.log(`✅ CORS allowed for: ${origin}`);
  } else if (!origin) {
    // For non-browser requests (like server-to-server)
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // Origin not in allowed list
    console.log(`⚠️ CORS blocked for: ${origin}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token",
  );
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie, Content-Type");
  res.setHeader("Vary", "Origin");

  next();
});

// =============================================================================
// 4. BODY PARSERS
// =============================================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// =============================================================================
// 5. CORS TEST ENDPOINTS (Before rate limiting)
// =============================================================================

app.get("/api/cors-test", (req: Request, res: Response) => {
  console.log("🧪 CORS Test GET Hit");
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    isAllowed: isAllowedOrigin(req.headers.origin),
    allowedOrigins: ALLOWED_ORIGINS,
    allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/cors-test", (req: Request, res: Response) => {
  console.log("🧪 CORS Test POST Hit");
  res.json({
    success: true,
    message: "CORS POST is working!",
    origin: req.headers.origin,
    isAllowed: isAllowedOrigin(req.headers.origin),
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// 6. RATE LIMITING (Skip OPTIONS)
// =============================================================================

const rateLimitHandler = (req: Request, res: Response) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
  });
};

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => req.method === "OPTIONS",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => req.method === "OPTIONS",
});

// Rate limit for billing/payment endpoints (more restrictive)
const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => req.method === "OPTIONS",
});

app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/gsc/auth", authLimiter);
app.use("/api/gsc/auth-url", authLimiter);
app.use("/api/gsc/oauth-callback", authLimiter);
app.use("/api/billing/", billingLimiter);

// =============================================================================
// 7. SECURITY HEADERS
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

  if (
    req.path === "/api/gsc/oauth-callback" ||
    req.path === "/api/auth/google/callback"
  ) {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
  }

  next();
});

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://www.googleapis.com",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com",
          "https://api.stripe.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.stripe.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "*.googleusercontent.com"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// =============================================================================
// 8. INPUT SANITIZATION
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: any): any => {
    if (typeof str !== "string") return str;
    return str
      .replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        "",
      )
      .replace(/on\w+\s*=/gi, "")
      .trim();
  };

  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (
        ![
          "password",
          "token",
          "refreshToken",
          "accessToken",
          "url",
          "redirectUri",
          "clientSecret",
        ].includes(key)
      ) {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  if (req.query && typeof req.query === "object") {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  next();
});

// =============================================================================
// 9. SESSION CONFIGURATION
// =============================================================================

app.use(
  session({
    store: sessionStore,
    secret:
      process.env.SESSION_SECRET ||
      "your-super-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "ai-seo-session",
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: undefined,
      path: "/",
    },
    rolling: true,
  }),
);

// =============================================================================
// 10. AUTHENTICATION MIDDLEWARE
// =============================================================================

// Attach user to request if session exists
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    // Set user on request object for billing routes
    req.user = {
      id: req.session.userId,
      username: req.session.username || req.session.userId,
      email: undefined, // Fetch from database if needed
      name: undefined, // Fetch from database if needed
    };
  }
  next();
});

// =============================================================================
// 11. REQUEST LOGGER
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/api") && !req.path.includes("cors-test")) {
    console.log(`📥 ${req.method} ${req.path}`, {
      origin: req.headers.origin || "none",
      allowed: req.headers.origin
        ? isAllowedOrigin(req.headers.origin)
        : "N/A",
      cookie: req.headers.cookie ? "present" : "missing",
      sessionID: req.sessionID?.substring(0, 8) + "..." || "none",
      userId: req.session?.userId || "none",
      hasUser: !!req.user,
    });
  }
  next();
});

// =============================================================================
// 12. SESSION DEBUG ENDPOINT
// =============================================================================

app.get("/api/session-debug", (req: Request, res: Response) => {
  console.log("🔍 Session Debug Full:", {
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    origin: req.headers.origin,
    secure: req.secure,
    protocol: req.protocol,
  });

  res.json({
    success: true,
    hasSession: !!req.session,
    sessionID: req.sessionID,
    userId: req.session?.userId || null,
    username: req.session?.username || null,
    cookies: req.headers.cookie || "none",
    origin: req.headers.origin || "none",
    originAllowed: isAllowedOrigin(req.headers.origin),
    allowedOrigins: ALLOWED_ORIGINS,
    allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
    secure: req.secure,
    protocol: req.protocol,
    environment: process.env.NODE_ENV || "development",
  });
});

// =============================================================================
// 13. LOGGING MIDDLEWARE
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
        logLine += ` :: ${preview}${preview.length >= 100 ? "..." : ""}`;
      }
      log(logLine);
    }
  });

  next();
});

// =============================================================================
// SERVER STARTUP & ROUTES
// =============================================================================

(async () => {
  try {
    // Dynamic imports to handle optional modules
    const { registerRoutes } = await import("./routes.ts").catch(() => ({
      registerRoutes: async (app: any) => app,
    }));

    await registerRoutes(app);

    // Billing routes (with authentication already handled)
    app.use("/api/billing", billingRoutes);

    // Health check endpoint
    app.get("/health", (_req: Request, res: Response) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        port: process.env.PORT || "10000",
        database: "connected",
        allowedOrigins: ALLOWED_ORIGINS,
        allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
        billing: {
          stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
          webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        },
      });
    });

    // Root endpoint
    app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "SEO Tool API Server",
        version: "1.0.0",
        status: "running",
        endpoints: {
          health: "/health",
          api: "/api/*",
          corsTest: "/api/cors-test",
          sessionDebug: "/api/session-debug",
          billing: "/api/billing/*",
        },
      });
    });

    // =============================================================================
    // GLOBAL ERROR HANDLER
    // =============================================================================

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const origin = req.headers.origin;

      console.error("❌ Global Error Handler:", {
        message: err.message,
        stack:
          process.env.NODE_ENV === "development" ? err.stack : undefined,
        path: req.path,
        method: req.method,
        origin: origin,
        userId: req.session?.userId || "none",
      });

      // CRITICAL: Force CORS headers on ALL errors
      if (origin && isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token",
      );
      res.setHeader("Vary", "Origin");

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      const responseMessage =
        process.env.NODE_ENV === "production"
          ? status >= 500
            ? "Internal Server Error"
            : message
          : message;

      res.status(status).json({
        success: false,
        message: responseMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: err.stack,
          path: req.path,
          method: req.method,
        }),
      });
    });

    // Setup Vite in development only
    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("🛠️ Development mode: Attempting to load Vite...");
        const { setupVite } = await import("./vite.ts").catch(() => ({
          setupVite: null,
        }));
        if (setupVite) {
          const httpServer = createServer(app);
          await setupVite(app, httpServer);
          console.log("✅ Vite dev server initialized");
        } else {
          console.log("⚠️ Vite module not found, continuing without it");
        }
      } catch (e: any) {
        console.log("⚠️ Vite setup failed:", e.message);
      }
    } else {
      console.log("✅ Production mode: Skipping Vite (as expected)");
    }

    // =============================================================================
    // 404 HANDLER
    // =============================================================================

    app.use("*", (req: Request, res: Response) => {
      const origin = req.headers.origin;

      console.log(`❌ 404: ${req.method} ${req.path}`);
      console.log(`   Origin: ${origin || "none"}`);

      // Ensure CORS headers on 404
      if (origin && isAllowedOrigin(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie",
      );
      res.setHeader("Vary", "Origin");

      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
        method: req.method,
      });
    });

    // =============================================================================
    // START HTTP SERVER - CRITICAL FOR RENDER
    // =============================================================================

    const port = parseInt(process.env.PORT || "10000", 10);
    const host = "0.0.0.0";

    // Create HTTP server explicitly
    const httpServer = createServer(app);

    httpServer.listen(port, host, () => {
      log(`\n${"=".repeat(60)}`);
      log(`🚀 Server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      log(
        `💳 Billing API: http://${host}:${port}/api/billing/subscription`,
      );
      log(
        `🔔 Stripe webhooks: http://${host}:${port}/api/billing/webhooks/stripe`,
      );
      log(`🌐 CORS: Whitelist mode`);
      log(`   Allowed origins:`);
      ALLOWED_ORIGINS.forEach((origin) => log(`   - ${origin}`));
      if (process.env.ALLOW_VERCEL_PREVIEWS === "true") {
        log(`   ✅ Vercel preview deployments: ENABLED`);
        log(`   - All *.vercel.app domains allowed`);
      } else {
        log(`   ⚠️ Vercel preview deployments: DISABLED`);
        log(`   - Set ALLOW_VERCEL_PREVIEWS=true to enable`);
      }
      log(`🧪 Test endpoints:`);
      log(`   - CORS Test: http://${host}:${port}/api/cors-test`);
      log(`   - Session Debug: http://${host}:${port}/api/session-debug`);
      log(`   - Health Check: http://${host}:${port}/health`);

      // Start scheduler after server is listening
      schedulerService.startScheduler(1);
      log(`⏰ Content scheduler started`);

      if (process.env.NODE_ENV === "development") {
        log(
          `🛠️  Development mode: Vite dev server + verbose logging enabled`,
        );
      }

      if (
        !process.env.SESSION_SECRET ||
        process.env.SESSION_SECRET ===
          "your-super-secret-key-change-in-production"
      ) {
        log(
          `⚠️  WARNING: Using default SESSION_SECRET - change this in production!`,
        );
      }

      log(`${"=".repeat(60)}\n`);
    });

    // Handle server errors
    httpServer.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
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

process.on("SIGTERM", () => {
  log("🔴 SIGTERM received, shutting down gracefully");
  pool.end(() => {
    log("🔌 Database pool closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  log("🔴 SIGINT received, shutting down gracefully");
  pool.end(() => {
    log("🔌 Database pool closed");
    process.exit(0);
  });
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});