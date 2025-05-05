// write schema for priorityList
import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const priorityListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

priorityListSchema.plugin(mongoosePaginate);

export default model("PriorityList", priorityListSchema);
