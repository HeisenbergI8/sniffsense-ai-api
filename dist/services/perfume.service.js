"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPerfume = createPerfume;
exports.updatePerfume = updatePerfume;
exports.getPerfumes = getPerfumes;
exports.getPerfumeById = getPerfumeById;
exports.deletePerfume = deletePerfume;
exports.updatePerfumeImage = updatePerfumeImage;
exports.deletePerfumeImage = deletePerfumeImage;
exports.recommendPerfume = recommendPerfume;
const sequelize_1 = require("sequelize");
const perfume_model_1 = __importDefault(require("../models/perfume.model"));
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const constants_config_1 = require("../configs/constants.config");
const query_util_1 = require("../utils/query.util");
const weather_util_1 = require("../utils/weather.util");
const sequelize_2 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_config_1 = require("../configs/multer.config");
function safeUnlink(filePath) {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (e) {
        logger_util_1.default.warn("Failed to delete file", {
            filePath,
            error: e?.message,
        });
    }
}
async function createPerfume(userId, payload, file) {
    try {
        logger_util_1.default.info("Creating perfume", {
            userId,
            payload: { ...payload, lastUsedAt: payload.lastUsedAt ?? null },
        });
        const created = await perfume_model_1.default.create({
            userId,
            brand: payload.brand,
            name: payload.name,
            weatherTags: payload.weatherTags,
            occasionTags: payload.occasionTags,
            mlRemaining: payload.mlRemaining,
            lastUsedAt: payload.lastUsedAt ?? null,
            imageUrl: file
                ? (0, multer_config_1.toPublicUrl)(path_1.default.basename(file.filename || file.path))
                : (payload.imageUrl ?? null),
        });
        logger_util_1.default.info("Perfume created", { id: created.id, userId });
        return {
            status: constants_config_1.STATUS.CREATED,
            data: { message: constants_config_1.SUCCESS_MESSAGE.CREATE_PERFUME, perfume: created },
        };
    }
    catch (err) {
        if (err instanceof sequelize_1.UniqueConstraintError) {
            logger_util_1.default.warn("Perfume already exists for user", {
                userId,
                brand: payload.brand,
                name: payload.name,
            });
            return {
                status: constants_config_1.STATUS.CONFLICT,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_EXISTS },
            };
        }
        logger_util_1.default.error("Failed to create perfume", {
            error: err?.message,
            userId,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
async function updatePerfume(userId, perfumeId, updates, file) {
    try {
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found for update", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        logger_util_1.default.info("Updating perfume", {
            userId,
            perfumeId,
            updates,
            hasFile: !!file,
        });
        // Handle image replacement if file provided
        if (file) {
            const newUrl = (0, multer_config_1.toPublicUrl)(path_1.default.basename(file.filename || file.path));
            const oldUrl = perfume.imageUrl ?? null;
            await perfume.update({ ...updates, imageUrl: newUrl });
            if (oldUrl) {
                const localPath = (0, multer_config_1.resolveLocalPathFromUrl)(oldUrl);
                safeUnlink(localPath);
            }
        }
        else {
            await perfume.update(updates);
        }
        await perfume.reload();
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: { message: constants_config_1.SUCCESS_MESSAGE.UPDATE_PERFUME, perfume },
        };
    }
    catch (err) {
        if (err instanceof sequelize_1.UniqueConstraintError) {
            logger_util_1.default.warn("Perfume uniqueness conflict on update", {
                userId,
                perfumeId,
            });
            return {
                status: constants_config_1.STATUS.CONFLICT,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_EXISTS },
            };
        }
        logger_util_1.default.error("Failed to update perfume", {
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
async function getPerfumes(userId, pageRaw, limitRaw, sortByRaw, sortOrderRaw) {
    try {
        const { page, limit } = (0, query_util_1.normalizePageLimit)(pageRaw, limitRaw, {
            page: 1,
            limit: 10,
            maxLimit: 100,
        });
        const { sortBy, sortOrder } = (0, query_util_1.normalizeSort)(sortByRaw, sortOrderRaw, ["lastUsedAt", "usageCount"], { sortBy: "lastUsedAt", sortOrder: "DESC" });
        const offset = (page - 1) * limit;
        logger_util_1.default.info("Fetching perfumes", {
            userId,
            page,
            limit,
            sortBy,
            sortOrder,
        });
        const { rows, count } = await perfume_model_1.default.findAndCountAll({
            where: { userId }, // leverages composite indexes (userId + sort)
            order: [[sortBy, sortOrder]],
            offset,
            limit,
        });
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: {
                items: rows,
                total: count,
                page,
                limit,
            },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to fetch perfumes", {
            error: err?.message,
            userId,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
async function getPerfumeById(userId, perfumeId) {
    try {
        if (!Number.isFinite(perfumeId) || perfumeId <= 0) {
            logger_util_1.default.warn("Invalid perfume id", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.BAD_REQUEST,
                data: { message: constants_config_1.ERROR_MESSAGE.VALIDATION_ERROR },
            };
        }
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found by id", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        return { status: constants_config_1.STATUS.SUCCESS, data: { perfume } };
    }
    catch (err) {
        logger_util_1.default.error("Failed to fetch perfume by id", {
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
async function deletePerfume(userId, perfumeId) {
    try {
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found for delete", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        if (perfume.imageUrl) {
            const localPath = (0, multer_config_1.resolveLocalPathFromUrl)(perfume.imageUrl);
            safeUnlink(localPath);
        }
        await perfume_model_1.default.destroy({ where: { id: perfumeId, userId } });
        logger_util_1.default.info("Perfume deleted", { userId, perfumeId });
        return { status: constants_config_1.STATUS.NO_CONTENT, data: undefined };
    }
    catch (err) {
        logger_util_1.default.error("Failed to delete perfume", {
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
async function updatePerfumeImage(userId, perfumeId, file) {
    try {
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found for image update", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        if (!file) {
            logger_util_1.default.warn("No image file provided", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.BAD_REQUEST,
                data: { message: constants_config_1.ERROR_MESSAGE.VALIDATION_ERROR },
            };
        }
        const newUrl = (0, multer_config_1.toPublicUrl)(path_1.default.basename(file.filename || file.path));
        const oldUrl = perfume.imageUrl ?? null;
        await perfume.update({ imageUrl: newUrl });
        if (oldUrl) {
            const localPath = (0, multer_config_1.resolveLocalPathFromUrl)(oldUrl);
            safeUnlink(localPath);
        }
        await perfume.reload();
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: { message: constants_config_1.SUCCESS_MESSAGE.UPDATE_PERFUME, perfume },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to update perfume image", {
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
async function deletePerfumeImage(userId, perfumeId) {
    try {
        const perfume = await perfume_model_1.default.findOne({ where: { id: perfumeId, userId } });
        if (!perfume) {
            logger_util_1.default.warn("Perfume not found for image delete", { userId, perfumeId });
            return {
                status: constants_config_1.STATUS.NOT_FOUND,
                data: { message: constants_config_1.ERROR_MESSAGE.PERFUME_NOT_FOUND },
            };
        }
        if (perfume.imageUrl) {
            const localPath = (0, multer_config_1.resolveLocalPathFromUrl)(perfume.imageUrl);
            safeUnlink(localPath);
        }
        await perfume.update({ imageUrl: null });
        await perfume.reload();
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: { message: constants_config_1.SUCCESS_MESSAGE.UPDATE_PERFUME, perfume },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to delete perfume image", {
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
async function recommendPerfume(userId, options) {
    try {
        // Occasion default
        const occasion = (options.occasion ?? "casual").toLowerCase();
        // Determine weather tag using OpenWeather if city provided; else no weather filter
        let weatherTag;
        let weatherDetails = null;
        if (options.city) {
            try {
                const { lat, lon } = await (0, weather_util_1.geocodeCity)(options.city, options.state, options.country);
                const tempC = await (0, weather_util_1.getCurrentTempC)(lat, lon);
                const tags = (0, weather_util_1.mapToWeatherTags)(tempC);
                weatherTag = tags.primary;
                weatherDetails = {
                    city: options.city,
                    lat,
                    lon,
                    tempC,
                    tag: weatherTag,
                };
            }
            catch (e) {
                logger_util_1.default.warn("Weather lookup failed, proceeding without weather filter", {
                    userId,
                    city: options.city,
                    state: options.state,
                    country: options.country,
                    error: e?.message,
                });
            }
        }
        // Build filters: occasionTags contains occasion OR versatile; weatherTags contains weatherTag OR all_season
        const where = { userId };
        const tagContains = (tag) => ({ [sequelize_2.Op.contains]: [tag] });
        // Occasion filter
        where[sequelize_2.Op.and] = [
            {
                [sequelize_2.Op.or]: [
                    { occasionTags: tagContains(occasion) },
                    { occasionTags: tagContains("versatile") },
                ],
            },
        ];
        // Weather filter (optional)
        if (weatherTag) {
            where[sequelize_2.Op.and].push({
                [sequelize_2.Op.or]: [
                    { weatherTags: tagContains(weatherTag) },
                    { weatherTags: tagContains("all_season") },
                ],
            });
        }
        // Ranking: exact matches first (occasion, weather), then usage-based rotation
        const esc = (s) => s.replace(/'/g, "''");
        const occasionCase = (0, sequelize_2.literal)(`CASE WHEN "occasionTags"::text[] @> ARRAY['${esc(occasion)}'] THEN 0 ` +
            `WHEN "occasionTags"::text[] @> ARRAY['versatile'] THEN 1 ELSE 2 END`);
        // If no weatherTag calculated, keep neutral weight (1) to avoid influencing order
        const weatherCase = weatherTag
            ? (0, sequelize_2.literal)(`CASE WHEN "weatherTags"::text[] @> ARRAY['${esc(weatherTag)}'] THEN 0 ` +
                `WHEN "weatherTags"::text[] @> ARRAY['all_season'] THEN 1 ELSE 2 END`)
            : (0, sequelize_2.literal)("1");
        const order = [
            [occasionCase, "ASC"],
            [weatherCase, "ASC"],
            ["usageCount", "ASC"],
            [(0, sequelize_2.literal)('"lastUsedAt" ASC NULLS FIRST')],
        ];
        // Fetch matching perfumes; fallback to all user's perfumes if none match
        const candidates = await perfume_model_1.default.findAll({ where, order, limit: 10 });
        let items = candidates;
        if (!items.length) {
            items = await perfume_model_1.default.findAll({ where: { userId }, order, limit: 10 });
        }
        // Pick top recommendation and exclude it from alternatives
        const recommendation = items[0] ?? null;
        const alternatives = recommendation
            ? items.filter((p) => p.id !== recommendation.id)
            : items;
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: {
                recommendation,
                alternatives,
                filters: { occasion, weatherTag },
                weather: weatherDetails,
            },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to recommend perfume", {
            error: err?.message,
            userId,
            options,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
