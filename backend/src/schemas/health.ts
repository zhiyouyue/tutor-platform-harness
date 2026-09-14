export const healthResponseSchema = {
  type: "object",
  required: ["status", "timestamp"],
  properties: {
    status: { type: "string" },
    timestamp: { type: "string" },
    services: {
      type: "object",
      properties: {
        database: { type: "string" },
      },
    },
  },
} as const;
