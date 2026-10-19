import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../src/db/pool.js";
import "../src/config/load-env.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx scripts/run-sql.ts <sql-file>");
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(dir, "..", file);
const sql = fs.readFileSync(sqlPath, "utf8");

function stripLineComments(chunk: string): string {
  return chunk
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

const statements = sql
  .split(";")
  .map((s) => stripLineComments(s))
  .filter((s) => s.length > 0);

const SKIP_ERRNO = new Set([1060, 1061, 1826]); // column / index / FK 已存在

for (const stmt of statements) {
  try {
    await pool.query(stmt);
    console.log("OK:", stmt.slice(0, 60).replace(/\s+/g, " "), "...");
  } catch (err) {
    const e = err as { errno?: number; code?: string; sqlMessage?: string };
    const dup =
      SKIP_ERRNO.has(e.errno ?? 0) ||
      e.code === "ER_DUP_FIELDNAME" ||
      e.code === "ER_DUP_KEYNAME" ||
      (e.sqlMessage?.includes("Duplicate foreign key") ?? false);
    if (dup) {
      console.log("SKIP (already applied):", stmt.slice(0, 60).replace(/\s+/g, " "), "...");
      continue;
    }
    throw err;
  }
}

await pool.end();
console.log("Done:", sqlPath);
