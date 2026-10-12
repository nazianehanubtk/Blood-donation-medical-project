// backend/routes/aiRoutes.js

const express = require("express");
const router = express.Router();
const { recommendDonors, chatWithAI } = require("../controllers/aiController");

// POST /api/ai/recommend — existing request-ID based flow
router.post("/recommend", recommendDonors);

// POST /api/ai/chat — new conversational chatbot
router.post("/chat", chatWithAI);

module.exports = router;