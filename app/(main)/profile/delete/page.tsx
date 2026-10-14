import { DeleteForm } from "@/components/account-forms";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DeletePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <main id="content" className="narrow stack">
      <h1>Delete account</h1>
      <DeleteForm />
      <p>
        <a href="/profile">Cancel</a>
      </p>
    </main>
  );
}
