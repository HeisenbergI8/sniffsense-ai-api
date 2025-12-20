import { Response } from "express";
import {
  createPerfume,
  updatePerfume,
  getPerfumes,
  getPerfumeById,
  deletePerfume,
} from "../services/perfume.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { STATUS, ERROR_MESSAGE } from "../configs/constants.config";
import type {
  PerfumePayload,
  PerfumeUpdatePayload,
} from "../types/perfume.types";

export async function create(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const result = await createPerfume(userId, req.body as PerfumePayload);
  return res.status(result.status).json(result.data);
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await updatePerfume(
    userId,
    perfumeId,
    req.body as PerfumeUpdatePayload
  );
  return res.status(result.status).json(result.data);
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const pageRaw = req.query.page ? Number(req.query.page) : 1;
  const limitRaw = req.query.limit ? Number(req.query.limit) : 10;
  const sortByRaw = req.query.sortBy as "lastUsedAt" | "usageCount" | undefined;
  const sortOrderRaw = req.query.sortOrder as "ASC" | "DESC" | undefined;

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
  const sortBy = sortByRaw === "usageCount" ? "usageCount" : "lastUsedAt";
  const sortOrder = sortOrderRaw === "ASC" ? "ASC" : "DESC";

  // Reject invalid combos (e.g., non-numeric page/limit or out-of-range limit)
  if (
    !Number.isFinite(pageRaw) ||
    !Number.isFinite(limitRaw) ||
    limit <= 0 ||
    limit > 100
  ) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: ERROR_MESSAGE.VALIDATION_ERROR });
  }

  const result = await getPerfumes(userId, page, limit, sortBy, sortOrder);
  return res.status(result.status).json(result.data);
}

export async function getById(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await getPerfumeById(userId, perfumeId);
  return res.status(result.status).json(result.data);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await deletePerfume(userId, perfumeId);
  if (result.status === STATUS.NO_CONTENT) {
    return res.status(STATUS.NO_CONTENT).send();
  }
  return res.status(result.status).json(result.data);
}

export default { create, update, list, getById, remove };
