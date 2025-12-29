// // server/services/stripe-service.ts
// import Stripe from 'stripe';
// import { db } from '../db';
// import { users, userSubscriptions, subscriptionPlans } from '../../shared/schema';
// import { eq } from 'drizzle-orm';

// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2024-11-20.acacia',
// });

// export const stripeService = {
//   /**
//    * Create or retrieve a Stripe customer for a user
//    */
//   async getOrCreateCustomer(userId: string): Promise<string> {
//     // Get user from database
//     const [user] = await db
//       .select()
//       .from(users)
//       .where(eq(users.id, userId))
//       .limit(1);

//     if (!user) {
//       throw new Error('User not found');
//     }

//     // If user already has a Stripe customer ID, return it
//     if (user.stripeCustomerId) {
//       return user.stripeCustomerId;
//     }

//     // Create new Stripe customer
//     const customer = await stripe.customers.create({
//       email: user.email,
//       name: user.name || undefined,
//       metadata: {
//         userId: user.id,
//       },
//     });

//     // Save Stripe customer ID to database
//     await db
//       .update(users)
//       .set({ stripeCustomerId: customer.id })
//       .where(eq(users.id, userId));

//     return customer.id;
//   },

//   /**
//    * Create a checkout session for subscription
//    */
//   async createCheckoutSession(params: {
//     userId: string;
//     planId: string;
//     interval: 'month' | 'year';
//     successUrl: string;
//     cancelUrl: string;
//     promoCode?: string;
//   }): Promise<Stripe.Checkout.Session> {
//     const { userId, planId, interval, successUrl, cancelUrl, promoCode } = params;

//     // Get plan details
//     const [plan] = await db
//       .select()
//       .from(subscriptionPlans)
//       .where(eq(subscriptionPlans.id, planId))
//       .limit(1);

//     if (!plan) {
//       throw new Error('Plan not found');
//     }

//     // Get or create Stripe customer
//     const customerId = await this.getOrCreateCustomer(userId);

//     // Calculate price
//     const price = interval === 'year' 
//       ? parseFloat(plan.yearlyPrice) 
//       : parseFloat(plan.monthlyPrice);

//     // Create checkout session
//     const sessionParams: Stripe.Checkout.SessionCreateParams = {
//       customer: customerId,
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: plan.name,
//               description: plan.description || undefined,
//             },
//             unit_amount: Math.round(price * 100), // Convert to cents
//             recurring: {
//               interval: interval,
//             },
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: successUrl,
//       cancel_url: cancelUrl,
//       metadata: {
//         userId,
//         planId,
//         interval,
//       },
//       subscription_data: {
//         metadata: {
//           userId,
//           planId,
//           interval,
//         },
//       },
//     };

//     // Add promo code if provided
//     if (promoCode) {
//       const promoCodes = await stripe.promotionCodes.list({
//         code: promoCode,
//         active: true,
//         limit: 1,
//       });

//       if (promoCodes.data.length > 0) {
//         sessionParams.discounts = [{ promotion_code: promoCodes.data[0].id }];
//       }
//     }

//     const session = await stripe.checkout.sessions.create(sessionParams);

//     return session;
//   },

//   /**
//    * Create a billing portal session for managing subscription
//    */
//   async createBillingPortalSession(params: {
//     userId: string;
//     returnUrl: string;
//   }): Promise<Stripe.BillingPortal.Session> {
//     const { userId, returnUrl } = params;

//     const customerId = await this.getOrCreateCustomer(userId);

//     const session = await stripe.billingPortal.sessions.create({
//       customer: customerId,
//       return_url: returnUrl,
//     });

//     return session;
//   },

//   /**
//    * Cancel a subscription
//    */
//   async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Stripe.Subscription> {
//     if (immediate) {
//       // Cancel immediately
//       return await stripe.subscriptions.cancel(subscriptionId);
//     } else {
//       // Cancel at period end
//       return await stripe.subscriptions.update(subscriptionId, {
//         cancel_at_period_end: true,
//       });
//     }
//   },

//   /**
//    * Resume a cancelled subscription
//    */
//   async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
//     return await stripe.subscriptions.update(subscriptionId, {
//       cancel_at_period_end: false,
//     });
//   },

//   /**
//    * Update subscription plan
//    */
//   async updateSubscription(params: {
//     subscriptionId: string;
//     newPlanId: string;
//     interval: 'month' | 'year';
//   }): Promise<Stripe.Subscription> {
//     const { subscriptionId, newPlanId, interval } = params;

//     // Get plan details
//     const [plan] = await db
//       .select()
//       .from(subscriptionPlans)
//       .where(eq(subscriptionPlans.id, newPlanId))
//       .limit(1);

//     if (!plan) {
//       throw new Error('Plan not found');
//     }

//     // Get current subscription
//     const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//     // Calculate new price
//     const price = interval === 'year' 
//       ? parseFloat(plan.yearlyPrice) 
//       : parseFloat(plan.monthlyPrice);

//     // Update subscription
//     return await stripe.subscriptions.update(subscriptionId, {
//       items: [
//         {
//           id: subscription.items.data[0].id,
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: plan.name,
//               description: plan.description || undefined,
//             },
//             unit_amount: Math.round(price * 100),
//             recurring: {
//               interval: interval,
//             },
//           },
//         },
//       ],
//       proration_behavior: 'always_invoice',
//     });
//   },

//   /**
//    * Construct webhook event
//    */
//   constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     if (!webhookSecret) {
//       throw new Error('STRIPE_WEBHOOK_SECRET is not set');
//     }

//     return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
//   },

//   // Raw Stripe instance for custom operations
//   stripe,
// };

// export default stripeService;