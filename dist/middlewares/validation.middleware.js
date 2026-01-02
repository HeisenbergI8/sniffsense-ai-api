"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const constants_config_1 = require("../configs/constants.config");
function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(constants_config_1.STATUS.BAD_REQUEST).json({
                message: constants_config_1.ERROR_MESSAGE.VALIDATION_ERROR,
                details: error.details.map((d) => d.message),
            });
        }
        req.body = value;
        next();
    };
}
