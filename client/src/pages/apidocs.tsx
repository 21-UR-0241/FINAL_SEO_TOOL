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
  ExternalLink,
  ChevronRight,
  Globe,
  Lock,
  Server,
  FileCode,
  Plug,
  Send,
  Database,
  Clock,
  Activity,
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
  const [activeEndpoint, setActiveEndpoint] = useState<string>("content");
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
    { id: "content", label: "Content Generation", icon: <FileCode className="w-4 h-4" /> },
    { id: "seo", label: "SEO Analysis", icon: <Activity className="w-4 h-4" /> },
    { id: "sites", label: "Site Management", icon: <Server className="w-4 h-4" /> },
    { id: "analytics", label: "System & Analytics", icon: <Database className="w-4 h-4" /> },
  ];

  const endpoints: EndpointsMap = {
    content: [
      {
        method: "POST",
        path: "/api/content/generate",
        description: "Generate AI-powered content for WordPress",
        params: [
          { name: "topic", type: "string", required: true, description: "Content topic or title" },
          { name: "keywords", type: "array", required: false, description: "Target keywords for SEO" },
          { name: "tone", type: "string", required: false, description: "Content tone (professional, casual, friendly)" },
          { name: "length", type: "number", required: false, description: "Target word count" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/content/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Benefits of Cloud Computing",
    "keywords": ["cloud", "computing", "benefits"],
    "tone": "professional",
    "length": 1000
  }'`,
        response: `{
  "success": true,
  "data": {
    "id": "cnt_1234567890",
    "title": "Top 10 Benefits of Cloud Computing",
    "content": "Cloud computing has revolutionized...",
    "word_count": 1024,
    "seo_score": 85,
    "created_at": "2024-01-09T10:30:00Z"
  }
}`,
      },
      {
        method: "POST",
        path: "/api/content/rewrite",
        description: "Rewrite existing content with AI improvements",
        params: [
          { name: "content", type: "string", required: true, description: "Original content to rewrite" },
          { name: "style", type: "string", required: false, description: "Rewrite style (engaging, professional, casual)" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/content/rewrite \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Original content here...",
    "style": "engaging"
  }'`,
        response: `{
  "success": true,
  "data": {
    "original_content": "Original content here...",
    "rewritten_content": "Enhanced and rewritten...",
    "improvements": ["clarity", "engagement", "seo"]
  }
}`,
      },
    ],
    seo: [
      {
        method: "POST",
        path: "/api/seo/analyze",
        description: "Analyze content for SEO optimization",
        params: [
          { name: "content", type: "string", required: true, description: "Content to analyze" },
          { name: "target_keyword", type: "string", required: true, description: "Primary target keyword" },
          { name: "url", type: "string", required: false, description: "Target URL for analysis" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/seo/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Your article content...",
    "target_keyword": "cloud computing"
  }'`,
        response: `{
  "success": true,
  "data": {
    "score": 87,
    "keyword_density": 2.5,
    "readability": "good",
    "suggestions": [
      "Add more internal links",
      "Optimize meta description",
      "Include keyword in H2 tags"
    ],
    "missing_elements": ["alt_text", "meta_description"]
  }
}`,
      },
      {
        method: "GET",
        path: "/api/seo/keywords",
        description: "Get keyword suggestions and research data",
        params: [
          { name: "seed_keyword", type: "string", required: true, description: "Base keyword for suggestions" },
          { name: "limit", type: "number", required: false, description: "Maximum number of results (default: 10)" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/seo/keywords?seed_keyword=cloud&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "keywords": [
      {
        "keyword": "cloud computing",
        "search_volume": 45000,
        "difficulty": "medium",
        "cpc": 2.5
      },
      {
        "keyword": "cloud storage",
        "search_volume": 38000,
        "difficulty": "low",
        "cpc": 1.8
      }
    ]
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
          { name: "limit", type: "number", required: false, description: "Number of sites to return" },
          { name: "offset", type: "number", required: false, description: "Pagination offset" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/sites" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "sites": [
      {
        "id": "site_123",
        "name": "My Blog",
        "url": "https://myblog.com",
        "status": "active",
        "posts_count": 150,
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
        path: "/api/sites/{site_id}/publish",
        description: "Publish content directly to WordPress site",
        params: [
          { name: "site_id", type: "string", required: true, description: "Site identifier (in URL)" },
          { name: "title", type: "string", required: true, description: "Post title" },
          { name: "content", type: "string", required: true, description: "Post content (HTML supported)" },
          { name: "status", type: "string", required: false, description: "publish, draft, or pending" },
          { name: "categories", type: "array", required: false, description: "Category names or IDs" },
          { name: "tags", type: "array", required: false, description: "Tag names" },
        ],
        example: `curl -X POST https://api.wpaimanager.com/api/sites/site_123/publish \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My New Post",
    "content": "<p>Post content here...</p>",
    "status": "publish",
    "categories": ["Technology", "AI"],
    "tags": ["machine learning", "automation"]
  }'`,
        response: `{
  "success": true,
  "data": {
    "post_id": 456,
    "url": "https://myblog.com/my-new-post",
    "status": "published",
    "published_at": "2024-01-09T10:30:00Z"
  }
}`,
      },
    ],
    analytics: [
      {
        method: "GET",
        path: "/api/session-debug",
        description: "Debug session information and authentication status",
        params: [],
        example: `curl -X GET https://api.wpaimanager.com/api/session-debug \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "authenticated": true,
    "user_id": "usr_123",
    "session_id": "ses_456",
    "expires_at": "2024-01-10T10:30:00Z"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/billing/subscription",
        description: "Get current subscription and billing information",
        params: [],
        example: `curl -X GET https://api.wpaimanager.com/api/billing/subscription \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "plan": "professional",
    "status": "active",
    "current_period_end": "2024-02-09T00:00:00Z",
    "api_calls_used": 250,
    "api_calls_limit": 1000,
    "next_billing_date": "2024-02-09T00:00:00Z"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/analytics/usage",
        description: "Get API usage statistics and metrics",
        params: [
          { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
          { name: "end_date", type: "string", required: false, description: "End date (YYYY-MM-DD)" },
        ],
        example: `curl -X GET "https://api.wpaimanager.com/api/analytics/usage?start_date=2024-01-01" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        response: `{
  "success": true,
  "data": {
    "total_requests": 1500,
    "successful_requests": 1450,
    "failed_requests": 50,
    "avg_response_time": 245,
    "endpoints_used": {
      "/api/content/generate": 800,
      "/api/seo/analyze": 500,
      "/api/sites": 200
    }
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
  "message": "SEO Tool API Server",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "api": "/api/*",
    "corsTest": "/api/cors-test",
    "sessionDebug": "/api/session-debug",
    "billing": "/api/billing/*"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/cors-test",
        description: "Test CORS configuration",
        params: [],
        example: `curl -X GET https://api.wpaimanager.com/api/cors-test \\
  -H "Origin: https://yourdomain.com"`,
        response: `{
  "success": true,
  "message": "CORS is configured correctly",
  "cors_enabled": true
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
      title: "Global CDN",
      description: "Low latency access from anywhere in the world",
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
    { step: 1, title: "Get API Key", description: "Sign up and generate your API key from the dashboard" },
    { step: 2, title: "Make Request", description: "Use your preferred HTTP client to call our endpoints" },
    { step: 3, title: "Handle Response", description: "Process the JSON response and integrate with your app" },
  ];

  const sdks: SDK[] = [
    {
      name: "JavaScript / Node.js",
      icon: "📦",
      install: "npm install @wpaimanager/sdk",
      code: `import { WPAIManager } from '@wpaimanager/sdk';

const client = new WPAIManager('YOUR_API_KEY');

const content = await client.content.generate({
  topic: 'AI in Marketing',
  length: 1000
});`,
    },
    {
      name: "Python",
      icon: "🐍",
      install: "pip install wpaimanager",
      code: `from wpaimanager import WPAIManager

client = WPAIManager('YOUR_API_KEY')

content = client.content.generate(
    topic='AI in Marketing',
    length=1000
)`,
    },
    {
      name: "PHP",
      icon: "🐘",
      install: "composer require wpaimanager/sdk",
      code: `<?php
use WPAIManager\\Client;

$client = new Client('YOUR_API_KEY');

$content = $client->content->generate([
    'topic' => 'AI in Marketing',
    'length' => 1000
]);`,
    },
  ];

  const rateLimits: RateLimit[] = [
    { plan: "Starter", requests: "100/day", rate: "10/minute" },
    { plan: "Professional", requests: "1,000/day", rate: "60/minute" },
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
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                    WordPress AI Manager
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Powered by Advanced AI</p>
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
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Build with Our
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powerful API
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Integrate AI-powered content generation, SEO analysis, and WordPress management
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get Started in Minutes
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Three simple steps to integrate our API into your application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
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
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
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
                Include your API key in the Authorization header of every request
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Endpoint Documentation
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Complete reference for all available API endpoints
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {endpointCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveEndpoint(category.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
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
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
                  {/* Endpoint Header */}
                  <div className="flex flex-wrap items-start gap-4 mb-6">
                    <Badge
                      className={`${
                        endpoint.method === "GET"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
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
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                      <pre className="text-gray-300">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Example Response */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Send className="w-4 h-4" />
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Client Libraries
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Use our official SDKs to integrate faster in your preferred language
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              API Usage Limits
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Different rate limits based on your subscription plan
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-6 text-gray-400 font-semibold">Plan</th>
                    <th className="text-center p-6 text-gray-400 font-semibold">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Daily Requests
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
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Ready to Build?
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Start Building Today
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Get your API key and start integrating powerful AI features into your application
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
          <div className="grid md:grid-cols-4 gap-12 mb-12">
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
                The ultimate AI-powered content creation platform for WordPress.
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
                      API
                    </a>
                  </Link>
                </li>
                <li>
                  <a href="/integrations" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </a>
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