import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { STATUS, ERROR_MESSAGE } from "../configs/constants.config";

export interface AuthenticatedUser {
  id: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGE.UNAUTHORIZED });
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res
      .status(STATUS.SERVER_ERROR)
      .json({ message: ERROR_MESSAGE.SERVER_ERROR });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // Type guard: ensure decoded is object with expected claims
    const isObject = typeof decoded === "object" && decoded !== null;
    const hasSub = isObject && "sub" in decoded;
    const hasUsername =
      isObject && typeof (decoded as any).username === "string";

    if (!isObject || !hasSub || !hasUsername) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGE.UNAUTHORIZED });
    }

    const payload = decoded as JwtPayload & {
      sub: string | number;
      username: string;
    };
    const subValue =
      typeof payload.sub === "string" ? Number(payload.sub) : payload.sub;

    if (!Number.isFinite(subValue)) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGE.UNAUTHORIZED });
    }

    req.user = { id: subValue as number, username: payload.username };
    next();
  } catch (err) {
    return res
      .status(STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGE.UNAUTHORIZED });
  }
}
