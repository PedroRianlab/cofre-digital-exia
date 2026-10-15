import type { Note } from "./notes.types";

export function noteSummary(note: Note) {
  return {
    title: note.titulo,
    category: note.categoria,
  };
}
