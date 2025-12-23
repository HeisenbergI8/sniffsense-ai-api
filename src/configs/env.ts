import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  weather: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
  },
  db: {
    host: process.env.DB_HOST || "",
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    pass: process.env.DB_PASS || "",
  },
} as const;
