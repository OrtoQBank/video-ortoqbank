"use client";

import {
  useMutation,
  usePaginatedQuery,
  useQuery,
  useAction,
} from "convex/react";
import { FunctionReference, FunctionReturnType } from "convex/server";
import { useCallback, useMemo } from "react";

import { useTenant } from "@/components/providers/tenant-provider";

import type { Id } from "@/convex/_generated/dataModel";

type QueryArgs = Record<string, unknown> | "skip";

/**
 * Options for useTenantQuery
 */
interface TenantQueryOptions {
  /**
   * If true, the query will skip if tenantId is not yet available.
   * Default: true
   */
  requireTenant?: boolean;
}

/**
 * Hook that wraps useQuery and auto-injects tenantId from TenantProvider.
 *
 * Usage:
 * ```typescript
 * // Instead of:
 * const { tenantId } = useTenant();
 * const categories = useQuery(api.categories.list, tenantId ? { tenantId } : "skip");
 *
 * // Use:
 * const categories = useTenantQuery(api.categories.list, {});
 * ```
 *
 * The hook automatically injects the current tenant's ID into the query args.
 * If tenantId is not yet available (loading), the query is skipped.
 *
 * @param query - The Convex query function reference
 * @param args - Query arguments (or 'skip' to skip the query)
 * @param options - Optional configuration
 * @returns The query result (undefined while loading)
 */
