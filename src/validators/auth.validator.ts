import Joi from "joi";

export const signUpSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 50 characters",
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.pattern.base": "Password must contain letters and numbers",
    }),
});

export type SignUpInput = {
  username: string;
  password: string;
};

export const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 50 characters",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
  }),
});

export type LoginInput = {
  username: string;
  password: string;
};
