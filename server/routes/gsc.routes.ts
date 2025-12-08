

// server/routes/gsc.routes.ts - CORRECTED VERSION
import { Router, Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import { gscStorage } from '../services/gsc-storage';
import { requireAuth } from '../middleware/auth';
import { InputSanitizer, sanitizationMiddleware } from '../utils/sanitizer';
import rateLimit from 'express-rate-limit';

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: 'Too many requests, please slow down'
});

// Extend Request type
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const router = Router();

// 🚨 CRITICAL: Log when this file loads
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🔥 GSC ROUTES MODULE IS LOADING');
console.log('   Time:', new Date().toISOString());
console.log('   File: server/routes/gsc.routes.ts');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// 🚨 CRITICAL: Test route at the absolute beginning (no middleware)
router.all('/test-route-exists', (req: Request, res: Response) => {
  console.log('🎯 TEST ROUTE HIT!');
  res.json({
    success: true,
    message: 'GSC routes ARE being registered!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// 🚨 CRITICAL: Catch-all logger for GSC routes
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📥 GSC ROUTE REQUEST');
  console.log('   Method:', req.method);
  console.log('   Path:', req.path);
  console.log('   Full URL:', req.originalUrl);
  console.log('   Base URL:', req.baseUrl);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  next();
});

// ============================================================================
// SIMPLIFIED refresh-token route (NO MIDDLEWARE, NO VALIDATION)
// Place this IMMEDIATELY after the catch-all logger
// ============================================================================

router.post('/refresh-token', async (req: Request, res: Response) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔄 REFRESH-TOKEN ROUTE HIT!!!');
  console.log('   Method:', req.method);
  console.log('   Path:', req.path);
  console.log('   Body:', req.body);
  console.log('   Headers:', req.headers);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // For now, just respond to prove the route works
  res.json({
    success: true,
    message: 'Refresh token route is working!',
    receivedAccountId: req.body.accountId,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Add this at the VERY END of the file, before export
// ============================================================================

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('✅ GSC ROUTES FILE FULLY LOADED');
console.log('   All routes defined and ready');
console.log('   Exporting router...');
console.log('═══════════════════════════════════════════════════════════');
console.log('');



// Apply middleware
router.use(apiLimiter);
router.use(sanitizationMiddleware.body);
router.use(sanitizationMiddleware.query);
router.use(sanitizationMiddleware.params);

const gscUserTokens = new Map<string, any>();

const GSC_SCOPES = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/indexing',
  'https://www.googleapis.com/auth/siteverification',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Helper function to get redirect URI - UPDATED for Vercel + Render
const getRedirectUri = () => {
  // Priority: explicit GOOGLE_REDIRECT_URI > constructed from API_URL > localhost
  if (process.env.GOOGLE_REDIRECT_URI) {
    console.log('📍 Using explicit redirect URI:', process.env.GOOGLE_REDIRECT_URI);
    return process.env.GOOGLE_REDIRECT_URI;
  }
  
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  const redirectUri = `${apiUrl}/api/gsc/oauth-callback`;
  console.log('📍 Constructed redirect URI:', redirectUri);
  return redirectUri;
};

// Helper function to get client URL - NEW
const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173'; // Vite default port
};

// Input validation middleware for OAuth credentials
const validateOAuthConfig = (req: Request, res: Response, next: NextFunction) => {
  const { clientId, clientSecret } = req.body;
  
  const validation = InputSanitizer.sanitizeOAuthCredentials(clientId, clientSecret);
  
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Invalid OAuth credentials',
      details: validation.errors 
    });
  }
  
  req.body.clientId = validation.sanitizedId;
  req.body.clientSecret = validation.sanitizedSecret;
  next();
};

const validateAccountId = (req: Request, res: Response, next: NextFunction) => {
  const accountId = req.body.accountId || req.query.accountId;
  
  if (!accountId) {
    return res.status(400).json({ error: 'Account ID is required' });
  }
  
  const validation = InputSanitizer.sanitizeAccountId(accountId as string);
  
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }
  
  if (req.body.accountId) req.body.accountId = validation.sanitized;
  if (req.query.accountId) req.query.accountId = validation.sanitized;
  next();
};

// ============================================================================
// CONFIGURATION ENDPOINTS
// ============================================================================

router.post('/configure', requireAuth, validateOAuthConfig, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { clientId, clientSecret } = req.body;

    const redirectUri = getRedirectUri();

    console.log('📝 Saving GSC configuration for user:', userId);
    console.log('📝 Using redirect URI:', redirectUri);

    await gscStorage.saveGscConfiguration(userId, {
      clientId,
      clientSecret,
      redirectUri
    });

    res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error: any) {
    console.error('Config save error:', error);
    res.status(500).json({ error: error.message || 'Failed to save configuration' });
  }
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

