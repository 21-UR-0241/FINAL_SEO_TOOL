
// client/src/pages/authentication.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, User, Mail, LogOut } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   BACKEND API URL CONFIGURATION
   - For development: http://localhost:3000
   - For production: Your Render backend URL
───────────────────────────────────────────────────────────── */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* ─────────────────────────────────────────────────────────────
   INLINE SANITIZERS (gentle-on-change, stricter-on-submit)
   - We avoid mutating passwords inline; only trim at submit.
   - Username: letters, numbers, underscores, dots, dashes; collapse spaces.
   - Email: trim, collapse spaces, lowercase.
   - Name: strip control chars and angle brackets; collapse whitespace.
───────────────────────────────────────────────────────────── */

const stripControl = (s: string) => (s ?? "").replace(/[\u0000-\u001F\u007F]/g, "");
const escapeAngles = (s: string) => s.replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
const collapseSpaces = (s: string) => s.replace(/\s+/g, " ");

const sanitizeUsernameInline = (s: string) => {
  // allow letters, numbers, underscore, dot, dash; convert inner spaces to dash
  const base = stripControl(s).trim();
  const spaceCollapsed = base.replace(/\s+/g, "-");
  return spaceCollapsed.replace(/[^a-zA-Z0-9._-]/g, "");
};

const sanitizeUsernameFinal = (s: string) => sanitizeUsernameInline(s).toLowerCase();

const sanitizeEmailInline = (s: string) => collapseSpaces(stripControl(s)).trim().toLowerCase();
const sanitizeEmailFinal = (s: string) => sanitizeEmailInline(s);

const sanitizeNameInline = (s: string) => collapseSpaces(escapeAngles(stripControl(s))).trim();
const sanitizeNameFinal = (s: string) => sanitizeNameInline(s);

/* ─────────────────────────────────────────────────────────── */

// Types
interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (
    username: string,
    password: string,
    email: string, 
    name?: string,
    verificationCode?: string  
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Auth Context
const AuthContext = React.createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.success && data.user) {
      setUser(data.user);
    } else {
      throw new Error("Login failed - invalid response");
    }
  };

  const signup = async (
    username: string,
    password: string,
    email: string,  
    name?: string,
    verificationCode?: string 
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, email, name, verificationCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors ? data.errors.join(", ") : data.message;
      throw new Error(errorMessage || "Signup failed");
    }

    if (data.success && data.user) {
      setUser(data.user);
    } else {
      throw new Error("Signup failed - invalid response");
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    ...context,
    isAuthenticated: !!context.user,
    isLoading: context.loading,
  };
}

// Google OAuth Button Component
function GoogleOAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Get the OAuth URL from the backend
      const response = await fetch(`${API_BASE_URL}/api/auth/google/url`, {
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Google OAuth
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to get Google OAuth URL");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      alert("Failed to connect with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
          Connecting...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </div>
      )}
    </Button>
  );
}

