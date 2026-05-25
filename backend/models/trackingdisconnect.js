const mongoose = require("mongoose");

const trackingDisconnectSchema =
  new mongoose.Schema(

    {
      sessionId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "TrackingSession",

        required: true,
      },

      employeeId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      reason: {

        type: String,

        default:
          "GPS disconnected",
      },

      disconnectedAt: {

        type: Date,

        default: Date.now,
      },

      status: {

        type: String,

        enum: [
          "ACTIVE",
          "RESOLVED",
        ],

        default: "ACTIVE",
      },
    },

    {
      timestamps: true,
    }
  );

const disconnect =
  mongoose.model(
    "TrackingDisconnect",
    trackingDisconnectSchema
  );

module.exports = disconnect;