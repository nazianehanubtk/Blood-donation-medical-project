import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Heart, Zap, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

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

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const links = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/donor", label: "Find Donor", icon: <Search size={18} /> },
    { to: "/request", label: "Blood Request", icon: <Heart size={18} /> },
    { to: "/ai", label: "AI Assistant", icon: <Zap size={18} /> },
  ];

  // Close mobile sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(".sidebar") && !e.target.closest(".hamburger-btn")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  return (
    <>
      {/* Hamburger menu trigger - hidden on desktop */}
      <div style={{ display: "none" }} data-mobile-menu={isOpen ? "true" : "false"}>
        <button className="hamburger-trigger" onClick={toggleSidebar} />
      </div>

      {/* Floating button to bring the sidebar back once it's collapsed (desktop only) */}
      {collapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={toggleCollapse}
          title="Show sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || "User"}</p>
            <p className="sidebar-user-type">{user?.user_type || "Member"}</p>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            title="Hide sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
            onClick={() => setIsOpen(false)}
          >
            <span className="sidebar-icon">
              <User size={18} />
            </span>
            Profile
          </NavLink>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon">
              <LogOut size={18} />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;