#!/usr/bin/env node
/**
 * Backs up the admin database and uploads.
 *
 *   npm run cms:backup                 → ~/backups/setuware-<date>/
 *   npm run cms:backup -- /some/folder
 *
 * Safe while the site is running (SQLite VACUUM INTO makes a consistent copy).
 * Keeps the last 14 backups in the default folder.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = process.env.CMS_DATA_DIR ?? path.join(process.cwd(), "data");
const db = path.join(dataDir, "cms.db");
if (!existsSync(db)) {
  console.error(`✖ No database at ${db}. Run this from the project folder.`);
  process.exit(1);
}

const root = process.argv[2] ?? path.join(os.homedir(), "backups");
const target = path.join(root, `setuware-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}`);
mkdirSync(target, { recursive: true });

const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
new DatabaseSync(db).exec(`VACUUM INTO '${path.join(target, "cms.db").replace(/'/g, "''")}'`);
if (existsSync(path.join(dataDir, "uploads"))) {
  cpSync(path.join(dataDir, "uploads"), path.join(target, "uploads"), { recursive: true });
}
console.log(`✔ Backup written to ${target}`);

if (!process.argv[2]) {
  const old = readdirSync(root)
    .filter((name) => name.startsWith("setuware-"))
    .sort()
    .slice(0, -14);
  for (const name of old) rmSync(path.join(root, name), { recursive: true, force: true });
}
