
// // client/src/pages/settings.tsx
// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useLocation } from "wouter";
// import {
//   Save,
//   Key,
//   Globe,
//   Bot,
//   Shield,
//   User,
//   Trash2,
//   Eye,
//   EyeOff,
//   Check,
//   Loader2,
//   Plus,
//   RotateCcw,
//   AlertTriangle,
//   CreditCard,
//   TrendingUp,
//   Calendar,
//   DollarSign,
//   ArrowUpCircle,
//   XCircle,
//   Edit,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { api } from "@/lib/api";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Sanitizer } from "@/utils/inputSanitizer";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// // ✅ API base URL (for Render / CORS)
// const API_URL = import.meta.env.VITE_API_URL || "";

// // Helper: fetch with API_URL + credentials
// const apiFetch = (path: string, options: RequestInit = {}) => {
//   const url = `${API_URL}${path}`;
//   console.log("🔗 API Call:", url);
//   return fetch(url, {
//     ...options,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   });
// };

// const timezoneOptions = [
//   { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5/UTC-4" },
//   { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6/UTC-5" },
//   { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7/UTC-6" },
//   { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8/UTC-7" },
//   { value: "America/Phoenix", label: "Arizona (MST)", offset: "UTC-7" },
//   { value: "America/Anchorage", label: "Alaska (AKST)", offset: "UTC-9/UTC-8" },
//   { value: "Pacific/Honolulu", label: "Hawaii (HST)", offset: "UTC-10" },
//   { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/UTC+1" },
//   { value: "Europe/Paris", label: "Central European (CET)", offset: "UTC+1/UTC+2" },
//   { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1/UTC+2" },
//   { value: "Europe/Moscow", label: "Moscow (MSK)", offset: "UTC+3" },
//   { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
//   { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
//   { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
//   { value: "Asia/Shanghai", label: "China (CST)", offset: "UTC+8" },
//   { value: "Asia/Manila", label: "Philippine Time (PHT)", offset: "UTC+8" },
//   { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
//   { value: "Asia/Tokyo", label: "Japan (JST)", offset: "UTC+9" },
//   { value: "Asia/Seoul", label: "Seoul (KST)", offset: "UTC+9" },
//   { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", offset: "UTC+11/UTC+10" },
//   { value: "Australia/Perth", label: "Perth (AWST)", offset: "UTC+8" },
//   { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", offset: "UTC+13/UTC+12" },
//   { value: "UTC", label: "UTC", offset: "UTC+0" },
// ];

// interface UserApiKey {
//   id: string;
//   provider: string;
//   keyName: string;
//   maskedKey: string;
//   isActive: boolean;
//   validationStatus: "valid" | "invalid" | "pending";
//   lastValidated?: string;
//   createdAt: string;
// }

// interface ApiKeyFormData {
//   provider: string;
//   keyName: string;
//   apiKey: string;
// }

// interface ApiKeyStatus {
//   providers: {
//     openai: {
//       configured: boolean;
//       keyName?: string;
//       lastValidated?: string;
//       status: string;
//     };
//     anthropic: {
//       configured: boolean;
//       keyName?: string;
//       lastValidated?: string;
//       status: string;
//     };
//     google_pagespeed: {
//       configured: boolean;
//       keyName?: string;
//       lastValidated?: string;
//       status: string;
//     };
//   };
// }

// interface UserSettings {
//   profile: { name: string; email: string; company: string; timezone: string };
//   notifications: {
//     emailReports: boolean;
//     contentGenerated: boolean;
//     seoIssues: boolean;
//     systemAlerts: boolean;
//   };
//   automation: {
//     defaultAiModel: string;
//     autoFixSeoIssues: boolean;
//     contentGenerationFrequency: string;
//     reportGeneration: string;
//   };
//   security: {
//     twoFactorAuth: boolean;
//     sessionTimeout: number;
//     allowApiAccess: boolean;
//   };
// }

// interface DeleteConfirmation {
//   isOpen: boolean;
//   type: "apiKey" | "website" | "subscription" | null;
//   itemId: string;
//   itemName: string;
// }

// interface Subscription {
//   id: string;
//   planId: string;
//   planName: string;
//   status: "active" | "canceled" | "past_due" | "trialing";
//   interval: "month" | "year";
//   currentPeriodEnd: string;
//   cancelAtPeriodEnd: boolean;
//   amount: number;
// }

// // 👇 INSERT HERE
// interface PaymentMethod {
//   id: string;
//   brand: string; // "visa", "mastercard", "amex"
//   last4: string;
//   expMonth: number;
//   expYear: number;
//   isDefault: boolean;
// }

// interface CardUpdateData {
//   cardNumber: string;
//   expMonth: string;
//   expYear: string;
//   cvc: string;
// }

// export default function Settings() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [, setLocation] = useLocation();

//   const [activeTab, setActiveTab] = useState("profile");
//   const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
//     isOpen: false,
//     type: null,
//     itemId: "",
//     itemName: "",
//   });

//   const [isAddingKey, setIsAddingKey] = useState(false);
//   const [newKeyForm, setNewKeyForm] = useState<ApiKeyFormData>({
//     provider: "",
//     keyName: "",
//     apiKey: "",
//   });
//   const [validatingKeys, setValidatingKeys] = useState<Set<string>>(new Set());
//   const [showApiKey, setShowApiKey] = useState(false);

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
//   const [isEditingCard, setIsEditingCard] = useState(false);
//   const [cardUpdateData, setCardUpdateData] = useState<CardUpdateData>({
//     cardNumber: "",
//     expMonth: "",
//     expYear: "",
//     cvc: "",
//   });

//   // --- SETTINGS ---
//   const {
//     data: settings,
//     isLoading: settingsLoading,
//     error: settingsError,
//   } = useQuery<UserSettings>({
//     queryKey: ["/api/user/settings"],
//     queryFn: async () => {
//       const response = await apiFetch("/api/user/settings");
//       if (!response.ok) throw new Error("Failed to fetch settings");
//       return response.json();
//     },
//   });

//   const { data: websites } = useQuery({
//     queryKey: ["/api/user/websites"],
//     queryFn: api.getWebsites,
//   });

//   // --- API KEYS ---
//   const { data: userApiKeys, refetch: refetchApiKeys } = useQuery<UserApiKey[]>({
//     queryKey: ["/api/user/api-keys"],
//     queryFn: async () => {
//       const response = await apiFetch("/api/user/api-keys");
//       if (!response.ok) throw new Error("Failed to fetch API keys");
//       return response.json();
//     },
//   });

//   const { data: apiKeyStatus } = useQuery<ApiKeyStatus>({
//     queryKey: ["/api/user/api-keys/status"],
//     queryFn: async () => {
//       const response = await apiFetch("/api/user/api-keys/status");
//       if (!response.ok) throw new Error("Failed to fetch API key status");
//       return response.json();
//     },
//     refetchInterval: 30000,
//   });

//   // --- SUBSCRIPTION ---
//   const {
//     data: subscription,
//     isLoading: subscriptionLoading,
//   } = useQuery<Subscription | null>({
//     queryKey: ["/api/billing/subscription"],
//     queryFn: async () => {
//       const response = await apiFetch("/api/billing/subscription");
//       if (!response.ok) {
//         if (response.status === 404) {
//           return null; // no active subscription
//         }
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.message || "Failed to fetch subscription");
//       }
//       const data = await response.json();
//       console.log("Subscription data:", data);
//       return data;
//     },
//   });


//     // --- PAYMENT METHOD ---
//   const {
//     data: paymentMethod,
//     isLoading: paymentMethodLoading,
//   } = useQuery<PaymentMethod | null>({
//     queryKey: ["/api/billing/payment-method"],
//     queryFn: async () => {
//       const response = await apiFetch("/api/billing/payment-method");
//       if (!response.ok) {
//         if (response.status === 404) {
//           return null;
//         }
//         const err = await response.json().catch(() => ({}));
//         throw new Error(err.message || "Failed to fetch payment method");
//       }
//       return response.json();
//     },
//     enabled: !!subscription, // Only fetch if user has subscription
//   });
//   // --- MUTATIONS ---

//   // Delete website
//   const deleteWebsite = useMutation({
//     mutationFn: async (websiteId: string) => {
//       const response = await apiFetch(`/api/user/websites/${websiteId}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to delete website");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/user/websites"] });
//       toast({
//         title: "Website Disconnected",
//         description: "The website has been successfully removed from your account.",
//       });
//       closeDeleteConfirmation();
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Delete Website",
//         description: error.message || "Could not disconnect the website. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Cancel subscription
//   const cancelSubscription = useMutation({
//     mutationFn: async () => {
//       const response = await apiFetch("/api/billing/subscription/cancel", {
//         method: "POST",
//         body: JSON.stringify({ immediate: false }), // cancel at period end
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to cancel subscription");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
//       toast({
//         title: "Subscription Canceled",
//         description:
//           "Your subscription will remain active until the end of the billing period.",
//       });
//       closeDeleteConfirmation();
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Cancel Subscription",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Resume subscription
//   const resumeSubscription = useMutation({
//     mutationFn: async () => {
//       const response = await apiFetch("/api/billing/subscription/resume", {
//         method: "POST",
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to resume subscription");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
//       toast({
//         title: "Subscription Resumed",
//         description: "Your subscription will continue automatically.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Resume Subscription",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Settings update
//   const updateSettings = useMutation({
//     mutationFn: async (newSettings: UserSettings) => {
//       const response = await apiFetch("/api/user/settings", {
//         method: "PUT",
//         body: JSON.stringify(newSettings),
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to update settings");
//       }
//       return response.json();
//     },
//     onSuccess: (updatedSettings) => {
//       queryClient.setQueryData(["/api/user/settings"], updatedSettings);
//       toast({
//         title: "Settings Saved",
//         description: "Your settings have been successfully updated.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Save Failed",
//         description: error.message || "Failed to save settings. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Settings reset
//   const resetSettings = useMutation({
//     mutationFn: async () => {
//       const response = await apiFetch("/api/user/settings", {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to reset settings");
//       }
//       return response.json();
//     },
//     onSuccess: (result) => {
//       queryClient.setQueryData(["/api/user/settings"], result.settings);
//       toast({
//         title: "Settings Reset",
//         description: "Your settings have been reset to defaults.",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Reset Failed",
//         description: error.message || "Failed to reset settings. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   // API key mutations
//   const addApiKey = useMutation({
//     mutationFn: async (keyData: ApiKeyFormData) => {
//       const response = await apiFetch("/api/user/api-keys", {
//         method: "POST",
//         body: JSON.stringify(keyData),
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to add API key");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "API Key Added",
//         description: "Your API key has been added and validated successfully.",
//       });
//       setIsAddingKey(false);
//       setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
//       refetchApiKeys();
//       queryClient.invalidateQueries({
//         queryKey: ["/api/user/api-keys/status"],
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Add API Key",
//         description: error.message || "Please check your API key and try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const validateApiKey = useMutation({
//     mutationFn: async (keyId: string) => {
//       const response = await apiFetch(`/api/user/api-keys/${keyId}/validate`, {
//         method: "POST",
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to validate API key");
//       }
//       return response.json();
//     },
//     onSuccess: (data) => {
//       toast({
//         title: data.isValid ? "Key Valid" : "Key Invalid",
//         description: data.isValid ? "API key is working correctly." : data.error,
//         variant: data.isValid ? "default" : "destructive",
//       });
//       refetchApiKeys();
//       queryClient.invalidateQueries({
//         queryKey: ["/api/user/api-keys/status"],
//       });
//     },
//   });

