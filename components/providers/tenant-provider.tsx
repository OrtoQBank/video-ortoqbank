"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  TENANT_COOKIE_NAME,
  DEFAULT_TENANT_SLUG,
  extractSubdomain,
} from "@/lib/tenant";

/**
 * ============================================================================
 * TENANT CONTEXT PROVIDER
 *
 * Provides tenant information to all components in the app.
 * The tenant is resolved from:
 * 1. Cookie set by middleware (primary)
 * 2. Subdomain from window.location (fallback)
 *
 * All tenant data comes from the Convex database.
 * ============================================================================
 */

// Default values for branding fallbacks
const DEFAULT_LOGO = "/logo.webp";
const DEFAULT_PRIMARY_COLOR = "oklch(0.6167 0.1623 250.58)";

interface TenantContextType {
  // Data from Convex
  tenantId: Id<"tenants"> | null;
  tenantSlug: string | null;
  tenantName: string | null;
  tenantDisplayName: string | null;
  tenantLogoUrl: string | null;
  tenantPrimaryColor: string | null;

  // Status
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  /** Optional: Pass tenant slug directly (for SSR or testing) */
  tenantSlug?: string;
  /** Optional: Whether to apply brand color CSS variable (defaults to true) */
  applyBrandColor?: boolean;
}

/**
 * Read tenant slug from cookie
 */
function getTenantSlugFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const name = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    if (name === TENANT_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

/**
 * Basic slug format validation
 */
function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/.test(slug.toLowerCase());
}

/**
 * Extract tenant slug from window.location (fallback)
 */
function getTenantSlugFromLocation(): string {
  if (typeof window === "undefined") return DEFAULT_TENANT_SLUG;

  const hostname = window.location.hostname;

  // Check for tenant override in URL params (development only)
  if (process.env.NODE_ENV === "development") {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("tenant");
    if (override && isValidSlugFormat(override)) {
      return override;
    }
  }

  // Try to extract subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain && isValidSlugFormat(subdomain)) {
    return subdomain;
  }

  return DEFAULT_TENANT_SLUG;
}

export function TenantProvider({
  children,
  tenantSlug: propSlug,
  applyBrandColor = true,
}: TenantProviderProps) {
  const slug = useMemo<string | null>(() => {
    // Priority 1: Use prop if provided
    if (propSlug) {
      if (isValidSlugFormat(propSlug)) {
        return propSlug;
      }
      return DEFAULT_TENANT_SLUG;
    }

    // Priority 2: Try cookie first (set by middleware)
    const cookieSlug = getTenantSlugFromCookie();
    if (cookieSlug && isValidSlugFormat(cookieSlug)) {
      return cookieSlug;
    }

    // Priority 3: Fallback to location-based detection
    const locationSlug = getTenantSlugFromLocation();
    if (isValidSlugFormat(locationSlug)) {
      return locationSlug;
    }

    // Priority 4: Use default tenant
    return DEFAULT_TENANT_SLUG;
  }, [propSlug]);

  // Fetch tenant data from Convex
  const tenant = useQuery(api.tenants.getBySlug, slug ? { slug } : "skip");

  // Derive error state from tenant query results
  const error =
    slug && tenant === null
      ? `Tenant "${slug}" not found`
      : tenant && tenant.status === "suspended"
        ? "This organization is suspended"
        : null;

  // Resolve primary color from Convex or use default
  const resolvedPrimaryColor = tenant?.primaryColor || DEFAULT_PRIMARY_COLOR;

  // Inject primary color as CSS variable when it changes (only if applyBrandColor is true)
  useEffect(() => {
    if (applyBrandColor && resolvedPrimaryColor) {
      document.documentElement.style.setProperty(
        "--blue-brand",
        resolvedPrimaryColor,
      );
    }

    // Cleanup: reset to default when component unmounts or color is removed
    return () => {
      if (applyBrandColor && resolvedPrimaryColor) {
        document.documentElement.style.removeProperty("--blue-brand");
      }
    };
  }, [resolvedPrimaryColor, applyBrandColor]);

  const contextValue: TenantContextType = {
    // Data from Convex
    tenantId: tenant?._id || null,
    tenantSlug: slug,
    tenantName: tenant?.name || null,
    tenantDisplayName: tenant?.displayName || tenant?.name || null,
    tenantLogoUrl: tenant?.logoUrl || DEFAULT_LOGO,
    tenantPrimaryColor: resolvedPrimaryColor,

    // Status
    isLoading: tenant === undefined && slug !== null,
    error,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access full tenant context
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined || context === null) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

/**
 * Hook to get tenant ID or throw if not available
 * Use this in components that require a tenant
 */
export function useTenantId(): Id<"tenants"> {
  const tenant = useTenant();
  if (!tenant) {
    throw new Error("Tenant is not available");
  }
  if (!tenant.tenantId) {
    throw new Error("Tenant ID is not available");
  }
  return tenant.tenantId;
}

/**
 * Hook to safely get tenant ID (returns null if not available)
 */
export function useTenantIdSafe(): Id<"tenants"> | null {
  const tenant = useTenant();
  if (!tenant) return null;
  return tenant.tenantId;
}
