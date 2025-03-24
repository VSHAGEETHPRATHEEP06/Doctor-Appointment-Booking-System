const express = require("express");
const {
  addRating,
  getDoctorRatings,
  updateRating,
  deleteRating,
  getUserRatings
} = require("../controllers/ratingCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Add new rating
router.post("/add-rating", authMiddleware, addRating);

// Get all ratings for a doctor
router.get("/doctor/:doctorId", getDoctorRatings);

// Get all ratings by a user
router.get("/user", authMiddleware, getUserRatings);

// Update a rating
router.put("/:ratingId", authMiddleware, updateRating);

// Delete a rating
router.delete("/:ratingId", authMiddleware, deleteRating);

module.exports = router;
