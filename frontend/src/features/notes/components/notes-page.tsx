"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import {
  CollectionSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  deleteNoteRequest,
  getNoteRequest,
  listNotesRequest,
} from "@/features/notes/notes.api";
import { filterNotes } from "@/features/notes/note-search";
import type { Note } from "@/features/notes/notes.types";
import { formatDate } from "@/lib/format-date";
import { getApiErrorMessage } from "@/lib/api";
import { NoteCard } from "./note-card";
import { NoteSearchField } from "./note-search-field";

type NotesPageProps = {
  onCreate: () => void;
  onEdit: (id: string) => void;
};

type CollectionStatus = "loading" | "ready" | "error";

export function NotesPage({ onCreate, onEdit }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<CollectionStatus>("loading");
  const [selected, setSelected] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const [query, setQuery] = useState("");
  const visibleNotes = filterNotes(notes, query);
  const searching = query.trim().length > 0;

  useEffect(() => {
    let active = true;

    async function loadInitialNotes() {
      try {
        const response = await listNotesRequest();
        if (!active) return;
        setNotes(response);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    void loadInitialNotes();
    return () => {
      active = false;
    };
  }, []);

  async function retryLoad() {
    setStatus("loading");

    try {
      setNotes(await listNotesRequest());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  async function openNote(id: string) {
    try {
      setSelected(await getNoteRequest(id));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function deleteNote(note: Note) {
    try {
      await deleteNoteRequest(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      setSelected((current) => (current?.id === note.id ? null : current));
      toast.success("Nota excluída.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    }
  }

  if (selected) {
    const updatedYear = new Date(selected.updatedAt).getFullYear();

    return (
      <>
        <Button
          variant="ghost"
          className="mb-7 px-0 text-muted-foreground"
          onClick={() => setSelected(null)}
        >
          <ArrowLeft />
          Todas as notas
        </Button>
        <PageHeader
          title={selected.titulo}
          description={`${selected.categoria || "Sem categoria"} · ${formatDate(selected.updatedAt.slice(0, 10))} de ${updatedYear}`}
          action={
            <Button variant="outline" onClick={() => onEdit(selected.id)}>
              <Pencil />
              Editar nota
            </Button>
          }
        />
        <div className="max-w-3xl whitespace-pre-wrap break-words font-reading text-lg leading-9">
          {selected.conteudo || "Esta nota ainda não tem conteúdo."}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Seu cofre de notas."
        description="Suas notas, com discrição e segurança."
        action={
          <Button onClick={onCreate}>
            <Plus />
            Nova nota
          </Button>
        }
      />

      <div className="mb-7">
        <NoteSearchField value={query} onChange={setQuery} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-medium">
          {searching ? "Notas encontradas" : "Todas as notas"}
          <span className="ml-2 text-muted-foreground">
            {visibleNotes.length.toString().padStart(2, "0")}
          </span>
        </span>
      </div>

      {status === "loading" && <CollectionSkeleton />}
      {status === "error" && <ErrorState onRetry={retryLoad} />}
      {status === "ready" && visibleNotes.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={() => openNote(note.id)}
              onEdit={() => onEdit(note.id)}
              onDelete={() => setDeleting(note)}
            />
          ))}
        </div>
      )}
      {status === "ready" && visibleNotes.length === 0 && searching && (
        <EmptyState
          title="Nada encontrado"
          description="Nenhuma nota corresponde à sua busca."
          action="Limpar busca"
          onAction={() => setQuery("")}
        />
      )}
      {status === "ready" && visibleNotes.length === 0 && !searching && (
        <EmptyState
          title="Nenhuma nota"
          description="Suas notas aparecerão aqui."
          action="Criar uma nota"
          onAction={onCreate}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Excluir esta nota?"
        description={`“${deleting?.titulo ?? ""}” será removida desta coleção. Essa ação não pode ser desfeita.`}
        onConfirm={async () => {
          if (deleting) await deleteNote(deleting);
        }}
      />
    </>
  );
}
