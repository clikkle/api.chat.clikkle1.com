import Joi from "joi";
import { objectId, sortBy } from "../../../utils/custom.validation.js";
import { STATUS } from './enum.js';

export const createTaskSchema = {
  body: Joi.object().keys({
    ownerId: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    description: Joi.string(),
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    dueDate: Joi.string().required(),
    reminderDateTime: Joi.date().required(),
    priorityId: Joi.string().required().custom(objectId),
    statusId: Joi.string().required().custom(objectId),
  })
};

export const updateTaskSchema = {
  params: Joi.object().keys({
    taskId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    ownerId: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    dueDate: Joi.string().required(),
    reminderDateTime: Joi.string().required(),
    priorityId: Joi.string().required().custom(objectId),
    statusId: Joi.string().required().custom(objectId),
  })
};

export const getAllTasksSchema = {
  query: Joi.object().keys({
    status: Joi.string().valid(...Object.values(STATUS)).default(STATUS.ALL),
    name: Joi.string(),
    statusId: Joi.string().custom(objectId),
    priorityId: Joi.string().custom(objectId),
    description: Joi.string(),
    departmentIds: Joi.array().items(Joi.string()),
    adminId: Joi.string().custom(objectId),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sortBy: Joi.string().custom(sortBy),
    isPagination: Joi.boolean().default(true),
  })
};

export const getTaskSchema = {
  params: Joi.object().keys({
    taskId: Joi.string().required().custom(objectId),
  })
};

export const removeTaskSchema = {
  params: Joi.object().keys({
    taskId: Joi.string().required().custom(objectId),
  })
};

// updateTaskStatusSchema
export const updateTaskStatusSchema = {
  params: Joi.object().keys({
    taskId: Joi.string().required().custom(objectId),
    statusId: Joi.string().required().custom(objectId),
  })
};

export const updateTaskPrioritySchema = {
  params: Joi.object().keys({
    taskId: Joi.string().required().custom(objectId),
    priorityId: Joi.string().required().custom(objectId),
  })
};
