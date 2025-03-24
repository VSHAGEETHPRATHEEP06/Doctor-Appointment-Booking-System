const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  deleteDoctorController,
  getAdminInfo,
  updateAdminProfile,
  toggleUserBlockStatus
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, adminMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, adminMiddleware, getAllDoctorsController);

// Admin profile routes
router.post("/getAdminInfo", authMiddleware, adminMiddleware, getAdminInfo);
router.post("/updateProfile", authMiddleware, adminMiddleware, updateAdminProfile);

//POST ACCOUNT STATUS
router.post(
  "/changeAccountStatus",
  authMiddleware,
  adminMiddleware,
  changeAccountStatusController
);

router.delete(
  "/deleteDoctor/:doctorId",
  authMiddleware,
  adminMiddleware,
  deleteDoctorController
);

// Toggle user block status
router.post(
  "/toggleUserBlockStatus",
  authMiddleware,
  adminMiddleware,
  toggleUserBlockStatus
);

module.exports = router;