router.get('/auth-url', requireAuth, authLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    console.log('========================================');
    console.log('🔐 GENERATING GSC OAuth URL (GET)');
    console.log('User ID:', userId);
    console.log('========================================');
    
    const config = await gscStorage.getGscConfiguration(userId);
    
    if (!config) {
      return res.status(400).json({ 
        error: 'No configuration found. Please configure your Google OAuth credentials first.' 
      });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    // ✅ FIX: Include userId in state with consistent format
    const stateData = { 
      userId,
      timestamp: Date.now()
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GSC_SCOPES,
      prompt: 'consent',
      state: state
    });
    
    console.log('✅ Auth URL generated with state');
    console.log('========================================');
    
    res.json({ authUrl });
  } catch (error) {
    console.error('GSC auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// ✅ FIXED: POST /auth-url now uses consistent state format
router.post('/auth-url', requireAuth, authLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let { clientId, clientSecret } = req.body;
    
    console.log('========================================');
    console.log('🔐 GENERATING GSC OAuth URL (POST)');
    console.log('User ID:', userId);
    console.log('========================================');
    
    if (clientId && clientSecret) {
      const validation = InputSanitizer.sanitizeOAuthCredentials(clientId, clientSecret);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Invalid OAuth credentials',
          details: validation.errors 
        });
      }
      
      clientId = validation.sanitizedId;
      clientSecret = validation.sanitizedSecret;
      
      const redirectUri = getRedirectUri();
      
      await gscStorage.saveGscConfiguration(userId, {
        clientId,
        clientSecret,
        redirectUri
      });
      
      console.log('✅ Configuration saved');
    }
    
    const config = await gscStorage.getGscConfiguration(userId);
    
    if (!config) {
      return res.status(400).json({ 
        error: 'No configuration found. Please provide OAuth credentials.' 
      });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    // ✅ FIX: Use same state format as GET endpoint
    const stateData = { 
      userId,
      timestamp: Date.now()
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GSC_SCOPES,
      prompt: 'consent',
      state: state  // ✅ Now uses consistent JSON format
    });
    
    console.log('✅ Generated auth URL with consistent state format');
    console.log('========================================');
    res.json({ authUrl });
  } catch (error) {
    console.error('GSC auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// ✅ CORRECT: No requireAuth on this endpoint (already correct in your code)
router.post('/auth', authLimiter, async (req: Request, res: Response) => {
  try {
    // Get userId from request body instead of session
    const { code, state, userId } = req.body;
    
    console.log('========================================');
    console.log('🔐 EXCHANGING GSC AUTH CODE');
    console.log('User ID:', userId);
    console.log('Has code:', !!code);
    console.log('========================================');
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code required' });
    }
    
    const sanitizedCode = code.trim();
    if (!sanitizedCode || sanitizedCode.length < 10) {
      return res.status(400).json({ error: 'Invalid authorization code' });
    }
    
    console.log('Step 1: Fetching configuration...');
    const config = await gscStorage.getGscConfiguration(userId);
    
    if (!config) {
      console.error('❌ Configuration not found for user:', userId);
      return res.status(400).json({ 
        error: 'Configuration not found. Please configure OAuth credentials first.' 
      });
    }
    
    console.log('✅ Configuration found');
    console.log('Step 2: Creating OAuth client...');
    
    const authClient = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    try {
      console.log('Step 3: Exchanging code for tokens...');
      const { tokens } = await authClient.getToken(sanitizedCode);
      
      if (!tokens.access_token) {
        console.error('❌ No access token received');
        return res.status(400).json({ error: 'Failed to obtain access token' });
      }
      
      console.log('✅ Tokens received');
      console.log('Step 4: Fetching user info...');
      
      authClient.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
      const { data: userInfo } = await oauth2.userinfo.get();
      
      console.log('✅ User info received:', userInfo.email);
      
      const emailValidation = InputSanitizer.sanitizeEmail(userInfo.email || '');
      if (!emailValidation.isValid) {
        return res.status(400).json({ error: 'Invalid email received from Google' });
      }
      
      const gscAccount = {
        id: userInfo.id!,
        email: emailValidation.sanitized,
        name: InputSanitizer.sanitizeTextSimple(userInfo.name || emailValidation.sanitized),
        picture: userInfo.picture || undefined,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || '',
        tokenExpiry: tokens.expiry_date || Date.now() + 3600000,
        isActive: true
      };
      
      console.log('Step 5: Saving account to database...');
      gscUserTokens.set(`${userId}_${userInfo.id}`, tokens);
      
      await gscStorage.saveGscAccount(userId, gscAccount);
      
      console.log('========================================');
      console.log(`✅ GSC ACCOUNT CONNECTED: ${emailValidation.sanitized}`);
      console.log('========================================');
      
      res.json({ account: gscAccount });
      
    } catch (tokenError: any) {
      console.error('========================================');
      console.error('❌ TOKEN EXCHANGE ERROR');
      console.error('Error:', tokenError.message);
      console.error('========================================');
      
      if (tokenError.message?.includes('invalid_grant')) {
        return res.status(400).json({ 
          error: 'Authorization code expired or already used. Please try signing in again.' 
        });
      }
      if (tokenError.message?.includes('redirect_uri_mismatch')) {
        return res.status(400).json({ 
          error: 'Configuration error. Please check your redirect URI.' 
        });
      }
      throw tokenError;
    }
  } catch (error: any) {
    console.error('========================================');
    console.error('❌ GSC AUTH ERROR');
    console.error('Error:', error);
    console.error('========================================');
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// ✅ CORRECT: oauth-callback with proper state decoding


router.get('/oauth-callback', async (req: Request, res: Response) => {
  try {
    // 🔥 CRITICAL: Set permissive headers FIRST
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    const { code, state, error } = req.query;
    const clientUrl = getClientUrl();
    
    console.log('========================================');
    console.log('🔗 GSC OAUTH CALLBACK');
    console.log('Client URL:', clientUrl);
    console.log('Has code:', !!code);
    console.log('Has state:', !!state);
    console.log('Has error:', !!error);
    console.log('========================================');
    
    if (error) {
      const safeError = InputSanitizer.escapeHtml(error as string);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 20px; 
              text-align: center; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              max-width: 450px;
            }
            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
            h2 { margin: 0 0 10px 0; color: #1f2937; }
            p { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h2>Authentication Failed</h2>
            <p>${safeError}</p>
            <p><small>This window will close automatically...</small></p>
          </div>
          <script>
            console.log('OAuth Error - sending to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'GSC_AUTH_ERROR', 
                  error: ${JSON.stringify(safeError)}
                }, '${clientUrl}');
                console.log('Error message sent to parent');
              } else {
                console.error('Parent window not available');
              }
            } catch (e) {
              console.error('Failed to send error to parent:', e);
            }
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window automatically');
              }
            }, 3000);
          </script>
        </body>
        </html>
      `);
    }
    
    if (!code || !state) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 20px; 
              text-align: center; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              max-width: 450px;
            }
            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
            h2 { margin: 0 0 10px 0; color: #1f2937; }
            p { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h2>Missing Required Parameters</h2>
            <p>The authentication process didn't complete properly.</p>
          </div>
          <script>
            console.log('Missing parameters - sending to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'GSC_AUTH_ERROR', 
                  error: 'Missing authorization code or state'
                }, '${clientUrl}');
                console.log('Error message sent to parent');
              }
            } catch (e) {
              console.error('Failed to send error to parent:', e);
            }
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('Could not close window automatically');
              }
            }, 3000);
          </script>
        </body>
        </html>
      `);
    }
    
    // Decode state to get userId
    let userId;
    try {
      const stateJson = Buffer.from(state as string, 'base64').toString('utf-8');
      const stateData = JSON.parse(stateJson);
      userId = stateData.userId;
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId in state');
      }
      
      console.log('✅ Decoded userId from state:', userId);
      
    } catch (e) {
      console.error('❌ Failed to decode state:', e);
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 20px; 
              text-align: center; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              max-width: 450px;
            }
            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
            h2 { margin: 0 0 10px 0; color: #1f2937; }
            p { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h2>Invalid State Parameter</h2>
            <p>The authentication state is invalid or corrupted.</p>
            <p><small>Error: ${(e as Error).message}</small></p>
          </div>
          <script>
            console.log('Invalid state - sending to parent');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                  type: 'GSC_AUTH_ERROR', 
                  error: 'Invalid state parameter: ${(e as Error).message}'
                }, '${clientUrl}');
                console.log('Error message sent to parent');
              }
            } catch (err) {
              console.error('Failed to send error to parent:', err);
            }
            setTimeout(() => {
              try {
                window.close();
              } catch (err) {
                console.log('Could not close window automatically');
              }
            }, 3000);
          </script>
        </body>
        </html>
      `);
    }
    
    const safeCode = InputSanitizer.escapeHtml(code as string);
    const safeUserId = InputSanitizer.escapeHtml(userId);
    
    console.log('✅ Sending code and userId to parent window');
    console.log('========================================');
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px; 
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            max-width: 450px;
          }
          .success { color: #059669; font-size: 48px; margin-bottom: 20px; }
          h2 { margin: 0 0 10px 0; }
          p { margin: 10px 0; color: #666; }
          #status { 
            margin-top: 20px; 
            padding: 15px; 
            background: #f3f4f6; 
            border-radius: 8px;
            font-size: 14px;
          }
          .loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          button {
            margin-top: 20px;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: none;
          }
          button:hover { background: #5a67d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h2>Authentication Successful!</h2>
          <p>Completing Google Search Console connection...</p>
          <div id="status">
            <div class="loader"></div>
            <div style="margin-top: 10px;">Sending credentials...</div>
          </div>
          <button onclick="closeWindow()" id="closeBtn">Close Window</button>
        </div>
        <script>
          const code = ${JSON.stringify(safeCode)};
          const userId = ${JSON.stringify(safeUserId)};
          const clientUrl = '${clientUrl}';
          
          console.log('========================================');
          console.log('GSC OAuth Callback Page Loaded');
          console.log('Code:', code ? 'Present' : 'Missing');
          console.log('User ID:', userId);
          console.log('Target Origin:', clientUrl);
          console.log('Has opener:', !!window.opener);
          console.log('Opener closed:', window.opener ? window.opener.closed : 'N/A');
          console.log('========================================');
          
          function updateStatus(message, success = true) {
            const statusEl = document.getElementById('status');
            if (statusEl) {
              statusEl.innerHTML = success
                ? '<div style="color: #059669;">✓ ' + message + '</div>'
                : '<div style="color: #dc2626;">✗ ' + message + '</div>';
            }
            
            if (!success) {
              const btn = document.getElementById('closeBtn');
              if (btn) btn.style.display = 'block';
            }
          }
          
          function closeWindow() {
            try {
              window.close();
            } catch (e) {
              console.log('Could not close window, redirecting...');
              window.location.href = clientUrl;
            }
          }
          
          // Check if we can access the opener
          try {
            if (!window.opener) {
              updateStatus('Parent window not found', false);
              console.error('❌ No window.opener');
            } else if (window.opener.closed) {
              updateStatus('Parent window was closed', false);
              console.error('❌ window.opener.closed = true');
            } else {
              console.log('✅ Parent window is accessible');
              
              try {
                console.log('📤 Sending postMessage to parent...');
                
                window.opener.postMessage({ 
                  type: 'GSC_AUTH_SUCCESS', 
                  code: code,
                  userId: userId
                }, clientUrl);
                
                updateStatus('Credentials sent successfully!');
                console.log('✅ Message sent successfully');
                
                // Close after a short delay
                setTimeout(closeWindow, 2000);
                
              } catch (postError) {
                updateStatus('Failed to send credentials: ' + postError.message, false);
                console.error('❌ postMessage failed:', postError);
              }
            }
          } catch (accessError) {
            updateStatus('Could not access parent window: ' + accessError.message, false);
            console.error('❌ Opener access error:', accessError);
          }
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ OAuth callback error:', error);
    console.error('========================================');
    
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: system-ui; 
            text-align: center; 
            padding: 40px;
            background: #fee;
          }
          h2 { color: #dc2626; }
        </style>
      </head>
      <body>
        <h2>Authentication Failed</h2>
        <p>An unexpected error occurred.</p>
        <button onclick="window.close()">Close</button>
      </body>
      </html>
    `);
  }
});

