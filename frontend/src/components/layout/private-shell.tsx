"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { VaultLayout } from "./vault-layout";
import { useAuth } from "@/providers/auth-provider";

export function PrivateShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isCheckingSession, logout } = useAuth();
  const active = pathname.startsWith("/arquivos") ? "files" : "notes";

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isCheckingSession, router]);

  if (isCheckingSession || !isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"
        role="status"
      >
        Verificando sua sessão…
      </div>
    );
  }

  return (
    <VaultLayout
      active={active}
      onNavigate={(page) =>
        router.push(page === "notes" ? "/notas" : "/arquivos")
      }
      onLogout={() => {
        logout();
        toast.success("Sessão encerrada.");
        router.replace("/login");
      }}
    >
      {children}
    </VaultLayout>
  );
}
