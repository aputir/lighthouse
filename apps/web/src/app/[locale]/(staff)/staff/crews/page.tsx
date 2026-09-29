import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DataValue,
  EmptyState,
} from "@lighthouse/ui";
import { getTranslations } from "next-intl/server";
import { removeCrewMember } from "./actions";
import { AddCrewForm } from "./add-crew-form";
import { AddMemberForm } from "./add-member-form";
import { getActiveCourse, getCrewsWithMembers, getEnrolledStudents } from "./queries";

export default async function CrewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.crews");
  const course = await getActiveCourse();

  if (!course) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <EmptyState title={t("noActiveCourse")} />
      </div>
    );
  }

  const crewsWithMembers = await getCrewsWithMembers();
  const enrolledStudents = await getEnrolledStudents();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <AddCrewForm />
      </div>

      {crewsWithMembers.length === 0 ? (
        <EmptyState title={t("noCrews")} action={<AddCrewForm />} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crewsWithMembers.map((crew) => {
            const assignedUserIds = new Set(crew.members.map((m) => m.userId));
            const availableForCrew = enrolledStudents.filter((s) => !assignedUserIds.has(s.id));

            return (
              <Card key={crew.id} className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">{crew.name}</CardTitle>
                      {crew.shipName && (
                        <span className="text-xs text-muted-foreground">
                          {t("ship")}: {crew.shipName}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {t("members")} (<DataValue value={crew.members.length} locale={locale} />)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {crew.members.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t("noMembers")}</p>
                    ) : (
                      <ul className="divide-y divide-border/40 text-sm">
                        {crew.members.map((m) => (
                          <li key={m.id} className="flex items-center justify-between py-1.5">
                            <div>
                              <span className="font-medium">{m.name}</span>
                              <span className="ms-1.5 text-xs text-muted-foreground">
                                ({m.email})
                              </span>
                            </div>
                            <form action={removeCrewMember}>
                              <input type="hidden" name="memberId" value={m.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                              >
                                {t("removeMember")}
                              </Button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </div>
                <CardFooter className="border-t pt-3">
                  <AddMemberForm crewId={crew.id} availableStudents={availableForCrew} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
