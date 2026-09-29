import { auth } from "@/lib/auth";
import { getActiveCourse, getStudentCrew } from "@/lib/student-data";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataValue,
  EmptyState,
} from "@lighthouse/ui";
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
  if (!course) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noCourse")} />
      </div>
    );
  }

  const crewData = await getStudentCrew(session.user.id, course.id);

  if (!crewData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noCrew")} />
      </div>
    );
  }

  const { crew, members } = crewData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-bold">{crew.name}</CardTitle>
            {crew.shipName && (
              <span className="text-sm text-muted-foreground">
                {t("ship")}
                {crew.shipName}
              </span>
            )}
          </div>
          <CardDescription className="text-sm">
            {t("members")} (<DataValue value={members.length} locale={locale} />)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {members.map((m) => {
              const initials = m.name ? m.name.slice(0, 2).toUpperCase() : "?";
              return (
                <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar size="sm">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{m.name}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
