// ai/prompts/donorMatchPrompt.js

const SYSTEM_PROMPT = `You are an AI assistant integrated into a Blood Donation Management System.
Your role is to analyze donor data and blood requests, then recommend the most suitable donor matches.
Consider blood group compatibility, donor district proximity, donor availability status, and request urgency.
Always respond in a clear, structured format. If no suitable match exists, clearly state that instead of guessing.
Do not invent donor information that was not provided to you.`;

/**
 * Builds the user prompt dynamically based on the blood request.
 * @param {Object} bloodRequest
 * @param {string} bloodRequest.bloodGroup - e.g. "O+"
 * @param {string} bloodRequest.district - e.g. "Khulna"
 * @param {string} bloodRequest.urgency - e.g. normal, urgent, critical, emergency
 * @param {Array} availableDonors - rows from the users table
 */
function buildUserPrompt(bloodRequest, availableDonors) {
  const { bloodGroup, district, urgency } = bloodRequest;

  const donorList = availableDonors
    .map(
      (d) =>
        `donorId: ${d.donorId}, Name: ${d.name}, Blood Group: ${d.bloodGroup}, District: ${d.district}, Last Donated: ${d.lastDonationDate || "N/A"}, Available: ${d.isAvailable}`
    )
    .join("\n");

  return `A blood request needs the following:
- Required Blood Group: ${bloodGroup}
- District: ${district}
- Urgency Level: ${urgency || "normal"}

Here is the list of currently available donors:
${donorList}

Based on this data, recommend the top 3 most suitable donors, ranked by compatibility, district match, and urgency.
IMPORTANT: You must return the exact "donorId" value given above for each donor — do not invent or alter it.
Return the result strictly in this JSON format and nothing else:
{
  "matches": [
    { "donorId": 0, "name": "", "bloodGroup": "", "district": "", "reason": "" }
  ],
  "note": ""
}`;
}

module.exports = { SYSTEM_PROMPT, buildUserPrompt };