// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT sent in the Authorization header ("Bearer <token>")
 * and attaches the decoded payload to req.user.
 *
 * Matches the token created in authController.js's login():
 *   jwt.sign({ user_id, email, user_type }, process.env.JWT_SECRET, { expiresIn: "1d" })
 *
 * req.user.id is set from decoded.user_id so the rest of the backend
 * (aiController, userController, etc.) can use req.user.id consistently.
 */
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authenticated. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      userType: decoded.user_type,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = { protect };