import { TouchesForm } from "@/components/account-forms";
import { getCurrentUser, onboardingPath } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TouchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const step = onboardingPath(user);
  if (step) redirect(step);
  const touches = user.profile?.touches;
  return (
    <main id="content" className="narrow stack">
      <h1>Personal touches</h1>
      <TouchesForm
        luckyNumbers={(touches?.luckyNumbers ?? []).join(", ")}
        names={(touches?.names ?? []).join("\n")}
        words={(touches?.words ?? []).join("\n")}
        dates={touches?.dates ?? []}
      />
      <p>
        <a href="/profile">Back to profile</a>
      </p>
    </main>
  );
}
