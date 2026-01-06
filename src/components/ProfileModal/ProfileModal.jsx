import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileModal.css';
import { ShoppingBag, ChatCircle, Heart, MapPin, User, SignOut, Trash } from '@phosphor-icons/react';
import { BASE_API_URL } from '../../api/apiConfig';
import { useCart } from '../../context/CartContext';
import OrdersHistory from './OrdersHistory';

export default function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { setToastMessage, setShowToast } = useCart();
  const [activeTab, setActiveTab] = useState('Orders');
  const [userName, setUserName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);

  // Icon mapping for menu items
  const iconMap = {
    'Order': ShoppingBag,
    'Orders': ShoppingBag,
    'Customer Support': ChatCircle,
    'Manage': Heart,
    'Referral': Heart,
    'Manage Referrals': Heart,
    'Address': MapPin,
    'Profile': User,
  };

  // Label mapping for menu items (to normalize API response)
  const labelMap = {
    'Order': 'Orders',
    'Manage': 'Manage Referrals',
    'Referral': 'Manage Referrals',
  };

  // Fetch profile menu items from API
  useEffect(() => {
    if (isOpen) {
      const name = localStorage.getItem('userName') || '';
      const phone = localStorage.getItem('userPhoneNumber') || '';
      setUserName(name);
      setUserPhoneNumber(phone);
      
      // Fetch menu items from API
      fetchProfileMenuItems();
    }
  }, [isOpen]);

  const fetchProfileMenuItems = async () => {
    setLoadingMenuItems(true);
    
    try {
      const PROFILE_URL = BASE_API_URL + "/api/profile";
      console.log("Fetching profile menu items - URL:", PROFILE_URL);

      const response = await fetch(PROFILE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        console.error("Error fetching profile menu items:", errorData);
        // Fallback to default menu items on error
        setMenuItems(getDefaultMenuItems());
        setLoadingMenuItems(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data && Array.isArray(result.data)) {
        // Process API response to handle "Manage" and "Referral" combination while preserving order
        const processedItems = [];
        const seenItems = new Set();
        
        // Check if both "Manage" and "Referral" exist
        const manageIndex = result.data.indexOf('Manage');
        const referralIndex = result.data.indexOf('Referral');
        const shouldCombine = manageIndex !== -1 && referralIndex !== -1;
        
        // Determine which comes first to combine at the correct position
        const combineAtIndex = shouldCombine ? Math.min(manageIndex, referralIndex) : -1;
        
        // Map API response items to menu items with icons, preserving order
        result.data.forEach((item, index) => {
          // Skip if already processed (part of combined item)
          if (seenItems.has(item)) {
            return;
          }
          
          // If this is the position where we should combine "Manage" and "Referral"
          if (shouldCombine && index === combineAtIndex) {
            processedItems.push({
              id: 'Manage Referrals',
              label: 'Manage Referrals',
              icon: Heart,
              originalApiValue: 'Manage Referrals'
            });
            seenItems.add('Manage');
            seenItems.add('Referral');
            return;
          }
          
          // Skip "Manage" or "Referral" if they're being combined
          if ((item === 'Manage' || item === 'Referral') && shouldCombine) {
            return;
          }
          
          // Normal mapping for other items
          const normalizedLabel = labelMap[item] || item;
          const icon = iconMap[item] || iconMap[normalizedLabel] || User;
          
          processedItems.push({
            id: normalizedLabel,
            label: normalizedLabel,
            icon: icon,
            originalApiValue: item
          });
        });
        
        console.log("Profile menu items fetched (preserving API order):", processedItems);
        setMenuItems(processedItems);
      } else {
        console.log("Profile API response not successful or invalid format:", result);
        // Fallback to default menu items
        setMenuItems(getDefaultMenuItems());
      }
    } catch (err) {
      console.error("Error fetching profile menu items:", err);
      // Fallback to default menu items on error
      setMenuItems(getDefaultMenuItems());
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const getDefaultMenuItems = () => {
    return [
      { id: 'Orders', label: 'Orders', icon: ShoppingBag },
      { id: 'Customer Support', label: 'Customer Support', icon: ChatCircle },
      { id: 'Manage Referrals', label: 'Manage Referrals', icon: Heart },
      { id: 'Address', label: 'Address', icon: MapPin },
      { id: 'Profile', label: 'Profile', icon: User },
    ];
  };

  const handleLogout = async () => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // No token, just clear local storage and close
      clearLocalStorage();
      window.dispatchEvent(new Event('userLoggedIn')); // Trigger logout event
      onClose();
      // Show toast notification
      setToastMessage("Logged out successfully");
      setShowToast(true);
      return;
    }

    setIsLoggingOut(true);

    try {
      const LOGOUT_URL = BASE_API_URL + "/api/auth/logout";
      const response = await fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse logout error response:", jsonError);
        }
        console.error("Logout API error:", errorData.message || `Status: ${response.status}`);
        // Even if API fails, clear local storage and log out locally
      } else {
        // Only parse JSON if response is OK
        try {
          const result = await response.json();
          if (result.success) {
            console.log("Logout successful");
          } else {
            console.error("Logout failed:", result.message);
          }
        } catch (jsonError) {
          console.error("Failed to parse logout response:", jsonError);
        }
      }
    } catch (err) {
      console.error("Error during logout:", err);
      // Even if API fails, clear local storage and log out locally
    } finally {
      // Always clear local storage and close modal, regardless of API response
      clearLocalStorage();
      window.dispatchEvent(new Event('userLoggedIn')); // Trigger logout event
      setIsLoggingOut(false);
      onClose();
      // Show toast notification
      setToastMessage("Logged out successfully");
      setShowToast(true);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoneNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('pendingPhoneNumber');
    localStorage.removeItem('pendingAuthToken');
  };

  const clearAllLocalStorage = () => {
    // Clear all user-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoneNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('pendingPhoneNumber');
    localStorage.removeItem('pendingAuthToken');
    localStorage.removeItem('selectedAddress');
    // Clear cart data if stored
    localStorage.removeItem('cartItems');
  };

  const handleDeleteAccount = async () => {
    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action is irreversible and will permanently delete all your data.'
    );

    if (!confirmDelete) {
      return;
    }

    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // No token, just clear all local storage and close
      clearAllLocalStorage();
      window.dispatchEvent(new Event('userLoggedIn')); // Trigger logout event to update navbar
      onClose();
      navigate('/');
      return;
    }

    setIsDeletingAccount(true);

    try {
      const DELETE_ACCOUNT_URL = BASE_API_URL + "/api/user/delete-account";
      const response = await fetch(DELETE_ACCOUNT_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            errorData = { message: text || `Error: ${response.status}` };
          }
        } catch (parseError) {
          console.error("Failed to parse delete account error response:", parseError);
          errorData = { message: `Error: ${response.status} ${response.statusText}` };
        }
        console.error("Delete account API error:", errorData.message || `Status: ${response.status}`);
        setToastMessage(errorData.message || "Failed to delete account. Please try again.");
        setShowToast(true);
        setIsDeletingAccount(false);
        return;
      }

      // Handle successful response (could be JSON or text)
      let result = null;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          // If response is text/plain, treat 200 OK as success
          const text = await response.text();
          console.log("Delete account response (text):", text);
          result = { success: true, message: "Account deleted successfully" };
        }
      } catch (parseError) {
        console.error("Failed to parse delete account response:", parseError);
        // If we can't parse but status is 200, treat as success
        result = { success: true, message: "Account deleted successfully" };
      }

      if (result && result.success) {
        console.log("Account deleted successfully");
        // Clear all local storage
        clearAllLocalStorage();
        // Close modal first
        onClose();
        // Show toast notification
        setToastMessage("Account deleted successfully");
        setShowToast(true);
        // Use setTimeout to ensure localStorage is cleared and React state updates
        setTimeout(() => {
          // Trigger logout event to update navbar immediately
          window.dispatchEvent(new Event('userLoggedIn'));
          // Navigate to home page
          navigate('/');
        }, 50);
      } else {
        console.error("Delete account failed:", result?.message);
        setToastMessage(result?.message || "Failed to delete account. Please try again.");
        setShowToast(true);
        setIsDeletingAccount(false);
      }
    } catch (err) {
      console.error("Error during account deletion:", err);
      setToastMessage("Network error. Please try again.");
      setShowToast(true);
      setIsDeletingAccount(false);
    }
  };

  if (!isOpen) return null;

  // Use default menu items if API hasn't loaded yet
  const displayMenuItems = menuItems.length > 0 ? menuItems : getDefaultMenuItems();

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
              {loadingMenuItems ? (
                <div className="profile-menu-loading">Loading menu items...</div>
              ) : (
                displayMenuItems.map((item) => {
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
                })
              )}
            </div>

            {/* Log Out Button */}
            <div className="profile-logout-section">
              <button 
                className="profile-logout-btn" 
                onClick={handleLogout}
                disabled={isLoggingOut || isDeletingAccount}
              >
                <SignOut size={20} weight="regular" />
                <span>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</span>
              </button>
            </div>

            {/* Delete Account Button */}
            <div className="profile-delete-account-section">
              <button 
                className="profile-delete-account-btn" 
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || isLoggingOut}
              >
                <Trash size={20} weight="regular" />
                <span>{isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="profile-content-area">
            {activeTab === 'Orders' && <OrdersHistory />}
            {activeTab !== 'Orders' && (
              <div className="profile-empty-content">
                <p>{activeTab} content coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

