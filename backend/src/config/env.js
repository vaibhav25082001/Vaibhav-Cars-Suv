require("dotenv").config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

module.exports = env;
