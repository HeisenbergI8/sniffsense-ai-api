import { env } from "./env.config";

export interface DBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: "postgres";
}

export const dbConfig: DBConfig = {
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.pass,
  dialect: "postgres",
};
