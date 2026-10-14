import { logout } from "@/app/actions/auth";
import { Disclaimer } from "./ui";

export function SiteHeader({
  user,
}: {
  user: { displayName: string | null; ready: boolean } | null;
}) {
  return (
    <header className="site-header">
      <a className="brand" href={user?.ready ? "/readings" : "/"}>
        The Great Kaspah
      </a>
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
      <span className="brand">The Great Kaspah</span>
      <a href="/">Leave</a>
    </header>
  );
}
