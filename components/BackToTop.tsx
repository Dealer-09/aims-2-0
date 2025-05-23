import { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    // Get current scroll position with cross-browser support
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Only show button when scrolled more than 300px
    if (scrollY > 300) {
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
    // Check scroll position on mount
    toggleVisibility();
    
    // Add throttled event listener for better performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const throttledScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          toggleVisibility();
          timeoutId = undefined as unknown as ReturnType<typeof setTimeout>;
        }, 100);
      }
    };
    
    window.addEventListener("scroll", throttledScroll);
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
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
