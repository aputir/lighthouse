"use server";

import { auth } from "@/lib/auth";
import { chapters, courses, db, missions } from "@lighthouse/db";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActiveCourse() {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  return course ?? null;
}

export async function createChapter(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const course = await getActiveCourse();
  if (!course) {
    throw new Error("No active course");
  }

  const title = (formData.get("title") as string)?.trim();
  const titleFa = (formData.get("titleFa") as string)?.trim();
  const order = Number.parseInt(formData.get("order") as string, 10);

  if (!title || !titleFa || Number.isNaN(order)) {
    throw new Error("Invalid chapter input");
  }

  await db.insert(chapters).values({
    courseId: course.id,
    title,
    titleFa,
    order,
  });
  revalidatePath("/staff/missions");
}

export async function createMission(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const chapterId = formData.get("chapterId") as string;
  const title = (formData.get("title") as string)?.trim();
  const titleFa = (formData.get("titleFa") as string)?.trim();
  const maxLumens = Number.parseInt(formData.get("maxLumens") as string, 10) || 100;
  const order = Number.parseInt(formData.get("order") as string, 10);

  if (!chapterId || !title || !titleFa || Number.isNaN(order)) {
    throw new Error("Invalid mission input");
  }

  await db.insert(missions).values({
    chapterId,
    title,
    titleFa,
    maxLumens,
    order,
  });
  revalidatePath("/staff/missions");
}

export async function getChaptersWithMissions(courseId: string) {
  const chapterList = await db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .orderBy(asc(chapters.order));

  const missionList = await db.select().from(missions).orderBy(asc(missions.order));

  return chapterList.map((ch) => ({
    ...ch,
    missions: missionList.filter((m) => m.chapterId === ch.id),
  }));
}
