"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 3000),
    weather: {
        openWeatherApiKey: process.env.OPENWEATHER_API_KEY || "",
    },
    db: {
        host: process.env.DB_HOST || "",
        port: Number(process.env.DB_PORT || 5432),
        name: process.env.DB_NAME || "",
        user: process.env.DB_USER || "",
        pass: process.env.DB_PASS || "",
    },
};
