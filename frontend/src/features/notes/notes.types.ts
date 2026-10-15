export type Note = {
  id: string;
  titulo: string;
  conteudo: string;
  categoria: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteFormValues = {
  titulo: string;
  conteudo: string;
  categoria: string;
};

export type NoteInput = {
  titulo: string;
  conteudo: string;
  categoria?: string;
};
