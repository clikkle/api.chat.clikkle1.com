import { HttpStatusCode } from "axios";
import Task from "../../../schema/Task.model.js";
import pick from "../../../utils/pick.js";
import { MESSAGES } from "./messages.js";
import { STATUS } from "./enum.js";
import moment from "moment-timezone";
import StatusList from "../../../schema/StatusList.model.js";
import PriorityList from "../../../schema/PriorityList.model.js";
import mongoose from "mongoose";
import { getUserDetailsByIds } from "../../../utils/functions.js";



export const getAll = async (req, res, next) => {
  try {
    const filter = pick(req.query, ["name", "startDate", "endDate", "dueDate", "priorityId", "statusId", "status"]);
    const options = pick(req.query, ["sortBy", "limit", "page", "isPagination"]);
    
    let matchStage = {};
    
    // Handle status filters
    if (filter.status === STATUS.OPEN) {
      matchStage['statusId.name'] = "Open";
    } else if (filter.status === STATUS.HIGH_PRIORITY) {
      matchStage['priorityId.name'] = "High";
    } else if (filter.status === STATUS.COMPLETED) {
      matchStage['statusId.name'] = "Completed";
    } else if (filter.status === STATUS.OVERDUE) {
      matchStage.dueDate = { $lt: new Date() };
    }

    const aggregationPipeline = [
      {
        $lookup: {
          from: 'prioritylists',
          localField: 'priorityId',
          foreignField: '_id',
          as: 'priorityId'
        }
      },
      { $unwind: '$priorityId' },
      {
        $lookup: {
          from: 'statuslists',
          localField: 'statusId',
          foreignField: '_id',
          as: 'statusId'
        }
      },
      { $unwind: '$statusId' },
    ];

    if (Object.keys(matchStage).length > 0) {
      aggregationPipeline.push({ $match: matchStage });
    }
    const aggregateQuery = Task.aggregate(aggregationPipeline);

    const paginationOptions = {
      page: options.page || 1,
      limit: options.limit || 10,
      pagination: options?.isPagination ?? true,
      sort: options.sortBy ? JSON.parse(options.sortBy) : { createdAt: -1 }
    };
    const result = await Task.aggregatePaginate(aggregateQuery, paginationOptions);
    
    const employees = await getUserDetailsByIds(result.docs.map(doc => doc.assignedToId));
    const owners = await getUserDetailsByIds(result.docs.map(doc => doc.ownerId));
    
    result.docs.forEach(doc => {
      const employee = employees.find(employee => employee._id.toString() === doc.assignedToId.toString());
      const owner = owners.find(owner => owner._id.toString() === doc.ownerId.toString());
      doc.assignedToId = employee ? employee : null;
      doc.ownerId = owner ? owner : null;
    });
    res.success({result, message: MESSAGES.TASK_GET_ALL});
  } catch (err) {
    next(err);
  }
};
export const create = async (req, res, next) => {
  try {
    req.body.assignedToId = req?.user?.id ?? req?.user?._id;
    
    const dates = ['startDate', 'endDate', 'dueDate'];
    dates.forEach(date => {
      req.body[date] = moment(req.body[date], 'DD/MM/YYYY')
        .add(1, 'day')
        .utc()
        [date === 'startDate' ? 'startOf' : 'endOf']('day')
        .toISOString();
    });

    const TaskObj = new Task(req.body);
    await TaskObj.save();
    return res.success(MESSAGES.TASK_CREATED);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    
    const { taskId } = req.params;
    const taskObj = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });
    if (!taskObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.TASK_NOT_FOUND });
    }
    return res.success(MESSAGES.TASK_UPDATED);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const taskObj = await Task.findByIdAndDelete(taskId);
    if (!taskObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.TASK_NOT_FOUND });
    }
    res.success(MESSAGES.TASK_DELETED);
  } catch (error) {
    next(error);
  }
};


export const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId, statusId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.TASK_NOT_FOUND });
    }
    const statusObj = await StatusList.findById(statusId);
    if (!statusObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.STATUS_NOT_FOUND });
    }

    task.statusId = statusObj._id;
    await task.save();
    res.success({message: MESSAGES.TASK_STATUS_UPDATED});
  }catch (error) {
    next(error);
  }
}

// updateTaskPriority
export const updateTaskPriority = async (req, res, next) => {
  try {
    const { taskId, priorityId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.TASK_NOT_FOUND });
    }
    const priorityObj = await PriorityList.findById(priorityId);
    if (!priorityObj) {
      return res.status(HttpStatusCode.NotFound).json({ error: MESSAGES.PRIORITY_NOT_FOUND });
    }
    task.priorityId = priorityObj._id;
    await task.save();
    res.success({message: MESSAGES.TASK_PRIORITY_UPDATED});
  } catch (error) {
    next(error);
  }
};
