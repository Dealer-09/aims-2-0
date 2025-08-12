import { useState, useEffect } from 'react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollY > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    toggleVisibility();
    
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
