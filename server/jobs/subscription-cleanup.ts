// server/jobs/subscription-cleanup.ts
import { db } from "../db";
import { userSubscriptions } from "../../shared/schema";
import { and, eq, sql } from "drizzle-orm";

export async function cleanupExpiredSubscriptions() {
  console.log("🔄 Running subscription cleanup job...");
  
  const now = new Date();
  
  try {
    // Find subscriptions that should be cancelled but haven't been updated yet
    const result = await db
      .update(userSubscriptions)
      .set({
        status: "cancelled",
        updatedAt: now,
      })
      .where(
        and(
          eq(userSubscriptions.cancelAtPeriodEnd, true),
          sql`${userSubscriptions.currentPeriodEnd} < ${now}`,
          sql`${userSubscriptions.status} IN ('active', 'trial')`,
        ),
      )
      .returning({ id: userSubscriptions.id });

    if (result.length > 0) {
      console.log(`✅ Updated ${result.length} expired subscriptions to cancelled`);
    } else {
      console.log("✅ No expired subscriptions to update");
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error in subscription cleanup job:", error);
    throw error;
  }
}

// Run every hour
export function startSubscriptionCleanupJob(p0: number) {
  // Run immediately on startup
  cleanupExpiredSubscriptions();
  
  // Then run every hour
  setInterval(cleanupExpiredSubscriptions, 60 * 60 * 1000);
  
  console.log("✅ Subscription cleanup job started");
}