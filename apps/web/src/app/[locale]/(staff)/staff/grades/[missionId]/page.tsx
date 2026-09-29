import { formatLocaleInteger } from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMissionGradeData } from "../queries";
import { GradeGrid } from "./grade-grid";

export default async function GradeMissionPage({
  params,
}: {
  params: Promise<{ locale: string; missionId: string }>;
}) {
  const { locale, missionId } = await params;
  const t = await getTranslations("staff.grades");

  const data = await getMissionGradeData(missionId);
  if (!data) notFound();

  const { course, mission, enrolledStudents, existingAssessments } = data;

  const assessmentMap = new Map(existingAssessments.map((a) => [a.userId, a]));

  const rows = enrolledStudents.map((student) => ({
    student,
    assessment: assessmentMap.get(student.id) ?? null,
  }));

  const draftCount = existingAssessments.filter((a) => a.state === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/staff/grades`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← {t("backToGrades")}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {locale === "fa" ? mission.titleFa : mission.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("maxLumens", { count: formatLocaleInteger(mission.maxLumens, locale) })}
          </p>
        </div>
      </div>

      <GradeGrid
        rows={rows}
        missionId={missionId}
        courseId={course.id}
        draftCount={draftCount}
        locale={locale}
        maxLumens={mission.maxLumens}
      />
    </div>
  );
}
