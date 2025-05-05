import express from "express";
import {
  getAll,
  create,
  update,
  remove,
  updateTaskStatus,
  updateTaskPriority,
} from "../../routes/hr/task/index.js";
import {
  createTaskSchema,
  updateTaskSchema,
  getAllTasksSchema,
  removeTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
} from "../../routes/hr/task/validation.js";
import validate from "../../middlewares/validate.js";

const router = express.Router();

router
  .get("/", validate(getAllTasksSchema), getAll)
  .post("/", validate(createTaskSchema), create)
  .patch("/:taskId", validate(updateTaskSchema), update)
  .delete("/:taskId", validate(removeTaskSchema), remove);

  // route for update task status
router.patch("/:taskId/status/:statusId", validate(updateTaskStatusSchema), updateTaskStatus);

// route for update priority
router.patch("/:taskId/priority/:priorityId", validate(updateTaskPrioritySchema), updateTaskPriority);

export default router;
