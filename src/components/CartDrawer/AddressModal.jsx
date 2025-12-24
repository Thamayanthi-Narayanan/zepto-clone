import React, { useState } from 'react';
import './AddressModal.css';

export default function AddressModal({ isOpen, onClose }) {
  const [addressType, setAddressType] = useState('Home'); // Home, Work, Others
  const [buildingType, setBuildingType] = useState('Society'); // Society, Independent house, Standalone
  const [formData, setFormData] = useState({
    flatNo: '',
    buildingName: '',
    landmark: '',
    receiverName: '',
    receiverNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = () => {
    // TODO: Integrate with API later
    console.log('Saving address:', {
      addressType,
      buildingType,
      ...formData
    });
    // For now, just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="address-modal-close" onClick={onClose}>&times;</button>
        
        <h2 className="address-modal-title">Add Address Details</h2>
        
        <div className="address-modal-scrollable">
          {/* Save Address as */}
          <div className="address-section">
            <label className="address-section-label">Save Address as</label>
            <div className="address-option-buttons">
              <button
                className={`address-option-btn ${addressType === 'Home' ? 'active' : ''}`}
                onClick={() => setAddressType('Home')}
              >
                <span className={`address-option-icon ${addressType === 'Home' ? 'active' : ''}`}>🏠</span>
                Home
              </button>
              <button
                className={`address-option-btn ${addressType === 'Work' ? 'active' : ''}`}
                onClick={() => setAddressType('Work')}
              >
                <span className={`address-option-icon ${addressType === 'Work' ? 'active' : ''}`}>🏢</span>
                Work
              </button>
              <button
                className={`address-option-btn ${addressType === 'Others' ? 'active' : ''}`}
                onClick={() => setAddressType('Others')}
              >
                <span className={`address-option-icon ${addressType === 'Others' ? 'active' : ''}`}>📍</span>
                Others
              </button>
            </div>
          </div>

          {/* Type of Building */}
          <div className="address-section">
            <label className="address-section-label">Type of Building</label>
            <div className="address-option-buttons">
              <button
                className={`address-option-btn ${buildingType === 'Society' ? 'active' : ''}`}
                onClick={() => setBuildingType('Society')}
              >
                <span className={`address-option-icon ${buildingType === 'Society' ? 'active' : ''}`}>🏘️</span>
                Society
              </button>
              <button
                className={`address-option-btn ${buildingType === 'Independent house' ? 'active' : ''}`}
                onClick={() => setBuildingType('Independent house')}
              >
                <span className={`address-option-icon ${buildingType === 'Independent house' ? 'active' : ''}`}>🏡</span>
                Independent house
              </button>
              <button
                className={`address-option-btn ${buildingType === 'Standalone' ? 'active' : ''}`}
                onClick={() => setBuildingType('Standalone')}
              >
                <span className={`address-option-icon ${buildingType === 'Standalone' ? 'active' : ''}`}>🏬</span>
                Standalone
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="address-section">
            <div className="address-input-group">
              <label className="address-input-label">
                Flat No. / Floor <span className="required">*</span>
              </label>
              <input
                type="text"
                name="flatNo"
                value={formData.flatNo}
                onChange={handleInputChange}
                className="address-input"
                placeholder="Flat No. / Floor"
              />
            </div>

            <div className="address-input-group">
              <label className="address-input-label">
                Building name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleInputChange}
                className="address-input"
                placeholder="Building name"
              />
            </div>

            <div className="address-input-group">
              <label className="address-input-label">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                className="address-input"
                placeholder="Landmark"
              />
            </div>

            <div className="address-input-group">
              <label className="address-input-label">Receiver Name</label>
              <div className="address-input-wrapper">
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  className="address-input"
                  placeholder="Receiver Name"
                />
              </div>
            </div>

            <div className="address-input-group">
              <label className="address-input-label">+91 Receiver Number</label>
              <div className="address-input-wrapper">
                <input
                  type="tel"
                  name="receiverNumber"
                  value={formData.receiverNumber}
                  onChange={handleInputChange}
                  className="address-input"
                  placeholder="Receiver Number"
                  maxLength="10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="address-modal-footer">
          <button className="address-save-btn" onClick={handleSaveAddress}>
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}

