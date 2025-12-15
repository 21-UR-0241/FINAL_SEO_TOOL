// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Save,
//   Key,
//   Globe,
//   Bot,
//   Bell,
//   Shield,
//   User,
//   Trash2,
//   Eye,
//   EyeOff,
//   Check,
//   X,
//   Loader2,
//   Plus,
//   RotateCcw,
//   AlertTriangle,
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
// import { toast } from "sonner";
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

// // ✅ Get API URL from environment
// const API_URL = import.meta.env.VITE_API_URL || '';

// // Helper function for API calls with proper CORS
// const apiCall = async (endpoint: string, options: RequestInit = {}) => {
//   const url = `${API_URL}${endpoint}`;
//   console.log('🔗 API Call:', url);
  
//   const response = await fetch(url, {
//     ...options,
//     credentials: 'include', // ✅ Always include credentials
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ 
//       message: `HTTP ${response.status}: ${response.statusText}` 
//     }));
//     throw new Error(error.message || `Request failed: ${response.status}`);
//   }

//   return response.json();
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
//     openai: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
//     anthropic: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
//     google_pagespeed: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
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
//   type: "apiKey" | "website" | null;
//   itemId: string;
//   itemName: string;
// }

// export default function Settings() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
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

//   // ✅ Fetch user settings with proper error handling
//   const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<UserSettings>({
//     queryKey: ["/api/user/settings"],
//     queryFn: () => apiCall("/api/user/settings"),
//     retry: 2,
//   });

//   const { data: websites } = useQuery({
//     queryKey: ["/api/user/websites"],
//     queryFn: api.getWebsites,
//   });

//   // ✅ Fetch user API keys
//   const { data: userApiKeys, refetch: refetchApiKeys } = useQuery<UserApiKey[]>({
//     queryKey: ["/api/user/api-keys"],
//     queryFn: () => apiCall("/api/user/api-keys"),
//   });

//   const { data: apiKeyStatus } = useQuery<ApiKeyStatus>({
//     queryKey: ["/api/user/api-keys/status"],
//     queryFn: () => apiCall("/api/user/api-keys/status"),
//     refetchInterval: 30000,
//   });

//   // ✅ Delete website mutation
//   const deleteWebsite = useMutation({
//     mutationFn: async (websiteId: string) => {
//       return apiCall(`/api/user/websites/${websiteId}`, { method: 'DELETE' });
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

//   const openDeleteConfirmation = (type: "apiKey" | "website", itemId: string, itemName: string) => {
//     setDeleteConfirmation({ isOpen: true, type, itemId, itemName });
//   };

//   const closeDeleteConfirmation = () => {
//     setDeleteConfirmation({ isOpen: false, type: null, itemId: "", itemName: "" });
//   };

//   const handleConfirmDelete = () => {
//     if (deleteConfirmation.type === "apiKey" && deleteConfirmation.itemId) {
//       deleteApiKey.mutate(deleteConfirmation.itemId);
//     } else if (deleteConfirmation.type === "website" && deleteConfirmation.itemId) {
//       deleteWebsite.mutate(deleteConfirmation.itemId);
//     }
//   };

//   // ✅ Update settings mutation
//   const updateSettings = useMutation({
//     mutationFn: async (newSettings: UserSettings) => {
//       return apiCall("/api/user/settings", {
//         method: "PUT",
//         body: JSON.stringify(newSettings),
//       });
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

//   // ✅ Reset settings mutation
//   const resetSettings = useMutation({
//     mutationFn: async () => {
//       return apiCall("/api/user/settings", { method: "DELETE" });
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

//   // ✅ API key mutations
//   const addApiKey = useMutation({
//     mutationFn: async (keyData: ApiKeyFormData) => {
//       return apiCall("/api/user/api-keys", {
//         method: "POST",
//         body: JSON.stringify(keyData),
//       });
//     },
//     onSuccess: () => {
//       toast({
//         title: "API Key Added",
//         description: "Your API key has been added and validated successfully.",
//       });
//       setIsAddingKey(false);
//       setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
//       refetchApiKeys();
//       queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
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
//       return apiCall(`/api/user/api-keys/${keyId}/validate`, { method: "POST" });
//     },
//     onSuccess: (data) => {
//       toast({
//         title: data.isValid ? "Key Valid" : "Key Invalid",
//         description: data.isValid ? "API key is working correctly." : data.error,
//         variant: data.isValid ? "default" : "destructive",
//       });
//       refetchApiKeys();
//       queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
//     },
//   });

