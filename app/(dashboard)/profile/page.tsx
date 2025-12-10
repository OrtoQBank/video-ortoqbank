import ProfileInner from "./_components/profile-inner";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  try {
    // Obter token de autenticação para Convex
    const { userId, getToken } = await auth();
    const token = await getToken({ template: "convex" }).catch(() => null);

    // Pré-carregar dados no servidor para melhorar performance
    // Wrap individual queries in try-catch to handle failures gracefully
    let preloadedUserData;
    try {
      preloadedUserData = await preloadQuery(
        api.users.current,
        {},
        token ? { token } : undefined
      );
    } catch (error) {
      console.error("Error preloading user data:", error);
      // Try without token as fallback
      preloadedUserData = await preloadQuery(api.users.current, {}, undefined);
    }
    
    let preloadedContentStats;
    try {
      preloadedContentStats = await preloadQuery(
        api.contentStats.get,
        {},
        token ? { token } : undefined
      );
    } catch (error) {
      console.error("Error preloading content stats:", error);
      // Try without token as fallback
      preloadedContentStats = await preloadQuery(api.contentStats.get, {}, undefined);
    }

    // Pré-carregar queries que precisam de userId (se autenticado)
    const preloadedGlobalProgress = userId
      ? await preloadQuery(
          api.progress.getGlobalProgress,
          { userId },
          token ? { token } : undefined
        ).catch(() => null)
      : null;

    const preloadedCompletedCount = userId
      ? await preloadQuery(
          api.progress.getCompletedPublishedLessonsCount,
          { userId },
          token ? { token } : undefined
        ).catch(() => null)
      : null;

    const preloadedViewedCount = userId
      ? await preloadQuery(
          api.recentViews.getUniqueViewedLessonsCount,
          { userId },
          token ? { token } : undefined
        ).catch(() => null)
      : null;

    const preloadedRecentViews = userId
      ? await preloadQuery(
          api.recentViews.getRecentViewsWithDetails,
          { userId, limit: 3 },
          token ? { token } : undefined
        ).catch(() => null)
      : null;

    return (
      <ProfileInner
        preloadedUserData={preloadedUserData}
        preloadedContentStats={preloadedContentStats}
        preloadedGlobalProgress={preloadedGlobalProgress}
        preloadedCompletedCount={preloadedCompletedCount}
        preloadedViewedCount={preloadedViewedCount}
        preloadedRecentViews={preloadedRecentViews}
      />
    );
  } catch (error) {
    console.error("Error loading profile page:", error);
    // Return a fallback UI instead of crashing
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar perfil</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro ao carregar os dados do perfil. Por favor, tente novamente.
          </p>
        </div>
      </div>
    );
  }
}

