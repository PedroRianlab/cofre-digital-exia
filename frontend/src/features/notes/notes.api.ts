import { api } from "@/lib/api";
import type { Note, NoteFormValues, NoteInput } from "./notes.types";

function prepareNoteInput(values: NoteFormValues): NoteInput {
  const categoria = values.categoria.trim();

  return {
    titulo: values.titulo.trim(),
    conteudo: values.conteudo,
    ...(categoria ? { categoria } : {}),
  };
}

export async function listNotesRequest() {
  const response = await api.get<Note[]>("/notes");
  return response.data;
}

export async function getNoteRequest(id: string) {
  const response = await api.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function createNoteRequest(values: NoteFormValues) {
  const response = await api.post<Note>("/notes", prepareNoteInput(values));
  return response.data;
}

export async function updateNoteRequest(id: string, values: NoteFormValues) {
  const response = await api.patch<Note>(
    `/notes/${id}`,
    prepareNoteInput(values),
  );
  return response.data;
}

export async function deleteNoteRequest(id: string) {
  await api.delete(`/notes/${id}`);
}
