const mongoose = require("mongoose");

// PRD: tamper-proof chronological log of every significant action
const auditLogSchema = new mongoose.Schema({
  orgId:      { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  actorId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorName:  { type: String },
  actorRole:  { type: String },           // role at time of action

  actionType: { type: String, required: true },
  // e.g. PUNCH_IN | PUNCH_IN_FAILED | PUNCH_OUT | MODE_CHANGED |
  //      LOCATION_OFF | LOCATION_RESTORED | CORRECTION_MADE |
  //      GEOFENCE_BREACH | CONSENT_GRANTED | CONSENT_REVOKED

  category: {
    type: String,
    enum: ['role_access',"attendance", "user_management", "geo_fence", "location", "correction", "consent", "auth", "report"],
  },

  targetUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetUserName: { type: String },

  beforeValue: { type: mongoose.Schema.Types.Mixed },
  afterValue:  { type: mongoose.Schema.Types.Mixed },

  meta: { type: mongoose.Schema.Types.Mixed },   // extra context (coords, zone, distance etc.)

  ip:        { type: String },
  userAgent: { type: String },
  outcome:   { type: String, enum: ["success", "failed"], default: "success" },
}, { timestamps: true });

// PRD: immutable — no updates or deletes allowed
auditLogSchema.pre(["updateOne", "findOneAndUpdate", "deleteOne", "findOneAndDelete"], function () {
  throw new Error("Audit log is immutable and cannot be modified.");
});

module.exports = mongoose.model("AuditLog", auditLogSchema);