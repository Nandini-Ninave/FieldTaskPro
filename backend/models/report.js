const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reportType: {
      type: String,
      enum: [
        "attendance_summary",
        "absence_report",
        "late_arrivals",
        "location_activity",
        "geofence_compliance",
      ],
    },

    startDate: Date,
    endDate: Date,

    filters: {
      type: Object,
      default: {},
    },

    totalRecords: Number,

    exportFormat: {
      type: String,
      enum: ["csv", "pdf", "json"],
      default: "json",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Report",
  reportSchema
);