export type VaultFile = {
  id: string;
  name: string;
  kind: "image" | "audio" | "pdf";
  size: string;
  date: string;
  url?: string;
};
