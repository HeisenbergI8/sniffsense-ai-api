import { Response } from "express";
import {
  createPerfume as CreatePerfume,
  updatePerfume as UpdatePerfume,
  getPerfumes as GetPerfumes,
  getPerfumeById as GetPerfumeById,
  deletePerfume as DeletePerfume,
  recommendPerfume as RecommendPerfume,
} from "../services/perfume.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { STATUS } from "../configs/constants.config";
import type {
  PerfumePayload,
  PerfumeUpdatePayload,
} from "../types/perfume.types";

export async function createPerfume(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const result = await CreatePerfume(userId, req.body as PerfumePayload);
  return res.status(result.status).json(result.data);
}

export async function updatePerfume(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await UpdatePerfume(
    userId,
    perfumeId,
    req.body as PerfumeUpdatePayload
  );
  return res.status(result.status).json(result.data);
}

export async function getPerfumes(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const result = await GetPerfumes(
    userId,
    req.query.page,
    req.query.limit,
    req.query.sortBy,
    req.query.sortOrder
  );
  return res.status(result.status).json(result.data);
}

export async function getPerfumeById(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await GetPerfumeById(userId, perfumeId);
  return res.status(result.status).json(result.data);
}

export async function deletePerfume(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await DeletePerfume(userId, perfumeId);
  if (result.status === STATUS.NO_CONTENT) {
    return res.status(STATUS.NO_CONTENT).send();
  }
  return res.status(result.status).json(result.data);
}

export async function recommendPerfume(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user!.id;

  // Parse latitude and longitude from query params
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  const result = await RecommendPerfume(userId, {
    occasion:
      typeof req.query.occasion === "string" ? req.query.occasion : undefined,
    // Map-based location (preferred)
    lat: lat && !isNaN(lat) ? lat : undefined,
    lon: lon && !isNaN(lon) ? lon : undefined,
    // Text-based location (fallback)
    city: typeof req.query.city === "string" ? req.query.city : undefined,
    state: typeof req.query.state === "string" ? req.query.state : undefined,
    country:
      typeof req.query.country === "string" ? req.query.country : undefined,
  });
  return res.status(result.status).json(result.data);
}

export default {
  createPerfume,
  updatePerfume,
  getPerfumes,
  getPerfumeById,
  deletePerfume,
  recommendPerfume,
};
