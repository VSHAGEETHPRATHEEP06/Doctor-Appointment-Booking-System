const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  deleteDoctorController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

// Add these routes
// router.post("/getAdminInfo", authMiddleware, adminMiddleware, adminCtrl.getAdminInfo);
// router.post("/updateProfile", authMiddleware, adminMiddleware, adminCtrl.updateAdminProfile);

//POST ACCOUNT STATUS
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);

router.delete(
  "/deleteDoctor/:doctorId",
  authMiddleware,
  deleteDoctorController
);

module.exports = router;