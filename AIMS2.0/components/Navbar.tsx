import React, { useState, useEffect } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={scrolled ? "header-active" : ""}>
      <div className="nav container">
        {/* Logo */}
        <Link href="#" className="logo">AIMS</Link>

        {/* Navigation Bar */}
        <ul className={`navbar ${menuOpen ? "open-menu" : ""}`}>
          <li><Link href="#home" className="nav-link">Home</Link></li>
          <li><Link href="#about" className="nav-link">About</Link></li>
          <li><Link href="#location" className="nav-link">Location</Link></li>
          <li><Link href="#class" className="nav-link">Class</Link></li>
          <li><Link href="#contact" className="nav-link">Contact</Link></li>
        </ul>

        {/* Menu Icon */}
        <div className={`menu-icon ${menuOpen ? "move" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
