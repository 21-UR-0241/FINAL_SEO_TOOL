
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Code,
  Zap,
  Target,
  MessageSquare,
  Eye,
  Heart,
  Share2,
  X,
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  views: string;
  likes: string;
  featured?: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export function Blog(): JSX.Element {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "The Future of AI-Powered Content Creation in 2024",
      excerpt: "Explore how artificial intelligence is revolutionizing the way we create, optimize, and distribute content across digital platforms.",
      category: "ai",
      author: "Sarah Chen",
      authorImage: "SC",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      image: "🤖",
      tags: ["AI", "Content", "Future"],
      views: "2.3K",
      likes: "145",
      featured: true
    },
    {
      id: 2,
      title: "10 SEO Strategies That Actually Work in 2024",
      excerpt: "Discover proven SEO techniques that help your content rank higher and drive organic traffic to your website.",
      category: "seo",
      author: "Marcus Rodriguez",
      authorImage: "MR",
      date: "Dec 12, 2024",
      readTime: "6 min read",
      image: "📈",
      tags: ["SEO", "Marketing", "Strategy"],
      views: "3.1K",
      likes: "203",
      featured: true
    },
    {
      id: 3,
      title: "Getting Started with WordPress AI Manager",
      excerpt: "A comprehensive guide to setting up and using WordPress AI Manager to streamline your content creation workflow.",
      category: "tutorials",
      author: "Emily Watson",
      authorImage: "EW",
      date: "Dec 10, 2024",
      readTime: "10 min read",
      image: "🚀",
      tags: ["Tutorial", "WordPress", "Guide"],
      views: "1.8K",
      likes: "92"
    },
    {
      id: 4,
      title: "Content Marketing Trends to Watch This Year",
      excerpt: "Stay ahead of the curve with these emerging content marketing trends that will shape the industry.",
      category: "content",
      author: "David Kim",
      authorImage: "DK",
      date: "Dec 8, 2024",
      readTime: "7 min read",
      image: "📊",
      tags: ["Marketing", "Trends", "Strategy"],
      views: "2.7K",
      likes: "178"
    },
    {
      id: 5,
      title: "How to Write Converting Product Descriptions with AI",
      excerpt: "Learn the art and science of crafting product descriptions that convert visitors into customers using AI assistance.",
      category: "ai",
      author: "Lisa Anderson",
      authorImage: "LA",
      date: "Dec 5, 2024",
      readTime: "5 min read",
      image: "✍️",
      tags: ["AI", "eCommerce", "Copywriting"],
      views: "1.5K",
      likes: "87"
    },
    {
      id: 6,
      title: "The Complete Guide to Keyword Research",
      excerpt: "Master keyword research with our step-by-step guide to finding high-value keywords for your content.",
      category: "seo",
      author: "James Taylor",
      authorImage: "JT",
      date: "Dec 3, 2024",
      readTime: "12 min read",
      image: "🔍",
      tags: ["SEO", "Keywords", "Research"],
      views: "2.9K",
      likes: "156"
    },
    {
      id: 7,
      title: "Building a Content Calendar That Works",
      excerpt: "Create and maintain an effective content calendar that keeps your team organized and productive.",
      category: "content",
      author: "Sarah Chen",
      authorImage: "SC",
      date: "Nov 30, 2024",
      readTime: "6 min read",
      image: "📅",
      tags: ["Planning", "Organization", "Strategy"],
      views: "1.2K",
      likes: "64"
    },
    {
      id: 8,
      title: "AI vs Human Writers: Finding the Perfect Balance",
      excerpt: "Explore how to combine AI efficiency with human creativity for optimal content creation results.",
      category: "ai",
      author: "Marcus Rodriguez",
      authorImage: "MR",
      date: "Nov 28, 2024",
      readTime: "9 min read",
      image: "⚖️",
      tags: ["AI", "Writing", "Balance"],
      views: "3.5K",
      likes: "234"
    },
    {
      id: 9,
      title: "Advanced WordPress Customization Tips",
      excerpt: "Take your WordPress site to the next level with these advanced customization techniques and best practices.",
      category: "tutorials",
      author: "Emily Watson",
      authorImage: "EW",
      date: "Nov 25, 2024",
      readTime: "11 min read",
      image: "🛠️",
      tags: ["WordPress", "Development", "Tips"],
      views: "1.9K",
      likes: "98"
    },
    {
      id: 10,
      title: "Content Distribution Strategies That Scale",
      excerpt: "Learn how to effectively distribute your content across multiple channels to maximize reach and engagement.",
      category: "content",
      author: "David Kim",
      authorImage: "DK",
      date: "Nov 22, 2024",
      readTime: "8 min read",
      image: "🌐",
      tags: ["Distribution", "Marketing", "Growth"],
      views: "2.1K",
      likes: "112"
    },
    {
      id: 11,
      title: "Understanding Google's Latest Algorithm Updates",
      excerpt: "Stay informed about recent Google algorithm changes and how they affect your SEO strategy.",
      category: "seo",
      author: "Lisa Anderson",
      authorImage: "LA",
      date: "Nov 20, 2024",
      readTime: "7 min read",
      image: "🔄",
      tags: ["Google", "Algorithm", "SEO"],
      views: "2.8K",
      likes: "167"
    },
    {
      id: 12,
      title: "Creating Engaging Social Media Content",
      excerpt: "Discover the secrets to creating social media content that captures attention and drives engagement.",
      category: "content",
      author: "James Taylor",
      authorImage: "JT",
      date: "Nov 18, 2024",
      readTime: "5 min read",
      image: "📱",
      tags: ["Social Media", "Engagement", "Content"],
      views: "1.7K",
      likes: "95"
    }
  ];

  // Calculate dynamic category counts based on actual posts
  const categories: Category[] = useMemo(() => {
    const aiCount = blogPosts.filter(post => post.category === "ai").length;
    const contentCount = blogPosts.filter(post => post.category === "content").length;
    const seoCount = blogPosts.filter(post => post.category === "seo").length;
    const tutorialsCount = blogPosts.filter(post => post.category === "tutorials").length;
    const allCount = blogPosts.length;

    return [
      { id: "all", label: "All Posts", icon: <BookOpen className="w-4 h-4" />, count: allCount },
      { id: "ai", label: "AI & Technology", icon: <Zap className="w-4 h-4" />, count: aiCount },
      { id: "content", label: "Content Strategy", icon: <Lightbulb className="w-4 h-4" />, count: contentCount },
      { id: "seo", label: "SEO Tips", icon: <TrendingUp className="w-4 h-4" />, count: seoCount },
      { id: "tutorials", label: "Tutorials", icon: <Code className="w-4 h-4" />, count: tutorialsCount },
    ];
  }, [blogPosts]);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  // Clear search function
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle search submission (optional - since it's real-time)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already happening in real-time via filteredPosts
    // This is just to prevent form submission if wrapped in a form
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
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
            <BookOpen className="w-3.5 h-3.5 mr-2 inline" />
            Insights & Resources
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              WordPress AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Manager Blog
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Tips, tutorials, and insights to help you master AI-powered content creation
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-white placeholder-gray-500 px-2 py-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Search Results Count */}
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-4">
              Found {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} matching "{searchQuery}"
            </p>
          )}
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !searchQuery && (
        <section className="relative z-10 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Featured Articles</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                    <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 border">
                      Featured
                    </Badge>
                    <div className="text-6xl mb-6">{post.image}</div>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-blue-500/20 text-blue-300 border-0">
                        {categories.find(c => c.id === post.category)?.label}
                      </Badge>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {post.authorImage}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{post.author}</div>
                          <div className="text-xs text-gray-400">{post.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
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

          {/* Blog Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                    {/* Post Image/Emoji */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 text-center">
                      <div className="text-6xl">{post.image}</div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                          {categories.find(c => c.id === post.category)?.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>

                      <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h4>

                      <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-white/5 rounded-lg text-gray-400 border border-white/10"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {post.authorImage}
                          </div>
                          <div className="text-xs">
                            <div className="text-white font-medium">{post.author}</div>
                            <div className="text-gray-400">{post.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No Results Message
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No articles found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or filter to find what you're looking for
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Stay Updated
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Subscribe to Our Newsletter
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Get the latest articles, tips, and insights delivered straight to your inbox
                </p>
                <div className="max-w-md mx-auto flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 outline-none focus:border-white/40 transition-colors"
                  />
                  <Button className="bg-white text-blue-700 hover:bg-gray-100 font-bold px-6">
                    Subscribe
                  </Button>
                </div>
                <p className="text-sm text-blue-100 mt-4">
                  ✓ Weekly insights • ✓ Exclusive content • ✓ Unsubscribe anytime
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
                  <Link href="/blog">
                    <a className="text-sm text-gray-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </Link>
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

export default Blog;