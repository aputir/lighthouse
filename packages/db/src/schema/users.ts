import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["owner", "staff", "student"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  studentId: text("student_id"), // UT student ID, optional
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invites = pgTable("invites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  token: text("token").notNull().unique(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invite = typeof invites.$inferSelect;
export type NewInvite = typeof invites.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
