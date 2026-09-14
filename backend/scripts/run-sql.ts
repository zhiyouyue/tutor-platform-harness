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

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

for (const stmt of statements) {
  await pool.query(stmt);
  console.log("OK:", stmt.slice(0, 60).replace(/\s+/g, " "), "...");
}

await pool.end();
console.log("Done:", sqlPath);
