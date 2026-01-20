import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  weather: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
  },
  db: {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST || "",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    pass: process.env.DB_PASS || "",
  },
  cors: {
    origins: (
      process.env.CORS_ORIGINS ||
      process.env.FRONTEND_ORIGIN ||
      (process.env.FRONTEND_PORT
        ? `http://localhost:${process.env.FRONTEND_PORT}`
        : "http://localhost:5173")
    )
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: String(process.env.CORS_CREDENTIALS).toLowerCase() === "true",
  },
} as const;
