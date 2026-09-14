import mysql from "mysql2/promise";
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(dir, "../.env") });

const db = process.env.MYSQL_DATABASE || "expert_platform";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306", 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: db,
});
const [tables] = await pool.query(`SHOW TABLES`);
const key = `Tables_in_${db}`;

console.log(`Database: ${db}`);
console.log(`Table count: ${tables.length}\n`);

for (const row of tables) {
  const name = row[key];
  const [cols] = await pool.query(`DESCRIBE \`${name}\``);
  console.log(`=== ${name} (${cols.length} columns) ===`);
  for (const c of cols) {
    console.log(`  ${c.Field}\t${c.Type}\t${c.Key || ""}`);
  }
  console.log("");
}

await pool.end();
