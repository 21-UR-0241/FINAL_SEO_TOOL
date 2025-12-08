



import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  User,
  Trash2,
  FileText,
  TrendingUp,
  Clock,
  Search,
  BarChart,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  Info,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// Environment Configuration for Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || window.location.origin;

console.log('🌍 API Base URL:', API_BASE_URL);
console.log('🌍 Client URL:', CLIENT_URL);

// Sanitization utilities
const Sanitizer = {
  validateUrl: (url) => {
    if (!url || typeof url !== "string") {
      return { isValid: false, sanitized: "", error: "URL is required" };
    }

    const trimmed = url.trim();

    if (!trimmed) {
      return { isValid: false, sanitized: "", error: "URL cannot be empty" };
    }

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: "URL must start with http:// or https://",
      };
    }

    const dangerousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /<script/i,
      /onclick=/i,
      /onerror=/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return {
          isValid: false,
          sanitized: "",
          error: "URL contains potentially harmful content",
        };
      }
    }

    try {
      const urlObj = new URL(trimmed);

      if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
        return {
          isValid: false,
          sanitized: "",
          error: "Only HTTP and HTTPS protocols are allowed",
        };
      }

      return { isValid: true, sanitized: urlObj.toString() };
    } catch (error) {
      return {
        isValid: false,
        sanitized: trimmed,
        error: "Invalid URL format",
      };
    }
  },

  validateSitemapUrl: (url) => {
    const urlValidation = Sanitizer.validateUrl(url);

    if (!urlValidation.isValid) {
      return urlValidation;
    }

    if (!urlValidation.sanitized.includes(".xml")) {
      return {
        ...urlValidation,
        warning: "Sitemap URLs typically end with .xml",
      };
    }

    return urlValidation;
  },

  validateOAuthCredentials: (clientId, clientSecret) => {
    const errors = [];
    const sanitizedId = clientId ? clientId.trim() : "";
    const sanitizedSecret = clientSecret ? clientSecret.trim() : "";

    if (!sanitizedId) {
      errors.push("Client ID is required");
    } else if (sanitizedId.length < 10) {
      errors.push("Client ID appears too short");
    } else if (!/^[\w.-]+$/.test(sanitizedId)) {
      errors.push("Client ID contains invalid characters");
    }

    if (!sanitizedSecret) {
      errors.push("Client Secret is required");
    } else if (sanitizedSecret.length < 10) {
      errors.push("Client Secret appears too short");
    } else if (!/^[\w.-]+$/.test(sanitizedSecret)) {
      errors.push("Client Secret contains invalid characters");
    }

    const placeholders = ["your-client-id", "your-client-secret", "xxxxxxxxxx"];
    if (placeholders.some((p) => sanitizedId.toLowerCase().includes(p))) {
      errors.push("Client ID appears to be a placeholder");
    }
    if (placeholders.some((p) => sanitizedSecret.toLowerCase().includes(p))) {
      errors.push("Client Secret appears to be a placeholder");
    }

    return {
      isValid: errors.length === 0,
      sanitizedId,
      sanitizedSecret,
      errors,
    };
  },

  processBulkUrls: (input) => {
    if (!input || typeof input !== "string") {
      return { valid: [], invalid: [], total: 0 };
    }

    const lines = input.split("\n");
    const valid = [];
    const invalid = [];
    const processed = new Set();

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (processed.has(trimmed)) {
        invalid.push({
          url: trimmed,
          line: index + 1,
          error: "Duplicate URL",
        });
        return;
      }

      processed.add(trimmed);

      const validation = Sanitizer.validateUrl(trimmed);
      if (validation.isValid) {
        valid.push({
          url: validation.sanitized,
          line: index + 1,
        });
      } else {
        invalid.push({
          url: trimmed,
          line: index + 1,
          error: validation.error || "Invalid URL",
        });
      }
    });

    return { valid, invalid, total: valid.length + invalid.length };
  },

  sanitizeText: (input) => {
    if (!input || typeof input !== "string") return "";

    let cleaned = input.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
    cleaned = cleaned.replace(/<[^>]+>/g, "");
    cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

    return cleaned.trim();
  },
};

