import { Response } from "express";
import {
  recordUsage as RecordUsage,
  getUsages as GetUsages,
  getPerfumeUsages as GetPerfumeUsages,
} from "../services/usage.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function recordUsage(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await RecordUsage(userId, perfumeId, req.body);
  return res.status(result.status).json(result.data);
}

export async function getUsages(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const result = await GetUsages(userId, req.query.page, req.query.limit);
  return res.status(result.status).json(result.data);
}

export async function getPerfumeUsages(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await GetPerfumeUsages(
    userId,
    perfumeId,
    req.query.page,
    req.query.limit
  );
  return res.status(result.status).json(result.data);
}

export default { recordUsage, getUsages, getPerfumeUsages };
