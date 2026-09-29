import { db, users } from "@lighthouse/db";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const authSecret = (() => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PHASE !== "phase-production-build"
    ) {
      throw new Error("Missing required environment variable: AUTH_SECRET in production");
    }
    return "lighthouse-auth-secret-for-development-mode-min32chars";
  }
  return secret;
})();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);
        if (!user) return null;
        const valid = await compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
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
    signIn: "/login", // next-intl middleware adds locale prefix
  },
  secret: authSecret,
});
