import { v } from "convex/values";
import { Id, Doc } from "../_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
} from "../_generated/server";

/**
 * ============================================================================
 * TENANT CONTEXT UTILITIES
 *
 * Centralized utilities for tenant resolution and access control.
 * These functions should be used throughout the codebase to ensure
 * consistent tenant scoping.
 * ============================================================================
 */

// Re-export the validator for use in function args
export const tenantIdValidator = v.id("tenants");

/**
 * Get a tenant by its slug (subdomain identifier)
 * Used primarily for initial tenant resolution from subdomain
 */
export async function getTenantBySlug(
  ctx: QueryCtx,
  slug: string
): Promise<Doc<"tenants"> | null> {
  return await ctx.db
    .query("tenants")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

/**
 * Get a tenant by ID
 * Throws if tenant not found or suspended
 */
export async function getTenantOrThrow(
  ctx: QueryCtx,
  tenantId: Id<"tenants">
): Promise<Doc<"tenants">> {
  const tenant = await ctx.db.get(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  if (tenant.status === "suspended") {
    throw new Error("Tenant is suspended");
  }

  return tenant;
}

/**
 * Get the current user from context
 * Helper function to get authenticated user
 */
async function getCurrentUserFromContext(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
}

/**
 * Check if user has membership in the specified tenant
 */
export async function getUserTenantMembership(
  ctx: QueryCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<Doc<"tenantMemberships"> | null> {
  return await ctx.db
    .query("tenantMemberships")
    .withIndex("by_userId_and_tenantId", (q) =>
      q.eq("userId", userId).eq("tenantId", tenantId)
    )
    .unique();
}

/**
 * Get all tenant memberships for a user
 * Returns list of tenants the user belongs to
 */
export async function getUserTenantMemberships(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<Array<Doc<"tenantMemberships">>> {
  return await ctx.db
    .query("tenantMemberships")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
}

/**
 * Get all members of a tenant
 */
export async function getTenantMembers(
  ctx: QueryCtx,
  tenantId: Id<"tenants">
): Promise<Array<Doc<"tenantMemberships">>> {
  return await ctx.db
    .query("tenantMemberships")
    .withIndex("by_tenantId", (q) => q.eq("tenantId", tenantId))
    .collect();
}

/**
 * Require that the current user has membership in the specified tenant
 * Throws if user is not authenticated or not a member of the tenant
 */
export async function requireTenantMembership(
  ctx: QueryCtx | MutationCtx,
  tenantId: Id<"tenants">
): Promise<{ user: Doc<"users">; membership: Doc<"tenantMemberships"> }> {
  const user = await getCurrentUserFromContext(ctx);

  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const membership = await getUserTenantMembership(ctx, user._id, tenantId);

  if (!membership) {
    throw new Error("Unauthorized: Not a member of this tenant");
  }

  return { user, membership };
}

/**
 * Require that the current user is an admin of the specified tenant
 * Throws if user is not authenticated, not a member, or not an admin
 */
export async function requireTenantAdmin(
  ctx: QueryCtx | MutationCtx,
  tenantId: Id<"tenants">
): Promise<{ user: Doc<"users">; membership: Doc<"tenantMemberships"> }> {
  const { user, membership } = await requireTenantMembership(ctx, tenantId);

  // Superadmins can always act as tenant admins
  if (user.role === "superadmin") {
    return { user, membership };
  }

  if (membership.role !== "admin") {
    throw new Error("Unauthorized: Tenant admin access required");
  }

  return { user, membership };
}

/**
 * Require that the current user is a superadmin (cross-tenant admin)
 * Throws if user is not authenticated or not a superadmin
 */
export async function requireSuperAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUserFromContext(ctx);

  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (user.role !== "superadmin") {
    throw new Error("Unauthorized: Superadmin access required");
  }

  return user;
}

/**
 * Check if user has active access in a specific tenant
 * Considers both membership status and access expiration
 */
export async function hasActiveTenantAccess(
  ctx: QueryCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<boolean> {
  const membership = await getUserTenantMembership(ctx, userId, tenantId);

  if (!membership) {
    return false;
  }

  if (!membership.hasActiveAccess) {
    return false;
  }

  // Check if access has expired
  if (membership.accessExpiresAt && membership.accessExpiresAt < Date.now()) {
    return false;
  }

  return true;
}

/**
 * Get current user with their role in a specific tenant
 * Returns null if user is not authenticated or not a member
 */
export async function getCurrentUserWithTenantRole(
  ctx: QueryCtx,
  tenantId: Id<"tenants">
): Promise<{
  user: Doc<"users">;
  membership: Doc<"tenantMemberships">;
  effectiveRole: "member" | "admin" | "superadmin";
} | null> {
  const user = await getCurrentUserFromContext(ctx);

  if (!user) {
    return null;
  }

  // Superadmins have full access
  if (user.role === "superadmin") {
    // Create a virtual membership for superadmins
    const membership = await getUserTenantMembership(ctx, user._id, tenantId);

    // If they have an actual membership, use it; otherwise treat as admin
    return {
      user,
      membership: membership ?? ({
        _id: "" as Id<"tenantMemberships">,
        _creationTime: 0,
        userId: user._id,
        tenantId,
        role: "admin" as const,
        hasActiveAccess: true,
        joinedAt: Date.now(),
      }),
      effectiveRole: "superadmin",
    };
  }

  const membership = await getUserTenantMembership(ctx, user._id, tenantId);

  if (!membership) {
    return null;
  }

  return {
    user,
    membership,
    effectiveRole: membership.role,
  };
}

/**
 * Validate that a tenant exists and is active
 * Use this for lightweight tenant validation without throwing
 */
export async function isTenantActive(
  ctx: QueryCtx,
  tenantId: Id<"tenants">
): Promise<boolean> {
  const tenant = await ctx.db.get(tenantId);
  return tenant !== null && tenant.status === "active";
}
