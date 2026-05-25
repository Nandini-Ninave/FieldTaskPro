// const mongoose = require("mongoose");
// const gpsBreadcrumbSchema = new mongoose.Schema(
  // {
    // sessionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "TrackingSession",
    //   required: true,
    // },

//     latitude: {
//       type: Number,
//       required: true,
//     },

//     longitude: {
//       type: Number,
//       required: true,
//     },

//     accuracy: Number,

//     speed: Number,

//     recordedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// gpsBreadcrumbSchema.index({sessionId: 1, recordedAt: 1});
// const breadcrumb = mongoose.model( "GPSBreadcrumb", gpsBreadcrumbSchema);
// module.exports  = breadcrumb