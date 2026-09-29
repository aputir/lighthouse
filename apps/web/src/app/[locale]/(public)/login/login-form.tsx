"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FieldMessage,
  Input,
  Label,
  Spinner,
} from "@lighthouse/ui";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError(t("invalidCredentials"));
      setLoading(false);
    } else {
      window.location.href = `/${locale}/dashboard`;
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("signIn")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <FieldMessage variant="error">{error}</FieldMessage>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner className="size-4" /> : t("signIn")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
