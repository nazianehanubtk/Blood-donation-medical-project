const API_BASE_URL = "http://localhost:5000";

export async function getAvailableDonors() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/donors`);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        donors: [],
        message: data.message || "Failed to fetch donors.",
      };
    }

    return data;
  } catch (error) {
    console.error("Donor API Error:", error);

    return {
      success: false,
      donors: [],
      message: "Could not reach the server.",
    };
  }
}