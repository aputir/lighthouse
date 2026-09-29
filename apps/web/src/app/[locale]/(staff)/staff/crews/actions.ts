"use server";

import { auth } from "@/lib/auth";
import { courses, crewMembers, crews, db, enrollments, users } from "@lighthouse/db";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActiveCourse() {
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
    .innerJoin(users, eq(crewMembers.userId, users.id));

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

export async function createCrew(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const course = await getActiveCourse();
  if (!course) throw new Error("No active course");

  const name = (formData.get("name") as string)?.trim();
  const shipName = (formData.get("shipName") as string)?.trim() || null;

  if (!name) throw new Error("Crew name required");

  await db.insert(crews).values({
    courseId: course.id,
    name,
    shipName,
  });

  revalidatePath("/staff/crews");
}

export async function addCrewMember(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const crewId = formData.get("crewId") as string;
  const userId = formData.get("userId") as string;

  if (!crewId || !userId) throw new Error("Crew and user required");

  const [existing] = await db
    .select()
    .from(crewMembers)
    .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)))
    .limit(1);

  if (!existing) {
    await db.insert(crewMembers).values({
      crewId,
      userId,
    });
  }

  revalidatePath("/staff/crews");
}

export async function removeCrewMember(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const memberId = formData.get("memberId") as string;
  if (!memberId) throw new Error("Member ID required");

  await db.delete(crewMembers).where(eq(crewMembers.id, memberId));

  revalidatePath("/staff/crews");
}
