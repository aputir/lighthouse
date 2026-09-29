import { auth } from "@/lib/auth";
import { courses, db, enrollments, invites, users } from "@lighthouse/db";
import { and, eq, isNull } from "drizzle-orm";

export async function getStudents() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));
}

export async function getPendingInvites() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  return db.select().from(invites).where(isNull(invites.usedAt));
}
