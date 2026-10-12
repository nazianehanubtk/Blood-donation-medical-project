const pool = require("../config/db");

const getAvailableDonors = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                d.donor_id,
                u.name,
                u.phone,
                d.blood_group,
                d.city_location,
                d.is_available,
                d.last_donation_date
            FROM donors d
            JOIN users u
            ON d.user_id = u.user_id
            WHERE d.is_available = TRUE
            ORDER BY d.donor_id ASC
        `);

        res.status(200).json({
            success: true,
            totalDonors: result.rows.length,
            donors: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    getAvailableDonors
};