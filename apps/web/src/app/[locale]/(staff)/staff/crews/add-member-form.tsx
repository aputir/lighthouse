"use client";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@lighthouse/ui";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { addCrewMember } from "./actions";

interface StudentOption {
  id: string;
  name: string;
  email: string;
}

export function AddMemberForm({
  crewId,
  availableStudents,
}: {
  crewId: string;
  availableStudents: StudentOption[];
}) {
  const t = useTranslations("staff.crews");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  if (availableStudents.length === 0) {
    return <span className="text-xs text-muted-foreground">{t("allAssigned")}</span>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await addCrewMember(formData);
      setSelectedUserId("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="crewId" value={crewId} />
      <input type="hidden" name="userId" value={selectedUserId} />
      <div className="min-w-[180px] flex-1">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("selectStudent")} />
          </SelectTrigger>
          <SelectContent>
            {availableStudents.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.name} ({s.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!selectedUserId || isPending}
        className="h-8 text-xs"
      >
        {isPending ? <Spinner className="size-3" /> : t("addMemberButton")}
      </Button>
    </form>
  );
}