// Login/Signup Component
export function AuthPage() {
  const { user, login, signup } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // Signup state
  const [signupForm, setSignupForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    name: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Google OAuth callback errors
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleError = urlParams.get('google_error');
    
    if (googleError) {
      setError(decodeURIComponent(googleError));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // FINAL sanitize before request
      const username = sanitizeUsernameFinal(loginForm.username);
      const password = (loginForm.password ?? "").trim();

      await login(username, password);
      // Success - redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");

    // Check for all required fields including email
    if (!signupForm.username || !signupForm.password || !signupForm.email) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Send verification code to email
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          email: sanitizeEmailFinal(signupForm.email),
          username: sanitizeUsernameFinal(signupForm.username)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      // Move to verification step
      setVerificationStep(true);
      setResendTimer(60); // 60 second cooldown for resend
      setError("");
    } catch (error: any) {
      setError(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // FINAL sanitize before request
      const username = sanitizeUsernameFinal(signupForm.username);
      const password = (signupForm.password ?? "").trim();
      const email = sanitizeEmailFinal(signupForm.email);
      const name = signupForm.name ? sanitizeNameFinal(signupForm.name) : undefined;

      // Use the signup function from AuthProvider with verification code
      await signup(username, password, email, name, verificationCode.trim());
      // Success - redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      setError(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          email: sanitizeEmailFinal(signupForm.email),
          username: sanitizeUsernameFinal(signupForm.username)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      setResendTimer(60);
      setError("");
    } catch (error: any) {
      setError(error.message || "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setVerificationStep(false);
    setVerificationCode("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            AI SEO Content Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your websites with AI-powered SEO and content generation
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              // Reset verification state when switching tabs
              if (value === "login") {
                setVerificationStep(false);
                setVerificationCode("");
              }
              setError("");
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-4">
                  <GoogleOAuthButton />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <Input
                        id="login-username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) =>
                          setLoginForm((prev) => ({
                            ...prev,
                            username: sanitizeUsernameInline(e.target.value),
                          }))
                        }
                        className="pl-10"
                        placeholder="Enter your username"
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setLocation("/reset-password")}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="pl-10 pr-10"
                        placeholder="Enter your password"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleLogin();
                          }
                        }}
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleLogin}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {!verificationStep ? (
                  <div className="space-y-4">
                    <GoogleOAuthButton />
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">
                          Or sign up with email
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-username">Username *</Label>
                      <div className="relative">
                        <Input
                          id="signup-username"
                          type="text"
                          value={signupForm.username}
                          onChange={(e) =>
                            setSignupForm((prev) => ({
                              ...prev,
                              username: sanitizeUsernameInline(e.target.value),
                            }))
                          }
                          className="pl-10"
                          placeholder="Choose a username"
                          required
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email *</Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupForm.email}
                          onChange={(e) =>
                            setSignupForm((prev) => ({
                              ...prev,
                              email: sanitizeEmailInline(e.target.value),
                            }))
                          }
                          className="pl-10"
                          placeholder="your@email.com"
                          required
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send a verification code to this email
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupForm.name}
                        onChange={(e) =>
                          setSignupForm((prev) => ({
                            ...prev,
                            name: sanitizeNameInline(e.target.value),
                          }))
                        }
                        placeholder="Your full name (optional)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className="pl-10 pr-10"
                          placeholder="At least 6 characters"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-confirm">Confirm Password *</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) =>
                          setSignupForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm your password"
                      />
                    </div>

                    <Button
                      onClick={handleSignup}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Sending Verification Code..." : "Continue"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <Mail className="mx-auto h-12 w-12 text-blue-600" />
                      <h3 className="font-semibold text-lg">Verify Your Email</h3>
                      <p className="text-sm text-gray-600">
                        We've sent a verification code to
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {signupForm.email}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="verification-code">Verification Code *</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="text-center text-lg font-semibold tracking-widest"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && verificationCode.length === 6) {
                            handleVerifyAndComplete();
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-gray-500">Didn't receive the code?</span>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendTimer > 0 || loading}
                        className={`font-medium ${
                          resendTimer > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-700 hover:underline'
                        }`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>

                    <Button
                      onClick={handleVerifyAndComplete}
                      className="w-full"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? "Verifying..." : "Verify & Create Account"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleBackToSignup}
                      className="w-full"
                      disabled={loading}
                    >
                      Back to Sign Up
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// User Menu Component
export function CompactSidebarUserMenu() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmLogout = async () => {
    setShowConfirmation(false);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  const displayName = user.name || user.username;

  return (
    <>
      <div className="px-4 py-3 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {getInitials(displayName)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 text-xs truncate">
                {displayName}
              </div>
              <div className="text-xs text-gray-500">Pro Plan</div>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoggingOut ? "Signing Out..." : "Sign Out"}
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border border-red-300 border-t-red-600 rounded-full animate-spin"></div>
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sign Out
                </h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to sign out?
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Protected Route Component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <>{children}</>;
}


export default {
  AuthProvider,
  useAuth,
  AuthPage,
  CompactSidebarUserMenu,
  ProtectedRoute,
};