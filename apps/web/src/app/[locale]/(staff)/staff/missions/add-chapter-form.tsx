"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { createChapter } from "./actions";

export function AddChapterForm({ order }: { order: number }) {
  const t = useTranslations("staff.missions");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createChapter(formData);
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="order" value={order} />
      <input
        name="title"
        placeholder={t("chapterTitleEnPlaceholder")}
        required
        className="rounded border px-2 py-1 text-sm"
      />
      <input
        name="titleFa"
        placeholder={t("chapterTitleFaPlaceholder")}
        required
        className="rounded border px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-primary px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {isPending ? t("addingChapter") : t("addChapterButton")}
      </button>
    </form>
  );
}
