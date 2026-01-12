
// import React, { useState, useEffect } from "react";
// import { Link } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   ArrowRight,
//   Sparkles,
//   Zap,
//   Shield,
//   Users,
//   CheckCircle2,
//   Award,
//   ChevronRight,
//   X,
//   HelpCircle,
//   Star,
//   FileText,
//   BarChart3,
//   RefreshCw,
// } from "lucide-react";

// type BillingCycle = "monthly" | "annual";

// interface PlanFeature {
//   text: string;
//   included: boolean;
// }

// interface Plan {
//   name: string;
//   description: string;
//   monthlyPrice: number;
//   annualPrice: number;
//   popular: boolean;
//   gradient: string;
//   features: PlanFeature[];
// }

// interface ComparisonCategory {
//   category: string;
//   features: ComparisonFeature[];
// }

// interface ComparisonFeature {
//   name: string;
//   starter: boolean | string;
//   pro: boolean | string;
//   enterprise: boolean | string;
// }

// interface FAQ {
//   question: string;
//   answer: string;
// }

// export function Pricing(): JSX.Element {
//   const [scrolled, setScrolled] = useState(false);
//   const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const plans: Plan[] = [
//     {
//       name: "Starter",
//       description: "Perfect for bloggers and small sites",
//       monthlyPrice: 0,
//       annualPrice: 0,
//       popular: false,
//       gradient: "from-gray-500 to-gray-600",
//       features: [
//         { text: "1 WordPress site", included: true },
//         { text: "20 AI content optimizations/month", included: true },
//         { text: "Readability improvements", included: true },
//         { text: "Basic SEO analysis", included: true },
//         { text: "Content health checks", included: true },
//         { text: "Manual content fixes", included: true },
//         { text: "Email support", included: true },
//         { text: "Advanced analytics dashboard", included: false },
//         { text: "Automated content fixes", included: false },
//         { text: "Bulk operations", included: false },
//         { text: "Custom AI prompts", included: false },
//         { text: "API access", included: false },
//       ],
//     },
//     {
//       name: "Professional",
//       description: "For serious content creators and marketers",
//       monthlyPrice: 49,
//       annualPrice: 490,
//       popular: true,
//       gradient: "from-blue-600 to-purple-600",
//       features: [
//         { text: "Up to 5 WordPress sites", included: true },
//         { text: "200 AI optimizations/month", included: true },
//         { text: "Advanced readability improvements", included: true },
//         { text: "Advanced SEO analysis & suggestions", included: true },
//         { text: "Automated content health monitoring", included: true },
//         { text: "Automated content fixes (AI-powered)", included: true },
//         { text: "Bulk content operations", included: true },
//         { text: "Advanced analytics dashboard", included: true },
//         { text: "Custom AI optimization prompts", included: true },
//         { text: "Content performance tracking", included: true },
//         { text: "Priority email support", included: true },
//         { text: "API access (5,000 calls/month)", included: true },
//       ],
//     },
//     {
//       name: "Enterprise",
//       description: "For agencies and large-scale operations",
//       monthlyPrice: 199,
//       annualPrice: 1990,
//       popular: false,
//       gradient: "from-purple-600 to-pink-600",
//       features: [
//         { text: "Unlimited WordPress sites", included: true },
//         { text: "Unlimited AI optimizations", included: true },
//         { text: "White-label dashboard", included: true },
//         { text: "Custom AI model fine-tuning", included: true },
//         { text: "Advanced automation workflows", included: true },
//         { text: "Multi-site bulk operations", included: true },
//         { text: "Team collaboration tools", included: true },
//         { text: "Dedicated account manager", included: true },
//         { text: "Custom integrations", included: true },
//         { text: "Unlimited API access", included: true },
//         { text: "24/7 priority support", included: true },
//         { text: "SLA guarantee (99.9% uptime)", included: true },
//       ],
//     },
//   ];

