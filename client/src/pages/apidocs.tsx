
// import React, { useState, useEffect } from "react";
// import { Link } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   ArrowRight,
//   Sparkles,
//   Code,
//   Key,
//   Shield,
//   Zap,
//   Book,
//   Terminal,
//   CheckCircle2,
//   Copy,
//   FileText,
//   Search,
//   Wrench,
//   Globe,
//   Lock,
//   Server,
//   Activity,
//   BarChart3,
//   RefreshCw,
//   Database,
//   Clock,
// } from "lucide-react";

// // TypeScript interfaces
// interface EndpointParam {
//   name: string;
//   type: string;
//   required: boolean;
//   description: string;
// }

// interface Endpoint {
//   method: string;
//   path: string;
//   description: string;
//   params: EndpointParam[];
//   example: string;
//   response: string;
// }

// interface EndpointCategory {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface Feature {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   gradient: string;
// }

// interface QuickStartStep {
//   step: number;
//   title: string;
//   description: string;
// }

// interface SDK {
//   name: string;
//   icon: string;
//   install: string;
//   code: string;
// }

// interface RateLimit {
//   plan: string;
//   requests: string;
//   rate: string;
// }

// interface EndpointsMap {
//   [key: string]: Endpoint[];
// }

// export function APIPage(): JSX.Element {
//   const [scrolled, setScrolled] = useState(false);
//   const [activeEndpoint, setActiveEndpoint] = useState<string>("optimization");
//   const [copiedCode, setCopiedCode] = useState<string | null>(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const copyToClipboard = (text: string, id: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedCode(id);
//     setTimeout(() => setCopiedCode(null), 2000);
//   };

//   const endpointCategories: EndpointCategory[] = [
//     { id: "optimization", label: "Content Optimization", icon: <Wrench className="w-4 h-4" /> },
//     { id: "analysis", label: "Analysis & Health", icon: <Activity className="w-4 h-4" /> },
//     { id: "sites", label: "Site Management", icon: <Server className="w-4 h-4" /> },
//     { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
//   ];

