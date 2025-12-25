import React, { useState, useEffect } from 'react';
import './AddressModal.css';

export default function AddressModal({ isOpen, onClose, onSaveAddress }) {
  const [addressType, setAddressType] = useState('Home'); // Home, Work, Others
  const [buildingType, setBuildingType] = useState('Society'); // Society, Independent house, Standalone
  const [formData, setFormData] = useState({
    flatNo: '',
    buildingName: '',
    landmark: '',
    receiverName: '',
    receiverNumber: ''
  });
  const [errors, setErrors] = useState({});

  // Auto-fill receiver name and number from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const userName = localStorage.getItem('userName') || '';
      const userPhoneNumber = localStorage.getItem('userPhoneNumber') || '';
      
      setFormData(prev => ({
        ...prev,
        receiverName: userName,
        receiverNumber: userPhoneNumber
      }));
      
      // Clear errors when modal opens
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.flatNo.trim()) {
      newErrors.flatNo = 'Flat No. / Floor is required';
      isValid = false;
    }
    if (!formData.buildingName.trim()) {
      newErrors.buildingName = 'Building name is required';
      isValid = false;
    }
    if (!formData.landmark.trim()) {
      newErrors.landmark = 'Landmark is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveAddress = () => {
    if (!validateForm()) {
      return;
    }

    // TODO: Integrate with API later
    console.log('Saving address:', {
      addressType,
      buildingType,
      ...formData
    });
    
    // Close address modal and open payment modal
    onClose();
    if (onSaveAddress) {
      onSaveAddress();
    }
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
                className={`address-input ${errors.flatNo ? 'error' : ''}`}
                placeholder="Flat No. / Floor"
              />
              {errors.flatNo && <span className="address-error-message">{errors.flatNo}</span>}
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
                className={`address-input ${errors.buildingName ? 'error' : ''}`}
                placeholder="Building name"
              />
              {errors.buildingName && <span className="address-error-message">{errors.buildingName}</span>}
            </div>

            <div className="address-input-group">
              <label className="address-input-label">
                Landmark <span className="required">*</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                className={`address-input ${errors.landmark ? 'error' : ''}`}
                placeholder="Landmark"
              />
              {errors.landmark && <span className="address-error-message">{errors.landmark}</span>}
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
          <button 
            className="address-save-btn" 
            onClick={handleSaveAddress}
            disabled={!formData.flatNo.trim() || !formData.buildingName.trim() || !formData.landmark.trim()}
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}

