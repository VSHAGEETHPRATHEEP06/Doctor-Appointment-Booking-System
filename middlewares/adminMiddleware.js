const userModel = require('../models/userModels');

module.exports = async (req, res, next) => {
  try {
    // The userId is already set by the authMiddleware
    const userId = req.userId;
    
    // Find the user and check if they are an admin
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can access this resource"
      });
    }
    
    // User is an admin, proceed to the next middleware or controller
    next();
    
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying admin privileges",
      error: error.message
    });
  }
};
