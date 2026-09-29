"use client";

import {
  Button,
  Card,
  CardContent,
  FieldMessage,
  Input,
  Label,
  Spinner,
  useToast,
} from "@lighthouse/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createInvite } from "./actions";

export function InviteForm({ locale }: { locale: string }) {
  const t = useTranslations("staff.roster");
  const { toast } = useToast();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setCopied(false);
    setError(null);
    const form = e.currentTarget;
    try {
      const formData = new FormData(form);
      const token = await createInvite(formData);
      const baseUrl = window.location.origin;
      setInviteUrl(`${baseUrl}/${locale}/invite/${token}`);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({
      title: t("copied"),
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">{t("email")}</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="size-4" /> : t("createInviteButton")}
            </Button>
          </div>
          {error && <FieldMessage variant="error">{error}</FieldMessage>}
        </form>
        {inviteUrl && (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{t("inviteLinkNotice")}</p>
              <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? t("copied") : t("copyLink")}
              </Button>
            </div>
            <code className="mt-1 block break-all font-mono text-xs text-foreground/80">
              {inviteUrl}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