// router.get('/oauth-callback', async (req: Request, res: Response) => {
//   try {
//     res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
//     res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
//     const { code, state, error } = req.query;
//     const clientUrl = getClientUrl();
    
//     console.log('========================================');
//     console.log('🔗 GSC OAUTH CALLBACK');
//     console.log('Client URL:', clientUrl);
//     console.log('Has code:', !!code);
//     console.log('Has state:', !!state);
//     console.log('========================================');
    
//     if (error) {
//       const safeError = InputSanitizer.escapeHtml(error as string);
//       return res.send(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Authentication Error</title>
//           <style>
//             body { font-family: system-ui; padding: 20px; text-align: center; background: #fee; }
//             .error { color: #dc2626; }
//           </style>
//         </head>
//         <body>
//           <h2 class="error">Authentication Failed</h2>
//           <p>${safeError}</p>
//           <p>This window will close automatically...</p>
//           <script>
//             if (window.opener && !window.opener.closed) {
//               window.opener.postMessage({ 
//                 type: 'GSC_AUTH_ERROR', 
//                 error: ${JSON.stringify(safeError)}
//               }, '${clientUrl}');
//             }
//             setTimeout(() => window.close(), 3000);
//           </script>
//         </body>
//         </html>
//       `);
//     }
    
//     if (!code || !state) {
//       return res.send(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Authentication Error</title>
//           <style>
//             body { font-family: system-ui; padding: 20px; text-align: center; background: #fee; }
//             .error { color: #dc2626; }
//           </style>
//         </head>
//         <body>
//           <h2 class="error">Missing Required Parameters</h2>
//           <p>The authentication process didn't complete properly.</p>
//           <script>
//             if (window.opener && !window.opener.closed) {
//               window.opener.postMessage({ 
//                 type: 'GSC_AUTH_ERROR', 
//                 error: 'Missing authorization code or state'
//               }, '${clientUrl}');
//             }
//             setTimeout(() => window.close(), 3000);
//           </script>
//         </body>
//         </html>
//       `);
//     }
    
