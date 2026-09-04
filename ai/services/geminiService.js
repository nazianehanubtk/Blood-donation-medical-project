// backend/ai/services/geminiService.js

const { SYSTEM_PROMPT, buildUserPrompt } = require("../prompts/donorMatchPrompt");
const { buildChatPrompt } = require("../prompts/chatPrompt");

// NOTE: Gemini 1.x and 2.x models are blocked for newly created API keys/projects.
// New keys only work with 3.x generation models — using gemini-3.5-flash here.
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

async function callGemini(promptText) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    clearTimeout(timeout);

    if (response.status === 429) {
      return { success: false, error: "RATE_LIMIT", message: "AI service is busy. Please try again shortly." };
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API error response:", response.status, errorBody);
      return { success: false, error: "API_ERROR", message: `AI service returned status ${response.status}` };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Gemini returned no text. Full response:", JSON.stringify(data));
      return { success: false, error: "EMPTY_RESPONSE", message: "AI returned no content." };
    }

    return { success: true, rawText };
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return { success: false, error: "TIMEOUT", message: "AI request timed out." };
    }

    console.error("Gemini network error:", err.message);
    return { success: false, error: "NETWORK_ERROR", message: "Could not reach AI service." };
  }
}

/**
 * Calls the Gemini API to get donor match recommendations (ranking).
 */
async function getDonorMatches(requestData, availableDonors) {
  const userPrompt = buildUserPrompt(requestData, availableDonors);
  return callGemini(`${SYSTEM_PROMPT}\n\n${userPrompt}`);
}

/**
 * Calls the Gemini API for one chatbot turn — classifies intent and
 * extracts blood group / district / urgency if the user is searching for a donor.
 */
async function getChatIntent(userMessage, history) {
  const prompt = buildChatPrompt(userMessage, history);
  return callGemini(prompt);
}

module.exports = { getDonorMatches, getChatIntent };