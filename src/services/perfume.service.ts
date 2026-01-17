import { UniqueConstraintError } from "sequelize";
import Perfume from "../models/perfume.model";
import logger from "../utils/logger.util";
import {
  STATUS,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "../configs/constants.config";
import { PerfumePayload, PerfumeUpdatePayload } from "../types/perfume.types";
import { normalizePageLimit, normalizeSort } from "../utils/query.util";
import {
  geocodeCity,
  getCurrentTempC,
  mapToWeatherTags,
} from "../utils/weather.util";
import { Op, literal } from "sequelize";

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
      imageUrl: payload.imageUrl ?? null,
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
  pageRaw?: unknown,
  limitRaw?: unknown,
  sortByRaw?: unknown,
  sortOrderRaw?: unknown
) {
  try {
    const { page, limit } = normalizePageLimit(pageRaw, limitRaw, {
      page: 1,
      limit: 10,
      maxLimit: 100,
    });
    const { sortBy, sortOrder } = normalizeSort(
      sortByRaw,
      sortOrderRaw,
      ["lastUsedAt", "usageCount"] as const,
      { sortBy: "lastUsedAt", sortOrder: "DESC" }
    );

    const offset = (page - 1) * limit;
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
      limit,
    });

    return {
      status: STATUS.SUCCESS,
      data: {
        items: rows,
        total: count,
        page,
        limit,
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
    if (!Number.isFinite(perfumeId) || perfumeId <= 0) {
      logger.warn("Invalid perfume id", { userId, perfumeId });
      return {
        status: STATUS.BAD_REQUEST,
        data: { message: ERROR_MESSAGE.VALIDATION_ERROR },
      };
    }
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

export async function recommendPerfume(
  userId: number,
  options: {
    occasion?: string; // "casual" | "work" | "formal" | "versatile"
    // Map-based location (preferred)
    lat?: number;
    lon?: number;
    // Text-based location (fallback)
    city?: string;
    state?: string;
    country?: string;
  }
) {
  try {
    // Occasion default
    const occasion = (options.occasion ?? "casual").toLowerCase();

    // Determine weather tag using OpenWeather if location provided
    let weatherTag: "hot" | "cold" | "all_season" | undefined;
    let weatherDetails: {
      city?: string;
      lat: number;
      lon: number;
      tempC: number;
      tag: typeof weatherTag;
    } | null = null;

    // Priority 1: Use coordinates from map if provided
    if (options.lat !== undefined && options.lon !== undefined) {
      try {
        const tempC = await getCurrentTempC(options.lat, options.lon);
        const tags = mapToWeatherTags(tempC);
        weatherTag = tags.primary;
        weatherDetails = {
          lat: options.lat,
          lon: options.lon,
          tempC,
          tag: weatherTag,
        };
      } catch (e) {
        logger.warn(
          "Weather lookup failed with coordinates, proceeding without weather filter",
          {
            userId,
            lat: options.lat,
            lon: options.lon,
            error: (e as any)?.message,
          }
        );
      }
    }
    // Priority 2: Fall back to city-based geocoding if coordinates not provided
    else if (options.city) {
      try {
        const { lat, lon } = await geocodeCity(
          options.city,
          options.state,
          options.country
        );
        const tempC = await getCurrentTempC(lat, lon);
        const tags = mapToWeatherTags(tempC);
        weatherTag = tags.primary;
        weatherDetails = {
          city: options.city,
          lat,
          lon,
          tempC,
          tag: weatherTag,
        };
      } catch (e) {
        logger.warn(
          "Weather lookup failed with city, proceeding without weather filter",
          {
            userId,
            city: options.city,
            state: options.state,
            country: options.country,
            error: (e as any)?.message,
          }
        );
      }
    }

    // Build filters: occasionTags contains occasion OR versatile; weatherTags contains weatherTag OR all_season
    const where: any = { userId };
    const tagContains = (tag: string) => ({ [Op.contains]: [tag] });

    // Occasion filter
    where[Op.and] = [
      {
        [Op.or]: [
          { occasionTags: tagContains(occasion) },
          { occasionTags: tagContains("versatile") },
        ],
      },
    ];

    // Weather filter (optional)
    if (weatherTag) {
      where[Op.and].push({
        [Op.or]: [
          { weatherTags: tagContains(weatherTag) },
          { weatherTags: tagContains("all_season") },
        ],
      });
    }

    // Ranking: exact matches first (occasion, weather), then usage-based rotation
    const esc = (s: string) => s.replace(/'/g, "''");
    const occasionCase = literal(
      `CASE WHEN "occasionTags"::text[] @> ARRAY['${esc(occasion)}'] THEN 0 ` +
        `WHEN "occasionTags"::text[] @> ARRAY['versatile'] THEN 1 ELSE 2 END`
    );

    // If no weatherTag calculated, keep neutral weight (1) to avoid influencing order
    const weatherCase = weatherTag
      ? literal(
          `CASE WHEN "weatherTags"::text[] @> ARRAY['${esc(weatherTag)}'] THEN 0 ` +
            `WHEN "weatherTags"::text[] @> ARRAY['all_season'] THEN 1 ELSE 2 END`
        )
      : literal("1");

    const order = [
      [occasionCase, "ASC"],
      [weatherCase, "ASC"],
      ["usageCount", "ASC"],
      [literal('"lastUsedAt" ASC NULLS FIRST')],
    ] as any;

    // Fetch matching perfumes; fallback to all user's perfumes if none match
    const candidates = await Perfume.findAll({ where, order, limit: 10 });
    let items = candidates;
    if (!items.length) {
      items = await Perfume.findAll({ where: { userId }, order, limit: 10 });
    }

    // Pick top recommendation and exclude it from alternatives
    const recommendation = items[0] ?? null;
    const alternatives = recommendation
      ? items.filter((p) => p.id !== (recommendation as any).id)
      : items;

    return {
      status: STATUS.SUCCESS,
      data: {
        recommendation,
        alternatives,
        filters: { occasion, weatherTag },
        weather: weatherDetails,
      },
    };
  } catch (err) {
    logger.error("Failed to recommend perfume", {
      error: (err as any)?.message,
      userId,
      options,
    });
    return {
      status: STATUS.SERVER_ERROR,
      data: { message: ERROR_MESSAGE.SERVER_ERROR },
    };
  }
}
