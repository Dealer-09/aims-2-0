import React, { useState, useEffect, useCallback, CSSProperties } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scrolling effect with throttle for performance
  const handleScroll = useCallback(() => {
    if (window.scrollY > 50) {
      if (!scrolled) setScrolled(true);
    } else {
      if (scrolled) setScrolled(false);
    }
  }, [scrolled]);

  // Close menu when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (menuOpen && !target.closest('.navbar') && !target.closest('.menu-icon')) {
      setMenuOpen(false);
    }
  }, [menuOpen]);

  // Handle escape key press to close menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    // Add scroll listener with throttling
    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = undefined as unknown as NodeJS.Timeout;
        }, 100);
      }
    };

    window.addEventListener("scroll", throttledScroll);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [handleScroll, handleClickOutside, handleKeyDown]);

  // Handle menu toggle
  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  // Close menu when a navigation link is clicked
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const getNavLinkStyle = (index: number): CSSProperties => ({
    ['--i' as string]: index
  });

  return (
    <header className={scrolled ? "header-active" : ""} role="banner">
      <div className="nav container">
        {/* Logo */}
        <Link href="#" className="logo" aria-label="AIMS Home">AIMS</Link>

        {/* Navigation Bar */}
        <nav role="navigation" aria-label="Main navigation">
          <ul className={`navbar ${menuOpen ? "open-menu" : ""}`}>
            <li><Link href="#home" className="nav-link" onClick={closeMenu} style={getNavLinkStyle(0)}>Home</Link></li>
            <li><Link href="#about" className="nav-link" onClick={closeMenu} style={getNavLinkStyle(1)}>About</Link></li>
            <li><Link href="#location" className="nav-link" onClick={closeMenu} style={getNavLinkStyle(2)}>Location</Link></li>
            <li><Link href="#class" className="nav-link" onClick={closeMenu} style={getNavLinkStyle(3)}>Class</Link></li>
            <li><Link href="#contact" className="nav-link" onClick={closeMenu} style={getNavLinkStyle(4)}>Contact</Link></li>
            <li>
              <Link href="/sign-in" className="nav-link sign-in" onClick={closeMenu} style={getNavLinkStyle(5)}>
                <i className='bx bx-log-in-circle'></i> Sign In
              </Link>
            </li>
          </ul>
        </nav>

        {/* Menu Icon - with proper ARIA attributes */}
        <button 
          className={`menu-icon ${menuOpen ? "move" : ""}`} 
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="navbar"
        >
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </button>
      </div>        {/* Overlay when menu is open on mobile */}
      <div 
        className={`menu-overlay ${menuOpen ? 'active' : ''}`}
        aria-hidden="true"
        onClick={closeMenu}
      /><style jsx>{`
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          pointer-events: none;
        }
        
        .menu-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        
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
        
        @media (max-width: 775px) {
          .sign-in {
            margin: 1rem 0 0 0;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
