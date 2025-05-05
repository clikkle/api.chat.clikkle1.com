// write schema for designation
import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const designationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mailAlias: {
      type: String,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "department",
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    addedTime: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    modifiedTime: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

designationSchema.plugin(mongoosePaginate);

// if name is not unique then throw error check if when user perform save operation
designationSchema.pre("save", async function(next) {
  const designation = await model("Designation").findOne({ 
    name: this.name,
    _id: { $ne: this._id }
  });
  
  if (designation) {
    throw new Error("Designation name already exists. Please choose a different name.");
  }
  next();
});
export default model("Designation", designationSchema);
