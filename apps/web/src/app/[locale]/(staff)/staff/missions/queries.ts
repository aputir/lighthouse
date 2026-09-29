import { auth } from "@/lib/auth";
import { chapters, courses, db, missions } from "@lighthouse/db";
import { asc, eq, inArray } from "drizzle-orm";

export async function getActiveCourse() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  return course ?? null;
}

export async function getChaptersWithMissions(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .orderBy(asc(chapters.order));

  if (chapterList.length === 0) {
    return [];
  }

  const chapterIds = chapterList.map((ch) => ch.id);
  const missionList = await db
    .select()
    .from(missions)
    .where(inArray(missions.chapterId, chapterIds))
    .orderBy(asc(missions.order));

  return chapterList.map((ch) => ({
    ...ch,
    missions: missionList.filter((m) => m.chapterId === ch.id),
  }));
}
