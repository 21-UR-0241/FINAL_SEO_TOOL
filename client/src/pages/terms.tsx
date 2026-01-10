import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Shield,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Lock,
  Gavel,
  Info,
  Ban,
  UserX,
  Copyright,
  Globe,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export function TermsOfService(): JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("acceptance");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections: Section[] = [
    { id: "acceptance", title: "Acceptance of Terms", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "description", title: "Service Description", icon: <Info className="w-4 h-4" /> },
    { id: "registration", title: "Account Registration", icon: <Users className="w-4 h-4" /> },
    { id: "subscription", title: "Subscription & Billing", icon: <DollarSign className="w-4 h-4" /> },
    { id: "usage", title: "Acceptable Use", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "prohibited", title: "Prohibited Activities", icon: <Ban className="w-4 h-4" /> },
    { id: "intellectual", title: "Intellectual Property", icon: <Copyright className="w-4 h-4" /> },
    { id: "content", title: "User Content", icon: <FileText className="w-4 h-4" /> },
    { id: "termination", title: "Termination", icon: <UserX className="w-4 h-4" /> },
    { id: "warranties", title: "Warranties & Disclaimers", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "limitation", title: "Limitation of Liability", icon: <Shield className="w-4 h-4" /> },
    { id: "indemnification", title: "Indemnification", icon: <Scale className="w-4 h-4" /> },
    { id: "dispute", title: "Dispute Resolution", icon: <Gavel className="w-4 h-4" /> },
    { id: "general", title: "General Provisions", icon: <Globe className="w-4 h-4" /> },
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
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
            <Scale className="w-3.5 h-3.5 mr-2 inline" />
            Legal
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            These Terms of Service govern your use of WordPress AI Manager. Please read them carefully before using our service.
          </p>
          <p className="text-sm text-gray-500">
            Last Updated: December 15, 2024
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
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
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 space-y-12">
                  
                  {/* Acceptance of Terms */}
                  <div id="acceptance">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Acceptance of Terms</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        By accessing or using WordPress AI Manager ("Service," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        These Terms constitute a legally binding agreement between you and WordPress AI Manager. Your continued use of the Service signifies your acceptance of any modifications to these Terms.
                      </p>
                    </div>
                  </div>

                  {/* Service Description */}
                  <div id="description" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Service Description</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        WordPress AI Manager is a cloud-based platform that provides AI-powered content creation, SEO optimization, and WordPress management tools. Our Service includes:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>AI content generation and optimization</li>
                        <li>SEO analysis and keyword research</li>
                        <li>WordPress site integration and management</li>
                        <li>Analytics and performance tracking</li>
                        <li>API access for custom integrations</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed mt-4">
                        We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.
                      </p>
                    </div>
                  </div>

                  {/* Account Registration */}
                  <div id="registration" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Account Registration</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        To use certain features of the Service, you must create an account. You agree to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized access</li>
                      </ul>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
                        <p className="text-red-300 text-sm">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          You must be at least 18 years old to create an account and use our Service.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription & Billing */}
                  <div id="subscription" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Subscription & Billing</h3>
                    </div>
                    <div className="prose prose-invert max-w-none space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Subscription Plans</h4>
                        <p className="text-gray-300 leading-relaxed">
                          We offer multiple subscription tiers with different features and pricing. Your subscription will automatically renew at the end of each billing cycle unless cancelled.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Payment</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                          <li>All fees are charged in USD and are non-refundable except as required by law</li>
                          <li>You authorize us to charge your payment method for all fees</li>
                          <li>Prices may change with 30 days' notice</li>
                          <li>Failed payments may result in service suspension</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Cancellation</h4>
                        <p className="text-gray-300 leading-relaxed">
                          You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds will be provided for partial periods.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acceptable Use */}
                  <div id="usage" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Acceptable Use</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>In any way that violates applicable laws or regulations</li>
                        <li>To transmit harmful, offensive, or illegal content</li>
                        <li>To impersonate others or misrepresent your affiliation</li>
                        <li>To interfere with the Service's operation or security</li>
                        <li>To collect data from other users without permission</li>
                      </ul>
                    </div>
                  </div>

                  {/* Prohibited Activities */}
                  <div id="prohibited" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <Ban className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Prohibited Activities</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        The following activities are strictly prohibited:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>Reverse engineering, decompiling, or disassembling the Service</li>
                        <li>Using automated systems to access the Service without authorization</li>
                        <li>Attempting to gain unauthorized access to any systems or networks</li>
                        <li>Transmitting viruses, malware, or other malicious code</li>
                        <li>Engaging in any form of spam or unsolicited communications</li>
                        <li>Reselling or redistributing the Service without permission</li>
                        <li>Creating multiple accounts to abuse trial periods or promotions</li>
                      </ul>
                    </div>
                  </div>

                  {/* Intellectual Property */}
                  <div id="intellectual" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Copyright className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Intellectual Property Rights</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        The Service and its entire contents, features, and functionality are owned by WordPress AI Manager and are protected by copyright, trademark, and other intellectual property laws.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        You are granted a limited, non-exclusive, non-transferable license to access and use the Service for your internal business purposes. This license does not include:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                        <li>Any right to modify or create derivative works</li>
                        <li>Any right to reverse engineer the Service</li>
                        <li>Any right to use our trademarks or branding</li>
                        <li>Any resale or commercial exploitation rights</li>
                      </ul>
                    </div>
                  </div>

                  {/* User Content */}
                  <div id="content" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">User Content</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        You retain all rights to the content you create using the Service ("User Content"). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>Host, store, and process your User Content</li>
                        <li>Make your User Content available to you through the Service</li>
                        <li>Use your User Content to improve our AI models (aggregated and anonymized)</li>
                        <li>Display excerpts for marketing purposes with your permission</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed mt-4">
                        You represent and warrant that you own or have the necessary rights to your User Content and that it does not violate any third-party rights or applicable laws.
                      </p>
                    </div>
                  </div>

                  {/* Termination */}
                  <div id="termination" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <UserX className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Termination</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Upon termination:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>Your right to use the Service will immediately cease</li>
                        <li>You will lose access to your account and User Content</li>
                        <li>We may delete your data after a reasonable period</li>
                        <li>You remain liable for all charges incurred before termination</li>
                      </ul>
                    </div>
                  </div>

                  {/* Warranties & Disclaimers */}
                  <div id="warranties" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Warranties & Disclaimers</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                        <p className="text-yellow-300 text-sm font-bold uppercase mb-2">
                          Important Disclaimer
                        </p>
                        <p className="text-yellow-300 text-sm">
                          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        We do not warrant that:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                        <li>The Service will be uninterrupted, secure, or error-free</li>
                        <li>The results obtained from the Service will be accurate or reliable</li>
                        <li>The quality of any products or services will meet your expectations</li>
                        <li>Any errors in the Service will be corrected</li>
                      </ul>
                    </div>
                  </div>

                  {/* Limitation of Liability */}
                  <div id="limitation" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Limitation of Liability</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WORDPRESS AI MANAGER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Our total liability to you for all claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so these limitations may not apply to you.
                      </p>
                    </div>
                  </div>

                  {/* Indemnification */}
                  <div id="indemnification" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Scale className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Indemnification</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed mb-4">
                        You agree to indemnify, defend, and hold harmless WordPress AI Manager and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                        <li>Your use of the Service</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any rights of another party</li>
                        <li>Your User Content</li>
                      </ul>
                    </div>
                  </div>

                  {/* Dispute Resolution */}
                  <div id="dispute" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Gavel className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Dispute Resolution</h3>
                    </div>
                    <div className="prose prose-invert max-w-none space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Governing Law</h4>
                        <p className="text-gray-300 leading-relaxed">
                          These Terms are governed by the laws of the State of California, United States, without regard to its conflict of law provisions.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Arbitration</h4>
                        <p className="text-gray-300 leading-relaxed">
                          Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in San Francisco, California.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">Class Action Waiver</h4>
                        <p className="text-gray-300 leading-relaxed">
                          You agree to resolve disputes with us on an individual basis and waive any right to participate in a class action lawsuit or class-wide arbitration.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* General Provisions */}
                  <div id="general" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white">General Provisions</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <ul className="list-disc list-inside space-y-3 text-gray-300 ml-4">
                        <li><strong className="text-white">Entire Agreement:</strong> These Terms constitute the entire agreement between you and WordPress AI Manager</li>
                        <li><strong className="text-white">Severability:</strong> If any provision is found invalid, the remaining provisions will continue in effect</li>
                        <li><strong className="text-white">Waiver:</strong> Our failure to enforce any right does not constitute a waiver</li>
                        <li><strong className="text-white">Assignment:</strong> You may not assign these Terms without our consent</li>
                        <li><strong className="text-white">Changes:</strong> We may modify these Terms at any time with notice</li>
                        <li><strong className="text-white">Contact:</strong> Questions about these Terms should be sent to legal@wpaimanager.com</li>
                      </ul>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
                        <p className="text-blue-300 text-sm">
                          <Info className="w-4 h-4 inline mr-2" />
                          By using WordPress AI Manager, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
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

export default TermsOfService;