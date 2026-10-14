export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="share-brand">The Great Kaspah</div>
      {children}
    </>
  );
}