//     // ✅ Decode state to get userId with better error handling
//     let userId;
//     try {
//       const stateJson = Buffer.from(state as string, 'base64').toString('utf-8');
//       console.log('Decoded state:', stateJson);
      
//       const stateData = JSON.parse(stateJson);
//       userId = stateData.userId;
      
//       console.log('✅ Decoded userId from state:', userId);
      
//       // Validate userId
//       if (!userId || typeof userId !== 'string') {
//         throw new Error('Invalid userId in state');
//       }
      
//     } catch (e) {
//       console.error('❌ Failed to decode state:', e);
//       console.error('Raw state value:', state);
      
//       return res.send(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Authentication Error</title>
//           <style>
//             body { font-family: system-ui; padding: 20px; text-align: center; background: #fee; }
//             .error { color: #dc2626; }
//           </style>
//         </head>
//         <body>
//           <h2 class="error">Invalid State Parameter</h2>
//           <p>The authentication state is invalid or corrupted.</p>
//           <p><small>Error: ${(e as Error).message}</small></p>
//           <script>
//             if (window.opener && !window.opener.closed) {
//               window.opener.postMessage({ 
//                 type: 'GSC_AUTH_ERROR', 
//                 error: 'Invalid state parameter: ${(e as Error).message}'
//               }, '${clientUrl}');
//             }
//             setTimeout(() => window.close(), 3000);
//           </script>
//         </body>
//         </html>
//       `);
//     }
    
//     const safeCode = InputSanitizer.escapeHtml(code as string);
//     const safeUserId = InputSanitizer.escapeHtml(userId);
    
//     console.log('✅ Sending code and userId to parent window');
//     console.log('========================================');
    
