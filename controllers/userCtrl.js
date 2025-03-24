const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

//register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    } 
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid EMail or Password", success: false });
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(200).send({ 
        message: "Your account has been blocked by an administrator. Please use the 'Request Access' feature to contact the admin for assistance.", 
        success: false,
        isBlocked: true
      });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.userId });
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }
    user.password = undefined;
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Authentication error",
      success: false,
      error,
    });
  }
};

// Apply Doctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onClickPath: "/admin/doctors",
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Doctor account application submitted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while applying for doctor account",
    });
  }
};

// Fixed getAllNotificationController
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId); // Use authenticated user ID from middleware
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    // Move notifications to seen_notification
    user.seen_notification.push(...user.notification);
    user.notification = [];
    
    const updatedUser = await user.save();
    
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: {
        notifications: updatedUser.seen_notification,
        unreadCount: updatedUser.notification.length
      }
    });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).send({
      success: false,
      message: "Error processing notifications",
      error: error.message // Only send error message in development
    });
  }
};

// Fixed deleteAllNotificationController
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    user.seen_notification = [];
    const updatedUser = await user.save();
    
    res.status(200).send({
      success: true,
      message: "Notifications cleared successfully",
      data: {
        notifications: updatedUser.seen_notification
      }
    });
  } catch (error) {
    console.error("Delete Notifications Error:", error);
    res.status(500).send({
      success: false,
      message: "Error clearing notifications",
      error: error.message
    });
  }
};

//GET ALL DOC
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctors Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Fetching Doctor",
    });
  }
};

// BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    console.log("New appointment request:", req.body);
    const { doctorId, doctorInfo, userInfo, date, time } = req.body;
    const userId = req.userId || req.body.userId;
    
    if (!userId || !doctorId || !date || !time) {
      return res.status(400).send({
        success: false,
        message: "All fields are required: userId, doctorId, date, time"
      });
    }
    
    // Check if doctor exists
    let doctor;
    try {
      doctor = await doctorModel.findById(doctorId);
      console.log("Doctor found:", doctor ? "Yes" : "No");
      
      if (!doctor) {
        return res.status(404).send({
          success: false,
          message: "Doctor not found"
        });
      }
    } catch (error) {
      console.error("Error finding doctor:", error);
      return res.status(500).send({
        success: false,
        message: "Error finding doctor",
        error: error.message
      });
    }
    
    // Fetch user data and patient profile to get complete information
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    
    // Get patient profile information if available
    let patientInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: ""  // Default empty phone
    };
    
    try {
      // Import patient model
      const Patient = require("../models/patientModel.js");
      
      // Look up patient profile
      const patientProfile = await Patient.findOne({ user: user._id });
      
      if (patientProfile) {
        // Update patient info with complete profile data
        patientInfo = {
          _id: user._id,
          name: `${patientProfile.firstName} ${patientProfile.lastName}`,
          email: user.email,
          phone: patientProfile.phone || "",
          bloodGroup: patientProfile.bloodGroup || "",
          medicalProblem: patientProfile.medicalProblem || ""
        };
        
        // Update user's name in case it has changed in the patient profile
        if (user.name !== patientInfo.name) {
          await userModel.findByIdAndUpdate(user._id, { name: patientInfo.name });
        }
      }
    } catch (error) {
      console.log("Error fetching patient profile (not critical):", error);
      // We continue the booking process even if we can't get the patient profile
    }
    
    // Check for existing appointment with same doctor, date, and time
    const formattedDate = date;
    console.log("Checking for existing appointment with:", {
      doctorId,
      userId,
      date: formattedDate,
      time
    });
    
    const existingAppointment = await appointmentModel.findOne({
      doctorId,
      date: formattedDate,
      time
    });

    if (existingAppointment) {
      return res.status(409).send({
        success: false,
        message: "This time slot is already booked. Please select another time slot.",
      });
    }

    // Create new appointment
    let newAppointment;
    try {
      // Ensure IDs are valid ObjectIds
      const mongoose = require('mongoose');
      const ObjectId = mongoose.Types.ObjectId;
      
      // Convert IDs to proper ObjectId format if they're valid
      const validDoctorId = ObjectId.isValid(doctorId) ? new ObjectId(doctorId) : doctorId;
      const validUserId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
      
      console.log("Creating appointment with:", {
        doctorId: validDoctorId,
        userId: validUserId,
        date: formattedDate,
        time
      });
      
      newAppointment = new appointmentModel({
        date: formattedDate,
        time,
        doctorId: validDoctorId,
        userId: validUserId,
        doctorInfo,
        userInfo: patientInfo, // Use the enhanced patient info
        status: "pending"
      });
      
      await newAppointment.save();
      console.log("Appointment saved successfully with ID:", newAppointment._id);
    } catch (error) {
      console.error("Error saving appointment:", error);
      return res.status(500).send({
        success: false,
        message: "Error saving appointment",
        error: error.message
      });
    }
    
    // Get the doctor's user ID to send notification
    try {
      if (!doctor || !doctor.userId) {
        console.log("Doctor or doctor.userId is undefined when trying to send notification");
      } else {
        const doctorUser = await userModel.findOne({ _id: doctor.userId });
        console.log("Doctor user found for notification?", doctorUser ? "Yes" : "No");
        
        if (doctorUser) {
          // Add notification to doctor's user model instead of using separate notification model
          const notification = {
            type: "New Appointment Request",
            message: `A new appointment request from ${patientInfo.name} for ${date} at ${time}`,
            data: {
              appointmentId: newAppointment._id,
              name: patientInfo.name,
              onClickPath: "/doctor-appointments"
            }
          };
          
          // Make sure notification array exists
          if (!doctorUser.notification) {
            doctorUser.notification = [];
          }
          
          // Update doctor's notification array
          doctorUser.notification.push(notification);
          await doctorUser.save();
          console.log("Notification sent to doctor successfully");
        }
      }
    } catch (error) {
      console.error("Error sending notification to doctor:", error);
      // Don't return here as we still want to tell the user the appointment was created
    }
    
    console.log("Appointment created successfully");
    return res.status(201).send({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment
    });
  } catch (error) {
    console.error("Error in bookAppointmentController:", error);
    return res.status(500).send({
      success: false,
      message: "Error booking appointment: " + error.message,
      error: error.message
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    console.log("Received availability check request:", req.body);
    const { date, time, doctorId } = req.body;
    
    // Input validation
    if (!date || !doctorId) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: date, or doctorId",
      });
    }

    // Keep date in DD-MM-YYYY format for consistent comparison with the appointment booking
    const formattedDate = date;
    console.log("Date for availability check:", formattedDate);

    // Find the doctor to get their timings
    let doctor;
    try {
      // Ensure doctorId is a valid ObjectId
      const mongoose = require('mongoose');
      const ObjectId = mongoose.Types.ObjectId;
      const validDoctorId = ObjectId.isValid(doctorId) ? new ObjectId(doctorId) : null;
      
      if (!validDoctorId) {
        console.log("Invalid doctor ID format (availability check):", doctorId);
        return res.status(400).send({
          success: false,
          message: "Invalid doctor ID format",
        });
      }
      
      doctor = await doctorModel.findById(validDoctorId);
      console.log("Doctor found for availability check?", doctor ? "Yes" : "No");
      
      if (!doctor) {
        return res.status(404).send({
          success: false,
          message: "Doctor not found",
        });
      }
    } catch (error) {
      console.error("Error finding doctor (availability check):", error);
      return res.status(500).send({
        success: false,
        message: "Error finding doctor",
        error: error.message
      });
    }

    // Check if the doctor is available at the requested time
    if (doctor.timings) {
      // Handle both array and object formats of timings
      let startTime, endTime;
      
      if (Array.isArray(doctor.timings) && doctor.timings.length === 2) {
        startTime = doctor.timings[0];
        endTime = doctor.timings[1];
      } else if (typeof doctor.timings === 'object') {
        startTime = doctor.timings.start || doctor.timings[0];
        endTime = doctor.timings.end || doctor.timings[1];
      }
      
      if (startTime && endTime) {
        const doctorStart = moment(startTime, "HH:mm");
        const doctorEnd = moment(endTime, "HH:mm");
        const requestedTime = time ? moment(time, "HH:mm") : null;
        
        console.log("Doctor hours (availability check):", { startTime, endTime });
        console.log("Requested time (availability check):", time);
        
        if (requestedTime && (requestedTime.isBefore(doctorStart) || requestedTime.isAfter(doctorEnd))) {
          return res.status(400).send({
            success: false,
            message: `Doctor is only available between ${startTime} and ${endTime}`,
          });
        }
      }
    }

    // Check if the doctor already has an appointment at this time
    let validDoctorId;
    try {
      const mongoose = require('mongoose');
      const ObjectId = mongoose.Types.ObjectId;
      validDoctorId = ObjectId.isValid(doctorId) ? new ObjectId(doctorId) : doctorId;
    } catch (error) {
      console.error("Error converting doctorId to ObjectId:", error);
      validDoctorId = doctorId; // Fallback to original value
    }
    
    const appointments = await appointmentModel.find({
      doctorId: validDoctorId,
      date: formattedDate,
      time: time || { $exists: false },
      status: { $ne: "rejected" }
    });
    
    console.log("Checking availability with criteria:", {
      doctorId: validDoctorId,
      date: formattedDate,
      time: time || { $exists: false }
    });

    console.log("Found existing appointments:", appointments);

    if (appointments.length > 0) {
      return res.status(409).send({
        success: false,
        message: "This time slot is already booked",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Appointment slot is available",
    });
  } catch (error) {
    console.error("Error in bookingAvailabilityController:", error);
    return res.status(500).send({
      success: false,
      message: "Error checking appointment availability",
      error: error.message,
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    // Find all appointments for the user
    const appointments = await appointmentModel.find({
      userId: req.userId,
    });
    
    // Enrich the appointment data with complete doctor information
    const enrichedAppointments = await Promise.all(appointments.map(async (appointment) => {
      // Make sure doctorInfo is properly populated
      if (!appointment.doctorInfo || !appointment.doctorInfo.firstName) {
        // If doctorInfo is missing or incomplete, try to fetch the doctor data
        const doctor = await doctorModel.findOne({ _id: appointment.doctorId });
        if (doctor) {
          appointment.doctorInfo = {
            firstName: doctor.firstName || '',
            lastName: doctor.lastName || '',
            phone: doctor.phone || '',
            email: doctor.email || '',
            specialization: doctor.specialization || '',
            address: doctor.address || '',
            fee: doctor.fee || ''
          };
        }
      }
      return appointment;
    }));
    
    res.status(200).send({
      success: true,
      message: "User appointments fetched successfully",
      data: enrichedAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching user appointments",
    });
  }
};

// Update appointment controller
// Update an existing appointment with new date/time
const updateAppointmentController = async (req, res) => {
  try {
    const { date, time } = req.body;
    const { appointmentId } = req.params;
    
    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId);
    
    // Check if appointment exists
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Check if the appointment belongs to the logged-in user
    // Log user IDs for debugging
    console.log('Appointment userId:', appointment.userId, typeof appointment.userId);
    console.log('Request userId:', req.userId, typeof req.userId);
    
    // Check if either is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    const appointmentUserId = appointment.userId.toString();
    const requestUserId = req.userId.toString();
    
    console.log('Comparing userIds:', appointmentUserId, requestUserId);
    
    if (appointmentUserId !== requestUserId) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized: This appointment doesn't belong to you",
      });
    }
    
    // Check if the appointment is rejected (can't modify rejected appointments)
    if (appointment.status.toLowerCase() === 'rejected') {
      return res.status(400).send({
        success: false,
        message: "Rejected appointments cannot be modified",
      });
    }
    
    // Format date and time - keep the original format
    const formattedDate = date; // Keep as DD-MM-YYYY
    const formattedTime = time; // Keep as HH:mm
    
    // Update the appointment
    appointment.date = formattedDate;
    appointment.time = formattedTime;
    
    // Store the previous status
    const previousStatus = appointment.status;
    
    // If the appointment was already approved, set to 'rescheduled' status
    // otherwise reset to pending
    if (previousStatus.toLowerCase() === 'approved') {
      appointment.status = "rescheduled";
    } else {
      appointment.status = "pending";
    }
    
    await appointment.save();
    
    // Notify the doctor about the appointment change
    const doctor = await userModel.findOne({ _id: appointment.doctorInfo.userId });
    if (doctor) {
      const displayDate = moment(date, "DD-MM-YYYY").format("DD MMM YYYY");
      const displayTime = moment(time, "HH:mm").format("hh:mm A");
      
      let notificationMessage = "";
      if (previousStatus.toLowerCase() === 'approved') {
        notificationMessage = `Appointment with ${appointment.userInfo.name} has been rescheduled to ${displayDate} at ${displayTime} and requires your approval`;
      } else {
        notificationMessage = `Appointment with ${appointment.userInfo.name} has been updated to ${displayDate} at ${displayTime}`;
      }
      
      doctor.notification.push({
        type: "appointment-updated",
        message: notificationMessage,
        onClickPath: "/doctor/appointments",
      });
      await doctor.save();
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

// Delete appointment controller
const deleteAppointmentController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId);
    
    // Check if appointment exists
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Check if the appointment belongs to the logged-in user
    // Log user IDs for debugging
    console.log('Appointment userId:', appointment.userId, typeof appointment.userId);
    console.log('Request userId:', req.userId, typeof req.userId);
    
    // Check if either is a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    const appointmentUserId = appointment.userId.toString();
    const requestUserId = req.userId.toString();
    
    console.log('Comparing userIds:', appointmentUserId, requestUserId);
    
    if (appointmentUserId !== requestUserId) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized: This appointment doesn't belong to you",
      });
    }
    
    // Check if the appointment is rejected (can't cancel rejected appointments)
    if (appointment.status.toLowerCase() === 'rejected') {
      return res.status(400).send({
        success: false,
        message: "Rejected appointments cannot be cancelled",
      });
    }
    
    // Store appointment info before deletion for notification
    const appointmentInfo = {
      doctorId: appointment.doctorId,
      doctorUserId: appointment.doctorInfo.userId,
      patientName: appointment.userInfo.name,
      date: appointment.date,
      time: appointment.time
    };
    
    // Delete the appointment
    await appointmentModel.findByIdAndDelete(appointmentId);
    
    // Notify the doctor about the appointment cancellation
    const doctor = await userModel.findOne({ _id: appointmentInfo.doctorUserId });
    if (doctor) {
      const formattedDate = moment(appointmentInfo.date, "DD-MM-YYYY").format("DD MMM YYYY");
      const formattedTime = moment(appointmentInfo.time, "HH:mm").format("hh:mm A");
      
      doctor.notification.push({
        type: "appointment-cancelled",
        message: `Appointment with ${appointmentInfo.patientName} on ${formattedDate} at ${formattedTime} has been cancelled`,
        onClickPath: "/doctor/appointments",
      });
      await doctor.save();
    }
    
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



