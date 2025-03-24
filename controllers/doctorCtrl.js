const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};

//get single doctor
const getDoctorByIdController = async (req, res) => {
  try {
    // No logging to reduce server load
    
    // Check for required doctorId
    if (!req.body.doctorId) {
      return res.status(400).send({
        success: false,
        message: "Doctor ID is required",
      });
    }
    
    // Validate that doctorId is a valid MongoDB ObjectId
    if (!req.body.doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid doctor ID format",
      });
    }
    
    // Check if client has a valid cached version using ETag
    const doctorId = req.body.doctorId;
    const clientETag = req.headers['if-none-match'];
    const expectedETag = `"${doctorId}"`;
    
    // If client has valid cached version, return 304 Not Modified
    if (clientETag && clientETag === expectedETag) {
      return res.status(304).send();
    }
    
    // Fetch doctor data from database
    const doctor = await doctorModel.findOne({ _id: doctorId });
    
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
    
    // Set strong cache control headers
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.set('ETag', expectedETag); // Add ETag for validation
    
    // Return doctor data
    res.status(200).send({
      success: true,
      message: "Doctor information fetched successfully",
      data: doctor,
    });
  } catch (error) {
    // Minimal error logging
    console.log('Error in getDoctorByIdController:', error.message);
    
    res.status(500).send({
      success: false,
      message: "Error fetching doctor information",
      error: error.message
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
    
    // Find all appointments for this doctor
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    
    // Enrich appointment data with complete patient information
    const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
      const appointmentObj = appointment.toObject();
      
      // If userInfo already has complete information including phone, use it
      if (appointmentObj.userInfo && appointmentObj.userInfo.phone) {
        return appointmentObj;
      }
      
      try {
        // Try to get user information from user model
        const user = await userModel.findById(appointment.userId);
        
        // Try to get patient profile for more complete information
        const Patient = require("../models/patientModel");
        const patientProfile = await Patient.findOne({ user: appointment.userId });
        
        // Create enhanced userInfo object with all available information
        appointmentObj.userInfo = {
          _id: user?._id || appointment.userId,
          name: user?.name || appointmentObj.userInfo?.name || 'N/A',
          email: user?.email || appointmentObj.userInfo?.email || 'N/A',
          phone: patientProfile?.phone || user?.phone || appointmentObj.userInfo?.phone || 'N/A',
          bloodGroup: patientProfile?.bloodGroup || appointmentObj.userInfo?.bloodGroup || '',
          medicalProblem: patientProfile?.medicalProblem || appointmentObj.userInfo?.medicalProblem || ''
        };
        
        return appointmentObj;
      } catch (error) {
        console.log("Error enriching appointment data:", error);
        // Return original appointment if error occurs
        return appointmentObj;
      }
    }));
    
    res.status(200).send({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: enrichedAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    
    // Get the appointment before updating
    const appointment = await appointmentModel.findById(appointmentsId);
    const previousStatus = appointment.status;
    
    // Update the appointment status
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status },
      { new: true } // Return the updated document
    );
    
    // Get the user to send notification
    const user = await userModel.findOne({ _id: appointment.userId });
    const notification = user.notification;
    
    // Create appropriate message based on previous status and new status
    let notificationMessage = "";
    
    if (previousStatus === "rescheduled" && status === "approved") {
      notificationMessage = `Your rescheduled appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been approved`;
    } else if (previousStatus === "rescheduled" && status === "reject") {
      notificationMessage = `Your rescheduled appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been rejected. Please book a new appointment.`;
    } else {
      notificationMessage = `Your appointment status has been updated to ${status}`;
    }
    
    notification.push({
      type: "status-updated",
      message: notificationMessage,
      onClickPath: "/appointments",
    });
    
    await user.save();
    
    res.status(200).send({
      success: true,
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating appointment status",
    });
  }
};

// Update appointment by doctor
const updateAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
    // Find the appointment
    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Get doctor info to verify this is their appointment
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }
    
    // Store old date/time for notification and history
    const previousDate = appointment.date;
    const previousTime = appointment.time;
    const previousStatus = appointment.status;
    
    // Create modification history entry
    const modificationEntry = {
      modifiedBy: 'doctor',
      previousDate,
      previousTime,
      previousStatus,
      newDate: date,
      newTime: time,
      newStatus: "updated-by-doctor",
    };
    
    // Update the appointment
    appointment.date = date;
    appointment.time = time;
    appointment.status = "updated-by-doctor";
    
    // Update modification tracking fields
    appointment.modifiedBy = 'doctor';
    appointment.lastModified = new Date();
    appointment.modificationHistory.push(modificationEntry);
    
    await appointment.save();
    
    // Send notification to the user
    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification.push({
        type: "appointment-updated",
        message: `Your appointment on ${previousDate} at ${previousTime} has been rescheduled by Dr. ${doctor.firstName} ${doctor.lastName} to ${new Date(date).toLocaleDateString()} at ${time}`,
        onClickPath: "/appointments",
      });
      await user.save();
    }
    
    res.status(200).send({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating appointment",
    });
  }
};

// Delete appointment by doctor
const deleteAppointmentController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the appointment
    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Get doctor info to verify this is their appointment
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Not authorized to delete this appointment",
      });
    }
    
    // Store appointment info for notification
    const appointmentDate = appointment.date;
    const appointmentTime = appointment.time;
    
    // Send notification to the user before deleting
    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification.push({
        type: "appointment-cancelled",
        message: `Your appointment on ${appointmentDate} at ${appointmentTime} with Dr. ${doctor.firstName} ${doctor.lastName} has been cancelled by the doctor.`,
        onClickPath: "/appointments",
        data: {
          appointmentId: appointment._id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          date: appointmentDate,
          time: appointmentTime,
          status: "cancelled-by-doctor"
        }
      });
      await user.save();
    }
    
    // Delete the appointment
    await appointmentModel.findByIdAndDelete(id);
    
    res.status(200).send({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in cancelling appointment",
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  updateAppointmentController,
  deleteAppointmentController,
};