//   const endpoints: EndpointsMap = {
//     optimization: [
//       {
//         method: "POST",
//         path: "/api/optimize/readability",
//         description: "Improve content readability using AI while preserving meaning",
//         params: [
//           { name: "content", type: "string", required: true, description: "HTML content to optimize" },
//           { name: "target_score", type: "number", required: false, description: "Target readability score (default: 60)" },
//           { name: "preserve_images", type: "boolean", required: false, description: "Keep images intact (default: true)" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/optimize/readability \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "<p>Your content here...</p>",
//     "target_score": 65,
//     "preserve_images": true
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "original_score": 45,
//     "improved_score": 68,
//     "optimized_content": "<p>Improved content...</p>",
//     "improvements": [
//       "Shortened 15 complex sentences",
//       "Simplified vocabulary in 8 locations",
//       "Split 3 long paragraphs"
//     ],
//     "word_count_before": 450,
//     "word_count_after": 455
//   }
// }`,
//       },
//       {
//         method: "POST",
//         path: "/api/optimize/seo",
//         description: "Optimize content for search engines with AI-powered suggestions",
//         params: [
//           { name: "content", type: "string", required: true, description: "HTML content to optimize" },
//           { name: "title", type: "string", required: true, description: "Page/post title" },
//           { name: "target_keywords", type: "array", required: false, description: "Focus keywords" },
//           { name: "apply_fixes", type: "boolean", required: false, description: "Auto-apply SEO fixes (default: false)" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/optimize/seo \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "<p>Your article content...</p>",
//     "title": "Guide to Cloud Computing",
//     "target_keywords": ["cloud computing", "cloud services"],
//     "apply_fixes": true
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "seo_score_before": 52,
//     "seo_score_after": 78,
//     "optimized_content": "<p>Optimized content...</p>",
//     "fixes_applied": [
//       "Added meta description",
//       "Optimized title tag",
//       "Added alt text to 3 images",
//       "Improved heading structure"
//     ],
//     "suggestions": [
//       "Add internal links to related posts",
//       "Increase keyword density slightly"
//     ]
//   }
// }`,
//       },
//       {
//         method: "POST",
//         path: "/api/optimize/bulk",
//         description: "Queue bulk optimization operations for multiple posts",
//         params: [
//           { name: "site_id", type: "string", required: true, description: "WordPress site ID" },
//           { name: "post_ids", type: "array", required: true, description: "Array of post IDs to optimize" },
//           { name: "operations", type: "array", required: true, description: "Operations: readability, seo, or auto_fix" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/optimize/bulk \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "site_id": "site_123",
//     "post_ids": [45, 67, 89, 123],
//     "operations": ["readability", "seo"]
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "job_id": "job_abc123",
//     "status": "queued",
//     "total_posts": 4,
//     "estimated_time": "5-10 minutes",
//     "operations": ["readability", "seo"]
//   }
// }`,
//       },
//     ],
//     analysis: [
//       {
//         method: "POST",
//         path: "/api/analyze/content-health",
//         description: "Analyze content health and detect issues",
//         params: [
//           { name: "content", type: "string", required: true, description: "HTML content to analyze" },
//           { name: "url", type: "string", required: false, description: "Content URL (for link checking)" },
//           { name: "check_images", type: "boolean", required: false, description: "Check for image issues (default: true)" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/analyze/content-health \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "<p>Content to analyze...</p>",
//     "url": "https://example.com/post",
//     "check_images": true
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "health_score": 72,
//     "readability_score": 58,
//     "seo_score": 65,
//     "issues": [
//       {
//         "type": "broken_link",
//         "severity": "high",
//         "count": 2,
//         "details": ["Link to deleted page", "External 404"]
//       },
//       {
//         "type": "missing_alt_text",
//         "severity": "medium",
//         "count": 3,
//         "details": ["3 images missing alt attributes"]
//       }
//     ],
//     "suggestions": [
//       "Fix 2 broken links",
//       "Add alt text to images",
//       "Improve readability score to 60+"
//     ]
//   }
// }`,
//       },
//       {
//         method: "POST",
//         path: "/api/analyze/seo",
//         description: "Detailed SEO analysis with recommendations",
//         params: [
//           { name: "content", type: "string", required: true, description: "Content to analyze" },
//           { name: "title", type: "string", required: true, description: "Page title" },
//           { name: "meta_description", type: "string", required: false, description: "Meta description" },
//           { name: "target_keyword", type: "string", required: false, description: "Primary keyword" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/analyze/seo \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "Your content...",
//     "title": "Guide to Cloud Computing",
//     "target_keyword": "cloud computing"
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "overall_score": 67,
//     "title_optimization": {
//       "score": 80,
//       "issues": ["Consider adding keyword at start"],
//       "character_count": 32
//     },
//     "content_optimization": {
//       "score": 65,
//       "keyword_density": 2.1,
//       "word_count": 850,
//       "heading_structure": "good",
//       "issues": ["Add keyword to H2 tags"]
//     },
//     "meta_optimization": {
//       "score": 50,
//       "issues": ["Meta description missing"]
//     },
//     "recommendations": [
//       "Add meta description (150-160 chars)",
//       "Include keyword in first H2",
//       "Add 1-2 internal links"
//     ]
//   }
// }`,
//       },
//       {
//         method: "POST",
//         path: "/api/fix/auto",
//         description: "Automatically detect and fix common content issues",
//         params: [
//           { name: "content", type: "string", required: true, description: "Content to fix" },
//           { name: "fix_types", type: "array", required: false, description: "Types to fix: links, images, formatting, grammar" },
//           { name: "auto_apply", type: "boolean", required: false, description: "Apply fixes automatically (default: true)" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/fix/auto \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "<p>Content with issues...</p>",
//     "fix_types": ["links", "images", "grammar"],
//     "auto_apply": true
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "fixed_content": "<p>Fixed content...</p>",
//     "fixes_applied": [
//       {
//         "type": "broken_link",
//         "count": 2,
//         "details": "Removed 2 broken links"
//       },
//       {
//         "type": "missing_alt_text",
//         "count": 3,
//         "details": "Generated alt text for 3 images"
//       },
//       {
//         "type": "grammar",
//         "count": 5,
//         "details": "Fixed 5 grammar issues"
//       }
//     ],
//     "total_fixes": 10
//   }
// }`,
//       },
//     ],
//     sites: [
//       {
//         method: "GET",
//         path: "/api/sites",
//         description: "List all connected WordPress sites",
//         params: [
//           { name: "limit", type: "number", required: false, description: "Number of sites to return (default: 10)" },
//           { name: "offset", type: "number", required: false, description: "Pagination offset" },
//         ],
//         example: `curl -X GET "https://api.wpaimanager.com/api/sites?limit=10" \\
//   -H "Authorization: Bearer YOUR_API_KEY"`,
//         response: `{
//   "success": true,
//   "data": {
//     "sites": [
//       {
//         "id": "site_123",
//         "name": "My Blog",
//         "url": "https://myblog.com",
//         "status": "connected",
//         "posts_count": 150,
//         "health_score": 75,
//         "last_sync": "2024-01-09T10:30:00Z",
//         "created_at": "2024-01-01T00:00:00Z"
//       }
//     ],
//     "total": 1,
//     "limit": 10,
//     "offset": 0
//   }
// }`,
//       },
//       {
//         method: "POST",
//         path: "/api/sites/connect",
//         description: "Connect a new WordPress site",
//         params: [
//           { name: "url", type: "string", required: true, description: "WordPress site URL" },
//           { name: "app_password", type: "string", required: true, description: "WordPress application password" },
//           { name: "username", type: "string", required: true, description: "WordPress username" },
//         ],
//         example: `curl -X POST https://api.wpaimanager.com/api/sites/connect \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "url": "https://myblog.com",
//     "username": "admin",
//     "app_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "site_id": "site_124",
//     "name": "My Blog",
//     "url": "https://myblog.com",
//     "status": "connected",
//     "posts_count": 87,
//     "connected_at": "2024-01-09T10:30:00Z"
//   }
// }`,
//       },
//       {
//         method: "GET",
//         path: "/api/sites/{site_id}/posts",
//         description: "Get posts from a WordPress site",
//         params: [
//           { name: "site_id", type: "string", required: true, description: "Site ID (in URL)" },
//           { name: "status", type: "string", required: false, description: "Filter by status: publish, draft, pending" },
//           { name: "limit", type: "number", required: false, description: "Number of posts (default: 20)" },
//           { name: "health_filter", type: "string", required: false, description: "Filter by health: low, medium, high" },
//         ],
//         example: `curl -X GET "https://api.wpaimanager.com/api/sites/site_123/posts?status=publish&limit=20" \\
//   -H "Authorization: Bearer YOUR_API_KEY"`,
//         response: `{
//   "success": true,
//   "data": {
//     "posts": [
//       {
//         "id": 45,
//         "title": "My Post Title",
//         "url": "https://myblog.com/my-post",
//         "status": "publish",
//         "word_count": 850,
//         "readability_score": 58,
//         "seo_score": 72,
//         "health_score": 65,
//         "issues_count": 3,
//         "modified": "2024-01-08T15:30:00Z"
//       }
//     ],
//     "total": 150,
//     "page": 1,
//     "per_page": 20
//   }
// }`,
//       },
//       {
//         method: "PUT",
//         path: "/api/sites/{site_id}/posts/{post_id}",
//         description: "Update a post with optimized content",
//         params: [
//           { name: "site_id", type: "string", required: true, description: "Site ID (in URL)" },
//           { name: "post_id", type: "number", required: true, description: "Post ID (in URL)" },
//           { name: "content", type: "string", required: true, description: "Updated post content" },
//           { name: "title", type: "string", required: false, description: "Updated title" },
//         ],
//         example: `curl -X PUT https://api.wpaimanager.com/api/sites/site_123/posts/45 \\
//   -H "Authorization: Bearer YOUR_API_KEY" \\
//   -H "Content-Type: application/json" \\
//   -d '{
//     "content": "<p>Optimized content...</p>",
//     "title": "Updated Title"
//   }'`,
//         response: `{
//   "success": true,
//   "data": {
//     "post_id": 45,
//     "updated": true,
//     "url": "https://myblog.com/my-post",
//     "updated_at": "2024-01-09T10:30:00Z"
//   }
// }`,
//       },
//     ],
//     analytics: [
//       {
//         method: "GET",
//         path: "/api/analytics/performance",
//         description: "Get optimization performance metrics",
//         params: [
//           { name: "site_id", type: "string", required: false, description: "Filter by site ID" },
//           { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
//           { name: "end_date", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
//         ],
//         example: `curl -X GET "https://api.wpaimanager.com/api/analytics/performance?site_id=site_123&start_date=2024-01-01" \\
//   -H "Authorization: Bearer YOUR_API_KEY"`,
//         response: `{
//   "success": true,
//   "data": {
//     "optimizations_completed": 145,
//     "avg_readability_improvement": 15.3,
//     "avg_seo_improvement": 12.7,
//     "total_fixes_applied": 423,
//     "breakdown": {
//       "readability": 67,
//       "seo": 58,
//       "auto_fix": 20
//     },
//     "top_improvements": [
//       "Broken links fixed: 89",
//       "Alt text added: 156",
//       "Readability improved: 67 posts"
//     ]
//   }
// }`,
//       },
//       {
//         method: "GET",
//         path: "/api/analytics/usage",
//         description: "Get API usage statistics",
//         params: [
//           { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
//           { name: "end_date", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
//         ],
//         example: `curl -X GET "https://api.wpaimanager.com/api/analytics/usage?start_date=2024-01-01" \\
//   -H "Authorization: Bearer YOUR_API_KEY"`,
//         response: `{
//   "success": true,
//   "data": {
//     "total_requests": 1247,
//     "successful_requests": 1205,
//     "failed_requests": 42,
//     "optimizations_used": 156,
//     "optimizations_remaining": 44,
//     "plan_limit": 200,
//     "reset_date": "2024-02-01T00:00:00Z",
//     "endpoints_used": {
//       "/api/optimize/readability": 67,
//       "/api/optimize/seo": 58,
//       "/api/analyze/content-health": 31
//     }
//   }
// }`,
//       },
//       {
//         method: "GET",
//         path: "/api/billing/subscription",
//         description: "Get current subscription and limits",
//         params: [],
//         example: `curl -X GET https://api.wpaimanager.com/api/billing/subscription \\
//   -H "Authorization: Bearer YOUR_API_KEY"`,
//         response: `{
//   "success": true,
//   "data": {
//     "plan": "professional",
//     "status": "active",
//     "sites_limit": 5,
//     "sites_used": 2,
//     "optimizations_limit": 200,
//     "optimizations_used": 156,
//     "api_calls_limit": 5000,
//     "api_calls_used": 1247,
//     "current_period_end": "2024-02-09T00:00:00Z",
//     "next_billing_date": "2024-02-09T00:00:00Z"
//   }
// }`,
//       },
//       {
//         method: "GET",
//         path: "/health",
//         description: "Check API health status",
//         params: [],
//         example: `curl -X GET https://api.wpaimanager.com/health`,
//         response: `{
//   "status": "healthy",
//   "version": "1.0.0",
//   "uptime": "99.9%",
//   "services": {
//     "api": "operational",
//     "database": "operational",
//     "ai_services": "operational"
//   },
//   "timestamp": "2024-01-09T10:30:00Z"
// }`,
//       },
//     ],
//   };

