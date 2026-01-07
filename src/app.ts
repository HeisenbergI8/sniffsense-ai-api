import express from "express";
import { corsMiddleware, corsPreflight } from "./middlewares/cors.middleware";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/global-error.middleware";
import perfumeRouter from "./routes/perfume.routes";
import usageRouter from "./routes/usage.routes";
import path from "path";

// Initialize Express app
const app = express();

// Global middlewares
// CORS handled via dedicated middleware with env-based config
app.use(corsMiddleware);
app.options(/.*/, corsPreflight);

app.use(express.json());
// Support URL-encoded bodies (e.g., x-www-form-urlencoded from Postman)
app.use(express.urlencoded({ extended: true }));

// Static serving for uploaded files (images)
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/perfumes", perfumeRouter);
app.use("/api", usageRouter);

app.use(errorHandler);

export default app;
