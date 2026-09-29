"use server";
import { db } from "@lighthouse/db";
import { invites, users } from "@lighthouse/db";
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function activateAccount(formData: FormData) {
  const token = formData.get("token") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "fa";

  const [invite] = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

  if (!invite || invite.usedAt) throw new Error("Invalid or used invite");

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      email: invite.email,
      passwordHash: hashSync(password, 12),
      name,
      role: "student",
    });
    await tx.update(invites).set({ usedAt: new Date() }).where(eq(invites.id, invite.id));
  });

  redirect(`/${locale}/login`);
}
