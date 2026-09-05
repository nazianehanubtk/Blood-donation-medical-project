const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const donorRoutes = require("./routes/donorRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default Route
app.get("/", (req, res) => {
    res.send("AI Blood Donation Management System Backend is Running...");
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/donors", donorRoutes);

// Blood Request Routes
app.use("/api/blood-requests", bloodRequestRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

// AI Routes
app.use("/api/ai", aiRoutes);

// User Profile Routes
app.use("/api/users", userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on Port ${PORT}`);
});