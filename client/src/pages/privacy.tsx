
import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Lock,
  Eye,
  FileText,
  Users,
  Globe,
  Database,
  Settings,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export function PrivacyPolicy(): JSX.Element {
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
    { id: "introduction", title: "Introduction", icon: <Info className="w-4 h-4" /> },
    { id: "information", title: "Information We Collect", icon: <Database className="w-4 h-4" /> },
    { id: "usage", title: "How We Use Information", icon: <Settings className="w-4 h-4" /> },
    { id: "sharing", title: "Information Sharing", icon: <Users className="w-4 h-4" /> },
    { id: "security", title: "Data Security", icon: <Shield className="w-4 h-4" /> },
    { id: "cookies", title: "Cookies & Tracking", icon: <Eye className="w-4 h-4" /> },
    { id: "rights", title: "Your Rights", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "retention", title: "Data Retention", icon: <Calendar className="w-4 h-4" /> },
    { id: "international", title: "International Transfers", icon: <Globe className="w-4 h-4" /> },
    { id: "children", title: "Children's Privacy", icon: <AlertCircle className="w-4 h-4" /> },
    { id: "updates", title: "Policy Updates", icon: <FileText className="w-4 h-4" /> },
    { id: "contact", title: "Contact Us", icon: <Users className="w-4 h-4" /> },
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
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
            <Shield className="w-3.5 h-3.5 mr-2 inline" />
            Legal
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed px-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
                  
                  {/* Introduction */}
                  <div id="introduction">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Introduction</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Welcome to WordPress AI Manager ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        By using WordPress AI Manager, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
                      </p>
                    </div>
                  </div>

                  {/* Information We Collect */}
                  <div id="information" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Information We Collect</h3>
                    </div>
                    <div className="prose prose-invert max-w-none space-y-4">
                      <div>
                        <h4 className="text-base md:text-lg font-bold text-white mb-2">Personal Information</h4>
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-2">
                          We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-gray-300 ml-4">
                          <li>Name and email address</li>
                          <li>Account credentials</li>
                          <li>Payment information</li>
                          <li>WordPress site URLs and connection details</li>
                          <li>Content you create using our service</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-base md:text-lg font-bold text-white mb-2">Automatically Collected Information</h4>
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-2">
                          When you use our service, we automatically collect certain information:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-gray-300 ml-4">
                          <li>IP address and device information</li>
                          <li>Browser type and version</li>
                          <li>Usage data and analytics</li>
                          <li>Cookies and similar tracking technologies</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* How We Use Information */}
                  <div id="usage" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">How We Use Information</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We use the collected information for various purposes:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li>To provide, maintain, and improve our services</li>
                        <li>To process your transactions and manage your account</li>
                        <li>To send you technical notices and support messages</li>
                        <li>To respond to your inquiries and provide customer support</li>
                        <li>To personalize your experience and deliver relevant content</li>
                        <li>To monitor and analyze usage patterns and trends</li>
                        <li>To detect, prevent, and address technical issues and security threats</li>
                        <li>To comply with legal obligations and enforce our terms</li>
                      </ul>
                    </div>
                  </div>

                  {/* Information Sharing */}
                  <div id="sharing" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Information Sharing</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We do not sell your personal information. We may share your information in the following circumstances:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li><strong className="text-white">Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
                        <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
                        <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</li>
                        <li><strong className="text-white">With Your Consent:</strong> When you have given us explicit permission</li>
                      </ul>
                    </div>
                  </div>

                  {/* Data Security */}
                  <div id="security" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Data Security</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We implement industry-standard security measures to protect your information:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security audits and assessments</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Secure data centers with physical security measures</li>
                        <li>Employee training on data protection practices</li>
                      </ul>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-4">
                        <p className="text-yellow-300 text-xs md:text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cookies & Tracking */}
                  <div id="cookies" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Cookies & Tracking Technologies</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                      </p>
                      <div>
                        <h4 className="text-base md:text-lg font-bold text-white mb-2">Types of Cookies We Use:</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                          <li><strong className="text-white">Essential Cookies:</strong> Required for the service to function</li>
                          <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how users interact with our service</li>
                          <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
                          <li><strong className="text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Your Rights */}
                  <div id="rights" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Your Privacy Rights</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Depending on your location, you may have certain rights regarding your personal information:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 ml-4">
                        <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
                        <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                        <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
                        <li><strong className="text-white">Portability:</strong> Request transfer of your data to another service</li>
                        <li><strong className="text-white">Objection:</strong> Object to processing of your information</li>
                        <li><strong className="text-white">Withdraw Consent:</strong> Withdraw consent where we rely on it</li>
                      </ul>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mt-4">
                        To exercise these rights, please contact us at <a href="mailto:privacy@wpaimanager.com" className="text-blue-400 hover:text-blue-300 break-words">privacy@wpaimanager.com</a>
                      </p>
                    </div>
                  </div>

                  {/* Data Retention */}
                  <div id="retention" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Data Retention</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        When we no longer need your information, we will securely delete or anonymize it. Some information may be retained in backup systems for a limited period as part of our disaster recovery procedures.
                      </p>
                    </div>
                  </div>

                  {/* International Transfers */}
                  <div id="international" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">International Data Transfers</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        We take steps to ensure that your data is treated securely and in accordance with this Privacy Policy. We use standard contractual clauses and other safeguards to protect your information during international transfers.
                      </p>
                    </div>
                  </div>

                  {/* Children's Privacy */}
                  <div id="children" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Children's Privacy</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        If you are a parent or guardian and you believe your child has provided us with personal information, please contact us. If we become aware that we have collected information from children without parental consent, we will take steps to remove that information.
                      </p>
                    </div>
                  </div>

                  {/* Policy Updates */}
                  <div id="updates" className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white">Changes to This Privacy Policy</h3>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4">
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                      </p>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                        For significant changes, we will provide more prominent notice, including email notification or a notice through our service. We encourage you to review this Privacy Policy periodically for any changes.
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
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                      </p>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 space-y-3">
                        <div className="flex items-start gap-3">
                          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
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

export default PrivacyPolicy;