// API Service Class
class SearchConsoleAPI {
  static baseURL = `${API_BASE_URL}/api/gsc`;

  static async fetchWithAuth(url, options = {}) {
    console.log('🔗 API Request:', url);
    
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        error.error ||
          error.message ||
          `Request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  static async getAuthUrl(clientId, clientSecret) {
    const body =
      clientId && clientSecret
        ? JSON.stringify({ clientId, clientSecret })
        : undefined;

    const method = clientId && clientSecret ? "POST" : "GET";
    const data = await this.fetchWithAuth(`${this.baseURL}/auth-url`, {
      method,
      body,
    });
    return data.authUrl;
  }

  static async authenticateAccount(code,userId) {
    const data = await this.fetchWithAuth(`${this.baseURL}/auth`, {
      method: "POST",
      body: JSON.stringify({ code, userId }),
    });
    return data.account;
  }

  static async getProperties(accountId) {
    return this.fetchWithAuth(
      `${this.baseURL}/properties?accountId=${accountId}`
    );
  }

  static async requestIndexing(accountId, request) {
    return this.fetchWithAuth(`${this.baseURL}/index`, {
      method: "POST",
      body: JSON.stringify({ accountId, ...request }),
    });
  }

  static async inspectURL(accountId, siteUrl, inspectionUrl) {
    return this.fetchWithAuth(`${this.baseURL}/inspect`, {
      method: "POST",
      body: JSON.stringify({ accountId, siteUrl, inspectionUrl }),
    });
  }

  static async submitSitemap(accountId, siteUrl, sitemapUrl) {
    return this.fetchWithAuth(`${this.baseURL}/sitemap`, {
      method: "POST",
      body: JSON.stringify({ accountId, siteUrl, sitemapUrl }),
    });
  }

  static async getPerformance(accountId, siteUrl, days = 28) {
    return this.fetchWithAuth(
      `${
        this.baseURL
      }/performance?accountId=${accountId}&siteUrl=${encodeURIComponent(
        siteUrl
      )}&days=${days}`
    );
  }

  static async refreshToken(accountId, refreshToken) {
    return this.fetchWithAuth(`${this.baseURL}/refresh-token`, {
      method: "POST",
      body: JSON.stringify({ accountId, refreshToken }),
    });
  }

  static async saveConfiguration(clientId, clientSecret) {
    await this.fetchWithAuth(`${this.baseURL}/configure`, {
      method: "POST",
      body: JSON.stringify({ clientId, clientSecret }),
    });
  }
}

// OAuth Configuration Modal Component
const OAuthConfigurationModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = Sanitizer.validateOAuthCredentials(
      clientId,
      clientSecret
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    await onSubmit(validation.sanitizedId, validation.sanitizedSecret);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Configure Google OAuth Credentials
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    You need to provide your own Google OAuth credentials.
                  </p>
                  <p>
                    This allows you to connect your Google Search Console
                    accounts securely.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client ID
              </label>
              <input
                type="text"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Your Google OAuth Client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="clientSecret"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Client Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  id="clientSecret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Your Google OAuth Client Secret"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  tabIndex={-1}
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How to get OAuth credentials?</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    showHelp ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {showHelp && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Steps to get your OAuth credentials:
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the Google Search Console API and Indexing API</li>
                  <li>Go to "Credentials" and create OAuth 2.0 credentials</li>
                  <li>
                    Set the redirect URI to:{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">
                      {API_BASE_URL}/api/gsc/oauth-callback
                    </code>
                  </li>
                  <li>Copy your Client ID and Client Secret</li>
                </ol>
                <div className="mt-3">
                  <a
                    href="https://developers.google.com/search/apis/indexing-api/v3/prereqs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View detailed documentation</span>
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !clientId.trim() || !clientSecret.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const GoogleSearchConsole = () => {
  const [accounts, setAccounts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [indexingQueue, setIndexingQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("index");
  const [notification, setNotification] = useState(null);

  const [urlToIndex, setUrlToIndex] = useState("");
  const [urlToInspect, setUrlToInspect] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [inspectionResult, setInspectionResult] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [quotaUsage, setQuotaUsage] = useState({ used: 0, limit: 200 });
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const authWindowRef = useRef(null);
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    const loadAccounts = () => {
      try {
        const savedAccounts = localStorage.getItem("gsc_accounts");
        if (savedAccounts) {
          const parsed = JSON.parse(savedAccounts);
          setAccounts(parsed);
          if (parsed.length > 0 && !selectedAccount) {
            setSelectedAccount(parsed[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load saved accounts:", error);
        showNotification("error", "Failed to load saved accounts");
      }
    };

    loadAccounts();

  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadProperties(selectedAccount.id);
      loadQuotaUsage(selectedAccount.id);
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("gsc_accounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    const refreshTokensIfNeeded = async () => {
      for (const account of accounts) {
        const timeUntilExpiry = account.tokenExpiry - Date.now();

        if (account.refreshToken && timeUntilExpiry < 300000) {
          try {
            const result = await SearchConsoleAPI.refreshToken(
              account.id,
              account.refreshToken
            );

            const updatedAccounts = accounts.map((acc) =>
              acc.id === account.id
                ? {
                    ...acc,
                    accessToken: result.accessToken,
                    tokenExpiry: result.tokenExpiry,
                  }
                : acc
            );

            setAccounts(updatedAccounts);
            console.log(`Token refreshed for ${account.email}`);
          } catch (error) {
            console.error(
              `Failed to refresh token for ${account.email}:`,
              error
            );
            showNotification(
              "warning",
              `Token refresh failed for ${account.email}. Please re-authenticate.`
            );

            const updatedAccounts = accounts.map((acc) =>
              acc.id === account.id ? { ...acc, isActive: false } : acc
            );
            setAccounts(updatedAccounts);
          }
        }
      }
    };

    refreshTokensIfNeeded();
    const interval = setInterval(refreshTokensIfNeeded, 60000);
    return () => clearInterval(interval);
  }, [accounts]);

  useEffect(() => {
    return () => {
      if (authWindowRef.current && !authWindowRef.current.closed) {
        authWindowRef.current.close();
      }
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
      }
    };
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadProperties = async (accountId) => {
    setLoading(true);
    try {
      const props = await SearchConsoleAPI.getProperties(accountId);
      setProperties(props);
      if (props.length > 0 && !selectedProperty) {
        setSelectedProperty(props[0]);
      }
    } catch (error) {
      showNotification("error", error.message || "Failed to load properties");
      console.error("Load properties error:", error);

      if (
        error.message?.includes("authenticated") ||
        error.message?.includes("401")
      ) {
        const updatedAccounts = accounts.map((acc) =>
          acc.id === accountId ? { ...acc, isActive: false } : acc
        );
        setAccounts(updatedAccounts);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQuotaUsage = async (accountId) => {
    const today = new Date().toDateString();
    const quotaKey = `gsc_quota_${accountId}_${today}`;
    const used = parseInt(localStorage.getItem(quotaKey) || "0", 10);
    setQuotaUsage({ used, limit: 200 });
  };

  const updateQuotaUsage = (accountId, increment = 1) => {
    const today = new Date().toDateString();
    const quotaKey = `gsc_quota_${accountId}_${today}`;
    const currentUsage = parseInt(localStorage.getItem(quotaKey) || "0", 10);
    const newUsage = currentUsage + increment;
    localStorage.setItem(quotaKey, newUsage.toString());
    setQuotaUsage({ used: newUsage, limit: 200 });
  };


  // Replace your handleOAuthCallback function with this version:

const handleOAuthCallback = async (code, userId) => {
  if (isAuthenticating) return;

  setIsAuthenticating(true);
  
  console.log('========================================');
  console.log('🔐 HANDLING OAUTH CALLBACK');
  console.log('Code:', code ? 'Present' : 'Missing');
  console.log('User ID:', userId);
  console.log('========================================');
  
  try {
    // Step 1: Exchange code and wait for account to be saved
    console.log('Step 1: Exchanging auth code...');
    const account = await SearchConsoleAPI.authenticateAccount(code, userId);
    console.log('✅ Account saved to database:', account.email);

    // Step 2: Small delay to ensure database write is committed
    // This helps with potential database replication lag
    console.log('Step 2: Waiting for database sync...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Update accounts list
    const existingIndex = accounts.findIndex((acc) => acc.id === account.id);
    let updatedAccounts;

    if (existingIndex >= 0) {
      updatedAccounts = [...accounts];
      updatedAccounts[existingIndex] = account;
      showNotification(
        "success",
        `Account ${account.email} re-authenticated`
      );
    } else {
      updatedAccounts = [...accounts, account];
      showNotification(
        "success",
        `Account ${account.email} connected successfully`
      );
    }

    setAccounts(updatedAccounts);
    
    // Step 4: Set selected account (this will trigger useEffect to load properties)
    console.log('Step 3: Setting selected account...');
    setSelectedAccount(account);
    
    console.log('✅ OAuth flow complete');
    console.log('========================================');
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ OAuth callback error:', error);
    console.error('========================================');
    showNotification(
      "error",
      error.message || "Failed to authenticate account"
    );
  } finally {
    setIsAuthenticating(false);
  }
};

// UPDATED: Now accepts both code and userId
// const handleOAuthCallback = async (code, userId) => {
//   if (isAuthenticating) return;

//   setIsAuthenticating(true);
  
//   console.log('========================================');
//   console.log('🔐 HANDLING OAUTH CALLBACK');
//   console.log('Code:', code ? 'Present' : 'Missing');
//   console.log('User ID:', userId);
//   console.log('========================================');
  
//   try {
//     // Pass both code and userId to the API
//     const account = await SearchConsoleAPI.authenticateAccount(code, userId);

//     const existingIndex = accounts.findIndex((acc) => acc.id === account.id);
//     let updatedAccounts;

//     if (existingIndex >= 0) {
//       updatedAccounts = [...accounts];
//       updatedAccounts[existingIndex] = account;
//       showNotification(
//         "success",
//         `Account ${account.email} re-authenticated`
//       );
//     } else {
//       updatedAccounts = [...accounts, account];
//       showNotification(
//         "success",
//         `Account ${account.email} connected successfully`
//       );
//     }

//     setAccounts(updatedAccounts);
//     setSelectedAccount(account);
//   } catch (error) {
//     console.error('========================================');
//     console.error('❌ OAuth callback error:', error);
//     console.error('========================================');
//     showNotification(
//       "error",
//       error.message || "Failed to authenticate account"
//     );
//   } finally {
//     setIsAuthenticating(false);
//   }
// };

  const handleSaveOAuthCredentials = async (clientId, clientSecret) => {
    try {
      setIsAuthenticating(true);

      await SearchConsoleAPI.saveConfiguration(clientId, clientSecret);

      setShowOAuthModal(false);
      showNotification("success", "OAuth credentials saved successfully");

      await proceedWithAuthentication(clientId, clientSecret);
    } catch (error) {
      console.error("Error in handleSaveOAuthCredentials:", error);
      showNotification(
        "error",
        error.message || "Failed to save configuration"
      );
      setIsAuthenticating(false);
    }
  };

const proceedWithAuthentication = async (clientId, clientSecret) => {
  try {
    if (authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close();
    }

    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
    }

    const authUrl = await SearchConsoleAPI.getAuthUrl(clientId, clientSecret);

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    authWindowRef.current = window.open(
      authUrl,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    const handleMessage = async (event) => {
      // Get backend origin from API_BASE_URL
      let backendOrigin;
      try {
        backendOrigin = new URL(API_BASE_URL).origin;
      } catch (e) {
        backendOrigin = API_BASE_URL.replace(/\/$/, '');
      }
      
      // List of allowed origins
      const allowedOrigins = [
        backendOrigin,
        window.location.origin,
        CLIENT_URL,
      ];
      
      console.log('========================================');
      console.log('📨 MESSAGE RECEIVED');
      console.log('From origin:', event.origin);
      console.log('Allowed origins:', allowedOrigins);
      console.log('Message type:', event.data?.type);
      console.log('========================================');
      
      // Check if origin is allowed
      if (!allowedOrigins.includes(event.origin)) {
        console.log('❌ Message from unauthorized origin:', event.origin);
        return;
      }

      console.log('✅ Origin authorized!');

      if (event.data.type === "GSC_AUTH_SUCCESS") {
        // UPDATED: Extract both code and userId from the message
        const { code, userId } = event.data;
        
        console.log('========================================');
        console.log('✅ GSC AUTH SUCCESS');
        console.log('Code received:', code ? 'Yes' : 'No');
        console.log('User ID received:', userId || 'None');
        console.log('========================================');

        // Clean up event listener
        window.removeEventListener("message", handleMessage);
        messageHandlerRef.current = null;

        // Close popup window
        if (authWindowRef.current && !authWindowRef.current.closed) {
          authWindowRef.current.close();
        }
        authWindowRef.current = null;

        // Exchange code for token with userId
        await handleOAuthCallback(code, userId);
        setIsAuthenticating(false);
        
      } else if (event.data.type === "GSC_AUTH_ERROR") {
        console.error('========================================');
        console.error('❌ GSC AUTH ERROR');
        console.error('Error:', event.data.error);
        console.error('========================================');
        
        window.removeEventListener("message", handleMessage);
        messageHandlerRef.current = null;

        if (authWindowRef.current && !authWindowRef.current.closed) {
          authWindowRef.current.close();
        }
        authWindowRef.current = null;

        showNotification("error", event.data.error || "Authentication failed");
        setIsAuthenticating(false);
      } else {
        console.log('⚠️ Unknown message type:', event.data?.type);
      }
    };

    messageHandlerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);

    // Check if popup was closed without completing
    const checkWindow = setInterval(() => {
      if (authWindowRef.current && authWindowRef.current.closed) {
        clearInterval(checkWindow);
        if (messageHandlerRef.current) {
          window.removeEventListener("message", messageHandlerRef.current);
          messageHandlerRef.current = null;
        }
        console.log('⚠️ Popup closed without completing authentication');
        setIsAuthenticating(false);
      }
    }, 1000);
  } catch (error) {
    console.error('========================================');
    console.error('❌ Authentication error:', error);
    console.error('========================================');
    
    if (
      error.message?.includes("No configuration found") ||
      error.message?.includes("Configuration required")
    ) {
      setShowOAuthModal(true);
      setIsAuthenticating(false);
    } else {
      showNotification(
        "error",
        error.message || "Failed to initiate authentication"
      );
      setIsAuthenticating(false);
    }
  }
};


  const handleAddAccount = async () => {
    if (isAuthenticating) {
      showNotification("info", "Authentication already in progress");
      return;
    }

    setShowOAuthModal(true);
  };

  const handleRemoveAccount = (accountId) => {
    const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(updatedAccounts);

    if (updatedAccounts.length === 0) {
      localStorage.removeItem("gsc_accounts");
    }

    if (selectedAccount?.id === accountId) {
      setSelectedAccount(updatedAccounts[0] || null);
      setProperties([]);
      setSelectedProperty(null);
    }

    showNotification("info", "Account removed");
  };

  const handleIndexUrl = async () => {
    if (!urlToIndex || !selectedAccount || !selectedProperty) return;

    if (quotaUsage.used >= quotaUsage.limit) {
      showNotification(
        "error",
        "Daily quota exceeded (200 URLs/day). Try again tomorrow."
      );
      return;
    }

    const validation = Sanitizer.validateUrl(urlToIndex);
    if (!validation.isValid) {
      showNotification("error", validation.error || "Invalid URL");
      return;
    }

    const request = {
      url: validation.sanitized,
      type: "URL_UPDATED",
      status: "pending",
    };

    setIndexingQueue([...indexingQueue, request]);
    setLoading(true);

    try {
      const result = await SearchConsoleAPI.requestIndexing(
        selectedAccount.id,
        request
      );

      setIndexingQueue((queue) =>
        queue.map((item) =>
          item.url === validation.sanitized
            ? { ...item, status: "success", notifyTime: result.notifyTime }
            : item
        )
      );

      updateQuotaUsage(selectedAccount.id, 1);
      showNotification(
        "success",
        `URL submitted for indexing: ${validation.sanitized}`
      );
      setUrlToIndex("");
    } catch (error) {
      setIndexingQueue((queue) =>
        queue.map((item) =>
          item.url === validation.sanitized
            ? { ...item, status: "error", message: error.message }
            : item
        )
      );

      if (error.message?.includes("quota")) {
        loadQuotaUsage(selectedAccount.id);
      }

      showNotification(
        "error",
        error.message || "Failed to submit URL for indexing"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkIndex = async () => {
    if (!bulkUrls || !selectedAccount || !selectedProperty) return;

    const processed = Sanitizer.processBulkUrls(bulkUrls);

    if (processed.valid.length === 0) {
      const errorDetails = processed.invalid
        .slice(0, 3)
        .map((item) => `Line ${item.line}: ${item.error}`)
        .join(", ");
      showNotification("error", `No valid URLs found. ${errorDetails}`);
      return;
    }

    if (processed.invalid.length > 0) {
      showNotification(
        "warning",
        `Found ${processed.invalid.length} invalid URL(s) - processing ${processed.valid.length} valid URL(s)`
      );
    }

    if (quotaUsage.used + processed.valid.length > quotaUsage.limit) {
      showNotification(
        "warning",
        `Only ${quotaUsage.limit - quotaUsage.used} URLs can be submitted today`
      );
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of processed.valid) {
      const request = {
        url: item.url,
        type: "URL_UPDATED",
        status: "pending",
      };

      setIndexingQueue((prev) => [...prev, request]);

      try {
        await SearchConsoleAPI.requestIndexing(selectedAccount.id, request);
        successCount++;

        setIndexingQueue((queue) =>
          queue.map((queueItem) =>
            queueItem.url === item.url
              ? { ...queueItem, status: "success" }
              : queueItem
          )
        );
      } catch (error) {
        errorCount++;

        setIndexingQueue((queue) =>
          queue.map((queueItem) =>
            queueItem.url === item.url
              ? { ...queueItem, status: "error", message: error.message }
              : queueItem
          )
        );

        if (error.message?.includes("quota")) {
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    updateQuotaUsage(selectedAccount.id, successCount);

    if (successCount > 0) {
      showNotification(
        "success",
        `Successfully submitted ${successCount} URL(s)`
      );
    }
    if (errorCount > 0) {
      showNotification("warning", `Failed to submit ${errorCount} URL(s)`);
    }

    setBulkUrls("");
    setLoading(false);
  };

  const handleInspectUrl = async () => {
    if (!urlToInspect || !selectedAccount || !selectedProperty) return;

    const validation = Sanitizer.validateUrl(urlToInspect);
    if (!validation.isValid) {
      showNotification("error", validation.error || "Invalid URL");
      return;
    }

    setLoading(true);
    setInspectionResult(null);

    try {
      const result = await SearchConsoleAPI.inspectURL(
        selectedAccount.id,
        selectedProperty.siteUrl,
        validation.sanitized
      );

      setInspectionResult(result);
      showNotification("success", "URL inspection completed");
    } catch (error) {
      showNotification("error", error.message || "Failed to inspect URL");
      console.error("Inspect URL error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSitemap = async () => {
    if (!sitemapUrl || !selectedAccount || !selectedProperty) return;

    const validation = Sanitizer.validateSitemapUrl(sitemapUrl);
    if (!validation.isValid) {
      showNotification("error", validation.error || "Invalid sitemap URL");
      return;
    }

    if (validation.warning) {
      showNotification("warning", validation.warning);
    }

    setLoading(true);
    try {
      await SearchConsoleAPI.submitSitemap(
        selectedAccount.id,
        selectedProperty.siteUrl,
        validation.sanitized
      );

      showNotification("success", `Sitemap submitted: ${validation.sanitized}`);
      setSitemapUrl("");
    } catch (error) {
      showNotification("error", error.message || "Failed to submit sitemap");
      console.error("Submit sitemap error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    if (!selectedAccount || !selectedProperty) return;

    setLoading(true);
    try {
      const data = await SearchConsoleAPI.getPerformance(
        selectedAccount.id,
        selectedProperty.siteUrl,
        28
      );

      setPerformanceData(data);
    } catch (error) {
      showNotification(
        "error",
        error.message || "Failed to load performance data"
      );
      console.error("Load performance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      const sanitized = Sanitizer.sanitizeText(text);
      await navigator.clipboard.writeText(sanitized);
      showNotification("info", "Copied to clipboard");
    } catch (err) {
      showNotification("error", "Failed to copy");
    }
  };

  const clearIndexingQueue = () => {
    setIndexingQueue([]);
    showNotification("info", "Indexing queue cleared");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OAuthConfigurationModal
        isOpen={showOAuthModal}
        onClose={() => {
          setShowOAuthModal(false);
          setIsAuthenticating(false);
        }}
        onSubmit={handleSaveOAuthCredentials}
        isLoading={isAuthenticating}
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Google Search Console Manager
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {selectedAccount && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Quota: {quotaUsage.used}/{quotaUsage.limit}
                  </span>
                </div>
              )}

              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                >
                  {selectedAccount ? (
                    <>
                      <User className="w-4 h-4" />
                      <span className="text-sm">{selectedAccount.email}</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      <span className="text-sm">Select Account</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedAccount(account);
                          setAccountDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {account.picture ? (
                            <img
                              src={account.picture}
                              alt={account.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                              {account.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {account.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!account.isActive && (
                            <AlertTriangle
                              className="w-4 h-4 text-yellow-500"
                              title="Token expired"
                            />
                          )}
                          {selectedAccount?.id === account.id && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddAccount();
                          setAccountDropdownOpen(false);
                        }}
                        disabled={isAuthenticating}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        {isAuthenticating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {isAuthenticating
                            ? "Authenticating..."
                            : "Add Google Account"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddAccount}
                disabled={isAuthenticating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span className="text-sm">Add Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAccount && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <label className="text-sm font-medium text-gray-700">
                Property:
              </label>
              <select
                value={selectedProperty?.siteUrl || ""}
                onChange={(e) => {
                  const prop = properties.find(
                    (p) => p.siteUrl === e.target.value
                  );
                  setSelectedProperty(prop || null);
                }}
                className="flex-1 max-w-md px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || properties.length === 0}
              >
                <option value="">
                  {loading ? "Loading properties..." : "Select a property"}
                </option>
                {properties.map((property) => (
                  <option key={property.siteUrl} value={property.siteUrl}>
                    {property.siteUrl} ({property.siteType})
                  </option>
                ))}
              </select>

              {selectedProperty && (
                <div className="flex items-center space-x-2">
                  {selectedProperty.verified ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Not Verified
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => loadProperties(selectedAccount.id)}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh properties"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.type === "warning" && (
              <AlertTriangle className="w-5 h-5" />
            )}
            {notification.type === "info" && <Info className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!selectedAccount || !selectedProperty ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Get Started with Google Search Console
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your Google account to start managing your website's
              presence in Google Search results.
            </p>
            <button
              onClick={handleAddAccount}
              disabled={isAuthenticating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Google Account</span>
                </>
              )}
            </button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <Send className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Submit URLs</h3>
                <p className="text-sm text-gray-600">
                  Tell Google about new or updated content on your website
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Search className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">Inspect URLs</h3>
                <p className="text-sm text-gray-600">
                  Check how Google sees your pages and troubleshoot issues
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Track Performance
                </h3>
                <p className="text-sm text-gray-600">
                  Monitor clicks, impressions, and search rankings
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Tab Navigation */}
    <div className="flex space-x-1 border-b border-gray-200 mb-6">
      {[
        { id: "index", label: "URL Indexing", icon: Send },
        { id: "inspect", label: "URL Inspection", icon: Search },
        { id: "sitemap", label: "Sitemap", icon: FileText },
        { id: "performance", label: "Performance", icon: BarChart },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <div className="space-y-6">
      {/* URL Indexing Tab */}
      {activeTab === "index" && (
        <div className="space-y-6">
          {/* Single URL Indexing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Submit URL for Indexing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL to Index
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlToIndex}
                    onChange={(e) => setUrlToIndex(e.target.value)}
                    placeholder="https://example.com/page"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleIndexUrl}
                    disabled={loading || !urlToIndex}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk URL Indexing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk URL Indexing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URLs (one per line)
                </label>
                <textarea
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="6"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleBulkIndex}
                disabled={loading || !bulkUrls}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Submit All</span>
              </button>
            </div>
          </div>

          {/* Indexing Queue */}
          {indexingQueue.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Indexing Queue ({indexingQueue.length})
                </h3>
                <button
                  onClick={clearIndexingQueue}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
              <div className="space-y-2">
                {indexingQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {item.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {item.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      {item.status === "pending" && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-900 truncate">
                        {item.url}
                      </span>
                    </div>
                    {item.message && (
                      <span className="text-xs text-red-600 ml-2">
                        {item.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL Inspection Tab */}
      {activeTab === "inspect" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Inspect URL
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL to Inspect
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlToInspect}
                    onChange={(e) => setUrlToInspect(e.target.value)}
                    placeholder="https://example.com/page"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleInspectUrl}
                    disabled={loading || !urlToInspect}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Results */}
          {inspectionResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Inspection Results
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Index Status
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      inspectionResult.indexStatus === "Submitted and indexed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {inspectionResult.indexStatus}
                  </span>
                </div>
                {inspectionResult.lastCrawlTime && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Last Crawled
                    </span>
                    <span className="text-sm text-gray-900">
                      {new Date(
                        inspectionResult.lastCrawlTime
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {inspectionResult.googleCanonical && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Google Canonical
                    </span>
                    <a
                      href={inspectionResult.googleCanonical}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-xs">
                        {inspectionResult.googleCanonical}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === "sitemap" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Submit Sitemap
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitemap URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmitSitemap}
                  disabled={loading || !sitemapUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Data (Last 28 Days)
            </h3>
            <button
              onClick={loadPerformanceData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Load Data</span>
            </button>
          </div>

          {performanceData.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {["clicks", "impressions", "ctr", "position"].map((metric) => {
                  const total = performanceData.reduce(
                    (sum, day) => sum + (day[metric] || 0),
                    0
                  );
                  const avg =
                    metric === "position"
                      ? (total / performanceData.length).toFixed(1)
                      : metric === "ctr"
                      ? ((total / performanceData.length) * 100).toFixed(2) +
                        "%"
                      : total.toLocaleString();

                  return (
                    <div
                      key={metric}
                      className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                      <div className="text-sm text-gray-600 capitalize mb-1">
                        {metric === "ctr" ? "CTR" : metric}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {avg}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Daily Performance
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {performanceData.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{day.date}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-gray-600">
                          Clicks: <strong>{day.clicks}</strong>
                        </span>
                        <span className="text-gray-600">
                          Impressions: <strong>{day.impressions}</strong>
                        </span>
                        <span className="text-gray-600">
                          CTR:{" "}
                          <strong>{(day.ctr * 100).toFixed(2)}%</strong>
                        </span>
                        <span className="text-gray-600">
                          Pos: <strong>{day.position.toFixed(1)}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click "Load Data" to view performance metrics</p>
            </div>
       )}
        </div>
      )}
    </div>
  </div>
      )}
    </div>
  );
};

export default GoogleSearchConsole;