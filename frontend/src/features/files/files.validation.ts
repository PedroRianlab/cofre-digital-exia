export const acceptedExtensions = [
  "pdf",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "png",
  "jpg",
  "webp",
  "gif",
];

export const acceptedFiles = acceptedExtensions
  .map((extension) => `.${extension}`)
  .join(",");

export function validUpload(files: ArrayLike<{ name: string }>) {
  const file = files[0];
  const extension = file?.name.split(".").pop()?.toLowerCase() ?? "";

  return files.length === 1 && acceptedExtensions.includes(extension);
}
