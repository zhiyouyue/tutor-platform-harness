import "./load-env.js";

function envStr(key: string, alt?: string): string {
  return process.env[key] ?? process.env[alt ?? ""] ?? "";
}

function envInt(key: string, alt: string | undefined, fallback: number): number {
  const raw = process.env[key] ?? (alt ? process.env[alt] : undefined);
  return raw ? parseInt(raw, 10) : fallback;
}

export const config = {
  env: process.env.APP_ENV || process.env.NODE_ENV || "development",
  host: process.env.HOST || "0.0.0.0",
  port: envInt("PORT", undefined, 3000),
  isProd: (process.env.APP_ENV || process.env.NODE_ENV) === "production",
  isTest: (process.env.APP_ENV || process.env.NODE_ENV) === "test",

  allowedOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim()),

  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  db: {
    host: envStr("MYSQL_HOST", "db_host") || "127.0.0.1",
    port: envInt("MYSQL_PORT", "db_port", 3306),
    user: envStr("MYSQL_USER", "db_user") || "root",
    password: envStr("MYSQL_PASSWORD", "db_password"),
    database: envStr("MYSQL_DATABASE", "db_name") || "expert_platform",
    connectionLimit: envInt("MYSQL_POOL_SIZE", undefined, 10),
    waitForConnections: true,
    queueLimit: 0,
  },

  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: envInt("REDIS_PORT", undefined, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: envInt("REDIS_DB", undefined, 0),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "tutor:",
    enabled: process.env.REDIS_ENABLED === "true",
  },

  rtc: {
    enabled: process.env.ALIYUN_RTC_ENABLED !== "false",
    appId: process.env.ALIYUN_RTC_APP_ID || "",
    appKey: process.env.ALIYUN_RTC_APP_KEY || "",
    tokenTtlSeconds: envInt("ALIYUN_RTC_TOKEN_TTL_SECONDS", undefined, 7200),
    recordingCallbackSecret:
      process.env.RTC_RECORDING_CALLBACK_SECRET || "dev_rtc_callback_secret",
  },

  oss: {
    region: process.env.OSS_REGION || "oss-cn-hangzhou",
    bucket: process.env.OSS_BUCKET || "",
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "",
  },
} as const;
