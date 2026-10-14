import { ResetForm } from "@/components/account-forms";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return (
    <main id="content" className="narrow stack">
      <h1>Choose a new password</h1>
      {token ? <ResetForm token={token} /> : <p className="form-error">This reset link is invalid or has expired.</p>}
    </main>
  );
}
