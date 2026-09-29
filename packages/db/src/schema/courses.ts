import { createId } from "@paralleldrive/cuid2";
import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const courses = pgTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(), // e.g. "Advanced Programming — Autumn 2026"
  nameFa: text("name_fa").notNull(),
  slug: text("slug").notNull().unique(), // url-safe, e.g. "ap-autumn-2026"
  semester: text("semester").notNull(), // e.g. "Autumn 2026"
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleFa: text("title_fa").notNull(),
  order: integer("order").notNull(), // display order, 1-indexed
  opensAt: timestamp("opens_at", { withTimezone: true }), // null = immediately open
  closesAt: timestamp("closes_at", { withTimezone: true }), // null = never closes
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const missions = pgTable("missions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  chapterId: text("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleFa: text("title_fa").notNull(),
  description: text("description"),
  descriptionFa: text("description_fa"),
  maxLumens: integer("max_lumens").notNull().default(100), // max Lumens for a perfect score
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    active: boolean("active").notNull().default(true),
  },
  (table) => [uniqueIndex("enrollments_course_user_idx").on(table.courseId, table.userId)],
);

export const crews = pgTable("crews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  shipName: text("ship_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const crewMembers = pgTable(
  "crew_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    crewId: text("crew_id")
      .notNull()
      .references(() => crews.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("crew_members_crew_user_idx").on(table.crewId, table.userId)],
);

export type Course = typeof courses.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Crew = typeof crews.$inferSelect;
export type CrewMember = typeof crewMembers.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type NewChapter = typeof chapters.$inferInsert;
export type NewMission = typeof missions.$inferInsert;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type NewCrew = typeof crews.$inferInsert;
export type NewCrewMember = typeof crewMembers.$inferInsert;
