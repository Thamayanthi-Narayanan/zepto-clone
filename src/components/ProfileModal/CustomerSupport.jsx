import React, { useState } from 'react';
import { Envelope, ChatCircleDots, Phone } from '@phosphor-icons/react';
import './CustomerSupport.css';
import ChatInterface from './ChatInterface';

export default function CustomerSupport() {
  const [activeView, setActiveView] = useState('menu'); // 'menu' or 'chat'
  const [selectedOption, setSelectedOption] = useState(null);

  const handleContactUs = () => {
    setSelectedOption('contact');
    // TODO: Implement contact us functionality
    // This could open a contact form, email client, or navigate to a contact page
    console.log('Contact us clicked');
    // Example: window.location.href = 'mailto:support@zeepto.com';
    // Or: navigate('/contact');
  };

  const handleChatWithUs = () => {
    setSelectedOption('chat');
    setActiveView('chat');
  };

  const handleCallUs = () => {
    setSelectedOption('call');
    // TODO: Implement call functionality
    // This could initiate a phone call or open a call dialog
    console.log('Call us clicked');
    // Example: window.location.href = 'tel:+1234567890';
    // Or: Open call dialog
  };

  const handleCloseChat = () => {
    setActiveView('menu');
    setSelectedOption(null);
  };

  if (activeView === 'chat') {
    return <ChatInterface onClose={handleCloseChat} />;
  }

  return (
    <div className="customer-support-container">
      <div className="customer-support-header">
        <h2 className="customer-support-title">Customer Support</h2>
        <p className="customer-support-subtitle">How can we help you today?</p>
      </div>

      <div className="customer-support-buttons">
        <button 
          className={`customer-support-btn contact-btn ${selectedOption === 'contact' ? 'active' : ''}`}
          onClick={handleContactUs}
        >
          <div className="customer-support-btn-icon">
            <Envelope size={24} weight="fill" />
          </div>
          <div className="customer-support-btn-content">
            <div className="customer-support-btn-title">Contact Us</div>
            <div className="customer-support-btn-subtitle">Send us an email</div>
          </div>
        </button>

        <button 
          className={`customer-support-btn chat-btn ${selectedOption === 'chat' ? 'active' : ''}`}
          onClick={handleChatWithUs}
        >
          <div className="customer-support-btn-icon">
            <ChatCircleDots size={24} weight="fill" />
          </div>
          <div className="customer-support-btn-content">
            <div className="customer-support-btn-title">Chat with Us</div>
            <div className="customer-support-btn-subtitle">Start a chat conversation</div>
          </div>
        </button>

        <button 
          className={`customer-support-btn call-btn ${selectedOption === 'call' ? 'active' : ''}`}
          onClick={handleCallUs}
        >
          <div className="customer-support-btn-icon">
            <Phone size={24} weight="fill" />
          </div>
          <div className="customer-support-btn-content">
            <div className="customer-support-btn-title">Call Us</div>
            <div className="customer-support-btn-subtitle">Speak directly with our support team</div>
          </div>
        </button>
      </div>
    </div>
  );
}

