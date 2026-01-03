import Joi from "joi";
import { WeatherTag } from "../enums/weather-tag.enum";
import { OccasionTag } from "../enums/occasion-tag.enum";

export const createPerfumeSchema = Joi.object({
  brand: Joi.string().trim().min(1).required(),
  name: Joi.string().trim().min(1).required(),
  weatherTags: Joi.array()
    .items(Joi.string().valid(...Object.values(WeatherTag)))
    .min(1)
    .required(),
  occasionTags: Joi.array()
    .items(Joi.string().valid(...Object.values(OccasionTag)))
    .min(1)
    .required(),
  mlRemaining: Joi.number().integer().min(0).required(),
  lastUsedAt: Joi.date().optional().allow(null),
  imageUrl: Joi.string().optional().allow(null),
});

export const updatePerfumeSchema = Joi.object({
  brand: Joi.string().trim().min(1).optional(),
  name: Joi.string().trim().min(1).optional(),
  weatherTags: Joi.array()
    .items(Joi.string().valid(...Object.values(WeatherTag)))
    .min(1)
    .optional(),
  occasionTags: Joi.array()
    .items(Joi.string().valid(...Object.values(OccasionTag)))
    .min(1)
    .optional(),
  mlRemaining: Joi.number().integer().min(0).optional(),
  lastUsedAt: Joi.date().optional().allow(null),
  imageUrl: Joi.string().optional().allow(null),
}).min(1);
