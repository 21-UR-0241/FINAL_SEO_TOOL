import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Target,
  Heart,
  Users,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Award,
  Lightbulb,
  Rocket,
  CheckCircle2,
  Mail,
  Linkedin,
  Twitter,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export function About(): JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats: Stat[] = [
    { value: "2024", label: "Founded", icon: <Rocket className="w-5 h-5" /> },
    { value: "10K+", label: "Active Users", icon: <Users className="w-5 h-5" /> },
    { value: "500K+", label: "Articles Created", icon: <Sparkles className="w-5 h-5" /> },
    { value: "50+", label: "Countries", icon: <Globe className="w-5 h-5" /> },
  ];

  const values: Value[] = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation First",
      description: "We constantly push boundaries to deliver cutting-edge AI solutions",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User-Centric",
      description: "Every feature is designed with our users' success in mind",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trust & Security",
      description: "Your data security and privacy are our top priorities",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Passion for Quality",
      description: "We're committed to delivering excellence in everything we do",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Continuous Growth",
      description: "We believe in constant improvement and learning",
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Impact",
      description: "Empowering content creators worldwide to achieve more",
      gradient: "from-teal-500 to-cyan-600"
    }
  ];

  const team: TeamMember[] = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      image: "SC",
      bio: "10+ years in AI and content technology",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "sarah@wpaimanager.com"
      }
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      image: "MR",
      bio: "Former Lead Engineer at Tech Giants",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "marcus@wpaimanager.com"
      }
    },
    {
      name: "Emily Watson",
      role: "Head of Product",
      image: "EW",
      bio: "Product strategy expert with startup experience",
      social: {
        linkedin: "#",
        email: "emily@wpaimanager.com"
      }
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      image: "DK",
      bio: "Full-stack developer passionate about AI",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "david@wpaimanager.com"
      }
    },
    {
      name: "Lisa Anderson",
      role: "Head of Marketing",
      image: "LA",
      bio: "Growth marketing specialist",
      social: {
        linkedin: "#",
        email: "lisa@wpaimanager.com"
      }
    },
    {
      name: "James Taylor",
      role: "Head of Customer Success",
      image: "JT",
      bio: "Dedicated to user happiness and success",
      social: {
        linkedin: "#",
        email: "james@wpaimanager.com"
      }
    }
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
            <Heart className="w-3.5 h-3.5 mr-2 inline" />
            About Us
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Empowering Creators
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              with AI Innovation
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            We're on a mission to revolutionize content creation by making advanced AI
            technology accessible to everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 text-center">
                  <div className="text-blue-400 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
                Our Mission
              </Badge>
              <h3 className="text-4xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Making AI Accessible for Everyone
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Founded in 2024, WordPress AI Manager was born from a simple belief: advanced AI
                technology shouldn't be reserved for tech giants. Every content creator, marketer,
                and business owner deserves access to powerful tools that can transform their work.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our team of AI experts, developers, and content professionals came together with
                a shared vision—to build a platform that combines cutting-edge artificial intelligence
                with user-friendly design, making content creation effortless and enjoyable.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/features">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Explore Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Our Vision</h4>
                      <p className="text-gray-400 text-sm">
                        To become the world's most trusted AI-powered content creation platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Our Goal</h4>
                      <p className="text-gray-400 text-sm">
                        Help 1 million creators produce better content faster
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Our Commitment</h4>
                      <p className="text-gray-400 text-sm">
                        Continuous innovation and unwavering support for our community
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              Our Values
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Drives Us
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <div className="text-white">{value.icon}</div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 text-sm font-semibold">
              Our Team
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Meet the People Behind the Product
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A diverse team of experts passionate about AI and content creation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white shadow-lg">
                    {member.image}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                  <p className="text-blue-400 text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-4">{member.bio}</p>
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-gray-400 hover:text-white" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-gray-400 hover:text-white" />
                      </a>
                    )}
                    {member.social.email && (
                      <a
                        href={`mailto:${member.social.email}`}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <Mail className="w-4 h-4 text-gray-400 hover:text-white" />
                      </a>
                    )}
                  </div>
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
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Join Our Journey
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Transform Your Content?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who trust WordPress AI Manager
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/subscription">
                    <Button
                      size="lg"
                      className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl text-base font-bold px-8 py-6"
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

export default About;