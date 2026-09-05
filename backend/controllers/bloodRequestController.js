const pool = require("../config/db");

// =======================
// Create Blood Request
// =======================
const createBloodRequest = async (req, res) => {
    try {
        const {
            requester_name,
            requester_phone,
            requester_email,
            blood_group,
            district,
            urgency,
            hospital_name,
            hospital_address,
            patient_name,
            patient_age,
            units_needed,
            description,
        } = req.body;

        if (!requester_name || !requester_phone || !blood_group || !district) {
            return res.status(400).json({
                success: false,
                message: "Requester name, phone, blood group, and district are required",
            });
        }

        if (patient_age !== undefined && patient_age !== null && patient_age !== "" && Number(patient_age) < 0) {
            return res.status(400).json({
                success: false,
                message: "Patient age cannot be negative",
            });
        }

        if (units_needed !== undefined && units_needed !== null && units_needed !== "" && Number(units_needed) < 1) {
            return res.status(400).json({
                success: false,
                message: "Units needed must be at least 1",
            });
        }

        const validUrgency = ["normal", "urgent", "critical", "emergency"];
        const finalUrgency = validUrgency.includes(urgency) ? urgency : "normal";

        const result = await pool.query(
            `INSERT INTO blood_requests
                (requester_name, requester_phone, requester_email, blood_group, district,
                 urgency, hospital_name, hospital_address, patient_name, patient_age,
                 units_needed, description)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             RETURNING *`,
            [
                requester_name,
                requester_phone,
                requester_email || null,
                blood_group,
                district,
                finalUrgency,
                hospital_name || null,
                hospital_address || null,
                patient_name || null,
                patient_age || null,
                units_needed || 1,
                description || null,
            ]
        );

        const newRequest = result.rows[0];

        // Notify every donor whose blood group and district match this request
        // (fire-and-forget: a notification failure shouldn't fail the request submission)
        try {
            const matchingDonors = await pool.query(
                `SELECT id FROM users WHERE user_type = 'donor' AND blood_group = $1 AND district = $2`,
                [blood_group, district]
            );

            if (matchingDonors.rows.length > 0) {
                const values = [];
                const placeholders = matchingDonors.rows
                    .map((donor, i) => {
                        const base = i * 4;
                        values.push(
                            donor.id,
                            "Someone needs your blood group",
                            `${requester_name} in ${district} needs ${blood_group} blood (${units_needed || 1} unit(s), ${finalUrgency}). Check Blood Requests to respond.`,
                            "request_match"
                        );
                        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
                    })
                    .join(", ");

                await pool.query(
                    `INSERT INTO notifications (user_id, title, message, type) VALUES ${placeholders}`,
                    values
                );
            }
        } catch (notifyErr) {
            console.error("Failed to notify matching donors:", notifyErr);
        }

        res.status(201).json({
            success: true,
            message: "Blood request submitted successfully",
            request: newRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Get All Blood Requests (for AI / listing)
// =======================
const getAllBloodRequests = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM blood_requests ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, requests: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Get Single Blood Request by ID
// =======================
const getBloodRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM blood_requests WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({ success: true, request: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Get Blood Requests Matching the Logged-in Donor
// (same blood group + district, excluding ones already responded to)
// =======================
const getBloodRequestsForDonor = async (req, res) => {
    try {
        const donorId = req.user?.id;
        if (!donorId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }

        const donorResult = await pool.query(
            `SELECT blood_group, district, user_type FROM users WHERE id = $1`,
            [donorId]
        );

        if (donorResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const donor = donorResult.rows[0];
        if ((donor.user_type || "").toLowerCase() !== "donor") {
            return res.status(403).json({ success: false, message: "Only donor accounts can view this list." });
        }

        const result = await pool.query(
            `SELECT br.*
             FROM blood_requests br
             WHERE br.blood_group = $1
               AND br.district = $2
               AND NOT EXISTS (
                   SELECT 1 FROM donor_responses dr
                   WHERE dr.request_id = br.id AND dr.donor_id = $3
               )
             ORDER BY
               CASE br.urgency
                 WHEN 'emergency' THEN 1
                 WHEN 'critical' THEN 2
                 WHEN 'urgent' THEN 3
                 ELSE 4
               END,
               br.created_at DESC`,
            [donor.blood_group, donor.district, donorId]
        );

        res.status(200).json({ success: true, requests: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Donor Responds to a Blood Request
// =======================
const respondToBloodRequest = async (req, res) => {
    try {
        const donorId = req.user?.id;
        if (!donorId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }

        const { id: requestId } = req.params;
        const { message } = req.body;

        const requestCheck = await pool.query(
            `SELECT * FROM blood_requests WHERE id = $1`,
            [requestId]
        );
        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Blood request not found." });
        }
        const bloodRequest = requestCheck.rows[0];

        const result = await pool.query(
            `INSERT INTO donor_responses (request_id, donor_id, status, message)
             VALUES ($1, $2, 'pending', $3)
             RETURNING *`,
            [requestId, donorId, message || null]
        );

        // Notify the requester that a donor has responded.
        // blood_requests only stores requester_name/phone/email (no user_id link),
        // so we match the requester back to a user account by email when possible.
        try {
            if (bloodRequest.requester_email) {
                const donorInfo = await pool.query(
                    `SELECT name, phone, blood_group FROM users WHERE id = $1`,
                    [donorId]
                );
                const donorName = donorInfo.rows[0]?.name || "A donor";
                const donorPhone = donorInfo.rows[0]?.phone || "N/A";

                const requesterUser = await pool.query(
                    `SELECT id FROM users WHERE email = $1`,
                    [bloodRequest.requester_email]
                );

                if (requesterUser.rows.length > 0) {
                    await pool.query(
                        `INSERT INTO notifications (user_id, title, message, type)
                         VALUES ($1, $2, $3, $4)`,
                        [
                            requesterUser.rows[0].id,
                            "A donor responded to your request",
                            `${donorName} (${donorPhone}) can help with your ${bloodRequest.blood_group} blood request.`,
                            "request_match",
                        ]
                    );
                }
            }
        } catch (notifyErr) {
            console.error("Failed to notify requester:", notifyErr);
        }

        res.status(201).json({
            success: true,
            message: "Response submitted. The requester will be notified.",
            response: result.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ success: false, message: "You've already responded to this request." });
        }
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    getBloodRequestsForDonor,
    respondToBloodRequest,
};