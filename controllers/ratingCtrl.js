const ratingModel = require("../models/ratingModel");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const mongoose = require("mongoose");

// Add a new rating
const addRating = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, review } = req.body;
    const userId = req.body.userId;

    // Check if appointment exists and belongs to this user
    const appointment = await appointmentModel.findOne({
      _id: appointmentId,
      userId: userId,
      status: "completed" // Only completed appointments can be rated
    });

    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found or not eligible for rating",
      });
    }

    // Check if appointment has already been rated
    const existingRating = await ratingModel.findOne({ appointmentId });
    if (existingRating) {
      return res.status(400).send({
        success: false,
        message: "You have already rated this appointment",
      });
    }

    // Create the new rating
    const newRating = new ratingModel({
      doctorId,
      userId,
      appointmentId,
      rating,
      review: review || "",
    });

    // Save the rating
    await newRating.save();

    // Update doctor's average rating
    const allDoctorRatings = await ratingModel.find({ doctorId });
    const totalRatings = allDoctorRatings.length;
    const ratingSum = allDoctorRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRatings > 0 ? (ratingSum / totalRatings) : 0;

    // Update doctor model with new rating average
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { 
        averageRating: Number(averageRating.toFixed(1)), 
        totalRatings 
      }
    );

    res.status(201).send({
      success: true,
      message: "Rating added successfully",
      data: newRating,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in adding rating",
      error,
    });
  }
};

// Get doctor ratings
const getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Get all ratings for this doctor
    const ratings = await ratingModel.find({ doctorId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    
    // Get doctor's average rating
    const doctor = await doctorModel.findById(doctorId);
    
    res.status(200).send({
      success: true,
      message: "Doctor ratings fetched successfully",
      data: {
        ratings,
        averageRating: doctor.averageRating,
        totalRatings: doctor.totalRatings
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching doctor ratings",
      error,
    });
  }
};

// Update a rating
const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.body.userId;

    // Find the rating and ensure it belongs to this user
    const existingRating = await ratingModel.findOne({
      _id: ratingId,
      userId: userId
    });

    if (!existingRating) {
      return res.status(404).send({
        success: false,
        message: "Rating not found or you're not authorized to update it",
      });
    }

    // Update the rating
    existingRating.rating = rating;
    existingRating.review = review || existingRating.review;
    await existingRating.save();

    // Update doctor's average rating
    const doctorId = existingRating.doctorId;
    const allDoctorRatings = await ratingModel.find({ doctorId });
    const totalRatings = allDoctorRatings.length;
    const ratingSum = allDoctorRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRatings > 0 ? (ratingSum / totalRatings) : 0;

    // Update doctor model with new rating average
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { 
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings 
      }
    );

    res.status(200).send({
      success: true,
      message: "Rating updated successfully",
      data: existingRating,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating rating",
      error,
    });
  }
};

// Delete a rating
const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.body.userId;

    // Find the rating and ensure it belongs to this user
    const existingRating = await ratingModel.findOne({
      _id: ratingId,
      userId: userId
    });

    if (!existingRating) {
      return res.status(404).send({
        success: false,
        message: "Rating not found or you're not authorized to delete it",
      });
    }

    const doctorId = existingRating.doctorId;

    // Delete the rating
    await ratingModel.findByIdAndDelete(ratingId);

    // Update doctor's average rating
    const allDoctorRatings = await ratingModel.find({ doctorId });
    const totalRatings = allDoctorRatings.length;
    const ratingSum = allDoctorRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRatings > 0 ? (ratingSum / totalRatings) : 0;

    // Update doctor model with new rating average
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { 
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings 
      }
    );

    res.status(200).send({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting rating",
      error,
    });
  }
};

// Get ratings for a specific user
const getUserRatings = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    // Get all ratings by this user
    const ratings = await ratingModel.find({ userId })
      .populate("doctorId", "firstName lastName")
      .populate("appointmentId", "date")
      .sort({ createdAt: -1 });
    
    res.status(200).send({
      success: true,
      message: "User ratings fetched successfully",
      data: ratings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching user ratings",
      error,
    });
  }
};

module.exports = { addRating, getDoctorRatings, updateRating, deleteRating, getUserRatings };