//   const features: Feature[] = [
//     {
//       icon: <Zap className="w-6 h-6" />,
//       title: "High Performance",
//       description: "Fast response times with 99.9% uptime SLA",
//       gradient: "from-yellow-500 to-orange-600",
//     },
//     {
//       icon: <Shield className="w-6 h-6" />,
//       title: "Secure & Reliable",
//       description: "Enterprise-grade security with encrypted connections",
//       gradient: "from-blue-500 to-cyan-600",
//     },
//     {
//       icon: <Globe className="w-6 h-6" />,
//       title: "RESTful Design",
//       description: "Clean, predictable API following REST principles",
//       gradient: "from-green-500 to-emerald-600",
//     },
//     {
//       icon: <Book className="w-6 h-6" />,
//       title: "Comprehensive Docs",
//       description: "Detailed documentation with code examples",
//       gradient: "from-purple-500 to-pink-600",
//     },
//   ];

//   const quickStart: QuickStartStep[] = [
//     { step: 1, title: "Get API Key", description: "Sign up for a Professional or Enterprise plan to get API access" },
//     { step: 2, title: "Make Request", description: "Use your API key to call our optimization endpoints" },
//     { step: 3, title: "Process Response", description: "Apply optimized content back to your WordPress site" },
//   ];

//   const sdks: SDK[] = [
//     {
//       name: "JavaScript / Node.js",
//       icon: "📦",
//       install: "npm install @wpaimanager/sdk",
//       code: `import { WPAIManager } from '@wpaimanager/sdk';

// const client = new WPAIManager('YOUR_API_KEY');

// const result = await client.optimize.readability({
//   content: '<p>Your content...</p>',
//   target_score: 65
// });`,
//     },
//     {
//       name: "Python",
//       icon: "🐍",
//       install: "pip install wpaimanager",
//       code: `from wpaimanager import WPAIManager

// client = WPAIManager('YOUR_API_KEY')

// result = client.optimize.readability(
//     content='<p>Your content...</p>',
//     target_score=65
// )`,
//     },
//     {
//       name: "PHP",
//       icon: "🐘",
//       install: "composer require wpaimanager/sdk",
//       code: `<?php
// use WPAIManager\\Client;

// $client = new Client('YOUR_API_KEY');

// $result = $client->optimize->readability([
//     'content' => '<p>Your content...</p>',
//     'target_score' => 65
// ]);`,
//     },
//   ];

//   const rateLimits: RateLimit[] = [
//     { plan: "Starter", requests: "Not Available", rate: "API access not included" },
//     { plan: "Professional", requests: "5,000/month", rate: "60/minute" },
//     { plan: "Enterprise", requests: "Unlimited", rate: "Unlimited" },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
//       {/* Animated Background */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
//       </div>

