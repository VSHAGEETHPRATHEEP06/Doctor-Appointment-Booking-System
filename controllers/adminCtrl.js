const mongoose = require("mongoose");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const Admin = require("../models/adminModel");

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

const getAdminInfo = async (req, res) => {
  try {
    console.log('getAdminInfo called with userId:', req.body.userId);
    
    // First check if the user exists and is an admin
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify that the user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can access this resource"
      });
    }
    
    // Check if admin profile exists
    const admin = await Admin.findOne({ user: req.body.userId });
    
    if (!admin) {
      // Create a new admin profile if it doesn't exist
      try {
        const newAdmin = new Admin({
          user: req.body.userId,
          adminId: `ADMIN-${Date.now()}`,
          phone: "",  // Empty string should now be valid with our model changes
          officeAddress: "",
          emergencyContact: "", // Empty string should now be valid with our model changes
          department: "Administration"
        });
        
        await newAdmin.save();
        console.log("Created new admin profile successfully");
        
        return res.status(201).json({
          success: true,
          data: newAdmin,
          message: "New admin profile created"
        });
      } catch (createError) {
        console.error("Error creating admin profile:", createError);
        return res.status(500).json({
          success: false,
          message: "Error creating admin profile",
          error: createError.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin information",
      error: error.message
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    console.log('updateAdminProfile called with:', req.body);
    
    // Check if user exists
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Verify that the user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can access this resource"
      });
    }
    
    // Check if admin profile exists
    let admin = await Admin.findOne({ user: req.body.userId });
    
    if (!admin) {
      // Create new admin profile if it doesn't exist
      try {
        const adminData = {
          user: req.body.userId,
          phone: req.body.phone || "",
          officeAddress: req.body.officeAddress || "",
          emergencyContact: req.body.emergencyContact || "",
          adminId: req.body.adminId || `ADMIN-${Date.now()}`, // Generate default adminId if not provided
          department: req.body.department || "Administration"
        };
        
        admin = new Admin(adminData);
        await admin.save();
        
        // Update user name if provided
        if (req.body.name && req.body.name !== user.name) {
          user.name = req.body.name;
          await user.save();
        }
        
        return res.status(201).json({
          success: true,
          message: "Admin profile created successfully",
          data: admin
        });
      } catch (createError) {
        console.error("Error creating admin profile:", createError);
        return res.status(500).json({
          success: false,
          message: "Error creating admin profile",
          error: createError.message
        });
      }
    }
    
    // Update existing admin profile
    const fieldsToUpdate = ['phone', 'officeAddress', 'emergencyContact', 'adminId', 'department'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field]) {
        admin[field] = req.body[field];
      }
    });
    
    await admin.save();
    
    // Update user name if provided
    if (req.body.name && req.body.name !== user.name) {
      user.name = req.body.name;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile",
      error: error.message
    });
  }
};

const toggleUserBlockStatus = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    // Find the user
    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Prevent blocking admin users
    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot be blocked"
      });
    }
    
    // Toggle the block status
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    // Create notification for the user
    const notification = user.notification;
    notification.push({
      type: "account-status-updated",
      message: user.isBlocked ? 
        "Your account has been blocked by an administrator. Please contact support for assistance." : 
        "Your account has been unblocked. You can now use all features of the application.",
      onClickPath: "/notification"
    });
    await user.save();
    
    res.status(200).json({
      success: true,
      message: user.isBlocked ? 
        "User has been blocked successfully" : 
        "User has been unblocked successfully",
      data: user
    });
  } catch (error) {
    console.error("Toggle block status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user block status",
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  deleteDoctorController,
  getAdminInfo,
  updateAdminProfile,
  toggleUserBlockStatus
};