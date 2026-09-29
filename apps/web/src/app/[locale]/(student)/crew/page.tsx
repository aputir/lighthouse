import { auth } from "@/lib/auth";
import { getActiveCourse, getStudentCrew } from "@/lib/student-data";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CrewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("student.crew");
  const course = await getActiveCourse();
  if (!course) return <p className="text-muted-foreground">{t("noCourse")}</p>;

  const crewData = await getStudentCrew(session.user.id, course.id);

  if (!crewData) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("noCrew")}</p>
      </div>
    );
  }

  const { crew, members } = crewData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{crew.name}</h1>
      {crew.shipName && (
        <p className="text-muted-foreground">
          {t("ship")}
          {crew.shipName}
        </p>
      )}
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id} className="rounded border px-3 py-2 text-sm">
            {m.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
