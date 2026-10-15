"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { initialFiles } from "@/features/files/mock-data";
import type { VaultFile } from "@/features/files/files.types";
import { initialNotes } from "@/features/notes/mock-data";
import type { Note, NoteInput } from "@/features/notes/notes.types";

type MockVaultStore = {
  notes: Note[];
  files: VaultFile[];
  saveNote: (value: NoteInput, id?: string) => void;
  deleteNote: (id: string) => void;
  addFile: (file: VaultFile) => void;
  deleteFile: (id: string) => void;
};

const MockVaultContext = createContext<MockVaultStore | null>(null);

export const simulate = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 550));

export function MockVaultProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState(initialNotes);
  const [files, setFiles] = useState(initialFiles);

  function saveNote(value: NoteInput, id?: string) {
    const date = new Date().toISOString().slice(0, 10);

    setNotes((current) =>
      id
        ? current.map((note) =>
            note.id === id ? { ...note, ...value, date } : note,
          )
        : [{ ...value, id: crypto.randomUUID(), date }, ...current],
    );
  }

  return (
    <MockVaultContext.Provider
      value={{
        notes,
        files,
        saveNote,
        deleteNote: (id) =>
          setNotes((current) => current.filter((note) => note.id !== id)),
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
