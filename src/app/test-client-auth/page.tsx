"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";

export default function TestClientAuthPage() {
  const { isLoaded: isAuthLoaded, isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();

  // Client-side Convex query - uses ConvexProviderWithClerk automatically
  const currentUser = useQuery(api.users.current);

  return (
    <div className="p-8 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Client-Side Auth Test (Outside Dashboard)</h1>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold text-blue-800">Clerk Status:</h2>
        <p>Auth Loaded: {isAuthLoaded ? "Yes" : "No"}</p>
        <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
        <p>User ID: {userId || "N/A"}</p>
        <p>Email: {clerkUser?.primaryEmailAddress?.emailAddress || "N/A"}</p>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <h2 className="font-semibold text-green-800">Convex Query Result (api.users.current):</h2>
        {currentUser === undefined ? (
          <p className="text-yellow-600">Loading from Convex...</p>
        ) : currentUser === null ? (
          <p className="text-red-500">User not found in Convex (returned null)</p>
        ) : (
          <pre className="text-sm overflow-auto bg-white p-2 rounded mt-2">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        )}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <h2 className="font-semibold">Debug Info:</h2>
        <p className="text-sm">
          If Clerk shows signed in but Convex returns null, check browser console for errors.
        </p>
      </div>
    </div>
  );
}
