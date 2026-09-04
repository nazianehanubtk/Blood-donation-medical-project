// src/components/NotificationBell.jsx

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const fetchNotifications = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch((err) => console.error("Fetch notifications error:", err));
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s so new requests/responses show up without a manual refresh
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleMarkAllRead = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      })
      .catch((err) => console.error("Mark all read error:", err));
  };

  const handleNotificationClick = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch((err) => console.error("Mark read error:", err));
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "var(--red)",
              color: "white",
              borderRadius: "50%",
              fontSize: "10px",
              fontWeight: 700,
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <strong style={{ fontSize: "14px" }}>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--red)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: "20px 14px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleNotificationClick(n.id)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                  background: n.isRead ? "white" : "var(--red-light)",
                  cursor: n.isRead ? "default" : "pointer",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 4px" }}>{n.title}</p>
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 6px" }}>{n.message}</p>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{timeAgo(n.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;