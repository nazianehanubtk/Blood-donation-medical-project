// ai/utils/validateAIResponse.js

/**
 * Cleans and validates the raw text returned by Gemini.
 * Strips markdown code fences, parses JSON, removes duplicates,
 * and checks for empty/malformed output.
 */
function validateAIResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { valid: false, error: "EMPTY_RESPONSE" };
  }

  // Remove markdown code fences like ```json ... ```
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  if (!parsed.matches || !Array.isArray(parsed.matches)) {
    return { valid: false, error: "MISSING_MATCHES" };
  }

  if (parsed.matches.length === 0) {
    return { valid: true, data: { matches: [], note: parsed.note || "No suitable donors found." } };
  }

  // Remove duplicate donor entries by name + bloodGroup
  const seen = new Set();
  const uniqueMatches = parsed.matches.filter((m) => {
    const key = `${m.name}-${m.bloodGroup}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid: true, data: { matches: uniqueMatches, note: parsed.note || "" } };
}

module.exports = { validateAIResponse };