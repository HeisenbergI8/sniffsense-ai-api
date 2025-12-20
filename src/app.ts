import express from "express";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/global-error.middleware";
import perfumeRouter from "./routes/perfume.routes";

// Initialize Express app
const app = express();

// Global middlewares
app.use(express.json());

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/perfumes", perfumeRouter);

app.use(errorHandler);

export default app;
