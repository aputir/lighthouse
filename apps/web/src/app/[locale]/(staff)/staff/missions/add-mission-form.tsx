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
import { createMission } from "./actions";

export function AddMissionForm({ chapterId, order }: { chapterId: string; order: number }) {
  const t = useTranslations("staff.missions");
  const commonT = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createMission(formData);
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("addMission")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addMission")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="chapterId" value={chapterId} />
          <input type="hidden" name="order" value={order} />
          <div className="space-y-1.5">
            <Label htmlFor={`mission-title-en-${chapterId}`}>
              {t("missionTitleEnPlaceholder")}
            </Label>
            <Input
              id={`mission-title-en-${chapterId}`}
              name="title"
              placeholder={t("missionTitleEnPlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`mission-title-fa-${chapterId}`}>
              {t("missionTitleFaPlaceholder")}
            </Label>
            <Input
              id={`mission-title-fa-${chapterId}`}
              name="titleFa"
              placeholder={t("missionTitleFaPlaceholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`mission-max-lumens-${chapterId}`}>{t("maxLumensPlaceholder")}</Label>
            <Input
              id={`mission-max-lumens-${chapterId}`}
              name="maxLumens"
              type="number"
              defaultValue={100}
              placeholder={t("maxLumensPlaceholder")}
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
              {isPending ? <Spinner className="size-4" /> : t("addMissionButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
