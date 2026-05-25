const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lat: {
      type: Number,
      required: true
    },

    lng: {
      type: Number,
      required: true
    },

    radius: {
      type: Number,
      required: true,
      min: 50,
      max: 5000
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodel",
      required: true
    }, 
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("zonemodel", zoneSchema);