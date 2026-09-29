import { auth } from "@/lib/auth";
import { assessments, chapters, courses, db, enrollments, missions, users } from "@lighthouse/db";
import { and, count, eq } from "drizzle-orm";

export async function getGradesOverview() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, course.id))
    .orderBy(chapters.order);

  const missionList = await db
    .select({
      id: missions.id,
      chapterId: missions.chapterId,
      title: missions.title,
      titleFa: missions.titleFa,
      maxLumens: missions.maxLumens,
      order: missions.order,
    })
    .from(missions)
    .innerJoin(chapters, eq(missions.chapterId, chapters.id))
    .where(eq(chapters.courseId, course.id))
    .orderBy(missions.order);

  const draftCounts = await db
    .select({ missionId: assessments.missionId, count: count() })
    .from(assessments)
    .where(eq(assessments.state, "draft"))
    .groupBy(assessments.missionId);

  const draftMap = new Map(draftCounts.map((d) => [d.missionId, d.count]));

  return {
    course,
    chapters: chapterList,
    missions: missionList,
    draftMap,
  };
}

export async function getMissionGradeData(missionId: string) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const [mission] = await db
    .select({
      id: missions.id,
      chapterId: missions.chapterId,
      title: missions.title,
      titleFa: missions.titleFa,
      maxLumens: missions.maxLumens,
      order: missions.order,
    })
    .from(missions)
    .innerJoin(chapters, eq(missions.chapterId, chapters.id))
    .where(and(eq(missions.id, missionId), eq(chapters.courseId, course.id)))
    .limit(1);

  if (!mission) return null;

  // All active enrolled students for the active course
  const enrolledStudents = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));

  // Existing assessments for this mission
  const existingAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.missionId, missionId));

  return {
    course,
    mission,
    enrolledStudents,
    existingAssessments,
  };
}
