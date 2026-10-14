"use client";

import { useEffect } from "react";

export function ClearGuest() {
  useEffect(() => {
    void fetch("/api/leave-guest", { method: "POST" });
  }, []);
  return null;
}
