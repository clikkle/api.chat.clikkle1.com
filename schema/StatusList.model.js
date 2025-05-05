// write schema for statusList
import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const statusListSchema = new Schema(
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

statusListSchema.plugin(mongoosePaginate);

export default model("StatusList", statusListSchema);