//   const comparisonFeatures: ComparisonCategory[] = [
//     {
//       category: "WordPress Management",
//       features: [
//         { name: "WordPress sites", starter: "1", pro: "5", enterprise: "Unlimited" },
//         { name: "Content health monitoring", starter: "Manual", pro: "Automated", enterprise: "Real-time" },
//         { name: "Bulk operations", starter: false, pro: true, enterprise: true },
//         { name: "Multi-site dashboard", starter: false, pro: true, enterprise: true },
//       ],
//     },
//     {
//       category: "AI Content Optimization",
//       features: [
//         { name: "AI optimizations/month", starter: "20", pro: "200", enterprise: "Unlimited" },
//         { name: "Readability improvements", starter: true, pro: true, enterprise: true },
//         { name: "Automated content fixes", starter: false, pro: true, enterprise: true },
//         { name: "Custom AI prompts", starter: false, pro: true, enterprise: true },
//         { name: "AI model fine-tuning", starter: false, pro: false, enterprise: true },
//       ],
//     },
//     {
//       category: "SEO & Analytics",
//       features: [
//         { name: "SEO analysis", starter: "Basic", pro: "Advanced", enterprise: "Enterprise" },
//         { name: "SEO recommendations", starter: "Manual", pro: "Automated", enterprise: "AI-powered" },
//         { name: "Content performance tracking", starter: false, pro: true, enterprise: true },
//         { name: "Advanced analytics", starter: false, pro: true, enterprise: true },
//         { name: "Custom reporting", starter: false, pro: false, enterprise: true },
//       ],
//     },
//     {
//       category: "Automation & Integration",
//       features: [
//         { name: "Automated workflows", starter: false, pro: "Basic", enterprise: "Advanced" },
//         { name: "API access", starter: false, pro: "5K calls/mo", enterprise: "Unlimited" },
//         { name: "Custom integrations", starter: false, pro: false, enterprise: true },
//         { name: "Webhooks", starter: false, pro: true, enterprise: true },
//       ],
//     },
//     {
//       category: "Team & Support",
//       features: [
//         { name: "Team members", starter: "1", pro: "5", enterprise: "Unlimited" },
//         { name: "White-label options", starter: false, pro: false, enterprise: true },
//         { name: "Email support", starter: true, pro: true, enterprise: true },
//         { name: "Priority support", starter: false, pro: true, enterprise: true },
//         { name: "Dedicated manager", starter: false, pro: false, enterprise: true },
//         { name: "SLA guarantee", starter: false, pro: false, enterprise: "99.9%" },
//       ],
//     },
//   ];

//   const faqs: FAQ[] = [
//     {
//       question: "What counts as an AI optimization?",
//       answer: "Each AI optimization includes one action: improving readability, fixing content issues, SEO optimization, or content enhancement for a single post/page. Bulk operations count as one optimization per item.",
//     },
//     {
//       question: "Can I upgrade or downgrade my plan?",
//       answer: "Yes! You can change plans anytime. Upgrades take effect immediately, and we'll prorate the difference. Downgrades take effect at the next billing cycle.",
//     },
//     {
//       question: "What happens if I exceed my monthly AI optimization limit?",
//       answer: "On the Starter plan, you'll need to upgrade or wait until next month. Professional users can purchase additional optimization packs. Enterprise plans have unlimited optimizations.",
//     },
//     {
//       question: "Do you offer a free trial?",
//       answer: "Yes! All paid plans include a 14-day free trial with full access to features. No credit card required to start your trial.",
//     },
//     {
//       question: "How does the WordPress site limit work?",
//       answer: "You can connect up to the number of WordPress sites allowed by your plan. Each site can be managed independently with its own settings and optimization queue.",
//     },
//     {
//       question: "What AI models do you use?",
//       answer: "We use state-of-the-art language models (including GPT-4, Claude, and Gemini) optimized for content quality, readability, and SEO. Enterprise plans can fine-tune models for their specific needs.",
//     },
//     {
//       question: "Is my WordPress content secure?",
//       answer: "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. We never store your WordPress credentials, only secure API tokens. Your content is processed securely and never used for AI training.",
//     },
//     {
//       question: "Can I cancel anytime?",
//       answer: "Yes, you can cancel your subscription at any time with no penalties. Your account remains active until the end of your billing period, and we offer a 30-day money-back guarantee.",
//     },
//   ];

//   const getSavingsPercent = () => {
//     return Math.round(((12 - 10) / 12) * 100);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
//       {/* Animated Background */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
//       </div>

