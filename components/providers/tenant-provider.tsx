"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  TENANT_COOKIE_NAME,
  getTenantConfig,
  DEFAULT_TENANT_SLUG,
  isValidTenantSlug,
  extractSubdomain,
  type TenantConfig,
  type TenantSlug,
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
 * It merges:
 * - Dynamic data from Convex (tenantId, status)
 * - Static config from tenants.config.ts (branding, content)
 * ============================================================================
 */

interface TenantContextType {
  // Dynamic data from Convex
  tenantId: Id<"tenants"> | null;
  tenantSlug: string | null;
  tenantName: string | null;
  tenantLogoUrl: string | null;
  tenantPrimaryColor: string | null;

  // Static config from tenants.config.ts
  config: TenantConfig | null;

  // Status
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  tenantSlug: null,
  tenantName: null,
  tenantLogoUrl: null,
  tenantPrimaryColor: null,
  config: null,
  isLoading: true,
  error: null,
});

interface TenantProviderProps {
  children: ReactNode;
  /** Optional: Pass tenant slug directly (for SSR or testing) */
  tenantSlug?: string;
}

/**
 * Read tenant slug from cookie
 */
function getTenantSlugFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === TENANT_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
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
    if (override && isValidTenantSlug(override)) {
      return override;
    }
  }

  // Try to extract subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain && isValidTenantSlug(subdomain)) {
    return subdomain;
  }

  return DEFAULT_TENANT_SLUG;
}

export function TenantProvider({
  children,
  tenantSlug: propSlug,
}: TenantProviderProps) {
  const [slug, setSlug] = useState<TenantSlug | null>(
    propSlug && isValidTenantSlug(propSlug) ? propSlug : null,
  );
  const [error, setError] = useState<string | null>(null);

  // Resolve tenant slug from cookie or location on mount
  useEffect(() => {
    if (propSlug) {
      // Use prop if provided
      if (isValidTenantSlug(propSlug)) {
        setSlug(propSlug);
      } else {
        setSlug(DEFAULT_TENANT_SLUG);
      }
      return;
    }

    // Try cookie first (set by middleware)
    const cookieSlug = getTenantSlugFromCookie();
    if (cookieSlug && isValidTenantSlug(cookieSlug)) {
      setSlug(cookieSlug);
      return;
    }

    // Fallback to location-based detection
    const locationSlug = getTenantSlugFromLocation();
    if (isValidTenantSlug(locationSlug)) {
      setSlug(locationSlug);
    } else {
      setSlug(DEFAULT_TENANT_SLUG);
    }
  }, [propSlug]);

  // Fetch tenant data from Convex (for tenantId)
  const tenant = useQuery(api.tenants.getBySlug, slug ? { slug } : "skip");

  // Handle tenant not found or suspended
  useEffect(() => {
    if (slug && tenant === null) {
      setError(`Tenant "${slug}" not found`);
    } else if (tenant && tenant.status === "suspended") {
      setError("This organization is suspended");
    } else {
      setError(null);
    }
  }, [tenant, slug]);

  // Get static config for this tenant
  const staticConfig = slug ? getTenantConfig(slug) : null;

  const contextValue: TenantContextType = {
    // Dynamic data from Convex
    tenantId: tenant?._id || null,
    tenantSlug: slug,
    tenantName: tenant?.name || staticConfig?.branding.name || null,
    tenantLogoUrl: tenant?.logoUrl || staticConfig?.branding.logo || null,
    tenantPrimaryColor:
      tenant?.primaryColor || staticConfig?.branding.primaryColor || null,

    // Static config
    config: staticConfig,

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
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

/**
 * Hook to get tenant ID or throw if not available
 * Use this in components that require a tenant
 */
export function useTenantId(): Id<"tenants"> {
  const { tenantId, isLoading, error } = useTenant();

  if (isLoading) {
    throw new Error("Tenant is still loading");
  }

  if (error) {
    throw new Error(error);
  }

  if (!tenantId) {
    throw new Error("No tenant context available");
  }

  return tenantId;
}

/**
 * Hook to safely get tenant ID (returns null if not available)
 */
export function useTenantIdSafe(): Id<"tenants"> | null {
  const { tenantId } = useTenant();
  return tenantId;
}

/**
 * Hook to get static tenant config
 */
export function useTenantConfig(): TenantConfig | null {
  const { config } = useTenant();
  return config;
}

/**
 * Hook to get tenant branding
 */
export function useTenantBranding() {
  const { config } = useTenant();
  return config?.branding || null;
}

/**
 * Hook to get tenant content labels
 */
export function useTenantLabels() {
  const { config } = useTenant();
  return config?.content.labels || null;
}