// Request access for blocked users
const requestAccessController = async (req, res) => {
  try {
    const { email, message } = req.body;
    
    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    
    // Find all admin users
    const admins = await userModel.find({ isAdmin: true });
    if (!admins || admins.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No administrators found in the system"
      });
    }
    
    // Create access request notification for all admins
    for (const admin of admins) {
      admin.notification.push({
        type: "access-request",
        message: `User ${user.name} (${user.email}) has requested access to their blocked account. Reason: ${message}`,
        data: {
          userId: user._id,
          userName: user.name,
          userEmail: user.email
        },
        onClickPath: "/admin/users"
      });
      await admin.save();
    }
    
    return res.status(200).send({
      success: true,
      message: "Access request sent to administrators. They will review your request and take appropriate action."
    });
    
  } catch (error) {
    console.error("Request access error:", error);
    return res.status(500).send({
      success: false,
      message: "Error processing access request",
      error: error.message
    });
  }
};

// reschedule appointment controller
const rescheduleAppointmentController = async (req, res) => {
  try {
    const { appointmentId, date, time, doctorId, doctorInfo, userInfo, sendNotification } = req.body;
    
    if (!appointmentId || !date || !time || !doctorId) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields for rescheduling"
      });
    }
    
    // Find and update the appointment
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        status: "rescheduled",
        rescheduleDate: date,
        rescheduleTime: time
      },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found"
      });
    }
    
    // If sendNotification is true, send notification to doctor
    if (sendNotification) {
      // Find the doctor user
      const doctor = await doctorModel.findOne({ _id: doctorId });
      
      if (doctor && doctor.userId) {
        const doctorUser = await userModel.findOne({ _id: doctor.userId });
        
        if (doctorUser) {
          // Create notification for doctor
          const notification = {
            type: "Appointment Rescheduled",
            message: `Patient ${userInfo.name} has requested to reschedule their appointment to ${date} at ${time}`,
            data: {
              appointmentId: appointment._id,
              name: userInfo.name,
              onClickPath: "/doctor-appointments"
            },
            createdAt: new Date()
          };
          
          // Add to doctor's notifications
          doctorUser.notification.push(notification);
          await doctorUser.save();
          
          console.log("Notification sent to doctor for rescheduled appointment");
        }
      }
    }
    
    return res.status(200).send({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment
    });
    
  } catch (error) {
    console.error("Error in rescheduleAppointmentController:", error);
    return res.status(500).send({
      success: false,
      message: "Error rescheduling appointment",
      error: error.message
    });
  }
};

module.exports = { 
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
  rescheduleAppointmentController
};