//   const deleteApiKey = useMutation({
//     mutationFn: async (keyId: string) => {
//       return apiCall(`/api/user/api-keys/${keyId}`, { method: "DELETE" });
//     },
//     onSuccess: () => {
//       toast({
//         title: "API Key Deleted",
//         description: "The API key has been removed from your account.",
//       });
//       refetchApiKeys();
//       queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
//       closeDeleteConfirmation();
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
//       setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

//   const handleSave = () => {
//     if (settings) {
//       const sanitizedSettings = {
//         profile: {
//           name: Sanitizer.sanitizeText(settings.profile.name),
//           email: settings.profile.email,
//           company: Sanitizer.sanitizeText(settings.profile.company),
//           timezone: settings.profile.timezone,
//         },
//         notifications: settings.notifications,
//         automation: settings.automation,
//         security: {
//           twoFactorAuth: settings.security.twoFactorAuth,
//           sessionTimeout: Math.min(168, Math.max(1, settings.security.sessionTimeout)),
//           allowApiAccess: settings.security.allowApiAccess,
//         },
//       };
//       updateSettings.mutate(sanitizedSettings);
//     }
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
//         case "email":
//           const emailValidation = Sanitizer.validateEmail(value);
//           if (!emailValidation.isValid && value !== "") {
//             toast({
//               title: "Invalid Email",
//               description: emailValidation.error || "Please enter a valid email address",
//               variant: "destructive",
//             });
//             return;
//           }
//           sanitizedValue = emailValidation.sanitized;
//           break;
//       }
//     } else if (section === "security" && key === "sessionTimeout") {
//       const numValue = parseInt(value);
//       if (!isNaN(numValue)) {
//         sanitizedValue = Math.min(168, Math.max(1, numValue));
//       }
//     }

//     queryClient.setQueryData(["/api/user/settings"], {
//       ...settings,
//       [section]: { ...settings[section], [key]: sanitizedValue },
//     });
//   };

//   // const handleAddApiKey = () => {
//   //   const sanitizedKeyName = Sanitizer.sanitizeText(newKeyForm.keyName);

//   //   if (!newKeyForm.provider || !sanitizedKeyName || !newKeyForm.apiKey) {
//   //     toast({
//   //       title: "Missing Information",
//   //       description: "Please fill in all fields.",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   if (sanitizedKeyName.length < 2 || sanitizedKeyName.length > 100) {
//   //     toast({
//   //       title: "Invalid Key Name",
//   //       description: "Key name must be between 2 and 100 characters.",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   const apiKey = newKeyForm.apiKey.trim();
//   //   if (newKeyForm.provider === "openai" && !apiKey.startsWith("sk-")) {
//   //     toast({
//   //       title: "Invalid API Key Format",
//   //       description: "OpenAI API keys should start with 'sk-'",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   if (newKeyForm.provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
//   //     toast({
//   //       title: "Invalid API Key Format",
//   //       description: "Anthropic API keys should start with 'sk-ant-'",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   addApiKey.mutate({
//   //     provider: newKeyForm.provider,
//   //     keyName: sanitizedKeyName,
//   //     apiKey: apiKey,
//   //   });
//   // };


//   const handleAddApiKey = () => {
//   // Trim and sanitize
//   const apiKey = newKeyForm.apiKey.trim();
//   const sanitizedKeyName = Sanitizer.sanitizeText(newKeyForm.keyName.trim());
  
//   // Debug log
//   console.log('🔑 Submitting API Key:', {
//     provider: newKeyForm.provider,
//     keyName: sanitizedKeyName,
//     apiKey: apiKey.substring(0, 10) + '...' // Don't log full key
//   });

