import { auth } from "@/lib/auth";
import { courses, db, landmarkStates, landmarkThresholds } from "@lighthouse/db";
import { eq } from "drizzle-orm";

export async function getWorldState() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const [states, thresholds] = await Promise.all([
    db.select().from(landmarkStates).where(eq(landmarkStates.courseId, course.id)),
    db.select().from(landmarkThresholds).where(eq(landmarkThresholds.courseId, course.id)),
  ]);

  return {
    course,
    states,
    thresholds,
  };
}
