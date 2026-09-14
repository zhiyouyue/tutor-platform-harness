import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(dir, "../../.env") });
loadDotenv({ path: path.resolve(process.cwd(), ".env") });
