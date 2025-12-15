// TypeScript Types for Billing System
// Corresponds to the database schema in billing-schema.sql

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Record<string, any> | null;
  maxWebsites: number | null;
  maxArticlesPerMonth: number | null;
  hasAdvancedSeo: boolean;
  hasPrioritySupport: boolean;
  hasCustomTemplates: boolean;
  hasAnalytics: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BillingInterval = "month" | "year";
export type SubscriptionStatus = 
  | "active" 
  | "cancelled" 
  | "past_due" 
  | "expired" 
  | "trial" 
  | "incomplete";

// ============================================================================
// USER SUBSCRIPTIONS
// ============================================================================

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended subscription with plan details
export interface UserSubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan;
  currentPrice: number;
}

// ============================================================================
// BILLING ADDRESSES
// ============================================================================

export interface BillingAddress {
  id: string;
  userId: string;
  streetAddress: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string | null;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export type PaymentMethodType = "card" | "paypal" | "bank_account";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  
  // Card details
  cardBrand: CardBrand | null;
  cardLast4: string | null;
  cardExpMonth: string | null;
  cardExpYear: string | null;
  cardholderName: string | null;
  
  // Payment processor IDs
  stripePaymentMethodId: string | null;
  paypalEmail: string | null;
  
  billingAddressId: string | null;
  isDefault: boolean;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended payment method with address
export interface PaymentMethodWithAddress extends PaymentMethod {
  billingAddress: BillingAddress | null;
}

// ============================================================================
// INVOICES
// ============================================================================

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  subscriptionId: string | null;
  
  // Amounts
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  
  // Status
  status: InvoiceStatus;
  
  // Dates
  invoiceDate: Date;
  dueDate: Date;
  paidAt: Date | null;
  
  billingAddressId: string | null;
  lineItems: InvoiceLineItem[] | null;
  notes: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

// Extended invoice with related data
export interface InvoiceWithDetails extends Invoice {
  subscription: UserSubscription | null;
  billingAddress: BillingAddress | null;
  transactions: Transaction[];
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export type TransactionType = "payment" | "refund" | "adjustment" | "credit";
export type TransactionStatus = 
  | "pending" 
  | "succeeded" 
  | "failed" 
  | "refunded" 
  | "cancelled";

export interface Transaction {
  id: string;
  userId: string;
  invoiceId: string | null;
  subscriptionId: string | null;
  paymentMethodId: string | null;
  
  // Transaction details
  transactionType: TransactionType;
  amount: number;
  currency: string;
  
  // Status
  status: TransactionStatus;
  
  // Payment processor IDs
  stripeChargeId: string | null;
  stripePaymentIntentId: string | null;
  paypalTransactionId: string | null;
  
  // Failure details
  failureCode: string | null;
  failureMessage: string | null;
  
  // Metadata
  description: string | null;
  metadata: Record<string, any> | null;
  
  // Timestamps
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended transaction with related data
export interface TransactionWithDetails extends Transaction {
  invoice: Invoice | null;
  paymentMethod: PaymentMethod | null;
}

// ============================================================================
// SUBSCRIPTION USAGE
// ============================================================================

export interface SubscriptionUsage {
  id: string;
  userId: string;
  subscriptionId: string;
  websitesCreated: number;
  articlesGenerated: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extended usage with limits
export interface SubscriptionUsageWithLimits extends SubscriptionUsage {
  plan: SubscriptionPlan;
  websitesRemaining: number | "Unlimited";
  articlesRemaining: number | "Unlimited";
}

// ============================================================================
// PROMO CODES
// ============================================================================

export type DiscountType = "percentage" | "fixed_amount";

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  
  // Discount details
  discountType: DiscountType;
  discountValue: number;
  currency: string;
  
  // Restrictions
  applicablePlans: string[] | null;
  maxRedemptions: number | null;
  redemptionsCount: number;
  
  // Validity
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PromoCodeRedemption {
  id: string;
  promoCodeId: string;
  userId: string;
  subscriptionId: string | null;
  discountAmount: number;
  redeemedAt: Date;
}

// Extended redemption with promo code details
export interface PromoCodeRedemptionWithDetails extends PromoCodeRedemption {
  promoCode: PromoCode;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateSubscriptionRequest {
  planId: string;
  interval: BillingInterval;
  paymentDetails: {
    cardLast4: string;
    cardName: string;
    billingAddress: {
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  promoCode?: string;
}

export interface CreateSubscriptionResponse {
  subscription: UserSubscriptionWithPlan;
  invoice: Invoice;
  transaction: Transaction;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface PaymentMethodRequest {
  type: PaymentMethodType;
  cardholderName?: string;
  stripePaymentMethodId?: string;
  paypalEmail?: string;
  billingAddress: Partial<BillingAddress>;
}

export interface ApplyPromoCodeRequest {
  code: string;
  planId: string;
}

export interface ApplyPromoCodeResponse {
  valid: boolean;
  discountAmount?: number;
  message?: string;
}

// ============================================================================
// DASHBOARD/UI TYPES
// ============================================================================

export interface BillingDashboardData {
  subscription: UserSubscriptionWithPlan | null;
  paymentMethods: PaymentMethodWithAddress[];
  billingAddresses: BillingAddress[];
  recentInvoices: InvoiceWithDetails[];
  recentTransactions: TransactionWithDetails[];
  usage: SubscriptionUsageWithLimits | null;
}

export interface PaymentSummary {
  totalPaid: number;
  totalFailed: number;
  totalRefunded: number;
  lastPaymentDate: Date | null;
  totalTransactions: number;
}

export interface RevenueSummary {
  month: Date;
  uniqueCustomers: number;
  totalTransactions: number;
  revenue: number;
  refunds: number;
  netRevenue: number;
}

export interface PlanRevenue {
  planName: string;
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface BillingFormData {
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

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: BillingInterval;
}

// ============================================================================
// WEBHOOK EVENT TYPES (for Stripe/PayPal integrations)
// ============================================================================

export type WebhookEventType = 
  | "payment.succeeded"
  | "payment.failed"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.cancelled"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.trial_will_end";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  createdAt: Date;
  processed: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// HELPERS
// ============================================================================

export const isSubscriptionActive = (subscription: UserSubscription): boolean => {
  return subscription.status === "active" || subscription.status === "trial";
};

export const isPaymentMethodExpired = (paymentMethod: PaymentMethod): boolean => {
  if (!paymentMethod.cardExpMonth || !paymentMethod.cardExpYear) {
    return false;
  }
  
  const now = new Date();
  const expYear = parseInt(paymentMethod.cardExpYear);
  const expMonth = parseInt(paymentMethod.cardExpMonth);
  
  if (expYear < now.getFullYear()) {
    return true;
  }
  
  if (expYear === now.getFullYear() && expMonth < (now.getMonth() + 1)) {
    return true;
  }
  
  return false;
};

export const calculateTotal = (subtotal: number, taxRate: number = 0.08): number => {
  return Math.round((subtotal * (1 + taxRate)) * 100) / 100;
};

export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};