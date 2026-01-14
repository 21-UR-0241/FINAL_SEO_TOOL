import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
  BarChart3,
  Search,
  Code,
  Award,
  FileText,
  Globe,
  Users,
  Layers,
  Brain,
  Wand2,
  Eye,
  RefreshCw,
  Settings,
  Database,
  Link2,
  AlertCircle,
  TrendingUp,
  Gauge,
  SlidersHorizontal,
  Wrench,
  ImageIcon,
  Type,
  BookOpen,
  Zap as ZapIcon,
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
    { id: "optimization", label: "Content Optimization", icon: <Wand2 className="w-4 h-4" /> },
    { id: "seo", label: "SEO Tools", icon: <Search className="w-4 h-4" /> },
    { id: "management", label: "Site Management", icon: <Globe className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics & Insights", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const allFeatures: Feature[] = [
    {
      category: "optimization",
      icon: <BookOpen className="w-6 h-6" />,
      title: "Readability Improvement",
      description: "Automatically improve content readability scores using AI to make your content more accessible",
      gradient: "from-blue-500 to-cyan-600",
      benefits: [
        "AI-powered sentence simplification",
        "Paragraph restructuring",
        "Vocabulary optimization",
        "Target 60+ readability scores"
      ]
    },
    {
      category: "optimization",
      icon: <Wrench className="w-6 h-6" />,
      title: "Automated Content Fixes",
      description: "AI detects and fixes common content issues like broken links, missing images, and formatting problems",
      gradient: "from-purple-500 to-pink-600",
      benefits: [
        "Broken link detection and fixing",
        "Missing image restoration",
        "Format consistency checks",
        "Automated corrections"
      ]
    },
    {
      category: "optimization",
      icon: <Type className="w-6 h-6" />,
      title: "Content Quality Enhancement",
      description: "Improve grammar, style, and overall content quality using advanced AI models",
      gradient: "from-green-500 to-emerald-600",
      benefits: [
        "Grammar and spelling fixes",
        "Style consistency",
        "Tone adjustments",
        "Natural language improvements"
      ]
    },
    {
      category: "seo",
      icon: <Search className="w-6 h-6" />,
      title: "SEO Analysis & Optimization",
      description: "Comprehensive SEO analysis with actionable recommendations to improve search rankings",
      gradient: "from-orange-500 to-red-600",
      benefits: [
        "On-page SEO analysis",
        "Meta tag optimization",
        "Keyword density checking",
        "SEO score tracking"
      ]
    },
    {
      category: "seo",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "SEO Recommendations",
      description: "Get intelligent SEO suggestions tailored to each piece of content",
      gradient: "from-indigo-500 to-purple-600",
      benefits: [
        "Content-specific suggestions",
        "Title and meta optimization",
        "Header structure analysis",
        "Internal linking opportunities"
      ]
    },
    {
      category: "seo",
      icon: <Gauge className="w-6 h-6" />,
      title: "Content Health Scoring",
      description: "Monitor overall content health with comprehensive scoring and diagnostics",
      gradient: "from-yellow-500 to-orange-600",
      benefits: [
        "Health score calculations",
        "Issue prioritization",
        "Performance tracking",
        "Improvement recommendations"
      ]
    },
    {
      category: "management",
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Site Management",
      description: "Manage multiple WordPress sites from a single, unified dashboard",
      gradient: "from-cyan-500 to-blue-600",
      benefits: [
        "Centralized site control",
        "Cross-site operations",
        "Unified reporting",
        "Bulk site management"
      ]
    },
    {
      category: "management",
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Bulk Operations",
      description: "Process multiple posts and pages simultaneously to save time",
      gradient: "from-pink-500 to-rose-600",
      benefits: [
        "Bulk readability improvements",
        "Mass SEO optimization",
        "Batch content fixes",
        "Queue management"
      ]
    },
    {
      category: "management",
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Content Health Monitoring",
      description: "Automated monitoring to detect issues before they impact your site",
      gradient: "from-violet-500 to-purple-600",
      benefits: [
        "Real-time issue detection",
        "Automated health checks",
        "Alert notifications",
        "Proactive maintenance"
      ]
    },
    {
      category: "analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive insights into your content performance and optimization results",
      gradient: "from-emerald-500 to-green-600",
      benefits: [
        "Content performance metrics",
        "SEO score tracking",
        "Improvement analytics",
        "Custom date ranges"
      ]
    },
    {
      category: "analytics",
      icon: <Eye className="w-6 h-6" />,
      title: "Content Performance Tracking",
      description: "Track how optimizations impact your content's performance over time",
      gradient: "from-amber-500 to-orange-600",
      benefits: [
        "Before/after comparisons",
        "Readability score trends",
        "SEO improvement tracking",
        "ROI measurements"
      ]
    },
    {
      category: "analytics",
      icon: <FileText className="w-6 h-6" />,
      title: "Detailed Reports",
      description: "Generate comprehensive reports on content health, SEO, and optimizations",
      gradient: "from-blue-500 to-indigo-600",
      benefits: [
        "Exportable reports",
        "Custom report builders",
        "Site-wide summaries",
        "Issue breakdowns"
      ]
    },
  ];

  const additionalFeatures: AdditionalFeature[] = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Multi-AI Model Support",
      description: "Choose from GPT-4, Claude, or Gemini AI models"
    },
    {
      icon: <SlidersHorizontal className="w-5 h-5" />,
      title: "Custom AI Prompts",
      description: "Customize AI behavior with your own prompts"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Full API Access",
      description: "Integrate with your existing workflows via REST API"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Team Collaboration",
      description: "Work together with role-based access control"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Secure WordPress Connection",
      description: "Direct, secure connection to your WordPress sites"
    },
    {
      icon: <Link2 className="w-5 h-5" />,
      title: "Link Management",
      description: "Detect and fix broken internal and external links"
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      title: "Image Optimization",
      description: "Ensure images are properly optimized and tagged"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-level encryption for all data"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Flexible Configuration",
      description: "Customize optimization settings per site"
    },
    {
      icon: <ZapIcon className="w-5 h-5" />,
      title: "One-Click Fixes",
      description: "Apply AI-powered fixes with a single click"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Quality Assurance",
      description: "Validation checks before applying changes"
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Batch Processing",
      description: "Queue and process multiple operations"
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
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Start</span>
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
            AI-Powered WordPress Optimization
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Better Content
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4">
            Everything you need to optimize, fix, and improve your WordPress content with AI-powered automation.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative z-10 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {category.icon}
                <span className="whitespace-nowrap">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 md:mb-6 shadow-lg flex-shrink-0`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="mt-auto space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
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

      {/* How It Works Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              Simple Process
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              How It Works
            </h3>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Get started in minutes with our streamlined workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-xl md:text-2xl font-bold">
                  1
                </div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3">Connect Your Site</h4>
                <p className="text-sm md:text-base text-gray-400">
                  Securely connect your WordPress site with our application key
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-xl md:text-2xl font-bold">
                  2
                </div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3">Analyze Content</h4>
                <p className="text-sm md:text-base text-gray-400">
                  AI automatically scans and identifies optimization opportunities
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-xl md:text-2xl font-bold">
                  3
                </div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3">Apply Fixes</h4>
                <p className="text-sm md:text-base text-gray-400">
                  Review and apply AI-powered improvements with one click
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              And Much More
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Built for Efficiency
            </h3>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Additional features to streamline your WordPress content management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 md:p-6 hover:border-white/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-3 md:mb-4 flex-shrink-0">
                    <div className="text-blue-400">{feature.icon}</div>
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-xs md:text-sm text-gray-400">{feature.description}</p>
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
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 lg:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Zap className="w-3.5 h-3.5 mr-2 inline" />
                  Start Optimizing Today
                </Badge>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                  Ready to Improve Your Content?
                </h3>
                <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto px-4">
                  Join content creators using AI to optimize their WordPress sites
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/subscription">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 text-base font-bold px-8 py-6"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <p className="text-xs md:text-sm text-blue-100 mt-6 px-4">
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

export default Features;