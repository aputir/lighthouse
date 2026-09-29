import { auth } from "@/lib/auth";
import { courses, crewMembers, crews, db, enrollments, users } from "@lighthouse/db";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function getActiveCourse() {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  return course ?? null;
}

export async function getCrewsWithMembers() {
  const course = await getActiveCourse();
  if (!course) return [];

  const crewList = await db
    .select()
    .from(crews)
    .where(eq(crews.courseId, course.id))
    .orderBy(asc(crews.createdAt));

  if (crewList.length === 0) {
    return [];
  }

  const crewIds = crewList.map((c) => c.id);
  const membersList = await db
    .select({
      id: crewMembers.id,
      crewId: crewMembers.crewId,
      userId: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
    })
    .from(crewMembers)
    .innerJoin(users, eq(crewMembers.userId, users.id))
    .where(inArray(crewMembers.crewId, crewIds));

  return crewList.map((c) => ({
    ...c,
    members: membersList.filter((m) => m.crewId === c.id),
  }));
}

export async function getEnrolledStudents() {
  const course = await getActiveCourse();
  if (!course) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      studentId: users.studentId,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.active, true)));
}
