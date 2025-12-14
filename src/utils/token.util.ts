import jwt from "jsonwebtoken";
import { TOKEN_CONSTANTS } from "../configs/constants.config";

export function generateToken(
  payload: object,
  expiresIn: string = TOKEN_CONSTANTS.EXPIRATION_TIME
) {
  const secret = TOKEN_CONSTANTS.SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn });
}
