"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("../sequelize"));
async function run() {
    const sql = {
        addImageUrl: 'ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS "imageUrl" TEXT NULL',
    };
    try {
        await sequelize_1.default.authenticate();
        console.log("Connected. Adding imageUrl to perfumes...");
        await sequelize_1.default.query(sql.addImageUrl);
        console.log("imageUrl column ensured on perfumes.");
    }
    catch (err) {
        console.error("Failed to add imageUrl column:", err);
        process.exit(1);
    }
    finally {
        await sequelize_1.default.close();
    }
}
run();
