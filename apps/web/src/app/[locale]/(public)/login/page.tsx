import { LoginForm } from "./login-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-sunken p-4">
      <LoginForm locale={locale} />
    </main>
  );
}
