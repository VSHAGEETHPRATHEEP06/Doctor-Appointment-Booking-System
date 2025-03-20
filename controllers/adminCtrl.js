const mongoose = require("mongoose");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

// doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });
    const notification = user.notification;
    notification.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account Request Has ${status} `,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

const deleteDoctorController = async (req, res) => {
  try {
    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    // Find the doctor first to get the userId
    const doctor = await doctorModel.findById(req.params.doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    
    // Store the userId before deleting the doctor
    const userId = doctor.userId;
    
    // Delete the doctor record
    await doctorModel.findByIdAndDelete(req.params.doctorId);
    
    // Update the user with a notification instead of deleting
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await userModel.findById(userId);
        if (user) {
          // Add notification about application rejection
          user.notification.push({
            type: "doctor-application-rejected",
            message: "Your doctor application has been rejected",
            onClickPath: "/notification",
          });
          
          // Make sure isDoctor is set to false
          user.isDoctor = false;
          
          await user.save();
        }
      } catch (userError) {
        console.error("User notification error:", userError);
        // Continue even if notification fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Doctor application rejected successfully",
    });

  } catch (error) {
    console.error("Delete Doctor Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while rejecting doctor application",
      error: error.message,
    });
  }
};

exports.getAdminInfo = async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.body.userId })
      .populate('user', 'name email')
      .select('-createdAt -updatedAt -__v');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin information"
    });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findOneAndUpdate(
      { user: req.body.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile"
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  deleteDoctorController,
};