//       {/* Navigation */}
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           scrolled
//             ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg"
//             : "bg-transparent"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <Link href="/">
//               <div className="flex items-center space-x-3 group cursor-pointer">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
//                   <div className="relative p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
//                     <Sparkles className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
//                     WordPress AI Manager
//                   </h1>
//                   <p className="text-xs text-gray-400 font-medium">Powered by Advanced AI</p>
//                 </div>
//               </div>
//             </Link>
//             <div className="flex items-center space-x-6">
//               <Link href="/">
//                 <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
//                   Home
//                 </a>
//               </Link>
//               <Link href="/features">
//                 <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
//                   Features
//                 </a>
//               </Link>
//               <Link href="/pricing">
//                 <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
//                   Pricing
//                 </a>
//               </Link>
//               <Link href="/subscription">
//                 <Button 
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
//                 >
//                   Get API Access
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative z-10 pt-32 pb-16 px-6">
//         <div className="max-w-7xl mx-auto text-center">
//           <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
//             <Code className="w-3.5 h-3.5 mr-2 inline" />
//             RESTful API Documentation
//           </Badge>
//           <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
//             <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
//               Optimize Content with
//             </span>
//             <br />
//             <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//               Our Powerful API
//             </span>
//           </h2>
//           <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
//             Integrate AI-powered content optimization, SEO analysis, and WordPress management
//             directly into your applications with our RESTful API.
//           </p>
//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link href="/subscription">
//               <Button
//                 size="lg"
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl text-base font-bold px-8 py-6 group"
//               >
//                 Get API Key
//                 <Key className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
//               </Button>
//             </Link>
//             <Button
//               size="lg"
//               className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl text-base font-bold px-8 py-6"
//               onClick={() => document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' })}
//             >
//               View Documentation
//               <Book className="w-5 h-5 ml-2" />
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Features Grid */}
//       <section className="relative z-10 py-12 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className="group relative"
//                 style={{ animationDelay: `${index * 100}ms` }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//                 <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
//                   <div
//                     className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
//                   >
//                     <div className="text-white">{feature.icon}</div>
//                   </div>
//                   <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
//                   <p className="text-sm text-gray-400">{feature.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Quick Start */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
//               Quick Start
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               Get Started in Minutes
//             </h3>
//             <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//               Three simple steps to integrate content optimization into your application
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 mb-16">
//             {quickStart.map((item, index) => (
//               <div key={index} className="relative group">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//                 <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 text-center">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">
//                     {item.step}
//                   </div>
//                   <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
//                   <p className="text-gray-400">{item.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Authentication Example */}
//           <div className="relative group max-w-4xl mx-auto">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
//             <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <Lock className="w-5 h-5 text-blue-400" />
//                   <h4 className="text-lg font-bold text-white">Authentication</h4>
//                 </div>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   className="text-gray-400 hover:text-white"
//                   onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
//                 >
//                   {copiedCode === 'auth' ? (
//                     <CheckCircle2 className="w-4 h-4 text-green-400" />
//                   ) : (
//                     <Copy className="w-4 h-4" />
//                   )}
//                 </Button>
//               </div>
//               <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
//                 <pre className="text-gray-300 overflow-x-auto">
//                   <code>Authorization: Bearer YOUR_API_KEY</code>
//                 </pre>
//               </div>
//               <p className="text-sm text-gray-400 mt-4">
//                 Include your API key in the Authorization header of every request. Get your API key from the dashboard.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* API Documentation */}
//       <section id="documentation" className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
//               API Reference
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               Endpoint Documentation
//             </h3>
//             <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//               Complete reference for all available API endpoints
//             </p>
//           </div>

//           {/* Category Tabs */}
//           <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
//             {endpointCategories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setActiveEndpoint(category.id)}
//                 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
//                   activeEndpoint === category.id
//                     ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
//                     : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
//                 }`}
//               >
//                 {category.icon}
//                 {category.label}
//               </button>
//             ))}
//           </div>

//           {/* Endpoints */}
//           <div className="space-y-8">
//             {endpoints[activeEndpoint as keyof typeof endpoints].map((endpoint, index) => (
//               <div key={index} className="relative group">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//                 <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
//                   {/* Endpoint Header */}
//                   <div className="flex flex-wrap items-start gap-4 mb-6">
//                     <Badge
//                       className={`${
//                         endpoint.method === "GET"
//                           ? "bg-green-500/20 text-green-300 border-green-500/30"
//                           : endpoint.method === "PUT"
//                           ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
//                           : "bg-blue-500/20 text-blue-300 border-blue-500/30"
//                       } border font-mono`}
//                     >
//                       {endpoint.method}
//                     </Badge>
//                     <code className="text-blue-300 font-mono flex-1">{endpoint.path}</code>
//                   </div>
//                   <p className="text-gray-300 mb-6">{endpoint.description}</p>

//                   {/* Parameters */}
//                   {endpoint.params.length > 0 && (
//                     <div className="mb-6">
//                       <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
//                         Parameters
//                       </h5>
//                       <div className="space-y-2">
//                         {endpoint.params.map((param, idx) => (
//                           <div
//                             key={idx}
//                             className="flex flex-wrap items-start gap-3 text-sm bg-white/[0.02] rounded-lg p-3"
//                           >
//                             <code className="text-blue-300 font-mono">{param.name}</code>
//                             <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
//                               {param.type}
//                             </Badge>
//                             {param.required && (
//                               <Badge className="bg-red-500/20 text-red-300 border-0 text-xs">
//                                 required
//                               </Badge>
//                             )}
//                             <span className="text-gray-400 flex-1">{param.description}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* Example Request */}
//                   <div className="mb-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
//                         <Terminal className="w-4 h-4" />
//                         Example Request
//                       </h5>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="text-gray-400 hover:text-white"
//                         onClick={() =>
//                           copyToClipboard(endpoint.example, `example-${index}`)
//                         }
//                       >
//                         {copiedCode === `example-${index}` ? (
//                           <CheckCircle2 className="w-4 h-4 text-green-400" />
//                         ) : (
//                           <Copy className="w-4 h-4" />
//                         )}
//                       </Button>
//                     </div>
//                     <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
//                       <pre className="text-gray-300">
//                         <code>{endpoint.example}</code>
//                       </pre>
//                     </div>
//                   </div>

