import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "LottoLab" },
  description: "A clinical reading bench. Numbers are generated at random. Entertainment only.",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="lab-backdrop" />
      <div className="lab-shell">
        <header className="lab-header">
          <a className="lab-lockup" href="/lab">
            <span className="lab-mark">
              <img src="/lottolab.jpg" alt="" width={689} height={947} />
            </span>
            <span>
              <span className="lab-kicker">Controlled trial</span>
              <span className="lab-name">LottoLab</span>
            </span>
          </a>
          <a href="/">The Great Kaspah</a>
        </header>
        {children}
      </div>
    </>
  );
}
