import React from 'react';
import './Banners.css';
import banner1 from '../../assets/banner1.png';
import banner2 from '../../assets/banner2.png';

export default function Banners() {
  return (
    <section className="banners-section">
      <div className="banner-card banner-card-1">
        <div className="banner-image-container">
          <img src={banner1} alt="Cigarettes and accessories" className="banner-image" />
        </div>
      </div>

      <div className="banner-card banner-card-2">
        <div className="banner-image-container">
          <img src={banner2} alt="Zepto Experience" className="banner-image" />
        </div>
      </div>
    </section>
  );
}
