import React, { useState, useEffect } from 'react';

const AnnouncementBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Add/remove banner-visible class to body
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('banner-visible');
    } else {
      document.body.classList.remove('banner-visible');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('banner-visible');
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="announcement-banner">
      <div className="container">
        <div className="banner-content">
          <div className="banner-icon">
            <i className='bx bxs-graduation'></i>
          </div>
          <div className="banner-text">
            <h3>🎓 New Batch Starting Soon!</h3>
            <p>Join AIMS for excellence in Mathematics & Science education</p>
          </div>
        </div>
        
        <div className="banner-actions">
          <a href="#contact" className="banner-cta">
            Enroll Now <i className='bx bx-right-arrow-alt'></i>
          </a>
          <button 
            className="banner-close"
            onClick={handleClose}
            aria-label="Close announcement banner"
            title="Close announcement"
          >
            <i className='bx bx-x'></i>
          </button>        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
