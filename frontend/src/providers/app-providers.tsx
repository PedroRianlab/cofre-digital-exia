"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MockVaultProvider } from "./mock-vault-provider";
import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MockVaultProvider>
        {children}
        <Toaster position="bottom-right" />
      </MockVaultProvider>
    </AuthProvider>
  );
}