//   const deleteApiKey = useMutation({
//     mutationFn: async (keyId: string) => {
//       const response = await apiFetch(`/api/user/api-keys/${keyId}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to delete API key");
//       }
//       return response.json().catch(() => ({}));
//     },
//     onSuccess: () => {
//       toast({
//         title: "API Key Deleted",
//         description: "The API key has been removed from your account.",
//       });
//       refetchApiKeys();
//       queryClient.invalidateQueries({
//         queryKey: ["/api/user/api-keys/status"],
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Failed to Delete API Key",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const changePassword = useMutation({
//     mutationFn: api.changePassword,
//     onSuccess: () => {
//       toast({
//         title: "Password Changed",
//         description: "Your password has been successfully updated.",
//       });
//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//       setPasswordErrors([]);
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Password Change Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // Update payment method
//   const updatePaymentMethod = useMutation({
//     mutationFn: async (cardData: CardUpdateData) => {
//       const response = await apiFetch("/api/billing/payment-method", {
//         method: "PUT",
//         body: JSON.stringify(cardData),
//       });
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to update payment method");
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/billing/payment-method"] });
//       toast({
//         title: "Payment Method Updated",
//         description: "Your card has been successfully updated.",
//       });
//       setIsEditingCard(false);
//       setCardUpdateData({
//         cardNumber: "",
//         expMonth: "",
//         expYear: "",
//         cvc: "",
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Update Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // --- DELETE CONFIRMATION ---

//   const openDeleteConfirmation = (
//     type: "apiKey" | "website" | "subscription",
//     itemId: string,
//     itemName: string,
//   ) => {
//     setDeleteConfirmation({
//       isOpen: true,
//       type,
//       itemId,
//       itemName,
//     });
//   };

//   const closeDeleteConfirmation = () => {
//     setDeleteConfirmation({
//       isOpen: false,
//       type: null,
//       itemId: "",
//       itemName: "",
//     });
//   };

//   const handleConfirmDelete = () => {
//     if (deleteConfirmation.type === "apiKey" && deleteConfirmation.itemId) {
//       deleteApiKey.mutate(deleteConfirmation.itemId, {
//         onSuccess: () => closeDeleteConfirmation(),
//       });
//     } else if (
//       deleteConfirmation.type === "website" &&
//       deleteConfirmation.itemId
//     ) {
//       deleteWebsite.mutate(deleteConfirmation.itemId, {
//         onSuccess: () => closeDeleteConfirmation(),
//       });
//     } else if (deleteConfirmation.type === "subscription") {
//       cancelSubscription.mutate();
//     }
//   };

//   // --- SETTINGS HELPERS ---

//   const handleSave = () => {
//     if (!settings) return;
//     const sanitizedSettings: UserSettings = {
//       profile: {
//         name: Sanitizer.sanitizeText(settings.profile.name),
//         email: settings.profile.email,
//         company: Sanitizer.sanitizeText(settings.profile.company),
//         timezone: settings.profile.timezone,
//       },
//       notifications: settings.notifications,
//       automation: settings.automation,
//       security: {
//         twoFactorAuth: settings.security.twoFactorAuth,
//         sessionTimeout: Math.min(168, Math.max(1, settings.security.sessionTimeout)),
//         allowApiAccess: settings.security.allowApiAccess,
//       },
//     };
//     updateSettings.mutate(sanitizedSettings);
//   };

//   const handleReset = () => {
//     resetSettings.mutate();
//   };

//   const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
//     if (!settings) return;

//     let sanitizedValue = value;

//     if (section === "profile") {
//       switch (key) {
//         case "name":
//         case "company":
//           sanitizedValue = Sanitizer.sanitizeText(value);
//           break;
//         case "email": {
//           const emailValidation = Sanitizer.validateEmail(value);
//           if (!emailValidation.isValid && value !== "") {
//             toast({
//               title: "Invalid Email",
//               description:
//                 emailValidation.error || "Please enter a valid email address",
//               variant: "destructive",
//             });
//             return;
//           }
//           sanitizedValue = emailValidation.sanitized;
//           break;
//         }
//       }
//     } else if (section === "security" && key === "sessionTimeout") {
//       const numValue = parseInt(value);
//       if (!isNaN(numValue)) {
//         sanitizedValue = Math.min(168, Math.max(1, numValue));
//       }
//     }

//     queryClient.setQueryData(["/api/user/settings"], {
//       ...settings,
//       [section]: {
//         ...settings[section],
//         [key]: sanitizedValue,
//       },
//     });
//   };

//   const handleAddApiKey = () => {
//     const sanitizedKeyName = Sanitizer.sanitizeText(newKeyForm.keyName);
//     if (!newKeyForm.provider || !sanitizedKeyName || !newKeyForm.apiKey) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all fields.",
//         variant: "destructive",
//       });
//       return;
//     }
//     if (sanitizedKeyName.length < 2 || sanitizedKeyName.length > 100) {
//       toast({
//         title: "Invalid Key Name",
//         description: "Key name must be between 2 and 100 characters.",
//         variant: "destructive",
//       });
//       return;
//     }
//     const apiKey = newKeyForm.apiKey.trim();
//     if (newKeyForm.provider === "openai" && !apiKey.startsWith("sk-")) {
//       toast({
//         title: "Invalid API Key Format",
//         description: "OpenAI API keys should start with 'sk-'",
//         variant: "destructive",
//       });
//       return;
//     }
//     if (newKeyForm.provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
//       toast({
//         title: "Invalid API Key Format",
//         description: "Anthropic API keys should start with 'sk-ant-'",
//         variant: "destructive",
//       });
//       return;
//     }
//     addApiKey.mutate({
//       provider: newKeyForm.provider,
//       keyName: sanitizedKeyName,
//       apiKey,
//     });
//   };

//   const handleValidateKey = (keyId: string) => {
//     setValidatingKeys((prev) => new Set(prev).add(keyId));
//     validateApiKey.mutate(keyId, {
//       onSettled: () => {
//         setValidatingKeys((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(keyId);
//           return newSet;
//         });
//       },
//     });
//   };

//   const validatePasswordForm = (): boolean => {
//     const errors: string[] = [];

//     if (!passwordData.currentPassword)
//       errors.push("Current password is required");
//     if (!passwordData.newPassword) errors.push("New password is required");
//     if (!passwordData.confirmPassword)
//       errors.push("Password confirmation is required");
//     if (passwordData.newPassword && passwordData.newPassword.length > 200) {
//       errors.push("Password is too long (maximum 200 characters)");
//     }
//     if (
//       passwordData.newPassword &&
//       passwordData.confirmPassword &&
//       passwordData.newPassword !== passwordData.confirmPassword
//     ) {
//       errors.push("New password and confirmation do not match");
//     }
//     if (passwordData.newPassword && passwordData.newPassword.length < 8) {
//       errors.push("New password must be at least 8 characters long");
//     }
//     if (
//       passwordData.newPassword &&
//       passwordData.currentPassword &&
//       passwordData.newPassword === passwordData.currentPassword
//     ) {
//       errors.push("New password must be different from current password");
//     }
//     const weakPasswords = [
//       "password",
//       "12345678",
//       "qwerty",
//       "abc12345",
//       "password123",
//     ];
//     if (
//       passwordData.newPassword &&
//       weakPasswords.includes(passwordData.newPassword.toLowerCase())
//     ) {
//       errors.push("This password is too common. Please choose a stronger password");
//     }

//     setPasswordErrors(errors);
//     return errors.length === 0;
//   };

//   const handlePasswordChange = () => {
//     if (!validatePasswordForm()) {
//       toast({
//         title: "Validation Error",
//         description: "Please fix the errors before submitting.",
//         variant: "destructive",
//       });
//       return;
//     }
//     changePassword.mutate(passwordData);
//   };

//   const getStatusBadge = (status: string, provider: string) => {
//     const providerStatus =
//       apiKeyStatus?.providers?.[
//         provider as keyof typeof apiKeyStatus.providers
//       ];
//     if (!providerStatus?.configured) {
//       return (
//         <Badge className="bg-gray-100 text-gray-800">Not Configured</Badge>
//       );
//     }
//     if (status === "valid") {
//       return <Badge className="bg-green-100 text-green-800">✓ Active</Badge>;
//     } else if (status === "invalid") {
//       return <Badge className="bg-red-100 text-red-800">✗ Invalid</Badge>;
//     } else {
//       return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
//     }
//   };

//   const getProviderIcon = (provider: string) => {
//     switch (provider) {
//       case "openai":
//         return <Bot className="w-6 h-6 text-green-600" />;
//       case "anthropic":
//         return <Bot className="w-6 h-6 text-blue-600" />;
//       case "google_pagespeed":
//         return <Globe className="w-6 h-6 text-orange-600" />;
//       default:
//         return <Key className="w-6 h-6 text-gray-400" />;
//     }
//   };

//   const getProviderName = (provider: string) => {
//     switch (provider) {
//       case "openai":
//         return "OpenAI GPT-4";
//       case "anthropic":
//         return "Anthropic Claude";
//       case "google_pagespeed":
//         return "Google PageSpeed Insights";
//       default:
//         return provider;
//     }
//   };

//   const getSubscriptionStatusBadge = (status: string) => {
//     switch (status) {
//       case "active":
//         return <Badge className="bg-green-100 text-green-800">Active</Badge>;
//       case "canceled":
//         return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
//       case "past_due":
//         return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
//       case "trialing":
//         return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
//       default:
//         return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
//     }
//   };

