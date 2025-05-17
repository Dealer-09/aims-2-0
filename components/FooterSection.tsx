import React from 'react';

const FooterSection: React.FC = () => {
  return (
    <section className="footer container" id="footer">
      <div className="social">
        <a href="mailto:amittiwari006@gmail.com"><i className='bx bxl-gmail'></i></a>
        <a href="tel:+918777811841"><i className='bx bxs-phone-call'></i></a>
        <a href="https://wa.me/qr/BA3M53LEVXBJO1"><i className='bx bxl-whatsapp'></i></a>
      </div>
      <div className="footer-links">
        <a href="https://www.termsfeed.com/live/2b48bea9-8baa-4d88-870c-d53aaa8d89d8">Privacy Policy</a>
        <a href="https://www.termsofusegenerator.net/live.php?token=vsZeBOq6MawANCeAv0E7VCcRCMboMi3I">Terms of Use</a>
        <a href="https://www.disclaimergenerator.net/live.php?token=RmnccNVnXlyrrUPZj7OwjGybobBCAIt6">Disclaimer</a>
      </div>
      <p>&#169; Developed by Vikash & Archisman</p>
    </section>
  );
};

export default FooterSection;