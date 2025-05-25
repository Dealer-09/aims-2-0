import React from 'react';

const AboutSection = () => {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <h2 className="heading">About AIMS</h2>
        <div className="about-content">
          <div className="about-cards">
            <div className="about-card">
              <div className="card-icon">
                <i className='bx bxs-book-bookmark'></i>
              </div>
              <h3>Quality Education</h3>
              <p>Comprehensive curriculum designed to build strong foundations in mathematics and science</p>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <i className='bx bxs-user-badge'></i>
              </div>
              <h3>Expert Faculty</h3>
              <p>Experienced educators dedicated to nurturing academic excellence and personal growth</p>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <i className='bx bxs-trophy'></i>
              </div>
              <h3>Proven Results</h3>
              <p>Track record of student success in competitive exams and academic achievements</p>
            </div>
          </div>
          <div className="about-info">
            <div className="about-data">
              <span>Our Mission</span>
              <h2>Excellence in Science & Mathematics Education</h2>
              <p className="mission-text">
                At AIMS, we believe that quality education is the foundation of success. Our institute is dedicated to providing 
                exceptional learning experiences in mathematics and science, empowering students to excel in their academic pursuits 
                and prepare for a bright future.
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <i className='bx bx-check-circle'></i>
                  <span>Interactive Learning Methods</span>
                </div>
                <div className="feature-item">
                  <i className='bx bx-check-circle'></i>
                  <span>Regular Assessment & Feedback</span>
                </div>
                <div className="feature-item">
                  <i className='bx bx-check-circle'></i>
                  <span>Competitive Exam Preparation</span>
                </div>
                <div className="feature-item">
                  <i className='bx bx-check-circle'></i>
                  <span>Personalized Attention</span>
                </div>
              </div>
              <a href="#classes" className="btn">
                Explore Our Programs
                <i className='bx bx-right-arrow-alt'></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;