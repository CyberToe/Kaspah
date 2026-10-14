import { ForgotForm } from "@/components/account-forms";

export default function ForgotPage() {
  return (
    <main id="content" className="narrow stack">
      <h1>Reset password</h1>
      <p>If the email belongs to an account, a reset link will be sent. That email is only about the password.</p>
      <ForgotForm />
    </main>
  );
}
