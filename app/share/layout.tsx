import { ClearGuest } from "@/components/clear-guest";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClearGuest />
      <div className="share-brand">
        <div className="brand-lockup">
          <span className="medallion">
            <img src="/kaspah.jpeg" alt="" width={1325} height={1600} />
          </span>
          <span className="brand">
            <span className="brand-small">The Great</span>
            <span className="brand-name">Kaspah</span>
          </span>
        </div>
      </div>
      {children}
    </>
  );
}
