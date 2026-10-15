import type { Note } from "./notes.types";

export function filterNotes(notes: Note[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");

  if (!normalized) return notes;

  return notes.filter((note) =>
    note.categoria?.toLocaleLowerCase("pt-BR").includes(normalized),
  );
}
