// src/services/aiService.js (Frontend)

const API_BASE_URL = "http://localhost:5000";

export async function getDonorRecommendations(requestId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Something went wrong." };
    }

    return data;
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection." };
  }
}

/**
 * Sends one chat message to the AI assistant.
 * @param {string} message - the user's typed message
 * @param {Array<{role: "user"|"assistant", text: string}>} history - recent chat turns
 */
export async function sendChatMessage(message, history = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Something went wrong." };
    }

    return data; // { success, reply, matches, aiUsed }
  } catch (err) {
    return { success: false, message: "Could not reach the server. Please check your connection." };
  }
}