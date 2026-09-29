"use server";

import { auth } from "@/lib/auth";
import { generateInviteToken } from "@/lib/nanoid";
import { db, invites } from "@lighthouse/db";
import { revalidatePath } from "next/cache";

export async function createInvite(formData: FormData): Promise<string> {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email") as string;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Valid email required");
  }

  const token = generateInviteToken();
  await db
    .insert(invites)
    .values({
      email: email.toLowerCase().trim(),
      token,
      createdBy: session.user.id,
    })
    .onConflictDoUpdate({
      target: invites.email,
      set: {
        token,
        createdBy: session.user.id,
        usedAt: null,
      },
    });

  revalidatePath("/[locale]/staff/roster", "page");
  return token;
}
