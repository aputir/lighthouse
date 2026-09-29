import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("app");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("name")}</h1>
      <p className="mt-2 text-muted-foreground">{t("tagline")}</p>
    </main>
  );
}
