import { Request, Response, NextFunction } from "express";
import { STATUS, ERROR_MESSAGE } from "../configs/constants.config";
import Joi from "joi";

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) {
      return res.status(STATUS.BAD_REQUEST).json({
        message: ERROR_MESSAGE.VALIDATION_ERROR,
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}
