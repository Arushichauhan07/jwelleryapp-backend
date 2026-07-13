const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["Admin", "User", "Manager", "Editor"]
    },

    permissions: [
      {
        type: String,
        enum: [
          "CREATE_USER",
          "READ_USER",
          "UPDATE_USER",
          "DELETE_USER",

          "CREATE_PRODUCT",
          "READ_PRODUCT",
          "UPDATE_PRODUCT",
          "DELETE_PRODUCT",

          "CREATE_ORDER",
          "READ_ORDER",
          "UPDATE_ORDER",
          "DELETE_ORDER"
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Role", roleSchema);