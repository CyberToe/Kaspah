import { logout } from "@/app/actions/auth";
import { Disclaimer } from "./ui";

function Mark({ href }: { href?: string }) {
  const portrait = (
    <span className="medallion">
      <img src="/kaspah.jpeg" alt="" width={1325} height={1600} />
    </span>
  );
  const sign = (
    <span className="brand">
      <span className="brand-small">The Great</span>
      <span className="brand-name">Kaspah</span>
    </span>
  );
  if (!href) {
    return (
      <div className="brand-lockup">
        {portrait}
        {sign}
      </div>
    );
  }
  return (
    <a className="brand-lockup" href={href}>
      {portrait}
      {sign}
    </a>
  );
}

export function SiteHeader({
  user,
}: {
  user: { displayName: string | null; ready: boolean } | null;
}) {
  return (
    <header className="site-header">
      <Mark href={user?.ready ? "/readings" : "/"} />
      <nav>
        {user?.ready ? (
          <>
            <a href="/readings">Readings</a>
            <a href="/history">History</a>
            <a href="/profile">Profile</a>
            <form action={logout}>
              <button className="text-btn" type="submit">
                Log out
              </button>
            </form>
          </>
        ) : user ? (
          <>
            <a href="/onboarding/details">Continue setup</a>
            <form action={logout}>
              <button className="text-btn" type="submit">
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <a href="/login">Log in</a>
            <a className="btn gold small" href="/register">
              Create an account
            </a>
          </>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Disclaimer />
    </footer>
  );
}

export function GuestHeader() {
  return (
    <header className="guest-header">
      <Mark />
      <a href="/">Leave</a>
    </header>
  );
}
