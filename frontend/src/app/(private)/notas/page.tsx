"use client";

import { useRouter } from "next/navigation";
import { NotesPage } from "@/features/notes/components/notes-page";

export default function NotesRoute() {
  const router = useRouter();

  return (
    <NotesPage
      onCreate={() => router.push("/notas/nova")}
      onEdit={(id) => router.push(`/notas/${id}/editar`)}
    />
  );
}
