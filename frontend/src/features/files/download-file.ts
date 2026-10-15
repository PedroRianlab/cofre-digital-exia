import { downloadFileRequest } from "./files.api";
import type { VaultFile } from "./files.types";

export async function downloadFile(file: VaultFile) {
  const blob = await downloadFileRequest(file.id);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = file.nomeOriginal;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
