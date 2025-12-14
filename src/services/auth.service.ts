import bcrypt from "bcrypt";
import User from "../models/user";
import {
  STATUS,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "../configs/constants.config";
import logger from "../utils/logger.util";
import { UniqueConstraintError } from "sequelize";
import { generateToken } from "../utils/token.util";

export async function signup(username: string, password: string) {
  try {
    logger.info(`Creating user ${JSON.stringify({ username })}`);

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
    if (err instanceof UniqueConstraintError) {
      logger.warn("User already exists", { username });

      return {
        status: STATUS.CONFLICT,
        data: { message: ERROR_MESSAGE.USER_EXISTS },
      };
    }
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

export async function login(username: string, password: string) {
  try {
    logger.info(`Loggin attempt ${JSON.stringify({ username })}`);

    const user = await User.findOne({ where: { username } });
    if (!user) {
      logger.warn("Invalid credentials attempt", { username });
      return {
        status: STATUS.UNAUTHORIZED,
        data: { message: ERROR_MESSAGE.UNAUTHORIZED },
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Invalid credentials attempt", { username });
      return {
        status: STATUS.UNAUTHORIZED,
        data: { message: ERROR_MESSAGE.UNAUTHORIZED },
      };
    }
    logger.info("User logged in successfully", { id: user.id, username });
    const token = generateToken({ sub: user.id, username: user.username });
    return {
      status: STATUS.SUCCESS,
      data: {
        message: "Login successful",
        user: { id: user.id, username: user.username },
        token,
      },
    };
  } catch (err) {
    logger.error("Failed to log in user", {
      error: (err as any)?.message,
      username,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}