//     res.send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Authentication Successful</title>
//         <style>
//           body { 
//             font-family: system-ui; 
//             margin: 0;
//             padding: 20px; 
//             text-align: center;
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             min-height: 100vh;
//           }
//           .container {
//             background: white;
//             color: #333;
//             padding: 40px;
//             border-radius: 12px;
//             box-shadow: 0 8px 16px rgba(0,0,0,0.2);
//             max-width: 450px;
//           }
//           .success { color: #059669; font-size: 48px; margin-bottom: 20px; }
//           h2 { margin: 0 0 10px 0; }
//           p { margin: 10px 0; color: #666; }
//           #status { 
//             margin-top: 20px; 
//             padding: 15px; 
//             background: #f3f4f6; 
//             border-radius: 8px;
//             font-size: 14px;
//           }
//           button {
//             margin-top: 20px;
//             padding: 12px 24px;
//             background: #667eea;
//             color: white;
//             border: none;
//             border-radius: 6px;
//             cursor: pointer;
//             font-size: 14px;
//             font-weight: 500;
//           }
//           button:hover { background: #5a67d8; }
//           .loader {
//             display: inline-block;
//             width: 20px;
//             height: 20px;
//             border: 3px solid #f3f3f3;
//             border-top: 3px solid #667eea;
//             border-radius: 50%;
//             animation: spin 1s linear infinite;
//           }
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="success">✓</div>
//           <h2>Authentication Successful!</h2>
//           <p>Completing Google Search Console connection...</p>
//           <div id="status">
//             <div class="loader"></div>
//             <div style="margin-top: 10px;">Sending credentials...</div>
//           </div>
//           <button onclick="closeWindow()" style="display: none;" id="closeBtn">Close Window</button>
//         </div>
//         <script>
//           const code = ${JSON.stringify(safeCode)};
//           const userId = ${JSON.stringify(safeUserId)};
//           const clientUrl = '${clientUrl}';
          
//           console.log('========================================');
//           console.log('GSC OAuth Callback Page');
//           console.log('Code:', code ? 'Present' : 'Missing');
//           console.log('User ID:', userId);
//           console.log('Target:', clientUrl);
//           console.log('========================================');
          
//           function updateStatus(message, success = true) {
//             const statusEl = document.getElementById('status');
//             statusEl.innerHTML = success
//               ? '<div style="color: #059669;">✓ ' + message + '</div>'
//               : '<div style="color: #dc2626;">✗ ' + message + '</div>';
            
//             if (!success) {
//               document.getElementById('closeBtn').style.display = 'block';
//             }
//           }
          
//           function closeWindow() {
//             window.close();
//             setTimeout(() => {
//               if (!window.closed) {
//                 window.location.href = clientUrl;
//               }
//             }, 100);
//           }
          
//           if (!window.opener || window.opener.closed) {
//             updateStatus('Parent window not found', false);
//             console.error('❌ Parent window not available');
//           } else {
//             try {
//               console.log('📤 Sending message to parent...');
              
//               window.opener.postMessage({ 
//                 type: 'GSC_AUTH_SUCCESS', 
//                 code: code,
//                 userId: userId
//               }, clientUrl);
              
//               updateStatus('Credentials sent successfully!');
//               console.log('✅ Message sent successfully');
              
//               setTimeout(closeWindow, 2000);
//             } catch(e) {
//               updateStatus('Failed to send credentials: ' + e.message, false);
//               console.error('❌ Failed to send message:', e);
//             }
//           }
//         </script>
//       </body>
//       </html>
//     `);
//   } catch (error) {
//     console.error('========================================');
//     console.error('❌ OAuth callback error:', error);
//     console.error('========================================');
//     res.status(500).send(`
//       <!DOCTYPE html>
//       <html>
//       <head><title>Error</title></head>
//       <body>
//         <h2>Authentication Failed</h2>
//         <p>An unexpected error occurred.</p>
//         <button onclick="window.close()">Close</button>
//       </body>
//       </html>
//     `);
//   }
// });

// ============================================================================
// USER & ACCOUNT MANAGEMENT ENDPOINTS
// ============================================================================

