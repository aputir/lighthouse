import {
  assessments,
  chapters,
  courses,
  crewMembers,
  crews,
  db,
  missions,
  users,
} from "@lighthouse/db";
import { and, asc, eq, inArray, sum } from "drizzle-orm";

export const KEEPER_RANKS = [
  { min: 0, key: "apprenticeKeeper", label: "Apprentice Keeper", labelFa: "کارآموز نگهبان" },
  { min: 300, key: "beaconKeeper", label: "Beacon Keeper", labelFa: "نگهبان فانوس" },
  { min: 700, key: "signalKeeper", label: "Signal Keeper", labelFa: "نگهبان سیگنال" },
  { min: 1200, key: "driftNavigator", label: "Drift Navigator", labelFa: "ناوبر جریان" },
  { min: 2000, key: "harborSteward", label: "Harbor Steward", labelFa: "مدیر بندر" },
] as const;

export type KeeperRank = (typeof KEEPER_RANKS)[number];

export function getKeeperRank(totalLumens: number): KeeperRank {
  let rank: KeeperRank = KEEPER_RANKS[0];
  for (const r of KEEPER_RANKS) {
    if (totalLumens >= r.min) rank = r;
  }
  return rank;
}

export async function getStudentProgress(userId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.active, true)).limit(1);
  if (!course) return null;

  const [lumensResult] = await db
    .select({ total: sum(assessments.lumens) })
    .from(assessments)
    .where(
      and(eq(assessments.userId, userId), inArray(assessments.state, ["published", "revised"])),
    );

  const totalLumens = Number(lumensResult?.total ?? 0);
  const rank = getKeeperRank(totalLumens);

  const allMissions = await db
    .select({
      mission: missions,
      chapter: chapters,
      assessment: assessments,
    })
    .from(missions)
    .innerJoin(chapters, eq(missions.chapterId, chapters.id))
    .leftJoin(
      assessments,
      and(eq(assessments.missionId, missions.id), eq(assessments.userId, userId)),
    )
    .where(eq(chapters.courseId, course.id))
    .orderBy(asc(chapters.order), asc(missions.order));

  return { totalLumens, rank, missions: allMissions, courseId: course.id };
}

export async function getStudentCrew(userId: string, courseId: string) {
  const [membership] = await db
    .select({ crewId: crewMembers.crewId })
    .from(crewMembers)
    .innerJoin(crews, eq(crewMembers.crewId, crews.id))
    .where(and(eq(crewMembers.userId, userId), eq(crews.courseId, courseId)))
    .limit(1);

  if (!membership) return null;

  const [crew] = await db
    .select()
    .from(crews)
    .where(and(eq(crews.id, membership.crewId), eq(crews.courseId, courseId)))
    .limit(1);
  if (!crew) return null;

  const members = await db
    .select({ id: users.id, name: users.name })
    .from(crewMembers)
    .innerJoin(users, eq(crewMembers.userId, users.id))
    .where(eq(crewMembers.crewId, crew.id))
    .orderBy(asc(users.name));

  return { crew, members };
}
