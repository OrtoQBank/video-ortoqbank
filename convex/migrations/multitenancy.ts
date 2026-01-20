import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { requireSuperAdmin } from "../lib/tenantContext";

/**
 * ============================================================================
 * MULTITENANCY MIGRATION SCRIPT
 *
 * This script migrates existing data to the multitenancy schema.
 * It should be run once after deploying the schema changes.
 *
 * Steps:
 * 1. Create default tenant (e.g., "OrtoQBank" with slug "app")
 * 2. Add tenantId to all existing content records
 * 3. Create tenantMemberships for all existing users
 * ============================================================================
 */

/**
 * Step 1: Create the default tenant
 * Run this first to get the default tenant ID
 */
export const createDefaultTenant = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if tenant already exists
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      console.log(
        `Tenant "${args.slug}" already exists with ID: ${existing._id}`,
      );
      return existing._id;
    }

    const tenantId = await ctx.db.insert("tenants", {
      name: args.name,
      slug: args.slug,
      status: "active",
      createdAt: Date.now(),
    });

    console.log(`Created default tenant "${args.name}" with ID: ${tenantId}`);
    return tenantId;
  },
});

/**
 * Step 2: Migrate categories to include tenantId
 */
export const migrateCategories = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    // Get categories without tenantId
    const categories = await ctx.db.query("categories").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const category of categories) {
      // Check if already has tenantId (using type assertion for migration)
      const cat = category as typeof category & { tenantId?: Id<"tenants"> };
      if (cat.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(category._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Categories: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: categories.length === batchSize };
  },
});

/**
 * Step 2b: Migrate units to include tenantId
 */
export const migrateUnits = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const units = await ctx.db.query("units").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const unit of units) {
      const u = unit as typeof unit & { tenantId?: Id<"tenants"> };
      if (u.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(unit._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Units: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: units.length === batchSize };
  },
});

/**
 * Step 2c: Migrate lessons to include tenantId
 */
export const migrateLessons = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const lessons = await ctx.db.query("lessons").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const lesson of lessons) {
      const l = lesson as typeof lesson & { tenantId?: Id<"tenants"> };
      if (l.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(lesson._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Lessons: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: lessons.length === batchSize };
  },
});

/**
 * Step 2d: Migrate videos to include tenantId
 */
export const migrateVideos = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const videos = await ctx.db.query("videos").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const video of videos) {
      const v = video as typeof video & { tenantId?: Id<"tenants"> };
      if (v.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(video._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Videos: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: videos.length === batchSize };
  },
});

/**
 * Step 2e: Migrate pricing plans to include tenantId
 */
export const migratePricingPlans = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const plans = await ctx.db.query("pricingPlans").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const plan of plans) {
      const p = plan as typeof plan & { tenantId?: Id<"tenants"> };
      if (p.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(plan._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Pricing Plans: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: plans.length === batchSize };
  },
});

/**
 * Step 2f: Migrate coupons to include tenantId
 */
export const migrateCoupons = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const coupons = await ctx.db.query("coupons").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const coupon of coupons) {
      const c = coupon as typeof coupon & { tenantId?: Id<"tenants"> };
      if (c.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(coupon._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Coupons: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: coupons.length === batchSize };
  },
});

/**
 * Step 3: Create tenant memberships for existing users
 */
export const createUserMemberships = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const users = await ctx.db.query("users").take(batchSize);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if membership already exists
      const existing = await ctx.db
        .query("tenantMemberships")
        .withIndex("by_userId_and_tenantId", (q) =>
          q.eq("userId", user._id).eq("tenantId", args.tenantId),
        )
        .unique();

      if (existing) {
        skipped++;
        continue;
      }

      // Determine role: admins become tenant admins
      const role =
        user.role === "admin" || user.role === "superadmin"
          ? ("admin" as const)
          : ("member" as const);

      await ctx.db.insert("tenantMemberships", {
        userId: user._id,
        tenantId: args.tenantId,
        role,
        hasActiveAccess: user.hasActiveYearAccess,
        joinedAt: Date.now(),
      });
      created++;
    }

    console.log(`User Memberships: created ${created}, skipped ${skipped}`);
    return { created, skipped, hasMore: users.length === batchSize };
  },
});

/**
 * Step 4: Migrate user progress tables
 */
