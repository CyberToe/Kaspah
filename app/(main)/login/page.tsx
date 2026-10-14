import { LoginForm } from "@/components/account-forms";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(onboardingPath(user) ?? "/readings");
  const params = await searchParams;
  return (
    <main id="content" className="narrow stack">
      <h1>Log in</h1>
      <p>Email and password. That is the only key to this house.</p>
      <LoginForm notice={params.reset ? "Password updated. You can log in." : undefined} next={params.next} />
      <p>
        <a href="/forgot-password">Forgot password</a>
      </p>
      <p>
        <a href="/register">Create an account</a>
      </p>
    </main>
  );
}
