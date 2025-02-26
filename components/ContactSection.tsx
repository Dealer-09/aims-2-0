import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section className="contact container" id="contact">
      <h2 className="heading">Contact</h2>
      <form action="#" className="contact-form" id="contact-form">
        <input type="text" placeholder="Your Name" className="name" required />
        <input type="email" placeholder="Email address" className="email" required />
        <textarea cols={30} rows={10} placeholder="Enter Your Message..." className="message" required></textarea>
        <input type="submit" value="Send" className="send-btn" />
      </form>
    </section>
  );
};

export default ContactSection;