"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePerfumeSchema = exports.createPerfumeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const weather_tag_enum_1 = require("../enums/weather-tag.enum");
const occasion_tag_enum_1 = require("../enums/occasion-tag.enum");
exports.createPerfumeSchema = joi_1.default.object({
    brand: joi_1.default.string().trim().min(1).required(),
    name: joi_1.default.string().trim().min(1).required(),
    weatherTags: joi_1.default.array()
        .items(joi_1.default.string().valid(...Object.values(weather_tag_enum_1.WeatherTag)))
        .min(1)
        .required(),
    occasionTags: joi_1.default.array()
        .items(joi_1.default.string().valid(...Object.values(occasion_tag_enum_1.OccasionTag)))
        .min(1)
        .required(),
    mlRemaining: joi_1.default.number().integer().min(0).required(),
    lastUsedAt: joi_1.default.date().optional().allow(null),
});
exports.updatePerfumeSchema = joi_1.default.object({
    brand: joi_1.default.string().trim().min(1).optional(),
    name: joi_1.default.string().trim().min(1).optional(),
    weatherTags: joi_1.default.array()
        .items(joi_1.default.string().valid(...Object.values(weather_tag_enum_1.WeatherTag)))
        .min(1)
        .optional(),
    occasionTags: joi_1.default.array()
        .items(joi_1.default.string().valid(...Object.values(occasion_tag_enum_1.OccasionTag)))
        .min(1)
        .optional(),
    mlRemaining: joi_1.default.number().integer().min(0).optional(),
    lastUsedAt: joi_1.default.date().optional().allow(null),
}).min(1);
