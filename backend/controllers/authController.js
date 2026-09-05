const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// User Registration
// =======================
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            blood_group,
            district,
            user_type,
            last_donation_date
        } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and phone are required"
            });
        }

        // Validate user_type against the DB's allowed values; default to "patient" if not sent
        const allowedUserTypes = ["donor", "patient", "hospital"];
        const resolvedUserType = allowedUserTypes.includes(user_type) ? user_type : "patient";

        // last_donation_date only makes sense for donors; ignore it otherwise
        const resolvedLastDonationDate =
            resolvedUserType === "donor" && last_donation_date ? last_donation_date : null;

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Password Hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User — matches the LIVE users table columns
        // (id, name, email, phone, password_hash, blood_group, district, age, weight, gender,
        //  is_available, last_donation_date, user_type, created_at)
        const result = await pool.query(
            `INSERT INTO users(name, email, password_hash, phone, blood_group, district, user_type, last_donation_date)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING id, name, email, blood_group, district, user_type AS "userType", last_donation_date AS "lastDonationDate"`,
            [
                name,
                email,
                hashedPassword,
                phone,
                blood_group || null,
                district || null,
                resolvedUserType,
                resolvedLastDonationDate
            ]
        );

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// =======================
// User Login
// =======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check email
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // Generate JWT Token — matches the LIVE users table's primary key column: id
        const token = jwt.sign(
            {
                user_id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bloodGroup: user.blood_group,
                district: user.district,
                user_type: user.user_type,
                lastDonationDate: user.last_donation_date
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
    register,
    login
};