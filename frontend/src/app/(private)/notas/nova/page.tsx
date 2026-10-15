"use client";

import { useRouter } from "next/navigation";
import { NoteFormPage } from "@/features/notes/components/note-form-page";
import { createNoteRequest } from "@/features/notes/notes.api";

export default function NewNoteRoute() {
  const router = useRouter();

  return (
    <NoteFormPage
      onCancel={() => router.push("/notas")}
      onSubmit={async (value) => {
        await createNoteRequest(value);
        router.push("/notas");
      }}
    />
  );
}
