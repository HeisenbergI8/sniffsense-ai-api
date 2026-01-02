"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = __importDefault(require("./database/sequelize"));
const app_1 = __importDefault(require("./app"));
const models_1 = require("./models");
dotenv_1.default.config();
async function startServer() {
    try {
        await sequelize_1.default.authenticate();
        console.log("Database connected successfully");
        (0, models_1.initModels)();
        await sequelize_1.default.sync();
        console.log("All models synced successfully");
        const PORT = Number(process.env.PORT || 3000);
        app_1.default.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
}
startServer();
