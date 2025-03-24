const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'doctors',
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    time: {
      type: String,
      required: true,
    },
    modifiedBy: {
      type: String,
      enum: ['user', 'doctor', null],
      default: null,
    },
    modificationHistory: [{
      modifiedDate: {
        type: Date,
        default: Date.now,
      },
      modifiedBy: {
        type: String,
        enum: ['user', 'doctor'],
        required: true,
      },
      previousDate: String,
      previousTime: String,
      previousStatus: String,
      newDate: String,
      newTime: String,
      newStatus: String,
    }],
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;