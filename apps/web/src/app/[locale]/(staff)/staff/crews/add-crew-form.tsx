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
import { createCrew } from "./actions";

export function AddCrewForm() {
  const t = useTranslations("staff.crews");
  const commonT = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createCrew(formData);
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t("createCrew")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createCrew")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="crew-name">{t("crewNamePlaceholder")}</Label>
            <Input id="crew-name" name="name" placeholder={t("crewNamePlaceholder")} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crew-ship-name">{t("shipNamePlaceholder")}</Label>
            <Input id="crew-ship-name" name="shipName" placeholder={t("shipNamePlaceholder")} />
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
              {isPending ? <Spinner className="size-4" /> : t("createCrewButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
