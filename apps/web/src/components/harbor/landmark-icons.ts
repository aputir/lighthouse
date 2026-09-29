export interface LandmarkMeta {
  index: number;
  name: string;
  nameFa: string;
  topic: string;
  topicFa: string;
  icon: string;
  descriptionEn: string;
  descriptionFa: string;
  missionEn: string;
  missionFa: string;
}

export const LANDMARK_DETAILS: LandmarkMeta[] = [
  {
    index: 0,
    name: "The Lighthouse",
    nameFa: "فانوس دریایی",
    topic: "Classes · Encapsulation",
    topicFa: "کلاس‌ها · کپسوله‌سازی",
    icon: "🏮",
    descriptionEn: "The guiding flame at the heart of the starlit harbor.",
    descriptionFa: "شعله راهنما در قلب بندرگاه پرستاره.",
    missionEn: "Wake the lamp",
    missionFa: "بیدار کردن فانوس",
  },
  {
    index: 1,
    name: "Arrival Docks",
    nameFa: "اسکله ورود",
    topic: "Inheritance · Composition",
    topicFa: "وراثت · ترکیب",
    icon: "⚓",
    descriptionEn: "Welcoming returning ships from deep drifts.",
    descriptionFa: "خوش‌آمدگویی به کشتی‌های بازگشته از دوردست.",
    missionEn: "Welcome the fleet",
    missionFa: "استقبال از ناوگان",
  },
  {
    index: 2,
    name: "Signal Tower",
    nameFa: "برج سیگنال",
    topic: "Interfaces · Polymorphism",
    topicFa: "واسط‌ها · چندریختی",
    icon: "📡",
    descriptionEn: "Broadcasting navigation codes across the frequencies.",
    descriptionFa: "پخش کدهای ناوبری در سراسر فرکانس‌ها.",
    missionEn: "The signal code",
    missionFa: "کد سیگنال",
  },
  {
    index: 3,
    name: "Tide Observatory",
    nameFa: "رصدخانه جزر و مد",
    topic: "Observer Pattern",
    topicFa: "الگوی ناظر (Observer)",
    icon: "🔭",
    descriptionEn: "Watching stellar tides and alerting the harbor watch.",
    descriptionFa: "رصد امواج ستاره‌ای و هشدار به دیده‌بانان بندر.",
    missionEn: "Listen to the tide",
    missionFa: "شنیدن صدای جزر و مد",
  },
  {
    index: 4,
    name: "Fogway Buoys",
    nameFa: "شناورهای مه",
    topic: "Strategy Pattern",
    topicFa: "الگوی راهبرد (Strategy)",
    icon: "🪔",
    descriptionEn: "Guiding vessels safely through shifting sea mist.",
    descriptionFa: "هدایت شناورها از میان مه متغیر دریا.",
    missionEn: "Find a way through",
    missionFa: "یافتن مسیر در مه",
  },
  {
    index: 5,
    name: "The Shipyard",
    nameFa: "کشتی‌سازی",
    topic: "Factory · Builder",
    topicFa: "الگوی کارخانه و سازنده (Factory / Builder)",
    icon: "🚢",
    descriptionEn: "Crafting sturdy vessels engineered for long voyages.",
    descriptionFa: "ساخت کشتی‌های استوار برای سفرهای دور.",
    missionEn: "Build for the voyage",
    missionFa: "ساخت برای سفر دریایی",
  },
  {
    index: 6,
    name: "Harbor Control",
    nameFa: "کنترل بندر",
    topic: "Command · State",
    topicFa: "الگوی فرمان و وضعیت (Command / State)",
    icon: "🧭",
    descriptionEn: "Orchestrating traffic and port state with discipline.",
    descriptionFa: "هماهنگی ترافیک و وضعیت بندر با انضباط دقیق.",
    missionEn: "Keep the harbor moving",
    missionFa: "تداوم حرکت بندرگاه",
  },
  {
    index: 7,
    name: "Relay Station",
    nameFa: "ایستگاه رله",
    topic: "Decorator · Adapter",
    topicFa: "الگوی تزیین‌کننده و تطبیق‌دهنده (Decorator / Adapter)",
    icon: "📻",
    descriptionEn: "Bridging archaic frequencies with modern networks.",
    descriptionFa: "پیوند فرکانس‌های کهن با شبکه‌های نوین.",
    missionEn: "Reconnect the old radio",
    missionFa: "وصل مجدد رادیوی کهن",
  },
];
