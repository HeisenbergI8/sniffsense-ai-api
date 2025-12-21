import { Response } from "express";
import { recordUsage as RecordUsage } from "../services/usage.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function recordUsage(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const perfumeId = Number(req.params.id);
  const result = await RecordUsage(userId, perfumeId, req.body);
  return res.status(result.status).json(result.data);
}

export default { recordUsage };
