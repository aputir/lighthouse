import { getTranslations } from "next-intl/server";
import { InviteForm } from "./invite-form";
import { getPendingInvites, getStudents } from "./queries";

export default async function RosterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.roster");
  const students = await getStudents();
  const pendingInvites = await getPendingInvites();

  const pendingCount =
    locale === "fa"
      ? pendingInvites.length.toLocaleString("fa-IR")
      : pendingInvites.length.toString();
  const enrolledCount =
    locale === "fa" ? students.length.toLocaleString("fa-IR") : students.length.toString();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Invite form */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("invite")}</h2>
        <InviteForm locale={locale} />
      </section>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            {t("pendingInvites")} ({pendingCount})
          </h2>
          <ul className="space-y-1">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="text-sm text-muted-foreground">
                {invite.email}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Students table */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          {t("enrolled")} ({enrolledCount})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-start">{t("name")}</th>
                <th className="py-2 text-start">{t("email")}</th>
                <th className="py-2 text-start">{t("studentId")}</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    {t("noStudents")}
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.email}</td>
                    <td className="py-2">{s.studentId ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
