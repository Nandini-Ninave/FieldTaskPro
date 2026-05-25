const mongoose = require("mongoose");

const breadcrumbSchema = new mongoose.Schema({
  lat:        { type: Number, required: true },
  lng:        { type: Number, required: true },
  accuracy:   { type: Number },
  speed:      { type: Number },
  battery:    { type: Number },
  recordedAt: { type: Date, default: Date.now },
//   currentLocation: {
//   lat: Number,
//   lng: Number,
//   updatedAt: Date,
// },
}, { _id: false });  // _id: false keeps it lightweight

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    mode: {
      type: String,
      enum: ["A", "B"],
      default: "A"
    },

    punchInTime: Date,
    punchOutTime: Date,

    punchInCoords: {
      lat: Number,
      lng: Number
    },

    punchOutCoords: {
      lat: Number,
      lng: Number
    },
    zoneName:   { type: mongoose.Schema.Types.ObjectId, ref: "zonemodel" },
currentLocation: {

      lat: Number,

      lng: Number,

      updatedAt: Date,
    },    breadcrumb:   [breadcrumbSchema], 
    totalDistance: { type: Number, default: 0 },  // meters
    duration:      { type: Number, default: 0 },  // minutes
    failedAttempt:     { type: Boolean, default: false },
    failedReason:      { type: String },           // "outside_zone" | "gps_unavailable" | "gps_disabled"
    distanceFromZone:  { type: Number },           // meters — shown in app message

    status: {
    type: String,
    enum: ["punched_in", "punched_out", "absent", "present"],
    default: "punched_in",
  },
  locationOffAt:       { type: Date },
  locationRestoredAt:  { type: Date },


  corrections: [{
    correctedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    correctedAt:  { type: Date, default: Date.now },
    field:        { type: String },
    beforeValue:  { type: mongoose.Schema.Types.Mixed },
    afterValue:   { type: mongoose.Schema.Types.Mixed },
    note:         { type: String },
  }],

  date: { type: String },   // "YYYY-MM-DD" — for easy daily queries
  },
  
  { timestamps: true }
);
const attendancemodel = mongoose.model("Attendance", attendanceSchema);
module.exports = attendancemodel