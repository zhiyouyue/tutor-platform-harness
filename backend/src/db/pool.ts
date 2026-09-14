import mysql from "mysql2/promise";
import { config } from "../config/env.js";

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: config.db.waitForConnections,
  queueLimit: config.db.queueLimit,
  dateStrings: false,
  charset: "utf8mb4",
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  await conn.query("SELECT 1");
  conn.release();
}

export default pool;
