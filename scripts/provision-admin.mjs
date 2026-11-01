#!/usr/bin/env node
/**
 * Vendora — Super Admin Provisioning Script
 *
 * Generates cryptographically secure salt, PBKDF2-SHA256 password hash,
 * and high-entropy session secret for server-side Super Admin authentication.
 *
 * Usage:
 *   node scripts/provision-admin.mjs <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/provision-admin.mjs admin@vendora.com SuperSecretPassword123!
 */

import crypto from "node:crypto";

function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
}

function generateSessionSecret(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

const args = process.argv.slice(2);
const email = args[0] || "admin@vendora.com";
const password = args[1];

if (!password) {
  console.error("\x1b[31mError: Password is required.\x1b[0m");
  console.error("Usage: node scripts/provision-admin.mjs <admin-email> <admin-password>");
  console.error("Example: node scripts/provision-admin.mjs admin@vendora.com 'SecurePass123!'");
  process.exit(1);
}

if (password.length < 8) {
  console.error("\x1b[31mError: Administrator password must be at least 8 characters long.\x1b[0m");
  process.exit(1);
}

const salt = generateSalt(16);
const passwordHash = hashPassword(password, salt);
const sessionSecret = generateSessionSecret(32);

console.log("\n\x1b[32m=== Vendora Super Admin Provisioning Successful ===\x1b[0m\n");
console.log(
  "Add the following lines to your \x1b[33m.env.local\x1b[0m file (never commit this file):",
);
console.log("--------------------------------------------------------------------------------");
console.log(`SUPER_ADMIN_EMAIL=${email}`);
console.log(`SUPER_ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`SUPER_ADMIN_PASSWORD_SALT=${salt}`);
console.log(`SUPER_ADMIN_SESSION_SECRET=${sessionSecret}`);
console.log("--------------------------------------------------------------------------------");
console.log("\x1b[36mSecurity Note:\x1b[0m Plaintext password was NOT saved anywhere.");
console.log("The server verifies credentials using constant-time PBKDF2 comparison.\n");