export const migrateUserProgress = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const progress = await ctx.db.query("userProgress").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const p of progress) {
      const prog = p as typeof p & { tenantId?: Id<"tenants"> };
      if (prog.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(p._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`User Progress: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: progress.length === batchSize };
  },
});

/**
 * Step 4b: Migrate unit progress
 */
export const migrateUnitProgress = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const progress = await ctx.db.query("unitProgress").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const p of progress) {
      const prog = p as typeof p & { tenantId?: Id<"tenants"> };
      if (prog.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(p._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Unit Progress: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: progress.length === batchSize };
  },
});

/**
 * Step 4c: Migrate global progress
 */
export const migrateGlobalProgress = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const progress = await ctx.db.query("userGlobalProgress").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const p of progress) {
      const prog = p as typeof p & { tenantId?: Id<"tenants"> };
      if (prog.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(p._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Global Progress: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: progress.length === batchSize };
  },
});

/**
 * Step 5: Migrate favorites and recent views
 */
export const migrateFavorites = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const favorites = await ctx.db.query("favorites").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const f of favorites) {
      const fav = f as typeof f & { tenantId?: Id<"tenants"> };
      if (fav.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(f._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Favorites: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: favorites.length === batchSize };
  },
});

export const migrateRecentViews = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const views = await ctx.db.query("recentViews").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const v of views) {
      const view = v as typeof v & { tenantId?: Id<"tenants"> };
      if (view.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(v._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Recent Views: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: views.length === batchSize };
  },
});

/**
 * Step 6: Migrate orders and invoices
 */
export const migratePendingOrders = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const orders = await ctx.db.query("pendingOrders").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const o of orders) {
      const order = o as typeof o & { tenantId?: Id<"tenants"> };
      if (order.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(o._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Pending Orders: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: orders.length === batchSize };
  },
});

export const migrateInvoices = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const invoices = await ctx.db.query("invoices").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const i of invoices) {
      const inv = i as typeof i & { tenantId?: Id<"tenants"> };
      if (inv.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(i._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Invoices: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: invoices.length === batchSize };
  },
});

/**
 * Step 7: Migrate remaining tables
 */
export const migrateFeedback = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const feedback = await ctx.db.query("lessonFeedback").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const f of feedback) {
      const fb = f as typeof f & { tenantId?: Id<"tenants"> };
      if (fb.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(f._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Lesson Feedback: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: feedback.length === batchSize };
  },
});

export const migrateRatings = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const ratings = await ctx.db.query("lessonRatings").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const r of ratings) {
      const rating = r as typeof r & { tenantId?: Id<"tenants"> };
      if (rating.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(r._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Lesson Ratings: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: ratings.length === batchSize };
  },
});

export const migrateCouponUsage = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const usages = await ctx.db.query("couponUsage").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const u of usages) {
      const usage = u as typeof u & { tenantId?: Id<"tenants"> };
      if (usage.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(u._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Coupon Usage: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: usages.length === batchSize };
  },
});

export const migrateEmailInvitations = internalMutation({
  args: {
    tenantId: v.id("tenants"),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    const invitations = await ctx.db.query("emailInvitations").take(batchSize);

    let migrated = 0;
    let skipped = 0;

    for (const i of invitations) {
      const inv = i as typeof i & { tenantId?: Id<"tenants"> };
      if (inv.tenantId) {
        skipped++;
        continue;
      }

      await ctx.db.patch(i._id, {
        tenantId: args.tenantId,
      });
      migrated++;
    }

    console.log(`Email Invitations: migrated ${migrated}, skipped ${skipped}`);
    return { migrated, skipped, hasMore: invitations.length === batchSize };
  },
});

/**
 * Public mutation to run the full migration (superadmin only)
 * This orchestrates all migration steps
 */
export const runFullMigration = mutation({
  args: {
    tenantName: v.string(),
    tenantSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // Require superadmin for migration
    await requireSuperAdmin(ctx);

    // This is a placeholder - the actual migration should be run via
    // internal mutations scheduled from the dashboard or CLI
    console.log(
      `Migration requested for tenant: ${args.tenantName} (${args.tenantSlug})`,
    );
    console.log(
      "Run internal migrations via Convex dashboard or npx convex run",
    );

    return {
      message: "Migration must be run via internal mutations",
      instructions: [
        '1. npx convex run migrations/multitenancy:createDefaultTenant --args \'{"name":"OrtoQBank","slug":"app"}\'',
        "2. Use the returned tenant ID for subsequent migrations",
        "3. Run each migrate* function with the tenant ID",
      ],
    };
  },
});
