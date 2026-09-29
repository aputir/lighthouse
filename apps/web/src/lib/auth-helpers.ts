import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

/**
 * Asserts the current user has at least the given role.
 * Role hierarchy: student < staff < owner
 * Redirects to /login if not authenticated or role insufficient.
 */
export async function requireRole(
  minimumRole: "student" | "staff" | "owner",
  locale: string,
): Promise<NonNullable<Session["user"]>> {
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const roleOrder = { student: 0, staff: 1, owner: 2 };
  if ((roleOrder[session.user.role as keyof typeof roleOrder] ?? -1) < roleOrder[minimumRole]) {
    redirect(`/${locale}/login`);
  }

  return session.user;
}
