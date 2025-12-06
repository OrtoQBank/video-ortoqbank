"use client";

import ProfileInner from "./_components/profile-inner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user } = useUser();
  
  // Get current user data from Convex
  const userData = useQuery(api.users.current);
  
  // Get user's global progress
  const globalProgress = useQuery(
    api.progress.getGlobalProgress,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get count of completed published lessons
  const completedCount = useQuery(
    api.progress.getCompletedPublishedLessonsCount,
    user?.id ? { userId: user.id } : "skip"
  );

  // Get count of unique viewed lessons
  const viewedCount = useQuery(
    api.recentViews.getUniqueViewedLessonsCount,
    user?.id ? { userId: user.id } : "skip"
  );

  // Get content stats for total count
  const contentStats = useQuery(api.contentStats.get);

  // Handle loading state
  if (!user || userData === undefined || globalProgress === undefined || completedCount === undefined || viewedCount === undefined || contentStats === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileInner
      userData={userData}
      globalProgress={globalProgress}
      completedCount={completedCount}
      viewedCount={viewedCount}
      totalLessons={contentStats?.totalLessons || 0}
    />
  );
}