router.get('/current-user', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    
    console.log(`👤 Fetching current user: ${userId}`);
    
    res.json({
      user: {
        id: userId,
        email: userEmail
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to retrieve user information' });
  }
});

router.get('/accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    console.log(`📋 Fetching GSC accounts for user: ${userId}`);
    
    const accounts = await gscStorage.getGscAccounts(userId);
    
    const accountsData = accounts.map((account: any) => ({
      id: account.id,
      email: account.email,
      name: account.name,
      picture: account.picture,
      isActive: account.isActive,
      tokenExpiry: account.tokenExpiry,
      hasRefreshToken: !!account.refreshToken,
      createdAt: account.created_at
    }));
    
    console.log(`✅ Found ${accountsData.length} GSC accounts`);
    res.json(accountsData);
  } catch (error) {
    console.error('Error fetching GSC accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.get('/user/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    
    console.log(`👤 Fetching complete profile for user: ${userId}`);
    
    const profileData = await gscStorage.getUserGscProfile(userId);
    
    res.json({
      user: {
        id: userId,
        email: userEmail
      },
      ...profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.post('/accounts/:accountId/verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    
    const validation = InputSanitizer.sanitizeAccountId(accountId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    console.log(`🔍 Verifying account: ${accountId}`);
    
    const account = await gscStorage.getGscAccountWithCredentials(userId, validation.sanitized);
    
    if (!account) {
      return res.status(404).json({ 
        error: 'Account not found', 
        isValid: false,
        needsReauth: true
      });
    }
    
    const timeUntilExpiry = account.tokenExpiry - Date.now();
    const needsRefresh = timeUntilExpiry < 300000;
    
    if (needsRefresh && account.refreshToken) {
      try {
        console.log(`🔄 Token expiring soon, refreshing...`);
        
        const config = await gscStorage.getGscConfiguration(userId);
        if (!config) {
          return res.json({ 
            isValid: false, 
            needsReauth: true,
            message: 'OAuth configuration not found' 
          });
        }
        
        const oauth2Client = new google.auth.OAuth2(
          config.clientId,
          config.clientSecret,
          config.redirectUri || getRedirectUri()
        );
        
        oauth2Client.setCredentials({
          refresh_token: account.refreshToken
        });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        await gscStorage.updateGscAccount(userId, validation.sanitized, {
          accessToken: credentials.access_token!,
          tokenExpiry: credentials.expiry_date!,
          isActive: true
        });
        
        console.log(`✅ Token refreshed for account: ${accountId}`);
        
        return res.json({ 
          isValid: true, 
          refreshed: true,
          tokenExpiry: credentials.expiry_date,
          message: 'Token refreshed successfully'
        });
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        await gscStorage.updateGscAccount(userId, validation.sanitized, {
          isActive: false
        });
        
        return res.json({ 
          isValid: false, 
          needsReauth: true,
          message: 'Token expired and refresh failed. Please re-authenticate.'
        });
      }
    }
    
    res.json({ 
      isValid: true, 
      refreshed: false,
      expiresIn: Math.floor(timeUntilExpiry / 1000),
      tokenExpiry: account.tokenExpiry,
      message: 'Account is valid'
    });
    
  } catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).json({ error: 'Failed to verify account' });
  }
});

router.delete('/accounts/:accountId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    
    const validation = InputSanitizer.sanitizeAccountId(accountId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    console.log(`🗑️ Deleting GSC account with cascade: ${accountId}`);
    
    await gscStorage.deleteGscAccount(userId, validation.sanitized);
    
    const cacheKey = `${userId}_${validation.sanitized}`;
    gscUserTokens.delete(cacheKey);
    
    console.log(`✅ GSC account and related data deleted: ${accountId}`);
    res.json({ 
      success: true, 
      message: 'Account and all related data disconnected successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

router.get('/accounts/:accountId/statistics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    
    const validation = InputSanitizer.sanitizeAccountId(accountId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    console.log(`📊 Fetching statistics for account: ${accountId}`);
    
    const stats = await gscStorage.getAccountStatistics(userId, validation.sanitized);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching account statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ============================================================================
// GSC API ENDPOINTS
// ============================================================================

router.get('/properties', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.query;
    
    console.log('========================================');
    console.log('📋 FETCHING PROPERTIES');
    console.log('User ID:', userId);
    console.log('Account ID:', accountId);
    console.log('========================================');
    
    // Step 1: Get account credentials
    console.log('Step 1: Fetching account credentials...');
    const account = await gscStorage.getGscAccountWithCredentials(userId, accountId as string);
    
    if (!account) {
      console.error('❌ Account not found');
      return res.status(401).json({ error: 'Account not found or not authenticated' });
    }
    
    console.log('✅ Account found:', {
      id: account.id,
      email: account.email,
      hasAccessToken: !!account.accessToken,
      hasRefreshToken: !!account.refreshToken,
      tokenExpiry: account.tokenExpiry ? new Date(account.tokenExpiry).toISOString() : 'none',
      isExpired: account.tokenExpiry ? account.tokenExpiry < Date.now() : 'unknown'
    });
    
    // Step 2: Get OAuth configuration
    console.log('Step 2: Fetching OAuth configuration...');
    const config = await gscStorage.getGscConfiguration(userId);
    
    if (!config) {
      console.error('❌ OAuth configuration not found');
      return res.status(400).json({ 
        error: 'OAuth configuration not found. Please configure your credentials first.' 
      });
    }
    
    console.log('✅ Config found');
    
    // Step 3: Check if token needs refresh
    const timeUntilExpiry = account.tokenExpiry - Date.now();
    const needsRefresh = timeUntilExpiry < 300000; // 5 minutes
    
    console.log('Step 3: Token status:', {
      timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + ' seconds',
      needsRefresh,
      hasRefreshToken: !!account.refreshToken
    });
    
    if (needsRefresh && account.refreshToken) {
      console.log('🔄 Refreshing token...');
      
      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri || getRedirectUri()
      );
      
      oauth2Client.setCredentials({
        refresh_token: account.refreshToken
      });
      
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        console.log('✅ Token refreshed successfully');
        
        await gscStorage.updateGscAccount(userId, accountId as string, {
          accessToken: credentials.access_token!,
          tokenExpiry: credentials.expiry_date!
        });
        
        account.accessToken = credentials.access_token!;
        account.tokenExpiry = credentials.expiry_date!;
        
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError.message);
        return res.status(401).json({ 
          error: 'Token expired and refresh failed. Please re-authenticate.',
          needsReauth: true,
          details: refreshError.message
        });
      }
    }
    
    // Step 4: Create OAuth client and fetch properties
    console.log('Step 4: Creating OAuth client...');
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry
    });
    
    console.log('Step 5: Calling Google Search Console API...');
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    try {
      const { data } = await searchconsole.sites.list();
      
      console.log('✅ API call successful');
      
      // Save properties to database
      console.log('Step 6: Saving properties to database...');
      for (const site of (data.siteEntry || [])) {
        await gscStorage.saveGscProperty(userId, accountId as string, {
          siteUrl: site.siteUrl!,
          permissionLevel: site.permissionLevel!,
          siteType: site.siteUrl?.startsWith('sc-domain:') ? 'DOMAIN' : 'SITE',
          verified: true
        });
      }
      
      const properties = (data.siteEntry || []).map(site => ({
        siteUrl: site.siteUrl!,
        permissionLevel: site.permissionLevel!,
        siteType: site.siteUrl?.startsWith('sc-domain:') ? 'DOMAIN' as const : 'SITE' as const,
        verified: true,
        accountId: accountId
      }));
      
      console.log(`✅ Found ${properties.length} GSC properties`);
      console.log('========================================');
      
      res.json(properties);
      
    } catch (apiError: any) {
      console.error('========================================');
      console.error('❌ GSC API ERROR');
      console.error('Error code:', apiError.code);
      console.error('Error message:', apiError.message);
      console.error('========================================');
      
      if (apiError.code === 401 || apiError.code === 403) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please re-authenticate your account.',
          needsReauth: true,
          details: apiError.message
        });
      }
      
      throw apiError;
    }
    
  } catch (error: any) {
    console.error('========================================');
    console.error('❌ FATAL ERROR');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('========================================');
    
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/index', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId, url, type = 'URL_UPDATED' } = req.body;
    
    console.log(`📤 Submitting URL for indexing: ${url} (${type})`);
    
    if (type !== 'URL_UPDATED' && type !== 'URL_DELETED') {
      return res.status(400).json({ error: 'Invalid type. Must be URL_UPDATED or URL_DELETED' });
    }
    
    const quota = await gscStorage.getGscQuotaUsage(accountId);
    if (quota.used >= quota.limit) {
      return res.status(429).json({ error: 'Daily quota exceeded (200 URLs/day)' });
    }
    
    const account = await gscStorage.getGscAccountWithCredentials(userId, accountId);
    
    if (!account) {
      return res.status(401).json({ error: 'Account not found or not authenticated' });
    }
    
    const config = await gscStorage.getGscConfiguration(userId);
    if (!config) {
      return res.status(400).json({ error: 'Configuration not found' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry
    });
    
    const indexing = google.indexing({ version: 'v3', auth: oauth2Client });
    
    try {
      const result = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: type
        }
      });
      
      await gscStorage.incrementGscQuotaUsage(accountId, url);
      
      console.log(`✅ URL submitted for indexing: ${url}`);
      res.json({
        success: true,
        notifyTime: result.data.urlNotificationMetadata?.latestUpdate?.notifyTime,
        url: url
      });
      
    } catch (indexError: any) {
      if (indexError.code === 429) {
        return res.status(429).json({ error: 'Daily quota exceeded (200 URLs/day)' });
      }
      throw indexError;
    }
    
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Failed to submit URL for indexing' });
  }
});

