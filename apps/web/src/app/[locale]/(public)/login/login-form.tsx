"use client";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
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
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? t("loading") : t("signIn")}
      </button>
    </form>
  );
}
