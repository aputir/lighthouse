"use server";

import { auth } from "@/lib/auth";
import { generateInviteToken } from "@/lib/nanoid";
import { courses, db, enrollments, invites, users } from "@lighthouse/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createInvite(formData: FormData): Promise<string> {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email") as string;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Valid email required");
  }

  const token = generateInviteToken();
  await db
    .insert(invites)
    .values({
      email: email.toLowerCase().trim(),
      token,
      createdBy: session.user.id,
    })
    .onConflictDoUpdate({
      target: invites.email,
      set: {
        token,
        createdBy: session.user.id,
        usedAt: null,
      },
    });

  revalidatePath("/staff/roster");
  return token;
}

export async function getStudents() {
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
