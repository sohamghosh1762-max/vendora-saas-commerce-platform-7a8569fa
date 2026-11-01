import { describe, it, expect, beforeEach } from "vitest";
import {
  SUPER_ADMIN_ROLE,
  generateSalt,
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  authenticateSuperAdminCredentials,
  setSuperAdminConfigForTesting,
  setSuperAdminUnconfiguredForTesting,
  resetSuperAdminConfigForTesting,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  handleGetDashboardData,
  handleGetStatus,
  handleLogin,
  handleLogout,
  type SuperAdminSessionPayload,
} from "@/lib/super-admin-auth.server";

describe("Super Admin Server-Side Authentication & Security", () => {
  const TEST_EMAIL = "test-admin@vendora.com";
  const TEST_PASSWORD = "StrongSecureAdminPassword2026!";
  const TEST_SALT = generateSalt(16);
  const TEST_HASH = hashPassword(TEST_PASSWORD, TEST_SALT);
  const TEST_SECRET = "super_secure_test_session_secret_32chars_long_minimum";

  beforeEach(() => {
    resetSuperAdminConfigForTesting();
  });

  describe("Cryptographic Hashing & Verification", () => {
    it("generates a distinct random 16-byte salt", () => {
      const salt1 = generateSalt(16);
      const salt2 = generateSalt(16);
      expect(salt1).toHaveLength(32); // 16 bytes hex
      expect(salt2).toHaveLength(32);
      expect(salt1).not.toBe(salt2);
    });

    it("hashes password with PBKDF2-SHA256 and verifies correctly", () => {
      const salt = generateSalt(16);
      const hash = hashPassword(TEST_PASSWORD, salt);

      expect(verifyPassword(TEST_PASSWORD, hash, salt)).toBe(true);
      expect(verifyPassword("WrongPassword123!", hash, salt)).toBe(false);
      expect(verifyPassword("", hash, salt)).toBe(false);
    });

    it("fails verification safely if hash or salt is corrupted", () => {
      expect(verifyPassword(TEST_PASSWORD, "corrupt", TEST_SALT)).toBe(false);
      expect(verifyPassword(TEST_PASSWORD, TEST_HASH, "")).toBe(false);
    });
  });

  describe("Session Token Signing & Validation", () => {
    it("signs and verifies valid Super Admin session tokens", () => {
      const payload: SuperAdminSessionPayload = {
        sessionId: "sess_123456",
        email: TEST_EMAIL,
        role: SUPER_ADMIN_ROLE,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      const token = signSessionToken(payload, TEST_SECRET);
      expect(token).toContain(".");

      const verified = verifySessionToken(token, TEST_SECRET);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(TEST_EMAIL);
      expect(verified?.role).toBe(SUPER_ADMIN_ROLE);
      expect(verified?.sessionId).toBe("sess_123456");
    });

    it("rejects tampered session tokens", () => {
      const payload: SuperAdminSessionPayload = {
        sessionId: "sess_123456",
        email: TEST_EMAIL,
        role: SUPER_ADMIN_ROLE,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      const token = signSessionToken(payload, TEST_SECRET);
      const tampered = token + "xyz";

      expect(verifySessionToken(tampered, TEST_SECRET)).toBeNull();
    });

    it("rejects expired session tokens", () => {
      const payload: SuperAdminSessionPayload = {
        sessionId: "sess_expired",
        email: TEST_EMAIL,
        role: SUPER_ADMIN_ROLE,
        issuedAt: Date.now() - 7200000,
        expiresAt: Date.now() - 3600000, // expired 1 hour ago
      };

      const token = signSessionToken(payload, TEST_SECRET);
      expect(verifySessionToken(token, TEST_SECRET)).toBeNull();
    });

    it("rejects tokens verified with wrong secret key", () => {
      const payload: SuperAdminSessionPayload = {
        sessionId: "sess_123456",
        email: TEST_EMAIL,
        role: SUPER_ADMIN_ROLE,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      const token = signSessionToken(payload, TEST_SECRET);
      expect(verifySessionToken(token, "wrong_secret_key_123456789012345678")).toBeNull();
    });

    it("rejects non-SUPER_ADMIN roles embedded in tokens", () => {
      // Malicious attempt to spoof admin using another role
      const payload = {
        sessionId: "sess_fake",
        email: "vendor@test.com",
        role: "vendor" as unknown as typeof SUPER_ADMIN_ROLE,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };

      const token = signSessionToken(payload as SuperAdminSessionPayload, TEST_SECRET);
      expect(verifySessionToken(token, TEST_SECRET)).toBeNull();
    });
  });

  describe("Authentication Workflow & Safeguards", () => {
    it("safely blocks authentication when administrator is unconfigured", async () => {
      setSuperAdminUnconfiguredForTesting();

      const result = await authenticateSuperAdminCredentials(
        "admin@vendora.com",
        "SomePassword123!",
        "ip_1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Administrator authentication is unconfigured");
    });

    it("authenticates successfully with default development administrator credentials", async () => {
      resetSuperAdminConfigForTesting();

      const result = await authenticateSuperAdminCredentials(
        "admin@vendora.com",
        "vendora123",
        "ip_dev_default",
      );

      expect(result.success).toBe(true);
      expect(result.admin?.email).toBe("admin@vendora.com");
      expect(result.admin?.role).toBe(SUPER_ADMIN_ROLE);
    });

    it("authenticates successfully with valid provisioned credentials", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const result = await authenticateSuperAdminCredentials(TEST_EMAIL, TEST_PASSWORD, "ip_valid");

      expect(result.success).toBe(true);
      expect(result.admin?.email).toBe(TEST_EMAIL);
      expect(result.admin?.role).toBe(SUPER_ADMIN_ROLE);
    });

    it("returns generic error message on invalid password (no info disclosure)", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const result = await authenticateSuperAdminCredentials(
        TEST_EMAIL,
        "IncorrectPassword123!",
        "ip_bad_pass",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid administrator credentials.");
    });

    it("returns generic error message on non-existent administrator email", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const result = await authenticateSuperAdminCredentials(
        "nonexistent@vendora.com",
        TEST_PASSWORD,
        "ip_bad_email",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid administrator credentials.");
    });
  });

  describe("Rate Limiting Protection Against Brute Force", () => {
    it("allows up to 4 failed attempts and locks out on the 5th attempt", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const key = "rate_limit_test_key";

      // 4 failed attempts: not locked out yet
      for (let i = 1; i <= 4; i++) {
        const res = await authenticateSuperAdminCredentials(TEST_EMAIL, "Wrong!", key);
        expect(res.success).toBe(false);
        expect(res.rateLimited).toBeFalsy();
      }

      // 5th failed attempt: triggers lockout
      const fifthAttempt = await authenticateSuperAdminCredentials(TEST_EMAIL, "Wrong!", key);
      expect(fifthAttempt.success).toBe(false);
      expect(fifthAttempt.rateLimited).toBe(true);
      expect(fifthAttempt.retryAfterSeconds).toBeGreaterThan(0);
      expect(fifthAttempt.error).toContain("Too many failed authentication attempts");

      // 6th attempt while locked is blocked immediately before password check
      const lockedCheck = checkRateLimit(key);
      expect(lockedCheck.locked).toBe(true);
    });

    it("clears rate limit attempts upon successful authentication", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const key = "clear_rate_limit_key";

      // Record 3 failed attempts
      recordFailedAttempt(key);
      recordFailedAttempt(key);
      recordFailedAttempt(key);

      // Now login successfully
      const successRes = await authenticateSuperAdminCredentials(TEST_EMAIL, TEST_PASSWORD, key);
      expect(successRes.success).toBe(true);

      // Check that rate limiter was cleared
      expect(checkRateLimit(key).locked).toBe(false);
    });
  });

  describe("Server Handlers & Authorization", () => {
    it("handleGetStatus reports unconfigured when environment is unprovisioned", async () => {
      setSuperAdminUnconfiguredForTesting();
      const status = await handleGetStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.isAuthenticated).toBe(false);
      expect(status.admin).toBeNull();
    });

    it("handleGetStatus reports configured but unauthenticated when no cookie session", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const status = await handleGetStatus();
      expect(status.isConfigured).toBe(true);
      expect(status.isAuthenticated).toBe(false);
      expect(status.admin).toBeNull();
    });

    it("handleGetDashboardData rejects unauthorized requests without active admin session (401)", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const res = await handleGetDashboardData();
      expect(res.success).toBe(false);
      expect(res.statusCode).toBe(401);
      expect(res.error).toContain("Active Super Admin session required");
    });
  });
});
