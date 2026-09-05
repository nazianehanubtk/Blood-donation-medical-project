const pool = require("../config/db");

const getAvailableDonors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        phone,
        blood_group AS "bloodGroup",
        district,
        age,
        weight,
        gender,
        is_available AS "isAvailable",
        last_donation_date AS "lastDonationDate"
      FROM users
      WHERE is_available = TRUE
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      totalDonors: result.rows.length,
      donors: result.rows,
    });

  } catch (error) {
    console.error("Get Available Donors Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAvailableDonors,
};