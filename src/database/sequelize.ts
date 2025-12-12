import { Sequelize } from "sequelize";
import { dbConfig } from "../configs/dbConfig";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
  }
);

export default sequelize;