//   // Validate all fields exist
//   if (!newKeyForm.provider) {
//     toast({
//       title: "Missing Information",
//       description: "Please select a provider.",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (!sanitizedKeyName || sanitizedKeyName.length === 0) {
//     toast({
//       title: "Invalid Key Name",
//       description: "Key name cannot be empty after sanitization.",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (!apiKey || apiKey.length === 0) {
//     toast({
//       title: "Missing Information",
//       description: "API key cannot be empty.",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (sanitizedKeyName.length < 2 || sanitizedKeyName.length > 100) {
//     toast({
//       title: "Invalid Key Name",
//       description: "Key name must be between 2 and 100 characters.",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (newKeyForm.provider === "openai" && !apiKey.startsWith("sk-")) {
//     toast({
//       title: "Invalid API Key Format",
//       description: "OpenAI API keys should start with 'sk-'",
//       variant: "destructive",
//     });
//     return;
//   }

//   if (newKeyForm.provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
//     toast({
//       title: "Invalid API Key Format",
//       description: "Anthropic API keys should start with 'sk-ant-'",
//       variant: "destructive",
//     });
//     return;
//   }

//   addApiKey.mutate({
//     provider: newKeyForm.provider,
//     keyName: sanitizedKeyName,
//     apiKey: apiKey,
//   });
// };



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

//     if (!passwordData.currentPassword) errors.push("Current password is required");
//     if (!passwordData.newPassword) errors.push("New password is required");
//     if (!passwordData.confirmPassword) errors.push("Password confirmation is required");
//     if (passwordData.newPassword && passwordData.newPassword.length > 200) {
//       errors.push("Password is too long (maximum 200 characters)");
//     }
//     if (passwordData.newPassword && passwordData.confirmPassword && 
//         passwordData.newPassword !== passwordData.confirmPassword) {
//       errors.push("New password and confirmation do not match");
//     }
//     if (passwordData.newPassword && passwordData.newPassword.length < 8) {
//       errors.push("New password must be at least 8 characters long");
//     }
//     if (passwordData.newPassword && passwordData.currentPassword && 
//         passwordData.newPassword === passwordData.currentPassword) {
//       errors.push("New password must be different from current password");
//     }

//     const weakPasswords = ["password", "12345678", "qwerty", "abc12345", "password123"];
//     if (passwordData.newPassword && weakPasswords.includes(passwordData.newPassword.toLowerCase())) {
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
//     const providerStatus = apiKeyStatus?.providers?.[provider as keyof typeof apiKeyStatus.providers];

//     if (!providerStatus?.configured) {
//       return <Badge className="bg-gray-100 text-gray-800">Not Configured</Badge>;
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
//       case "openai": return <Bot className="w-6 h-6 text-green-600" />;
//       case "anthropic": return <Bot className="w-6 h-6 text-blue-600" />;
//       case "google_pagespeed": return <Globe className="w-6 h-6 text-orange-600" />;
//       default: return <Key className="w-6 h-6 text-gray-400" />;
//     }
//   };

//   const getProviderName = (provider: string) => {
//     switch (provider) {
//       case "openai": return "OpenAI GPT-4";
//       case "anthropic": return "Anthropic Claude";
//       case "google_pagespeed": return "Google PageSpeed Insights";
//       default: return provider;
//     }
//   };

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
//             <p className="text-red-600 font-medium">Failed to load settings</p>
//             <p className="text-gray-600 mt-2">Please refresh the page or try again later.</p>
//             <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] })} className="mt-4">
//               Retry
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="py-6">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
//         {/* Page Header */}
//         <div className="md:flex md:items-center md:justify-between mb-8">
//           <div className="flex-1 min-w-0">
//             <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
//               Settings
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               Manage your account, integrations, and automation preferences
//             </p>
//           </div>
//           <div className="mt-4 flex gap-2 md:mt-0 md:ml-4">
//             <Button
//               variant="outline"
//               onClick={handleReset}
//               disabled={resetSettings.isPending}
//             >
//               <RotateCcw className="w-4 h-4 mr-2" />
//               {resetSettings.isPending ? "Resetting..." : "Reset to Defaults"}
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={updateSettings.isPending}
//               className="bg-primary-500 hover:bg-primary-600"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {updateSettings.isPending ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </div>

