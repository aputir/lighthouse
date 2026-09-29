"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { createCrew } from "./actions";

export function AddCrewForm() {
  const t = useTranslations("staff.crews");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createCrew(formData);
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <input
        name="name"
        placeholder={t("crewNamePlaceholder")}
        required
        className="rounded border px-2 py-1 text-sm"
      />
      <input
        name="shipName"
        placeholder={t("shipNamePlaceholder")}
        className="rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-primary px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {isPending ? t("creatingCrew") : t("createCrewButton")}
      </button>
    </form>
  );
}
