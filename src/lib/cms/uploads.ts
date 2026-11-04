import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { dataDir } from "./db";

/**
 * File uploads, stored under `data/uploads/<kind>/` (outside the build, so
 * they survive deploys). Résumés are private and only served to signed-in
 * staff; media (blog images) is public at /media/<file>.
 *
 * Every file is checked by its first bytes, not by its name or the browser's
 * claimed type, and is saved under a random name.
 */

export type UploadKind = "resumes" | "media";

interface Rule {
  maxBytes: number;
  types: { ext: string; mime: string; magic: (bytes: Uint8Array) => boolean }[];
}

const starts = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, index) => bytes[offset + index] === value);

const RULES: Record<UploadKind, Rule> = {
  resumes: {
    maxBytes: 5 * 1024 * 1024,
    types: [
      { ext: "pdf", mime: "application/pdf", magic: (b) => starts(b, [0x25, 0x50, 0x44, 0x46]) },
      {
        ext: "docx",
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        magic: (b) => starts(b, [0x50, 0x4b, 0x03, 0x04]),
      },
      { ext: "doc", mime: "application/msword", magic: (b) => starts(b, [0xd0, 0xcf, 0x11, 0xe0]) },
    ],
  },
  media: {
    maxBytes: 5 * 1024 * 1024,
    types: [
      { ext: "jpg", mime: "image/jpeg", magic: (b) => starts(b, [0xff, 0xd8, 0xff]) },
      { ext: "png", mime: "image/png", magic: (b) => starts(b, [0x89, 0x50, 0x4e, 0x47]) },
      { ext: "webp", mime: "image/webp", magic: (b) => starts(b, [0x52, 0x49, 0x46, 0x46]) && starts(b, [0x57, 0x45, 0x42, 0x50], 8) },
      { ext: "gif", mime: "image/gif", magic: (b) => starts(b, [0x47, 0x49, 0x46, 0x38]) },
    ],
  },
};

export class UploadError extends Error {}

function folder(kind: UploadKind): string {
  return path.join(dataDir(), "uploads", kind);
}

/** Validates and stores a file; returns the stored name and the original one. */
export async function saveUpload(kind: UploadKind, file: File): Promise<{ file: string; original: string; mime: string }> {
  const rule = RULES[kind];
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > rule.maxBytes) throw new UploadError(`Files must be under ${rule.maxBytes / 1024 / 1024} MB.`);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = rule.types.find((candidate) => candidate.magic(bytes));
  if (!type) {
    throw new UploadError(
      kind === "resumes" ? "Please upload a PDF or Word document." : "Please upload a JPG, PNG, WebP or GIF image.",
    );
  }

  const name = `${new Date().toISOString().slice(0, 10)}-${randomBytes(9).toString("base64url")}.${type.ext}`;
  await mkdir(folder(kind), { recursive: true });
  await writeFile(path.join(folder(kind), name), bytes);
  const original = path.basename(file.name || `upload.${type.ext}`).slice(0, 120);
  return { file: name, original, mime: type.mime };
}

/** Reads a stored file; null for anything that is not a plain stored name. */
export async function readUpload(kind: UploadKind, name: string): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!/^[\w-]+\.(pdf|docx|doc|jpg|png|webp|gif)$/.test(name)) return null;
  const ext = name.split(".").pop() ?? "";
  const type = RULES[kind].types.find((candidate) => candidate.ext === ext);
  if (!type) return null;
  try {
    return { bytes: await readFile(path.join(folder(kind), name)), mime: type.mime };
  } catch {
    return null;
  }
}
