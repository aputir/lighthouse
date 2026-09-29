/**
 * Typed, validated environment configuration.
 * All env access in the app MUST go through this module — never raw process.env.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  database: {
    url: requireEnv("DATABASE_URL"),
  },
  auth: {
    secret: requireEnv("AUTH_SECRET"),
    url: process.env.AUTH_URL ?? "http://localhost:3000",
  },
} as const;
