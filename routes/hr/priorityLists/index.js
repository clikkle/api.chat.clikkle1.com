import PriorityList from "../../../schema/PriorityList.model.js";
import pick from "../../../utils/pick.js";
import {
  createPriorityListSchema,
  updatePriorityListSchema,
  getAllPriorityListsSchema,
} from "./validation.js";

export const getAll = async (req, res, next) => {
  try {
    const { error, value } = getAllPriorityListsSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const filter = pick(req.query, ["name", "description"]);
    const options = pick(req.query, ["sortBy", "limit", "page",  "isPagination"]);

    options.pagination = options?.isPagination;

    const result = await PriorityList.paginate(filter, options);
    res.success(result);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { error, value } = createPriorityListSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const priorityList = new PriorityList(value);
    await priorityList.save();
    res.success("Priority List created successfully");
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { error, value } = updatePriorityListSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const { id } = req.params;
    const priorityList = await PriorityList.findByIdAndUpdate(id, value, {
      new: true,
    });
    res.success("Priority List updated successfully");
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PriorityList.findByIdAndDelete(id);
    res.success("Priority List deleted successfully");
  } catch (error) {
    next(error);
  }
};
