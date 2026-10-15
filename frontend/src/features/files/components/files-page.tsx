"use client";

import NextImage from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  FileText,
  Headphones,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import type { VaultFile } from "@/features/files/files.types";
import { formatDate } from "@/lib/format-date";
import { simulate, useMockVault } from "@/providers/mock-vault-provider";
import { UploadDialog } from "./upload-dialog";

export function FilesPage() {
  const { files, addFile, deleteFile } = useMockVault();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleting, setDeleting] = useState<VaultFile | null>(null);
  const [selected, setSelected] = useState<VaultFile | null>(null);

  async function download(file: VaultFile) {
    await simulate();
    toast.success(`Download de “${file.name}” simulado.`);
  }

  if (selected) {
    return (
      <>
        <Button
          variant="ghost"
          className="mb-7 px-0 text-muted-foreground"
          onClick={() => setSelected(null)}
        >
          <ArrowLeft />
          Todos os arquivos
        </Button>
        <PageHeader
          title={selected.name}
          description={`${selected.size} · ${formatDate(selected.date)} de 2026`}
          action={
            <Button variant="outline" onClick={() => download(selected)}>
              <Download />
              Baixar
            </Button>
          }
        />
        <FilePreview file={selected} expanded />
      </>
    );
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

      {files.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <article
              key={file.id}
              className="overflow-hidden rounded-lg border bg-card shadow-soft"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-secondary/60">
                <div aria-hidden="true" className="pointer-events-none h-full w-full scale-105 blur-sm">
                  <FilePreview file={file} />
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 bottom-3"
                  aria-label={`Visualizar ${file.name}`}
                  onClick={() => setSelected(file)}
                >
                  <ArrowUpRight />
                </Button>
              </div>

              <div className="p-5">
                <h2 className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </h2>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {file.size} · {formatDate(file.date)} de 2026
                </p>
                {file.kind === "audio" && file.url && (
                  <audio
                    controls
                    src={file.url}
                    className="mt-4 h-9 w-full"
                    preload="metadata"
                  />
                )}
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span className="text-[10px] text-muted-foreground">
                    {file.kind === "image"
                      ? "Imagem"
                      : file.kind === "pdf"
                        ? "PDF"
                        : "Áudio"}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      aria-label={`Baixar ${file.name}`}
                      title="Baixar"
                      onClick={() => download(file)}
                    >
                      <Download />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Excluir ${file.name}`}
                      title="Excluir"
                      onClick={() => setDeleting(file)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
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
        onSubmit={(file) => {
          const extension = file.name.split(".").pop()?.toLowerCase();
          const kind =
            extension === "pdf"
              ? "pdf"
              : ["mp3", "wav", "ogg", "m4a"].includes(extension ?? "")
                ? "audio"
                : "image";

          addFile({
            id: crypto.randomUUID(),
            name: file.name,
            kind,
            size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
            date: new Date().toISOString().slice(0, 10),
            url: URL.createObjectURL(file),
          });
          toast.success("Arquivo adicionado nesta sessão.");
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Excluir este arquivo?"
        description={`“${deleting?.name ?? ""}” será removido desta coleção.`}
        onConfirm={async () => {
          if (!deleting) return;
          await simulate();
          deleteFile(deleting.id);
          toast.success("Arquivo excluído.");
        }}
      />
    </>
  );
}

function FilePreview({
  file,
  expanded = false,
}: {
  file: VaultFile;
  expanded?: boolean;
}) {
  if (file.kind === "image" && file.url) {
    return (
      <NextImage
        src={file.url}
        alt={file.name}
        width={1024}
        height={768}
        unoptimized
        className={
          expanded
            ? "max-h-[600px] w-full rounded-lg object-contain"
            : "h-full w-full object-cover"
        }
      />
    );
  }

  if (file.kind === "audio" && expanded && file.url) {
    return (
      <div className="max-w-xl py-8">
        <Headphones className="mb-6 text-primary" size={42} />
        <audio controls src={file.url} className="w-full" />
      </div>
    );
  }

  if (file.kind === "pdf" && expanded && file.url) {
    return (
      <iframe
        title={file.name}
        src={file.url}
        className="h-[600px] w-full rounded-lg border"
      />
    );
  }

  const Icon =
    file.kind === "pdf"
      ? FileText
      : file.kind === "audio"
        ? Headphones
        : ImageIcon;

  return (
    <div className="flex min-h-52 w-full flex-col items-center justify-center gap-4 rounded-lg bg-secondary/60 text-primary">
      <Icon size={48} strokeWidth={1.2} />
      <span className="text-xs text-muted-foreground">
        {file.kind === "pdf"
          ? "Documento PDF"
          : file.kind === "audio"
            ? "Registro de áudio"
            : "Imagem"}
      </span>
    </div>
  );
}
