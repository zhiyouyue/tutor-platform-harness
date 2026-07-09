import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  });
};

export default corsPlugin;
