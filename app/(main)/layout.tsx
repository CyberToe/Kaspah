import { ClearGuest } from "@/components/clear-guest";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import { getCurrentUser, onboardingPath } from "@/lib/session";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const view = user
    ? { displayName: user.profile?.displayName ?? null, ready: !onboardingPath(user) }
    : null;
  return (
    <>
      <ClearGuest />
      <SiteHeader user={view} />
      {children}
      <SiteFooter />
    </>
  );
}