//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//             <TabsTrigger value="integrations">API Keys</TabsTrigger>
//             <TabsTrigger value="automation">Automation</TabsTrigger>
//             <TabsTrigger value="security">Security</TabsTrigger>
//           </TabsList>

//           {/* Profile Settings */}
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
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="name">Full Name</Label>
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
//                       {/* Group by region for better organization */}
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
//                             tz.value.startsWith("Pacific/H")
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
//                             tz.value.startsWith("Pacific/Auckland")
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

//           {/* API Keys (Integrations) */}
//           <TabsContent value="integrations" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     <Key className="w-5 h-5 mr-2" />
//                     Your API Keys
//                   </span>
//                   <Button
//                     size="sm"
//                     onClick={() => setIsAddingKey(true)}
//                     disabled={isAddingKey}
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add API Key
//                   </Button>
//                 </CardTitle>
//                 <CardDescription>
//                   Securely store and manage your AI service API keys. Keys are
//                   encrypted and never visible in full.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Add New API Key Form */}
//                 {isAddingKey && (
//                   <div className="border rounded-lg p-4 bg-gray-50">
//                     <h4 className="font-medium mb-4">Add New API Key</h4>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="provider">Service Provider</Label>
//                         <Select
//                           value={newKeyForm.provider}
//                           onValueChange={(value) =>
//                             setNewKeyForm((prev) => ({
//                               ...prev,
//                               provider: value,
//                             }))
//                           }
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select provider" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="openai">
//                               OpenAI (GPT-4)
//                             </SelectItem>
//                             <SelectItem value="anthropic">
//                               Anthropic (Claude)
//                             </SelectItem>
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
//                             const sanitized = Sanitizer.sanitizeText(
//                               e.target.value
//                             );
//                             setNewKeyForm((prev) => ({
//                               ...prev,
//                               keyName: sanitized,
//                             }));
//                           }}
//                           maxLength={100}
//                         />
//                         <p className="text-xs text-gray-400 mt-1">
//                           A friendly name to identify this key (2-100
//                           characters)
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

//                       <div className="flex items-center space-x-2">
//                         <Button
//                           onClick={handleAddApiKey}
//                           disabled={addApiKey.isPending}
//                         >
//                           {addApiKey.isPending ? (
//                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           ) : (
//                             <Check className="w-4 h-4 mr-2" />
//                           )}
//                           {addApiKey.isPending ? "Validating..." : "Add Key"}
//                         </Button>
//                         <Button
//                           variant="outline"
//                           onClick={() => {
//                             setIsAddingKey(false);
//                             setNewKeyForm({
//                               provider: "",
//                               keyName: "",
//                               apiKey: "",
//                             });
//                           }}
//                         >
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Existing API Keys */}
//                 <div className="space-y-3">
//                   {userApiKeys?.map((apiKey: UserApiKey) => (
//                     <div
//                       key={apiKey.id}
//                       className="flex items-center justify-between p-4 border rounded-lg"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
//                           {getProviderIcon(apiKey.provider)}
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900">
//                             {Sanitizer.escapeHtml(apiKey.keyName)}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             {getProviderName(apiKey.provider)}
//                           </p>
//                           <p className="text-xs text-gray-400 font-mono">
//                             {apiKey.maskedKey}
//                           </p>
//                           {apiKey.lastValidated && (
//                             <p className="text-xs text-gray-400">
//                               Last validated:{" "}
//                               {new Date(
//                                 apiKey.lastValidated
//                               ).toLocaleDateString()}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         {getStatusBadge(
//                           apiKey.validationStatus,
//                           apiKey.provider
//                         )}
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleValidateKey(apiKey.id)}
//                           disabled={validatingKeys.has(apiKey.id)}
//                         >
//                           {validatingKeys.has(apiKey.id) ? (
//                             <Loader2 className="w-3 h-3 animate-spin" />
//                           ) : (
//                             <Check className="w-3 h-3" />
//                           )}
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() =>
//                             openDeleteConfirmation(
//                               "apiKey",
//                               apiKey.id,
//                               apiKey.keyName
//                             )
//                           }
//                           disabled={deleteApiKey.isPending}
//                         >
//                           <Trash2 className="w-3 h-3" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}

