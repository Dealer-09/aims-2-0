import { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  // Set the top coordinate to 0
  // Make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className={`scroll-top ${visible ? 'scroll-active' : ''}`}>
      <button 
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className="back-to-top-button"
      >
        <i className='bx bx-up-arrow-alt'></i>
      </button>
      
      <style jsx>{`
        .back-to-top-button {
          width: 45px;
          height: 45px;
          background: var(--main-color);
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          border: none;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s;
        }
        
        .back-to-top-button:hover {
          background: #546eff;
          transform: translateY(-3px);
        }
      `}</style>
    </div>
  );
};

export default BackToTop;
