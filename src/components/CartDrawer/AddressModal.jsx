import React, { useState, useEffect } from 'react';
import './AddressModal.css';
import { BASE_API_URL } from '../../api/apiConfig';

export default function AddressModal({ isOpen, onClose, onSaveAddress }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressType, setAddressType] = useState('Home'); // Home, Work, Others
  const [buildingType, setBuildingType] = useState('Society'); // Society, Independent house, Standalone
  const [formData, setFormData] = useState({
    flatNo: '',
    buildingName: '',
    landmark: '',
    receiverName: '',
    receiverNumber: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch saved addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAddForm(false);
      setEditingAddressId(null);
      setSelectedAddressId(null);
      fetchSavedAddresses();
      
      const userName = localStorage.getItem('userName') || '';
      const userPhoneNumber = localStorage.getItem('userPhoneNumber') || '';
      
      // Reset form data but keep receiver name and number
      setFormData({
        flatNo: '',
        buildingName: '',
        landmark: '',
        receiverName: userName,
        receiverNumber: userPhoneNumber,
        city: '',
        state: '',
        pincode: ''
      });
      
      // Clear errors and API error when modal opens
      setErrors({});
      setApiError('');
    }
  }, [isOpen]);

  const fetchSavedAddresses = async () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!authToken || !userId) {
      // New user - show add form directly
      setShowAddForm(true);
      return;
    }

    setLoadingAddresses(true);

    try {
      const GET_ADDRESSES_URL = BASE_API_URL + `/api/address/${userId}`;
      console.log("Fetching saved addresses - URL:", GET_ADDRESSES_URL);

      const response = await fetch(GET_ADDRESSES_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          setShowAddForm(true);
        } else if (response.status === 404) {
          // No addresses found - show add form
          setSavedAddresses([]);
          setShowAddForm(true);
        } else {
          // Other errors - show add form as fallback
          setShowAddForm(true);
        }
        setLoadingAddresses(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log("Saved addresses fetched:", result.data);
        setSavedAddresses(result.data);
        // If addresses exist, show selection view; otherwise show add form
        if (result.data.length > 0) {
          setShowAddForm(false);
          // Auto-select default address if exists
          const defaultAddress = result.data.find(addr => addr.defaultAddress);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.addressId);
          }
        } else {
          setShowAddForm(true);
        }
      } else {
        setSavedAddresses([]);
        setShowAddForm(true);
      }
    } catch (err) {
      console.error("Error fetching saved addresses:", err);
      setSavedAddresses([]);
      setShowAddForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleUseSelectedAddress = () => {
    if (!selectedAddressId) {
      setApiError('Please select an address');
      return;
    }

    const selectedAddress = savedAddresses.find(addr => addr.addressId === selectedAddressId);
    if (selectedAddress && onSaveAddress) {
      // Store selected address and proceed
      localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
      onClose();
      onSaveAddress();
    }
  };

  const handleAddNewAddress = () => {
    setShowAddForm(true);
    setEditingAddressId(null);
    setSelectedAddressId(null);
    // Reset form
    const userName = localStorage.getItem('userName') || '';
    const userPhoneNumber = localStorage.getItem('userPhoneNumber') || '';
    setFormData({
      flatNo: '',
      buildingName: '',
      landmark: '',
      receiverName: userName,
      receiverNumber: userPhoneNumber,
      city: '',
      state: '',
      pincode: ''
    });
    setAddressType('Home');
    setBuildingType('Society');
    setErrors({});
    setApiError('');
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.addressId);
    setShowAddForm(true);
    setSelectedAddressId(null);
    
    // Map API addressType to form format
    const addressTypeMap = {
      'HOME': 'Home',
      'WORK': 'Work',
      'OTHERS': 'Others'
    };
    
    // Pre-fill form with existing address data
    setFormData({
      flatNo: address.addressLine1 || '',
      buildingName: address.addressLine2 || '',
      landmark: address.landmark || '',
      receiverName: localStorage.getItem('userName') || '',
      receiverNumber: localStorage.getItem('userPhoneNumber') || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || ''
    });
    
    setAddressType(addressTypeMap[address.addressType] || 'Home');
    setBuildingType('Society'); // Default, as this isn't stored in API
    setErrors({});
    setApiError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For pincode, only allow digits
    let processedValue = value;
    if (name === 'pincode') {
      processedValue = value.replace(/[^0-9]/g, '');
    }
    // For receiver number, only allow digits
    if (name === 'receiverNumber') {
      processedValue = value.replace(/[^0-9]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
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
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
      isValid = false;
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      return;
    }

    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      setApiError('Please login to save address');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Map addressType to API format (HOME, WORK, OTHERS)
      const addressTypeMap = {
        'Home': 'HOME',
        'Work': 'WORK',
        'Others': 'OTHERS'
      };

      const requestBody = {
        name: formData.receiverName.trim() || localStorage.getItem('userName') || '',
        mobileNumber: formData.receiverNumber.trim() || localStorage.getItem('userPhoneNumber') || '',
        addressLine1: formData.flatNo.trim(),
        addressLine2: formData.buildingName.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        addressType: addressTypeMap[addressType] || 'HOME',
        defaultAddress: editingAddressId ? false : true // Don't change default when editing
      };

      let API_URL;
      let method;
      
      if (editingAddressId) {
        // Update existing address
        API_URL = BASE_API_URL + `/api/address/update/${editingAddressId}`;
        method = "PUT";
        console.log("Updating address - URL:", API_URL);
      } else {
        // Add new address
        API_URL = BASE_API_URL + "/api/address/add";
        method = "POST";
        console.log("Adding address - URL:", API_URL);
      }
      
      console.log("Request body:", requestBody);

      const response = await fetch(API_URL, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
          console.error("API Error Response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }

        if (response.status === 401) {
          setApiError('Please login to save address');
          localStorage.removeItem('authToken');
        } else if (response.status === 400) {
          setApiError(errorData.message || 'Invalid address data. Please check all fields.');
        } else {
          setApiError(errorData.message || `Failed to ${editingAddressId ? 'update' : 'save'} address. Please try again.`);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        console.log(`Address ${editingAddressId ? 'updated' : 'added'} successfully:`, result.data);
        
        // Handle response structure: ADD returns 'id', GET returns 'addressId'
        // Normalize to 'addressId' for consistency
        let normalizedAddress = { ...result.data };
        if (normalizedAddress.id && !normalizedAddress.addressId) {
          normalizedAddress.addressId = normalizedAddress.id;
        }
        
        // Refresh addresses list
        await fetchSavedAddresses();
        
        // If editing, use the updated address; if adding, use the new address
        const addressToStore = normalizedAddress || savedAddresses.find(addr => addr.addressId === editingAddressId);
        if (addressToStore) {
          localStorage.setItem('selectedAddress', JSON.stringify(addressToStore));
        }
        
        // If this was called from checkout flow, proceed to payment
        if (onSaveAddress && !editingAddressId) {
          setLoading(false);
          onClose();
          onSaveAddress();
        } else {
          // If editing, go back to address selection
          setLoading(false);
          setShowAddForm(false);
          setEditingAddressId(null);
        }
      } else {
        setApiError(result.message || `Failed to ${editingAddressId ? 'update' : 'save'} address. Please try again.`);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error saving address:", err);
      setApiError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Address Selection View
  if (!showAddForm) {
    return (
      <div className="address-modal-overlay" onClick={onClose}>
        <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="address-modal-close" onClick={onClose}>&times;</button>
          
          <h2 className="address-modal-title">Select Delivery Address</h2>
          
          <div className="address-modal-scrollable">
            {loadingAddresses ? (
              <div className="address-loading">Loading addresses...</div>
            ) : savedAddresses.length > 0 ? (
              <>
                {savedAddresses.map((address) => {
                  const addressTypeIcon = {
                    'HOME': '🏠',
                    'WORK': '🏢',
                    'OTHERS': '📍'
                  };
                  const isSelected = selectedAddressId === address.addressId;
                  
                  return (
                    <div
                      key={address.addressId}
                      className={`address-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div 
                        className="address-card-clickable"
                        onClick={() => handleSelectAddress(address.addressId)}
                      >
                        <div className="address-card-header">
                          <span className="address-card-icon">{addressTypeIcon[address.addressType] || '📍'}</span>
                          <span className="address-card-type">{address.addressType}</span>
                          {address.defaultAddress && (
                            <span className="address-card-default">Default</span>
                          )}
                        </div>
                        <div className="address-card-body">
                          <div className="address-card-line">{address.addressLine1}</div>
                          <div className="address-card-line">{address.addressLine2}</div>
                          {address.landmark && (
                            <div className="address-card-line">Near {address.landmark}</div>
                          )}
                          <div className="address-card-line">
                            {address.city}, {address.state} - {address.pincode}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="address-card-check">✓</div>
                        )}
                      </div>
                      <button
                        className="address-card-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                        title="Edit address"
                      >
                        ✏️
                      </button>
                    </div>
                  );
                })}
                
                <button className="address-add-new-btn" onClick={handleAddNewAddress}>
                  <span className="address-add-icon">+</span>
                  Add New Address
                </button>
              </>
            ) : (
              <div className="address-empty-state">
                <div className="address-empty-icon">📍</div>
                <p className="address-empty-text">No saved addresses</p>
                <button className="address-add-new-btn" onClick={handleAddNewAddress}>
                  <span className="address-add-icon">+</span>
                  Add Address
                </button>
              </div>
            )}
          </div>

          {savedAddresses.length > 0 && (
            <div className="address-modal-footer">
              {apiError && <div className="address-api-error">{apiError}</div>}
              <button 
                className="address-save-btn" 
                onClick={handleUseSelectedAddress}
                disabled={!selectedAddressId}
              >
                Use Selected Address
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Add Address Form View
  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="address-modal-close" onClick={onClose}>&times;</button>
        <button className="address-back-btn" onClick={() => {
          setShowAddForm(false);
          setEditingAddressId(null);
          fetchSavedAddresses();
        }}>
          ← Back
        </button>
        
        <h2 className="address-modal-title">
          {editingAddressId ? 'Edit Address Details' : 'Add Address Details'}
        </h2>
        
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

            <div className="address-input-group">
              <label className="address-input-label">
                City <span className="required">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`address-input ${errors.city ? 'error' : ''}`}
                placeholder="City"
              />
              {errors.city && <span className="address-error-message">{errors.city}</span>}
            </div>

            <div className="address-input-group">
              <label className="address-input-label">
                State <span className="required">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`address-input ${errors.state ? 'error' : ''}`}
                placeholder="State"
              />
              {errors.state && <span className="address-error-message">{errors.state}</span>}
            </div>

            <div className="address-input-group">
              <label className="address-input-label">
                Pincode <span className="required">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className={`address-input ${errors.pincode ? 'error' : ''}`}
                placeholder="Pincode (6 digits)"
                maxLength="6"
              />
              {errors.pincode && <span className="address-error-message">{errors.pincode}</span>}
            </div>
          </div>
        </div>

        <div className="address-modal-footer">
          {apiError && <div className="address-api-error">{apiError}</div>}
          <button 
            className="address-save-btn" 
            onClick={handleSaveAddress}
            disabled={
              loading || 
              !formData.flatNo.trim() || 
              !formData.buildingName.trim() || 
              !formData.landmark.trim() ||
              !formData.city.trim() ||
              !formData.state.trim() ||
              !formData.pincode.trim()
            }
          >
            {loading ? (editingAddressId ? 'Updating...' : 'Saving...') : (editingAddressId ? 'Update Address' : 'Save Address')}
          </button>
        </div>
      </div>
    </div>
  );
}

