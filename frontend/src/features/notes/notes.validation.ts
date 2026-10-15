import type { NoteInput } from "./notes.types";

export function validNote(value: NoteInput) {
  return (
    value.title.trim().length > 0 &&
    value.title.length <= 120 &&
    value.category.length <= 50 &&
    value.content.length <= 10_000
  );
}
