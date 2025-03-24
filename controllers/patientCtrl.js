// controllers/patientController.js
const Patient = require("../models/patientModel.js");
const User = require("../models/userModels.js"); // Fix the model name
const { createPatientSchema } = require("../validation/patientValidation.js");
const Appointment = require("../models/appointmentModel.js"); // Add this line

// Create patient profile
exports.createPatientProfile = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Patient profile request body:', JSON.stringify(req.body, null, 2));
    
    // Validate request body
    const { error } = createPatientSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
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

    // Process form data to ensure correct structure
    let address = req.body.address;
    // If address is not an object but individual fields are provided, create the address object
    if (!address || typeof address !== 'object') {
      address = {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip
      };
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
      address: address,
      emergencyContact: req.body.emergencyContact
    });

    await patient.save();

    // Update user's profile status
    user.isProfileComplete = true;
    await user.save();

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

// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Update patient profile request body:', JSON.stringify(req.body, null, 2));
    
    // Check if user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find the existing patient profile
    let patient = await Patient.findOne({ user: user._id });
    
    // If no profile exists, return error suggesting to create profile first
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Please create a profile first."
      });
    }

    // Process form data to ensure correct structure
    let address = req.body.address;
    // If address is not an object but individual fields are provided, create the address object
    if (!address || typeof address !== 'object') {
      address = {
        street: req.body.street || patient.address?.street || '',
        city: req.body.city || patient.address?.city || '',
        state: req.body.state || patient.address?.state || '',
        zip: req.body.zip || patient.address?.zip || ''
      };
    }

    // Handle emergency contact data
    let emergencyContact = req.body.emergencyContact;
    if (!emergencyContact || typeof emergencyContact !== 'object') {
      emergencyContact = {
        name: req.body['emergencyContact.name'] || patient.emergencyContact?.name || '',
        relationship: req.body['emergencyContact.relationship'] || patient.emergencyContact?.relationship || '',
        phone: req.body['emergencyContact.phone'] || patient.emergencyContact?.phone || ''
      };
    }

    // Update the patient profile
    const updatedFields = {
      firstName: req.body.firstName || patient.firstName,
      lastName: req.body.lastName || patient.lastName,
      phone: req.body.phone || patient.phone,
      bloodGroup: req.body.bloodGroup || patient.bloodGroup,
      medicalProblem: req.body.medicalProblem || patient.medicalProblem,
      problemDuration: req.body.problemDuration || patient.problemDuration,
      height: req.body.height || patient.height,
      weight: req.body.weight || patient.weight,
      address: address,
      emergencyContact: emergencyContact
    };
    
    // Update DOB only if provided
    if (req.body.dob) {
      updatedFields.dob = new Date(req.body.dob);
    }

    // Update the patient record
    patient = await Patient.findOneAndUpdate(
      { user: user._id },
      { $set: updatedFields },
      { new: true }
    );

    // Update user's name in the user model to match patient profile
    if (req.body.firstName || req.body.lastName) {
      const fullName = `${req.body.firstName || patient.firstName} ${req.body.lastName || patient.lastName}`;
      await User.findByIdAndUpdate(user._id, { name: fullName });
    }

    // Update user's profile status if needed
    if (!user.isProfileComplete) {
      user.isProfileComplete = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: patient
    });

  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
};

// Get appointments with a specific doctor for a patient
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    // Find all appointments for this user with the specified doctor
    const appointments = await Appointment.find({
      userId,
      doctorId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in fetching appointments",
      error
    });
  }
};