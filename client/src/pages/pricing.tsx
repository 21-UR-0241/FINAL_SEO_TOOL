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
//       description: "Perfect for individuals getting started",
//       monthlyPrice: 0,
//       annualPrice: 0,
//       popular: false,
//       gradient: "from-gray-500 to-gray-600",
//       features: [
//         { text: "5 AI-generated articles/month", included: true },
//         { text: "Basic SEO analysis", included: true },
//         { text: "Content scheduling", included: true },
//         { text: "1 WordPress site", included: true },
//         { text: "Email support", included: true },
//         { text: "Advanced analytics", included: false },
//         { text: "Multi-site management", included: false },
//         { text: "API access", included: false },
//         { text: "Priority support", included: false },
//       ],
//     },
//     {
//       name: "Professional",
//       description: "For serious content creators and marketers",
//       monthlyPrice: 29,
//       annualPrice: 290,
//       popular: true,
//       gradient: "from-blue-600 to-purple-600",
//       features: [
//         { text: "Unlimited AI-generated articles", included: true },
//         { text: "Advanced SEO analysis", included: true },
//         { text: "Content calendar & scheduling", included: true },
//         { text: "Up to 5 WordPress sites", included: true },
//         { text: "Priority email support", included: true },
//         { text: "Advanced analytics dashboard", included: true },
//         { text: "Multi-site management", included: true },
//         { text: "Custom workflows", included: true },
//         { text: "API access (1000 calls/day)", included: true },
//       ],
//     },
//     {
//       name: "Enterprise",
//       description: "For teams and agencies at scale",
//       monthlyPrice: 99,
//       annualPrice: 990,
//       popular: false,
//       gradient: "from-purple-600 to-pink-600",
//       features: [
//         { text: "Everything in Professional", included: true },
//         { text: "Unlimited WordPress sites", included: true },
//         { text: "White-label options", included: true },
//         { text: "Dedicated account manager", included: true },
//         { text: "Custom AI model training", included: true },
//         { text: "Unlimited API calls", included: true },
//         { text: "24/7 phone support", included: true },
//         { text: "Team collaboration tools", included: true },
//         { text: "SLA guarantee", included: true },
//       ],
//     },
//   ];

//   const comparisonFeatures: ComparisonCategory[] = [
//     {
//       category: "Content Generation",
//       features: [
//         { name: "AI-generated articles", starter: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
//         { name: "Content rewriting", starter: false, pro: true, enterprise: true },
//         { name: "Topic suggestions", starter: false, pro: true, enterprise: true },
//         { name: "Multi-language support", starter: false, pro: "50+ languages", enterprise: "100+ languages" },
//       ],
//     },
//     {
//       category: "SEO Tools",
//       features: [
//         { name: "SEO analysis", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
//         { name: "Keyword research", starter: false, pro: true, enterprise: true },
//         { name: "Competitor analysis", starter: false, pro: true, enterprise: true },
//         { name: "Rank tracking", starter: false, pro: true, enterprise: true },
//       ],
//     },
//     {
//       category: "Management",
//       features: [
//         { name: "WordPress sites", starter: "1", pro: "5", enterprise: "Unlimited" },
//         { name: "Content scheduling", starter: true, pro: true, enterprise: true },
//         { name: "Team collaboration", starter: false, pro: false, enterprise: true },
//         { name: "Custom workflows", starter: false, pro: true, enterprise: true },
//       ],
//     },
//     {
//       category: "Analytics & Reporting",
//       features: [
//         { name: "Basic analytics", starter: true, pro: true, enterprise: true },
//         { name: "Advanced dashboard", starter: false, pro: true, enterprise: true },
//         { name: "Custom reports", starter: false, pro: false, enterprise: true },
//         { name: "API access", starter: false, pro: "1K calls/day", enterprise: "Unlimited" },
//       ],
//     },
//     {
//       category: "Support",
//       features: [
//         { name: "Email support", starter: true, pro: true, enterprise: true },
//         { name: "Priority support", starter: false, pro: true, enterprise: true },
//         { name: "24/7 phone support", starter: false, pro: false, enterprise: true },
//         { name: "Dedicated manager", starter: false, pro: false, enterprise: true },
//       ],
//     },
//   ];

