import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="features-container">
        <div className="features-header">
          <h2 className="heading">Why Choose AIMS?</h2>
          <p className="features-subtitle">
            Discover what makes our educational approach unique and effective
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon science">
              <i className='bx bxs-flask'></i>
            </div>
            <h3>Hands-on Learning</h3>
            <p>Interactive experiments and practical applications that bring science to life</p>
            <ul className="feature-points">
              <li>Laboratory sessions</li>
              <li>Real-world applications</li>
              <li>Interactive demonstrations</li>
            </ul>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon math">
              <i className='bx bxs-calculator'></i>
            </div>
            <h3>Problem-Solving Focus</h3>
            <p>Structured approach to mathematical reasoning and analytical thinking</p>
            <ul className="feature-points">
              <li>Step-by-step methodology</li>
              <li>Critical thinking development</li>
              <li>Competitive exam preparation</li>
            </ul>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon tech">
              <i className='bx bxs-devices'></i>
            </div>
            <h3>Modern Teaching</h3>
            <p>Technology-enhanced learning with digital resources and tools</p>
            <ul className="feature-points">
              <li>Digital learning platforms</li>
              <li>Interactive simulations</li>
              <li>Online assessments</li>
            </ul>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon mentor">
              <i className='bx bxs-user-voice'></i>
            </div>
            <h3>Expert Mentorship</h3>
            <p>Personalized guidance from experienced educators and subject experts</p>
            <ul className="feature-points">
              <li>Individual attention</li>
              <li>Career guidance</li>
              <li>Progress tracking</li>
            </ul>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon results">
              <i className='bx bxs-trophy'></i>
            </div>
            <h3>Proven Results</h3>
            <p>Track record of student success in board exams and competitive tests</p>
            <ul className="feature-points">
              <li>High success rates</li>
              <li>Top performers</li>
              <li>University admissions</li>
            </ul>
          </div>
          
          <div className="feature-box">
            <div className="feature-icon community">
              <i className='bx bxs-group'></i>
            </div>
            <h3>Learning Community</h3>
            <p>Collaborative environment that fosters peer learning and growth</p>
            <ul className="feature-points">
              <li>Group discussions</li>
              <li>Peer support</li>
              <li>Study groups</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
