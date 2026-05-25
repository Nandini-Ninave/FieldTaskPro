const mongoose = require('mongoose');
 
const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    type: {
      type: String,
      enum: [
        'location_disabled',
        'location_restored',
        'geofence_breach',
        'punch_in_missed',
        'inactivity_detected',
        'shift_reminder',
        'punch_out_reminder',
        'low_battery',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    relatedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceRecord',
      default: null,
    },
  },
  { timestamps: true }
);
 
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
 
module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
 