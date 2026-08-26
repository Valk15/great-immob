import { del, get, list, put } from "@vercel/blob";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";

const PREFIX = "greatimmob/";

function blobOn() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function diskRoot() {
  if (process.env.VERCEL) return path.join("/tmp", "greatimmob-data");
  return path.join(process.cwd(), "data");
}

function diskFile(rel: string) {
  const full = path.join(diskRoot(), rel);
  mkdirSync(path.dirname(full), { recursive: true });
  return full;
}

async function streamToBuffer(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return null;
  const reader = stream.getReader();
  const parts: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) parts.push(value);
  }
  return Buffer.concat(parts.map((p) => Buffer.from(p)));
}

export async function persistRead(rel: string): Promise<Buffer | null> {
  if (blobOn()) {
    try {
      const result = await get(PREFIX + rel, { access: "private", useCache: false });
      if (result && result.statusCode === 200 && result.stream) {
        const buf = await streamToBuffer(result.stream);
        if (buf) {
          writeFileSync(diskFile(rel), buf);
          return buf;
        }
      }
    } catch {
      /* fall through to disk */
    }
  }
  const local = path.join(diskRoot(), rel);
  if (existsSync(local)) return readFileSync(local);
  return null;
}

export async function persistWrite(rel: string, buf: Buffer, contentType: string) {
  writeFileSync(diskFile(rel), buf);
  if (!blobOn()) return;
  await put(PREFIX + rel, buf, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
}

export async function persistReadJson<T>(rel: string, fallback: T): Promise<T> {
  const buf = await persistRead(rel);
  if (!buf) return fallback;
  try {
    return JSON.parse(buf.toString("utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function persistWriteJson(rel: string, data: unknown) {
  await persistWrite(rel, Buffer.from(JSON.stringify(data, null, 2), "utf8"), "application/json");
}

export async function persistRemovePrefix(prefix: string) {
  const dir = path.join(diskRoot(), prefix);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  if (!blobOn()) return;
  const { blobs } = await list({ prefix: PREFIX + prefix, limit: 500 });
  if (blobs.length) await del(blobs.map((b) => b.url));
}

export function mimeFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "json") return "application/json";
  return "application/octet-stream";
}
