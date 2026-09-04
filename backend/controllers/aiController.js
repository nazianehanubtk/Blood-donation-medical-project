// backend/controllers/aiController.js

const { getDonorMatches, getChatIntent } = require("../../ai/services/geminiService");
const { validateAIResponse } = require("../../ai/utils/validateAIResponse");
const pool = require("../config/db");

/**
 * POST /api/ai/recommend  (unchanged — existing request-ID based flow)
 */
async function recommendDonors(req, res) {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "requestId is required." });
    }

    const requestQuery = `
      SELECT id, blood_group AS "bloodGroup", district, urgency
      FROM blood_requests
      WHERE id = $1;
    `;
    const requestResult = await pool.query(requestQuery, [requestId]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blood request not found." });
    }

    const bloodRequest = requestResult.rows[0];

    const donorQuery = `
      SELECT id AS "donorId", name, phone, blood_group AS "bloodGroup",
             district, last_donation_date AS "lastDonationDate", is_available AS "isAvailable"
      FROM users
      WHERE blood_group = $1 AND is_available = true
      LIMIT 20;
    `;
    const donorResult = await pool.query(donorQuery, [bloodRequest.bloodGroup]);
    const availableDonors = donorResult.rows;

    if (availableDonors.length === 0) {
      return res.status(200).json({
        success: true,
        matches: [],
        note: "No available donors found in the database for this blood group.",
      });
    }

    const aiResult = await getDonorMatches(
      { bloodGroup: bloodRequest.bloodGroup, district: bloodRequest.district, urgency: bloodRequest.urgency },
      availableDonors
    );

    if (!aiResult.success) {
      const fallbackDonors = availableDonors.slice(0, 3);
      await saveMatches(requestId, fallbackDonors.map((d) => d.donorId));

      return res.status(200).json({
        success: true,
        matches: fallbackDonors.map((d) => ({
          donorId: d.donorId,
          name: d.name,
          bloodGroup: d.bloodGroup,
          district: d.district,
          reason: "Fallback match (AI unavailable): closest available donor by blood group.",
        })),
        note: `AI recommendation unavailable (${aiResult.error}). Showing basic match instead.`,
        aiUsed: false,
      });
    }

    const validated = validateAIResponse(aiResult.rawText);

    if (!validated.valid || validated.data.matches.length === 0) {
      return res.status(200).json({
        success: true,
        matches: [],
        note: validated.valid ? validated.data.note : "AI response could not be validated. Please try again.",
        aiUsed: false,
      });
    }

    const validDonorIds = new Set(availableDonors.map((d) => d.donorId));
    const safeMatches = validated.data.matches.filter((m) => validDonorIds.has(m.donorId));

    if (safeMatches.length === 0) {
      return res.status(200).json({
        success: true,
        matches: [],
        note: "AI response did not match any known donors. Please try again.",
        aiUsed: false,
      });
    }

    await saveMatches(requestId, safeMatches.map((m) => m.donorId));

    return res.status(200).json({
      success: true,
      matches: safeMatches,
      note: validated.data.note,
      aiUsed: true,
    });
  } catch (err) {
    console.error("AI Controller Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

/**
 * POST /api/ai/chat
 * Body: { message: string, history?: [{ role: "user"|"assistant", text: string }] }
 *
 * Flow:
 * 1. Ask Gemini to classify the message (general question vs donor search) and extract
 *    bloodGroup / district / urgency if it's a donor search.
 * 2. If it's a general question, just return Gemini's conversational reply.
 * 3. If it's a donor search with a blood group, query available donors from `users`,
 *    rank them with the existing AI ranking flow, and return both the reply and matches.
 */
async function chatWithAI(req, res) {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const aiResult = await getChatIntent(message.trim(), Array.isArray(history) ? history : []);

    if (!aiResult.success) {
      return res.status(200).json({
        success: true,
        reply: "Sorry, the AI service is unavailable right now. Please try again in a moment.",
        matches: [],
        aiUsed: false,
      });
    }

    let parsed;
    try {
      const cleaned = aiResult.rawText
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // Gemini didn't return valid JSON — show its raw text as a plain reply
      return res.status(200).json({
        success: true,
        reply: aiResult.rawText.trim(),
        matches: [],
        aiUsed: true,
      });
    }

    const { intent, reply, bloodGroup, district, urgency } = parsed;

    if (intent !== "donor_search" || !bloodGroup) {
      return res.status(200).json({
        success: true,
        reply: reply || "How can I help you find a donor today?",
        matches: [],
        aiUsed: true,
      });
    }

    const donorQuery = district
      ? `SELECT id AS "donorId", name, phone, blood_group AS "bloodGroup",
                district, last_donation_date AS "lastDonationDate", is_available AS "isAvailable"
         FROM users
         WHERE blood_group = $1 AND is_available = true AND district ILIKE $2
         LIMIT 20;`
      : `SELECT id AS "donorId", name, phone, blood_group AS "bloodGroup",
                district, last_donation_date AS "lastDonationDate", is_available AS "isAvailable"
         FROM users
         WHERE blood_group = $1 AND is_available = true
         LIMIT 20;`;

    const donorParams = district ? [bloodGroup, `%${district}%`] : [bloodGroup];
    const donorResult = await pool.query(donorQuery, donorParams);
    const availableDonors = donorResult.rows;

    if (availableDonors.length === 0) {
      return res.status(200).json({
        success: true,
        reply: `${reply ? reply + " " : ""}Sorry, no available ${bloodGroup} donors found${district ? ` in ${district}` : ""} right now.`,
        matches: [],
        aiUsed: true,
      });
    }

    const rankResult = await getDonorMatches(
      { bloodGroup, district: district || "any", urgency: urgency || "normal" },
      availableDonors
    );

    if (!rankResult.success) {
      return res.status(200).json({
        success: true,
        reply: reply || `Found some ${bloodGroup} donors for you:`,
        matches: availableDonors.slice(0, 5).map((d) => ({
          donorId: d.donorId,
          name: d.name,
          bloodGroup: d.bloodGroup,
          district: d.district,
          reason: "Available donor matching your blood group.",
        })),
        aiUsed: false,
      });
    }

    const validated = validateAIResponse(rankResult.rawText);
    const validDonorIds = new Set(availableDonors.map((d) => d.donorId));
    const safeMatches = validated.valid
      ? validated.data.matches.filter((m) => validDonorIds.has(m.donorId))
      : [];

    const finalMatches = safeMatches.length > 0
      ? safeMatches
      : availableDonors.slice(0, 5).map((d) => ({
          donorId: d.donorId,
          name: d.name,
          bloodGroup: d.bloodGroup,
          district: d.district,
          reason: "Available donor matching your blood group.",
        }));

    return res.status(200).json({
      success: true,
      reply: reply || `Found ${finalMatches.length} matching donor(s):`,
      matches: finalMatches,
      aiUsed: true,
    });
  } catch (err) {
    console.error("AI Chat Controller Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

/**
 * Inserts matched donors into donor_responses.
 */
async function saveMatches(requestId, donorIds) {
  if (donorIds.length === 0) return;

  const insertQuery = `
    INSERT INTO donor_responses (request_id, donor_id, status)
    VALUES ($1, $2, 'pending')
    ON CONFLICT (request_id, donor_id) DO NOTHING;
  `;

  for (const donorId of donorIds) {
    try {
      await pool.query(insertQuery, [requestId, donorId]);
    } catch (err) {
      if (err.code === "42P10") {
        await pool.query(
          `INSERT INTO donor_responses (request_id, donor_id, status) VALUES ($1, $2, 'pending');`,
          [requestId, donorId]
        );
      } else {
        throw err;
      }
    }
  }
}

module.exports = { recommendDonors, chatWithAI };