// write schema for statusList
import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const statusListSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      // required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    reminderDateTime: {
      type: Date,
      required: true,
    },
    priorityId: {
      type: Schema.Types.ObjectId,
      ref: "PriorityList",
      required: true,
    },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: "StatusList",
      required: true,
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
    version: false
  }
);

statusListSchema.plugin(mongoosePaginate);
statusListSchema.plugin(mongooseAggregatePaginate);

export default model("Task", statusListSchema);
