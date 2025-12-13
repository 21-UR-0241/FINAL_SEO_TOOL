// client/src/pages/subscription.tsx
import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  CreditCard,
  Lock,
  ArrowLeft,
  Building,
} from "lucide-react";
import { useAuth } from "./authentication";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  icon: React.ReactNode;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    billingPeriod: "monthly",
    icon: <Sparkles className="w-6 h-6" />,
    description: "Perfect for trying out our platform",
    color: "gray",
    features: [
      "1 Website",
      "10 AI-generated articles/month",
      "Basic SEO analysis",
      "Community support",
      "Standard templates",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: 29,
    billingPeriod: "monthly",
    icon: <Zap className="w-6 h-6" />,
    description: "For serious content creators",
    color: "blue",
    popular: true,
    features: [
      "5 Websites",
      "100 AI-generated articles/month",
      "Advanced SEO analysis",
      "Priority support",
      "Custom templates",
      "Content scheduling",
      "Analytics dashboard",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    billingPeriod: "monthly",
    icon: <Crown className="w-6 h-6" />,
    description: "For large teams and agencies",
    color: "purple",
    features: [
      "Unlimited websites",
      "Unlimited AI-generated articles",
      "Enterprise SEO suite",
      "Dedicated support",
      "White-label solution",
      "Advanced analytics",
      "Team collaboration",
      "Custom integrations",
      "SLA guarantee",
      "Onboarding assistance",
    ],
  },
];

export function SubscriptionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    zipCode: "",
  });

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substr(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + "/" + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === "free") {
      // Free plan - no payment needed
      handleFreePlanActivation();
    } else {
      setSelectedPlan(plan);
      setError("");
    }
  };

  const handleFreePlanActivation = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/activate-free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to activate free plan");
      }

      // Success - redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      setError(error.message || "Failed to activate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    // Validate payment form
    if (!paymentForm.cardNumber || !paymentForm.cardName || 
        !paymentForm.expiryDate || !paymentForm.cvv) {
      setError("Please fill in all payment details");
      return;
    }

    if (paymentForm.cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Invalid card number");
      return;
    }

    if (paymentForm.cvv.length !== 3) {
      setError("Invalid CVV");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In production, this would integrate with Stripe, PayPal, etc.
      const response = await fetch(`${API_BASE_URL}/api/subscription/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
          paymentMethod: {
            cardNumber: paymentForm.cardNumber.replace(/\s/g, ""),
            cardName: paymentForm.cardName,
            expiryDate: paymentForm.expiryDate,
            cvv: paymentForm.cvv,
            billingAddress: paymentForm.billingAddress,
            zipCode: paymentForm.zipCode,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment failed");
      }

      // Success - redirect to dashboard
      setLocation("/");
    } catch (error: any) {
      setError(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPricing = () => {
    setSelectedPlan(null);
    setPaymentForm({
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
      billingAddress: "",
      zipCode: "",
    });
    setError("");
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 0;
    return billingCycle === "yearly" ? getYearlyPrice(plan.price) : plan.price;
  };

  const getPriceDisplay = (plan: PricingPlan) => {
    const price = getPrice(plan);
    if (price === 0) return "Free";
    
    if (billingCycle === "yearly") {
      return `$${price}/year`;
    }
    return `$${price}/month`;
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full">
        {!selectedPlan ? (
          // Pricing Plans View
          <>
            <div className="text-center mb-12">
              <Crown className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Choose Your Plan
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Select the perfect plan for your content creation needs
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === "monthly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === "yearly"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular
                      ? "border-blue-600 border-2 shadow-lg scale-105"
                      : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-${plan.color}-100 flex items-center justify-center mb-4 text-${plan.color}-600`}
                    >
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? "$0" : `$${getPrice(plan)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 ml-2">
                          /{billingCycle === "yearly" ? "year" : "month"}
                        </span>
                      )}
                      {billingCycle === "yearly" && plan.price > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          ${plan.price}/month billed annually
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      disabled={loading}
                    >
                      {plan.id === "free" ? "Get Started Free" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Enterprise Contact */}
            <div className="mt-12 text-center">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <Building className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Need a Custom Solution?
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Contact our sales team for custom pricing and enterprise features
                  </p>
                  <Button variant="outline" className="bg-white">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          // Checkout View
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleBackToPricing}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to pricing
            </button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
                    <CardDescription>
                      Subscribe to {selectedPlan.name} Plan
                    </CardDescription>
                  </div>
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{selectedPlan.name} Plan</span>
                    <span className="font-medium">{getPriceDisplay(selectedPlan)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-medium capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Yearly Discount (20%)</span>
                      <span>-${selectedPlan.price * 12 * 0.2}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      {getPriceDisplay(selectedPlan)}
                    </span>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    Payment Information
                  </h3>

                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      type="text"
                      value={paymentForm.cardName}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          cardName: e.target.value,
                        }))
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          cardNumber: formatCardNumber(e.target.value),
                        }))
                      }
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        value={paymentForm.expiryDate}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            expiryDate: formatExpiryDate(e.target.value),
                          }))
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            cvv: e.target.value.replace(/\D/g, "").substr(0, 3),
                          }))
                        }
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      type="text"
                      value={paymentForm.billingAddress}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          billingAddress: e.target.value,
                        }))
                      }
                      placeholder="123 Main St, City, State"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={paymentForm.zipCode}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Secure Payment</p>
                    <p className="text-blue-700">
                      Your payment information is encrypted and secure. We never store your
                      full card details.
                    </p>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By completing this purchase, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . Your subscription will auto-renew unless cancelled.
                </p>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ${getPriceDisplay(selectedPlan)}`
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleBackToPricing}
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;