export type AttachedContextFile = {
  name: string;
  text: string;
};

export const MAX_CONTEXT_FILE_BYTES = 500_000;

const SUPPORTED_CONTEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".yaml",
  ".yml",
  ".csv",
  ".toml",
  ".log",
  ".ini",
  ".env"
];

function normalizeText(text: string) {
  return text.trim();
}

export function mergeContext(manualContext: string, files: AttachedContextFile[]): string {
  const fileContext = files
    .map((item) => `--- file:${item.name} ---\n${item.text}`)
    .join("\n\n");

  const merged = [manualContext, fileContext].filter(Boolean).join("\n\n").trim();
  return merged || "";
}

export function isContextFileSupported(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasSupportedExtension = SUPPORTED_CONTEXT_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (hasSupportedExtension) return true;
  if (file.type.startsWith("text/")) return true;
  if (file.type === "application/json") return true;
  return false;
}

export async function loadContextFiles(fileList: FileList | null): Promise<AttachedContextFile[]> {
  const files = Array.from(fileList || []);
  const loaded: AttachedContextFile[] = [];

  for (const file of files) {
    if (!isContextFileSupported(file)) {
      throw new Error(`Unsupported file type: ${file.name}`);
    }
    if (file.size > MAX_CONTEXT_FILE_BYTES) {
      throw new Error(`File too large (${file.size} bytes): ${file.name}`);
    }
    const text = await file.text();
    loaded.push({ name: file.name, text: normalizeText(text) });
  }

  return loaded;
}
