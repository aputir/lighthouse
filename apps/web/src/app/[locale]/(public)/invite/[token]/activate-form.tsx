"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@lighthouse/ui";
import { useTranslations } from "next-intl";
import { activateAccount } from "./actions";

export function ActivateForm({
  token,
  email,
  locale,
}: {
  token: string;
  email: string;
  locale?: string;
}) {
  const t = useTranslations("auth");

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("activateTitle")}</CardTitle>
        <CardDescription className="truncate text-muted-foreground">{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={activateAccount} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          {locale && <input type="hidden" name="locale" value={locale} />}
          <div className="space-y-2">
            <Label htmlFor="name">{t("yourName")}</Label>
            <Input id="name" name="name" type="text" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <Button type="submit" className="w-full">
            {t("activateButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
