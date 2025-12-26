/**
 * Shared Bunny utilities for Convex
 */

/**
 * Generate SHA256 hash (HEX) using Web Crypto API
 * Used by webhook for signature validation
 */
export async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
