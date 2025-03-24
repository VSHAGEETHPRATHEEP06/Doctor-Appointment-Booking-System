const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        message: "Missing or invalid Authorization header",
        success: false,
      });
    }
    
    const token = authHeader.split(" ")[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        console.log('JWT Verification Error:', err);
        return res.status(401).send({
          message: "Authentication failed",
          success: false,
        });
      } else {
        // Convert the MongoDB ObjectId to a string to avoid comparison issues
        const userId = decode.id.toString();
        console.log('User authenticated with ID:', userId);
        
        // Set userId in both req.userId and req.body.userId for consistency
        req.userId = userId;
        req.body.userId = userId;
        next();
      }
    });
  } catch (error) {
    console.log('Auth Middleware Error:', error);
    res.status(401).send({
      message: "Authentication failed - invalid token",
      success: false,
    });
  }
};