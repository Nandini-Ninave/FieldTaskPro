const mongoose = require("mongoose");
 
const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pricePerMonth: { type: Number, required: true },
    maxUsers: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);