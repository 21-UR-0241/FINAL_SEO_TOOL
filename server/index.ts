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
// UTILITY FUNCTIONS
// =============================================================================

function log(message: string) {
  console.log(message);
}

// =============================================================================
// SESSION STORE CONFIGURATION WITH ERROR HANDLING
// =============================================================================

const sessionPool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Test the connection on startup
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

const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool: sessionPool,
  tableName: 'sessions',
  createTableIfMissing: false,
});

// Handle session store errors
sessionStore.on('error', (error) => {
  console.error('❌ Session store error:', error);
  // Don't crash the server on session store errors
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
// 4. ABSOLUTE CORS GUARANTEE
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const setCORS = () => {
    if (origin && !res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
  };
  
  // Set CORS immediately
  setCORS();
  
  // Set CORS again before headers are sent
  res.once('finish', setCORS);
  res.once('close', setCORS);
  
  next();
});

// =============================================================================
// 5. BASIC MIDDLEWARE WITH ERROR HANDLING
// =============================================================================

// JSON parsing with error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  express.json({ limit: '10mb' })(req, res, (err: any) => {
    if (err) {
      console.error('❌ JSON parsing error:', err);
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON in request body' 
      });
    }
    next();
  });
});

app.use(express.urlencoded({ extended: false }));

// =============================================================================
// 6. CORS TEST ENDPOINTS
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

// Test endpoint without session
app.get('/api/test-no-session', (req: Request, res: Response) => {
  console.log('🧪 Test endpoint (no session) hit');
  res.json({ 
    success: true, 
    message: 'No session required!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// 7. RATE LIMITING
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
// 8. SECURITY HEADERS (Relaxed for API endpoints)
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  if (req.path === '/api/gsc/oauth-callback') {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  
  next();
});

// Relaxed helmet for API routes
app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })(req, res, next);
});

// Full helmet for non-API routes
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
// 9. INPUT SANITIZATION
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
// 10. SESSION WITH ERROR HANDLING
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
    domain: undefined
  },
  rolling: true
});

// Wrap session middleware with error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  sessionMiddleware(req, res, (err) => {
    if (err) {
      console.error('❌ Session middleware error:', err);
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Session initialization error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    next();
  });
});

// =============================================================================
// 11. LOGGING
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
// 12. API REDIRECT HANDLER
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
// 13. SPECIFIC ROUTE DEBUGGING
// =============================================================================

app.use('/api/user/websites/:id/*', (req, res, next) => {
  console.log('🔍 Website-specific route hit:', {
    id: req.params.id,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    hasSession: !!req.session,
    sessionId: req.session?.userId,
    corsHeaders: {
      allowOrigin: res.getHeader('access-control-allow-origin'),
      allowCredentials: res.getHeader('access-control-allow-credentials')
    }
  });
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
// SERVER STARTUP & ROUTES
// =============================================================================

(async () => {
  try {
    // Dynamic imports to handle optional modules
    const { registerRoutes } = await import('./routes.js').catch(() => ({ 
      registerRoutes: async (app: any) => app 
    }));
    
    await registerRoutes(app);
    
    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        port: process.env.PORT || '5000',
        database: sessionPool ? 'connected' : 'disconnected'
      });
    });

    // =============================================================================
    // GLOBAL ERROR HANDLER
    // =============================================================================

    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const origin = req.headers.origin;
      
      console.error("❌ Global Error Handler:", {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        origin: origin,
        statusCode: err.status || err.statusCode
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

    // Setup Vite in development
    if (app.get("env") === "development") {
      try {
        const { setupVite } = await import('./vite.js');
        const httpServer = createServer(app);
        await setupVite(app, httpServer);
      } catch (e) {
        console.log('Vite setup not available or failed, continuing without it');
      }
    }

    // =============================================================================
    // 404 HANDLER
    // =============================================================================

    app.use('*', (req: Request, res: Response) => {
      const origin = req.headers.origin;
      
      console.log(`❌ 404: ${req.method} ${req.path}`);
      console.log(`   Origin: ${origin || 'none'}`);
      console.log(`   Headers:`, req.headers);
      
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
        method: req.method
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
      log(`🚀 Server running on http://${host}:${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🔐 Session store: PostgreSQL`);
      log(`🛡️ Security: Helmet + Rate Limiting enabled`);
      log(`📡 API available at: http://${host}:${port}/api`);
      log(`🌐 CORS: Ultra-permissive mode (allows all origins)`);
      log(`🧪 CORS Test: http://${host}:${port}/api/cors-test`);
      log(`🧪 No-Session Test: http://${host}:${port}/api/test-no-session`);
      
      // Start scheduler after server is listening
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