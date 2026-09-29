import type { ShipLog } from "@lighthouse/db";

export function ShipLogFeed({
  logs,
  locale,
}: {
  logs: ShipLog[];
  locale: string;
}) {
  if (logs.length === 0) return null;
  const isFa = locale === "fa";

  return (
    <section className="mx-auto mt-10 max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold">{isFa ? "دفتر کشتی" : "Ship's Log"}</h2>
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
