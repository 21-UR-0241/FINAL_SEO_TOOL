import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Cookie,
  Info,
  Eye,
  BarChart,
  Target,
  Settings,
  Shield,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface CookieType {
  name: string;
  type: string;
  purpose: string;
  duration: string;
  provider: string;
}

export function CookiePolicy(): JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("introduction");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections: Section[] = [
    { id: "introduction", title: "What Are Cookies", icon: <Info className="w-4 h-4" /> },
    { id: "types", title: "Types of Cookies", icon: <Cookie className="w-4 h-4" /> },
    { id: "usage", title: "How We Use Cookies", icon: <Settings className="w-4 h-4" /> },
    { id: "essential", title: "Essential Cookies", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "analytics", title: "Analytics Cookies", icon: <BarChart className="w-4 h-4" /> },
    { id: "functional", title: "Functional Cookies", icon: <Settings className="w-4 h-4" /> },
    { id: "marketing", title: "Marketing Cookies", icon: <Target className="w-4 h-4" /> },
    { id: "thirdparty", title: "Third-Party Cookies", icon: <Globe className="w-4 h-4" /> },
    { id: "management", title: "Managing Cookies", icon: <Settings className="w-4 h-4" /> },
    { id: "choices", title: "Your Choices", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "updates", title: "Policy Updates", icon: <FileText className="w-4 h-4" /> },
    { id: "contact", title: "Contact Us", icon: <Users className="w-4 h-4" /> },
  ];

  const essentialCookies: CookieType[] = [
    {
      name: "session_id",
      type: "Essential",
      purpose: "Maintains user session and authentication state",
      duration: "Session",
      provider: "WordPress AI Manager"
    },
    {
      name: "csrf_token",
      type: "Essential",
      purpose: "Security token to prevent cross-site request forgery",
      duration: "Session",
      provider: "WordPress AI Manager"
    },
    {
      name: "cookie_consent",
      type: "Essential",
      purpose: "Stores user's cookie consent preferences",
      duration: "1 year",
      provider: "WordPress AI Manager"
    }
  ];

  const analyticsCookies: CookieType[] = [
    {
      name: "_ga",
      type: "Analytics",
      purpose: "Distinguishes unique users for Google Analytics",
      duration: "2 years",
      provider: "Google Analytics"
    },
    {
      name: "_gid",
      type: "Analytics",
      purpose: "Distinguishes users for Google Analytics",
      duration: "24 hours",
      provider: "Google Analytics"
    },
    {
      name: "_gat",
      type: "Analytics",
      purpose: "Throttles request rate for Google Analytics",
      duration: "1 minute",
      provider: "Google Analytics"
    }
  ];

  const functionalCookies: CookieType[] = [
    {
      name: "user_preferences",
      type: "Functional",
      purpose: "Stores user interface preferences and settings",
      duration: "1 year",
      provider: "WordPress AI Manager"
    },
    {
      name: "language",
      type: "Functional",
      purpose: "Remembers user's language preference",
      duration: "1 year",
      provider: "WordPress AI Manager"
    },
    {
      name: "theme",
      type: "Functional",
      purpose: "Stores selected theme (dark/light mode)",
      duration: "1 year",
      provider: "WordPress AI Manager"
    }
  ];

  const marketingCookies: CookieType[] = [
    {
      name: "fbp",
      type: "Marketing",
      purpose: "Facebook tracking pixel for ad targeting",
      duration: "90 days",
      provider: "Facebook"
    },
    {
      name: "_gcl_au",
      type: "Marketing",
      purpose: "Google Ads conversion tracking",
      duration: "90 days",
      provider: "Google Ads"
    }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-500/10 text-orange-300 border border-orange-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-orange-500/20 transition-colors">
            <Cookie className="w-3.5 h-3.5 mr-2 inline" />
            Legal
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Cookie Policy
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed px-4">
            This Cookie Policy explains how WordPress AI Manager uses cookies and similar tracking technologies.
          </p>
          <p className="text-sm text-gray-500">
            Last Updated: December 15, 2024
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation - Hidden on mobile */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-24">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                      Table of Contents
                    </h3>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            activeSection === section.id
                              ? "bg-blue-500/20 text-blue-300 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {section.icon}
                          <span className="text-left">{section.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 lg:p-12 space-y-12">
                  
                  {/* What Are Cookies */}
                  <div id="introduction">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">What Are Cookies?</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Cookies allow us to recognize your device and remember information about your visit, including your preferences and actions. This helps us improve your experience on our website and provide personalized content.
                      </p>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-blue-300 text-xs md:text-sm">
                          <Info className="w-4 h-4 inline mr-2" />
                          Cookies do not contain any information that personally identifies you, but personal information we store about you may be linked to information stored in and obtained from cookies.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Types of Cookies */}
                  <div id="types" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Types of Cookies We Use</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-6">
                        We use several different types of cookies on our website:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <h4 className="font-bold text-white text-sm md:text-base">Essential Cookies</h4>
                          </div>
                          <p className="text-xs md:text-sm text-gray-400">
                            Required for the website to function properly. Cannot be disabled.
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <BarChart className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <h4 className="font-bold text-white text-sm md:text-base">Analytics Cookies</h4>
                          </div>
                          <p className="text-xs md:text-sm text-gray-400">
                            Help us understand how visitors interact with our website.
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Settings className="w-5 h-5 text-purple-400 flex-shrink-0" />
                            <h4 className="font-bold text-white text-sm md:text-base">Functional Cookies</h4>
                          </div>
                          <p className="text-xs md:text-sm text-gray-400">
                            Remember your preferences and settings for improved experience.
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Target className="w-5 h-5 text-orange-400 flex-shrink-0" />
                            <h4 className="font-bold text-white text-sm md:text-base">Marketing Cookies</h4>
                          </div>
                          <p className="text-xs md:text-sm text-gray-400">
                            Track your visits to deliver relevant advertisements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* How We Use Cookies */}
                  <div id="usage" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">How We Use Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We use cookies for various purposes, including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li>Keeping you signed in to your account</li>
                        <li>Understanding how you use our service</li>
                        <li>Remembering your preferences and settings</li>
                        <li>Providing personalized content and recommendations</li>
                        <li>Measuring the effectiveness of our marketing campaigns</li>
                        <li>Improving website performance and user experience</li>
                        <li>Preventing fraud and enhancing security</li>
                      </ul>
                    </div>
                  </div>

                  {/* Essential Cookies */}
                  <div id="essential" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Essential Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as logging in or filling in forms.
                      </p>
                      <div className="overflow-x-auto -mx-6 md:mx-0">
                        <div className="inline-block min-w-full align-middle px-6 md:px-0">
                          <table className="w-full text-xs md:text-sm min-w-[600px]">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Cookie Name</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Purpose</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {essentialCookies.map((cookie, index) => (
                                <tr key={index} className="border-b border-white/5">
                                  <td className="py-3 px-2 md:px-4 text-blue-400 font-mono break-words">{cookie.name}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-300">{cookie.purpose}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-400">{cookie.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div id="analytics" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BarChart className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Analytics Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are popular and how visitors move around the site.
                      </p>
                      <div className="overflow-x-auto -mx-6 md:mx-0">
                        <div className="inline-block min-w-full align-middle px-6 md:px-0">
                          <table className="w-full text-xs md:text-sm min-w-[600px]">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Cookie Name</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Purpose</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyticsCookies.map((cookie, index) => (
                                <tr key={index} className="border-b border-white/5">
                                  <td className="py-3 px-2 md:px-4 text-blue-400 font-mono break-words">{cookie.name}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-300">{cookie.purpose}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-400">{cookie.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div id="functional" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Functional Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we use on our pages.
                      </p>
                      <div className="overflow-x-auto -mx-6 md:mx-0">
                        <div className="inline-block min-w-full align-middle px-6 md:px-0">
                          <table className="w-full text-xs md:text-sm min-w-[600px]">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Cookie Name</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Purpose</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {functionalCookies.map((cookie, index) => (
                                <tr key={index} className="border-b border-white/5">
                                  <td className="py-3 px-2 md:px-4 text-blue-400 font-mono break-words">{cookie.name}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-300">{cookie.purpose}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-400">{cookie.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div id="marketing" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Marketing Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. These cookies can share that information with other organizations or advertisers.
                      </p>
                      <div className="overflow-x-auto -mx-6 md:mx-0">
                        <div className="inline-block min-w-full align-middle px-6 md:px-0">
                          <table className="w-full text-xs md:text-sm min-w-[600px]">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Cookie Name</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Purpose</th>
                                <th className="text-left py-3 px-2 md:px-4 text-white font-bold">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {marketingCookies.map((cookie, index) => (
                                <tr key={index} className="border-b border-white/5">
                                  <td className="py-3 px-2 md:px-4 text-blue-400 font-mono break-words">{cookie.name}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-300">{cookie.purpose}</td>
                                  <td className="py-3 px-2 md:px-4 text-gray-400">{cookie.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Third-Party Cookies */}
                  <div id="thirdparty" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Third-Party Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        In addition to our own cookies, we may also use various third-party cookies to report usage statistics and deliver advertisements on and through the Service.
                      </p>
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm md:text-base">
                            <Eye className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            Google Analytics
                          </h4>
                          <p className="text-xs md:text-sm text-gray-400 mb-2">
                            We use Google Analytics to understand how visitors interact with our website.
                          </p>
                          <a href="https://policies.google.com/privacy" className="text-xs md:text-sm text-blue-400 hover:text-blue-300 break-words">
                            View Google Privacy Policy →
                          </a>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 md:p-6">
                          <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm md:text-base">
                            <Target className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            Advertising Partners
                          </h4>
                          <p className="text-xs md:text-sm text-gray-400 mb-2">
                            We work with advertising partners including Facebook and Google Ads to deliver relevant advertisements.
                          </p>
                          <p className="text-xs md:text-sm text-gray-400">
                            These partners may use cookies to track your activity across different websites.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Managing Cookies */}
                  <div id="management" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Managing Cookies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Most web browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may impact your overall user experience.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                          <h4 className="font-bold text-white mb-2 text-sm md:text-base">Browser Settings</h4>
                          <p className="text-xs md:text-sm text-gray-400 mb-2">
                            You can manage cookies through your browser settings. Here are links to cookie management guides for popular browsers:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-400 ml-4">
                            <li>Chrome: Settings → Privacy and Security → Cookies</li>
                            <li>Firefox: Options → Privacy & Security → Cookies</li>
                            <li>Safari: Preferences → Privacy → Cookies</li>
                            <li>Edge: Settings → Privacy → Cookies</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Your Choices */}
                  <div id="choices" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Your Choices</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        You have several options for managing cookies:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 md:p-6">
                          <CheckCircle2 className="w-6 h-6 text-green-400 mb-3" />
                          <h4 className="font-bold text-white mb-2 text-sm md:text-base">Accept All Cookies</h4>
                          <p className="text-xs md:text-sm text-gray-400">
                            Get the full experience with all features enabled.
                          </p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 md:p-6">
                          <Settings className="w-6 h-6 text-blue-400 mb-3" />
                          <h4 className="font-bold text-white mb-2 text-sm md:text-base">Manage Preferences</h4>
                          <p className="text-xs md:text-sm text-gray-400">
                            Choose which types of cookies you want to allow.
                          </p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 md:p-6">
                          <AlertCircle className="w-6 h-6 text-orange-400 mb-3" />
                          <h4 className="font-bold text-white mb-2 text-sm md:text-base">Essential Only</h4>
                          <p className="text-xs md:text-sm text-gray-400">
                            Allow only cookies required for basic functionality.
                          </p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 md:p-6">
                          <XCircle className="w-6 h-6 text-red-400 mb-3" />
                          <h4 className="font-bold text-white mb-2 text-sm md:text-base">Decline All</h4>
                          <p className="text-xs md:text-sm text-gray-400">
                            Block all non-essential cookies (may limit features).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Policy Updates */}
                  <div id="updates" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Changes to This Cookie Policy</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We may update our Cookie Policy from time to time to reflect changes in technology, legislation, our operations, or for other reasons. We will notify you of any significant changes by:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li>Posting the new Cookie Policy on this page</li>
                        <li>Updating the "Last Updated" date at the top of this policy</li>
                        <li>Sending you an email notification for material changes</li>
                        <li>Displaying a prominent notice on our website</li>
                      </ul>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-4">
                        We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                      </p>
                    </div>
                  </div>

                  {/* Contact Us */}
                  <div id="contact" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Contact Us</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 space-y-3">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                          <div>
                            <div className="text-sm font-bold text-white">Email</div>
                            <a href="mailto:privacy@wpaimanager.com" className="text-blue-400 hover:text-blue-300 text-sm break-words">
                              privacy@wpaimanager.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                          <div>
                            <div className="text-sm font-bold text-white">Address</div>
                            <div className="text-gray-400 text-xs md:text-sm">
                              123 Market Street, Suite 400<br />
                              San Francisco, CA 94102<br />
                              United States
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-12 px-6 mt-20">
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
                  <Link href="/about">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      About
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Contact
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Legal</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/cookie">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Cookie Policy
                    </a>
                  </Link>
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

export default CookiePolicy;