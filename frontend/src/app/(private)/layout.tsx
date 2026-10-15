import { Suspense, type ReactNode } from "react";
import { PrivateShell } from "@/components/layout/private-shell";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PrivateShell>{children}</PrivateShell>
    </Suspense>
  );
}
