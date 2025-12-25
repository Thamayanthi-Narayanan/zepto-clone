import React, { useState, useEffect } from 'react';
import './ProfileModal.css';
import { ShoppingBag, ChatCircle, Heart, MapPin, User, SignOut } from '@phosphor-icons/react';

export default function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('Orders');
  const [userName, setUserName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      const name = localStorage.getItem('userName') || '';
      const phone = localStorage.getItem('userPhoneNumber') || '';
      setUserName(name);
      setUserPhoneNumber(phone);
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoneNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('pendingPhoneNumber');
    localStorage.removeItem('pendingAuthToken');
    window.dispatchEvent(new Event('userLoggedIn')); // Trigger logout event
    onClose();
  };

  if (!isOpen) return null;

  const menuItems = [
    { id: 'Orders', label: 'Orders', icon: ShoppingBag },
    { id: 'Customer Support', label: 'Customer Support', icon: ChatCircle },
    { id: 'Manage Referrals', label: 'Manage Referrals', icon: Heart },
    { id: 'Address', label: 'Address', icon: MapPin },
    { id: 'Profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button className="profile-modal-close" onClick={onClose}>&times;</button>
        
        <div className="profile-modal-body">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            {/* User Info Section */}
            <div className="profile-user-info">
              <div className="profile-avatar">
                <User size={40} weight="fill" />
              </div>
              <div className="profile-user-details">
                <div className="profile-user-name">{userName || 'User'}</div>
                <div className="profile-user-phone">{userPhoneNumber || ''}</div>
              </div>
            </div>

            {/* Zepto Cash & Gift Card Section */}
            <div className="profile-cash-section">
              <div className="profile-cash-header">Zepto Cash & Gift Card</div>
              <div className="profile-cash-balance">Available Balance: ₹0</div>
              <button className="profile-add-balance-btn">Add Balance</button>
            </div>

            {/* Menu Items */}
            <div className="profile-menu-items">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`profile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <IconComponent size={20} weight={isActive ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Log Out Button */}
            <div className="profile-logout-section">
              <button className="profile-logout-btn" onClick={handleLogout}>
                <SignOut size={20} weight="regular" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="profile-content-area">
            {/* Empty for now - content will be added later */}
          </div>
        </div>
      </div>
    </div>
  );
}