export function useTenantQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: QueryArgs,
  options: TenantQueryOptions = {},
): FunctionReturnType<Query> | undefined {
  const { tenantId, isLoading: isTenantLoading } = useTenant();
  const { requireTenant = true } = options;

  // Determine if we should skip the query
  const shouldSkip = useMemo(() => {
    // Always skip if args is 'skip'
    if (args === "skip") return true;

    // Skip if tenant is required but not yet available
    if (requireTenant && isTenantLoading) return true;
    if (requireTenant && !tenantId) return true;

    return false;
  }, [args, requireTenant, isTenantLoading, tenantId]);

  // Build the final args with tenantId injected
  const finalArgs = useMemo(() => {
    if (shouldSkip || args === "skip") return "skip" as const;

    return {
      ...(args as Record<string, unknown>),
      tenantId: tenantId ?? undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSkip, JSON.stringify(args), tenantId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery(query, finalArgs as any);
}

/**
 * Options for useTenantMutation
 */
interface TenantMutationOptions {
  /**
   * If true, the mutation will throw if tenantId is not available.
   * Default: true
   */
  requireTenant?: boolean;
}

/**
 * Hook that wraps useMutation and provides a wrapper to auto-inject tenantId.
 *
 * Usage:
 * ```typescript
 * const createCategory = useTenantMutation(api.categories.create);
 *
 * // When calling, tenantId is automatically injected:
 * await createCategory({ title: "New Category", description: "..." });
 * ```
 *
 * @param mutation - The Convex mutation function reference
 * @param options - Optional configuration
 * @returns A mutation function that auto-injects tenantId
 */
export function useTenantMutation<
  Mutation extends FunctionReference<"mutation">,
>(mutation: Mutation, options: TenantMutationOptions = {}) {
  const { tenantId } = useTenant();
  const baseMutation = useMutation(mutation);
  const { requireTenant = true } = options;

  const wrappedMutation = useCallback(
    async (
      args: Omit<Parameters<typeof baseMutation>[0], "tenantId">,
    ): Promise<FunctionReturnType<Mutation>> => {
      if (requireTenant && !tenantId) {
        throw new Error(
          "Tenant not available. Cannot perform mutation without tenant context.",
        );
      }

      // Inject tenantId into the args
      const argsWithTenant = {
        ...args,
        tenantId: tenantId ?? undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return baseMutation(argsWithTenant as any);
    },
    [baseMutation, tenantId, requireTenant],
  );

  return wrappedMutation;
}

/**
 * Options for useTenantAction
 */
interface TenantActionOptions {
  /**
   * If true, the action will throw if tenantId is not available.
   * Default: true
   */
  requireTenant?: boolean;
}

/**
 * Hook that wraps useAction and provides a wrapper to auto-inject tenantId.
 *
 * Usage:
 * ```typescript
 * const registerVideo = useTenantAction(api.bunny.videos.registerExistingVideo);
 *
 * // When calling, tenantId is automatically injected:
 * await registerVideo({ videoId: "...", libraryId: "...", lessonId: "..." });
 * ```
 *
 * @param action - The Convex action function reference
 * @param options - Optional configuration
 * @returns An action function that auto-injects tenantId
 */
export function useTenantAction<Action extends FunctionReference<"action">>(
  action: Action,
  options: TenantActionOptions = {},
) {
  const { tenantId } = useTenant();
  const baseAction = useAction(action);
  const { requireTenant = true } = options;

  const wrappedAction = useCallback(
    async (
      args: Omit<Parameters<typeof baseAction>[0], "tenantId">,
    ): Promise<FunctionReturnType<Action>> => {
      if (requireTenant && !tenantId) {
        throw new Error(
          "Tenant not available. Cannot perform action without tenant context.",
        );
      }

      // Inject tenantId into the args
      const argsWithTenant = {
        ...args,
        tenantId: tenantId ?? undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return baseAction(argsWithTenant as any);
    },
    [baseAction, tenantId, requireTenant],
  );

  return wrappedAction;
}

/**
 * Hook to get the current tenant ID for manual use cases.
 *
 * @returns The current tenant ID or null if not available
 */
export function useCurrentTenantId(): Id<"tenants"> | null {
  const { tenantId } = useTenant();
  return tenantId;
}

/**
 * Hook to check if tenant context is ready.
 *
 * @returns True if tenant is loaded and available
 */
export function useTenantReady(): boolean {
  const { tenantId, isLoading } = useTenant();
  return !isLoading && tenantId !== null;
}

/**
 * Options for useTenantPaginatedQuery
 */
interface TenantPaginatedQueryOptions {
  /**
   * Initial number of items to load
   */
  initialNumItems: number;
  /**
   * If true, the query will skip if tenantId is not yet available.
   * Default: true
   */
  requireTenant?: boolean;
}

/**
 * Hook that wraps usePaginatedQuery and auto-injects tenantId from TenantProvider.
 *
 * Usage:
 * ```typescript
 * // Instead of:
 * const { results, status, loadMore } = usePaginatedQuery(
 *   api.lessons.listPaginated,
 *   { tenantId },
 *   { initialNumItems: 10 }
 * );
 *
 * // Use:
 * const { results, status, loadMore } = useTenantPaginatedQuery(
 *   api.lessons.listPaginated,
 *   {},
 *   { initialNumItems: 10 }
 * );
 * ```
 *
 * The hook automatically injects the current tenant's ID into the query args.
 * If tenantId is not yet available (loading), the query returns empty results.
 *
 * @param query - The Convex query function reference
 * @param args - Query arguments
 * @param options - Pagination options including initialNumItems
 * @returns The paginated query result with results, status, and loadMore
 */
export function useTenantPaginatedQuery<
  Query extends FunctionReference<"query">,
>(
  query: Query,
  args: Record<string, unknown>,
  options: TenantPaginatedQueryOptions,
) {
  const { tenantId, isLoading: isTenantLoading } = useTenant();
  const { initialNumItems, requireTenant = true } = options;

  // Determine if we should skip the query
  const shouldSkip = useMemo(() => {
    // Skip if tenant is required but not yet available
    if (requireTenant && isTenantLoading) return true;
    if (requireTenant && !tenantId) return true;

    return false;
  }, [requireTenant, isTenantLoading, tenantId]);

  // Build the final args with tenantId injected
  const finalArgs = useMemo(() => {
    if (shouldSkip) {
      // Return object with undefined tenantId - usePaginatedQuery doesn't support 'skip'
      return { tenantId: undefined };
    }

    return {
      ...args,
      tenantId: tenantId ?? undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSkip, JSON.stringify(args), tenantId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = usePaginatedQuery(query, finalArgs as any, {
    initialNumItems,
  });

  // If we should skip, return empty results
  if (shouldSkip) {
    return {
      results: [] as FunctionReturnType<Query> extends { page: infer P }
        ? P
        : never[],
      status: "LoadingFirstPage" as const,
      loadMore: () => {},
      isLoading: true,
    };
  }

  return {
    ...result,
    isLoading: result.status === "LoadingFirstPage",
  };
}
