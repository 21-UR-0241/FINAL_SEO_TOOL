// client/src/pages/billing.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuth } from "./authentication";

interface BillingFormData {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
}

// ✅ Add these API helper functions at the top
const fetchWithCredentials = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

const billingApi = {
  createSubscription: (data: {
    planId: string;
    interval: 'month' | 'year';
    paymentDetails?: {
      cardLast4?: string;
      cardName?: string;
      billingAddress?: {
        address: string;
        city: string;
        state: string;
        zip: string;
        country?: string;
      };
    };
    promoCode?: string;
  }) => {
    console.log('💳 Creating subscription:', data);
    return fetchWithCredentials('/api/billing/subscription', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((error) => {
          throw new Error(error.error?.message || 'Failed to create subscription');
        });
      }
      return res.json();
    });
  },
};

export function BillingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Get plan details from URL params or state
  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    id: "pro",
    name: "Professional",
    price: 29,
    interval: "month",
  });

  const [formData, setFormData] = useState<BillingFormData>({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "US",
  });

  useEffect(() => {
    // Parse URL params to get plan details
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const interval = params.get("interval") as "month" | "year";
    
    if (plan && interval) {
      // Fetch plan details from API or use predefined values
      const planPrices: Record<string, { name: string; monthly: number; yearly: number }> = {
        free: { name: "Starter", monthly: 0, yearly: 0 },
        pro: { name: "Professional", monthly: 29, yearly: 278 },
        enterprise: { name: "Enterprise", monthly: 99, yearly: 950 },
      };
      
      if (planPrices[plan]) {
        setPlanDetails({
          id: plan,
          name: planPrices[plan].name,
          price: interval === "year" ? planPrices[plan].yearly : planPrices[plan].monthly,
          interval,
        });
      }
    }
  }, []);

  // ✅ Use React Query mutation for subscription creation
  const createSubscriptionMutation = useMutation({
    mutationFn: billingApi.createSubscription,
    onSuccess: (data) => {
      console.log('✅ Subscription created:', data);
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ Subscription failed:', error);
      setError(error.message || "Payment processing failed");
    },
  });

  const handleInputChange = (field: keyof BillingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      handleInputChange("cardNumber", formatted);
    }
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, "");
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "Amex";
    if (/^6(?:011|5)/.test(num)) return "Discover";
    return "Card";
  };

  const validateForm = () => {
    // For Free plan, only billing address is required (no card details needed)
    if (planDetails.id === "free") {
      if (!formData.billingAddress || !formData.billingCity || !formData.billingZip) {
        setError("Please complete the billing address");
        return false;
      }
      return true;
    }
    
    // For paid plans, validate all fields
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
      setError("Please enter a valid card number");
      return false;
    }
    if (!formData.cardName || formData.cardName.length < 3) {
      setError("Please enter the cardholder name");
      return false;
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      setError("Please enter the expiry date");
      return false;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      setError("Please enter a valid CVV");
      return false;
    }
    if (!formData.billingAddress || !formData.billingCity || !formData.billingZip) {
      setError("Please complete the billing address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // ✅ Use the mutation instead of direct fetch
    createSubscriptionMutation.mutate({
      planId: planDetails.id,
      interval: planDetails.interval,
      paymentDetails: planDetails.id !== "free" ? {
        cardLast4: formData.cardNumber.slice(-4).replace(/\s/g, ""),
        cardName: formData.cardName,
        billingAddress: {
          address: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zip: formData.billingZip,
          country: formData.billingCountry,
        },
      } : undefined,
    });
  };

  const handleBack = () => {
    setLocation("/subscription");
  };

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.08 * 100) / 100; // 8% tax example
  };

  const tax = calculateTax(planDetails.price);
  const total = planDetails.price + tax;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = [
    { value: "01", label: "01 - January" },
    { value: "02", label: "02 - February" },
    { value: "03", label: "03 - March" },
    { value: "04", label: "04 - April" },
    { value: "05", label: "05 - May" },
    { value: "06", label: "06 - June" },
    { value: "07", label: "07 - July" },
    { value: "08", label: "08 - August" },
    { value: "09", label: "09 - September" },
    { value: "10", label: "10 - October" },
    { value: "11", label: "11 - November" },
    { value: "12", label: "12 - December" },
  ];

  // ✅ Use mutation loading state
  const loading = createSubscriptionMutation.isPending;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {planDetails.id === "free" 
                ? "Account Created!"
                : planDetails.id === "enterprise"
                ? "Thank You!"
                : "Payment Successful!"
              }
            </h2>
            <p className="text-gray-600 mb-6">
              {planDetails.id === "free" 
                ? "Your free account has been created. Start creating amazing content now!"
                : planDetails.id === "enterprise"
                ? "Our sales team will contact you within 24 hours. Your account is now active!"
                : `Your subscription to ${planDetails.name} has been activated.`
              }
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                  Secure Checkout
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleBack}
              size="sm"
              className="hover:bg-white/80 transition-all duration-200"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center">
          <Shield className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Secure Payment</p>
            <p className="text-xs text-blue-700">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="shadow-xl border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>
                    Enter your card information to complete the purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Enterprise Plan Notice */}
                  {planDetails.id === "enterprise" && (
                    <Alert className="bg-purple-50 border-purple-200">
                      <Info className="w-4 h-4 text-purple-600" />
                      <AlertDescription className="text-purple-900">
                        <strong>Enterprise Plan:</strong> Our sales team will contact you within 24 hours to discuss custom pricing and features. Please provide your payment details to complete the setup.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Free Plan Notice */}
                  {planDetails.id === "free" && (
                    <Alert className="bg-green-50 border-green-200">
                      <Info className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-900">
                        <strong>Free Plan:</strong> No payment required! We just need your billing address for account setup. You can upgrade anytime.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Card Details - Only for Paid Plans */}
                  {planDetails.id !== "free" && (
                    <>
                      {/* Card Number */}
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-semibold">
                          Card Number *
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className="pl-10 pr-20"
                            maxLength={19}
                          />
                          <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          {formData.cardNumber && (
                            <span className="absolute right-3 top-3 text-xs font-semibold text-gray-600">
                              {getCardType(formData.cardNumber)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <Label htmlFor="cardName" className="text-sm font-semibold">
                          Cardholder Name *
                        </Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="expiryMonth" className="text-sm font-semibold">
                            Month *
                          </Label>
                          <Select
                            value={formData.expiryMonth}
                            onValueChange={(value) => handleInputChange("expiryMonth", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="expiryYear" className="text-sm font-semibold">
                            Year *
                          </Label>
                          <Select
                            value={formData.expiryYear}
                            onValueChange={(value) => handleInputChange("expiryYear", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-sm font-semibold flex items-center">
                            CVV *
                            <Info className="w-3 h-3 ml-1 text-gray-400" />
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 4) {
                                handleInputChange("cvv", value);
                              }
                            }}
                            className="mt-1"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Billing Address */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-base font-semibold mb-4 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-blue-600" />
                      Billing Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="billingAddress" className="text-sm font-semibold">
                          Street Address *
                        </Label>
                        <Input
                          id="billingAddress"
                          type="text"
                          placeholder="123 Main St"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingCity" className="text-sm font-semibold">
                            City *
                          </Label>
                          <Input
                            id="billingCity"
                            type="text"
                            placeholder="New York"
                            value={formData.billingCity}
                            onChange={(e) => handleInputChange("billingCity", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState" className="text-sm font-semibold">
                            State/Province *
                          </Label>
                          <Input
                            id="billingState"
                            type="text"
                            placeholder="NY"
                            value={formData.billingState}
                            onChange={(e) => handleInputChange("billingState", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingZip" className="text-sm font-semibold">
                            ZIP/Postal Code *
                          </Label>
                          <Input
                            id="billingZip"
                            type="text"
                            placeholder="10001"
                            value={formData.billingZip}
                            onChange={(e) => handleInputChange("billingZip", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingCountry" className="text-sm font-semibold">
                            Country *
                          </Label>
                          <Select
                            value={formData.billingCountry}
                            onValueChange={(value) => handleInputChange("billingCountry", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="ES">Spain</SelectItem>
                              <SelectItem value="IT">Italy</SelectItem>
                              <SelectItem value="NL">Netherlands</SelectItem>
                              <SelectItem value="SE">Sweden</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {planDetails.id === "free" ? "Creating Account..." : "Processing Payment..."}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {planDetails.id === "free" 
                          ? "Create Free Account"
                          : planDetails.id === "enterprise"
                          ? `Contact Sales - $${total.toFixed(2)}`
                          : `Complete Purchase - $${total.toFixed(2)}`
                        }
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Order Summary - Rest of the component stays the same */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-gray-200 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{planDetails.name}</h3>
                    <Badge className="bg-blue-600 text-white">
                      {planDetails.interval === "year" ? "Annual" : "Monthly"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Billed {planDetails.interval === "year" ? "annually" : "monthly"}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {planDetails.id === "free" ? (
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">${planDetails.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Features Included */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm mb-3 text-gray-900">What's Included:</h4>
                  <ul className="space-y-2">
                    {planDetails.id === "free" ? (
                      <>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          1 website
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          10 AI-generated articles/month
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Basic SEO analysis
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Community support
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Standard templates
                        </li>
                      </>
                    ) : planDetails.id === "enterprise" ? (
                      <>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Unlimited websites
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Unlimited AI-generated articles
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Enterprise SEO suite
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          24/7 priority support
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Dedicated account manager
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Unlimited AI-generated articles
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Advanced SEO analysis
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Priority support
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Custom templates
                        </li>
                        <li className="flex items-start text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          Performance analytics
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Security Badge */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-600">
                    <Shield className="w-4 h-4 text-green-600 mr-2" />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">PCI Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;