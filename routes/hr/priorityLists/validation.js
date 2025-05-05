import Joi from "joi";
import { objectId, sortBy } from "../../../utils/custom.validation.js";

export const createPriorityListSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required().custom(objectId),
});

export const updatePriorityListSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  departmentIds: Joi.array().items(Joi.string()),
  adminId: Joi.string(),
});

export const getAllPriorityListsSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  departmentIds: Joi.array().items(Joi.string()),
  adminId: Joi.string().custom(objectId),
  page: Joi.number().default(1),
  limit: Joi.number().default(10),
  sortBy: Joi.string().custom(sortBy),
  isPagination: Joi.boolean().default(true),
});