//                   {(!userApiKeys || userApiKeys.length === 0) &&
//                     !isAddingKey && (
//                       <div className="text-center py-8 text-gray-500">
//                         <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                         <p>No API keys configured yet.</p>
//                         <p className="text-sm">
//                           Add your first API key to get started with AI content
//                           generation.
//                         </p>
//                       </div>
//                     )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Automation Settings */}
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
//                       <SelectItem value="gpt-4o">
//                         GPT-4 (Recommended)
//                       </SelectItem>
//                       <SelectItem value="claude-3">Claude-3</SelectItem>
//                       <SelectItem value="gemini-1.5-pro">Gemini Pro</SelectItem>
//                       <SelectItem value="auto-select">
//                         Auto-Select Best
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-gray-500 mt-1">
//                     This will be used as the default for new content generation
//                   </p>
//                 </div>

//                 {/* <div>
//                   <Label htmlFor="frequency">Content Generation Frequency</Label>
//                   <Select
//                     value={settings.automation.contentGenerationFrequency}
//                     onValueChange={(value) => updateSetting("automation", "contentGenerationFrequency", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="daily">Daily</SelectItem>
//                       <SelectItem value="twice-weekly">Twice Weekly</SelectItem>
//                       <SelectItem value="weekly">Weekly</SelectItem>
//                       <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
//                       <SelectItem value="monthly">Monthly</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div> */}

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

