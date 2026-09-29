import { auth } from "@/lib/auth";
import { getStudentProgress } from "@/lib/student-data";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const isFa = locale === "fa";
  const t = await getTranslations("student.dashboard");

  const progress = await getStudentProgress(session.user.id);

  if (!progress) {
    return <p className="text-muted-foreground">{t("noCourse")}</p>;
  }

  const nextMission = progress.missions.find(
    (m) => !m.assessment || m.assessment.state === "draft",
  );

  const displayLumens = isFa
    ? progress.totalLumens.toLocaleString("fa-IR")
    : progress.totalLumens.toLocaleString("en-US");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{isFa ? progress.rank.labelFa : progress.rank.label}</h1>
        <p className="mt-1 text-muted-foreground">
          {displayLumens} {t("lumens")}
        </p>
      </div>

      {nextMission && (
        <div className="rounded border p-4">
          <p className="text-sm font-medium text-muted-foreground">{t("nextMission")}</p>
          <p className="mt-1 font-semibold">
            {isFa ? nextMission.mission.titleFa : nextMission.mission.title}
          </p>
        </div>
      )}
    </div>
  );
}
