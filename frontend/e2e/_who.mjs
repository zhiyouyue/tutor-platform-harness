import fs from "fs";
import { createRequire } from "module";

const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const mysql = require("mysql2/promise");
const env = Object.fromEntries(
  fs.readFileSync(new URL("../../backend/.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
const conn = await mysql.createConnection({
  host: env.MYSQL_HOST || "127.0.0.1",
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
});
const [rows] = await conn.query(
  `SELECT p.id, p.title, u.account, d.label
   FROM projects p
   JOIN student_profiles sp ON sp.id = p.student_id
   JOIN users u ON u.id = sp.user_id
   LEFT JOIN project_nodes pn ON pn.project_id = p.id
   LEFT JOIN dict_coaching_types d ON d.code = pn.node_type
   ORDER BY p.id DESC
   LIMIT 20`,
);
console.log(JSON.stringify(rows));
await conn.end();
