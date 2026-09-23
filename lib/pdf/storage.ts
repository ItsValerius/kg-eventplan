import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, head, put } from "@vercel/blob";

// Where the generated Sessionsplan PDF is kept: Vercel Blob when running on Vercel (builds
// and functions set VERCEL), a local file everywhere else, so local development never
// needs a Blob token and never overwrites the production PDF.
const BLOB_PATHNAME = "sessionsplan.pdf";
const LOCAL_FILE = path.join(process.cwd(), "data", "sessionsplan.pdf");

const onVercel = () => Boolean(process.env.VERCEL);

// Where the stored PDF is (Blob URL or file path) and a version that changes with its content.
export type StoredPdf = { location: string; version: string };

export async function savePdf(pdf: Buffer) {
  if (!onVercel()) {
    await mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await writeFile(LOCAL_FILE, pdf);
    return;
  }
  await put(BLOB_PATHNAME, pdf, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 300,
  });
}

// The stored PDF, or null until one has been generated.
export async function findPdf(): Promise<StoredPdf | null> {
  if (!onVercel()) {
    try {
      return { location: LOCAL_FILE, version: String((await stat(LOCAL_FILE)).mtimeMs) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  try {
    const { url, etag } = await head(BLOB_PATHNAME);
    return { location: url, version: etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

// The PDF's bytes as a response body, or null if it has gone missing.
export async function openPdf({ location, version }: StoredPdf): Promise<BodyInit | null> {
  if (!onVercel()) return new Uint8Array(await readFile(location));
  // Bust Vercel Blob's CDN cache on overwrite: the etag changes with the content, so
  // appending it forces a fresh fetch instead of a stale cached copy.
  const upstream = await fetch(`${location}?v=${encodeURIComponent(version)}`, {
    cache: "no-store",
  });
  return upstream.ok ? upstream.body : null;
}
