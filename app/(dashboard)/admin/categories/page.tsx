import { CategoriesPage } from "./_components/categories-page";
import { requireAdminServer } from "@/lib/server-auth";

/**
 * Admin Categories Page
 *
 * SECURITY: Server-side authorization enforced by:
 * 1. Parent layout.tsx (requireAdminServer via getCurrentUserServer)
 * 2. This page component (explicit requireAdminServer call)
 * 3. Convex mutations (requireAdmin helper in backend)
 */
export default async function AdminCategoriesPage() {
  // Explicit server-side authorization check (defense in depth)
  await requireAdminServer();

  // Categories are now fetched client-side with tenant context
  return <CategoriesPage />;
}
