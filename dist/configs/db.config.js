"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const env_1 = require("./env");
exports.dbConfig = {
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    database: env_1.env.db.name,
    username: env_1.env.db.user,
    password: env_1.env.db.pass,
    dialect: 'postgres',
};
