
import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Globe,
  Link2,
  Settings,
  Puzzle,
  BarChart3,
  Search,
  Code,
  Layers,
  Workflow,
  Brain,
  Database,
  Lock,
  Cloud,
  FileText,
  Activity,
  TrendingUp,
  Wrench,
  Shield,
} from "lucide-react";

interface Integration {
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  popular?: boolean;
  comingSoon?: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function Integrations(): JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories: Category[] = [
    { id: "all", label: "All Integrations", icon: <Layers className="w-4 h-4" />, count: 10 },
    { id: "wordpress", label: "WordPress", icon: <Globe className="w-4 h-4" />, count: 4 },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, count: 3 },
    { id: "automation", label: "Automation", icon: <Workflow className="w-4 h-4" />, count: 2 },
    { id: "ai", label: "AI Models", icon: <Brain className="w-4 h-4" />, count: 1 },
  ];

  const integrations: Integration[] = [
    // WordPress Core
    {
      name: "WordPress REST API",
      description: "Direct integration with WordPress via REST API for seamless content optimization",
      category: "wordpress",
      icon: <Globe className="w-8 h-8" />,
      color: "from-blue-500 to-blue-700",
      popular: true,
      features: [
        "Secure connection via application passwords",
        "Real-time content sync",
        "Bulk post/page operations",
        "Multi-site support"
      ]
    },
    {
      name: "Yoast SEO",
      description: "Enhanced SEO optimization with Yoast SEO metadata integration",
      category: "wordpress",
      icon: <Search className="w-8 h-8" />,
      color: "from-green-500 to-green-700",
      popular: true,
      features: [
        "SEO score integration",
        "Meta description optimization",
        "Focus keyword analysis",
        "Readability compatibility"
      ]
    },
    {
      name: "Rank Math",
      description: "Comprehensive SEO plugin integration for advanced optimization",
      category: "wordpress",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-500 to-purple-700",
      features: [
        "Schema markup support",
        "Advanced SEO analysis",
        "Content AI integration",
        "Performance tracking"
      ]
    },
    {
      name: "All in One SEO",
      description: "Compatible with AIOSEO for comprehensive WordPress SEO",
      category: "wordpress",
      icon: <Wrench className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      features: [
        "Smart SEO suggestions",
        "XML sitemap integration",
        "Social media optimization",
        "Local SEO support"
      ]
    },

    // Analytics
    {
      name: "Google Analytics",
      description: "Track content optimization impact on traffic and engagement",
      category: "analytics",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-yellow-600 to-orange-600",
      popular: true,
      features: [
        "Performance tracking",
        "Before/after analytics",
        "Conversion monitoring",
        "Custom event tracking"
      ]
    },
    {
      name: "Google Search Console",
      description: "Monitor SEO improvements and search rankings in real-time",
      category: "analytics",
      icon: <Search className="w-8 h-8" />,
      color: "from-blue-500 to-blue-700",
      features: [
        "Search performance data",
        "Keyword ranking tracking",
        "Index status monitoring",
        "Click-through rate analysis"
      ]
    },
    {
      name: "WordPress Analytics",
      description: "Native WordPress analytics integration for content insights",
      category: "analytics",
      icon: <Activity className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-600",
      features: [
        "Post performance metrics",
        "Readability score trends",
        "SEO improvement tracking",
        "Health score history"
      ]
    },

    // Automation
    {
      name: "Zapier",
      description: "Automate workflows and connect with 5000+ apps",
      category: "automation",
      icon: <Zap className="w-8 h-8" />,
      color: "from-orange-500 to-orange-700",
      popular: true,
      features: [
        "Trigger on optimization complete",
        "Auto-notify team members",
        "Custom workflow automation",
        "Multi-step integrations"
      ]
    },
    {
      name: "Webhooks",
      description: "Custom webhooks for real-time event notifications",
      category: "automation",
      icon: <Link2 className="w-8 h-8" />,
      color: "from-cyan-500 to-blue-600",
      features: [
        "Real-time event triggers",
        "Custom payload configuration",
        "Retry logic",
        "Event filtering"
      ]
    },

    // AI Models
    {
      name: "Multi-AI Provider",
      description: "Choose from multiple AI models for content optimization",
      category: "ai",
      icon: <Brain className="w-8 h-8" />,
      color: "from-pink-500 to-purple-600",
      features: [
        "OpenAI GPT-4 & GPT-4 Turbo",
        "Anthropic Claude 3",
        "Google Gemini Pro",
        "Custom model selection"
      ]
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: 1,
      title: "Connect WordPress",
      description: "Securely connect your WordPress site using application passwords",
      icon: <Globe className="w-8 h-8" />
    },
    {
      step: 2,
      title: "Configure Integrations",
      description: "Enable analytics, SEO plugins, and automation tools you use",
      icon: <Settings className="w-8 h-8" />
    },
    {
      step: 3,
      title: "Start Optimizing",
      description: "AI-powered optimizations sync automatically with all your tools",
      icon: <Zap className="w-8 h-8" />
    }
  ];

  const benefits = [
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Seamless WordPress Integration",
      description: "Native REST API connection for reliable syncing"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Connections",
      description: "Application passwords and encrypted data transfer"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Real-Time Updates",
      description: "Instant synchronization across all platforms"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "API Access",
      description: "Build custom integrations with our REST API"
    }
  ];

  const filteredIntegrations = activeCategory === "all"
    ? integrations
    : integrations.filter(integration => integration.category === activeCategory);

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
              <Link href="/integrations">
                <a className="text-sm text-white transition-colors hidden md:block font-medium">
                  Integrations
                </a>
              </Link>
              <Link href="/subscription">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                >
                  Get Started
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
            <Puzzle className="w-3.5 h-3.5 mr-2 inline" />
            {integrations.length}+ Essential Integrations
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Works With Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              WordPress Stack
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4">
            Seamlessly integrate with WordPress, popular SEO plugins, analytics tools,
            and automation platforms to streamline your content optimization workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/subscription">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl text-base font-bold px-8 py-6 group"
              >
                Start Connecting
                <Link2 className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl text-base font-bold px-8 py-6"
              onClick={() => document.getElementById('integrations')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                    <div className="text-white">{benefit.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              How It Works
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Get Started in 3 Steps
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Setting up integrations is quick and easy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <div className="text-white">{step.icon}</div>
                  </div>
                  <div className="text-sm font-bold text-blue-400 mb-2">Step {step.step}</div>
                  <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section id="integrations" className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              All Integrations
            </Badge>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Compatible Platforms
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Connect with the tools that power your WordPress workflow
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12 px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {category.icon}
                {category.label}
                <Badge className="bg-white/20 text-white border-0 text-xs ml-1">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-6 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center shadow-lg`}>
                      <div className="text-white">{integration.icon}</div>
                    </div>
                    {integration.popular && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 border text-xs">
                        Popular
                      </Badge>
                    )}
                    {integration.comingSoon && (
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 border text-xs">
                        Soon
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{integration.name}</h4>
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">{integration.description}</p>
                  <div className="mt-auto space-y-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Features
                    </div>
                    {integration.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {!integration.comingSoon && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs text-gray-400">
                        {integration.category === 'wordpress' && '✓ Auto-configured with WordPress connection'}
                        {integration.category === 'analytics' && '✓ Available in analytics dashboard'}
                        {integration.category === 'automation' && '✓ Configure in automation settings'}
                        {integration.category === 'ai' && '✓ Select in optimization settings'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Integration */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-12 text-center">
              <Puzzle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                Need a Custom Integration?
              </h3>
              <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                We're constantly adding new integrations. Use our API to build custom connections
                or request a specific integration.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-bold px-8 py-6"
                  onClick={() => window.location.href = 'mailto:support@wpaimanager.com?subject=Integration Request'}
                >
                  Request Integration
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link href="/apidocs">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl text-base font-bold px-8 py-6"
                  >
                    View API Docs
                  </Button>
                </Link>
              </div>
            </div>
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
                  Ready to Connect?
                </Badge>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                  Start Optimizing Today
                </h3>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Connect your WordPress site and start optimizing content with AI
                </p>
                <Link href="/subscription">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-sm text-blue-100 mt-6">
                  ✓ 14-day free trial • ✓ No credit card required • ✓ All integrations included
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

export default Integrations;