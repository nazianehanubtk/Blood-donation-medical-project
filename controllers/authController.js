const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =======================
// User Registration
// =======================
const register = async (req, res) => {
    try {
        const { name, email, password, phone, user_type } = req.body;

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

        // Insert User
        const result = await pool.query(
            `INSERT INTO users(name,email,password_hash,phone,user_type)
             VALUES($1,$2,$3,$4,$5)
             RETURNING user_id,name,email,user_type`,
            [name, email, hashedPassword, phone, user_type]
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

        // Generate JWT Token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                user_type: user.user_type
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
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
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