//                   {/* Example Response */}
//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
//                         <CheckCircle2 className="w-4 h-4" />
//                         Example Response
//                       </h5>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="text-gray-400 hover:text-white"
//                         onClick={() =>
//                           copyToClipboard(endpoint.response, `response-${index}`)
//                         }
//                       >
//                         {copiedCode === `response-${index}` ? (
//                           <CheckCircle2 className="w-4 h-4 text-green-400" />
//                         ) : (
//                           <Copy className="w-4 h-4" />
//                         )}
//                       </Button>
//                     </div>
//                     <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
//                       <pre className="text-gray-300">
//                         <code>{endpoint.response}</code>
//                       </pre>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* SDKs */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 text-sm font-semibold">
//               Official SDKs
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               Client Libraries
//             </h3>
//             <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//               Use our official SDKs to integrate faster in your preferred language
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {sdks.map((sdk, index) => (
//               <div key={index} className="relative group">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//                 <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
//                   <div className="text-4xl mb-4">{sdk.icon}</div>
//                   <h4 className="text-xl font-bold text-white mb-4">{sdk.name}</h4>
                  
//                   <div className="mb-4">
//                     <div className="text-xs text-gray-400 mb-2">Install</div>
//                     <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs">
//                       <code className="text-green-400">{sdk.install}</code>
//                     </div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-400 mb-2">Usage</div>
//                     <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
//                       <pre className="text-gray-300">
//                         <code>{sdk.code}</code>
//                       </pre>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Rate Limits */}
//       <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 text-sm font-semibold">
//               Rate Limits
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               API Usage Limits
//             </h3>
//             <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//               Different rate limits based on your subscription plan
//             </p>
//           </div>

//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
//             <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-white/10">
//                     <th className="text-left p-6 text-gray-400 font-semibold">Plan</th>
//                     <th className="text-center p-6 text-gray-400 font-semibold">
//                       <Clock className="w-4 h-4 inline mr-2" />
//                       Monthly Requests
//                     </th>
//                     <th className="text-center p-6 text-gray-400 font-semibold">
//                       <Activity className="w-4 h-4 inline mr-2" />
//                       Rate Limit
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rateLimits.map((limit, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
//                     >
//                       <td className="p-6 text-white font-bold">{limit.plan}</td>
//                       <td className="p-6 text-center text-gray-300">{limit.requests}</td>
//                       <td className="p-6 text-center text-gray-300">{limit.rate}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="mt-8 text-center">
//             <p className="text-sm text-gray-400">
//               Note: API access requires a Professional or Enterprise plan.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
//             <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
//               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
//               <div className="relative z-10">
//                 <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
//                   <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
//                   Ready to Build?
//                 </Badge>
//                 <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
//                   Start Optimizing Today
//                 </h3>
//                 <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
//                   Get your API key and start integrating powerful content optimization into your application
//                 </p>
//                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//                   <Link href="/subscription">
//                     <Button
//                       size="lg"
//                       className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
//                     >
//                       Get API Key
//                       <Key className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
//                     </Button>
//                   </Link>
//                   <Link href="/pricing">
//                     <Button
//                       size="lg"
//                       variant="outline"
//                       className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base font-bold px-8 py-6"
//                     >
//                       View Pricing
//                     </Button>
//                   </Link>
//                 </div>
//                 <p className="text-sm text-blue-100 mt-6">
//                   ✓ Professional plan required for API access • ✓ 14-day free trial
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-12 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-4 gap-12 mb-12">
//             <div>
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
//                   <Sparkles className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-white">WordPress AI Manager</h4>
//                   <p className="text-xs text-gray-400">Powered by AI</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 AI-powered content optimization for WordPress sites.
//               </p>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Product</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <Link href="/features">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Features
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/pricing">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Pricing
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/apidocs">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       API Docs
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/integrations">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Integrations
//                     </a>
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Company</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     About
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Blog
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Contact
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Legal</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Privacy Policy
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Terms of Service
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/cookie" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Cookie Policy
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
//             <p className="text-sm text-gray-400">
//               © 2024 WordPress AI Manager. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Add custom animations */}
//       <style>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out forwards;
//           opacity: 0;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           * {
//             animation-duration: 0.01ms !important;
//             animation-iteration-count: 1 !important;
//             transition-duration: 0.01ms !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default APIPage;


import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Code,
  Key,
  Shield,
  Zap,
  Book,
  Terminal,
  CheckCircle2,
  Copy,
  FileText,
  Search,
  Wrench,
  Globe,
  Lock,
  Server,
  Activity,
  BarChart3,
  RefreshCw,
  Database,
  Clock,
} from "lucide-react";

// TypeScript interfaces
interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params: EndpointParam[];
  example: string;
  response: string;
}

interface EndpointCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface QuickStartStep {
  step: number;
  title: string;
  description: string;
}

interface SDK {
  name: string;
  icon: string;
  install: string;
  code: string;
}

interface RateLimit {
  plan: string;
  requests: string;
  rate: string;
}

interface EndpointsMap {
  [key: string]: Endpoint[];
}

export function APIPage(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string>("optimization");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpointCategories: EndpointCategory[] = [
    { id: "optimization", label: "Content Optimization", icon: <Wrench className="w-4 h-4" /> },
    { id: "analysis", label: "Analysis & Health", icon: <Activity className="w-4 h-4" /> },
    { id: "sites", label: "Site Management", icon: <Server className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const endpoints: EndpointsMap = {
    optimization: [
      {
        method: "POST",
        path: "/api/optimize/readability",
        description: "Improve content readability using AI while preserving meaning",
        params: [
          { name: "content", type: "string", required: true, description: "HTML content to optimize" },
          { name: "target_score", type: "number", required: false, description: "Target readability score (default: 60)" },
          { name: "preserve_images", type: "boolean", required: false, description: "Keep images intact (default: true)" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/optimize/readability \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<p>Your content here...</p>",
    "target_score": 65,
    "preserve_images": true
  }'`,
        response: `{
  "success": true,
  "data": {
    "original_score": 45,
    "improved_score": 68,
    "optimized_content": "<p>Improved content...</p>",
    "improvements": [
      "Shortened 15 complex sentences",
      "Simplified vocabulary in 8 locations",
      "Split 3 long paragraphs"
    ],
    "word_count_before": 450,
    "word_count_after": 455
  }
}`,
      },
      {
        method: "POST",
        path: "/api/optimize/seo",
        description: "Optimize content for search engines with AI-powered suggestions",
        params: [
          { name: "content", type: "string", required: true, description: "HTML content to optimize" },
          { name: "title", type: "string", required: true, description: "Page/post title" },
          { name: "target_keywords", type: "array", required: false, description: "Focus keywords" },
          { name: "apply_fixes", type: "boolean", required: false, description: "Auto-apply SEO fixes (default: false)" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/optimize/seo \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<p>Your article content...</p>",
    "title": "Guide to Cloud Computing",
    "target_keywords": ["cloud computing", "cloud services"],
    "apply_fixes": true
  }'`,
        response: `{
  "success": true,
  "data": {
    "seo_score_before": 52,
    "seo_score_after": 78,
    "optimized_content": "<p>Optimized content...</p>",
    "fixes_applied": [
      "Added meta description",
      "Optimized title tag",
      "Added alt text to 3 images",
      "Improved heading structure"
    ],
    "suggestions": [
      "Add internal links to related posts",
      "Increase keyword density slightly"
    ]
  }
}`,
      },
      {
        method: "POST",
        path: "/api/optimize/bulk",
        description: "Queue bulk optimization operations for multiple posts",
        params: [
          { name: "site_id", type: "string", required: true, description: "WordPress site ID" },
          { name: "post_ids", type: "array", required: true, description: "Array of post IDs to optimize" },
          { name: "operations", type: "array", required: true, description: "Operations: readability, seo, or auto_fix" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/optimize/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "site_id": "site_123",
    "post_ids": [45, 67, 89, 123],
    "operations": ["readability", "seo"]
  }'`,
        response: `{
  "success": true,
  "data": {
    "job_id": "job_abc123",
    "status": "queued",
    "total_posts": 4,
    "estimated_time": "5-10 minutes",
    "operations": ["readability", "seo"]
  }
}`,
      },
    ],
    analysis: [
      {
        method: "POST",
        path: "/api/analyze/content-health",
        description: "Analyze content health and detect issues",
        params: [
          { name: "content", type: "string", required: true, description: "HTML content to analyze" },
          { name: "url", type: "string", required: false, description: "Content URL (for link checking)" },
          { name: "check_images", type: "boolean", required: false, description: "Check for image issues (default: true)" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/analyze/content-health \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<p>Content to analyze...</p>",
    "url": "https://example.com/post",
    "check_images": true
  }'`,
        response: `{
  "success": true,
  "data": {
    "health_score": 72,
    "readability_score": 58,
    "seo_score": 65,
    "issues": [
      {
        "type": "broken_link",
        "severity": "high",
        "count": 2,
        "details": ["Link to deleted page", "External 404"]
      },
      {
        "type": "missing_alt_text",
        "severity": "medium",
        "count": 3,
        "details": ["3 images missing alt attributes"]
      }
    ],
    "suggestions": [
      "Fix 2 broken links",
      "Add alt text to images",
      "Improve readability score to 60+"
    ]
  }
}`,
      },
      {
        method: "POST",
        path: "/api/analyze/seo",
        description: "Detailed SEO analysis with recommendations",
        params: [
          { name: "content", type: "string", required: true, description: "Content to analyze" },
          { name: "title", type: "string", required: true, description: "Page title" },
          { name: "meta_description", type: "string", required: false, description: "Meta description" },
          { name: "target_keyword", type: "string", required: false, description: "Primary keyword" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/analyze/seo \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Your content...",
    "title": "Guide to Cloud Computing",
    "target_keyword": "cloud computing"
  }'`,
        response: `{
  "success": true,
  "data": {
    "overall_score": 67,
    "title_optimization": {
      "score": 80,
      "issues": ["Consider adding keyword at start"],
      "character_count": 32
    },
    "content_optimization": {
      "score": 65,
      "keyword_density": 2.1,
      "word_count": 850,
      "heading_structure": "good",
      "issues": ["Add keyword to H2 tags"]
    },
    "meta_optimization": {
      "score": 50,
      "issues": ["Meta description missing"]
    },
    "recommendations": [
      "Add meta description (150-160 chars)",
      "Include keyword in first H2",
      "Add 1-2 internal links"
    ]
  }
}`,
      },
      {
        method: "POST",
        path: "/api/fix/auto",
        description: "Automatically detect and fix common content issues",
        params: [
          { name: "content", type: "string", required: true, description: "Content to fix" },
          { name: "fix_types", type: "array", required: false, description: "Types to fix: links, images, formatting, grammar" },
          { name: "auto_apply", type: "boolean", required: false, description: "Apply fixes automatically (default: true)" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/fix/auto \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<p>Content with issues...</p>",
    "fix_types": ["links", "images", "grammar"],
    "auto_apply": true
  }'`,
        response: `{
  "success": true,
  "data": {
    "fixed_content": "<p>Fixed content...</p>",
    "fixes_applied": [
      {
        "type": "broken_link",
        "count": 2,
        "details": "Removed 2 broken links"
      },
      {
        "type": "missing_alt_text",
        "count": 3,
        "details": "Generated alt text for 3 images"
      },
      {
        "type": "grammar",
        "count": 5,
        "details": "Fixed 5 grammar issues"
      }
    ],
    "total_fixes": 10
  }
}`,
      },
    ],
    sites: [
      {
        method: "GET",
        path: "/api/sites",
        description: "List all connected WordPress sites",
        params: [
          { name: "limit", type: "number", required: false, description: "Number of sites to return (default: 10)" },
          { name: "offset", type: "number", required: false, description: "Pagination offset" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/sites?limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "sites": [
      {
        "id": "site_123",
        "name": "My Blog",
        "url": "https://myblog.com",
        "status": "connected",
        "posts_count": 150,
        "health_score": 75,
        "last_sync": "2024-01-09T10:30:00Z",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}`,
      },
      {
        method: "POST",
        path: "/api/sites/connect",
        description: "Connect a new WordPress site",
        params: [
          { name: "url", type: "string", required: true, description: "WordPress site URL" },
          { name: "app_password", type: "string", required: true, description: "WordPress application password" },
          { name: "username", type: "string", required: true, description: "WordPress username" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/sites/connect \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://myblog.com",
    "username": "admin",
    "app_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
  }'`,
        response: `{
  "success": true,
  "data": {
    "site_id": "site_124",
    "name": "My Blog",
    "url": "https://myblog.com",
    "status": "connected",
    "posts_count": 87,
    "connected_at": "2024-01-09T10:30:00Z"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/sites/{site_id}/posts",
        description: "Get posts from a WordPress site",
        params: [
          { name: "site_id", type: "string", required: true, description: "Site ID (in URL)" },
          { name: "status", type: "string", required: false, description: "Filter by status: publish, draft, pending" },
          { name: "limit", type: "number", required: false, description: "Number of posts (default: 20)" },
          { name: "health_filter", type: "string", required: false, description: "Filter by health: low, medium, high" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/sites/site_123/posts?status=publish&limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 45,
        "title": "My Post Title",
        "url": "https://myblog.com/my-post",
        "status": "publish",
        "word_count": 850,
        "readability_score": 58,
        "seo_score": 72,
        "health_score": 65,
        "issues_count": 3,
        "modified": "2024-01-08T15:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "per_page": 20
  }
}`,
      },
      {
        method: "PUT",
        path: "/api/sites/{site_id}/posts/{post_id}",
        description: "Update a post with optimized content",
        params: [
          { name: "site_id", type: "string", required: true, description: "Site ID (in URL)" },
          { name: "post_id", type: "number", required: true, description: "Post ID (in URL)" },
          { name: "content", type: "string", required: true, description: "Updated post content" },
          { name: "title", type: "string", required: false, description: "Updated title" },
        ],
        example: `curl -X PUT https://api.wpaimanager.com/api/sites/site_123/posts/45 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "<p>Optimized content...</p>",
    "title": "Updated Title"
  }'`,
        response: `{
  "success": true,
  "data": {
    "post_id": 45,
    "updated": true,
    "url": "https://myblog.com/my-post",
    "updated_at": "2024-01-09T10:30:00Z"
  }
}`,
      },
    ],
    analytics: [
      {
        method: "GET",
        path: "/api/analytics/performance",
        description: "Get optimization performance metrics",
        params: [
          { name: "site_id", type: "string", required: false, description: "Filter by site ID" },
          { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
          { name: "end_date", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/analytics/performance?site_id=site_123&start_date=2024-01-01" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "optimizations_completed": 145,
    "avg_readability_improvement": 15.3,
    "avg_seo_improvement": 12.7,
    "total_fixes_applied": 423,
    "breakdown": {
      "readability": 67,
      "seo": 58,
      "auto_fix": 20
    },
    "top_improvements": [
      "Broken links fixed: 89",
      "Alt text added: 156",
      "Readability improved: 67 posts"
    ]
  }
}`,
      },
      {
        method: "GET",
        path: "/api/analytics/usage",
        description: "Get API usage statistics",
        params: [
          { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
          { name: "end_date", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/analytics/usage?start_date=2024-01-01" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "total_requests": 1247,
    "successful_requests": 1205,
    "failed_requests": 42,
    "optimizations_used": 156,
    "optimizations_remaining": 44,
    "plan_limit": 200,
    "reset_date": "2024-02-01T00:00:00Z",
    "endpoints_used": {
      "/api/optimize/readability": 67,
      "/api/optimize/seo": 58,
      "/api/analyze/content-health": 31
    }
  }
}`,
      },
      {
        method: "GET",
        path: "/api/billing/subscription",
        description: "Get current subscription and limits",
        params: [],
        example: `curl -X GET https://api.wpaimanager.com/api/billing/subscription \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "plan": "professional",
    "status": "active",
    "sites_limit": 5,
    "sites_used": 2,
    "optimizations_limit": 200,
    "optimizations_used": 156,
    "api_calls_limit": 5000,
    "api_calls_used": 1247,
    "current_period_end": "2024-02-09T00:00:00Z",
    "next_billing_date": "2024-02-09T00:00:00Z"
  }
}`,
      },
      {
        method: "GET",
        path: "/health",
        description: "Check API health status",
        params: [],
        example: `curl -X GET https://api.wpaimanager.com/health`,
        response: `{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "99.9%",
  "services": {
    "api": "operational",
    "database": "operational",
    "ai_services": "operational"
  },
  "timestamp": "2024-01-09T10:30:00Z"
}`,
      },
    ],
  };

  const features: Feature[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High Performance",
      description: "Fast response times with 99.9% uptime SLA",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted connections",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "RESTful Design",
      description: "Clean, predictable API following REST principles",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Comprehensive Docs",
      description: "Detailed documentation with code examples",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  const quickStart: QuickStartStep[] = [
    { step: 1, title: "Get API Key", description: "Sign up for a Professional or Enterprise plan to get API access" },
    { step: 2, title: "Make Request", description: "Use your API key to call our optimization endpoints" },
    { step: 3, title: "Process Response", description: "Apply optimized content back to your WordPress site" },
  ];

  const sdks: SDK[] = [
    {
      name: "JavaScript / Node.js",
      icon: "📦",
      install: "npm install @wpaimanager/sdk",
      code: `import { WPAIManager } from '@wpaimanager/sdk';

const client = new WPAIManager('YOUR_API_KEY');

const result = await client.optimize.readability({
  content: '<p>Your content...</p>',
  target_score: 65
});`,
    },
    {
      name: "Python",
      icon: "🐍",
      install: "pip install wpaimanager",
      code: `from wpaimanager import WPAIManager

client = WPAIManager('YOUR_API_KEY')

result = client.optimize.readability(
    content='<p>Your content...</p>',
    target_score=65
)`,
    },
    {
      name: "PHP",
      icon: "🐘",
      install: "composer require wpaimanager/sdk",
      code: `<?php
use WPAIManager\\Client;

$client = new Client('YOUR_API_KEY');

$result = $client->optimize->readability([
    'content' => '<p>Your content...</p>',
    'target_score' => 65
]);`,
    },
  ];

  const rateLimits: RateLimit[] = [
    { plan: "Starter", requests: "Not Available", rate: "API access not included" },
    { plan: "Professional", requests: "5,000/month", rate: "60/minute" },
    { plan: "Enterprise", requests: "Unlimited", rate: "Unlimited" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              <div>
                  <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                    WordPress AI Manager
                  </h1>
                  <p className="text-xs text-gray-400 font-medium hidden sm:block">Powered by Advanced AI</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/">
                <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
                  Home
                </a>
              </Link>
              <Link href="/features">
                <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
                  Features
                </a>
              </Link>
              <Link href="/pricing">
                <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
                  Pricing
                </a>
              </Link>
              <Link href="/subscription">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                >
                  Get API Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
            <Code className="w-3.5 h-3.5 mr-2 inline" />
            RESTful API Documentation
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Optimize Content with
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Our Powerful API
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4">
            Integrate AI-powered content optimization, SEO analysis, and WordPress management
            directly into your applications with our RESTful API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/subscription">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl text-base font-bold px-8 py-6 group"
              >
                Get API Key
                <Key className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl text-base font-bold px-8 py-6"
              onClick={() => document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Documentation
              <Book className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              Quick Start
            </Badge>
<h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Get Started in Minutes
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Three simple steps to integrate content optimization into your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
            {quickStart.map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Authentication Example */}
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-bold text-white">Authentication</h4>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth')}
                >
                  {copiedCode === 'auth' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm">
                <pre className="text-gray-300 overflow-x-auto">
                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </pre>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Include your API key in the Authorization header of every request. Get your API key from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section id="documentation" className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              API Reference
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Endpoint Documentation
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Complete reference for all available API endpoints
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12 px-4">
            {endpointCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveEndpoint(category.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeEndpoint === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>

          {/* Endpoints */}
          <div className="space-y-8">
            {endpoints[activeEndpoint as keyof typeof endpoints].map((endpoint, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8 hover:border-white/20 transition-all duration-300">
                  {/* Endpoint Header */}
                  <div className="flex flex-wrap items-start gap-4 mb-6">
                    <Badge
                      className={`${
                        endpoint.method === "GET"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : endpoint.method === "PUT"
                          ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      } border font-mono`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-blue-300 font-mono flex-1">{endpoint.path}</code>
                  </div>
                  <p className="text-gray-300 mb-6">{endpoint.description}</p>

                  {/* Parameters */}
                  {endpoint.params.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                        Parameters
                      </h5>
                      <div className="space-y-2">
                        {endpoint.params.map((param, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-start gap-3 text-sm bg-white/[0.02] rounded-lg p-3"
                          >
                            <code className="text-blue-300 font-mono">{param.name}</code>
                            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge className="bg-red-500/20 text-red-300 border-0 text-xs">
                                required
                              </Badge>
                            )}
                            <span className="text-gray-400 flex-1">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Request */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Example Request
                      </h5>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={() =>
                          copyToClipboard(endpoint.example, `example-${index}`)
                        }
                      >
                        {copiedCode === `example-${index}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 md:p-4 font-mono text-xs overflow-x-auto -mx-4 md:mx-0">
                      <pre className="text-gray-300">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Example Response */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Example Response
                      </h5>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={() =>
                          copyToClipboard(endpoint.response, `response-${index}`)
                        }
                      >
                        {copiedCode === `response-${index}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                      <pre className="text-gray-300">
                        <code>{endpoint.response}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 text-sm font-semibold">
              Official SDKs
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Client Libraries
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Use our official SDKs to integrate faster in your preferred language
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {sdks.map((sdk, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="text-4xl mb-4">{sdk.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-4">{sdk.name}</h4>
                  
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Install</div>
                    <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs">
                      <code className="text-green-400">{sdk.install}</code>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-2">Usage</div>
                    <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      <pre className="text-gray-300">
                        <code>{sdk.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-500/10 text-red-300 border border-red-500/20 px-3 py-1 text-sm font-semibold">
              Rate Limits
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              API Usage Limits
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Different rate limits based on your subscription plan
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
<div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-gray-400 font-semibold">Plan</th>
                    <th className="text-center p-6 text-gray-400 font-semibold">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Monthly Requests
                    </th>
                    <th className="text-center p-6 text-gray-400 font-semibold">
                      <Activity className="w-4 h-4 inline mr-2" />
                      Rate Limit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rateLimits.map((limit, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-6 text-white font-bold">{limit.plan}</td>
                      <td className="p-6 text-center text-gray-300">{limit.requests}</td>
                      <td className="p-6 text-center text-gray-300">{limit.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Note: API access requires a Professional or Enterprise plan.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 lg:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Ready to Build?
                </Badge>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                  Start Optimizing Today
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Get your API key and start integrating powerful content optimization into your application
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/subscription">
                    <Button
                      size="lg"
                      className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                    >
                      Get API Key
                      <Key className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-base font-bold px-8 py-6"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-blue-100 mt-6">
                  ✓ Professional plan required for API access • ✓ 14-day free trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white">WordPress AI Manager</h4>
                  <p className="text-xs text-gray-400">Powered by AI</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI-powered content optimization for WordPress sites.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Product</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/features">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Features
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/pricing">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Pricing
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/apidocs">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      API Docs
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/integrations">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Integrations
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Company</h5>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookie" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 WordPress AI Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Add custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default APIPage;