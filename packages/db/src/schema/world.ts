import { createId } from "@paralleldrive/cuid2";
import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { courses } from "./courses";

export const landmarkStageEnum = pgEnum("landmark_stage", [
  "dormant",
  "under_restoration",
  "operational",
  "flourishing",
]);

// One row per landmark per course (8 landmarks × 1 active course = 8 rows)
export const landmarkStates = pgTable(
  "landmark_states",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    landmarkIndex: integer("landmark_index").notNull(), // 0-7
    stage: landmarkStageEnum("stage").notNull().default("dormant"),
    totalLumens: integer("total_lumens").notNull().default(0), // class lumens assigned to this landmark
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("landmark_states_course_landmark_idx").on(table.courseId, table.landmarkIndex),
  ],
);

// Configurable thresholds for each landmark per course
export const landmarkThresholds = pgTable("landmark_thresholds", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  landmarkIndex: integer("landmark_index").notNull(), // 0-7
  toUnderRestoration: integer("to_under_restoration").notNull().default(500),
  toOperational: integer("to_operational").notNull().default(1500),
  toFlourishing: integer("to_flourishing").notNull().default(3000),
});

// Immutable event log — one entry per milestone (landmark stage advance)
export const shipLogs = pgTable("ship_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  landmarkIndex: integer("landmark_index"), // null for general events
  newStage: landmarkStageEnum("new_stage"),
  bodyFa: text("body_fa").notNull(),
  bodyEn: text("body_en").notNull(),
  triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LandmarkState = typeof landmarkStates.$inferSelect;
export type NewLandmarkState = typeof landmarkStates.$inferInsert;
export type LandmarkThreshold = typeof landmarkThresholds.$inferSelect;
export type NewLandmarkThreshold = typeof landmarkThresholds.$inferInsert;
export type ShipLog = typeof shipLogs.$inferSelect;
export type NewShipLog = typeof shipLogs.$inferInsert;
export type LandmarkStage = (typeof landmarkStageEnum.enumValues)[number];
