const pool = require("../config/db");

const getDashboardData = async (req, res) => {
    try {

        const totalUsers = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        const totalDonors = await pool.query(
            "SELECT COUNT(*) FROM users WHERE user_type='donor'"
        );

        const totalPatients = await pool.query(
            "SELECT COUNT(*) FROM users WHERE user_type='patient'"
        );

        const totalHospitals = await pool.query(
            "SELECT COUNT(*) FROM users WHERE user_type='hospital'"
        );

        const totalBloodRequests = await pool.query(
            "SELECT COUNT(*) FROM blood_requests"
        );

        res.status(200).json({
            success: true,

            dashboard: {
                totalUsers: totalUsers.rows[0].count,
                totalDonors: totalDonors.rows[0].count,
                totalPatients: totalPatients.rows[0].count,
                totalHospitals: totalHospitals.rows[0].count,
                totalBloodRequests: totalBloodRequests.rows[0].count
            }

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
    getDashboardData
};