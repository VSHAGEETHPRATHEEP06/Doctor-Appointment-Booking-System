const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
    isVerified: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Prevent multiple ratings for the same appointment
ratingSchema.index({ appointmentId: 1 }, { unique: true });

const ratingModel = mongoose.model("ratings", ratingSchema);
module.exports = ratingModel;
