import { FavoritesInner } from "./_components/FavoritesInner";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function FavoritesPage() {
  // TODO: Replace with actual user ID from auth
  const userId = "demo-user";

  // Preload favorites data
  const preloadedFavorites = await preloadQuery(api.favorites.getUserFavorites, {
    userId,
    paginationOpts: {
      numItems: 3,
      cursor: null,
    },
  });

  // Preload watch also videos
  const preloadedWatchAlso = await preloadQuery(api.favorites.getUnwatchedFirstVideos, {
    userId,
    count: 3,
  });

  return (
    <FavoritesInner
      preloadedFavorites={preloadedFavorites}
      preloadedWatchAlso={preloadedWatchAlso}
      userId={userId}
    />
  );
}
