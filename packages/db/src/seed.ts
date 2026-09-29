import { hashSync } from "bcryptjs";
import { db } from "./client";
import { users } from "./schema/users";

const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@aput.ir";
const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "change-me";

async function seed() {
  console.log("Seeding owner account...");
  await db
    .insert(users)
    .values({
      email: ownerEmail,
      passwordHash: hashSync(ownerPassword, 12),
      name: "Course Admin",
      role: "owner",
    })
    .onConflictDoNothing();
  console.log(`✓ Owner: ${ownerEmail}`);
}

seed().catch(console.error);
