import { HttpStatusCode } from "axios";
import pick from "../../../utils/pick.js";
import { MESSAGES } from "./messages.js";
import Designation from "../../../schema/Designation.model.js";
import NodeCache from 'node-cache';
import { getUserDetailsByIds } from "../../../utils/functions.js";

const myCache = new NodeCache({ stdTTL: 0 , checkperiod: 12, useClones: false });

export const getAll = async (req, res, next) => {
  try {
    const uriDB2 = process.env.MONGODB_ACCOUNT_CONNECTION;
    const cacheKey = JSON.stringify({ query: req.query });
    const cachedResult = myCache.get(cacheKey);

    if (cachedResult) {
      return res.success({ result: cachedResult, message: MESSAGES.DESIGNATION_GET_ALL });
    }

    const filter = pick(req.query, ["name", "mailAlias"]);
    const options = pick(req.query, ["sortBy", "limit", "page", "isPagination"]);
    options.pagination = options?.isPagination;
    options.populate = [
      {
        path: "departmentId",
        select: "name adminId",
      },
    ];

    const result = await Designation.paginate(filter, options);
    
    const [addedByUsers, modifiedByUsers] = await Promise.all([
      getUserDetailsByIds(result.docs.map(doc => doc.addedBy), uriDB2),
      getUserDetailsByIds(result.docs.map(doc => doc.modifiedBy), uriDB2)
    ]);

    result.docs = result.docs.map(doc => {
      const addedBy = addedByUsers.find(user => user._id.toString() === doc.addedBy?.toString());
      const modifiedBy = modifiedByUsers.find(user => user._id.toString() === doc.modifiedBy?.toString());
      return {
        ...doc.toObject(),
        addedBy: addedBy || null,
        modifiedBy: modifiedBy || null
      };
    });

    myCache.set(cacheKey, result, 300); // Cache for 5 minutes
    res.success({result, message: MESSAGES.DESIGNATION_GET_ALL});
  } catch (err) {
    next(err);
  }
};export const create = async (req, res, next) => {
  try {
    req.body.addedBy = req?.user?.id ?? req?.user?._id;
    req.body.modifiedBy = req?.user?.id ?? req?.user?._id;
    const DesignationObj = new Designation(req.body);
    await DesignationObj.save();
    // delete myCache
    myCache.flushAll();
    return res.success(MESSAGES.DESIGNATION_CREATED);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    
    const { designationId } = req.params;
    const designationObj = await Designation.findByIdAndUpdate(designationId, req.body, {
      new: true,
    });
    if (!designationObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.DESIGNATION_NOT_FOUND });
    }
    // delete myCache
    myCache.flushAll();
    return res.success(MESSAGES.DESIGNATION_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { designationId } = req.params;
    const designationObj = await Designation.findByIdAndDelete(designationId);
    if (!designationObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.DESIGNATION_NOT_FOUND });
    }
    // delete myCache
    myCache.flushAll();
    res.success(MESSAGES.DESIGNATION_DELETED);
  } catch (error) {
    next(error);
  }
};
