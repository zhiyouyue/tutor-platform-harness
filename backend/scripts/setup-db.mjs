/**
 * 初始化 expert_platform 库与 Phase 1 schema
 * Usage: node scripts/setup-db.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const host = process.env.MYSQL_HOST || "localhost";
const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const database = process.env.MYSQL_DATABASE || "expert_platform";

const baseConfig = { host, port, user, password, multipleStatements: true };

async function runSqlFile(pool, relativePath) {
  const sqlPath = path.resolve(__dirname, "..", relativePath);
  const sql = fs.readFileSync(sqlPath, "utf8");
  console.log(`\n>> ${relativePath}`);
  await pool.query(sql);
  console.log("   OK");
}

async function main() {
  console.log(`Target database: ${database}`);

  const adminPool = mysql.createPool(baseConfig);
  try {
    await adminPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database '${database}' ready.`);
  } catch (err) {
    console.warn(`CREATE DATABASE skipped (${err.message})`);
    console.warn("若库不存在，请 DBA 执行 backend/sql/00_create_database.sql 并 GRANT 权限。");
  } finally {
    await adminPool.end();
  }

  const pool = mysql.createPool({ ...baseConfig, database });
  try {
    await runSqlFile(pool, "sql/01_phase1_schema.sql");
    await runSqlFile(pool, "sql/02_seed_dictionaries.sql");
    if (process.env.DB_DEV_SEED !== "false") {
      await runSqlFile(pool, "sql/03_dev_seed_users.sql");
    }

    const [tables] = await pool.query("SHOW TABLES");
    console.log(`\nTables (${tables.length}):`);
    for (const row of tables) {
      console.log(" -", Object.values(row)[0]);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
