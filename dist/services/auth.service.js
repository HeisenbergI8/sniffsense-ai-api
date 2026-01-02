"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const constants_config_1 = require("../configs/constants.config");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const sequelize_1 = require("sequelize");
const token_util_1 = require("../utils/token.util");
async function signup(username, password) {
    try {
        logger_util_1.default.info(`Creating user ${JSON.stringify({ username })}`);
        const hashed = await bcrypt_1.default.hash(password, 10);
        const created = await user_model_1.default.create({ username, password: hashed });
        logger_util_1.default.info("User created successfully", { id: created.id, username });
        return {
            status: constants_config_1.STATUS.CREATED,
            data: {
                message: constants_config_1.SUCCESS_MESSAGE.CREATE_USER,
                user: { id: created.id, username: created.username },
            },
        };
    }
    catch (err) {
        if (err instanceof sequelize_1.UniqueConstraintError) {
            logger_util_1.default.warn("User already exists", { username });
            return {
                status: constants_config_1.STATUS.CONFLICT,
                data: { message: constants_config_1.ERROR_MESSAGE.USER_EXISTS },
            };
        }
        logger_util_1.default.error("Failed to create user", {
            error: err?.message,
            username,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
async function login(username, password) {
    try {
        logger_util_1.default.info(`Loggin attempt ${JSON.stringify({ username })}`);
        const user = await user_model_1.default.findOne({ where: { username } });
        if (!user) {
            logger_util_1.default.warn("Invalid credentials attempt", { username });
            return {
                status: constants_config_1.STATUS.UNAUTHORIZED,
                data: { message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED },
            };
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            logger_util_1.default.warn("Invalid credentials attempt", { username });
            return {
                status: constants_config_1.STATUS.UNAUTHORIZED,
                data: { message: constants_config_1.ERROR_MESSAGE.UNAUTHORIZED },
            };
        }
        logger_util_1.default.info("User logged in successfully", { id: user.id, username });
        const token = (0, token_util_1.generateToken)({ sub: user.id, username: user.username });
        return {
            status: constants_config_1.STATUS.SUCCESS,
            data: {
                message: "Login successful",
                user: { id: user.id, username: user.username },
                token,
            },
        };
    }
    catch (err) {
        logger_util_1.default.error("Failed to log in user", {
            error: err?.message,
            username,
        });
        return {
            status: constants_config_1.STATUS.SERVER_ERROR,
            data: { message: constants_config_1.ERROR_MESSAGE.SERVER_ERROR },
        };
    }
}
