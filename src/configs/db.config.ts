import { env } from "./env.config";

export interface DBConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  dialect: "postgres";
  url?: string;
}

const parseDatabaseConfig = (): DBConfig => {
  if (env.db.url) {
    return {
      url: env.db.url,
      dialect: "postgres",
    };
  }

  return {
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    username: env.db.user,
    password: env.db.pass,
    dialect: "postgres",
  };
};

export const dbConfig: DBConfig = parseDatabaseConfig();
