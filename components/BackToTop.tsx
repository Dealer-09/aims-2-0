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
  }, []);  return (
    <div 
      className={`scroll-top ${visible ? 'scroll-active' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          scrollToTop();
        }
      }}
    >
      <i className='bx bx-up-arrow-alt'></i>
    </div>
  );
};

export default BackToTop;