router.post('/inspect', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId, siteUrl, inspectionUrl } = req.body;
    
    console.log(`🔍 Inspecting URL: ${inspectionUrl}`);
    
    if (!siteUrl || !inspectionUrl) {
      return res.status(400).json({ error: 'Site URL and inspection URL required' });
    }
    
    const account = await gscStorage.getGscAccountWithCredentials(userId, accountId);
    
    if (!account) {
      return res.status(401).json({ error: 'Account not found or not authenticated' });
    }
    
    const config = await gscStorage.getGscConfiguration(userId);
    if (!config) {
      return res.status(400).json({ error: 'Configuration not found' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry
    });
    
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    const result = await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: inspectionUrl,
        siteUrl: siteUrl
      }
    });
    
    const inspection = result.data.inspectionResult;
    
    const inspectionResult = {
      url: inspectionUrl,
      indexStatus: inspection?.indexStatusResult?.coverageState || 'NOT_INDEXED',
      lastCrawlTime: inspection?.indexStatusResult?.lastCrawlTime,
      pageFetchState: inspection?.indexStatusResult?.pageFetchState,
      googleCanonical: inspection?.indexStatusResult?.googleCanonical,
      userCanonical: inspection?.indexStatusResult?.userCanonical,
      sitemap: inspection?.indexStatusResult?.sitemap,
      mobileUsability: inspection?.mobileUsabilityResult?.verdict || 'NEUTRAL',
      richResultsStatus: inspection?.richResultsResult?.verdict
    };
    
    const properties = await gscStorage.getGscProperties(userId, accountId);
    const property = properties.find((p: any) => p.site_url === siteUrl);
    if (property) {
      await gscStorage.saveUrlInspection(property.id, inspectionResult);
    }
    
    console.log(`✅ URL inspection complete: ${inspectionResult.indexStatus}`);
    res.json(inspectionResult);
    
  } catch (error) {
    console.error('Inspection error:', error);
    res.status(500).json({ error: 'Failed to inspect URL' });
  }
});

router.post('/sitemap', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { accountId, siteUrl, sitemapUrl } = req.body;
    
    console.log(`📄 Submitting sitemap: ${sitemapUrl}`);
    
    if (!siteUrl || !sitemapUrl) {
      return res.status(400).json({ error: 'Site URL and sitemap URL required' });
    }
    
    const account = await gscStorage.getGscAccountWithCredentials(userId, accountId);
    
    if (!account) {
      return res.status(401).json({ error: 'Account not found or not authenticated' });
    }
    
    const config = await gscStorage.getGscConfiguration(userId);
    if (!config) {
      return res.status(400).json({ error: 'Configuration not found' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry
    });
    
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    await searchconsole.sitemaps.submit({
      siteUrl: siteUrl,
      feedpath: sitemapUrl
    });
    
    const properties = await gscStorage.getGscProperties(userId, accountId);
    const property = properties.find((p: any) => p.site_url === siteUrl);
    if (property) {
      await gscStorage.saveSitemap(property.id, sitemapUrl);
    }
    
    console.log(`✅ Sitemap submitted: ${sitemapUrl}`);
    res.json({
      success: true,
      message: 'Sitemap submitted successfully'
    });
    
  } catch (error) {
    console.error('Sitemap submission error:', error);
    res.status(500).json({ error: 'Failed to submit sitemap' });
  }
});

