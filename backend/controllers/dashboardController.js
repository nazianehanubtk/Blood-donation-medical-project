const pool = require("../config/db");

const getDashboardData = async (req, res) => {
    try {

        const totalUsers = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        // A "donor" is any user with a blood_group set who is currently available
        const totalDonors = await pool.query(
            "SELECT COUNT(*) FROM users WHERE blood_group IS NOT NULL AND is_available = true"
        );

        // Patients aren't stored as users in this schema — each blood_requests row
        // represents one patient request, so count those instead
        const totalPatients = await pool.query(
            "SELECT COUNT(*) FROM blood_requests"
        );

        // Hospitals aren't stored as users either — count distinct hospital names
        // from blood_inventory (falls back to 0 if inventory is empty)
        const totalHospitals = await pool.query(
            "SELECT COUNT(DISTINCT hospital_name) FROM blood_inventory"
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