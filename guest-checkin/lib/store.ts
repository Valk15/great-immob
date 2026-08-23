import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Stay, StoreShape } from "./types";

const ROOT = path.join(process.cwd(), "data");
const STORE = path.join(ROOT, "stays.json");
const UPLOADS = path.join(ROOT, "uploads");
export const OPERATOR_SIGNATURE = path.join(ROOT, "operator-signature.png");

function ensureDirs() {
  mkdirSync(UPLOADS, { recursive: true });
}

function readStore(): StoreShape {
  ensureDirs();
  if (!existsSync(STORE)) return { stays: [] };
  try {
    const raw = readFileSync(STORE, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    return { stays: Array.isArray(parsed.stays) ? parsed.stays : [] };
  } catch {
    return { stays: [] };
  }
}

function writeStore(store: StoreShape) {
  ensureDirs();
  writeFileSync(STORE, JSON.stringify(store, null, 2), "utf8");
}

export function listStays() {
  return readStore()
    .stays.slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getStay(id: string) {
  return readStore().stays.find((s) => s.id === id);
}

export function getStayByToken(token: string) {
  return readStore().stays.find((s) => s.token === token);
}

export function saveStay(stay: Stay) {
  const store = readStore();
  const i = store.stays.findIndex((s) => s.id === stay.id);
  if (i >= 0) store.stays[i] = stay;
  else store.stays.push(stay);
  writeStore(store);
  return stay;
}

export function deleteStay(id: string) {
  if (!/^[a-f0-9]+$/i.test(id)) return false;
  const store = readStore();
  const next = store.stays.filter((s) => s.id !== id);
  if (next.length === store.stays.length) return false;
  writeStore({ stays: next });
  const dir = path.join(UPLOADS, id);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  return true;
}

export function newIds() {
  return {
    id: randomBytes(8).toString("hex"),
    token: randomBytes(18).toString("base64url"),
  };
}

export function uploadPath(stayId: string, filename: string) {
  ensureDirs();
  const dir = path.join(UPLOADS, stayId);
  mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function publicFileName(kind: string, ext: string) {
  return `${kind}.${ext.replace(/^\./, "")}`;
}

export function hasOperatorSignature() {
  return existsSync(OPERATOR_SIGNATURE);
}

export function readOperatorSignature() {
  if (!hasOperatorSignature()) return null;
  return readFileSync(OPERATOR_SIGNATURE);
}

export function writeOperatorSignature(buf: Buffer) {
  ensureDirs();
  writeFileSync(OPERATOR_SIGNATURE, buf);
}

export function resolveUpload(stayId: string, filename: string) {
  const full = path.join(UPLOADS, stayId, filename);
  const rel = path.relative(UPLOADS, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  if (!existsSync(full)) return null;
  return full;
}

export { UPLOADS };
