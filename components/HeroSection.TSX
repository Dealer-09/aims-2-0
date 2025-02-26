import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="home container" id="home">
      <div className="home-content">
        <div className="home-img">
          <img src="/img/IMG-20250226-WA0038.jpg" alt="AIMS" />
        </div>
        <div className="home-text">
          <h3>HELLO</h3>
          <h2>
            I'm <span className="color">Amit Tiwari</span>
          </h2>
          <p>
            <span className="color">"Welcome to my science institute!"</span> As a passionate educator in the realms of science and mathematics,
            <span className="color"> I am thrilled to extend my knowledge and expertise to eager minds like yours.</span>
            <br /> Through my website, I aim to provide engaging resources, insightful content,
            <span className="color"> and a glimpse into the exciting world of scientific discovery.</span>
          </p>
          <div className="social">
            <a href="https://www.facebook.com/people/Amit-Institute-of-Maths-Science/61559417496300/?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer">
              <i className='bx bxl-facebook'></i>
            </a>
            <a href="https://www.instagram.com/a.i.m.s_007?utm_source=qr&igsh=MWFvdXp6cXNrc2h5bg%3D%3D" target="_blank" rel="noopener noreferrer">
              <i className='bx bxl-instagram'></i>
            </a>
            <a href="https://youtube.com/@gyanofficialchannel3418?si=jEcx09RE3yvHGeYW" target="_blank" rel="noopener noreferrer">
              <i className='bx bxl-youtube'></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
