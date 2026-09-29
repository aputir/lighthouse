import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lighthouse/ui";
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {/* Invite form */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("invite")}</h2>
        <InviteForm locale={locale} />
      </section>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <section className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {t("pendingInvites")} (
                <DataValue value={pendingInvites.length} locale={locale} />)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {pendingInvites.map((invite) => (
                  <li key={invite.id} className="text-sm text-muted-foreground">
                    {invite.email}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Students table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("enrolled")} (<DataValue value={students.length} locale={locale} />)
          </h2>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("name")}</TableHead>
                <TableHead className="text-start">{t("email")}</TableHead>
                <TableHead className="text-start">{t("studentId")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    {t("noStudents")}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.studentId ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
