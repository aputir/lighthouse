"use client";
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
    <form action={activateAccount} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      {locale && <input type="hidden" name="locale" value={locale} />}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          {t("yourName")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>
      <button type="submit" className="w-full rounded bg-primary px-4 py-2 text-white">
        {t("activateButton")}
      </button>
    </form>
  );
}
