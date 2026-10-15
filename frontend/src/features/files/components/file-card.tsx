import { Download, FileText, Headphones, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VaultFile } from "@/features/files/files.types";
import { formatDate } from "@/lib/format-date";

type FileCardProps = {
  file: VaultFile;
  downloading: boolean;
  onDownload: () => void;
  onDelete: () => void;
};

export function FileCard({
  file,
  downloading,
  onDownload,
  onDelete,
}: FileCardProps) {
  const fileType = getFileType(file.mimeType);
  const Icon =
    fileType === "Imagem"
      ? ImageIcon
      : fileType === "Áudio"
        ? Headphones
        : FileText;
  const createdYear = new Date(file.createdAt).getFullYear();

  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="mb-5 flex min-h-32 items-center justify-center rounded-md bg-secondary/60 text-primary">
        <Icon size={42} strokeWidth={1.3} aria-hidden="true" />
      </div>

      <h2 className="truncate text-sm font-medium" title={file.nomeOriginal}>
        {file.nomeOriginal}
      </h2>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {formatFileSize(file.tamanho)} · {formatDate(file.createdAt.slice(0, 10))}{" "}
        de {createdYear}
      </p>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-[10px] text-muted-foreground">{fileType}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label={`Baixar ${file.nomeOriginal}`}
            title="Baixar"
            disabled={downloading}
            onClick={onDownload}
          >
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            aria-label={`Excluir ${file.nomeOriginal}`}
            title="Excluir"
            disabled={downloading}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}

function getFileType(mimeType: string) {
  if (mimeType.startsWith("image/")) return "Imagem";
  if (mimeType.startsWith("audio/")) return "Áudio";
  return "PDF";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} MB`;
}
