"use client";

import { useParams, useRouter } from "next/navigation";
import { NoteFormPage } from "@/features/notes/components/note-form-page";
import { useMockVault } from "@/providers/mock-vault-provider";

export default function EditNoteRoute() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, saveNote } = useMockVault();
  const note = notes.find((item) => item.id === id);

  return (
    <NoteFormPage
      key={id}
      note={note}
      missing={!note}
      onCancel={() => router.push("/notas")}
      onSubmit={(value) => {
        saveNote(value, id);
        router.push("/notas");
      }}
    />
  );
}
