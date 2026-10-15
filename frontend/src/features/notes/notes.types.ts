export type Note = {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
};

export type NoteInput = Pick<Note, "title" | "category" | "content">;
