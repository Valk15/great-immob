import { randomBytes } from "crypto";
import {
  mimeFromName,
  persistRead,
  persistReadJson,
  persistRemovePrefix,
  persistWrite,
  persistWriteJson,
} from "./persist";
import type { Stay, StoreShape } from "./types";

const STAYS_FILE = "stays.json";
const SIGNATURE_FILE = "operator-signature.png";

async function readStore(): Promise<StoreShape> {
  return persistReadJson<StoreShape>(STAYS_FILE, { stays: [] });
}

async function writeStore(store: StoreShape) {
  await persistWriteJson(STAYS_FILE, {
    stays: Array.isArray(store.stays) ? store.stays : [],
  });
}

export async function listStays() {
  const store = await readStore();
  return store.stays.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStay(id: string) {
  const store = await readStore();
  return store.stays.find((s) => s.id === id);
}

export async function getStayByToken(token: string) {
  const store = await readStore();
  return store.stays.find((s) => s.token === token);
}

export async function saveStay(stay: Stay) {
  const store = await readStore();
  const i = store.stays.findIndex((s) => s.id === stay.id);
  if (i >= 0) store.stays[i] = stay;
  else store.stays.push(stay);
  await writeStore(store);
  return stay;
}

export async function deleteStay(id: string) {
  if (!/^[a-f0-9]+$/i.test(id)) return false;
  const store = await readStore();
  const next = store.stays.filter((s) => s.id !== id);
  if (next.length === store.stays.length) return false;
  await writeStore({ stays: next });
  await persistRemovePrefix(`uploads/${id}`);
  return true;
}

export function newIds() {
  return {
    id: randomBytes(8).toString("hex"),
    token: randomBytes(18).toString("base64url"),
  };
}

export function publicFileName(kind: string, ext: string) {
  return `${kind}.${ext.replace(/^\./, "")}`;
}

export async function writeUpload(stayId: string, filename: string, buf: Buffer) {
  await persistWrite(`uploads/${stayId}/${filename}`, buf, mimeFromName(filename));
  return filename;
}

export async function readUpload(stayId: string, filename: string) {
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) return null;
  return persistRead(`uploads/${stayId}/${filename}`);
}

export async function hasOperatorSignature() {
  return Boolean(await persistRead(SIGNATURE_FILE));
}

export async function readOperatorSignature() {
  return persistRead(SIGNATURE_FILE);
}

export async function writeOperatorSignature(buf: Buffer) {
  await persistWrite(SIGNATURE_FILE, buf, "image/png");
}