//   const handleUpgrade = () => {
//     setLocation("/subscription");
//   };

//     const handleUpdateCard = () => {
//     // Validate card data
//     if (!cardUpdateData.cardNumber || !cardUpdateData.expMonth || 
//         !cardUpdateData.expYear || !cardUpdateData.cvc) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all card fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Basic validation
//     const cardNumber = cardUpdateData.cardNumber.replace(/\s/g, "");
//     if (cardNumber.length < 13 || cardNumber.length > 19) {
//       toast({
//         title: "Invalid Card Number",
//         description: "Please enter a valid card number.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (parseInt(cardUpdateData.expMonth) < 1 || parseInt(cardUpdateData.expMonth) > 12) {
//       toast({
//         title: "Invalid Expiry Month",
//         description: "Month must be between 01 and 12.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (cardUpdateData.cvc.length < 3 || cardUpdateData.cvc.length > 4) {
//       toast({
//         title: "Invalid CVC",
//         description: "CVC must be 3 or 4 digits.",
//         variant: "destructive",
//       });
//       return;
//     }

//     updatePaymentMethod.mutate(cardUpdateData);
//   };

//   const getCardBrandIcon = (brand: string) => {
//     switch (brand.toLowerCase()) {
//       case "visa":
//         return "💳";
//       case "mastercard":
//         return "💳";
//       case "amex":
//         return "💳";
//       default:
//         return "💳";
//     }
//   };

//   // --- LOADING / ERROR STATES ---

//   if (settingsLoading) {
//     return (
//       <div className="py-6">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="w-8 h-8 animate-spin" />
//             <span className="ml-2">Loading settings...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (settingsError || !settings) {
//     return (
//       <div className="py-6">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
//           <div className="text-center py-12">
//             <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
//             <p className="text-red-600 font-medium">
//               Failed to load settings. Please refresh the page.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- MAIN RENDER ---

//   return (
//     <div className="py-6">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
//         {/* Header */}
//         <div className="md:flex md:items-center md:justify-between mb-8">
//           <div className="flex-1 min-w-0">
//             <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
//               Settings
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               Manage your account, subscription, integrations, and automation preferences
//             </p>
//           </div>
//               <div className="mt-4 flex flex-col sm:flex-row gap-2 md:mt-0 md:ml-4 w-full sm:w-auto">
//                 <Button
//                   variant="outline"
//                   onClick={handleReset}
//                   disabled={resetSettings.isPending}
//                   className="w-full sm:w-auto"
//                 >
//                   <RotateCcw className="w-4 h-4 mr-2" />
//                   <span className="hidden sm:inline">{resetSettings.isPending ? "Resetting..." : "Reset to Defaults"}</span>
//                   <span className="sm:hidden">{resetSettings.isPending ? "Resetting..." : "Reset"}</span>
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   disabled={updateSettings.isPending}
//                   className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
//                 >
//               <Save className="w-4 h-4 mr-2" />
//               {updateSettings.isPending ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </div>

//         {/* Mobile: Dropdown Select */}
//         <div className="md:hidden mb-6">
//           <Select value={activeTab} onValueChange={setActiveTab}>
//             <SelectTrigger className="w-full">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="profile">
//                 <div className="flex items-center">
//                   <User className="w-4 h-4 mr-2" />
//                   Profile
//                 </div>
//               </SelectItem>
//               <SelectItem value="subscription">
//                 <div className="flex items-center">
//                   <CreditCard className="w-4 h-4 mr-2" />
//                   Subscription
//                 </div>
//               </SelectItem>
//               <SelectItem value="integrations">
//                 <div className="flex items-center">
//                   <Key className="w-4 h-4 mr-2" />
//                   API Keys
//                 </div>
//               </SelectItem>
//               <SelectItem value="automation">
//                 <div className="flex items-center">
//                   <Bot className="w-4 h-4 mr-2" />
//                   Automation
//                 </div>
//               </SelectItem>
//               <SelectItem value="security">
//                 <div className="flex items-center">
//                   <Shield className="w-4 h-4 mr-2" />
//                   Security
//                 </div>
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Desktop: Traditional Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="hidden md:grid w-full grid-cols-5 mb-6">
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//             <TabsTrigger value="subscription">Subscription</TabsTrigger>
//             <TabsTrigger value="integrations">API Keys</TabsTrigger>
//             <TabsTrigger value="automation">Automation</TabsTrigger>
//             <TabsTrigger value="security">Security</TabsTrigger>
//           </TabsList>

//           {/* PROFILE */}
//           <TabsContent value="profile" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <User className="w-5 h-5 mr-2" />
//                   Profile Information
//                 </CardTitle>
//                 <CardDescription>
//                   Update your personal information and preferences
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="name">Full Name</Label>
//                     <Input
//                       id="name"
//                       value={settings.profile.name}
//                       onChange={(e) =>
//                         updateSetting("profile", "name", e.target.value)
//                       }
//                       maxLength={100}
//                       placeholder="Enter your full name"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="email">Email Address</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={settings.profile.email}
//                       onChange={(e) =>
//                         updateSetting("profile", "email", e.target.value)
//                       }
//                       maxLength={254}
//                       placeholder="your.email@example.com"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label htmlFor="company">Company</Label>
//                   <Input
//                     id="company"
//                     value={settings.profile.company}
//                     onChange={(e) =>
//                       updateSetting("profile", "company", e.target.value)
//                     }
//                     maxLength={200}
//                     placeholder="Your company name"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="timezone">Timezone</Label>
//                   <Select
//                     value={settings.profile.timezone}
//                     onValueChange={(value) =>
//                       updateSetting("profile", "timezone", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select your timezone" />
//                     </SelectTrigger>
//                     <SelectContent className="max-h-[300px]">
//                       <SelectItem
//                         value="auto"
//                         className="font-semibold text-blue-600"
//                       >
//                         🌍 Auto-detect:{" "}
//                         {Intl.DateTimeFormat().resolvedOptions().timeZone}
//                       </SelectItem>
//                       <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
//                         Americas
//                       </div>
//                       {timezoneOptions
//                         .filter(
//                           (tz) =>
//                             tz.value.startsWith("America/") ||
//                             tz.value.startsWith("Pacific/H"),
//                         )
//                         .map((tz) => (
//                           <SelectItem key={tz.value} value={tz.value}>
//                             {tz.label} ({tz.offset})
//                           </SelectItem>
//                         ))}
//                       <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
//                         Europe
//                       </div>
//                       {timezoneOptions
//                         .filter((tz) => tz.value.startsWith("Europe/"))
//                         .map((tz) => (
//                           <SelectItem key={tz.value} value={tz.value}>
//                             {tz.label} ({tz.offset})
//                           </SelectItem>
//                         ))}
//                       <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
//                         Asia
//                       </div>
//                       {timezoneOptions
//                         .filter((tz) => tz.value.startsWith("Asia/"))
//                         .map((tz) => (
//                           <SelectItem key={tz.value} value={tz.value}>
//                             {tz.label} ({tz.offset})
//                           </SelectItem>
//                         ))}
//                       <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
//                         Oceania
//                       </div>
//                       {timezoneOptions
//                         .filter(
//                           (tz) =>
//                             tz.value.startsWith("Australia/") ||
//                             tz.value.startsWith("Pacific/Auckland"),
//                         )
//                         .map((tz) => (
//                           <SelectItem key={tz.value} value={tz.value}>
//                             {tz.label} ({tz.offset})
//                           </SelectItem>
//                         ))}
//                       <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
//                         UTC
//                       </div>
//                       <SelectItem value="UTC">
//                         UTC (Coordinated Universal Time)
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Your timezone is used for scheduling content and reports.
//                     Currently:{" "}
//                     {new Date().toLocaleString("en-US", {
//                       timeZone: settings.profile.timezone,
//                       dateStyle: "medium",
//                       timeStyle: "short",
//                     })}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>



//           </TabsContent>

