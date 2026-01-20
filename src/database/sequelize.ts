import { Sequelize } from "sequelize";
import { dbConfig } from "../configs/db.config";

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, {
      dialect: dbConfig.dialect,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        idle: 10000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required for Render's SSL certificates
        },
      },
    })
  : new Sequelize(dbConfig.database!, dbConfig.username!, dbConfig.password!, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        idle: 10000,
      },
    });

export default sequelize;
