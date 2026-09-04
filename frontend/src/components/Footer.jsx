import React from "react";
import { Link } from "react-router-dom";
import { Droplet, Heart, Phone, Mail, MapPin } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/donor", label: "Find Donor" },
    { to: "/request", label: "Blood Request" },
    { to: "/ai", label: "AI Assistant" },
  ];

  const contactInfo = [
    { icon: Phone, text: "+880 1234-567890" },
    { icon: Mail, text: "lifedrop@gmail.com" },
    { icon: MapPin, text: "LifeDrop.com" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <div className="footer-brand">
            <Droplet size={24} style={{ color: "var(--red)" }} />
            <span>LifeDrop</span>
          </div>
          <p className="footer-description">
            Every Drop Can Save a Life.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul className="footer-contact">
            {contactInfo.map((info, index) => (
              <li key={index}>
                <info.icon size={16} />
                <span>{info.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Features Section */}
        <div className="footer-section">
          <h4>Features</h4>
          <ul className="footer-links">
            <li><a href="/">Smart Donor Matching</a></li>
            <li><a href="/">Instant Notifications</a></li>
            <li><a href="/">Real-time Availability</a></li>
            <li><a href="/">Location-based Search</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} AI Blood Donation Management. All rights reserved.</p>
        <div className="footer-badges">
          <span className="badge-text">Made with <Heart size={14} style={{ display: "inline", margin: "0 4px" }} /> for health</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
