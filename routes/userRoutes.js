// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyProfile, updateMyProfile } = require("../controllers/userController");

// GET  /api/users/me  -> fetch the logged-in user's profile
// PATCH /api/users/me -> update editable profile fields
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

module.exports = router;