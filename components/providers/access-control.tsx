'use client';

import { useQuery } from 'convex/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '@/convex/_generated/api';

interface AccessControlProps {
  children: React.ReactNode;
}

/**
 * Helper function to check if a pathname is unrestricted
 * Returns true for admin routes and profile page
 */
function isUnrestrictedPath(pathname: string | undefined): boolean {
  if (!pathname) {
    return false;
  }
  return pathname.startsWith('/admin') || pathname === '/profile';
}

/**
 * Access Control Component
 * Checks if user has paid and hasActiveYearAccess before allowing access to content
 * Redirects to /access-pending if user doesn't have access
 */
export function AccessControl({ children }: AccessControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const accessDetails = useQuery(api.userAccess.getVideoAccessDetails);

  useEffect(() => {
    // Skip check while loading
    if (accessDetails === undefined) {
      return;
    }

    // Allow access to admin pages and profile page (unrestricted paths)
    if (isUnrestrictedPath(pathname)) {
      return;
    }

    // If user doesn't have access, redirect to access-pending page
    if (!accessDetails.hasAccess) {
      router.push('/access-pending');
    }
  }, [accessDetails, router, pathname]);

  // Show loading while checking access
  if (accessDetails === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Allow admin routes and profile to pass through
  if (isUnrestrictedPath(pathname)) {
    return <>{children}</>;
  }

  // If user doesn't have access, show nothing (will redirect)
  if (!accessDetails.hasAccess) {
    return null;
  }

  // User has access, show content
  return <>{children}</>;
}

