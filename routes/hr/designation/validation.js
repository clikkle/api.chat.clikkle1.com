import Joi from "joi";
import { objectId, sortBy } from "../../../utils/custom.validation.js";

export const createDesignationSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    mailAlias: Joi.string().allow(""),
    departmentId: Joi.string().required().custom(objectId),
  })
};

export const updateDesignationSchema = {
  params: Joi.object().keys({
    designationId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    mailAlias: Joi.string().allow(""),
    departmentId: Joi.string().required().custom(objectId),
  })
};

export const getAllDesignationsSchema = {
  query: Joi.object().keys({
    name: Joi.string(),
    mailAlias: Joi.string(),
    departmentId: Joi.string().custom(objectId),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sortBy: Joi.string().custom(sortBy),
    isPagination: Joi.boolean().default(true),
  })
};

export const getDesignationSchema = {
  params: Joi.object().keys({
    designationId: Joi.string().required().custom(objectId),
  })
};

export const removeDesignationSchema = {
  params: Joi.object().keys({
    designationId: Joi.string().required().custom(objectId),
  })
};

