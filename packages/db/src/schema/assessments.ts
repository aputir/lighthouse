import { createId } from "@paralleldrive/cuid2";
import { integer, pgEnum, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { missions } from "./courses";
import { users } from "./users";

export const assessmentStateEnum = pgEnum("assessment_state", ["draft", "published", "revised"]);

export const assessments = pgTable("assessments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  missionId: text("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Score as percentage 0-100 (raw); Lumens = (rawScore / 100) × maxLumens
  rawScore: real("raw_score"), // null = not assessed yet
  lumens: integer("lumens"), // computed and stored on publish

  state: assessmentStateEnum("state").notNull().default("draft"),

  // Publish audit
  publishedBy: text("published_by").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),

  // Revision audit
  revisedBy: text("revised_by").references(() => users.id),
  revisedAt: timestamp("revised_at", { withTimezone: true }),
  revisionReason: text("revision_reason"),
  previousLumens: integer("previous_lumens"), // stored on revision for delta calculation

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type AssessmentState = (typeof assessmentStateEnum.enumValues)[number];
