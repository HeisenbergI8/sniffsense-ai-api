import bcrypt from "bcrypt";
import User from "../models/user";
import {
  STATUS,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "../configs/constants.config";
import logger from "../utils/logger";

export async function createUser(username: string, password: string) {
  try {
    logger.info(`Creating user ${JSON.stringify({ username })}`);
    const existing = await User.findOne({
      where: { username },
      attributes: ["id"],
      raw: true,
    });
    if (existing) {
      logger.warn(`User exists: ${username}`);
      return {
        status: STATUS.CONFLICT,
        data: { message: ERROR_MESSAGE.USER_EXISTS },
      };
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({ username, password: hashed });

    logger.info("User created successfully", { id: created.id, username });
    return {
      status: STATUS.CREATED,
      data: {
        message: SUCCESS_MESSAGE.CREATE_USER,
        user: { id: created.id, username: created.username },
      },
    };
  } catch (err) {
    logger.error("Failed to create user", {
      error: (err as any)?.message,
      username,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}
