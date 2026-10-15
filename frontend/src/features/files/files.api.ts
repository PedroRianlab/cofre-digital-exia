import { api } from "@/lib/api";
import type { VaultFile } from "./files.types";

export async function listFilesRequest() {
  const response = await api.get<VaultFile[]>("/files");
  return response.data;
}

export async function uploadFileRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<VaultFile>("/files", formData);
  return response.data;
}

export async function downloadFileRequest(id: string) {
  const response = await api.get<Blob>(`/files/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}

export async function deleteFileRequest(id: string) {
  await api.delete(`/files/${id}`);
}
