"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { createMission } from "./actions";

export function AddMissionForm({ chapterId, order }: { chapterId: string; order: number }) {
  const t = useTranslations("staff.missions");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createMission(formData);
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="chapterId" value={chapterId} />
      <input type="hidden" name="order" value={order} />
      <input
        name="title"
        placeholder={t("missionTitleEnPlaceholder")}
        required
        className="rounded border px-2 py-1 text-sm"
      />
      <input
        name="titleFa"
        placeholder={t("missionTitleFaPlaceholder")}
        required
        className="rounded border px-2 py-1 text-sm"
      />
      <input
        name="maxLumens"
        type="number"
        defaultValue={100}
        placeholder={t("maxLumensPlaceholder")}
        className="w-24 rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-muted px-3 py-1 text-sm hover:bg-muted/80 disabled:opacity-50"
      >
        {isPending ? t("addingMission") : t("addMissionButton")}
      </button>
    </form>
  );
}
