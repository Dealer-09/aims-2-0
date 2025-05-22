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
  }, []);

  return (
    <section className="home container" id="home">
      <div className="home-content">
        <div className="home-img" ref={imgRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/img/IMG-20250226-WA0038.jpg" 
            alt="Professor Amit Tiwari" 
            loading="eager" 
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              borderRadius: '50%',
              border: '3px solid var(--main-color)',
              boxShadow: '0 8px 25px rgba(100, 123, 255, 0.3)'
            }}
          />
        </div>
        <div className="home-text" ref={textRef}>
          <h3>HELLO</h3>
          <h2 id="main-content">
            I&apos;m <span className="color">Amit Tiwari</span>
          </h2>
          <p>
            <span className="color">&quot;Welcome to my science institute!&quot;</span> As a passionate educator in the realms of science and mathematics,
            <span className="color"> I am thrilled to extend my knowledge and expertise to eager minds like yours.</span>
            <br /> Through my website, I aim to provide engaging resources, insightful content,
            <span className="color"> and a glimpse into the exciting world of scientific discovery.</span>
          </p>
          <div className="social">
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
