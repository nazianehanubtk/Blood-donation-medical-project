// backend/controllers/userController.js

const pool = require("../config/db");

/**
 * GET /api/users/me
 * Returns the logged-in user's full profile.
 * Requires auth middleware to have set req.user.id from the JWT.
 */
async function getMyProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }

    const query = `
      SELECT id, name, email, phone, blood_group AS "bloodGroup", district,
             age, weight, gender, is_available AS "isAvailable",
             user_type AS "userType",
             last_donation_date AS "lastDonationDate", created_at AS "createdAt"
      FROM users
      WHERE id = $1;
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

/**
 * PATCH /api/users/me
 * Updates safe, self-editable fields only.
 * email, password_hash, blood_group, and user_type are intentionally NOT editable here —
 * blood group / role changes need a separate verified process, not a casual profile edit.
 *
 * last_donation_date IS editable — a donor updates this themselves each time they donate,
 * so the platform knows when they'll be eligible to donate again.
 */
async function updateMyProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }

    const { name, phone, district, age, weight, gender, isAvailable, lastDonationDate } = req.body;

    const query = `
      UPDATE users
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          district = COALESCE($3, district),
          age = COALESCE($4, age),
          weight = COALESCE($5, weight),
          gender = COALESCE($6, gender),
          is_available = COALESCE($7, is_available),
          last_donation_date = COALESCE($8, last_donation_date)
      WHERE id = $9
      RETURNING id, name, email, phone, blood_group AS "bloodGroup", district,
                age, weight, gender, is_available AS "isAvailable",
                user_type AS "userType",
                last_donation_date AS "lastDonationDate", created_at AS "createdAt";
    `;
    const values = [
      name ?? null,
      phone ?? null,
      district ?? null,
      age ?? null,
      weight ?? null,
      gender ?? null,
      typeof isAvailable === "boolean" ? isAvailable : null,
      lastDonationDate ?? null,
      userId,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { getMyProfile, updateMyProfile };