import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { chapters, courses, missions } from "./schema/courses";
import { users } from "./schema/users";
import { landmarkStates, landmarkThresholds } from "./schema/world";

const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@aput.ir";
const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "admin123456";

const LANDMARKS = [
  {
    order: 1,
    title: "The Lighthouse",
    titleFa: "فانوس دریایی",
    mission: "Wake the lamp",
    missionFa: "بیدار کردن چراغ",
  },
  {
    order: 2,
    title: "Arrival Docks",
    titleFa: "اسکله ورود",
    mission: "Welcome the fleet",
    missionFa: "استقبال از ناوگان",
  },
  {
    order: 3,
    title: "Signal Tower",
    titleFa: "برج سیگنال",
    mission: "The signal code",
    missionFa: "کد سیگنال",
  },
  {
    order: 4,
    title: "Tide Observatory",
    titleFa: "رصدخانه جزر و مد",
    mission: "Listen to the tide",
    missionFa: "شنیدن صدای جزر و مد",
  },
  {
    order: 5,
    title: "Fogway Buoys",
    titleFa: "شناورهای مه",
    mission: "Find a way through",
    missionFa: "یافتن مسیر در مه",
  },
  {
    order: 6,
    title: "The Shipyard",
    titleFa: "کشتی‌سازی",
    mission: "Build for the voyage",
    missionFa: "ساخت برای سفر",
  },
  {
    order: 7,
    title: "Harbor Control",
    titleFa: "کنترل بندر",
    mission: "Keep the harbor moving",
    missionFa: "هدایت بندر",
  },
  {
    order: 8,
    title: "Relay Station",
    titleFa: "ایستگاه رله",
    mission: "Reconnect the old radio",
    missionFa: "وصل مجدد رادیو",
  },
];

async function seed() {
  console.log("Seeding database...");

  // 1. Seed Owner
  const [existingOwner] = await db.select().from(users).where(eq(users.email, ownerEmail)).limit(1);
  if (!existingOwner) {
    await db.insert(users).values({
      email: ownerEmail,
      passwordHash: hashSync(ownerPassword, 12),
      name: "Head TA (Admin)",
      role: "owner",
    });
    console.log(`✓ Owner created: ${ownerEmail} (password: ${ownerPassword})`);
  } else {
    console.log(`✓ Owner already exists: ${ownerEmail}`);
  }

  // 2. Seed Active Course
  let [course] = await db.select().from(courses).where(eq(courses.slug, "ap-autumn-2026")).limit(1);
  if (!course) {
    const [newCourse] = await db
      .insert(courses)
      .values({
        name: "Advanced Programming — Autumn 2026",
        nameFa: "برنامه‌نویسی پیشرفته — پاییز ۱۴۰۵",
        slug: "ap-autumn-2026",
        semester: "Autumn 2026",
        active: true,
      })
      .returning();
    course = newCourse!;
    console.log(`✓ Course created: ${course.name}`);
  } else {
    console.log(`✓ Course already exists: ${course.name}`);
  }

  // 3. Seed Chapters & Missions & Landmark States
  for (const lm of LANDMARKS) {
    const landmarkIndex = lm.order - 1;

    let [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.courseId, course.id))
      .where(eq(chapters.order, lm.order))
      .limit(1);

    if (!chapter) {
      const [newChapter] = await db
        .insert(chapters)
        .values({
          courseId: course.id,
          title: lm.title,
          titleFa: lm.titleFa,
          order: lm.order,
        })
        .returning();
      chapter = newChapter!;

      await db.insert(missions).values({
        chapterId: chapter.id,
        title: lm.mission,
        titleFa: lm.missionFa,
        maxLumens: 100,
        order: 1,
      });
    }

    // Landmark state
    await db
      .insert(landmarkStates)
      .values({
        courseId: course.id,
        landmarkIndex,
        stage: "dormant",
        totalLumens: 0,
      })
      .onConflictDoNothing();

    // Landmark thresholds
    await db
      .insert(landmarkThresholds)
      .values({
        courseId: course.id,
        landmarkIndex,
        toUnderRestoration: 500,
        toOperational: 1500,
        toFlourishing: 3000,
      })
      .onConflictDoNothing();
  }

  console.log("✓ All 8 landmarks, chapters, missions, and thresholds seeded successfully.");
}

seed().catch(console.error);
