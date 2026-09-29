import { db, invites } from "@lighthouse/db";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActivateForm } from "./activate-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const t = await getTranslations("auth");
  const [invite] = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

  if (!invite || invite.usedAt) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t("activateTitle")}</h1>
        <p className="text-sm text-muted-foreground">{invite.email}</p>
        <ActivateForm token={token} email={invite.email} locale={locale} />
      </div>
    </main>
  );
}
