import { db, invites } from "@lighthouse/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActivateForm } from "./activate-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const [invite] = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

  if (!invite || invite.usedAt) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-sunken p-4">
      <ActivateForm token={token} email={invite.email} locale={locale} />
    </main>
  );
}
