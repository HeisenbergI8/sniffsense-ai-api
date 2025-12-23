import sequelize from "../database/sequelize";
import Usage from "../models/usage.model";
import Perfume from "../models/perfume.model";
import logger from "../utils/logger.util";
import {
  STATUS,
  ERROR_MESSAGE,
  USAGE_CONSTANTS,
} from "../configs/constants.config";
import { UsagePayload } from "../types/usage.types";
import { normalizePageLimit } from "../utils/query.util";

export async function recordUsage(
  userId: number,
  perfumeId: number,
  payload: UsagePayload
) {
  try {
    const spraysRaw = payload?.sprays ?? 1;
    const spraysNum = Number(spraysRaw);
    const sprays = Number.isFinite(spraysNum)
      ? Math.min(Math.max(Math.trunc(spraysNum), 1), 100)
      : 1;

    return await sequelize.transaction(async (t) => {
      const perfume = await Perfume.findOne({
        where: { id: perfumeId, userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!perfume) {
        logger.warn("Perfume not found for usage", { userId, perfumeId });
        return {
          status: STATUS.NOT_FOUND,
          data: { message: ERROR_MESSAGE.PERFUME_NOT_FOUND },
        };
      }

      const usage = await Usage.create(
        { userId, perfumeId, sprays, usedAt: new Date() },
        { transaction: t }
      );

      // estimate ml decrease (keep integer mlRemaining and never negative)
      const mlToSubtract = Math.max(
        0,
        Math.round(sprays * USAGE_CONSTANTS.ESTIMATE_ML_PER_SPRAY)
      );
      const newMl = Math.max(0, (perfume.mlRemaining ?? 0) - mlToSubtract);

      await perfume.update(
        {
          usageCount: (perfume.usageCount ?? 0) + 1,
          lastUsedAt: new Date(),
          mlRemaining: newMl,
        },
        { transaction: t }
      );

      await perfume.reload({ transaction: t });

      logger.info("Usage recorded", {
        userId,
        perfumeId,
        sprays,
        usageId: usage.id,
      });

      return {
        status: STATUS.CREATED,
        data: { message: "Usage recorded", usage, perfume },
      };
    });
  } catch (err) {
    logger.error("Failed to record usage", {
      error: (err as any)?.message,
      userId,
      perfumeId,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}

export async function getUsages(
  userId: number,
  pageRaw?: unknown,
  limitRaw?: unknown
) {
  try {
    const { page, limit } = normalizePageLimit(pageRaw, limitRaw, {
      page: 1,
      limit: 10,
      maxLimit: 100,
    });
    const offset = (page - 1) * limit;

    const { rows, count } = await Usage.findAndCountAll({
      where: { userId },
      order: [["usedAt", "DESC"]],
      offset,
      limit,
    });

    return {
      status: STATUS.SUCCESS,
      data: { items: rows, total: count, page, limit },
    };
  } catch (err) {
    logger.error("Failed to fetch usages", {
      error: (err as any)?.message,
      userId,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}

export async function getPerfumeUsages(
  userId: number,
  perfumeId: number,
  pageRaw?: unknown,
  limitRaw?: unknown
) {
  try {
    const perfume = await Perfume.findOne({ where: { id: perfumeId, userId } });
    if (!perfume) {
      logger.warn("Perfume not found for usage history", { userId, perfumeId });
      return {
        status: STATUS.NOT_FOUND,
        data: { message: ERROR_MESSAGE.PERFUME_NOT_FOUND },
      };
    }

    const { page, limit } = normalizePageLimit(pageRaw, limitRaw, {
      page: 1,
      limit: 10,
      maxLimit: 100,
    });
    const offset = (page - 1) * limit;

    const { rows, count } = await Usage.findAndCountAll({
      where: { userId, perfumeId },
      order: [["usedAt", "DESC"]],
      offset,
      limit,
    });

    return {
      status: STATUS.SUCCESS,
      data: { items: rows, total: count, page, limit, perfume },
    };
  } catch (err) {
    logger.error("Failed to fetch perfume usages", {
      error: (err as any)?.message,
      userId,
      perfumeId,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}
