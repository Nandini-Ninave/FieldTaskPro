const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "editor", "member"],
      default: "member",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    attendanceMode: {
      type: String,
      enum: ["A", "B"],
      default: "A",
    },

    gpsEnabled: {
      type: Boolean,
      default: true,
    },

    locationConsent: {
      type: Boolean,
      default: false,
    },
    assignedZones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'zonemodel',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    shiftStart: {
      type: String, // e.g. "09:00"
      default: '09:00',
    },
    shiftEnd: {
      type: String, // e.g. "18:00"
      default: '18:00',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
const usermodel = mongoose.model("User", userSchema);
module.exports = usermodel