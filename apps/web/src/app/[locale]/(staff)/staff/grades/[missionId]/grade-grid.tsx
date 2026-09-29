"use client";

import type { Assessment } from "@lighthouse/db";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { publishMissionScores, saveDraftScore } from "./actions";

interface Row {
  student: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
  assessment: Assessment | null;
}

export function GradeGrid({
  rows,
  missionId,
  courseId,
  draftCount,
  locale,
  maxLumens,
}: {
  rows: Row[];
  missionId: string;
  courseId: string;
  draftCount: number;
  locale: string;
  maxLumens: number;
}) {
  const t = useTranslations("staff.grades");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isFa = locale === "fa";

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      await publishMissionScores(missionId, courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish scores");
    } finally {
      setPublishing(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (index + 1 < rows.length) {
        inputRefs.current[index + 1]?.focus();
      } else {
        const form = e.currentTarget.closest("form");
        form?.requestSubmit();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index - 1 >= 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const form = e.currentTarget.closest("form");
        form?.requestSubmit();
      }
    }
  };

  const formattedDraftCount = isFa ? draftCount.toLocaleString("fa-IR") : draftCount.toString();

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noStudents")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-start">{t("student")}</th>
                <th className="py-2 text-start">{t("studentId")}</th>
                <th className="py-2 text-start">{t("score")}</th>
                <th className="py-2 text-start">{t("lumens")}</th>
                <th className="py-2 text-start">{t("state")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ student, assessment }, index) => {
                const state = assessment?.state;
                const lumens = assessment?.lumens;
                const rawScore = assessment?.rawScore;

                return (
                  <tr key={student.id} className="border-b hover:bg-muted/20">
                    <td className="py-2">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </td>
                    <td className="py-2 text-muted-foreground">{student.studentId ?? "—"}</td>
                    <td className="py-2">
                      <form action={saveDraftScore}>
                        <input type="hidden" name="missionId" value={missionId} />
                        <input type="hidden" name="userId" value={student.id} />
                        <input
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          name="rawScore"
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          defaultValue={rawScore ?? ""}
                          placeholder="—"
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onBlur={(e) => {
                            const form = e.target.closest("form") as HTMLFormElement;
                            form?.requestSubmit();
                          }}
                          className="w-24 rounded border px-2 py-1 text-center focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </form>
                    </td>
                    <td className="py-2">
                      {lumens !== null && lumens !== undefined ? (
                        <span className="font-semibold text-primary">
                          {isFa ? lumens.toLocaleString("fa-IR") : lumens}
                        </span>
                      ) : rawScore !== null && rawScore !== undefined ? (
                        <span className="text-xs text-muted-foreground">
                          ~
                          {isFa
                            ? Math.round((rawScore / 100) * maxLumens).toLocaleString("fa-IR")
                            : Math.round((rawScore / 100) * maxLumens)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2">
                      {state === "draft" && (
                        <span className="inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          {t("draft")}
                        </span>
                      )}
                      {state === "published" && (
                        <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          {t("published")}
                        </span>
                      )}
                      {state === "revised" && (
                        <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {t("revised")}
                        </span>
                      )}
                      {!state && (
                        <span className="text-xs text-muted-foreground">{t("notEntered")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {draftCount > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            {publishing ? t("publishing") : t("publishButton", { count: formattedDraftCount })}
          </button>
        </div>
      )}
    </div>
  );
}
