
// client/src/pages/subscription.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
  Rocket,
  Star,
  TrendingUp,
  Users,
  Globe,
  Wrench,
} from "lucide-react";
import { useAuth } from "./authentication";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  limitations: string[];
  icon: React.ReactNode;
  popular?: boolean;
  recommended?: boolean;
  cta: string;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    interval: "month",
    description: "Perfect for trying out content optimization",
    icon: <Zap className="w-6 h-6" />,
    color: "from-gray-400 to-gray-600",
    features: [
      "1 WordPress site",
      "50 content optimizations per month",
      "Basic readability analysis",
      "SEO score checking",
      "Community support",
      "Content health monitoring",
    ],
    limitations: [
      "No bulk operations",
      "No API access",
      "Limited SEO plugin integrations",
    ],
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Professional",
    price: 29,
    interval: "month",
    description: "For serious WordPress site owners",
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    recommended: true,
    color: "from-blue-500 to-purple-600",
    features: [
      "Up to 10 WordPress sites",
      "Unlimited content optimizations",
      "Advanced readability improvement",
      "Complete SEO analysis & auto-fix",
      "Priority email support",
      "Bulk optimization operations",
      "Content health monitoring",
      "Performance analytics dashboard",
      "API access (5,000 requests/month)",
      "Yoast SEO & Rank Math integration",
      "Automated link & image fixing",
    ],
    limitations: ["Limited to 10 team members"],
    cta: "Start 14-Day Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    description: "For agencies and large organizations",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-purple-500 to-pink-600",
    features: [
      "Unlimited WordPress sites",
      "Unlimited content optimizations",
      "Enterprise SEO optimization suite",
      "24/7 priority support",
      "Advanced bulk operations",
      "Multi-user collaboration",
      "White-label options",
      "Unlimited API access",
      "Dedicated account manager",
      "Custom SEO plugin integrations",
      "SLA guarantee (99.9% uptime)",
      "Advanced analytics & reporting",
      "Custom AI model training",
    ],
    limitations: [],
    cta: "Get Started",
  },
];

export function SubscriptionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/current", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan || "free");
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    // All plans (including Free and Enterprise) now require billing details
    setLocation(`/billing?plan=${planId}&interval=${billingInterval}`);
  };

  const handleSkip = () => {
    // If user is authenticated, send them to dashboard, otherwise to landing page
    setLocation(user ? "/dashboard" : "/");
  };

  const getDiscountedPrice = (price: number) => {
    if (billingInterval === "year") {
      return Math.floor(price * 12 * 0.8);
    }
    return price;
  };

  const getSavings = (price: number) => {
    if (billingInterval === "year") {
      const monthlyTotal = price * 12;
      const yearlyTotal = getDiscountedPrice(price);
      return monthlyTotal - yearlyTotal;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="border-b bg-white/60 backdrop-blur-xl shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  WordPress AI Manager
                </h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              size="sm"
              className="hover:bg-white/80 transition-all duration-200"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full mb-3">
            <Star className="w-3 h-3 text-blue-600 mr-1.5" />
            <span className="text-xs font-medium text-blue-700">Special Launch Pricing</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
              Welcome{user ? `, ${user.name || user.username}` : ''}! 
            </span>
            <span className="ml-1">🚀</span>
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan to optimize your WordPress content with AI
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl p-1 shadow-md inline-flex border border-gray-200">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                billingInterval === "month"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative ${
                billingInterval === "year"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs border-0 shadow-md px-1.5 py-0">
                -20%
              </Badge>
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {pricingPlans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const displayPrice = getDiscountedPrice(plan.price);
            const savings = getSavings(plan.price);

            return (
              <Card
                key={plan.id}
                className={`relative group transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-xl md:scale-105 bg-gradient-to-br from-white to-blue-50"
                    : "border border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white"
                } hover:scale-105`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-bold shadow-lg border-0">
                        ⭐ MOST POPULAR
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none"></div>
                  </>
                )}

                {plan.recommended && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
                      Best Value
                    </div>
                  </div>
                )}

                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">{plan.icon}</div>
                    </div>
                    {isCurrentPlan && (
                      <Badge className="bg-green-100 text-green-700 border-green-300 font-semibold text-xs">
                        ✓ Active
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl font-bold mb-1">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Free
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            ${billingInterval === "year" ? displayPrice : plan.price}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-xs font-medium">
                              /{billingInterval === "year" ? "year" : "mo"}
                            </span>
                            {billingInterval === "year" && (
                              <span className="text-xs text-gray-400">
                                ${Math.floor(displayPrice / 12)}/mo
                              </span>
                            )}
                          </div>
                        </div>
                        {billingInterval === "year" && savings > 0 && (
                          <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-green-100 rounded-full">
                            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-700 font-semibold">
                              Save ${savings}/yr
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 py-0">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-start group/item hover:bg-blue-50/50 p-1.5 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <div 
                        key={index} 
                        className="flex items-start p-1.5"
                      >
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center mr-2 mt-0.5">
                          <X className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400 leading-relaxed">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className={`w-full h-10 text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
                    } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading || isCurrentPlan}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      <>
                        {plan.cta}
                        <Rocket className="w-3 h-3 ml-1.5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">Secure & Private</h4>
              <p className="text-xs text-gray-600">Bank-level encryption</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">5,000+ Users</h4>
              <p className="text-xs text-gray-600">Trusted worldwide</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">250K+ Optimizations</h4>
              <p className="text-xs text-gray-600">Content improved</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-0.5">30+ Countries</h4>
              <p className="text-xs text-gray-600">Global coverage</p>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Everything You Need to Optimize Your WordPress Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group hover:bg-blue-50/50 p-4 rounded-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base mb-2 text-gray-900">AI-Powered Optimization</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Improve readability scores and content quality with advanced AI
              </p>
            </div>
            <div className="text-center group hover:bg-purple-50/50 p-4 rounded-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base mb-2 text-gray-900">SEO Enhancement</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Built-in SEO analysis and auto-fix tools for better rankings
              </p>
            </div>
            <div className="text-center group hover:bg-green-50/50 p-4 rounded-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-base mb-2 text-gray-900">Content Health</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monitor and fix broken links, images, and formatting issues
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "Can I change my plan later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and PayPal through our secure payment processor."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required to start."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. You can cancel your subscription at any time with no cancellation fees. You'll continue to have access until the end of your billing period."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <h4 className="font-bold text-sm mb-2 text-gray-900 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  {faq.q}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed ml-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/60 backdrop-blur-xl py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Have questions? Contact us at{" "}
            <a 
              href="mailto:support@wpaimanager.com" 
              className="text-blue-600 hover:text-blue-700 font-semibold underline decoration-2 underline-offset-2 transition-colors"
            >
              support@wpaimanager.com
            </a>
          </p>
        </div>
      </div>

      {/* Add keyframes for blob animation */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default SubscriptionPage;