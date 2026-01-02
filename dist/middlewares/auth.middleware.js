"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_config_1 = require("../configs/constants.config");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(constants_config_1.STATUS.UNAUTHORIZED)
            .json({ message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED });
    }
    const token = authHeader.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res
            .status(constants_config_1.STATUS.SERVER_ERROR)
            .json({ message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Type guard: ensure decoded is object with expected claims
        const isObject = typeof decoded === "object" && decoded !== null;
        const hasSub = isObject && "sub" in decoded;
        const hasUsername = isObject && typeof decoded.username === "string";
        if (!isObject || !hasSub || !hasUsername) {
            return res
                .status(constants_config_1.STATUS.UNAUTHORIZED)
                .json({ message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED });
        }
        const payload = decoded;
        const subValue = typeof payload.sub === "string" ? Number(payload.sub) : payload.sub;
        if (!Number.isFinite(subValue)) {
            return res
                .status(constants_config_1.STATUS.UNAUTHORIZED)
                .json({ message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED });
        }
        req.user = { id: subValue, username: payload.username };
        next();
    }
    catch (err) {
        return res
            .status(constants_config_1.STATUS.UNAUTHORIZED)
            .json({ message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED });
    }
}
