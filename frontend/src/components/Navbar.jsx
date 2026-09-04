import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, User, Droplet } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Navbar({ onHamburgerClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/donor", label: "Find Donor" },
    { to: "/request", label: "Blood Request" },
    { to: "/ai", label: "AI Assistant" },
  ];

  return (
    <header className="navbar">

      {/* Left */}
      <div className="navbar-left">
        <button
          className="hamburger-btn"
          onClick={onHamburgerClick}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="navbar-brand">
          <Droplet
            size={24}
            style={{
              marginRight: "8px",
              color: "var(--red)",
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            LifeDrop
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="navbar-desktop-nav">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="nav-link"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right */}
      <div className="navbar-right">

        {user ? (
          <div
            className="navbar-user-menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            {/* Notification */}
            <NotificationBell />

            {/* User */}
            <button
              className="user-avatar-btn"
              onClick={() =>
                setShowDropdown(!showDropdown)
              }
              aria-label="User menu"
            >
              {initial}
            </button>

            {showDropdown && (
              <div className="user-dropdown">

                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    {user.name}
                  </div>

                  <div className="dropdown-user-type">
                    {user.user_type}
                  </div>
                </div>

                <ul className="dropdown-menu">

                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() =>
                        setShowDropdown(false)
                      }
                    >
                      <User size={18} />
                      Profile
                    </Link>
                  </li>

                  <li>
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </li>

                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm btn-primary"
          >
            Login
          </Link>
        )}

      </div>
    </header>
  );
}

export default Navbar;