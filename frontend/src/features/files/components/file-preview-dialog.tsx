"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFileRequest } from "@/features/files/files.api";
import type { VaultFile } from "@/features/files/files.types";
import { getApiErrorMessage } from "@/lib/api";

type FilePreviewDialogProps = {
  file: VaultFile | null;
  onClose: () => void;
};

type PreviewStatus = "loading" | "ready" | "error";

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!file) return;

    const selectedFile = file;
    let active = true;
    let objectUrl: string | null = null;

    async function loadPreview() {
      try {
        const blob = await downloadFileRequest(selectedFile.id);
        objectUrl = URL.createObjectURL(blob);

        if (!active) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
          return;
        }

        setPreviewUrl(objectUrl);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setErrorMessage(getApiErrorMessage(error));
        setStatus("error");
      }
    }

    void loadPreview();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attempt, file]);

  const isImage = file?.mimeType.startsWith("image/") ?? false;

  function retry() {
    setStatus("loading");
    setErrorMessage("");
    setAttempt((value) => value + 1);
  }

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file?.nomeOriginal}</DialogTitle>
          <DialogDescription>
            Visualização privada carregada somente ao abrir.
          </DialogDescription>
        </DialogHeader>

        {status === "loading" && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Carregando visualização…
          </p>
        )}

        {status === "error" && (
          <div role="alert" className="space-y-3 py-8 text-center">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" onClick={retry}>
              Tentar novamente
            </Button>
          </div>
        )}

        {status === "ready" && previewUrl && file && isImage && (
          <div className="relative h-[70vh] overflow-hidden rounded-md bg-secondary/40">
            <Image
              src={previewUrl}
              alt={`Visualização de ${file.nomeOriginal}`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        )}

        {status === "ready" && previewUrl && file && !isImage && (
          <iframe
            src={previewUrl}
            title={`Visualização de ${file.nomeOriginal}`}
            className="h-[70vh] w-full rounded-md border"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
