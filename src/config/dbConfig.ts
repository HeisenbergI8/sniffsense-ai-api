import dotenv from "dotenv";
dotenv.config();

export interface DBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: "postgres";
}

export const dbConfig: DBConfig = {
  host: process.env.DB_HOST || "",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "",
  username: process.env.DB_USER || "",
  password: process.env.DB_PASS || "",
  dialect: "postgres",
};
