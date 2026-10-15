"use client";

import { useRouter } from "next/navigation";
import { NoteFormPage } from "@/features/notes/components/note-form-page";
import { useMockVault } from "@/providers/mock-vault-provider";

export default function NewNoteRoute() {
  const router = useRouter();
  const { saveNote } = useMockVault();

  return (
    <NoteFormPage
      onCancel={() => router.push("/notas")}
      onSubmit={(value) => {
        saveNote(value);
        router.push("/notas");
      }}
    />
  );
}
