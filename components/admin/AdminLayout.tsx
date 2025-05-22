import React, { useState, Children, isValidElement, cloneElement } from 'react';
import styles from '../../styles/admin.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const childrenArray = Children.toArray(children).filter(isValidElement);
  const componentTitles = ["PDF Management", "Access Requests", "User Management"];
  const componentIcons = ["📄", "👥", "🔑"];
  
  return (
    <div className={styles.adminLayout}>      <h1 className={styles.dashboardTitle}>
        <span className={styles.titleGlow}>AIMS</span>
        <span className={styles.titleText}>Admin Dashboard</span>
        <div className={styles.titleUnderline}></div>
      </h1>      {/* Capsule Navigation Bar */}
      <div className={styles.navigationContainer}>
        <div className={styles.navigationTabs}>
          {componentTitles.map((title, index) => (
            <div 
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${styles.navigationTab} ${activeIndex === index ? styles.activeTab : styles.inactiveTab}`}            >
              <span className={`${styles.tabIcon} ${activeIndex === index ? styles.activeTabIcon : styles.inactiveTabIcon}`}>
                {componentIcons[index]}
              </span>
              {title}
            </div>
          ))}
        </div>
      </div>      {/* Component Container */}
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
