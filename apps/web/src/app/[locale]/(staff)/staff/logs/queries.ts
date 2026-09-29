import { auth } from "@/lib/auth";
import { courses, db, shipLogs } from "@lighthouse/db";
import { desc, eq } from "drizzle-orm";

export async function getShipLogs() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const logs = await db
    .select()
    .from(shipLogs)
    .where(eq(shipLogs.courseId, course.id))
    .orderBy(desc(shipLogs.triggeredAt));

  return {
    course,
    logs,
  };
}
