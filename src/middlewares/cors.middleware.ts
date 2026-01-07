import cors from "cors";
import type { CorsOptions } from "cors";
import { env } from "../configs/env.config";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: env.cors.credentials,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

export const corsMiddleware = cors(corsOptions);

export const corsPreflight = cors(corsOptions);
