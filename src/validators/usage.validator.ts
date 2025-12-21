import Joi from "joi";

export const createUsageSchema = Joi.object({
  sprays: Joi.number().integer().min(1).max(100).optional().default(1),
});
