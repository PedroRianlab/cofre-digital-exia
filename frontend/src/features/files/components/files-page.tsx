"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/features/files/download-file";
import { getFileErrorMessage } from "@/features/files/file-error-message";
import {
  deleteFileRequest,
  listFilesRequest,
  uploadFileRequest,
} from "@/features/files/files.api";
import type { VaultFile } from "@/features/files/files.types";
import { FileCard } from "./file-card";
import { UploadDialog } from "./upload-dialog";

type CollectionStatus = "loading" | "ready" | "error";

export function FilesPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [status, setStatus] = useState<CollectionStatus>("loading");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<VaultFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInitialFiles() {
      try {
        const response = await listFilesRequest();
        if (!active) return;
        setFiles(response);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    }

    void loadInitialFiles();
    return () => {
      active = false;
    };
  }, []);

  async function retryLoad() {
    setStatus("loading");

    try {
      setFiles(await listFilesRequest());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  async function upload(file: File) {
    const uploadedFile = await uploadFileRequest(file);
    setFiles((current) => [uploadedFile, ...current]);
    toast.success("Arquivo enviado.");
  }

  async function startDownload(file: VaultFile) {
    setDownloadingId(file.id);

    try {
      await downloadFile(file);
      toast.success("Download iniciado.");
    } catch (error) {
      toast.error(getFileErrorMessage(error));
    } finally {
      setDownloadingId(null);
    }
  }

  async function remove(file: VaultFile) {
    try {
      await deleteFileRequest(file.id);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      toast.success("Arquivo excluído.");
    } catch (error) {
      toast.error(getFileErrorMessage(error));
      throw error;
    }
  }

  return (
    <>
      <PageHeader
        title="Seu cofre de arquivos"
        description="Seus arquivos, com discrição e segurança."
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus />
            Adicionar arquivo
          </Button>
        }
      />

      <div className="mb-5 text-xs font-medium">
        Todos os arquivos
        <span className="ml-2 text-muted-foreground">
          {files.length.toString().padStart(2, "0")}
        </span>
      </div>

      {status === "loading" && (
        <p className="text-sm text-muted-foreground">Carregando arquivos…</p>
      )}

      {status === "error" && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            Não foi possível carregar os arquivos.
          </p>
          <Button variant="outline" onClick={retryLoad}>
            Tentar novamente
          </Button>
        </div>
      )}

      {status === "ready" && files.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              downloading={downloadingId === file.id}
              onDownload={() => void startDownload(file)}
              onDelete={() => setDeleting(file)}
            />
          ))}
        </div>
      )}

      {status === "ready" && files.length === 0 && (
        <EmptyState
          title="Nenhum arquivo"
          description="Seus arquivos aparecerão aqui."
          action="Adicionar arquivo"
          onAction={() => setUploadOpen(true)}
        />
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={upload}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Excluir este arquivo?"
        description={`“${deleting?.nomeOriginal ?? ""}” será removido desta coleção.`}
        onConfirm={async () => {
          if (deleting) await remove(deleting);
        }}
      />
    </>
  );
}
