const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    attendanceMode: {
      type: String,
      enum: ["A", "B"], 
      default: "A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);