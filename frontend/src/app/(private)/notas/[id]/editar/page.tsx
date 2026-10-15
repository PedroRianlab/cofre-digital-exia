"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ErrorState } from "@/components/feedback/states";
import { NoteFormPage } from "@/features/notes/components/note-form-page";
import {
  getNoteRequest,
  updateNoteRequest,
} from "@/features/notes/notes.api";
import type { Note } from "@/features/notes/notes.types";

type NoteStatus = "loading" | "ready" | "missing" | "error";

export default function EditNoteRoute() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [status, setStatus] = useState<NoteStatus>("loading");

  useEffect(() => {
    let active = true;

    async function loadInitialNote() {
      try {
        const response = await getNoteRequest(id);
        if (!active) return;
        setNote(response);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus(
          axios.isAxiosError(error) && error.response?.status === 404
            ? "missing"
            : "error",
        );
      }
    }

    void loadInitialNote();
    return () => {
      active = false;
    };
  }, [id]);

  async function retryLoad() {
    setStatus("loading");

    try {
      setNote(await getNoteRequest(id));
      setStatus("ready");
    } catch (error) {
      setStatus(
        axios.isAxiosError(error) && error.response?.status === 404
          ? "missing"
          : "error",
      );
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-72 animate-pulse rounded-lg bg-secondary/50" />
    );
  }

  if (status === "error") {
    return <ErrorState onRetry={retryLoad} />;
  }

  return (
    <NoteFormPage
      key={id}
      note={note ?? undefined}
      missing={status === "missing"}
      onCancel={() => router.push("/notas")}
      onSubmit={async (value) => {
        await updateNoteRequest(id, value);
        router.push("/notas");
      }}
    />
  );
}
