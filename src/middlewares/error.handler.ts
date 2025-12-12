import { Request, Response, NextFunction } from "express";
import { STATUS, ERROR_MESSAGE } from "../configs/constants.config";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("ERROR:", err);
  res.status(err.status || STATUS.SERVER_ERROR).json({
    message: err.message || ERROR_MESSAGE.SERVER_ERROR,
  });
}
