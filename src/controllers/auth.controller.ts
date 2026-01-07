import { Request, Response } from "express";
import { signup as SignUp, login as Login } from "../services/auth.service";

export async function signUp(req: Request, res: Response) {
  const result = await SignUp(
    req.body.username,
    req.body.password,
    req.body.confirmPassword
  );
  return res.status(result.status).json(result.data);
}

export async function login(req: Request, res: Response) {
  const result = await Login(req.body.username, req.body.password);
  return res.status(result.status).json(result.data);
}

export default { signUp, login };
