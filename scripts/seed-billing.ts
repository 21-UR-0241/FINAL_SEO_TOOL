// scripts/seed-billing.ts
// Seed script for billing system using Drizzle ORM

import { db } from '../server/db';
import { subscriptionPlans, promoCodes } from '../shared/schema';

async function seed() {
  console.log('🌱 Seeding billing database...');

  try {
    // Clear existing data (optional - comment out to preserve data)
    console.log('Clearing existing data...');
    await db.delete(promoCodes);
    await db.delete(subscriptionPlans);

    // Insert subscription plans
    console.log('Inserting subscription plans...');
    await db.insert(subscriptionPlans).values([
      {
        id: 'free',
        name: 'Starter',
        description: 'Perfect for getting started with AI content generation',
        monthlyPrice: '0.00',
        yearlyPrice: '0.00',
        maxWebsites: 1,
        maxArticlesPerMonth: 10,
        hasAdvancedSeo: false,
        hasPrioritySupport: false,
        hasCustomTemplates: false,
        hasAnalytics: false,
        features: {
          support: 'community',
          templates: 'standard',
          api_access: false,
        },
        isActive: true,
      },
      {
        id: 'pro',
        name: 'Professional',
        description: 'For growing businesses and content creators',
        monthlyPrice: '29.00',
        yearlyPrice: '278.00',
        maxWebsites: 5,
        maxArticlesPerMonth: -1, // Unlimited
        hasAdvancedSeo: true,
        hasPrioritySupport: true,
        hasCustomTemplates: true,
        hasAnalytics: true,
        features: {
          support: 'priority',
          templates: 'custom',
          api_access: true,
          analytics: 'advanced',
        },
        isActive: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        monthlyPrice: '99.00',
        yearlyPrice: '950.00',
        maxWebsites: -1, // Unlimited
        maxArticlesPerMonth: -1, // Unlimited
        hasAdvancedSeo: true,
        hasPrioritySupport: true,
        hasCustomTemplates: true,
        hasAnalytics: true,
        features: {
          support: '24/7',
          templates: 'custom',
          api_access: true,
          analytics: 'advanced',
          dedicated_manager: true,
          custom_integration: true,
        },
        isActive: true,
      },
    ]);
    console.log('✅ Subscription plans inserted');

    // Insert promo codes
    console.log('Inserting promo codes...');
    await db.insert(promoCodes).values([
      {
        code: 'WELCOME25',
        description: '25% off first month for new customers',
        discountType: 'percentage',
        discountValue: '25',
        applicablePlans: ['pro', 'enterprise'],
        maxRedemptions: 1000,
        redemptionsCount: 0,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        isActive: true,
      },
      {
        code: 'SAVE50',
        description: '$50 off annual subscription',
        discountType: 'fixed_amount',
        discountValue: '50.00',
        applicablePlans: ['pro', 'enterprise'],
        maxRedemptions: 500,
        redemptionsCount: 0,
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        isActive: true,
      },
      {
        code: 'EARLYBIRD',
        description: '30% off for early adopters',
        discountType: 'percentage',
        discountValue: '30',
        applicablePlans: ['pro'],
        maxRedemptions: 100,
        redemptionsCount: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
      },
    ]);
    console.log('✅ Promo codes inserted');

    console.log('');
    console.log('✨ Database seeded successfully!');
    console.log('');
    console.log('📦 Available plans:');
    console.log('  - Free (Starter): $0/month');
    console.log('  - Pro (Professional): $29/month or $278/year');
    console.log('  - Enterprise: $99/month or $950/year');
    console.log('');
    console.log('🎟️  Available promo codes:');
    console.log('  - WELCOME25: 25% off first month');
    console.log('  - SAVE50: $50 off annual subscription');
    console.log('  - EARLYBIRD: 30% off for early adopters');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();