import type { NoteFormValues } from "./notes.types";

export function validNote(value: NoteFormValues) {
  return (
    value.titulo.trim().length > 0 &&
    value.titulo.length <= 120 &&
    value.categoria.length <= 50 &&
    value.conteudo.length <= 10_000
  );
}
