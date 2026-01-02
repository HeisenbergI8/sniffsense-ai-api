"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USAGE_CONSTANTS = exports.TOKEN_CONSTANTS = exports.ERROR_MESSAGE = exports.SUCCESS_MESSAGE = exports.STATUS = void 0;
exports.STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
};
exports.SUCCESS_MESSAGE = {
    CREATE_USER: "User created successfully",
    CREATE_PERFUME: "Perfume created successfully",
    UPDATE_PERFUME: "Perfume updated successfully",
    DELETE_PERFUME: "Perfume deleted successfully",
};
exports.ERROR_MESSAGE = {
    USER_EXISTS: "Username already exists",
    SERVER_ERROR: "Internal server error",
    VALIDATION_ERROR: "Validation error",
    USER_NOT_FOUND: "User not found",
    UNAUTHORIZED: "Unauthorized access",
    PERFUME_NOT_FOUND: "Perfume not found",
    PERFUME_EXISTS: "Perfume with brand and name already exists",
};
exports.TOKEN_CONSTANTS = {
    SECRET_KEY: process.env.JWT_SECRET,
    EXPIRATION_TIME: "1h",
};
// Domain-specific constants
exports.USAGE_CONSTANTS = {
    ESTIMATE_ML_PER_SPRAY: 0.1,
};
