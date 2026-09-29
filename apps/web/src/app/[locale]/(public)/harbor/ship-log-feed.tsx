"use client";

import type { ShipLog } from "@lighthouse/db";
import { useTranslations } from "next-intl";

export function ShipLogFeed({
  logs,
  locale,
  title,
}: {
  logs: ShipLog[];
  locale: string;
  title?: string;
}) {
  let t: (key: string) => string;
  try {
    t = useTranslations("harbor");
  } catch {
    const isFa = locale === "fa";
    t = (key: string) => {
      if (key === "shipLog") return isFa ? "دفتر کشتی" : "Ship's Log";
      if (key === "noLogs")
        return isFa ? "هنوز گزارشی در دفتر کشتی ثبت نشده است." : "No logs recorded yet.";
      return key;
    };
  }

  if (logs.length === 0) return null;
  const isFa = locale === "fa";

  return (
    <section className="mx-auto mt-12 max-w-2xl relative z-10">
      <h2 className="mb-4 text-lg font-semibold text-slate-200">{title ?? t("shipLog")}</h2>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li
            key={log.id}
            className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 text-sm shadow-md backdrop-blur-sm transition-colors hover:border-slate-700/80"
          >
            <p className="font-medium text-slate-200">{isFa ? log.bodyFa : log.bodyEn}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(log.triggeredAt).toLocaleDateString(isFa ? "fa-IR" : "en-US")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