router.get('/performance', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let { accountId, siteUrl, days = '28' } = req.query;
    
    console.log(`📊 Fetching performance data for: ${siteUrl}`);
    
    if (!siteUrl || typeof siteUrl !== 'string') {
      return res.status(400).json({ error: 'Site URL is required' });
    }
    
    const daysNum = parseInt(typeof days === 'string' ? days : '28');
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      return res.status(400).json({ error: 'Days must be between 1 and 90' });
    }
    
    const account = await gscStorage.getGscAccountWithCredentials(userId, accountId as string);
    
    if (!account) {
      return res.status(401).json({ error: 'Account not found or not authenticated' });
    }
    
    const config = await gscStorage.getGscConfiguration(userId);
    if (!config) {
      return res.status(400).json({ error: 'Configuration not found' });
    }
    
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri || getRedirectUri()
    );
    
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
      expiry_date: account.tokenExpiry
    });
    
    const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    const result = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        rowLimit: 1000
      }
    });
    
    const performanceData = (result.data.rows || []).map(row => ({
      date: row.keys?.[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }));
    
    const properties = await gscStorage.getGscProperties(userId, accountId as string);
    const property = properties.find((p: any) => p.site_url === siteUrl);
    if (property) {
      await gscStorage.savePerformanceData(property.id, performanceData);
    }
    
    console.log(`✅ Performance data fetched: ${performanceData.length} days`);
    res.json(performanceData);
    
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// router.post('/refresh-token', requireAuth, validateAccountId, async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const userId = req.user!.id;
//     const { accountId, refreshToken } = req.body;
    
//     console.log(`🔄 Refreshing GSC token for account: ${accountId}`);
    
//     if (!refreshToken || typeof refreshToken !== 'string') {
//       return res.status(400).json({ error: 'Refresh token is required' });
//     }
    
//     const config = await gscStorage.getGscConfiguration(userId);
//     if (!config) {
//       return res.status(400).json({ error: 'Configuration not found' });
//     }
    
//     const oauth2Client = new google.auth.OAuth2(
//       config.clientId,
//       config.clientSecret,
//       config.redirectUri || getRedirectUri()
//     );
    
//     oauth2Client.setCredentials({
//       refresh_token: refreshToken
//     });
    
//     const { credentials } = await oauth2Client.refreshAccessToken();
    
//     await gscStorage.updateGscAccount(userId, accountId, {
//       accessToken: credentials.access_token!,
//       tokenExpiry: credentials.expiry_date!
//     });
    
//     console.log(`✅ GSC token refreshed for account: ${accountId}`);
//     res.json({ 
//       accessToken: credentials.access_token,
//       tokenExpiry: credentials.expiry_date
//     });
//   } catch (error) {
//     console.error('Token refresh error:', error);
//     res.status(500).json({ error: 'Failed to refresh token' });
//   }
// });

router.post(
  '/refresh-token',
  requireAuth,
  validateAccountId,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { accountId } = req.body; // validateAccountId has already sanitized this

      console.log(`🔄 Refreshing GSC token for account: ${accountId}, user: ${userId}`);

      // 1. Get account with stored credentials
      const account = await gscStorage.getGscAccountWithCredentials(userId, accountId);

      if (!account) {
        console.error('❌ Account not found for refresh-token:', { userId, accountId });
        return res.status(404).json({ 
          error: 'Account not found',
          needsReauth: true
        });
      }

      if (!account.refreshToken) {
        console.error('❌ No refresh token stored for account:', { userId, accountId });
        return res.status(400).json({ 
          error: 'No refresh token stored. Please re‑authenticate this GSC account.',
          needsReauth: true
        });
      }

      // 2. Get OAuth client config
      const config = await gscStorage.getGscConfiguration(userId);
      if (!config) {
        console.error('❌ OAuth configuration not found for user:', userId);
        return res.status(400).json({ 
          error: 'Configuration not found. Please configure your Google OAuth credentials first.' 
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        config.redirectUri || getRedirectUri()
      );

      oauth2Client.setCredentials({
        refresh_token: account.refreshToken
      });

      console.log('🔄 Calling Google to refresh access token...');

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
          console.error('❌ No access token in refresh response');
          return res.status(500).json({ error: 'Google did not return an access token' });
        }

        // 3. Persist new token
        await gscStorage.updateGscAccount(userId, accountId, {
          accessToken: credentials.access_token!,
          tokenExpiry: credentials.expiry_date!,
          isActive: true
        });

        console.log(`✅ GSC token refreshed for account: ${accountId}`);

        return res.json({
          accessToken: credentials.access_token,
          tokenExpiry: credentials.expiry_date
        });

      } catch (googleErr: any) {
        // Google-specific error handling
        console.error('❌ Google refreshAccessToken error:', {
          message: googleErr.message,
          code: googleErr.code,
          data: googleErr.response?.data
        });

        // Most common case: invalid / revoked refresh token
        if (googleErr.message?.includes('invalid_grant')) {
          await gscStorage.updateGscAccount(userId, accountId, { isActive: false });

          return res.status(401).json({
            error: 'Refresh token invalid or revoked. Please reconnect this GSC account.',
            needsReauth: true
          });
        }

        // Other Google errors
        return res.status(502).json({
          error: 'Failed to refresh token with Google',
          details: process.env.NODE_ENV === 'development'
            ? googleErr.response?.data || googleErr.message
            : undefined
        });
      }

    } catch (error: any) {
      console.error('❌ Token refresh route error:', error);

      return res.status(500).json({
        error: 'Failed to refresh token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;