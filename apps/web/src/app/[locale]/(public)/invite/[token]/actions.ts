"use server";
import { db, invites, users } from "@lighthouse/db";
import { hash } from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function activateAccount(formData: FormData) {
  const token = formData.get("token") as string;
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "fa";

  if (!token || typeof token !== "string") {
    throw new Error("Invalid token");
  }
  if (!name || name.length === 0) {
    throw new Error("Name is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await hash(password, 12);

  await db.transaction(async (tx) => {
    const [invite] = await tx
      .update(invites)
      .set({ usedAt: new Date() })
      .where(and(eq(invites.token, token), isNull(invites.usedAt)))
      .returning();

    if (!invite) {
      throw new Error("Invalid or already used invite");
    }

    await tx.insert(users).values({
      email: invite.email,
      passwordHash,
      name,
      role: "student",
    });
  });

  redirect(`/${locale}/login`);
}
