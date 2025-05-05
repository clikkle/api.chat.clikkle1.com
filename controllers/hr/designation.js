import express from "express";
import {
  getAll,
  create,
  update,
  remove,
} from "../../routes/hr/designation/index.js";
import {
  createDesignationSchema,
  updateDesignationSchema,
  getAllDesignationsSchema,
  removeDesignationSchema,
} from "../../routes/hr/designation/validation.js";
import validate from "../../middlewares/validate.js";

const router = express.Router();

router
  .get("/", validate(getAllDesignationsSchema), getAll)
  .post("/", validate(createDesignationSchema), create)
  .patch("/:designationId", validate(updateDesignationSchema), update)
  .delete("/:designationId", validate(removeDesignationSchema), remove);


export default router;
