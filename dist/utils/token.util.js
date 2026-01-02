"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_config_1 = require("../configs/constants.config");
function generateToken(payload, expiresIn = constants_config_1.TOKEN_CONSTANTS.EXPIRATION_TIME) {
    const secret = constants_config_1.TOKEN_CONSTANTS.SECRET_KEY;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
