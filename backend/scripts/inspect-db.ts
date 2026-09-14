import mysql from "mysql2/promise";
import "../src/config/load-env.js";
import { config } from "../src/config/env.js";

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

const [tables] = await pool.query<Array<Record<string, string>>>("SHOW TABLES");
const key = `Tables_in_${config.db.database}`;

console.log(`Database: ${config.db.database}`);
console.log(`Table count: ${tables.length}\n`);

for (const row of tables) {
  const name = row[key];
  const [cols] = await pool.query<
    Array<{ Field: string; Type: string; Null: string; Key: string }>
  >(`DESCRIBE \`${name}\``);
  console.log(`=== ${name} (${cols.length} columns) ===`);
  for (const c of cols) {
    console.log(`  ${c.Field}\t${c.Type}\t${c.Key || ""}`);
  }
  console.log("");
}

await pool.end();
