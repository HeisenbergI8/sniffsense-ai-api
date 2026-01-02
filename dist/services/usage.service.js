"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUsage = recordUsage;
exports.getUsages = getUsages;
exports.getPerfumeUsages = getPerfumeUsages;
const sequelize_1 = __importDefault(require("../database/sequelize"));
const usage_model_1 = __importDefault(require("../models/usage.model"));
const perfume_model_1 = __importDefault(require("../models/perfume.model"));
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const constants_config_1 = require("../configs/constants.config");
const query_util_1 = require("../utils/query.util");
async function recordUsage(userId, perfumeId, payload) {
    try {
        const spraysRaw = payload?.sprays ?? 1;
        const spraysNum = Number(spraysRaw);
        const sprays = Number.isFinite(spraysNum)
            ? Math.min(Math.max(Math.trunc(spraysNum), 1), 100)
            : 1;
        return await sequelize_1.default.transaction(async (t) => {
            const perfume = await perfume_model_1.default.findOne({
                where: { id: perfumeId, userId },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });
            if (!perfume) {
                logger_util_1.default.warn("Perfume not found for usage", { userId, perfumeId });
                return {
                    status: constants_config_1.STATUS.NOT_FOUND,
                    data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
                };
            }
            const usage = await usage_model_1.default.create({ userId, perfumeId, sprays, usedAt: new Date() }, { transaction: t });
            // estimate ml decrease (keep integer mlRemaining and never negative)
            const mlToSubtract = Math.max(0, Math.round(sprays * constants_config_1.USAGE_CONSTANTS.ESTIMATE_ML_PER_SPRAY));
            const newMl = Math.max(0, (perfume.mlRemaining ?? 0) - mlToSubtract);
            await perfume.update({
                usageCount: (perfume.usageCount ?? 0) + 1,
                lastUsedAt: new Date(),
                mlRemaining: newMl,
            }, { transaction: t });
            await perfume.reload({ transaction: t });
            logger_util_1.default.info("Usage recorded", {
                userId,
                perfumeId,
                sprays,
                usageId: usage.id,
            });
            return {
                status: constants_config_1.STATUS.CREATED,
                data: { message: "Usage recorded", usage, perfume },
            };
        });
    }
    catch (err) {
        logger_util_1.default.error("Failed to record usage", {
            error: err?.message,
            userId,
            perfumeId,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
async function getUsages(userId, pageRaw, limitRaw) {
    try {
        const { page, limit } = (0, query_util_1.normalizePageLimit)(pageRaw, limitRaw, {
            page: 1,
            limit: 10,
            maxLimit: 100,
        });
        const offset = (page - 1) * limit;
        const { rows, count } = await usage_model_1.default.findAndCountAll({
            where: { userId },
            order: [["usedAt", "DESC"]],
            offset,
            limit,
        });
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: { items: rows, total: count, page, limit },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to fetch usages", {
            error: err?.message,
            userId,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
async function getPerfumeUsages(userId, perfumeId, pageRaw, limitRaw) {
    try {
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found for usage history", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        const { page, limit } = (0, query_util_1.normalizePageLimit)(pageRaw, limitRaw, {
            page: 1,
            limit: 10,
            maxLimit: 100,
        });
        const offset = (page - 1) * limit;
        const { rows, count } = await usage_model_1.default.findAndCountAll({
            where: { userId, perfumeId },
            order: [["usedAt", "DESC"]],
            offset,
            limit,
        });
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: { items: rows, total: count, page, limit, perfume },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to fetch perfume usages", {
            error: err?.message,
            userId,
            perfumeId,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
