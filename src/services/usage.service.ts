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
