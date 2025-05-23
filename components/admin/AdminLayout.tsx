import React, { useState, Children, isValidElement, useEffect } from 'react';
import styles from '../../styles/admin.module.css';
import cardStyles from '../../styles/admin-card-fixes.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const childrenArray = Children.toArray(children).filter(isValidElement);
  const componentTitles = ["PDF Management", "Access Requests", "User Management"];
  const componentIcons = ["📄", "👥", "🔑"];
  // Handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // When switching from mobile to desktop, auto-close the mobile nav
    if (!isMobile && isNavOpen) {
      setIsNavOpen(false);
    }
    
    // Close nav when clicking outside on mobile - improved to handle event bubbling
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobile && isNavOpen && 
          !target.closest(`.${styles.navigationContainer}`) && 
          !target.closest(`.${styles.menuToggle}`)) {
        setIsNavOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile, isNavOpen]);
    // Ensure navigation menu state is preserved when active component changes
  useEffect(() => {
    // Store navigation state in sessionStorage to persist across component changes
    const storedNavState = sessionStorage.getItem('adminNavOpen');
    if (storedNavState) {
      setIsNavOpen(storedNavState === 'true');
    }
  }, []);
  
  // Save the navigation state when it changes
  useEffect(() => {
    sessionStorage.setItem('adminNavOpen', isNavOpen.toString());
  }, [isNavOpen]);
  
  // Handle navigation item click
  const handleNavItemClick = (index: number) => {
    setActiveIndex(index);
    if (isMobile) {
      setIsNavOpen(false);
    }
  };
  
  return (
    <div className={styles.adminLayout}>
      <div className={styles.adminHeader}>
        <h1 className={styles.dashboardTitle}>
          <span className={styles.titleGlow}>AIMS</span>
          <span className={styles.titleText}>Admin Dashboard</span>
          <div className={styles.titleUnderline}></div>
        </h1>
          {/* Mobile Menu Toggle Button */}
        <button 
          className={`${styles.menuToggle} ${isNavOpen ? styles.menuOpen : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsNavOpen(!isNavOpen);
          }}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
        {/* Responsive Navigation */}
      <div 
        className={`${styles.navigationContainer} ${isNavOpen ? styles.navOpen : ''}`}
        id="mobile-navigation"
      >
        <nav className={styles.navigationTabs}>
          {componentTitles.map((title, index) => (
            <div 
              key={index}
              onClick={() => handleNavItemClick(index)}
              className={`${styles.navigationTab} ${activeIndex === index ? styles.activeTab : styles.inactiveTab}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavItemClick(index);
                }
              }}
            >
              <span className={`${styles.tabIcon} ${activeIndex === index ? styles.activeTabIcon : styles.inactiveTabIcon}`}>
                {componentIcons[index]}
              </span>
              <span className={styles.tabText}>{title}</span>
            </div>
          ))}
        </nav>
      </div>
        {/* Mobile navigation overlay to close when clicking outside */}
      <div 
        className={`${styles.navOverlay} ${isNavOpen ? styles.navOverlayVisible : ''}`}
        onClick={() => setIsNavOpen(false)}
        aria-hidden="true"
      ></div>
      
      {/* Component Container */}
      <div className={styles.componentContainer}>
        {childrenArray.map((child, index) => (
          <div 
            key={index}
            className={`${styles.componentWrapper} ${index === activeIndex ? styles.activeComponent : styles.inactiveComponent}`}
          >
            {child}
          </div>
        ))}
      </div>     
    </div>
  );
}
