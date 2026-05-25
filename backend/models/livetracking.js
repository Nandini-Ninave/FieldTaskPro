const mongoose = require("mongoose");

const livetrackingschema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    attendanceMode: {
      type: String,
      enum: ["A", "B"],
      required: true,
    },
    punchIn: {
      type: Date,
      default: Date.now,
    },
    punchOut: {
      type: Date,
      default: null,
    },
    punchInLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    punchOutLocation: {
      lat: Number,
      lng: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Mode B — latest GPS position (updated on each ping)
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    // Mode B — full breadcrumb trail
    breadcrumbs: [
      {
        lat: { type: Number },
        lng: { type: Number },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Livetracking", livetrackingschema);