//       {/* Navigation */}
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           scrolled
//             ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg"
//             : "bg-transparent"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <Link href="/">
//               <div className="flex items-center space-x-3 group cursor-pointer">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
//                   <div className="relative p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
//                     <Sparkles className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
//                     WordPress AI Manager
//                   </h1>
//                   <p className="text-xs text-gray-400 font-medium">Powered by Advanced AI</p>
//                 </div>
//               </div>
//             </Link>
//             <div className="flex items-center space-x-6">
//               <Link href="/">
//                 <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
//                   Home
//                 </a>
//               </Link>
//               <Link href="/features">
//                 <a className="text-sm text-gray-300 hover:text-white transition-colors hidden md:block font-medium">
//                   Features
//                 </a>
//               </Link>
//               <Link href="/pricing">
//                 <a className="text-sm text-white transition-colors hidden md:block font-medium">
//                   Pricing
//                 </a>
//               </Link>
//               <Link href="/subscription">
//                 <Button 
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
//                 >
//                   Get Started Free
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative z-10 pt-32 pb-16 px-6">
//         <div className="max-w-7xl mx-auto text-center">
//           <Badge className="mb-6 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
//             <Award className="w-3.5 h-3.5 mr-2 inline" />
//             Simple, Transparent Pricing
//           </Badge>
//           <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
//             <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
//               Choose Your Perfect
//             </span>
//             <br />
//             <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//               Plan
//             </span>
//           </h2>
//           <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
//             Start with a 14-day free trial. No credit card required. Cancel anytime.
//           </p>

//           {/* Billing Toggle */}
//           <div className="flex items-center justify-center gap-4 mb-12">
//             <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
//               Monthly
//             </span>
//             <button
//               onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
//               className="relative w-14 h-7 bg-white/10 rounded-full transition-colors hover:bg-white/20"
//             >
//               <div
//                 className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-transform ${
//                   billingCycle === "annual" ? "translate-x-7" : ""
//                 }`}
//               />
//             </button>
//             <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-white" : "text-gray-400"}`}>
//               Annual
//             </span>
//             {billingCycle === "annual" && (
//               <Badge className="bg-green-500/10 text-green-300 border border-green-500/20 text-xs">
//                 Save {getSavingsPercent()}%
//               </Badge>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Cards */}
//       <section className="relative z-10 pb-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-3 gap-8">
//             {plans.map((plan, index) => (
//               <div
//                 key={index}
//                 className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}
//                 style={{ animationDelay: `${index * 100}ms` }}
//               >
//                 {plan.popular && (
//                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
//                     <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg">
//                       <Star className="w-3.5 h-3.5 mr-1 inline" />
//                       Most Popular
//                     </Badge>
//                   </div>
//                 )}
//                 <div
//                   className={`absolute inset-0 bg-gradient-to-r ${
//                     plan.popular ? "from-blue-500/20 to-purple-500/20 blur-2xl" : "from-blue-500/10 to-purple-500/10 blur-xl"
//                   } rounded-3xl group-hover:blur-2xl transition-all`}
//                 ></div>
//                 <div
//                   className={`relative ${
//                     plan.popular
//                       ? "bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20"
//                       : "bg-white/5 border border-white/10"
//                   } backdrop-blur-sm rounded-3xl p-8 hover:border-white/20 transition-all duration-300 h-full flex flex-col`}
//                 >
//                   <div className="mb-6">
//                     <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
//                     <p className="text-gray-400 text-sm">{plan.description}</p>
//                   </div>

//                   <div className="mb-8">
//                     <div className="flex items-baseline gap-2">
//                       <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                         ${billingCycle === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)}
//                       </span>
//                       <span className="text-gray-400">/month</span>
//                     </div>
//                     {billingCycle === "annual" && plan.annualPrice > 0 && (
//                       <p className="text-sm text-gray-500 mt-2">
//                         Billed ${plan.annualPrice} annually
//                       </p>
//                     )}
//                   </div>

//                   <Link href="/subscription" className="mb-8">
//                     <Button
//                       className={`w-full ${
//                         plan.popular
//                           ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                           : "bg-white/10 hover:bg-white/20"
//                       } text-white shadow-lg transition-all duration-300 text-base font-bold py-6 group`}
//                     >
//                       {plan.monthlyPrice === 0 ? "Get Started Free" : "Start Free Trial"}
//                       <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
//                     </Button>
//                   </Link>

