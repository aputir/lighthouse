"use client";

import type { Assessment } from "@lighthouse/db";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataValue,
  FieldMessage,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lighthouse/ui";
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("student")}</TableHead>
                <TableHead className="text-start">{t("studentId")}</TableHead>
                <TableHead className="text-start">{t("score")}</TableHead>
                <TableHead className="text-start">{t("lumens")}</TableHead>
                <TableHead className="text-start">{t("state")} </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ student, assessment }, index) => {
                const state = assessment?.state;
                const lumens = assessment?.lumens;
                const rawScore = assessment?.rawScore;

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.studentId ?? "—"}
                    </TableCell>
                    <TableCell>
                      <form action={saveDraftScore}>
                        <input type="hidden" name="missionId" value={missionId} />
                        <input type="hidden" name="userId" value={student.id} />
                        <Input
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
                          className="w-24 text-center"
                        />
                      </form>
                    </TableCell>
                    <TableCell>
                      {lumens !== null && lumens !== undefined ? (
                        <span className="font-semibold text-primary">
                          <DataValue value={lumens} locale={locale} />
                        </span>
                      ) : rawScore !== null && rawScore !== undefined ? (
                        <span className="text-xs text-muted-foreground">
                          ~
                          <DataValue
                            value={Math.round((rawScore / 100) * maxLumens)}
                            locale={locale}
                          />
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {state === "draft" && <Badge variant="secondary">{t("draft")}</Badge>}
                      {state === "published" && <Badge variant="default">{t("published")}</Badge>}
                      {state === "revised" && <Badge variant="outline">{t("revised")}</Badge>}
                      {!state && (
                        <span className="text-xs text-muted-foreground">{t("notEntered")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {error && <FieldMessage variant="error">{error}</FieldMessage>}

      {draftCount > 0 && (
        <div className="pt-2">
          <ConfirmDialog
            title={t("publishConfirmTitle")}
            description={t("publishConfirmDescription")}
            confirmLabel={t("publishConfirmButton")}
            onConfirm={handlePublish}
          >
            <Button disabled={publishing}>
              {publishing ? (
                <Spinner className="size-4" />
              ) : (
                t("publishButton", { count: formattedDraftCount })
              )}
            </Button>
          </ConfirmDialog>
        </div>
      )}
    </div>
  );
}
