"use server";

import { auth } from "@/lib/auth";
import { computeLandmarkStage, computeLumens, generateShipLogEntry } from "@/lib/progression";
import {
  assessments,
  chapters,
  db,
  landmarkStates,
  landmarkThresholds,
  missions,
  shipLogs,
} from "@lighthouse/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** Upsert a draft score for one student on one mission */
export async function saveDraftScore(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const missionId = formData.get("missionId") as string;
  const userId = formData.get("userId") as string;
  const rawScoreStr = formData.get("rawScore") as string | null;

  if (!missionId || !userId) {
    throw new Error("Mission ID and User ID are required");
  }

  const rawScore =
    rawScoreStr !== null && rawScoreStr.trim() !== "" ? Number.parseFloat(rawScoreStr) : null;

  if (rawScore !== null && (Number.isNaN(rawScore) || rawScore < 0 || rawScore > 100)) {
    throw new Error("Invalid raw score (must be between 0 and 100)");
  }

  await db
    .insert(assessments)
    .values({ missionId, userId, rawScore, state: "draft" })
    .onConflictDoUpdate({
      target: [assessments.missionId, assessments.userId],
      set: { rawScore, state: "draft", updatedAt: new Date() },
    });

  revalidatePath("/[locale]/staff/grades/[missionId]", "page");
  revalidatePath("/[locale]/staff/grades", "page");
}

/** Publish all draft assessments for a mission — atomically computes Lumens + updates world */
export async function publishMissionScores(missionId: string, courseId: string): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  if (!missionId || !courseId) {
    throw new Error("Mission ID and Course ID are required");
  }

  const [mission] = await db.select().from(missions).where(eq(missions.id, missionId)).limit(1);
  if (!mission) throw new Error("Mission not found");

  // Get the chapter to find landmark index (chapter order - 1)
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, mission.chapterId))
    .limit(1);
  if (!chapter) throw new Error("Chapter not found");

  const landmarkIndex = chapter.order - 1; // chapters are 1-indexed, landmarks are 0-indexed

  const draftAssessments = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.missionId, missionId), eq(assessments.state, "draft")));

  if (draftAssessments.length === 0) {
    throw new Error("No draft assessments to publish");
  }

  await db.transaction(async (tx) => {
    // 1. Compute and update each assessment
    for (const assessment of draftAssessments) {
      const lumens =
        assessment.rawScore !== null ? computeLumens(assessment.rawScore, mission.maxLumens) : 0;

      await tx
        .update(assessments)
        .set({
          lumens,
          state: "published",
          publishedBy: session.user.id,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(assessments.id, assessment.id));
    }

    // 2. Aggregate total lumens for this landmark
    const allPublished = await tx
      .select({ lumens: assessments.lumens })
      .from(assessments)
      .innerJoin(missions, eq(assessments.missionId, missions.id))
      .innerJoin(chapters, eq(missions.chapterId, chapters.id))
      .where(
        and(
          eq(chapters.courseId, courseId),
          eq(chapters.order, chapter.order),
          eq(assessments.state, "published"),
        ),
      );

    const totalLumens = allPublished.reduce((sum, a) => sum + (a.lumens ?? 0), 0);

    // 3. Get thresholds for this landmark
    const [threshold] = await tx
      .select()
      .from(landmarkThresholds)
      .where(
        and(
          eq(landmarkThresholds.courseId, courseId),
          eq(landmarkThresholds.landmarkIndex, landmarkIndex),
        ),
      )
      .limit(1);

    const thresholdConfig = threshold ?? {
      toUnderRestoration: 500,
      toOperational: 1500,
      toFlourishing: 3000,
    };

    const newStage = computeLandmarkStage(totalLumens, thresholdConfig);

    // 4. Get current stage to detect transitions
    const [currentState] = await tx
      .select()
      .from(landmarkStates)
      .where(
        and(eq(landmarkStates.courseId, courseId), eq(landmarkStates.landmarkIndex, landmarkIndex)),
      )
      .limit(1);

    const stageChanged = !currentState || currentState.stage !== newStage;

    // 5. Upsert landmark state
    await tx
      .insert(landmarkStates)
      .values({ courseId, landmarkIndex, stage: newStage, totalLumens })
      .onConflictDoUpdate({
        target: [landmarkStates.courseId, landmarkStates.landmarkIndex],
        set: { stage: newStage, totalLumens, updatedAt: new Date() },
      });

    // 6. Emit Ship's Log if stage changed
    if (stageChanged) {
      const { bodyFa, bodyEn } = generateShipLogEntry(landmarkIndex, newStage);
      await tx.insert(shipLogs).values({
        courseId,
        landmarkIndex,
        newStage,
        bodyFa,
        bodyEn,
      });
    }
  });

  revalidatePath("/[locale]/staff/grades/[missionId]", "page");
  revalidatePath("/[locale]/staff/grades", "page");
  revalidatePath("/[locale]/staff/world", "page");
  revalidatePath("/[locale]/staff/logs", "page");
  revalidatePath("/[locale]/harbor", "page");
}