//                   <div className="space-y-3 flex-1">
//                     {plan.features.map((feature, idx) => (
//                       <div key={idx} className="flex items-start gap-3">
//                         {feature.included ? (
//                           <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
//                         ) : (
//                           <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
//                         )}
//                         <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
//                           {feature.text}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Value Props Section */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//               <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
//                   <FileText className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-3">AI-Powered Content Optimization</h3>
//                 <p className="text-gray-400 leading-relaxed">
//                   Automatically improve readability, fix content issues, and optimize for SEO using advanced AI models.
//                 </p>
//               </div>
//             </div>

//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//               <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
//                 <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
//                   <BarChart3 className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
//                 <p className="text-gray-400 leading-relaxed">
//                   Track content performance, monitor health scores, and get actionable insights to improve your WordPress content.
//                 </p>
//               </div>
//             </div>

//             <div className="relative group">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
//               <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
//                   <RefreshCw className="w-6 h-6 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-3">Automated Workflows</h3>
//                 <p className="text-gray-400 leading-relaxed">
//                   Set up automated content improvements, bulk operations, and scheduled optimizations to save time.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Detailed Comparison */}
//       <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
//               Detailed Comparison
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               Compare All Features
//             </h3>
//             <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//               See exactly what's included in each plan
//             </p>
//           </div>

