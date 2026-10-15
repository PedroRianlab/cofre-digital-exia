"use client";

import { useRef, useState } from "react";
import { FileUp, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  acceptedFiles,
  validUpload,
} from "@/features/files/files.validation";
import { getApiErrorMessage } from "@/lib/api";

type UploadDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
};

export function UploadDialog({ open, onClose, onSubmit }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  function choose(files: FileList | null) {
    if (!files) return;

    if (!validUpload(files)) {
      setError("Selecione exatamente um arquivo em um formato aceito.");
      setFile(null);
      return;
    }

    setFile(files[0] ?? null);
    setError("");
  }

  function close() {
    setFile(null);
    setError("");
    onClose();
  }

  async function submit() {
    if (!file) {
      setError("Escolha um arquivo para continuar.");
      return;
    }

    try {
      await onSubmit(file);
      close();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isSubmitting) close();
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Guardar um arquivo</DialogTitle>
          <DialogDescription className="pt-2">
            Selecione uma imagem, um áudio ou um PDF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)}>
          <input
            ref={input}
            type="file"
            accept={acceptedFiles}
            className="sr-only"
            aria-label="Selecionar arquivo"
            onChange={(event) => choose(event.target.files)}
          />

          <div
            className="mt-2 flex min-h-40 flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-secondary/30 p-6 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!isSubmitting) choose(event.dataTransfer.files);
            }}
          >
            <Upload className="text-primary" size={27} />
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => input.current?.click()}
            >
              Selecionar arquivo
            </Button>
            <p className="text-xs text-muted-foreground">
              Ou solte um arquivo aqui
            </p>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-muted-foreground">
            PDF · MP3, WAV, OGG, M4A · PNG, JPG, WEBP, GIF
          </p>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-md bg-secondary p-3">
              <FileUp className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-xs">
                {file.name}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remover seleção"
                disabled={isSubmitting}
                onClick={() => setFile(null)}
              >
                <X />
              </Button>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={close}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Upload />
              {isSubmitting ? "Enviando…" : "Guardar arquivo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
