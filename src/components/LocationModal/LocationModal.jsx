import React, { useState, useEffect, useRef } from 'react';
import { X, MagnifyingGlass, MapPin, Plus, CaretRight } from '@phosphor-icons/react';
import { BASE_API_URL } from '../../api/apiConfig';
import './LocationModal.css';

export default function LocationModal({ isOpen, onClose, onLocationSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });
  const searchInputRef = useRef(null);

  // Load saved addresses from API
  useEffect(() => {
    if (isOpen) {
      fetchSavedAddresses();
      setShowAddForm(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchSavedAddresses = async () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!authToken || !userId) {
      // User not logged in - show empty or localStorage addresses
      loadLocalAddresses();
      return;
    }

    setIsLoadingAddresses(true);

    try {
      const GET_ADDRESSES_URL = BASE_API_URL + `/api/address/${userId}`;
      
      const response = await fetch(GET_ADDRESSES_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data)) {
          // Map API response to our format
          const mappedAddresses = result.data.map((addr) => ({
            id: addr.addressId,
            label: addr.addressType === 'HOME' ? 'Home' : addr.addressType === 'WORK' ? 'Work' : 'Other',
            address: `${addr.addressLine1}, ${addr.addressLine2 || ''}, ${addr.landmark ? 'Near ' + addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`,
            shortAddress: `${addr.addressLine1}, ${addr.city}`,
            addressDetails: {
              addressLine1: addr.addressLine1,
              addressLine2: addr.addressLine2,
              landmark: addr.landmark,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
              addressType: addr.addressType,
            },
            isDefault: addr.defaultAddress,
          }));
          setSavedAddresses(mappedAddresses);
        } else {
          loadLocalAddresses();
        }
      } else {
        loadLocalAddresses();
      }
    } catch (err) {
      console.error("Error fetching saved addresses:", err);
      loadLocalAddresses();
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const loadLocalAddresses = () => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      try {
        setSavedAddresses(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading local addresses:', err);
      }
    }
  };

  // Get current location using browser geolocation (FREE)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use free Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'ZeeptoApp/1.0' // Required by Nominatim
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to get address');
          }

          const data = await response.json();
          
          if (data && data.address) {
            const address = formatAddress(data);
            const locationData = {
              coordinates: { lat: latitude, lng: longitude },
              address: address.fullAddress,
              shortAddress: address.shortAddress,
              addressDetails: address,
            };

            // Save and use location
            onLocationSelect(locationData);
            onClose();
          } else {
            alert('Could not find address for your location');
          }
        } catch (error) {
          console.error('Error getting address:', error);
          alert('Failed to get address. Please try again or add address manually.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please allow location access or add address manually.');
        setIsLoadingLocation(false);
      }
    );
  };

  // Format address from Nominatim response
  const formatAddress = (data) => {
    const addr = data.address || {};
    const parts = [];
    
    if (addr.house_number || addr.house_name) {
      parts.push(addr.house_number || addr.house_name);
    }
    if (addr.road) parts.push(addr.road);
    if (addr.suburb) parts.push(addr.suburb);
    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }
    if (addr.state) parts.push(addr.state);
    if (addr.postcode) parts.push(addr.postcode);

    const fullAddress = parts.join(', ');
    const shortAddress = [addr.road, addr.city || addr.town || addr.village].filter(Boolean).join(', ');

    return {
      fullAddress,
      shortAddress: shortAddress || fullAddress,
      addressLine1: [addr.house_number, addr.road].filter(Boolean).join(', '),
      addressLine2: addr.suburb || '',
      landmark: addr.landmark || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      pincode: addr.postcode || '',
    };
  };

  // Search address using free Nominatim
  const handleSearchAddress = async (query) => {
    if (!query.trim() || query.length < 3) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'ZeeptoApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // You can show suggestions here if needed
        return data;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle add new address
  const handleAddNewAddress = () => {
    setShowAddForm(true);
    setNewAddress({
      label: 'Home',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  // Save new address
  const handleSaveNewAddress = () => {
    if (!newAddress.addressLine1.trim() || !newAddress.city.trim() || !newAddress.pincode.trim()) {
      alert('Please fill in required fields (Address, City, Pincode)');
      return;
    }

    const fullAddress = [
      newAddress.addressLine1,
      newAddress.addressLine2,
      newAddress.landmark,
      newAddress.city,
      newAddress.state,
      newAddress.pincode,
    ].filter(Boolean).join(', ');

    const addressData = {
      id: Date.now(),
      label: newAddress.label,
      address: fullAddress,
      shortAddress: `${newAddress.addressLine1}, ${newAddress.city}`,
      addressDetails: newAddress,
    };

    // Save to localStorage
    const updated = [...savedAddresses, addressData];
    localStorage.setItem('savedAddresses', JSON.stringify(updated));
    setSavedAddresses(updated);
    setShowAddForm(false);

    // Select this address
    onLocationSelect({
      address: fullAddress,
      shortAddress: addressData.shortAddress,
      addressDetails: newAddress,
    });
    onClose();
  };

  // Select saved address
  const handleSelectSavedAddress = (address) => {
    onLocationSelect({
      address: address.address,
      shortAddress: address.shortAddress,
      addressDetails: address.addressDetails,
    });
    onClose();
  };

  // Delete saved address
  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this address?')) {
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      // If not logged in, delete from localStorage
      const updated = savedAddresses.filter(addr => addr.id !== id);
      localStorage.setItem('savedAddresses', JSON.stringify(updated));
      setSavedAddresses(updated);
      return;
    }

    try {
      const DELETE_ADDRESS_URL = BASE_API_URL + `/api/address/${id}`;
      const response = await fetch(DELETE_ADDRESS_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        // Refresh addresses from API
        fetchSavedAddresses();
      } else {
        alert('Failed to delete address. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="location-modal-close" onClick={onClose}>
          <X size={24} weight="bold" />
        </button>

        <h2 className="location-modal-title">Your Location</h2>

        {/* Search Bar */}
        <div className="location-search-wrapper">
          <MagnifyingGlass size={20} className="location-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search a new address"
            className="location-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                handleSearchAddress(searchTerm);
              }
            }}
          />
        </div>

        {/* Use Current Location Button */}
        <button
          className="location-current-btn"
          onClick={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          <MapPin size={20} weight="fill" />
          {isLoadingLocation ? 'Getting Location...' : 'Use My Current Location'}
        </button>

        {/* Add New Address Button */}
        <button className="location-add-new-btn" onClick={handleAddNewAddress}>
          <Plus size={20} weight="bold" />
          <span>Add New Address</span>
          <CaretRight size={20} weight="bold" />
        </button>

        {/* Saved Addresses - Show below Add New Address */}
        {!showAddForm && (
          <div className="location-saved-section">
            {isLoadingAddresses ? (
              <div className="location-loading">Loading addresses...</div>
            ) : savedAddresses.length > 0 ? (
              <>
                <h3 className="location-saved-title">Saved Addresses</h3>
                <div className="location-saved-list">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="location-saved-item"
                      onClick={() => handleSelectSavedAddress(address)}
                    >
                      <div className="saved-item-icon">
                        {address.label === 'Home' && '🏠'}
                        {address.label === 'Work' && '🏢'}
                        {address.label === 'Other' && '📍'}
                      </div>
                      <div className="saved-item-content">
                        <div className="saved-item-label">{address.label}</div>
                        <div className="saved-item-address">{address.address}</div>
                      </div>
                      <button
                        className="saved-item-delete"
                        onClick={(e) => handleDeleteAddress(address.id, e)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <div className="location-add-form">
            <div className="form-group">
              <label>Label</label>
              <select
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                placeholder="House/Flat No., Building Name"
              />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                placeholder="Street, Area"
              />
            </div>
            <div className="form-group">
              <label>Landmark</label>
              <input
                type="text"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                placeholder="Near..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="Pincode"
                maxLength="6"
              />
            </div>
            <div className="form-actions">
              <button className="form-cancel-btn" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button className="form-save-btn" onClick={handleSaveNewAddress}>
                Save Address
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
