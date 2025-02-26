import React from 'react';
const AboutSection: React.FC = () => {
  return (
    <section className="about container" id="about">
      <h2 className="heading">About</h2>
      <div className="about-content">
        <div className="about-data">
          <span>About Me</span>
          <h2>Study with AIMS</h2>
          <a href="fees.html" className="btn">
            Select Course
            <i className='bx bx-select-multiple'></i>
          </a>
        </div>
        <div className="about-text">
          <p>Way to learn</p>
          <p>
            "Welcome to "AMIT INSTITUTE OF MATHS & SCIENCE", where science and mathematics come to life!
            Our center offers a dynamic learning environment for students of all ages to explore the wonders of science and mathematics.
            From captivating experiments to challenging problem-solving activities, our experienced instructors provide hands-on guidance
            to ignite curiosity and cultivate a deeper understanding of these fundamental subjects.
          </p>
          <p>
            Step into the realm of scientific exploration with me! As an experienced science and mathematics teacher,
            I've dedicated my career to igniting curiosity and fostering a deep understanding of the natural world.
            On this website, you'll find a treasure trove of educational resources, interactive lessons, and captivating experiments
            designed to inspire and empower both students and educators alike.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;