import StatusList from "../../../schema/StatusList.model.js";
import pick from "../../../utils/pick.js";
import {
  createStatusListSchema,
  updateStatusListSchema,
  getAllStatusListsSchema,
} from "./validation.js";

export const getAll = async (req, res, next) => {
  try {
    const { error, value } = getAllStatusListsSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const filter = pick(req.query, ["name", "description"]);
    const options = pick(req.query, ["sortBy", "limit", "page",  "isPagination"]);

    options.pagination = options?.isPagination;

    const result = await StatusList.paginate(filter, options);
    res.success(result);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { error, value } = createStatusListSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const StatusListObj = new StatusList(value);
    await StatusListObj.save();
    res.success("Status List created successfully");
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { error, value } = updateStatusListSchema.validate(req.body);
    if (error) {
      return res.error(error.details[0].message);
    }
    const { id } = req.params;
    const StatusList = await StatusList.findByIdAndUpdate(id, value, {
      new: true,
    });
    res.success("Status List updated successfully");
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await StatusList.findByIdAndDelete(id);
    res.success("Status List deleted successfully");
  } catch (error) {
    next(error);
  }
};
