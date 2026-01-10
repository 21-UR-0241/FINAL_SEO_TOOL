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
  Users,
  TrendingUp,
  Link2,
  Settings,
  Puzzle,
  Share2,
  BarChart3,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Database,
  Code,
  Smartphone,
  Layers,
  GitBranch,
  Cloud,
  Lock,
  Workflow,
  Cpu,
  Search,
  ShoppingCart,
  DollarSign,
  Camera,
  Video,
  Headphones,
  BookOpen,
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories: Category[] = [
    { id: "all", label: "All Integrations", icon: <Layers className="w-4 h-4" />, count: 24 },
    { id: "cms", label: "CMS & Publishing", icon: <FileText className="w-4 h-4" />, count: 5 },
    { id: "marketing", label: "Marketing", icon: <TrendingUp className="w-4 h-4" />, count: 6 },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, count: 4 },
    { id: "social", label: "Social Media", icon: <Share2 className="w-4 h-4" />, count: 5 },
    { id: "automation", label: "Automation", icon: <Workflow className="w-4 h-4" />, count: 4 },
  ];

  const integrations: Integration[] = [
    // CMS & Publishing
    {
      name: "WordPress",
      description: "Direct integration with WordPress for seamless content publishing",
      category: "cms",
      icon: <Globe className="w-8 h-8" />,
      color: "from-blue-500 to-blue-700",
      popular: true,
      features: [
        "One-click publishing",
        "Auto-scheduling",
        "Multi-site support",
        "Custom fields sync"
      ]
    },
    {
      name: "Elementor",
      description: "Build beautiful pages with Elementor integration",
      category: "cms",
      icon: <Layers className="w-8 h-8" />,
      color: "from-pink-500 to-red-600",
      features: [
        "Visual editing",
        "Template library",
        "Responsive design",
        "Widget support"
      ]
    },
    {
      name: "WooCommerce",
      description: "Manage eCommerce content and product descriptions",
      category: "cms",
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "from-purple-500 to-purple-700",
      features: [
        "Product content",
        "SEO optimization",
        "Bulk updates",
        "Category management"
      ]
    },
    {
      name: "Yoast SEO",
      description: "Enhanced SEO optimization with Yoast integration",
      category: "cms",
      icon: <Search className="w-8 h-8" />,
      color: "from-green-500 to-green-700",
      features: [
        "SEO scoring",
        "Meta optimization",
        "Readability analysis",
        "Schema markup"
      ]
    },
    {
      name: "Medium",
      description: "Cross-post your content to Medium automatically",
      category: "cms",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-gray-600 to-gray-800",
      features: [
        "Auto cross-posting",
        "Canonical URLs",
        "Tag syncing",
        "Draft management"
      ]
    },

    // Marketing
    {
      name: "Mailchimp",
      description: "Sync your content with email marketing campaigns",
      category: "marketing",
      icon: <Mail className="w-8 h-8" />,
      color: "from-yellow-500 to-yellow-700",
      popular: true,
      features: [
        "Email automation",
        "Subscriber lists",
        "Campaign templates",
        "Analytics tracking"
      ]
    },
    {
      name: "HubSpot",
      description: "Connect with HubSpot CRM and marketing tools",
      category: "marketing",
      icon: <DollarSign className="w-8 h-8" />,
      color: "from-orange-500 to-orange-700",
      features: [
        "CRM integration",
        "Lead tracking",
        "Marketing automation",
        "Pipeline management"
      ]
    },
    {
      name: "ConvertKit",
      description: "Build your email list with ConvertKit integration",
      category: "marketing",
      icon: <Users className="w-8 h-8" />,
      color: "from-red-500 to-pink-600",
      features: [
        "Email sequences",
        "Landing pages",
        "Subscriber tagging",
        "Form embedding"
      ]
    },
    {
      name: "ActiveCampaign",
      description: "Automate your marketing with ActiveCampaign",
      category: "marketing",
      icon: <Workflow className="w-8 h-8" />,
      color: "from-blue-600 to-indigo-700",
      features: [
        "Marketing automation",
        "CRM tools",
        "Email campaigns",
        "Sales automation"
      ]
    },
    {
      name: "Klaviyo",
      description: "eCommerce email marketing platform integration",
      category: "marketing",
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "from-green-600 to-teal-700",
      features: [
        "eCommerce focus",
        "SMS marketing",
        "Segmentation",
        "Personalization"
      ]
    },
    {
      name: "Drip",
      description: "Ecommerce CRM and email marketing automation",
      category: "marketing",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-purple-600 to-pink-700",
      features: [
        "Visual workflows",
        "Revenue tracking",
        "Behavior tracking",
        "Multi-channel"
      ]
    },

    // Analytics
    {
      name: "Google Analytics",
      description: "Track content performance with Google Analytics",
      category: "analytics",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-yellow-600 to-orange-600",
      popular: true,
      features: [
        "Traffic tracking",
        "Conversion tracking",
        "Custom events",
        "Real-time data"
      ]
    },
    {
      name: "Google Search Console",
      description: "Monitor SEO performance and search rankings",
      category: "analytics",
      icon: <Search className="w-8 h-8" />,
      color: "from-blue-500 to-blue-700",
      features: [
        "Search analytics",
        "Keyword tracking",
        "Index monitoring",
        "Performance reports"
      ]
    },
    {
      name: "Hotjar",
      description: "Understand user behavior with heatmaps and recordings",
      category: "analytics",
      icon: <Camera className="w-8 h-8" />,
      color: "from-red-500 to-red-700",
      features: [
        "Heatmaps",
        "Session recordings",
        "Feedback polls",
        "User surveys"
      ]
    },
    {
      name: "Mixpanel",
      description: "Advanced product analytics and user tracking",
      category: "analytics",
      icon: <Cpu className="w-8 h-8" />,
      color: "from-purple-500 to-purple-700",
      features: [
        "Event tracking",
        "User analytics",
        "Funnel analysis",
        "Retention reports"
      ]
    },

    // Social Media
    {
      name: "Facebook",
      description: "Share content automatically to Facebook pages",
      category: "social",
      icon: <Share2 className="w-8 h-8" />,
      color: "from-blue-600 to-blue-800",
      features: [
        "Auto-posting",
        "Page management",
        "Engagement tracking",
        "Image optimization"
      ]
    },
    {
      name: "Twitter / X",
      description: "Post updates and threads to Twitter automatically",
      category: "social",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "from-sky-500 to-sky-700",
      popular: true,
      features: [
        "Auto-tweeting",
        "Thread creation",
        "Hashtag suggestions",
        "Scheduling"
      ]
    },
    {
      name: "LinkedIn",
      description: "Share professional content on LinkedIn",
      category: "social",
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-700 to-blue-900",
      features: [
        "Profile posting",
        "Company pages",
        "Article publishing",
        "Analytics"
      ]
    },
    {
      name: "Instagram",
      description: "Create and schedule Instagram posts with captions",
      category: "social",
      icon: <Camera className="w-8 h-8" />,
      color: "from-pink-500 to-purple-600",
      features: [
        "Post scheduling",
        "Caption generation",
        "Hashtag research",
        "Story support"
      ]
    },
    {
      name: "Pinterest",
      description: "Pin your content to Pinterest boards automatically",
      category: "social",
      icon: <Globe className="w-8 h-8" />,
      color: "from-red-600 to-red-800",
      features: [
        "Pin creation",
        "Board management",
        "Rich pins",
        "Analytics"
      ]
    },

    // Automation
    {
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier integration",
      category: "automation",
      icon: <Zap className="w-8 h-8" />,
      color: "from-orange-500 to-orange-700",
      popular: true,
      features: [
        "Multi-step zaps",
        "Custom workflows",
        "5000+ app connections",
        "Filters and paths"
      ]
    },
    {
      name: "Make (Integromat)",
      description: "Build complex automation scenarios with Make",
      category: "automation",
      icon: <GitBranch className="w-8 h-8" />,
      color: "from-indigo-500 to-indigo-700",
      features: [
        "Visual workflows",
        "Advanced logic",
        "Data transformation",
        "Error handling"
      ]
    },
    {
      name: "IFTTT",
      description: "Simple automation with IFTTT applets",
      category: "automation",
      icon: <Link2 className="w-8 h-8" />,
      color: "from-gray-700 to-gray-900",
      features: [
        "Simple applets",
        "Multi-device",
        "Smart home",
        "Mobile apps"
      ]
    },
    {
      name: "n8n",
      description: "Self-hosted workflow automation platform",
      category: "automation",
      icon: <Workflow className="w-8 h-8" />,
      color: "from-pink-600 to-rose-700",
      features: [
        "Self-hosted option",
        "Open source",
        "Custom nodes",
        "Advanced workflows"
      ]
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: 1,
      title: "Connect Your Account",
      description: "Link your preferred platforms with one-click authentication",
      icon: <Link2 className="w-8 h-8" />
    },
    {
      step: 2,
      title: "Configure Settings",
      description: "Customize how content flows between WordPress AI Manager and your tools",
      icon: <Settings className="w-8 h-8" />
    },
    {
      step: 3,
      title: "Automate Everything",
      description: "Sit back and let the integrations handle content distribution automatically",
      icon: <Zap className="w-8 h-8" />
    }
  ];

  const benefits = [
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Seamless Automation",
      description: "Set it and forget it - content flows automatically"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Connections",
      description: "Enterprise-grade security with OAuth 2.0"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Real-Time Sync",
      description: "Changes sync instantly across all platforms"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Custom APIs",
      description: "Build your own integrations with our API"
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
            {integrations.length}+ Powerful Integrations
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Connect Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Favorite Tools
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Seamlessly integrate WordPress AI Manager with the tools you already use.
            Automate your workflow and boost productivity.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get Started in 3 Steps
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Setting up integrations is quick and easy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Connect Everything
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Browse our extensive library of integrations
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
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
                <Badge className="bg-white/20 text-white border-0 text-xs ml-1">
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <div
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
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
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    disabled={integration.comingSoon}
                  >
                    {integration.comingSoon ? "Coming Soon" : "Connect"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
              <Puzzle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">
                Don't See Your Tool?
              </h3>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                We're constantly adding new integrations. Let us know which tools you'd like to see next.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-bold px-8 py-6"
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
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Ready to Connect?
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Start Integrating Today
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Connect all your favorite tools and automate your content workflow
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