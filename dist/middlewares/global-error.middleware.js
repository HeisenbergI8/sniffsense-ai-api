"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const constants_config_1 = require("../configs/constants.config");
function errorHandler(err, req, res, next) {
    console.error("ERROR:", err);
    res.status(err.status || constants_config_1.STATUS.SERVER_ERROR).json({
        message: err.message || constants_config_1.ERROR_MESSAGE.SERVER_ERROR,
    });
}
