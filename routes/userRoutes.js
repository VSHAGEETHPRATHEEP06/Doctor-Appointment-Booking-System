const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  updateAppointmentController,
  deleteAppointmentController,
  requestAccessController,
  rescheduleAppointmentController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router inject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//Apply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notification  Doctor || POST
router.post(
  "/notifications",
  authMiddleware,
  getAllNotificationController
);
//Notification  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//Booking Availability
router.post(
  "/booking-availability",
  authMiddleware,
  bookingAvailabilityController
);

//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

//Update Appointment
router.put("/update-appointment/:appointmentId", authMiddleware, updateAppointmentController);

//Delete Appointment
router.delete("/delete-appointment/:appointmentId", authMiddleware, deleteAppointmentController);

//Reschedule Appointment
router.post("/reschedule-appointment", authMiddleware, rescheduleAppointmentController);

//Request Access for Blocked Users
router.post("/request-access", requestAccessController);

module.exports = router;