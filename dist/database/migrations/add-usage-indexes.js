"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("../sequelize"));
async function run() {
    const sql = {
        addUserPerfumeUsedAt: 'CREATE INDEX IF NOT EXISTS idx_usages_user_perfume_usedat ON usages ("userId","perfumeId","usedAt")',
        addUserUsedAt: 'CREATE INDEX IF NOT EXISTS idx_usages_user_usedat ON usages ("userId","usedAt")',
        addPerfumeId: 'CREATE INDEX IF NOT EXISTS idx_usages_perfumeId ON usages ("perfumeId")',
        // Try to drop older redundant 2-col index if present (name may vary depending on past sync)
        dropOldUserPerfume1: "DROP INDEX IF EXISTS usages_userId_perfumeId",
        dropOldUserPerfume2: 'DROP INDEX IF EXISTS "usages_userId_perfumeId"',
        dropOldUserPerfume3: "DROP INDEX IF EXISTS idx_usages_user_perfume",
    };
    try {
        await sequelize_1.default.authenticate();
        console.log("Connected. Applying usage index changes...");
        await sequelize_1.default.query(sql.addUserPerfumeUsedAt);
        await sequelize_1.default.query(sql.addUserUsedAt);
        await sequelize_1.default.query(sql.addPerfumeId);
        // drop redundant index variants (best-effort)
        await sequelize_1.default.query(sql.dropOldUserPerfume1).catch(() => { });
        await sequelize_1.default.query(sql.dropOldUserPerfume2).catch(() => { });
        await sequelize_1.default.query(sql.dropOldUserPerfume3).catch(() => { });
        console.log("Usage indexes ensured.");
    }
    catch (err) {
        console.error("Failed to update usage indexes:", err);
        process.exit(1);
    }
    finally {
        await sequelize_1.default.close();
    }
}
run();
