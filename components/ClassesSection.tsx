import React from 'react';

const ClassesSection: React.FC = () => {
  return (
    <section className="class container" id="class">
      <h2 className="heading">Class</h2>
      <div className="class-data">
        <h3>Get your class notes</h3>
        <a href="class.html" className="btn1">
          CLASS
          <i className='bx bx-chalkboard'></i>
        </a>
      </div>
    </section>
  );
};

export default ClassesSection;