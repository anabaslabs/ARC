export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const truncateFileName = (name: string, maxLength = 24) => {
  if (name.length <= maxLength) return name;
  const extensionIndex = name.lastIndexOf(".");
  const extension = extensionIndex !== -1 ? name.substring(extensionIndex) : "";
  const nameWithoutExtension =
    extensionIndex !== -1 ? name.substring(0, extensionIndex) : name;

  const charsToShow = maxLength - extension.length - 3; // 3 for "..."
  if (charsToShow <= 0) return name;

  const frontChars = Math.ceil(charsToShow * 0.7);
  const backChars = Math.floor(charsToShow * 0.3);

  return (
    nameWithoutExtension.substring(0, frontChars) +
    "..." +
    nameWithoutExtension.substring(nameWithoutExtension.length - backChars) +
    extension
  );
};
