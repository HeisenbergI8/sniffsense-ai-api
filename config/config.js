// Load environment variables from .env
require("dotenv").config();

const base = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || "database_development",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
};

module.exports = {
  development: { ...base },
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || `${base.database}_test`,
  },
  production: {
    ...base,
    database: process.env.DB_NAME_PROD || `${base.database}_production`,
  },
};
