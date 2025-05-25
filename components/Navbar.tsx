import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scrolling effect
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  // Close mobile menu when clicking outside or pressing escape
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    document.body.classList.remove('mobile-menu-open');
  }, []);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  }, [mobileMenuOpen, closeMobileMenu]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('mobile-menu-open');
    };
  }, [handleScroll, handleKeyDown]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    if (newState) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  };

  // Handle navigation link click
  const handleNavClick = () => {
    closeMobileMenu();
  };  return (
    <>
      <header className={scrolled ? "header-active" : ""} role="banner">
        <div className="nav container">
          {/* Logo */}
          <Link href="#" className="logo" aria-label="AIMS Home">
            AIMS
          </Link>

          {/* Desktop Navigation */}
          <nav role="navigation" aria-label="Main navigation">
            <ul className="navbar">
              <li><Link href="#home" className="nav-link">Home</Link></li>
              <li><Link href="#about" className="nav-link">About</Link></li>
              <li><Link href="#location" className="nav-link">Location</Link></li>
              <li><Link href="#class" className="nav-link">Class</Link></li>
              <li><Link href="#contact" className="nav-link">Contact</Link></li>
              <li>
                <Link href="/sign-in" className="nav-link sign-in">
                  <i className='bx bx-log-in-circle'></i> Sign In
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}>
        <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
          <Link href="#home" className="mobile-nav-link" onClick={handleNavClick}>
            Home
          </Link>
          <Link href="#about" className="mobile-nav-link" onClick={handleNavClick}>
            About
          </Link>
          <Link href="#location" className="mobile-nav-link" onClick={handleNavClick}>
            Location
          </Link>
          <Link href="#class" className="mobile-nav-link" onClick={handleNavClick}>
            Class
          </Link>
          <Link href="#contact" className="mobile-nav-link" onClick={handleNavClick}>
            Contact
          </Link>
          <Link href="/sign-in" className="mobile-nav-link sign-in" onClick={handleNavClick}>
            <i className='bx bx-log-in-circle'></i> Sign In
          </Link>
        </nav>
      </div>

      {/* Styles */}
      <style jsx>{`
        .sign-in {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 1rem;
          background-color: var(--main-color);
          color: white !important;
          border-radius: 6px;
          padding: 0.5rem 1rem !important;
          transition: all 0.3s;
        }
        
        .sign-in:hover {
          background-color: #546eff !important;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .sign-in {
            margin: 0;
            width: auto;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
