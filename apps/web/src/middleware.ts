import { routing } from "@/i18n/routing";
import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const protectedPatterns = [/\/[a-z]{2}\/(dashboard|missions|crew|profile)/, /\/[a-z]{2}\/staff/];

export default auth((req) => {
  try {
    const isProtected = protectedPatterns.some((p) => p.test(req.nextUrl.pathname));

    if (isProtected) {
      const session = req.auth;
      if (!session?.user) {
        const locale = req.nextUrl.pathname.split("/")[1] ?? "fa";
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      }
      // Staff-only routes
      if (req.nextUrl.pathname.includes("/staff") && session.user.role === "student") {
        const locale = req.nextUrl.pathname.split("/")[1] ?? "fa";
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
    }
  } catch (error) {
    console.error("Middleware auth error:", error);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