//           {/* SUBSCRIPTION */}
//           <TabsContent value="subscription" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <CreditCard className="w-5 h-5 mr-2" />
//                   Current Subscription
//                 </CardTitle>
//                 <CardDescription>Manage your subscription and billing</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {subscriptionLoading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                     <span>Loading subscription...</span>
//                   </div>
//                 ) : !subscription ? (
//                   <div className="text-center py-8">
//                     <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">
//                       No Active Subscription
//                     </h3>
//                     <p className="text-gray-500 mb-4">
//                       You don't have an active subscription. Upgrade to unlock premium
//                       features.
//                     </p>
//                       <Button
//                         onClick={handleUpgrade}
//                         className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
//                       >
//                         <TrendingUp className="w-4 h-4 mr-2" />
//                         View Plans
//                       </Button>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Current Plan Card */}
//                     <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
//                       <div className="flex items-center justify-between mb-4">
//                         <div>
//                           <h3 className="text-2xl font-bold text-gray-900">
//                             {subscription.planName}
//                           </h3>
//                           <p className="text-sm text-gray-600">
//                             Billed{" "}
//                             {subscription.interval === "year" ? "annually" : "monthly"}
//                           </p>
//                         </div>
//                         {getSubscriptionStatusBadge(subscription.status)}
//                       </div>
//                       <div className="flex items-baseline mb-4">
//                         <DollarSign className="w-6 h-6 text-gray-700" />
//                         <span className="text-4xl font-bold text-gray-900">
//                           {subscription.amount}
//                         </span>
//                         <span className="text-gray-600 ml-2">
//                           / {subscription.interval === "year" ? "year" : "month"}
//                         </span>
//                       </div>
//                       <div className="flex items-center text-sm text-gray-600">
//                         <Calendar className="w-4 h-4 mr-2" />
//                         {subscription.cancelAtPeriodEnd ? (
//                           <span className="text-red-600 font-medium">
//                             Cancels on{" "}
//                             {new Date(
//                               subscription.currentPeriodEnd,
//                             ).toLocaleDateString()}
//                           </span>
//                         ) : (
//                           <span>
//                             Renews on{" "}
//                             {new Date(
//                               subscription.currentPeriodEnd,
//                             ).toLocaleDateString()}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                   {/* Actions */}
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     {subscription.planId !== "enterprise" && (
//                       <Button
//                         onClick={handleUpgrade}
//                         className="flex-1 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                       >
//                           <ArrowUpCircle className="w-4 h-4 mr-2" />
//                           Upgrade Plan
//                         </Button>
//                       )}
//                         {subscription.cancelAtPeriodEnd ? (
//                           <Button
//                             onClick={() => resumeSubscription.mutate()}
//                             disabled={resumeSubscription.isPending}
//                             variant="outline"
//                             className="flex-1 w-full sm:w-auto"
//                           >
//                           {resumeSubscription.isPending ? (
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           ) : (
//                             <Check className="w-4 h-4 mr-2" />
//                           )}
//                           Resume Subscription
//                         </Button>
//                           ) : (
//                             <Button
//                               onClick={() =>
//                                 openDeleteConfirmation(
//                                   "subscription",
//                                   subscription.id,
//                                   subscription.planName,
//                                 )
//                               }
//                               disabled={cancelSubscription.isPending}
//                               variant="outline"
//                               className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
//                             >
//                           <XCircle className="w-4 h-4 mr-2" />
//                           Cancel Subscription
//                         </Button>
//                       )}
//                     </div>

//                     {subscription.cancelAtPeriodEnd && (
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                         <div className="flex items-start">
//                           <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
//                           <div>
//                             <p className="text-sm font-medium text-yellow-900">
//                               Subscription Ending
//                             </p>
//                             <p className="text-sm text-yellow-700 mt-1">
//                               Your subscription will remain active until{" "}
//                               {new Date(
//                                 subscription.currentPeriodEnd,
//                               ).toLocaleDateString()}
//                               . You can resume it at any time before then.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </CardContent>
//             </Card>

//                         {/* 👇 INSERT HERE - Payment Method Card */}
//             {subscription && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center justify-between">
//                     <span className="flex items-center">
//                       <CreditCard className="w-5 h-5 mr-2" />
//                       Payment Method
//                     </span>
// <Button
//   size="sm"
//   variant="outline"
//   onClick={() => {
//     // Pre-fill form with existing card details
//     if (paymentMethod) {
//       setCardUpdateData({
//         cardNumber: "", // We don't have the full number, keep empty
//         expMonth: paymentMethod.expMonth.toString().padStart(2, '0'),
//         expYear: paymentMethod.expYear.toString().slice(-2), // Last 2 digits
//         cvc: "", // Security - don't pre-fill CVC
//       });
//     }
//     setIsEditingCard(true);
//   }}
//   className="flex items-center"
// >
//                       <Edit className="w-4 h-4 mr-2" />
//                       Update Card
//                     </Button>
//                   </CardTitle>
//                   <CardDescription>
//                     Manage your payment method for subscription billing
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {paymentMethodLoading ? (
//                     <div className="flex items-center justify-center py-4">
//                       <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                       <span className="text-sm">Loading payment method...</span>
//                     </div>
//                   ) : paymentMethod ? (
//                     <div className="flex items-center justify-between p-4 border rounded-lg">
//                       <div className="flex items-center space-x-4">
//                         <div className="text-3xl">{getCardBrandIcon(paymentMethod.brand)}</div>
//                         <div>
//                           <p className="font-medium text-gray-900 capitalize">
//                             {paymentMethod.brand} •••• {paymentMethod.last4}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
//                           </p>
//                         </div>
//                       </div>
//                       {paymentMethod.isDefault && (
//                         <Badge className="bg-blue-100 text-blue-800">Default</Badge>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="text-center py-4 text-gray-500">
//                       <p className="text-sm">No payment method on file</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             )}


//           </TabsContent>

//           {/* INTEGRATIONS (API Keys) */}
//           <TabsContent value="integrations" className="space-y-6">
//             <Card>
//               <CardHeader>
//                   <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                     <span className="flex items-center">
//                       <Key className="w-5 h-5 mr-2" />
//                       Your API Keys
//                     </span>
//                     <Button
//                       size="sm"
//                       onClick={() => setIsAddingKey(true)}
//                       disabled={isAddingKey}
//                       className="w-full sm:w-auto"
//                     >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add API Key
//                   </Button>
//                 </CardTitle>
//                 <CardDescription>
//                   Securely store and manage your AI service API keys. Keys are encrypted
//                   and never visible in full.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Add API key form */}
//                 {isAddingKey && (
//                   <div className="border rounded-lg p-4 bg-gray-50">
//                     <h4 className="font-medium mb-4">Add New API Key</h4>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="provider">Service Provider</Label>
//                         <Select
//                           value={newKeyForm.provider}
//                           onValueChange={(value) =>
//                             setNewKeyForm((prev) => ({ ...prev, provider: value }))
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select provider" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
//                             <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
//                             <SelectItem value="google_pagespeed">
//                               Google PageSpeed Insights
//                             </SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <Label htmlFor="keyName">Key Name</Label>
//                         <Input
//                           id="keyName"
//                           placeholder="e.g., My OpenAI Key"
//                           value={newKeyForm.keyName}
//                           onChange={(e) => {
//                             const sanitized = Sanitizer.sanitizeText(e.target.value);
//                             setNewKeyForm((prev) => ({
//                               ...prev,
//                               keyName: sanitized,
//                             }));
//                           }}
//                           maxLength={100}
//                         />
//                         <p className="text-xs text-gray-400 mt-1">
//                           A friendly name to identify this key (2-100 characters)
//                         </p>
//                       </div>
//                       <div>
//                         <Label htmlFor="apiKey">API Key</Label>
//                         <div className="flex items-center space-x-2">
//                           <Input
//                             id="apiKey"
//                             type={showApiKey ? "text" : "password"}
//                             placeholder={
//                               newKeyForm.provider === "openai"
//                                 ? "sk-..."
//                                 : newKeyForm.provider === "anthropic"
//                                 ? "sk-ant-..."
//                                 : "AIza..."
//                             }
//                             value={newKeyForm.apiKey}
//                             onChange={(e) =>
//                               setNewKeyForm((prev) => ({
//                                 ...prev,
//                                 apiKey: e.target.value.trim(),
//                               }))
//                             }
//                             maxLength={500}
//                             autoComplete="off"
//                             spellCheck={false}
//                           />
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setShowApiKey(!showApiKey)}
//                           >
//                             {showApiKey ? (
//                               <EyeOff className="w-4 h-4" />
//                             ) : (
//                               <Eye className="w-4 h-4" />
//                             )}
//                           </Button>
//                         </div>
//                         {newKeyForm.provider && (
//                           <p className="text-xs text-gray-400 mt-1">
//                             {newKeyForm.provider === "openai" &&
//                               'OpenAI API keys start with "sk-"'}
//                             {newKeyForm.provider === "anthropic" &&
//                               'Anthropic API keys start with "sk-ant-"'}
//                             {newKeyForm.provider === "google_pagespeed" &&
//                               'Google API keys typically start with "AIza"'}
//                           </p>
//                         )}
//                       </div>
//                           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//                             <Button
//                               onClick={handleAddApiKey}
//                               disabled={addApiKey.isPending}
//                               className="w-full sm:w-auto"
//                             >
//                           {addApiKey.isPending ? (
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           ) : (
//                             <Check className="w-4 h-4 mr-2" />
//                           )}
//                           {addApiKey.isPending ? "Validating..." : "Add Key"}
//                         </Button>
//                           <Button
//                             variant="outline"
//                             onClick={() => {
//                               setIsAddingKey(false);
//                               setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
//                             }}
//                             className="w-full sm:w-auto"
//                           >
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Existing keys */}
//                 <div className="space-y-3">
//                   {userApiKeys?.map((apiKey: UserApiKey) => (
//                       <div
//                         key={apiKey.id}
//                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4"
//                       >
//                         <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
//                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
//                         {getProviderIcon(apiKey.provider)}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                       <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
//                         {Sanitizer.escapeHtml(apiKey.keyName)}
//                       </p>
//                       <p className="text-xs sm:text-sm text-gray-500">
//                         {getProviderName(apiKey.provider)}
//                       </p>
//                       <p className="text-xs text-gray-400 font-mono break-all">
//                             {apiKey.maskedKey}
//                           </p>
//                           {apiKey.lastValidated && (
//                             <p className="text-xs text-gray-400">
//                               Last validated:{" "}
//                               {new Date(
//                                 apiKey.lastValidated,
//                               ).toLocaleDateString()}
//                             </p>
//                           )}
//                             </div>
//                             </div>
//                             <div className="flex flex-wrap items-center gap-2 justify-end sm:justify-start">
//                               {getStatusBadge(apiKey.validationStatus, apiKey.provider)}
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleValidateKey(apiKey.id)}
//                                 disabled={validatingKeys.has(apiKey.id)}
//                                 className="touch-manipulation"
//                               >
//                           {validatingKeys.has(apiKey.id) ? (
//                             <Loader2 className="w-3 h-3 animate-spin" />
//                           ) : (
//                             <Check className="w-3 h-3" />
//                           )}
//                         </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() =>
//                                 openDeleteConfirmation(
//                                   "apiKey",
//                                   apiKey.id,
//                                   apiKey.keyName,
//                                 )
//                               }
//                               disabled={deleteApiKey.isPending}
//                               className="touch-manipulation"
//                             >
//                           <Trash2 className="w-3 h-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}

//                   {(!userApiKeys || userApiKeys.length === 0) && !isAddingKey && (
//                     <div className="text-center py-8 text-gray-500">
//                       <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                       <p>No API keys configured yet.</p>
//                       <p className="text-sm">
//                         Add your first API key to get started with AI content generation.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* AUTOMATION */}
//           <TabsContent value="automation" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Bot className="w-5 h-5 mr-2" />
//                   Automation Preferences
//                 </CardTitle>
//                 <CardDescription>
//                   Configure your AI content generation and SEO automation
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div>
//                   <Label htmlFor="defaultAi">Default AI Model</Label>
//                   <Select
//                     value={settings.automation.defaultAiModel}
//                     onValueChange={(value) =>
//                       updateSetting("automation", "defaultAiModel", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="gpt-4o">GPT-4 (Recommended)</SelectItem>
//                       <SelectItem value="claude-3">Claude-3</SelectItem>
//                       <SelectItem value="gemini-1.5-pro">Gemini Pro</SelectItem>
//                       <SelectItem value="auto-select">Auto-Select Best</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500 mt-1">
//                     This will be used as the default for new content generation
//                   </p>
//                 </div>
//                 <div>
//                   <Label htmlFor="reports">Report Generation</Label>
//                   <Select
//                     value={settings.automation.reportGeneration}
//                     onValueChange={(value) =>
//                       updateSetting("automation", "reportGeneration", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="daily">Daily</SelectItem>
//                       <SelectItem value="weekly">Weekly</SelectItem>
//                       <SelectItem value="monthly">Monthly</SelectItem>
//                       <SelectItem value="quarterly">Quarterly</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* SECURITY */}
//           <TabsContent value="security" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Shield className="w-5 h-5 mr-2" />
//                   Security Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Manage your account security and access controls
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
//                     <p className="text-sm text-gray-500">
//                       Add an extra layer of security to your account
//                     </p>
//                   </div>
//                   <Switch
//                     id="twoFactor"
//                     checked={settings.security.twoFactorAuth}
//                     onCheckedChange={(checked) =>
//                       updateSetting("security", "twoFactorAuth", checked)
//                     }
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
//                   <Input
//                     id="sessionTimeout"
//                     type="number"
//                     min="1"
//                     max="168"
//                     value={settings.security.sessionTimeout}
//                     onChange={(e) =>
//                       updateSetting(
//                         "security",
//                         "sessionTimeout",
//                         parseInt(e.target.value),
//                       )
//                     }
//                     onBlur={(e) => {
//                       const value = parseInt(e.target.value);
//                       if (isNaN(value) || value < 1) {
//                         updateSetting("security", "sessionTimeout", 1);
//                       } else if (value > 168) {
//                         updateSetting("security", "sessionTimeout", 168);
//                       }
//                     }}
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Automatically log out after this many hours of inactivity (1-168
//                     hours)
//                   </p>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="apiAccess">API Access</Label>
//                     <p className="text-sm text-gray-500">
//                       Allow third-party applications to access your data
//                     </p>
//                   </div>
//                   <Switch
//                     id="apiAccess"
//                     checked={settings.security.allowApiAccess}
//                     onCheckedChange={(checked) =>
//                       updateSetting("security", "allowApiAccess", checked)
//                     }
//                   />
//                 </div>
//                 <div className="pt-4 border-t">
//                   <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
//                   <p className="text-sm text-gray-500 mb-4">
//                     Update your password to keep your account secure. Use a strong
//                     password with at least 8 characters.
//                   </p>
//                   {passwordErrors.length > 0 && (
//                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//                       <div className="text-sm text-red-600">
//                         <ul className="list-disc list-inside space-y-1">
//                           {passwordErrors.map((error, index) => (
//                             <li key={index}>{error}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   )}
//                   <div className="space-y-3">
//                     <div>
//                       <Label htmlFor="currentPassword">Current Password</Label>
//                       <Input
//                         id="currentPassword"
//                         type="password"
//                         placeholder="Enter your current password"
//                         value={passwordData.currentPassword}
//                         onChange={(e) =>
//                           setPasswordData((prev) => ({
//                             ...prev,
//                             currentPassword: e.target.value,
//                           }))
//                         }
//                         maxLength={200}
//                         autoComplete="current-password"
//                         className={
//                           passwordErrors.some((e) => e.includes("current"))
//                             ? "border-red-500"
//                             : ""
//                         }
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="newPassword">New Password</Label>
//                       <Input
//                         id="newPassword"
//                         type="password"
//                         placeholder="Enter your new password"
//                         value={passwordData.newPassword}
//                         onChange={(e) =>
//                           setPasswordData((prev) => ({
//                             ...prev,
//                             newPassword: e.target.value,
//                           }))
//                         }
//                         maxLength={200}
//                         autoComplete="new-password"
//                         className={
//                           passwordErrors.some(
//                             (e) =>
//                               e.includes("new") || e.includes("8 characters"),
//                           )
//                             ? "border-red-500"
//                             : ""
//                         }
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         Must be at least 8 characters. Avoid common passwords.
//                       </p>
//                     </div>
//                     <div>
//                       <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                       <Input
//                         id="confirmPassword"
//                         type="password"
//                         placeholder="Confirm your new password"
//                         value={passwordData.confirmPassword}
//                         onChange={(e) =>
//                           setPasswordData((prev) => ({
//                             ...prev,
//                             confirmPassword: e.target.value,
//                           }))
//                         }
//                         maxLength={200}
//                         autoComplete="new-password"
//                         className={
//                           passwordErrors.some(
//                             (e) =>
//                               e.includes("confirmation") || e.includes("match"),
//                           )
//                             ? "border-red-500"
//                             : ""
//                         }
//                       />
//                     </div>
//                     {passwordData.newPassword && (
//                       <div className="text-xs">
//                         Password strength:
//                         <span
//                           className={
//                             passwordData.newPassword.length < 8
//                               ? "text-red-500"
//                               : passwordData.newPassword.length < 12
//                               ? "text-yellow-500"
//                               : "text-green-500"
//                           }
//                         >
//                           {passwordData.newPassword.length < 8
//                             ? " Weak"
//                             : passwordData.newPassword.length < 12
//                             ? " Fair"
//                             : " Strong"}
//                         </span>
//                       </div>
//                     )}
//                     <Button
//                       onClick={handlePasswordChange}
//                       disabled={changePassword.isPending}
//                       variant="outline"
//                       size="sm"
//                       className="w-full sm:w-auto"
//                     >
//                       {changePassword.isPending ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Updating Password...
//                         </>
//                       ) : (
//                         "Update Password"
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Delete / Cancel Confirmation */}
//       <AlertDialog
//         open={deleteConfirmation.isOpen}
//         onOpenChange={closeDeleteConfirmation}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               <div className="flex items-center space-x-2">
//                 <AlertTriangle className="w-5 h-5 text-red-500" />
//                 <span>
//                   Confirm{" "}
//                   {deleteConfirmation.type === "subscription"
//                     ? "Cancellation"
//                     : "Deletion"}
//                 </span>
//               </div>
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               {deleteConfirmation.type === "apiKey" ? (
//                 <>
//                   Are you sure you want to delete the API key{" "}
//                   <strong>"{deleteConfirmation.itemName}"</strong>?
//                   <br />
//                   <br />
//                   This action cannot be undone. You will need to add the key again if
//                   you want to use it in the future.
//                 </>
//               ) : deleteConfirmation.type === "subscription" ? (
//                 <>
//                   Are you sure you want to cancel your{" "}
//                   <strong>{deleteConfirmation.itemName}</strong> subscription?
//                   <br />
//                   <br />
//                   Your subscription will remain active until the end of your current
//                   billing period. You can reactivate it at any time before then.
//                 </>
//               ) : (
//                 <>
//                   Are you sure you want to disconnect{" "}
//                   <strong>"{deleteConfirmation.itemName}"</strong>?
//                   <br />
//                   <br />
//                   This will remove the website from your account. You can reconnect it
//                   later, but you will need to re-enter your WordPress credentials.
//                 </>
//               )}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirmDelete}
//               className="bg-red-600 hover:bg-red-700 text-white"
//             >
//               {deleteConfirmation.type === "subscription"
//                 ? "Cancel Subscription"
//                 : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
// {/* Edit Card Dialog */}
// <Dialog open={isEditingCard} onOpenChange={setIsEditingCard}>
//   <DialogContent className="sm:max-w-md">
//     <DialogHeader>
//       <DialogTitle className="flex items-center">
//         <CreditCard className="w-5 h-5 mr-2" />
//         Update Payment Method
//       </DialogTitle>
//       <DialogDescription>
//         Enter your new card details. Your card will be charged on the next billing cycle.
//       </DialogDescription>
//     </DialogHeader>
//     <div className="space-y-4 py-4">
//       {/* Current Card Info */}
//       {paymentMethod && (
//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
//           <p className="text-xs font-medium text-gray-700 mb-1">Current Card</p>
//           <div className="flex items-center text-sm text-gray-600">
//             <span className="capitalize">{paymentMethod.brand}</span>
//             <span className="mx-2">••••</span>
//             <span>{paymentMethod.last4}</span>
//             <span className="mx-2">|</span>
//             <span>Exp: {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}</span>
//           </div>
//         </div>
//       )}

//       <div>
//         <Label htmlFor="cardNumber">Card Number</Label>
//         <Input
//           id="cardNumber"
//           placeholder=""
//           value={cardUpdateData.cardNumber}
//           onChange={(e) => {
//             const value = e.target.value.replace(/\D/g, "").substring(0, 19);
//             const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
//             setCardUpdateData((prev) => ({ ...prev, cardNumber: formatted }));
//           }}
//           maxLength={19}
//         />
//         <p className="text-xs text-gray-500 mt-1">
//           Enter the full 16-digit card number
//         </p>
//       </div>
//       <div className="grid grid-cols-3 gap-4">
//         <div>
//           <Label htmlFor="expMonth">Month</Label>
//           <Input
//             id="expMonth"
//             placeholder="MM"
//             value={cardUpdateData.expMonth}
//             onChange={(e) => {
//               const value = e.target.value.replace(/\D/g, "").substring(0, 2);
//               setCardUpdateData((prev) => ({ ...prev, expMonth: value }));
//             }}
//             maxLength={2}
//           />
//         </div>
//         <div>
//           <Label htmlFor="expYear">Year</Label>
//           <Input
//             id="expYear"
//             placeholder="YY"
//             value={cardUpdateData.expYear}
//             onChange={(e) => {
//               const value = e.target.value.replace(/\D/g, "").substring(0, 2);
//               setCardUpdateData((prev) => ({ ...prev, expYear: value }));
//             }}
//             maxLength={2}
//           />
//         </div>
//         <div>
//           <Label htmlFor="cvc">CVC</Label>
//           <Input
//             id="cvc"
//             type="password"
//             placeholder=""
//             value={cardUpdateData.cvc}
//             onChange={(e) => {
//               const value = e.target.value.replace(/\D/g, "").substring(0, 4);
//               setCardUpdateData((prev) => ({ ...prev, cvc: value }));
//             }}
//             maxLength={4}
//           />
//         </div>
//       </div>
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//         <p className="text-xs text-blue-800">
//           🔒 Your card information is encrypted and secure. We use industry-standard security measures.
//         </p>
//       </div>
//     </div>
//     <DialogFooter className="flex-col sm:flex-row gap-2">
//       <Button
//         variant="outline"
//         onClick={() => {
//           setIsEditingCard(false);
//           setCardUpdateData({
//             cardNumber: "",
//             expMonth: "",
//             expYear: "",
//             cvc: "",
//           });
//         }}
//         className="w-full sm:w-auto"
//       >
//         Cancel
//       </Button>
//       <Button
//         onClick={handleUpdateCard}
//         disabled={updatePaymentMethod.isPending}
//         className="w-full sm:w-auto"
//       >
//         {updatePaymentMethod.isPending ? (
//           <>
//             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             Updating...
//           </>
//         ) : (
//           <>
//             <Check className="w-4 h-4 mr-2" />
//             Update Card
//           </>
//         )}
//       </Button>
      
//     </DialogFooter>
//   </DialogContent>
// </Dialog>
//     </div>
//   );
// }



// client/src/pages/settings.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Save,
  Key,
  Globe,
  Bot,
  Shield,
  User,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Plus,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  XCircle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sanitizer } from "@/utils/inputSanitizer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ✅ API base URL (for Render / CORS)
const API_URL = import.meta.env.VITE_API_URL || "";

// Helper: fetch with API_URL + credentials
const apiFetch = (path: string, options: RequestInit = {}) => {
  const url = `${API_URL}${path}`;
  console.log("🔗 API Call:", url);
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5/UTC-4" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6/UTC-5" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7/UTC-6" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8/UTC-7" },
  { value: "America/Phoenix", label: "Arizona (MST)", offset: "UTC-7" },
  { value: "America/Anchorage", label: "Alaska (AKST)", offset: "UTC-9/UTC-8" },
  { value: "Pacific/Honolulu", label: "Hawaii (HST)", offset: "UTC-10" },
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/UTC+1" },
  { value: "Europe/Paris", label: "Central European (CET)", offset: "UTC+1/UTC+2" },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1/UTC+2" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: "UTC+3" },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
  { value: "Asia/Shanghai", label: "China (CST)", offset: "UTC+8" },
  { value: "Asia/Manila", label: "Philippine Time (PHT)", offset: "UTC+8" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Japan (JST)", offset: "UTC+9" },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)", offset: "UTC+11/UTC+10" },
  { value: "Australia/Perth", label: "Perth (AWST)", offset: "UTC+8" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)", offset: "UTC+13/UTC+12" },
  { value: "UTC", label: "UTC", offset: "UTC+0" },
];

interface UserApiKey {
  id: string;
  provider: string;
  keyName: string;
  maskedKey: string;
  isActive: boolean;
  validationStatus: "valid" | "invalid" | "pending";
  lastValidated?: string;
  createdAt: string;
}

interface ApiKeyFormData {
  provider: string;
  keyName: string;
  apiKey: string;
}

interface ApiKeyStatus {
  providers: {
    openai: {
      configured: boolean;
      keyName?: string;
      lastValidated?: string;
      status: string;
    };
    anthropic: {
      configured: boolean;
      keyName?: string;
      lastValidated?: string;
      status: string;
    };
    google_pagespeed: {
      configured: boolean;
      keyName?: string;
      lastValidated?: string;
      status: string;
    };
  };
}

interface UserSettings {
  profile: { name: string; email: string; company: string; timezone: string };
  notifications: {
    emailReports: boolean;
    contentGenerated: boolean;
    seoIssues: boolean;
    systemAlerts: boolean;
  };
  automation: {
    defaultAiModel: string;
    autoFixSeoIssues: boolean;
    contentGenerationFrequency: string;
    reportGeneration: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    allowApiAccess: boolean;
  };
}

interface DeleteConfirmation {
  isOpen: boolean;
  type: "apiKey" | "website" | "subscription" | null;
  itemId: string;
  itemName: string;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  interval: "month" | "year";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
}

// 👇 INSERT HERE
interface PaymentMethod {
  id: string;
  brand: string; // "visa", "mastercard", "amex"
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface CardUpdateData {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    type: null,
    itemId: "",
    itemName: "",
  });

  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState<ApiKeyFormData>({
    provider: "",
    keyName: "",
    apiKey: "",
  });
  const [validatingKeys, setValidatingKeys] = useState<Set<string>>(new Set());
  const [showApiKey, setShowApiKey] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardUpdateData, setCardUpdateData] = useState<CardUpdateData>({
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
  });

  // --- SETTINGS ---
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    queryFn: async () => {
      const response = await apiFetch("/api/user/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const { data: websites } = useQuery({
    queryKey: ["/api/user/websites"],
    queryFn: api.getWebsites,
  });

  // --- API KEYS ---
  const { data: userApiKeys, refetch: refetchApiKeys } = useQuery<UserApiKey[]>({
    queryKey: ["/api/user/api-keys"],
    queryFn: async () => {
      const response = await apiFetch("/api/user/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return response.json();
    },
  });

  const { data: apiKeyStatus } = useQuery<ApiKeyStatus>({
    queryKey: ["/api/user/api-keys/status"],
    queryFn: async () => {
      const response = await apiFetch("/api/user/api-keys/status");
      if (!response.ok) throw new Error("Failed to fetch API key status");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // --- SUBSCRIPTION ---
  const {
    data: subscription,
    isLoading: subscriptionLoading,
  } = useQuery<Subscription | null>({
    queryKey: ["/api/billing/subscription"],
    queryFn: async () => {
      const response = await apiFetch("/api/billing/subscription");
      if (!response.ok) {
        if (response.status === 404) {
          return null; // no active subscription
        }
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch subscription");
      }
      const data = await response.json();
      console.log("Subscription data:", data);
      return data;
    },
  });


    // --- PAYMENT METHOD ---
  const {
    data: paymentMethod,
    isLoading: paymentMethodLoading,
  } = useQuery<PaymentMethod | null>({
    queryKey: ["/api/billing/payment-method"],
    queryFn: async () => {
      const response = await apiFetch("/api/billing/payment-method");
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch payment method");
      }
      return response.json();
    },
    enabled: !!subscription, // Only fetch if user has subscription
  });
  // --- MUTATIONS ---

  // Delete website
  const deleteWebsite = useMutation({
    mutationFn: async (websiteId: string) => {
      const response = await apiFetch(`/api/user/websites/${websiteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete website");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/websites"] });
      toast({
        title: "Website Disconnected",
        description: "The website has been successfully removed from your account.",
      });
      closeDeleteConfirmation();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Website",
        description: error.message || "Could not disconnect the website. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/api/billing/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ immediate: false }), // cancel at period end
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to cancel subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
      toast({
        title: "Subscription Canceled",
        description:
          "Your subscription will remain active until the end of the billing period.",
      });
      closeDeleteConfirmation();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Cancel Subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resume subscription
  const resumeSubscription = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/api/billing/subscription/resume", {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to resume subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/subscription"] });
      toast({
        title: "Subscription Resumed",
        description: "Your subscription will continue automatically.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Resume Subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Settings update
  const updateSettings = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await apiFetch("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update settings");
      }
      return response.json();
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["/api/user/settings"], updatedSettings);
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Settings reset
  const resetSettings = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/api/user/settings", {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to reset settings");
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["/api/user/settings"], result.settings);
      toast({
        title: "Settings Reset",
        description: "Your settings have been reset to defaults.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // API key mutations
  const addApiKey = useMutation({
    mutationFn: async (keyData: ApiKeyFormData) => {
      const response = await apiFetch("/api/user/api-keys", {
        method: "POST",
        body: JSON.stringify(keyData),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to add API key");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Added",
        description: "Your API key has been added and validated successfully.",
      });
      setIsAddingKey(false);
      setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
      refetchApiKeys();
      queryClient.invalidateQueries({
        queryKey: ["/api/user/api-keys/status"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add API Key",
        description: error.message || "Please check your API key and try again.",
        variant: "destructive",
      });
    },
  });

  const validateApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiFetch(`/api/user/api-keys/${keyId}/validate`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to validate API key");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isValid ? "Key Valid" : "Key Invalid",
        description: data.isValid ? "API key is working correctly." : data.error,
        variant: data.isValid ? "default" : "destructive",
      });
      refetchApiKeys();
      queryClient.invalidateQueries({
        queryKey: ["/api/user/api-keys/status"],
      });
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiFetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete API key");
      }
      return response.json().catch(() => ({}));
    },
    onSuccess: () => {
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed from your account.",
      });
      refetchApiKeys();
      queryClient.invalidateQueries({
        queryKey: ["/api/user/api-keys/status"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePassword = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update payment method
  const updatePaymentMethod = useMutation({
    mutationFn: async (cardData: CardUpdateData) => {
      const response = await apiFetch("/api/billing/payment-method", {
        method: "PUT",
        body: JSON.stringify(cardData),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update payment method");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing/payment-method"] });
      toast({
        title: "Payment Method Updated",
        description: "Your card has been successfully updated.",
      });
      setIsEditingCard(false);
      setCardUpdateData({
        cardNumber: "",
        expMonth: "",
        expYear: "",
        cvc: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


const deletePaymentMethod = useMutation({
  mutationFn: async () => {
    const response = await apiFetch("/api/billing/payment-method", {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete payment method");
    }
    return response.json().catch(() => ({}));
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/billing/payment-method"] });
    toast({
      title: "Payment Method Deleted",
      description: "Your card has been removed.",
    });
  },
  onError: (error: Error) => {
    toast({
      title: "Delete Failed",
      description: error.message,
      variant: "destructive",
    });
  },
});

  // --- DELETE CONFIRMATION ---

  const openDeleteConfirmation = (
    type: "apiKey" | "website" | "subscription",
    itemId: string,
    itemName: string,
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      itemId,
      itemName,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      itemId: "",
      itemName: "",
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.type === "apiKey" && deleteConfirmation.itemId) {
      deleteApiKey.mutate(deleteConfirmation.itemId, {
        onSuccess: () => closeDeleteConfirmation(),
      });
    } else if (
      deleteConfirmation.type === "website" &&
      deleteConfirmation.itemId
    ) {
      deleteWebsite.mutate(deleteConfirmation.itemId, {
        onSuccess: () => closeDeleteConfirmation(),
      });
    } else if (deleteConfirmation.type === "subscription") {
      cancelSubscription.mutate();
    }
  };

  // --- SETTINGS HELPERS ---

  const handleSave = () => {
    if (!settings) return;
    const sanitizedSettings: UserSettings = {
      profile: {
        name: Sanitizer.sanitizeText(settings.profile.name),
        email: settings.profile.email,
        company: Sanitizer.sanitizeText(settings.profile.company),
        timezone: settings.profile.timezone,
      },
      notifications: settings.notifications,
      automation: settings.automation,
      security: {
        twoFactorAuth: settings.security.twoFactorAuth,
        sessionTimeout: Math.min(168, Math.max(1, settings.security.sessionTimeout)),
        allowApiAccess: settings.security.allowApiAccess,
      },
    };
    updateSettings.mutate(sanitizedSettings);
  };

  const handleReset = () => {
    resetSettings.mutate();
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;

    let sanitizedValue = value;

    if (section === "profile") {
      switch (key) {
        case "name":
        case "company":
          sanitizedValue = Sanitizer.sanitizeText(value);
          break;
        case "email": {
          const emailValidation = Sanitizer.validateEmail(value);
          if (!emailValidation.isValid && value !== "") {
            toast({
              title: "Invalid Email",
              description:
                emailValidation.error || "Please enter a valid email address",
              variant: "destructive",
            });
            return;
          }
          sanitizedValue = emailValidation.sanitized;
          break;
        }
      }
    } else if (section === "security" && key === "sessionTimeout") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        sanitizedValue = Math.min(168, Math.max(1, numValue));
      }
    }

    queryClient.setQueryData(["/api/user/settings"], {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: sanitizedValue,
      },
    });
  };

  const handleAddApiKey = () => {
    const sanitizedKeyName = Sanitizer.sanitizeText(newKeyForm.keyName);
    if (!newKeyForm.provider || !sanitizedKeyName || !newKeyForm.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (sanitizedKeyName.length < 2 || sanitizedKeyName.length > 100) {
      toast({
        title: "Invalid Key Name",
        description: "Key name must be between 2 and 100 characters.",
        variant: "destructive",
      });
      return;
    }
    const apiKey = newKeyForm.apiKey.trim();
    if (newKeyForm.provider === "openai" && !apiKey.startsWith("sk-")) {
      toast({
        title: "Invalid API Key Format",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }
    if (newKeyForm.provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
      toast({
        title: "Invalid API Key Format",
        description: "Anthropic API keys should start with 'sk-ant-'",
        variant: "destructive",
      });
      return;
    }
    addApiKey.mutate({
      provider: newKeyForm.provider,
      keyName: sanitizedKeyName,
      apiKey,
    });
  };

  const handleValidateKey = (keyId: string) => {
    setValidatingKeys((prev) => new Set(prev).add(keyId));
    validateApiKey.mutate(keyId, {
      onSettled: () => {
        setValidatingKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(keyId);
          return newSet;
        });
      },
    });
  };

  const validatePasswordForm = (): boolean => {
    const errors: string[] = [];

    if (!passwordData.currentPassword)
      errors.push("Current password is required");
    if (!passwordData.newPassword) errors.push("New password is required");
    if (!passwordData.confirmPassword)
      errors.push("Password confirmation is required");
    if (passwordData.newPassword && passwordData.newPassword.length > 200) {
      errors.push("Password is too long (maximum 200 characters)");
    }
    if (
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      errors.push("New password and confirmation do not match");
    }
    if (passwordData.newPassword && passwordData.newPassword.length < 8) {
      errors.push("New password must be at least 8 characters long");
    }
    if (
      passwordData.newPassword &&
      passwordData.currentPassword &&
      passwordData.newPassword === passwordData.currentPassword
    ) {
      errors.push("New password must be different from current password");
    }
    const weakPasswords = [
      "password",
      "12345678",
      "qwerty",
      "abc12345",
      "password123",
    ];
    if (
      passwordData.newPassword &&
      weakPasswords.includes(passwordData.newPassword.toLowerCase())
    ) {
      errors.push("This password is too common. Please choose a stronger password");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = () => {
    if (!validatePasswordForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }
    changePassword.mutate(passwordData);
  };

  const getStatusBadge = (status: string, provider: string) => {
    const providerStatus =
      apiKeyStatus?.providers?.[
        provider as keyof typeof apiKeyStatus.providers
      ];
    if (!providerStatus?.configured) {
      return (
        <Badge className="bg-gray-100 text-gray-800">Not Configured</Badge>
      );
    }
    if (status === "valid") {
      return <Badge className="bg-green-100 text-green-800">✓ Active</Badge>;
    } else if (status === "invalid") {
      return <Badge className="bg-red-100 text-red-800">✗ Invalid</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai":
        return <Bot className="w-6 h-6 text-green-600" />;
      case "anthropic":
        return <Bot className="w-6 h-6 text-blue-600" />;
      case "google_pagespeed":
        return <Globe className="w-6 h-6 text-orange-600" />;
      default:
        return <Key className="w-6 h-6 text-gray-400" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "openai":
        return "OpenAI GPT-4";
      case "anthropic":
        return "Anthropic Claude";
      case "google_pagespeed":
        return "Google PageSpeed Insights";
      default:
        return provider;
    }
  };

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "canceled":
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleUpgrade = () => {
    setLocation("/subscription");
  };

    const handleUpdateCard = () => {
    // Validate card data
    if (!cardUpdateData.cardNumber || !cardUpdateData.expMonth || 
        !cardUpdateData.expYear || !cardUpdateData.cvc) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    const cardNumber = cardUpdateData.cardNumber.replace(/\s/g, "");
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number.",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(cardUpdateData.expMonth) < 1 || parseInt(cardUpdateData.expMonth) > 12) {
      toast({
        title: "Invalid Expiry Month",
        description: "Month must be between 01 and 12.",
        variant: "destructive",
      });
      return;
    }

    if (cardUpdateData.cvc.length < 3 || cardUpdateData.cvc.length > 4) {
      toast({
        title: "Invalid CVC",
        description: "CVC must be 3 or 4 digits.",
        variant: "destructive",
      });
      return;
    }

    updatePaymentMethod.mutate(cardUpdateData);
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  // --- LOADING / ERROR STATES ---

  if (settingsLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (settingsError || !settings) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium">
              Failed to load settings. Please refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account, subscription, integrations, and automation preferences
            </p>
          </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2 md:mt-0 md:ml-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={resetSettings.isPending}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{resetSettings.isPending ? "Resetting..." : "Reset to Defaults"}</span>
                  <span className="sm:hidden">{resetSettings.isPending ? "Resetting..." : "Reset"}</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateSettings.isPending}
                  className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
                >
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Mobile: Dropdown Select */}
        <div className="md:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </div>
              </SelectItem>
              <SelectItem value="subscription">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscription
                </div>
              </SelectItem>
              <SelectItem value="integrations">
                <div className="flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </div>
              </SelectItem>
              <SelectItem value="automation">
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  Automation
                </div>
              </SelectItem>
              <SelectItem value="security">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Traditional Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden md:grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="integrations">API Keys</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) =>
                        updateSetting("profile", "name", e.target.value)
                      }
                      maxLength={100}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) =>
                        updateSetting("profile", "email", e.target.value)
                      }
                      maxLength={254}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={settings.profile.company}
                    onChange={(e) =>
                      updateSetting("profile", "company", e.target.value)
                    }
                    maxLength={200}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.profile.timezone}
                    onValueChange={(value) =>
                      updateSetting("profile", "timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem
                        value="auto"
                        className="font-semibold text-blue-600"
                      >
                        🌍 Auto-detect:{" "}
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </SelectItem>
                      <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
                        Americas
                      </div>
                      {timezoneOptions
                        .filter(
                          (tz) =>
                            tz.value.startsWith("America/") ||
                            tz.value.startsWith("Pacific/H"),
                        )
                        .map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </SelectItem>
                        ))}
                      <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
                        Europe
                      </div>
                      {timezoneOptions
                        .filter((tz) => tz.value.startsWith("Europe/"))
                        .map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </SelectItem>
                        ))}
                      <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
                        Asia
                      </div>
                      {timezoneOptions
                        .filter((tz) => tz.value.startsWith("Asia/"))
                        .map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </SelectItem>
                        ))}
                      <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
                        Oceania
                      </div>
                      {timezoneOptions
                        .filter(
                          (tz) =>
                            tz.value.startsWith("Australia/") ||
                            tz.value.startsWith("Pacific/Auckland"),
                        )
                        .map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label} ({tz.offset})
                          </SelectItem>
                        ))}
                      <div className="text-xs text-gray-500 px-2 py-1 font-semibold">
                        UTC
                      </div>
                      <SelectItem value="UTC">
                        UTC (Coordinated Universal Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Your timezone is used for scheduling content and reports.
                    Currently:{" "}
                    {new Date().toLocaleString("en-US", {
                      timeZone: settings.profile.timezone,
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>



          </TabsContent>

          {/* SUBSCRIPTION */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Current Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading subscription...</span>
                  </div>
                ) : !subscription ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Active Subscription
                    </h3>
                    <p className="text-gray-500 mb-4">
                      You don't have an active subscription. Upgrade to unlock premium
                      features.
                    </p>
                      <Button
                        onClick={handleUpgrade}
                        className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Plans
                      </Button>
                  </div>
                ) : (
                  <>
                    {/* Current Plan Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {subscription.planName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Billed{" "}
                            {subscription.interval === "year" ? "annually" : "monthly"}
                          </p>
                        </div>
                        {getSubscriptionStatusBadge(subscription.status)}
                      </div>
                      <div className="flex items-baseline mb-4">
                        <DollarSign className="w-6 h-6 text-gray-700" />
                        <span className="text-4xl font-bold text-gray-900">
                          {subscription.amount}
                        </span>
                        <span className="text-gray-600 ml-2">
                          / {subscription.interval === "year" ? "year" : "month"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {subscription.cancelAtPeriodEnd ? (
                          <span className="text-red-600 font-medium">
                            Cancels on{" "}
                            {new Date(
                              subscription.currentPeriodEnd,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>
                            Renews on{" "}
                            {new Date(
                              subscription.currentPeriodEnd,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {subscription.planId !== "enterprise" && (
                      <Button
                        onClick={handleUpgrade}
                        className="flex-1 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                          <ArrowUpCircle className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      )}
                        {subscription.cancelAtPeriodEnd ? (
                          <Button
                            onClick={() => resumeSubscription.mutate()}
                            disabled={resumeSubscription.isPending}
                            variant="outline"
                            className="flex-1 w-full sm:w-auto"
                          >
                          {resumeSubscription.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Resume Subscription
                        </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                openDeleteConfirmation(
                                  "subscription",
                                  subscription.id,
                                  subscription.planName,
                                )
                              }
                              disabled={cancelSubscription.isPending}
                              variant="outline"
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      )}
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900">
                              Subscription Ending
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your subscription will remain active until{" "}
                              {new Date(
                                subscription.currentPeriodEnd,
                              ).toLocaleDateString()}
                              . You can resume it at any time before then.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

                        {/* 👇 INSERT HERE - Payment Method Card */}
            {subscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Method
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Pre-fill form with existing card details
                        if (paymentMethod) {
                          setCardUpdateData({
                            cardNumber: "", // We don't have the full number, keep empty
                            expMonth: paymentMethod.expMonth.toString().padStart(2, '0'),
                            expYear: paymentMethod.expYear.toString().slice(-2), // Last 2 digits
                            cvc: "", // Security - don't pre-fill CVC
                          });
                        }
                        setIsEditingCard(true);
                      }}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update Card
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Manage your payment method for subscription billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethodLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Loading payment method...</span>
                    </div>
                  ) : paymentMethod ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{getCardBrandIcon(paymentMethod.brand)}</div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {paymentMethod.brand} •••• {paymentMethod.last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                          </p>
                        </div>
                      </div>
                      {paymentMethod.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No payment method on file</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* INTEGRATIONS (API Keys) */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Your API Keys
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setIsAddingKey(true)}
                      disabled={isAddingKey}
                      className="w-full sm:w-auto"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </Button>
                </CardTitle>
                <CardDescription>
                  Securely store and manage your AI service API keys. Keys are encrypted
                  and never visible in full.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add API key form */}
                {isAddingKey && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-4">Add New API Key</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="provider">Service Provider</Label>
                        <Select
                          value={newKeyForm.provider}
                          onValueChange={(value) =>
                            setNewKeyForm((prev) => ({ ...prev, provider: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                            <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                            <SelectItem value="google_pagespeed">
                              Google PageSpeed Insights
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., My OpenAI Key"
                          value={newKeyForm.keyName}
                          onChange={(e) => {
                            const sanitized = Sanitizer.sanitizeText(e.target.value);
                            setNewKeyForm((prev) => ({
                              ...prev,
                              keyName: sanitized,
                            }));
                          }}
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          A friendly name to identify this key (2-100 characters)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="apiKey"
                            type={showApiKey ? "text" : "password"}
                            placeholder={
                              newKeyForm.provider === "openai"
                                ? "sk-..."
                                : newKeyForm.provider === "anthropic"
                                ? "sk-ant-..."
                                : "AIza..."
                            }
                            value={newKeyForm.apiKey}
                            onChange={(e) =>
                              setNewKeyForm((prev) => ({
                                ...prev,
                                apiKey: e.target.value.trim(),
                              }))
                            }
                            maxLength={500}
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {newKeyForm.provider && (
                          <p className="text-xs text-gray-400 mt-1">
                            {newKeyForm.provider === "openai" &&
                              'OpenAI API keys start with "sk-"'}
                            {newKeyForm.provider === "anthropic" &&
                              'Anthropic API keys start with "sk-ant-"'}
                            {newKeyForm.provider === "google_pagespeed" &&
                              'Google API keys typically start with "AIza"'}
                          </p>
                        )}
                      </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                              onClick={handleAddApiKey}
                              disabled={addApiKey.isPending}
                              className="w-full sm:w-auto"
                            >
                          {addApiKey.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          {addApiKey.isPending ? "Validating..." : "Add Key"}
                        </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddingKey(false);
                              setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
                            }}
                            className="w-full sm:w-auto"
                          >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing keys */}
                <div className="space-y-3">
                  {userApiKeys?.map((apiKey: UserApiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {getProviderIcon(apiKey.provider)}
                      </div>
                      <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {Sanitizer.escapeHtml(apiKey.keyName)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {getProviderName(apiKey.provider)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono break-all">
                            {apiKey.maskedKey}
                          </p>
                          {apiKey.lastValidated && (
                            <p className="text-xs text-gray-400">
                              Last validated:{" "}
                              {new Date(
                                apiKey.lastValidated,
                              ).toLocaleDateString()}
                            </p>
                          )}
                            </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 justify-end sm:justify-start">
                              {getStatusBadge(apiKey.validationStatus, apiKey.provider)}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleValidateKey(apiKey.id)}
                                disabled={validatingKeys.has(apiKey.id)}
                                className="touch-manipulation"
                              >
                          {validatingKeys.has(apiKey.id) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openDeleteConfirmation(
                                  "apiKey",
                                  apiKey.id,
                                  apiKey.keyName,
                                )
                              }
                              disabled={deleteApiKey.isPending}
                              className="touch-manipulation"
                            >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!userApiKeys || userApiKeys.length === 0) && !isAddingKey && (
                    <div className="text-center py-8 text-gray-500">
                      <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No API keys configured yet.</p>
                      <p className="text-sm">
                        Add your first API key to get started with AI content generation.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUTOMATION */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Automation Preferences
                </CardTitle>
                <CardDescription>
                  Configure your AI content generation and SEO automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="defaultAi">Default AI Model</Label>
                  <Select
                    value={settings.automation.defaultAiModel}
                    onValueChange={(value) =>
                      updateSetting("automation", "defaultAiModel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="claude-3">Claude-3</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini Pro</SelectItem>
                      <SelectItem value="auto-select">Auto-Select Best</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used as the default for new content generation
                  </p>
                </div>
                <div>
                  <Label htmlFor="reports">Report Generation</Label>
                  <Select
                    value={settings.automation.reportGeneration}
                    onValueChange={(value) =>
                      updateSetting("automation", "reportGeneration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      updateSetting("security", "twoFactorAuth", checked)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      updateSetting(
                        "security",
                        "sessionTimeout",
                        parseInt(e.target.value),
                      )
                    }
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        updateSetting("security", "sessionTimeout", 1);
                      } else if (value > 168) {
                        updateSetting("security", "sessionTimeout", 168);
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically log out after this many hours of inactivity (1-168
                    hours)
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="apiAccess">API Access</Label>
                    <p className="text-sm text-gray-500">
                      Allow third-party applications to access your data
                    </p>
                  </div>
                  <Switch
                    id="apiAccess"
                    checked={settings.security.allowApiAccess}
                    onCheckedChange={(checked) =>
                      updateSetting("security", "allowApiAccess", checked)
                    }
                  />
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your password to keep your account secure. Use a strong
                    password with at least 8 characters.
                  </p>
                  {passwordErrors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm text-red-600">
                        <ul className="list-disc list-inside space-y-1">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        maxLength={200}
                        autoComplete="current-password"
                        className={
                          passwordErrors.some((e) => e.includes("current"))
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        maxLength={200}
                        autoComplete="new-password"
                        className={
                          passwordErrors.some(
                            (e) =>
                              e.includes("new") || e.includes("8 characters"),
                          )
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters. Avoid common passwords.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        maxLength={200}
                        autoComplete="new-password"
                        className={
                          passwordErrors.some(
                            (e) =>
                              e.includes("confirmation") || e.includes("match"),
                          )
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </div>
                    {passwordData.newPassword && (
                      <div className="text-xs">
                        Password strength:
                        <span
                          className={
                            passwordData.newPassword.length < 8
                              ? "text-red-500"
                              : passwordData.newPassword.length < 12
                              ? "text-yellow-500"
                              : "text-green-500"
                          }
                        >
                          {passwordData.newPassword.length < 8
                            ? " Weak"
                            : passwordData.newPassword.length < 12
                            ? " Fair"
                            : " Strong"}
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={handlePasswordChange}
                      disabled={changePassword.isPending}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {changePassword.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete / Cancel Confirmation */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={closeDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>
                  Confirm{" "}
                  {deleteConfirmation.type === "subscription"
                    ? "Cancellation"
                    : "Deletion"}
                </span>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.type === "apiKey" ? (
                <>
                  Are you sure you want to delete the API key{" "}
                  <strong>"{deleteConfirmation.itemName}"</strong>?
                  <br />
                  <br />
                  This action cannot be undone. You will need to add the key again if
                  you want to use it in the future.
                </>
              ) : deleteConfirmation.type === "subscription" ? (
                <>
                  Are you sure you want to cancel your{" "}
                  <strong>{deleteConfirmation.itemName}</strong> subscription?
                  <br />
                  <br />
                  Your subscription will remain active until the end of your current
                  billing period. You can reactivate it at any time before then.
                </>
              ) : (
                <>
                  Are you sure you want to disconnect{" "}
                  <strong>"{deleteConfirmation.itemName}"</strong>?
                  <br />
                  <br />
                  This will remove the website from your account. You can reconnect it
                  later, but you will need to re-enter your WordPress credentials.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteConfirmation.type === "subscription"
                ? "Cancel Subscription"
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
{/* Edit Card Dialog */}
<Dialog open={isEditingCard} onOpenChange={setIsEditingCard}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center">
        <CreditCard className="w-5 h-5 mr-2" />
        Update Payment Method
      </DialogTitle>
      <DialogDescription>
        Enter your new card details. Your card will be charged on the next billing cycle.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {/* Current Card Info */}
      {paymentMethod && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-gray-700 mb-1">Current Card</p>
          <div className="flex items-center text-sm text-gray-600">
            <span className="capitalize">{paymentMethod.brand}</span>
            <span className="mx-2">••••</span>
            <span>{paymentMethod.last4}</span>
            <span className="mx-2">|</span>
            <span>Exp: {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder=""
          value={cardUpdateData.cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").substring(0, 19);
            const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
            setCardUpdateData((prev) => ({ ...prev, cardNumber: formatted }));
          }}
          maxLength={19}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the full 16-digit card number
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="expMonth">Month</Label>
          <Input
            id="expMonth"
            placeholder="MM"
            value={cardUpdateData.expMonth}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").substring(0, 2);
              setCardUpdateData((prev) => ({ ...prev, expMonth: value }));
            }}
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor="expYear">Year</Label>
          <Input
            id="expYear"
            placeholder="YY"
            value={cardUpdateData.expYear}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").substring(0, 2);
              setCardUpdateData((prev) => ({ ...prev, expYear: value }));
            }}
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            type="password"
            placeholder=""
            value={cardUpdateData.cvc}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").substring(0, 4);
              setCardUpdateData((prev) => ({ ...prev, cvc: value }));
            }}
            maxLength={4}
          />
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          🔒 Your card information is encrypted and secure. We use industry-standard security measures.
        </p>
      </div>
    </div>
    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        onClick={() => {
          setIsEditingCard(false);
          setCardUpdateData({
            cardNumber: "",
            expMonth: "",
            expYear: "",
            cvc: "",
          });
        }}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={handleUpdateCard}
        disabled={updatePaymentMethod.isPending}
        className="w-full sm:w-auto"
      >
        {updatePaymentMethod.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Update Card
          </>
        )}
      </Button>
      
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
