"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { initialFiles } from "@/features/files/mock-data";
import type { VaultFile } from "@/features/files/files.types";

type MockVaultStore = {
  files: VaultFile[];
  addFile: (file: VaultFile) => void;
  deleteFile: (id: string) => void;
};

const MockVaultContext = createContext<MockVaultStore | null>(null);

export const simulate = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 550));

export function MockVaultProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState(initialFiles);

  return (
    <MockVaultContext.Provider
      value={{
        files,
        addFile: (file) => setFiles((current) => [file, ...current]),
        deleteFile: (id) =>
          setFiles((current) => current.filter((file) => file.id !== id)),
      }}
    >
      {children}
    </MockVaultContext.Provider>
  );
}

export function useMockVault() {
  const context = useContext(MockVaultContext);

  if (!context) {
    throw new Error("MockVaultProvider não foi configurado");
  }

  return context;
}
