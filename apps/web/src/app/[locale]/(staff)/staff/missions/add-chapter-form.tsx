"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Spinner,
} from "@lighthouse/ui";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { createChapter } from "./actions";

export function AddChapterForm({ order }: { order: number }) {
  const t = useTranslations("staff.missions");
  const commonT = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createChapter(formData);
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("addChapter")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addChapter")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="order" value={order} />
          <div className="space-y-1.5">
            <Label htmlFor="chapter-title-en">{t("chapterTitleEnPlaceholder")}</Label>
            <Input
              id="chapter-title-en"
              name="title"
              placeholder={t("chapterTitleEnPlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chapter-title-fa">{t("chapterTitleFaPlaceholder")}</Label>
            <Input
              id="chapter-title-fa"
              name="titleFa"
              placeholder={t("chapterTitleFaPlaceholder")}
              required
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {commonT("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : t("addChapterButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
