// routes/patientRoute.js
const express = require("express");
const router = express.Router();
const patientCtrl = require("../controllers/patientCtrl.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

router.post(
  "/createProfile",
  authMiddleware,
  patientCtrl.createPatientProfile
);

router.post(
  "/getPatientInfo",
  authMiddleware,
  patientCtrl.getPatientInfo
);

module.exports = router;