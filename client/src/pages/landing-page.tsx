import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Quote,
} from "lucide-react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Pen className="w-6 h-6" />,
      title: "AI Content Generation",
      description: "Create SEO-optimized articles in seconds with advanced AI",
      gradient: "from-emerald-500 to-teal-600",
      image: "✍️",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart SEO Analysis",
      description: "Real-time optimization suggestions for better rankings",
      gradient: "from-blue-500 to-cyan-600",
      image: "🎯",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Content Scheduling",
      description: "Plan and automate your content calendar effortlessly",
      gradient: "from-violet-500 to-purple-600",
      image: "📅",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", icon: <Users className="w-5 h-5" /> },
    { value: "500K+", label: "Articles Created", icon: <Pen className="w-5 h-5" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Star className="w-5 h-5" /> },
    { value: "50+", label: "Countries", icon: <Globe className="w-5 h-5" /> },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save 10+ Hours Weekly",
      description: "Automate content creation and focus on strategy",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Boost Traffic by 300%",
      description: "SEO-optimized content that ranks higher",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Increase Conversions",
      description: "Engaging content that converts visitors",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Original Content",
      description: "Plagiarism-free, unique articles every time",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Director at TechFlow",
      content: "WordPress AI Manager transformed our content strategy. We're publishing 3x more content with better quality and half the team size.",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Founder of GrowthLabs",
      content: "The SEO insights alone are worth 10x the price. Our organic traffic doubled in just 60 days.",
      avatar: "MR",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Marketing Manager at Innovate Co",
      content: "Best investment we've made. The AI writes better than our previous freelancers and costs a fraction of the price.",
      avatar: "EW",
      rating: 5,
    },
  ];

  const pricingFeatures = [
    "Unlimited AI-generated articles",
    "Advanced SEO analysis",
    "Content calendar & scheduling",
    "Multi-site management",
    "Priority support",
    "API access",
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
            <div className="flex items-center space-x-6">
              <a
                href="#features"
                className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium"
              >
                Reviews
              </a>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                onClick={() => window.location.href = '/subscription'}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
              <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
              AI-Powered Content Creation Platform
            </Badge>
            <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                WordPress Content
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Create SEO-optimized, high-quality content in seconds with AI. Boost traffic,
              save time, and dominate your niche.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-base font-bold px-8 py-6 group"
                onClick={() => window.location.href = '/subscription'}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="text-blue-400 mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              Features
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything You Need to Scale
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powerful AI-driven tools designed for modern content creators
            </p>
          </div>

          {/* Interactive Feature Display */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`cursor-pointer p-6 rounded-2xl transition-all duration-500 border ${
                    activeFeature === index
                      ? "bg-white/5 border-white/20 shadow-xl"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg flex-shrink-0`}
                    >
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        activeFeature === index ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-bounce-slow">
                    {features[activeFeature].image}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">
                    {features[activeFeature].title}
                  </h4>
                  <p className="text-gray-400">{features[activeFeature].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Analytics Dashboard",
                description: "Track performance metrics and content ROI",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                icon: <Code className="w-6 h-6" />,
                title: "API Integration",
                description: "Seamlessly connect with your existing tools",
                gradient: "from-orange-500 to-red-600",
              },
              {
                icon: <Lightbulb className="w-6 h-6" />,
                title: "Smart Suggestions",
                description: "AI-powered content ideas and topics",
                gradient: "from-yellow-500 to-orange-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              Benefits
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose Us?
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of successful content creators and marketers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center mb-6`}>
                    <div className={benefit.color}>{benefit.icon}</div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{benefit.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 text-sm font-semibold">
              Testimonials
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loved by Creators Worldwide
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-400/30 mb-4" />
                  <p className="text-gray-300 mb-6 flex-1 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 text-sm font-semibold">
              Pricing
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-6 border border-blue-400/30">
                      <Award className="w-4 h-4 text-blue-300 mr-2" />
                      <span className="text-sm font-semibold text-blue-200">Most Popular</span>
                    </div>
                    <h4 className="text-3xl font-black text-white mb-2">Professional Plan</h4>
                    <p className="text-gray-400 mb-8">
                      Perfect for serious content creators and growing businesses
                    </p>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        $29
                      </span>
                      <span className="text-gray-400 text-xl">/month</span>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-base font-bold py-6 group"
                      onClick={() => window.location.href = '/subscription'}
                    >
                      Start 14-Day Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-sm text-gray-400 text-center mt-4">
                      No credit card required
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                      Everything included:
                    </h5>
                    <div className="space-y-4">
                      {pricingFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <a
                        href="/features"
                        className="text-blue-400 hover:text-blue-300 font-semibold text-sm inline-flex items-center group"
                      >
                        See all features
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                { icon: <Shield />, text: "30-day money-back guarantee" },
                { icon: <Zap />, text: "Instant setup, no installation" },
                { icon: <Users />, text: "24/7 priority support" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-400 justify-center"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
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
                  Limited Time Offer
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Transform Your Content?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join 10,000+ creators who are already scaling their content with AI
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                    onClick={() => window.location.href = '/subscription'}
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <p className="text-sm text-blue-100 mt-6">
                  ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
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
                  <a href="/features" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/apidocs" className="text-sm text-gray-400 hover:text-white transition-colors">
                    API
                  </a>
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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
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

export default LandingPage;