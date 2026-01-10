import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Globe,
  CheckCircle2,
  Star,
  BarChart3,
  Pen,
  Search,
  Calendar,
  Code,
  Lightbulb,
  Award,
  ChevronRight,
  Layout,
  FileText,
  Image,
  Link2,
  Smartphone,
  Palette,
  Database,
  Lock,
  RefreshCw,
  Bell,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Layers,
  GitBranch,
  Workflow,
  Brain,
  Wand2,
  Eye,
  ThumbsUp,
  Share2,
  Filter,
  Tag,
  Folder,
  BookOpen,
  Languages,
} from "lucide-react";

interface Feature {
  category: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  benefits: string[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface AdditionalFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function Features() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories: Category[] = [
    { id: "all", label: "All Features", icon: <Layers className="w-4 h-4" /> },
    { id: "ai", label: "AI-Powered", icon: <Brain className="w-4 h-4" /> },
    { id: "seo", label: "SEO Tools", icon: <Search className="w-4 h-4" /> },
    { id: "content", label: "Content Management", icon: <FileText className="w-4 h-4" /> },
    { id: "automation", label: "Automation", icon: <Workflow className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const allFeatures: Feature[] = [
    {
      category: "ai",
      icon: <Brain className="w-6 h-6" />,
      title: "AI Content Generator",
      description: "Generate high-quality, SEO-optimized articles in seconds using advanced AI models",
      gradient: "from-purple-500 to-pink-600",
      benefits: [
        "Natural language generation",
        "Context-aware writing",
        "Multiple content styles",
        "Instant article creation"
      ]
    },
    {
      category: "ai",
      icon: <Wand2 className="w-6 h-6" />,
      title: "Smart Rewriting",
      description: "Automatically improve and rewrite content while maintaining your unique voice",
      gradient: "from-blue-500 to-cyan-600",
      benefits: [
        "Style preservation",
        "Grammar enhancement",
        "Tone adjustment",
        "Plagiarism-free output"
      ]
    },
    {
      category: "ai",
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Topic Suggestions",
      description: "Get AI-powered content ideas based on trending topics and your niche",
      gradient: "from-yellow-500 to-orange-600",
      benefits: [
        "Trend analysis",
        "Niche-specific ideas",
        "Keyword integration",
        "Competitive insights"
      ]
    },
    {
      category: "seo",
      icon: <Search className="w-6 h-6" />,
      title: "SEO Optimization",
      description: "Real-time SEO analysis and suggestions to rank higher in search results",
      gradient: "from-green-500 to-emerald-600",
      benefits: [
        "Keyword density analysis",
        "Meta tag optimization",
        "Readability scoring",
        "SERP preview"
      ]
    },
    {
      category: "seo",
      icon: <Target className="w-6 h-6" />,
      title: "Keyword Research",
      description: "Discover high-value keywords and search terms for your content strategy",
      gradient: "from-red-500 to-pink-600",
      benefits: [
        "Search volume data",
        "Competition analysis",
        "Long-tail suggestions",
        "Related keywords"
      ]
    },
    {
      category: "seo",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Tracking",
      description: "Monitor your content's search rankings and organic traffic growth",
      gradient: "from-indigo-500 to-purple-600",
      benefits: [
        "Ranking monitoring",
        "Traffic analytics",
        "Conversion tracking",
        "Competitor comparison"
      ]
    },
    {
      category: "content",
      icon: <FileText className="w-6 h-6" />,
      title: "Multi-Format Support",
      description: "Create blog posts, articles, product descriptions, and more",
      gradient: "from-cyan-500 to-blue-600",
      benefits: [
        "Various content types",
        "Custom templates",
        "Format preservation",
        "Rich text editing"
      ]
    },
    {
      category: "content",
      icon: <Layout className="w-6 h-6" />,
      title: "Visual Editor",
      description: "Intuitive drag-and-drop editor with live preview capabilities",
      gradient: "from-orange-500 to-red-600",
      benefits: [
        "WYSIWYG editing",
        "Block-based layout",
        "Responsive design",
        "Custom styling"
      ]
    },
    {
      category: "content",
      icon: <Image className="w-6 h-6" />,
      title: "Media Management",
      description: "Organize and optimize images, videos, and other media assets",
      gradient: "from-pink-500 to-rose-600",
      benefits: [
        "Smart compression",
        "CDN integration",
        "Alt text generation",
        "Bulk operations"
      ]
    },
    {
      category: "automation",
      icon: <Calendar className="w-6 h-6" />,
      title: "Content Scheduling",
      description: "Plan and automate your content publishing with smart scheduling",
      gradient: "from-violet-500 to-purple-600",
      benefits: [
        "Calendar view",
        "Auto-publishing",
        "Time zone support",
        "Bulk scheduling"
      ]
    },
    {
      category: "automation",
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Auto-Updates",
      description: "Automatically update and refresh old content to keep it relevant",
      gradient: "from-teal-500 to-cyan-600",
      benefits: [
        "Content freshness",
        "Date updating",
        "Link checking",
        "Statistics refresh"
      ]
    },
    {
      category: "automation",
      icon: <Workflow className="w-6 h-6" />,
      title: "Custom Workflows",
      description: "Create automated workflows for content creation and publishing",
      gradient: "from-blue-500 to-indigo-600",
      benefits: [
        "Workflow builder",
        "Trigger conditions",
        "Action sequences",
        "Team collaboration"
      ]
    },
    {
      category: "analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive insights into content performance and user engagement",
      gradient: "from-emerald-500 to-green-600",
      benefits: [
        "Real-time data",
        "Custom reports",
        "Export options",
        "Data visualization"
      ]
    },
    {
      category: "analytics",
      icon: <Eye className="w-6 h-6" />,
      title: "Audience Insights",
      description: "Understand your audience with detailed demographic and behavior data",
      gradient: "from-amber-500 to-orange-600",
      benefits: [
        "User demographics",
        "Behavior patterns",
        "Engagement metrics",
        "Conversion funnels"
      ]
    },
    {
      category: "analytics",
      icon: <ThumbsUp className="w-6 h-6" />,
      title: "Content Performance",
      description: "Track which content resonates most with your audience",
      gradient: "from-rose-500 to-red-600",
      benefits: [
        "Engagement rates",
        "Social shares",
        "Time on page",
        "Bounce rates"
      ]
    },
  ];

  const additionalFeatures: AdditionalFeature[] = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-Site Management",
      description: "Manage multiple WordPress sites from one dashboard"
    },
    {
      icon: <Languages className="w-5 h-5" />,
      title: "Multi-Language Support",
      description: "Create content in 50+ languages with AI translation"
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and data protection"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "API Access",
      description: "Full API access for custom integrations"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Team Collaboration",
      description: "Work together with role-based permissions"
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: "Bulk Export",
      description: "Export content in multiple formats"
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Notifications",
      description: "Stay updated with intelligent alerts"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "AI Chat Assistant",
      description: "Get instant help from our AI assistant"
    },
    {
      icon: <Tag className="w-5 h-5" />,
      title: "Smart Tagging",
      description: "Automatic tag suggestions and organization"
    },
    {
      icon: <Folder className="w-5 h-5" />,
      title: "Content Library",
      description: "Organize content with custom taxonomies"
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Social Integration",
      description: "Auto-share to all major social platforms"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Backup & Recovery",
      description: "Automatic backups with one-click restore"
    },
  ];

  const filteredFeatures = activeCategory === "all" 
    ? allFeatures 
    : allFeatures.filter(f => f.category === activeCategory);

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
                <a className="text-sm text-white transition-colors hidden md:block font-medium">
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
                  Get Started Free
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
            <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
            Complete Feature Overview
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Built for Growth
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Discover all the tools and capabilities that make WordPress AI Manager the
            most comprehensive content creation platform for modern creators.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative z-10 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="mt-auto space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              And Much More
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything You Need
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Plus dozens of additional features to supercharge your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <div className="text-blue-400">{feature.icon}</div>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
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
                  <Zap className="w-3.5 h-3.5 mr-2 inline" />
                  Start Creating Today
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Experience All Features?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators using AI-powered tools to scale their content
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/subscription">
                    <Button
                      size="lg"
                      className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
                  ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
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
                  <a href="integrations" className="text-sm text-gray-400 hover:text-white transition-colors">
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

export default Features;