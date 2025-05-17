import React from 'react';

const LocationsSection: React.FC = () => {
  return (
    <section className="location container" id="location">
      <h2 className="heading">Locations</h2>
      <div className="location-content">
        <div className="location-box">
          <a href="https://maps.app.goo.gl/qsKVCFagZNmdqim49" target="_blank" rel="noopener noreferrer">
            <i className='bx bx-current-location'></i>
          </a>
          <h2>Uttarpara</h2>
          <p>Makhla, 2No Govt. Colony</p>
        </div>
        <div className="location-box">
          <a href="https://maps.app.goo.gl/SoGkgVi7RfgkxJvC8" target="_blank" rel="noopener noreferrer">
            <i className='bx bx-current-location'></i>
          </a>
          <h2>Hindmotor</h2>
          <p>Near water tank, Pearls of God</p>
        </div>
        <div className="location-box">
          <i className='bx bx-current-location'></i>
          <h2>Bally</h2>
          <p>Durgapur</p>
        </div>
        <div className="location-box">
          <i className='bx bx-current-location'></i>
          <h2>Konnagar</h2>
          <p>Criper Road</p>
        </div>
        <div className="location-box">
          <i className='bx bx-current-location'></i>
          <h2>Liluah</h2>
          <p>Don Bosco School</p>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;