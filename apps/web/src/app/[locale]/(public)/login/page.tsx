import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold">{t("signIn")}</h1>
        <LoginForm locale={locale} />
      </div>
    </main>
  );
}
