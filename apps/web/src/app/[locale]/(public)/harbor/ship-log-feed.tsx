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
    <section className="mx-auto mt-10 max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold">{title ?? t("shipLog")}</h2>
      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log.id} className="rounded-lg border bg-card p-3 text-sm shadow-sm">
            <p className="font-medium">{isFa ? log.bodyFa : log.bodyEn}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(log.triggeredAt).toLocaleDateString(isFa ? "fa-IR" : "en-US")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
