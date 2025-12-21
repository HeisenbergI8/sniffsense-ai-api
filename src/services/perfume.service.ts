import { UniqueConstraintError } from "sequelize";
import Perfume from "../models/perfume.model";
import logger from "../utils/logger.util";
import {
  STATUS,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "../configs/constants.config";
import { PerfumePayload, PerfumeUpdatePayload } from "../types/perfume.types";

export async function createPerfume(userId: number, payload: PerfumePayload) {
  try {
    logger.info("Creating perfume", {
      userId,
      payload: { ...payload, lastUsedAt: payload.lastUsedAt ?? null },
    });

    const created = await Perfume.create({
      userId,
      brand: payload.brand,
      name: payload.name,
      weatherTags: payload.weatherTags,
      occasionTags: payload.occasionTags,
      mlRemaining: payload.mlRemaining,
      lastUsedAt: payload.lastUsedAt ?? null,
    });

    logger.info("Perfume created", { id: created.id, userId });
    return {
      status: STATUS.CREATED,
      data: { message: SUCCESS_MESSAGE.CREATE_PERFUME, perfume: created },
    };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn("Perfume already exists for user", {
        userId,
        brand: payload.brand,
        name: payload.name,
      });
      return {
        status: STATUS.CONFLICT,
        data: { message: ERROR_MESSAGE.PERFUME_EXISTS },
      };
    }
    logger.error("Failed to create perfume", {
      error: (err as any)?.message,
      userId,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}

export async function updatePerfume(
  userId: number,
  perfumeId: number,
  updates: PerfumeUpdatePayload
) {
  try {
    const perfume = await Perfume.findOne({ where: { id: perfumeId, userId } });
    if (!perfume) {
      logger.warn("Perfume not found for update", { userId, perfumeId });
      return {
        status: STATUS.NOT_FOUND,
        data: { message: ERROR_MESSAGE.PERFUME_NOT_FOUND },
      };
    }

    logger.info("Updating perfume", { userId, perfumeId, updates });
    await perfume.update(updates);
    await perfume.reload();
    return {
      status: STATUS.SUCCESS,
      data: { message: SUCCESS_MESSAGE.UPDATE_PERFUME, perfume },
    };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      logger.warn("Perfume uniqueness conflict on update", {
        userId,
        perfumeId,
      });
      return {
        status: STATUS.CONFLICT,
        data: { message: ERROR_MESSAGE.PERFUME_EXISTS },
      };
    }
    logger.error("Failed to update perfume", {
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

export async function getPerfumes(
  userId: number,
  page = 1,
  limit = 10,
  sortBy: "lastUsedAt" | "usageCount" = "lastUsedAt",
  sortOrder: "ASC" | "DESC" = "DESC"
) {
  try {
    // defensive: service assumes sanitized inputs
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const offset = (page - 1) * safeLimit;
    logger.info("Fetching perfumes", {
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const { rows, count } = await Perfume.findAndCountAll({
      where: { userId }, // leverages composite indexes (userId + sort)
      order: [[sortBy, sortOrder]],
      offset,
      limit: safeLimit,
    });

    return {
      status: STATUS.SUCCESS,
      data: {
        items: rows,
        total: count,
        page,
        limit: safeLimit,
      },
    };
  } catch (err) {
    logger.error("Failed to fetch perfumes", {
      error: (err as any)?.message,
      userId,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}

export async function getPerfumeById(userId: number, perfumeId: number) {
  try {
    const perfume = await Perfume.findOne({ where: { id: perfumeId, userId } });
    if (!perfume) {
      logger.warn("Perfume not found by id", { userId, perfumeId });
      return {
        status: STATUS.NOT_FOUND,
        data: { message: ERROR_MESSAGE.PERFUME_NOT_FOUND },
      };
    }
    return { status: STATUS.SUCCESS, data: { perfume } };
  } catch (err) {
    logger.error("Failed to fetch perfume by id", {
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

export async function deletePerfume(userId: number, perfumeId: number) {
  try {
    const deleted = await Perfume.destroy({ where: { id: perfumeId, userId } });
    if (!deleted) {
      logger.warn("Perfume not found for delete", { userId, perfumeId });
      return {
        status: STATUS.NOT_FOUND,
        data: { message: ERROR_MESSAGE.PERFUME_NOT_FOUND },
      };
    }
    logger.info("Perfume deleted", { userId, perfumeId });
    return { status: STATUS.NO_CONTENT, data: undefined };
  } catch (err) {
    logger.error("Failed to delete perfume", {
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