//                 {/* <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="autoFix">Auto-fix SEO Issues</Label>
//                     <p className="text-sm text-gray-500">
//                       Automatically apply fixes for common SEO issues
//                     </p>
//                   </div>
//                   <Switch
//                     id="autoFix"
//                     checked={settings.automation.autoFixSeoIssues}
//                     onCheckedChange={(checked) => updateSetting("automation", "autoFixSeoIssues", checked)}
//                   />
//                 </div> */}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Security */}
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
//                   <Label htmlFor="sessionTimeout">
//                     Session Timeout (hours)
//                   </Label>
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
//                         parseInt(e.target.value)
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
//                     Automatically log out after this many hours of inactivity
//                     (1-168 hours)
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
//                   <h4 className="font-medium text-gray-900 mb-2">
//                     Change Password
//                   </h4>
//                   <p className="text-sm text-gray-500 mb-4">
//                     Update your password to keep your account secure. Use a
//                     strong password with at least 8 characters.
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
//                               e.includes("new") || e.includes("8 characters")
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
//                       <Label htmlFor="confirmPassword">
//                         Confirm New Password
//                       </Label>
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
//                               e.includes("confirmation") || e.includes("match")
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

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog
//         open={deleteConfirmation.isOpen}
//         onOpenChange={closeDeleteConfirmation}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               <div className="flex items-center space-x-2">
//                 <AlertTriangle className="w-5 h-5 text-red-500" />
//                 <span>Confirm Deletion</span>
//               </div>
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               {deleteConfirmation.type === "apiKey" ? (
//                 <>
//                   Are you sure you want to delete the API key{" "}
//                   <strong>"{deleteConfirmation.itemName}"</strong>?
//                   <br />
//                   <br />
//                   This action cannot be undone. You will need to add the key
//                   again if you want to use it in the future.
//                 </>
//               ) : (
//                 <>
//                   Are you sure you want to disconnect{" "}
//                   <strong>"{deleteConfirmation.itemName}"</strong>?
//                   <br />
//                   <br />
//                   This will remove the website from your account. You can
//                   reconnect it later, but you will need to re-enter your
//                   WordPress credentials.
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
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }



import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Key,
  Globe,
  Bot,
  Bell,
  Shield,
  User,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Plus,
  RotateCcw,
  AlertTriangle,
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
import { toast as sonnerToast } from "sonner"; // still imported but unused here
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

// ✅ Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || "";

// Helper function for API calls with proper CORS
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  console.log("🔗 API Call:", url);

  const response = await fetch(url, {
    ...options,
    credentials: "include", // ✅ Always include credentials
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
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
    openai: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
    anthropic: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
    google_pagespeed: { configured: boolean; keyName?: string; lastValidated?: string; status: string };
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
  type: "apiKey" | "website" | null;
  itemId: string;
  itemName: string;
}

// Billing types
interface CurrentSubscriptionResponse {
  success: boolean;
  id: string;
  planId: string;
  planName: string;
  status: string;
  interval: "month" | "year";
  currentPeriodEnd: string; // ISO string
  cancelAtPeriodEnd: boolean;
  amount: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  isActive?: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const [selectedUpgradePlanId, setSelectedUpgradePlanId] = useState<string>("");

  // ✅ Fetch user settings with proper error handling
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    queryFn: () => apiCall("/api/user/settings"),
    retry: 2,
  });

  const { data: websites } = useQuery({
    queryKey: ["/api/user/websites"],
    queryFn: api.getWebsites,
  });

  // ✅ Fetch user API keys
  const { data: userApiKeys, refetch: refetchApiKeys } = useQuery<UserApiKey[]>({
    queryKey: ["/api/user/api-keys"],
    queryFn: () => apiCall("/api/user/api-keys"),
  });

  const { data: apiKeyStatus } = useQuery<ApiKeyStatus>({
    queryKey: ["/api/user/api-keys/status"],
    queryFn: () => apiCall("/api/user/api-keys/status"),
    refetchInterval: 30000,
  });

  // ==== Billing: current subscription & plans ====
  const {
    data: subscriptionResponse,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery<CurrentSubscriptionResponse>({
    queryKey: ["current-subscription"],
    queryFn: () => api.billing.getCurrentSubscription(),
    retry: 1,
  });

  const currentSubscription = subscriptionResponse?.success
    ? subscriptionResponse
    : null;

  const { data: plansResponse } = useQuery<{
    success: boolean;
    data: SubscriptionPlan[];
  }>({
    queryKey: ["billing-plans"],
    queryFn: () => api.billing.getPlans(),
    enabled: !!currentSubscription,
  });

  const availablePlans =
    plansResponse?.success && plansResponse.data
      ? plansResponse.data.filter(
          (p) =>
            p.id !== currentSubscription?.planId &&
            (p.isActive === undefined || p.isActive),
        )
      : [];

  const cancelSubscription = useMutation({
    mutationFn: (immediate: boolean = false) =>
      api.billing.cancelSubscription(immediate),
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been scheduled for cancellation.",
      });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancel Failed",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    },
  });

  const upgradeSubscription = useMutation({
    mutationFn: (newPlanId: string) => api.billing.upgradeSubscription(newPlanId),
    onSuccess: () => {
      toast({
        title: "Plan Updated",
        description: "Your subscription plan has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to change plan.",
        variant: "destructive",
      });
    },
  });

  // ✅ Delete website mutation
  const deleteWebsite = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiCall(`/api/user/websites/${websiteId}`, { method: "DELETE" });
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

  const openDeleteConfirmation = (
    type: "apiKey" | "website",
    itemId: string,
    itemName: string,
  ) => {
    setDeleteConfirmation({ isOpen: true, type, itemId, itemName });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, type: null, itemId: "", itemName: "" });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.type === "apiKey" && deleteConfirmation.itemId) {
      deleteApiKey.mutate(deleteConfirmation.itemId);
    } else if (deleteConfirmation.type === "website" && deleteConfirmation.itemId) {
      deleteWebsite.mutate(deleteConfirmation.itemId);
    }
  };

  // ✅ Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      return apiCall("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(newSettings),
      });
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

  // ✅ Reset settings mutation
  const resetSettings = useMutation({
    mutationFn: async () => {
      return apiCall("/api/user/settings", { method: "DELETE" });
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

  // ✅ API key mutations
  const addApiKey = useMutation({
    mutationFn: async (keyData: ApiKeyFormData) => {
      return apiCall("/api/user/api-keys", {
        method: "POST",
        body: JSON.stringify(keyData),
      });
    },
    onSuccess: () => {
      toast({
        title: "API Key Added",
        description: "Your API key has been added and validated successfully.",
      });
      setIsAddingKey(false);
      setNewKeyForm({ provider: "", keyName: "", apiKey: "" });
      refetchApiKeys();
      queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
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
      return apiCall(`/api/user/api-keys/${keyId}/validate`, { method: "POST" });
    },
    onSuccess: (data) => {
      toast({
        title: data.isValid ? "Key Valid" : "Key Invalid",
        description: data.isValid ? "API key is working correctly." : data.error,
        variant: data.isValid ? "default" : "destructive",
      });
      refetchApiKeys();
      queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      return apiCall(`/api/user/api-keys/${keyId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "API Key Deleted",
        description: "The API key has been removed from your account.",
      });
      refetchApiKeys();
      queryClient.invalidateQueries({ queryKey: ["/api/user/api-keys/status"] });
      closeDeleteConfirmation();
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
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
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

  const handleSave = () => {
    if (settings) {
      const sanitizedSettings = {
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
    }
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
        case "email":
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
    } else if (section === "security" && key === "sessionTimeout") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        sanitizedValue = Math.min(168, Math.max(1, numValue));
      }
    }

    queryClient.setQueryData(["/api/user/settings"], {
      ...settings,
      [section]: { ...settings[section], [key]: sanitizedValue },
    });
  };

  const handleAddApiKey = () => {
    const apiKey = newKeyForm.apiKey.trim();
    const sanitizedKeyName = Sanitizer.sanitizeText(newKeyForm.keyName.trim());

    console.log("🔑 Submitting API Key:", {
      provider: newKeyForm.provider,
      keyName: sanitizedKeyName,
      apiKey: apiKey.substring(0, 10) + "...",
    });

    // Validate all fields exist
    if (!newKeyForm.provider) {
      toast({
        title: "Missing Information",
        description: "Please select a provider.",
        variant: "destructive",
      });
      return;
    }

    if (!sanitizedKeyName || sanitizedKeyName.length === 0) {
      toast({
        title: "Invalid Key Name",
        description: "Key name cannot be empty after sanitization.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey || apiKey.length === 0) {
      toast({
        title: "Missing Information",
        description: "API key cannot be empty.",
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
      apiKey: apiKey,
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

    const weakPasswords = ["password", "12345678", "qwerty", "abc12345", "password123"];
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
      apiKeyStatus?.providers?.[provider as keyof typeof apiKeyStatus.providers];

    if (!providerStatus?.configured) {
      return <Badge className="bg-gray-100 text-gray-800">Not Configured</Badge>;
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
            <p className="text-red-600 font-medium">Failed to load settings</p>
            <p className="text-gray-600 mt-2">
              Please refresh the page or try again later.
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] })
              }
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account, integrations, subscription, and automation preferences
            </p>
          </div>
          <div className="mt-4 flex gap-2 md:mt-0 md:ml-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetSettings.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {resetSettings.isPending ? "Resetting..." : "Reset to Defaults"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="integrations">API Keys</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting("profile", "name", e.target.value)}
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
                      onChange={(e) => updateSetting("profile", "email", e.target.value)}
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
                    onValueChange={(value) => updateSetting("profile", "timezone", value)}
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

          {/* API Keys (Integrations) */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Your API Keys
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingKey(true)}
                    disabled={isAddingKey}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </Button>
                </CardTitle>
                <CardDescription>
                  Securely store and manage your AI service API keys. Keys are
                  encrypted and never visible in full.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New API Key Form */}
                {isAddingKey && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-4">Add New API Key</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="provider">Service Provider</Label>
                        <Select
                          value={newKeyForm.provider}
                          onValueChange={(value) =>
                            setNewKeyForm((prev) => ({
                              ...prev,
                              provider: value,
                            }))
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
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={handleAddApiKey}
                          disabled={addApiKey.isPending}
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
                            setNewKeyForm({
                              provider: "",
                              keyName: "",
                              apiKey: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing API Keys */}
                <div className="space-y-3">
                  {userApiKeys?.map((apiKey: UserApiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          {getProviderIcon(apiKey.provider)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {Sanitizer.escapeHtml(apiKey.keyName)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getProviderName(apiKey.provider)}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {apiKey.maskedKey}
                          </p>
                          {apiKey.lastValidated && (
                            <p className="text-xs text-gray-400">
                              Last validated:{" "}
                              {new Date(apiKey.lastValidated).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(apiKey.validationStatus, apiKey.provider)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleValidateKey(apiKey.id)}
                          disabled={validatingKeys.has(apiKey.id)}
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
                        Add your first API key to get started with AI content
                        generation.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Settings */}
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

          {/* Subscription */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  View your current plan, renewal date, and manage your subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionLoading && (
                  <div className="flex items-center py-4">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Loading subscription...</span>
                  </div>
                )}

                {subscriptionError && !subscriptionLoading && (
                  <p className="text-sm text-red-600">
                    Failed to load subscription. Please refresh the page.
                  </p>
                )}

                {!subscriptionLoading && !currentSubscription && !subscriptionError && (
                  <p className="text-sm text-gray-600">
                    You do not have an active subscription yet.
                  </p>
                )}

                {currentSubscription && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Current Plan</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentSubscription.planName} (
                          {currentSubscription.interval === "year"
                            ? "Annual"
                            : "Monthly"}
                          )
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status:{" "}
                          <span className="font-medium capitalize">
                            {currentSubscription.status}
                          </span>
                          {currentSubscription.cancelAtPeriodEnd && (
                            <span className="ml-2 text-red-600">
                              • Cancels at end of period
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-right">
                        <p className="text-sm text-gray-500">Next renewal</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(
                            currentSubscription.currentPeriodEnd,
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {`$${currentSubscription.amount.toFixed(2)} ${
                            currentSubscription.interval === "year"
                              ? "per year"
                              : "per month"
                          }`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      <div>
                        <Label>Change Plan</Label>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mt-1">
                          <Select
                            value={selectedUpgradePlanId}
                            onValueChange={(value) =>
                              setSelectedUpgradePlanId(value)
                            }
                          >
                            <SelectTrigger className="sm:w-64">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} — $
                                  {currentSubscription.interval === "year"
                                    ? Number(plan.yearlyPrice).toFixed(2)
                                    : Number(plan.monthlyPrice).toFixed(2)}{" "}
                                  /{" "}
                                  {currentSubscription.interval === "year"
                                    ? "year"
                                    : "month"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            disabled={
                              !selectedUpgradePlanId ||
                              upgradeSubscription.isPending
                            }
                            onClick={() => {
                              if (selectedUpgradePlanId) {
                                upgradeSubscription.mutate(selectedUpgradePlanId);
                              }
                            }}
                          >
                            {upgradeSubscription.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Plan"
                            )}
                          </Button>
                        </div>
                        {availablePlans.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            No other plans available to switch to.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t">
                        <div className="mb-2 sm:mb-0">
                          <Label>Cancel Subscription</Label>
                          <p className="text-xs text-gray-500">
                            Your access will remain active until the end of the current
                            billing period.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={
                            cancelSubscription.isPending ||
                            currentSubscription.cancelAtPeriodEnd
                          }
                          onClick={() => cancelSubscription.mutate(false)}
                        >
                          {cancelSubscription.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : currentSubscription.cancelAtPeriodEnd ? (
                            "Cancellation Scheduled"
                          ) : (
                            "Cancel at Period End"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
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
                    Automatically log out after this many hours of inactivity
                    (1-168 hours)
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
                  <h4 className="font-medium text-gray-900 mb-2">
                    Change Password
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your password to keep your account secure. Use a
                    strong password with at least 8 characters.
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
                            (e) => e.includes("new") || e.includes("8 characters"),
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
                            (e) => e.includes("confirmation") || e.includes("match"),
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={closeDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Confirm Deletion</span>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.type === "apiKey" ? (
                <>
                  Are you sure you want to delete the API key{" "}
                  <strong>"{deleteConfirmation.itemName}"</strong>?
                  <br />
                  <br />
                  This action cannot be undone. You will need to add the key
                  again if you want to use it in the future.
                </>
              ) : (
                <>
                  Are you sure you want to disconnect{" "}
                  <strong>"{deleteConfirmation.itemName}"</strong>?
                  <br />
                  <br />
                  This will remove the website from your account. You can
                  reconnect it later, but you will need to re-enter your
                  WordPress credentials.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}