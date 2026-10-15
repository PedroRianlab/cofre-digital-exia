"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { VaultLayout } from "./vault-layout";

export function PrivateShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.startsWith("/arquivos") ? "files" : "notes";

  return (
    <VaultLayout
      active={active}
      onNavigate={(page) =>
        router.push(page === "notes" ? "/notas" : "/arquivos")
      }
      onLogout={() => {
        toast.success("Saída simulada.");
        router.push("/login");
      }}
    >
      {children}
    </VaultLayout>
  );
}
