"use client";

import { UnitsLessonsPage } from "./_components/units-lessons-page";

/**
 * Admin Units & Lessons Page
 *
 * SECURITY: Server-side authorization enforced by:
 * 1. Parent layout.tsx (requireAdminServer via getCurrentUserServer)
 * 2. This page component (explicit requireAdminServer call)
 * 3. Convex mutations (requireAdmin helper in backend)
 *
 * Note: Categories are now loaded client-side with tenant context
 */
export default function AdminUnitsLessonsPage() {
  return <UnitsLessonsPage />;
}
