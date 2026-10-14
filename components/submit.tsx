"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  variant = "gold",
}: {
  children: React.ReactNode;
  variant?: "gold" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn ${variant}`} disabled={pending} type="submit">
      {pending ? "One moment…" : children}
    </button>
  );
}
