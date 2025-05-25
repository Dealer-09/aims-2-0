import { useEffect, useRef } from 'react';

const HeroSection: React.FC = () => {
  const imgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add animation classes after component mounts
    const img = imgRef.current;
    const text = textRef.current;
    
    if (img) img.classList.add('animate-fadeIn');
    
    // Staggered text animation
    if (text) {
      text.classList.add('animate-fadeInRight');
      
      // Add animation to children elements with delay
      const children = text.children;
      for (let i = 0; i < children.length; i++) {
        (children[i] as HTMLElement).style.animationDelay = `${i * 0.15}s`;
      }
    }
  }, []);  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="hero-badge" ref={imgRef}>
          <div className="institute-logo">
            <i className='bx bxs-graduation'></i>
          </div>
        </div>
        <div className="hero-text" ref={textRef}>
          <h3>WELCOME TO</h3>
          <h1 id="main-content">
            <span className="color">AIMS</span>
          </h1>
          <h2 className="institute-name">
            Amit Institute of <span className="color">Math&apos;s & Science</span>
          </h2>
          <p className="hero-description">
            <span className="color">Excellence in Education</span> - Where passion meets learning.
            We provide comprehensive science and mathematics education that empowers students to achieve their academic goals
            <span className="color"> and unlock their full potential.</span>
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Locations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
          <div className="hero-actions">
            <a href="#classes" className="cta-primary">
              Explore Courses <i className='bx bx-right-arrow-alt'></i>
            </a>
            <a href="#contact" className="cta-secondary">
              Get Started <i className='bx bx-phone'></i>
            </a>
          </div>
          <div className="social-links">
            <span className="social-label">Follow Us:</span>
            <a 
              href="https://www.facebook.com/people/Amit-Institute-of-Maths-Science/61559417496300/?mibextid=ZbWKwL" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Visit our Facebook page"
            >
              <i className='bx bxl-facebook'></i>
            </a>
            <a 
              href="https://www.instagram.com/a.i.m.s_007?utm_source=qr&igsh=MWFvdXp6cXNrc2h5bg%3D%3D" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit our Instagram page"
            >
              <i className='bx bxl-instagram'></i>
            </a>
            <a 
              href="https://youtube.com/@gyanofficialchannel3418?si=jEcx09RE3yvHGeYW" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit our YouTube channel"
            >
              <i className='bx bxl-youtube'></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
