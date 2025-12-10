import express from "express";
import sequelize from "./db/sequelize";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

async function startServer() {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // sync models (optional in dev)
    // await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

startServer();
export default app;
