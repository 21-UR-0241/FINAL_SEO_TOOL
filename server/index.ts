// import 'dotenv/config';
// import express, { Request, Response, NextFunction } from 'express';
// import session from 'express-session';
// import pgSession from 'connect-pg-simple';
// import { Pool } from 'pg';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import { schedulerService } from './services/scheduler-service';
// import autoSchedulesRouter from "./api/user/auto-schedules";

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
//       };
//     }
//   }
// }

// declare module 'express-session' {
//   interface SessionData {
//     userId: string;
//   }
// }

// // =============================================================================
// // UTILITY FUNCTIONS
// // =============================================================================

// function log(message: string) {
//   console.log(message);
// }

// // =============================================================================
// // SESSION STORE CONFIGURATION
// // =============================================================================

// const PgSession = pgSession(session);
// const sessionStore = new PgSession({
//   pool: new Pool({ 
//     connectionString: process.env.DATABASE_URL,
//     ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
//   }),
//   tableName: 'sessions',
//   createTableIfMissing: false,
// });

// // =============================================================================
// // EXPRESS APP SETUP
// // =============================================================================

// const app = express();

// // =============================================================================
// // 1. TRUST PROXY
// // =============================================================================

// app.set('trust proxy', 1);

// // =============================================================================
// // 2. ULTRA-AGGRESSIVE CORS - FIRST MIDDLEWARE
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const origin = req.headers.origin;
  
//   console.log(`🌐 CORS: ${req.method} ${req.path}`);
//   console.log(`   Origin: ${origin || 'NO ORIGIN'}`);
  
//   // ULTRA-PERMISSIVE: Allow the requesting origin (we'll restrict later if needed)
//   if (origin) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//   } else {
//     // Fallback for requests without origin header
//     res.setHeader('Access-Control-Allow-Origin', '*');
//   }
  
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, X-CSRF-Token');
//   res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Type');
//   res.setHeader('Access-Control-Max-Age', '86400');
//   res.setHeader('Vary', 'Origin');
  
//   // Handle OPTIONS preflight immediately
//   if (req.method === 'OPTIONS') {
//     console.log(`   ⚡ OPTIONS preflight - sending 204`);
//     return res.status(204).end();
//   }

//   next();
// });

// // =============================================================================
// // 3. RESPONSE INTERCEPTOR - Ensure CORS on ALL responses
// // =============================================================================

// app.use((req: Request, res: Response, next: NextFunction) => {
//   const origin = req.headers.origin;
  
//   const originalSend = res.send;
//   const originalJson = res.json;
//   const originalStatus = res.status;
//   const originalEnd = res.end;
  
//   // Override status
//   res.status = function(code: number) {
//     if (origin) {
//       this.setHeader('Access-Control-Allow-Origin', origin);
//       this.setHeader('Access-Control-Allow-Credentials', 'true');
//     }
//     return originalStatus.call(this, code);
//   };
  
//   // Override send
//   res.send = function(data: any) {
//     if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
//       this.setHeader('Access-Control-Allow-Origin', origin);
//       this.setHeader('Access-Control-Allow-Credentials', 'true');
//     }
//     return originalSend.call(this, data);
//   };
  
//   // Override json
//   res.json = function(data: any) {
//     if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
//       this.setHeader('Access-Control-Allow-Origin', origin);
//       this.setHeader('Access-Control-Allow-Credentials', 'true');
//     }
//     return originalJson.call(this, data);
//   };
  
//   // Override end
//   res.end = function(chunk?: any, encoding?: any) {
//     if (origin && !this.getHeader('Access-Control-Allow-Origin')) {
//       this.setHeader('Access-Control-Allow-Origin', origin);
//       this.setHeader('Access-Control-Allow-Credentials', 'true');
//     }
//     return originalEnd.call(this, chunk, encoding);
//   };
  
//   next();
// });

// // =============================================================================
// // 4. BASIC MIDDLEWARE
// // =============================================================================

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: false }));

// // =============================================================================
// // 5. CORS TEST ENDPOINTS
// // =============================================================================

// app.get('/api/cors-test', (req: Request, res: Response) => {
//   console.log('🧪 CORS Test GET Hit');
//   res.json({ 
//     success: true, 
//     message: 'CORS is working!',
//     origin: req.headers.origin,
//     headers: res.getHeaders(),
//     timestamp: new Date().toISOString()
//   });
// });

