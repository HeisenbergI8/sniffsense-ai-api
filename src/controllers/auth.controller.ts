import { Request, Response } from "express";
import { createUser as CreateUser } from "../services/auth.service";

export async function signUp(req: Request, res: Response) {
  const result = await CreateUser(req.body.username, req.body.password);
  return res.status(result.status).json(result.data);
}

export default { signUp };
