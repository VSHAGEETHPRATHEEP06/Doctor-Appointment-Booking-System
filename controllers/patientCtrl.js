// controllers/patientController.js
const Patient = require("../models/patientModel.js");
const User = require("../models/userModel.js");
const { createPatientSchema } = require("../validation/patientValidation.js");

// Create patient profile
exports.createPatientProfile = async (req, res) => {
  try {
    // Validate request body
    const { error } = createPatientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message.replace(/"/g, "")
      });
    }

    // Check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if profile already exists
    const existingPatient = await Patient.findOne({ user: user._id });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient profile already exists"
      });
    }

    // Create new patient
    const patient = new Patient({
      user: user._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dob: new Date(req.body.dob),
      phone: req.body.phone,
      bloodGroup: req.body.bloodGroup,
      medicalProblem: req.body.medicalProblem,
      problemDuration: req.body.problemDuration,
      height: req.body.height,
      weight: req.body.weight,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      },
      emergencyContact: {
        name: req.body.emergencyContact.name,
        phone: req.body.emergencyContact.phone,
        relation: req.body.emergencyContact.relation
      }
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      data: patient
    });

  } catch (error) {
    console.error("Error creating patient profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get patient info
exports.getPatientInfo = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.body.userId })
      .populate("user", "name email");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error("Error fetching patient info:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};