"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export default function TestAuthPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  // Client-side Convex query - uses ConvexProviderWithClerk automatically
  const currentUser = useQuery(api.users.current);

  if (!isLoaded) {
    return <div className="p-8">Loading Clerk...</div>;
  }

  if (!isSignedIn) {
    return <div className="p-8">Not signed in</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Client-Side Auth Test</h1>

      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Clerk Status:</h2>
        <p>User ID: {userId}</p>
        <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Convex Query Result:</h2>
        {currentUser === undefined ? (
          <p>Loading from Convex...</p>
        ) : currentUser === null ? (
          <p className="text-red-500">User not found in Convex (null)</p>
        ) : (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
