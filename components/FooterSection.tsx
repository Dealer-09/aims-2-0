import React from 'react';

const FooterSection: React.FC = () => {
  return (    
    <section className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>AIMS</h3>
          <p>Amit Institute of Math&apos;s and Science</p>
        </div>
        
        <div className="social footer-social">
          <a href="mailto:amittiwari006@gmail.com" aria-label="Email">
            <i className='bx bxl-gmail'></i>
          </a>
          <a href="tel:+918777811841" aria-label="Phone">
            <i className='bx bxs-phone-call'></i>
          </a>
          <a href="https://wa.me/qr/BA3M53LEVXBJO1" aria-label="WhatsApp">
            <i className='bx bxl-whatsapp'></i>
          </a>
          <a href="https://www.facebook.com/people/Amit-Institute-of-Maths-Science/61559417496300/?mibextid=ZbWKwL" aria-label="Facebook">
            <i className='bx bxl-facebook'></i>
          </a>
          <a href="https://www.instagram.com/a.i.m.s_007?utm_source=qr&igsh=MWFvdXp6cXNrc2h5bg%3D%3D" aria-label="Instagram">
            <i className='bx bxl-instagram'></i>
          </a>
        </div>
      </div>

      <div className="footer-links">
        <a href="https://www.termsfeed.com/live/2b48bea9-8baa-4d88-870c-d53aaa8d89d8">Privacy Policy</a>
        <a href="https://www.termsofusegenerator.net/live.php?token=vsZeBOq6MawANCeAv0E7VCcRCMboMi3I">Terms of Use</a>
        <a href="https://www.disclaimergenerator.net/live.php?token=RmnccNVnXlyrrUPZj7OwjGybobBCAIt6">Disclaimer</a>
      </div>
      
      <div className="copyright">
        <p>&#169; {new Date().getFullYear()} AIMS. All rights reserved.</p>
        <p>Developed by Vikash & Archisman</p>
      </div>
        <style jsx>{`        .footer {
          padding: 3rem 0 2rem;
          background: var(--box-color);
          border-top: 1px solid rgba(100, 123, 255, 0.1);
          margin-top: 2rem;
          width: 100%;
          position: relative;
        }
          .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 1.5rem;
        }
        
        .footer-logo h3 {
          font-size: 1.8rem;
          color: var(--main-color);
          margin-bottom: 0.5rem;
        }
        
        .footer-logo p {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .footer-social {
          display: flex;
          gap: 1rem;
        }
        
        .footer-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(100, 123, 255, 0.1);
          border-radius: 50%;
          transition: all 0.3s;
        }
        
        .footer-social a:hover {
          background: var(--main-color);
          transform: translateY(-3px);
        }
        
        .footer-social i {
          font-size: 1.3rem;
          color: var(--bg-color);
        }
          .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1.5rem 0;
          flex-wrap: wrap;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 1.5rem;
        }
        
        .footer-links a {
          color: var(--bg-color);
          opacity: 0.8;
          transition: all 0.3s;
          font-size: 0.9rem;
        }
        
        .footer-links a:hover {
          color: var(--main-color);
          opacity: 1;
        }
        
        .copyright {
          text-align: center;
          color: var(--bg-color);
          opacity: 0.6;          font-size: 0.85rem;
          margin-top: 1.5rem;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 1.5rem;
        }
        
        .copyright p:first-child {
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
};

export default FooterSection;