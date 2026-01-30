import { auth } from "@clerk/nextjs/server";

/**
 * Get the Convex auth token for server-side queries.
 * Returns undefined if no token is available.
 */
export async function getAuthToken() {
  const token = (await (await auth()).getToken({ template: "convex" })) ?? undefined;
  
  // Debug: Log full token payload to diagnose auth issues
  // TODO: Remove after fixing auth
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("[Auth Debug] Full token payload:", JSON.stringify(payload, null, 2));
      console.log("[Auth Debug] Token issuer (iss):", payload.iss);
      console.log("[Auth Debug] Token audience (aud):", payload.aud, "- type:", typeof payload.aud);
      console.log("[Auth Debug] Token subject (sub):", payload.sub);
    } catch {
      console.log("[Auth Debug] Could not decode token");
    }
  } else {
    console.log("[Auth Debug] No token returned from Clerk");
  }
  
  return token;
}
