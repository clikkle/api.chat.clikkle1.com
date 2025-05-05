import express from "express";
import {
  getAll,
  create,
  update,
  remove,
} from "../../routes/hr/statusLists/index.js";

const router = express.Router();

router
  .get("/", getAll)
  .post("/", create)
  .patch("/:id", update)
  .delete("/:id", remove);

export default router;