//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
//             <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-white/10">
//                       <th className="text-left p-6 text-gray-400 font-semibold">Features</th>
//                       <th className="text-center p-6">
//                         <div className="text-white font-bold">Starter</div>
//                       </th>
//                       <th className="text-center p-6">
//                         <div className="text-white font-bold">Professional</div>
//                       </th>
//                       <th className="text-center p-6">
//                         <div className="text-white font-bold">Enterprise</div>
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {comparisonFeatures.map((category, catIndex) => (
//                       <React.Fragment key={catIndex}>
//                         <tr className="bg-white/[0.02]">
//                           <td colSpan={4} className="p-4 text-blue-300 font-bold text-sm uppercase tracking-wider">
//                             {category.category}
//                           </td>
//                         </tr>
//                         {category.features.map((feature, featIndex) => (
//                           <tr
//                             key={featIndex}
//                             className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
//                           >
//                             <td className="p-6 text-gray-300">{feature.name}</td>
//                             <td className="p-6 text-center">
//                               {typeof feature.starter === "boolean" ? (
//                                 feature.starter ? (
//                                   <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
//                                 ) : (
//                                   <X className="w-5 h-5 text-gray-600 mx-auto" />
//                                 )
//                               ) : (
//                                 <span className="text-gray-300">{feature.starter}</span>
//                               )}
//                             </td>
//                             <td className="p-6 text-center">
//                               {typeof feature.pro === "boolean" ? (
//                                 feature.pro ? (
//                                   <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
//                                 ) : (
//                                   <X className="w-5 h-5 text-gray-600 mx-auto" />
//                                 )
//                               ) : (
//                                 <span className="text-gray-300">{feature.pro}</span>
//                               )}
//                             </td>
//                             <td className="p-6 text-center">
//                               {typeof feature.enterprise === "boolean" ? (
//                                 feature.enterprise ? (
//                                   <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
//                                 ) : (
//                                   <X className="w-5 h-5 text-gray-600 mx-auto" />
//                                 )
//                               ) : (
//                                 <span className="text-gray-300">{feature.enterprise}</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQs */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-16">
//             <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
//               FAQs
//             </Badge>
//             <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//               Frequently Asked Questions
//             </h3>
//             <p className="text-lg text-gray-400">
//               Everything you need to know about our pricing
//             </p>
//           </div>

//           <div className="space-y-4">
//             {faqs.map((faq, index) => (
//               <div
//                 key={index}
//                 className="group relative"
//                 style={{ animationDelay: `${index * 50}ms` }}
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
//                 <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
//                   <div className="flex items-start gap-4">
//                     <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
//                     <div>
//                       <h4 className="text-lg font-bold text-white mb-2">{faq.question}</h4>
//                       <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-12 text-center">
//             <p className="text-gray-400 mb-4">Still have questions?</p>
//             <Button
//               className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
//             >
//               Contact Support
//               <ChevronRight className="w-4 h-4 ml-2" />
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="relative z-10 py-20 px-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
//             <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
//               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
//               <div className="relative z-10">
//                 <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
//                   <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
//                   Start Your Free Trial Today
//                 </Badge>
//                 <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
//                   Ready to Optimize Your Content?
//                 </h3>
//                 <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
//                   Join content creators using AI to improve their WordPress sites
//                 </p>
//                 <Link href="/subscription">
//                   <Button
//                     size="lg"
//                     className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
//                   >
//                     Start 14-Day Free Trial
//                     <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
//                   </Button>
//                 </Link>
//                 <p className="text-sm text-blue-100 mt-6">
//                   ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Trust Badges */}
//       <section className="relative z-10 pb-20 px-6">
//         <div className="max-w-5xl mx-auto">
//           <div className="grid md:grid-cols-3 gap-6">
//             {[
//               { icon: <Shield />, text: "30-day money-back guarantee" },
//               { icon: <Zap />, text: "Instant setup, no installation" },
//               { icon: <Users />, text: "Enterprise-grade security" },
//             ].map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center gap-3 text-gray-400 justify-center"
//               >
//                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
//                   {item.icon}
//                 </div>
//                 <span className="text-sm font-medium">{item.text}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-12 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-4 gap-12 mb-12">
//             <div>
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
//                   <Sparkles className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-white">WordPress AI Manager</h4>
//                   <p className="text-xs text-gray-400">Powered by AI</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-400 leading-relaxed">
//                 AI-powered content optimization for WordPress sites.
//               </p>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Product</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <Link href="/features">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Features
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/pricing">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Pricing
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/apidocs">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       API Docs
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/integrations">
//                     <a className="text-sm text-gray-400 hover:text-white transition-colors">
//                       Integrations
//                     </a>
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Company</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <a href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     About
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Blog
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Contact
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h5 className="font-bold text-white mb-4">Legal</h5>
//               <ul className="space-y-2">
//                 <li>
//                   <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Privacy Policy
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Terms of Service
//                   </a>
//                 </li>
//                 <li>
//                   <a href="/cookie" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Cookie Policy
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
//             <p className="text-sm text-gray-400">
//               © 2024 WordPress AI Manager. All rights reserved.
//             </p>
//           </div>
//         </div>
//       </footer>

//       {/* Add custom animations */}
//       <style>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out forwards;
//           opacity: 0;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           * {
//             animation-duration: 0.01ms !important;
//             animation-iteration-count: 1 !important;
//             transition-duration: 0.01ms !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Pricing;



import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  CheckCircle2,
  Award,
  ChevronRight,
  X,
  HelpCircle,
  Star,
  FileText,
  BarChart3,
  RefreshCw,
} from "lucide-react";

type BillingCycle = "monthly" | "annual";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular: boolean;
  gradient: string;
  features: PlanFeature[];
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

interface ComparisonFeature {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface FAQ {
  question: string;
  answer: string;
}

export function Pricing(): JSX.Element {
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans: Plan[] = [
    {
      name: "Starter",
      description: "Perfect for bloggers and small sites",
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      gradient: "from-gray-500 to-gray-600",
      features: [
        { text: "1 WordPress site", included: true },
        { text: "20 AI content optimizations/month", included: true },
        { text: "Readability improvements", included: true },
        { text: "Basic SEO analysis", included: true },
        { text: "Content health checks", included: true },
        { text: "Manual content fixes", included: true },
        { text: "Email support", included: true },
        { text: "Advanced analytics dashboard", included: false },
        { text: "Automated content fixes", included: false },
        { text: "Bulk operations", included: false },
        { text: "Custom AI prompts", included: false },
        { text: "API access", included: false },
      ],
    },
    {
      name: "Professional",
      description: "For serious content creators and marketers",
      monthlyPrice: 49,
      annualPrice: 490,
      popular: true,
      gradient: "from-blue-600 to-purple-600",
      features: [
        { text: "Up to 5 WordPress sites", included: true },
        { text: "200 AI optimizations/month", included: true },
        { text: "Advanced readability improvements", included: true },
        { text: "Advanced SEO analysis & suggestions", included: true },
        { text: "Automated content health monitoring", included: true },
        { text: "Automated content fixes (AI-powered)", included: true },
        { text: "Bulk content operations", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "Custom AI optimization prompts", included: true },
        { text: "Content performance tracking", included: true },
        { text: "Priority email support", included: true },
        { text: "API access (5,000 calls/month)", included: true },
      ],
    },
    {
      name: "Enterprise",
      description: "For agencies and large-scale operations",
      monthlyPrice: 199,
      annualPrice: 1990,
      popular: false,
      gradient: "from-purple-600 to-pink-600",
      features: [
        { text: "Unlimited WordPress sites", included: true },
        { text: "Unlimited AI optimizations", included: true },
        { text: "White-label dashboard", included: true },
        { text: "Custom AI model fine-tuning", included: true },
        { text: "Advanced automation workflows", included: true },
        { text: "Multi-site bulk operations", included: true },
        { text: "Team collaboration tools", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom integrations", included: true },
        { text: "Unlimited API access", included: true },
        { text: "24/7 priority support", included: true },
        { text: "SLA guarantee (99.9% uptime)", included: true },
      ],
    },
  ];

  const comparisonFeatures: ComparisonCategory[] = [
    {
      category: "WordPress Management",
      features: [
        { name: "WordPress sites", starter: "1", pro: "5", enterprise: "Unlimited" },
        { name: "Content health monitoring", starter: "Manual", pro: "Automated", enterprise: "Real-time" },
        { name: "Bulk operations", starter: false, pro: true, enterprise: true },
        { name: "Multi-site dashboard", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "AI Content Optimization",
      features: [
        { name: "AI optimizations/month", starter: "20", pro: "200", enterprise: "Unlimited" },
        { name: "Readability improvements", starter: true, pro: true, enterprise: true },
        { name: "Automated content fixes", starter: false, pro: true, enterprise: true },
        { name: "Custom AI prompts", starter: false, pro: true, enterprise: true },
        { name: "AI model fine-tuning", starter: false, pro: false, enterprise: true },
      ],
    },
    {
      category: "SEO & Analytics",
      features: [
        { name: "SEO analysis", starter: "Basic", pro: "Advanced", enterprise: "Enterprise" },
        { name: "SEO recommendations", starter: "Manual", pro: "Automated", enterprise: "AI-powered" },
        { name: "Content performance tracking", starter: false, pro: true, enterprise: true },
        { name: "Advanced analytics", starter: false, pro: true, enterprise: true },
        { name: "Custom reporting", starter: false, pro: false, enterprise: true },
      ],
    },
    {
      category: "Automation & Integration",
      features: [
        { name: "Automated workflows", starter: false, pro: "Basic", enterprise: "Advanced" },
        { name: "API access", starter: false, pro: "5K calls/mo", enterprise: "Unlimited" },
        { name: "Custom integrations", starter: false, pro: false, enterprise: true },
        { name: "Webhooks", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Team & Support",
      features: [
        { name: "Team members", starter: "1", pro: "5", enterprise: "Unlimited" },
        { name: "White-label options", starter: false, pro: false, enterprise: true },
        { name: "Email support", starter: true, pro: true, enterprise: true },
        { name: "Priority support", starter: false, pro: true, enterprise: true },
        { name: "Dedicated manager", starter: false, pro: false, enterprise: true },
        { name: "SLA guarantee", starter: false, pro: false, enterprise: "99.9%" },
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "What counts as an AI optimization?",
      answer: "Each AI optimization includes one action: improving readability, fixing content issues, SEO optimization, or content enhancement for a single post/page. Bulk operations count as one optimization per item.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes! You can change plans anytime. Upgrades take effect immediately, and we'll prorate the difference. Downgrades take effect at the next billing cycle.",
    },
    {
      question: "What happens if I exceed my monthly AI optimization limit?",
      answer: "On the Starter plan, you'll need to upgrade or wait until next month. Professional users can purchase additional optimization packs. Enterprise plans have unlimited optimizations.",
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! All paid plans include a 14-day free trial with full access to features. No credit card required to start your trial.",
    },
    {
      question: "How does the WordPress site limit work?",
      answer: "You can connect up to the number of WordPress sites allowed by your plan. Each site can be managed independently with its own settings and optimization queue.",
    },
    {
      question: "What AI models do you use?",
      answer: "We use state-of-the-art language models (including GPT-4, Claude, and Gemini) optimized for content quality, readability, and SEO. Enterprise plans can fine-tune models for their specific needs.",
    },
    {
      question: "Is my WordPress content secure?",
      answer: "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. We never store your WordPress credentials, only secure API tokens. Your content is processed securely and never used for AI training.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time with no penalties. Your account remains active until the end of your billing period, and we offer a 30-day money-back guarantee.",
    },
  ];

  const getSavingsPercent = () => {
    return Math.round(((12 - 10) / 12) * 100);
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
                <a className="text-sm text-white transition-colors hidden md:block font-medium">
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
            <Award className="w-3.5 h-3.5 mr-2 inline" />
            Simple, Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Choose Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-14 h-7 bg-white/10 rounded-full transition-colors hover:bg-white/20"
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-transform ${
                  billingCycle === "annual" ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-white" : "text-gray-400"}`}>
              Annual
            </span>
            {billingCycle === "annual" && (
              <Badge className="bg-green-500/10 text-green-300 border border-green-500/20 text-xs">
                Save {getSavingsPercent()}%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
<section className="relative z-10 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg">
                      <Star className="w-3.5 h-3.5 mr-1 inline" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    plan.popular ? "from-blue-500/20 to-purple-500/20 blur-2xl" : "from-blue-500/10 to-purple-500/10 blur-xl"
                  } rounded-3xl group-hover:blur-2xl transition-all`}
                ></div>
                <div
                  className={`relative ${
                    plan.popular
                      ? "bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20"
                      : "bg-white/5 border border-white/10"
                  } backdrop-blur-sm rounded-3xl p-8 hover:border-white/20 transition-all duration-300 h-full flex flex-col`}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-8">
<div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ${billingCycle === "monthly" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)}
                      </span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    {billingCycle === "annual" && plan.annualPrice > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Billed ${plan.annualPrice} annually
                      </p>
                    )}
                  </div>

                  <Link href="/subscription" className="mb-8">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : "bg-white/10 hover:bg-white/20"
                      } text-white shadow-lg transition-all duration-300 text-base font-bold py-6 group`}
                    >
                      {plan.monthlyPrice === 0 ? "Get Started Free" : "Start Free Trial"}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Content Optimization</h3>
                <p className="text-gray-400 leading-relaxed">
                  Automatically improve readability, fix content issues, and optimize for SEO using advanced AI models.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
                <p className="text-gray-400 leading-relaxed">
                  Track content performance, monitor health scores, and get actionable insights to improve your WordPress content.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Automated Workflows</h3>
                <p className="text-gray-400 leading-relaxed">
                  Set up automated content improvements, bulk operations, and scheduled optimizations to save time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              Detailed Comparison
            </Badge>
<h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Compare All Features
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
<div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-6 text-gray-400 font-semibold">Features</th>
                      <th className="text-center p-6">
                        <div className="text-white font-bold">Starter</div>
                      </th>
                      <th className="text-center p-6">
                        <div className="text-white font-bold">Professional</div>
                      </th>
                      <th className="text-center p-6">
                        <div className="text-white font-bold">Enterprise</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((category, catIndex) => (
                      <React.Fragment key={catIndex}>
                        <tr className="bg-white/[0.02]">
                          <td colSpan={4} className="p-4 text-blue-300 font-bold text-sm uppercase tracking-wider">
                            {category.category}
                          </td>
                        </tr>
                        {category.features.map((feature, featIndex) => (
                          <tr
                            key={featIndex}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="p-6 text-gray-300">{feature.name}</td>
                            <td className="p-6 text-center">
                              {typeof feature.starter === "boolean" ? (
                                feature.starter ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-300">{feature.starter}</span>
                              )}
                            </td>
                            <td className="p-6 text-center">
                              {typeof feature.pro === "boolean" ? (
                                feature.pro ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-300">{feature.pro}</span>
                              )}
                            </td>
                            <td className="p-6 text-center">
                              {typeof feature.enterprise === "boolean" ? (
                                feature.enterprise ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-gray-300">{feature.enterprise}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-300 border border-green-500/20 px-3 py-1 text-sm font-semibold">
              FAQs
            </Badge>
<h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-gray-400">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{faq.question}</h4>
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Contact Support
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
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
                  Start Your Free Trial Today
                </Badge>
<h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                  Ready to Optimize Your Content?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join content creators using AI to improve their WordPress sites
                </p>
                <Link href="/subscription">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-gray-100 shadow-2xl text-base font-bold px-8 py-6 group"
                  >
                    Start 14-Day Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-sm text-blue-100 mt-6">
                  ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative z-10 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield />, text: "30-day money-back guarantee" },
              { icon: <Zap />, text: "Instant setup, no installation" },
              { icon: <Users />, text: "Enterprise-grade security" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-400 justify-center md:justify-center"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
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

export default Pricing;