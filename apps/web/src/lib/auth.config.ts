import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 * Contains NO database or native Node.js dependencies (no bcrypt, no pg/neon).
 * Used by middleware.ts in Edge runtime.
 */
export const authConfig = {
  providers: [], // Credentials provider added in auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "owner" | "staff" | "student";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "lighthouse-fallback-secret-min32characters-key",
} satisfies NextAuthConfig;