// app.post('/api/cors-test', (req: Request, res: Response) => {
//   console.log('🧪 CORS Test POST Hit');
//   res.json({ 
//     success: true, 
//     message: 'CORS POST is working!',
//     origin: req.headers.origin,
//     body: req.body,
//     headers: res.getHeaders(),
//     timestamp: new Date().toISOString()
//   });
// });

// app.options('/api/cors-test', (req: Request, res: Response) => {
//   console.log('🧪 CORS Test OPTIONS Hit');
//   res.status(204).end();
// });

// // =============================================================================
// // 6. RATE LIMITING
// // =============================================================================

// const rateLimitHandler = (req: Request, res: Response) => {
//   const origin = req.headers.origin;
//   if (origin) {
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
// });

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   handler: rateLimitHandler,
//   skipSuccessfulRequests: true,
//   standardHeaders: true,
//   legacyHeaders: false,
//   validate: false,
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
  
//   if (req.path === '/api/gsc/oauth-callback') {
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
// // 9. SESSION
// // =============================================================================

// app.use(session({
//   store: sessionStore,
//   secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
//   resave: false,
//   saveUninitialized: false,
//   name: 'ai-seo-session',
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000,
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     domain: undefined
//   },
//   rolling: true
// }));

// // =============================================================================
// // 10. LOGGING
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
// // 11. API REDIRECT HANDLER
// // =============================================================================

// app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
//   const originalRedirect = res.redirect.bind(res);
//   res.redirect = function(url: string | number, status?: any) {
//     const origin = req.headers.origin;
//     if (origin) {
//       this.setHeader('Access-Control-Allow-Origin', origin);
//       this.setHeader('Access-Control-Allow-Credentials', 'true');
//     }
    
//     if (typeof url === 'number') {
//       return res.status(url).json({ 
//         success: false, 
//         message: 'Unauthorized', 
//         redirect: status 
//       });
//     }
//     return res.status(302).json({ 
//       success: false, 
//       message: 'Redirect required', 
//       redirect: url 
//     });
//   };
//   next();
// });

// // =============================================================================
// // 12. DEBUG MIDDLEWARE (Development Only)
// // =============================================================================

// if (process.env.NODE_ENV === 'development') {
//   app.use((req: Request, res: Response, next: NextFunction) => {
//     const originalSend = res.send;
//     const originalJson = res.json;
    
//     res.send = function(data) {
//       console.log(`📤 Response for ${req.method} ${req.path}:`, {
//         status: res.statusCode,
//         corsOrigin: res.getHeader('access-control-allow-origin'),
//         corsCredentials: res.getHeader('access-control-allow-credentials'),
//       });
//       return originalSend.call(this, data);
//     };
    
//     res.json = function(data) {
//       console.log(`📤 JSON Response for ${req.method} ${req.path}:`, {
//         status: res.statusCode,
//         corsOrigin: res.getHeader('access-control-allow-origin'),
//         corsCredentials: res.getHeader('access-control-allow-credentials'),
//       });
//       return originalJson.call(this, data);
//     };
    
//     next();
//   });
// }

// // =============================================================================
// // SERVER STARTUP & ROUTES
// // =============================================================================

// (async () => {
//   try {
//     // Dynamic imports to handle optional modules
//     const { registerRoutes } = await import('./routes').catch(() => ({ 
//       registerRoutes: async (app: any) => app 
//     }));
    
//     const server = await registerRoutes(app);
    
//     // Register auto-schedules router
//     app.use("/api/user/auto-schedules", autoSchedulesRouter);
    
//     // Manual scheduler trigger endpoint
//     app.post('/api/admin/trigger-scheduler', async (req: Request, res: Response) => {
//       try {
//         if (!req.user) {
//           return res.status(401).json({ success: false, message: 'Unauthorized' });
//         }
        
//         const result = await schedulerService.manualProcess();
//         res.json({ 
//           success: true, 
//           message: 'Scheduler triggered manually',
//           result 
//         });
//       } catch (error: any) {
//         res.status(500).json({ 
//           success: false, 
//           message: error.message 
//         });
//       }
//     });

//     // Health check endpoint
//     app.get('/health', (_req: Request, res: Response) => {
//       res.json({
//         status: 'healthy',
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV || 'development',
//         uptime: process.uptime()
//       });
//     });

