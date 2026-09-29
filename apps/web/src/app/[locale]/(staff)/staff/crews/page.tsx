import { getTranslations } from "next-intl/server";
import {
  getActiveCourse,
  getCrewsWithMembers,
  getEnrolledStudents,
  removeCrewMember,
} from "./actions";
import { AddCrewForm } from "./add-crew-form";
import { AddMemberForm } from "./add-member-form";

export default async function CrewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.crews");
  const course = await getActiveCourse();
  const crewsWithMembers = course ? await getCrewsWithMembers() : [];
  const enrolledStudents = course ? await getEnrolledStudents() : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {!course && <p className="text-muted-foreground">{t("noActiveCourse")}</p>}

      {/* Add Crew Form */}
      <div className="rounded border p-4">
        <h2 className="font-semibold">{t("createCrew")}</h2>
        <AddCrewForm />
      </div>

      {/* Existing Crews List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("existingCrews")}</h2>
        {crewsWithMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noCrews")}</p>
        ) : (
          crewsWithMembers.map((crew) => {
            const assignedUserIds = new Set(crew.members.map((m) => m.userId));
            const availableForCrew = enrolledStudents.filter((s) => !assignedUserIds.has(s.id));

            return (
              <div key={crew.id} className="rounded border p-4 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
                  <h3 className="font-semibold text-base">{crew.name}</h3>
                  {crew.shipName && (
                    <span className="text-xs text-muted-foreground">
                      {t("ship")}: {crew.shipName}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("members")} (
                    {locale === "fa"
                      ? crew.members.length.toLocaleString("fa-IR")
                      : crew.members.length}
                    )
                  </h4>
                  {crew.members.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t("noMembers")}</p>
                  ) : (
                    <ul className="space-y-1">
                      {crew.members.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between text-sm py-1 border-b border-muted/50 last:border-0"
                        >
                          <span>
                            {m.name}{" "}
                            <span className="text-xs text-muted-foreground">({m.email})</span>
                          </span>
                          <form action={removeCrewMember}>
                            <input type="hidden" name="memberId" value={m.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline ms-2"
                            >
                              {t("removeMember")}
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2">
                  <AddMemberForm crewId={crew.id} availableStudents={availableForCrew} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
