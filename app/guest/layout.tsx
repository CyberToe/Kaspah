import { GuestHeader } from "@/components/chrome";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuestHeader />
      {children}
    </>
  );
}
