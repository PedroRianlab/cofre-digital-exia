"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MockVaultProvider } from "./mock-vault-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MockVaultProvider>
      {children}
      <Toaster position="bottom-right" />
    </MockVaultProvider>
  );
}
