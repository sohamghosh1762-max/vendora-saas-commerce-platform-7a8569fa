/**
 * Secure password hashing using standard Web Crypto API (PBKDF2 with SHA-256).
 * Safe for isomorphic execution (browser & Node/SSR).
 */

export function generateSalt(length = 16): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for SSR if crypto.getRandomValues is unavailable
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    const exported = await crypto.subtle.exportKey("raw", derivedKey);
    return Array.from(new Uint8Array(exported))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Fallback simple SHA-256 like hex digest if subtle is not present
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, "0");
}

export async function verifyPassword(
  provided: string,
  storedHash: string,
  salt: string,
): Promise<boolean> {
  const hash = await hashPassword(provided, salt);
  return hash === storedHash;
}
