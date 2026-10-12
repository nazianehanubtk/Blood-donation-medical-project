const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    getBloodRequestsForDonor,
    respondToBloodRequest,
} = require("../controllers/bloodRequestController");

// Specific routes before "/:id" so "for-donor" isn't swallowed as an :id param
router.get("/for-donor", protect, getBloodRequestsForDonor);
router.post("/:id/respond", protect, respondToBloodRequest);

router.post("/", createBloodRequest);
router.get("/", getAllBloodRequests);
router.get("/:id", getBloodRequestById);

module.exports = router;