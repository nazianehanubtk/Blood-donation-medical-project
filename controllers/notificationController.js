// backend/controllers/notificationController.js

const pool = require("../config/db");

// =======================
// Get logged-in user's notifications (most recent first)
// =======================
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }

        const result = await pool.query(
            `SELECT id, title, message, type, is_read AS "isRead", created_at AS "createdAt"
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 30`,
            [userId]
        );

        const unreadCount = result.rows.filter((n) => !n.isRead).length;

        res.status(200).json({
            success: true,
            notifications: result.rows,
            unreadCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Mark a single notification as read
// =======================
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications
             SET is_read = true, read_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// =======================
// Mark all of the logged-in user's notifications as read
// =======================
const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user?.id;

        await pool.query(
            `UPDATE notifications
             SET is_read = true, read_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};