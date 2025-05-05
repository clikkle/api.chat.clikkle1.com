import mongoose from "mongoose";

export const sortBy = (value, helpers) => {
  const [field, order] = value.split(":");
  if (order !== "desc" && order !== "asc") {
    return helpers.message(
      "Invalid sort by value {#value} in query. Valid values are createdAt:desc,createdAt:asc"
    );
  }
  if (!field) {
    return helpers.message("Invalid sort field");
  }
  return value;
};

export const objectId = (value, helpers) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
