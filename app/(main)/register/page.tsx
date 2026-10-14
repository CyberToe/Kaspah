import { RegisterForm } from "@/components/account-forms";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(onboardingPath(user) ?? "/readings");
  return (
    <main id="content" className="narrow stack">
      <h1>Create an account</h1>
      <p>The inner chamber remembers your country, your lottos, and every reading. Guests wait. The house does not.</p>
      <RegisterForm />
      <p>
        Already known here? <a href="/login">Log in</a>
      </p>
    </main>
  );
}
