import React from 'react';
import './HowItWorks.css';
import placeOrder1 from '../../assets/place-order1.png';
import placeOrder2 from '../../assets/place-order2.png';
import placeOrder3 from '../../assets/place-order3.png';

export default function HowItWorks() {
  const steps = [
    {
      image: placeOrder1,
      title: 'Open the app',
      description: 'Choose from over 7000 products across groceries, fresh fruits & veggies, meat, pet care, beauty items & more'
    },
    {
      image: placeOrder2,
      title: 'Place an order',
      description: 'Add your favourite items to the cart & avail the best offers'
    },
    {
      image: placeOrder3,
      title: 'Get free delivery',
      description: 'Experience lighting-fast speed & get all your items delivered in 10 minutes'
    }
  ];

  return (
    <section className="how-it-works-section">
      <h2 className="how-it-works-title">How it Works</h2>
      <div className="how-it-works-cards-container">
        {steps.map((step, index) => (
          <div className="how-it-works-card" key={index}>
            <div className="how-it-works-image-wrapper">
              <img src={step.image} alt={step.title} className="how-it-works-image" />
            </div>
            <h3 className="how-it-works-card-title">{step.title}</h3>
            <p className="how-it-works-card-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
