export const healthResponseSchema = {
  type: "object",
  required: ["status", "timestamp"],
  properties: {
    status: { type: "string" },
    timestamp: { type: "string", format: "date-time" },
  },
} as const;