//     // =============================================================================
//     // GLOBAL ERROR HANDLER
//     // =============================================================================

//     app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
//       const origin = req.headers.origin;
      
//       console.error("❌ Global Error Handler:", {
//         message: err.message,
//         stack: err.stack,
//         path: req.path,
//         method: req.method,
//         origin: origin
//       });
      
//       // CRITICAL: Force CORS headers on ALL errors
//       if (origin) {
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

//     // Setup Vite in development
//     if (app.get("env") === "development") {
//       try {
//         const { setupVite } = await import('./vite');
//         await setupVite(app, server);
//       } catch (e) {
//         console.log('Vite setup not available or failed, continuing without it');
//       }
//     }

//     // =============================================================================
//     // 404 HANDLER
//     // =============================================================================

//     app.use('*', (req: Request, res: Response) => {
//       const origin = req.headers.origin;
      
//       console.log(`❌ 404: ${req.method} ${req.path}`);
//       console.log(`   Origin: ${origin || 'none'}`);
      
//       // Ensure CORS headers on 404
//       if (origin) {
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

//     const port = parseInt(process.env.PORT || '5000', 10);
//     const host = process.env.HOST || "0.0.0.0";

//     server.listen({ port, host }, () => {
//       log(`🚀 Server running on http://${host}:${port}`);
//       log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
//       log(`🔐 Session store: PostgreSQL`);
//       log(`🛡️ Security: Helmet + Rate Limiting enabled`);
//       log(`📡 API available at: http://${host}:${port}/api`);
//       log(`🌐 CORS: Ultra-permissive mode (allows all origins)`);
//       log(`🧪 CORS Test: http://${host}:${port}/api/cors-test`);
      
//       schedulerService.startScheduler(1);
//       log(`⏰ Content scheduler started`);
      
//       if (process.env.NODE_ENV === 'development') {
//         log(`🛠️  Development mode: Vite dev server + verbose logging enabled`);
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
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   log('🔴 SIGINT received, shutting down gracefully');
//   process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//   console.error('❌ Uncaught Exception:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

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
// CORS (Reliable single layer; FIRST)
// =============================================================================

const ALLOWED_ORIGIN_LIST = [
  'https://final-seo-tool-a3yfd06px-nitros-projects-deeabea9.vercel.app', // your prod Vercel URL
  'http://localhost:3000',
];

const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/server-to-server/no-origin
    const allowed =
      ALLOWED_ORIGIN_LIST.includes(origin) ||
      vercelPreviewRegex.test(origin);
    return cb(null, allowed);
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
// Make sure preflights for any path are handled
app.options('*', cors(corsOptions));

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
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach((key) => {
      const v = req.query[key];
      if (typeof v === 'string') {
        // @ts-expect-error - we are mutating the union type
        req.query[key] = sanitizeString(v);
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
    secure: process.env.NODE_ENV === 'production', // https only in prod
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // IMPORTANT: do not set `domain` since Render and Vercel are different hosts
  },
  rolling: true,
});

// Wrap to catch session init errors without breaking CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  sessionMiddleware(req, res, (err) => {
    if (err) {
      console.error('❌ Session middleware error:', err);
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

const rateLimitHandler = (_req: Request, res: Response) => {
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

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/gsc/auth', authLimiter);
app.use('/api/gsc/auth-url', authLimiter);
app.use('/api/gsc/oauth-callback', authLimiter);

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
// SIMPLE TEST ENDPOINTS
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

// =============================================================================
// API REDIRECT HANDLER (JSON-ify redirects under /api/*)
// =============================================================================

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const originalRedirect = res.redirect.bind(res);
  res.redirect = function (url: string | number, status?: any) {
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
    // Dynamic routes import
    const { registerRoutes } = await import('./routes.js').catch(() => ({
      registerRoutes: async (x: any) => x,
    }));

    await registerRoutes(app);

    // Health check
    app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        port: process.env.PORT || '5000',
        database: sessionPool ? 'connected' : 'disconnected',
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

    // Vite in development
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
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
      });
    });

    // =============================================================================
    // START HTTP SERVER (Render-friendly)
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
  sessionPool.end(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  sessionPool.end(() => {
    process.exit(1);
  });
});