//   const faqs: FAQ[] = [
//     {
//       question: "Can I change plans later?",
//       answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.",
//     },
//     {
//       question: "What happens after my free trial ends?",
//       answer: "After your 14-day free trial, you'll be charged based on the plan you selected. You can cancel anytime before the trial ends with no charges.",
//     },
//     {
//       question: "Do you offer refunds?",
//       answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund.",
//     },
//     {
//       question: "Is there a setup fee?",
//       answer: "No setup fees ever. You only pay the monthly or annual subscription price with no hidden costs.",
//     },
//     {
//       question: "Can I use this with multiple WordPress sites?",
//       answer: "The Starter plan includes 1 site, Professional includes 5 sites, and Enterprise includes unlimited sites.",
//     },
//     {
//       question: "What payment methods do you accept?",
//       answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience.",
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
//               variant="outline"
//               className="border-white/20 text-white hover:bg-white/10"
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
//                   Ready to Get Started?
//                 </h3>
//                 <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
//                   Join thousands of creators scaling their content with AI
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
//               { icon: <Users />, text: "24/7 priority support" },
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
//                 The ultimate AI-powered content creation platform for WordPress.
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
//                       API
//                     </a>
//                   </Link>
//                 </li>
//                 <li>
//                   <a href="/integrations" className="text-sm text-gray-400 hover:text-white transition-colors">
//                     Integrations
//                   </a>
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
//             {/* <div className="flex items-center gap-6">
//               <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                 </svg>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path
//                     fillRule="evenodd"
//                     d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white transition-colors">
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path
//                     fillRule="evenodd"
//                     d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </a>
//             </div> */}
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
      description: "Perfect for individuals getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      gradient: "from-gray-500 to-gray-600",
      features: [
        { text: "5 AI-generated articles/month", included: true },
        { text: "Basic SEO analysis", included: true },
        { text: "Content scheduling", included: true },
        { text: "1 WordPress site", included: true },
        { text: "Email support", included: true },
        { text: "Advanced analytics", included: false },
        { text: "Multi-site management", included: false },
        { text: "API access", included: false },
        { text: "Priority support", included: false },
      ],
    },
    {
      name: "Professional",
      description: "For serious content creators and marketers",
      monthlyPrice: 29,
      annualPrice: 290,
      popular: true,
      gradient: "from-blue-600 to-purple-600",
      features: [
        { text: "Unlimited AI-generated articles", included: true },
        { text: "Advanced SEO analysis", included: true },
        { text: "Content calendar & scheduling", included: true },
        { text: "Up to 5 WordPress sites", included: true },
        { text: "Priority email support", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "Multi-site management", included: true },
        { text: "Custom workflows", included: true },
        { text: "API access (1000 calls/day)", included: true },
      ],
    },
    {
      name: "Enterprise",
      description: "For teams and agencies at scale",
      monthlyPrice: 99,
      annualPrice: 990,
      popular: false,
      gradient: "from-purple-600 to-pink-600",
      features: [
        { text: "Everything in Professional", included: true },
        { text: "Unlimited WordPress sites", included: true },
        { text: "White-label options", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom AI model training", included: true },
        { text: "Unlimited API calls", included: true },
        { text: "24/7 phone support", included: true },
        { text: "Team collaboration tools", included: true },
        { text: "SLA guarantee", included: true },
      ],
    },
  ];

  const comparisonFeatures: ComparisonCategory[] = [
    {
      category: "Content Generation",
      features: [
        { name: "AI-generated articles", starter: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Content rewriting", starter: false, pro: true, enterprise: true },
        { name: "Topic suggestions", starter: false, pro: true, enterprise: true },
        { name: "Multi-language support", starter: false, pro: "50+ languages", enterprise: "100+ languages" },
      ],
    },
    {
      category: "SEO Tools",
      features: [
        { name: "SEO analysis", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
        { name: "Keyword research", starter: false, pro: true, enterprise: true },
        { name: "Competitor analysis", starter: false, pro: true, enterprise: true },
        { name: "Rank tracking", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Management",
      features: [
        { name: "WordPress sites", starter: "1", pro: "5", enterprise: "Unlimited" },
        { name: "Content scheduling", starter: true, pro: true, enterprise: true },
        { name: "Team collaboration", starter: false, pro: false, enterprise: true },
        { name: "Custom workflows", starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: "Analytics & Reporting",
      features: [
        { name: "Basic analytics", starter: true, pro: true, enterprise: true },
        { name: "Advanced dashboard", starter: false, pro: true, enterprise: true },
        { name: "Custom reports", starter: false, pro: false, enterprise: true },
        { name: "API access", starter: false, pro: "1K calls/day", enterprise: "Unlimited" },
      ],
    },
    {
      category: "Support",
      features: [
        { name: "Email support", starter: true, pro: true, enterprise: true },
        { name: "Priority support", starter: false, pro: true, enterprise: true },
        { name: "24/7 phone support", starter: false, pro: false, enterprise: true },
        { name: "Dedicated manager", starter: false, pro: false, enterprise: true },
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.",
    },
    {
      question: "What happens after my free trial ends?",
      answer: "After your 14-day free trial, you'll be charged based on the plan you selected. You can cancel anytime before the trial ends with no charges.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees ever. You only pay the monthly or annual subscription price with no hidden costs.",
    },
    {
      question: "Can I use this with multiple WordPress sites?",
      answer: "The Starter plan includes 1 site, Professional includes 5 sites, and Enterprise includes unlimited sites.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience.",
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
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Choose Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
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
      <section className="relative z-10 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
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
                      <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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

      {/* Detailed Comparison */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 text-sm font-semibold">
              Detailed Comparison
            </Badge>
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Compare All Features
            </h3>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
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
            <h3 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
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
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              <div className="relative z-10">
                <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-2 inline" />
                  Start Your Free Trial Today
                </Badge>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators scaling their content with AI
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
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Shield />, text: "30-day money-back guarantee" },
              { icon: <Zap />, text: "Instant setup, no installation" },
              { icon: <Users />, text: "24/7 priority support" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-400 justify-center"
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