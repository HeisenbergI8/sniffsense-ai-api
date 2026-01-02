"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signUpSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signUpSchema = joi_1.default.object({
    username: joi_1.default.string().trim().min(3).max(50).required().messages({
        "string.empty": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must not exceed 50 characters",
    }),
    password: joi_1.default.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
        .required()
        .messages({
        "string.pattern.base": "Password must contain letters and numbers",
    }),
});
exports.loginSchema = joi_1.default.object({
    username: joi_1.default.string().trim().min(3).max(50).required().messages({
        "string.empty": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must not exceed 50 characters",
    }),
    password: joi_1.default.string().min(6).max(128).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must not exceed 128 characters",
    }),
});
