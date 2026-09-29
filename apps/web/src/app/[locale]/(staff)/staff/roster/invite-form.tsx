"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createInvite } from "./actions";

export function InviteForm({ locale }: { locale: string }) {
  const t = useTranslations("staff.roster");
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
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? t("creatingInvite") : t("createInviteButton")}
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {inviteUrl && (
        <div className="rounded border bg-muted p-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">{t("inviteLinkNotice")}</p>
            <button type="button" onClick={handleCopy} className="text-xs text-primary underline">
              {copied ? t("copied") : t("copyLink")}
            </button>
          </div>
          <code className="mt-1 block break-all text-xs">{inviteUrl}</code>
        </div>
      )}
    </div>
  );
}
