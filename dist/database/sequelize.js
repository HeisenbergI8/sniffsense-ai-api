"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_config_1 = require("../configs/db.config");
const sequelize = new sequelize_1.Sequelize(db_config_1.dbConfig.database, db_config_1.dbConfig.username, db_config_1.dbConfig.password, {
    host: db_config_1.dbConfig.host,
    port: db_config_1.dbConfig.port,
    dialect: db_config_1.dbConfig.dialect,
    logging: false,
    pool: {
        max: 10,
        min: 0,
        idle: 10000,
    },
});
exports.default = sequelize;
