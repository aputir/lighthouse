"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  if (availableStudents.length === 0) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await addCrewMember(formData);
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <input type="hidden" name="crewId" value={crewId} />
      <select
        name="userId"
        required
        defaultValue=""
        className="rounded border px-2 py-1 text-sm bg-background"
      >
        <option value="" disabled>
          {t("selectStudent")}
        </option>
        {availableStudents.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.email})
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-muted px-3 py-1 text-sm hover:bg-muted/80 disabled:opacity-50"
      >
        {isPending ? "..." : t("addMemberButton")}
      </button>
    </form>
  );
}
