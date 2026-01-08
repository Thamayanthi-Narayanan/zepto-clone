import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './OrdersHistory.css';
import { X, CheckCircle, DotsThreeVertical, MagnifyingGlass } from '@phosphor-icons/react';
import { BASE_API_URL } from '../../api/apiConfig';
import product1 from '../../assets/product1.png';
import product2 from '../../assets/product2.png';
import product3 from '../../assets/product3.png';
import product4 from '../../assets/product4.png';
import product5 from '../../assets/product5.png';
import product6 from '../../assets/product6.png.png';
import product7 from '../../assets/product7.png.png';
import product8 from '../../assets/product8.png.png';
import product9 from '../../assets/product9.png.png';
import product10 from '../../assets/product10.png.png';
import product11 from '../../assets/product11.png.png';
import product12 from '../../assets/product12.png.png';
import product13 from '../../assets/product13.png.png';
import product14 from '../../assets/product14.png.png';
import product15 from '../../assets/product15.png.png';
import product16 from '../../assets/product16.png.png';
import product17 from '../../assets/product17.png.png';
import product18 from '../../assets/product18.png.png';
import product19 from '../../assets/product19.png.png';
import product20 from '../../assets/product20.png.png';

export default function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Product images array for mapping (product1 to product20)
  const productImages = [
    product1, product2, product3, product4, product5,
    product6, product7, product8, product9, product10,
    product11, product12, product13, product14, product15,
    product16, product17, product18, product19, product20
  ];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setLoading(false);
        setError('Please login to view orders');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ORDERS_URL = BASE_API_URL + "/api/orders";
        const response = await fetch(ORDERS_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please login to view orders');
            localStorage.removeItem('authToken');
          } else if (response.status === 404) {
            setOrders([]); // No orders found
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.message || 'Failed to fetch orders');
          }
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data)) {
          // Map API response to UI format
          const mappedOrders = result.data.map((order) => {
            // Map order status to UI status
            let status = 'delivered';
            let statusText = 'Order delivered';
            
            if (order.orderStatus === 'CANCELLED' || order.orderStatus === 'CANCELED') {
              status = 'cancelled';
              statusText = 'Order cancelled';
            } else if (order.orderStatus === 'PACKING') {
              status = 'delivered'; // Show as delivered for packing status
              statusText = order.deliveryStatusText || 'Order delivered';
            } else if (order.orderStatus === 'DELIVERED') {
              status = 'delivered';
              statusText = 'Order delivered';
            }

            // Format date - check if API provides date field, otherwise parse from orderId
            let formattedDate = '';
            
            // Helper function for day suffix
            const daySuffix = (day) => {
              if (day > 3 && day < 21) return 'th';
              switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
              }
            };
            
            // Helper function to format date
            const formatDate = (dateObj) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const formattedDay = dateObj.getDate();
              const ampm = dateObj.getHours() >= 12 ? 'pm' : 'am';
              const displayHour = dateObj.getHours() % 12 || 12;
              const displayMinute = String(dateObj.getMinutes()).padStart(2, '0');
              return `${formattedDay}${daySuffix(formattedDay)} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}, ${displayHour}:${displayMinute} ${ampm}`;
            };

            try {
              // Check if API provides a date field (createdAt, orderDate, placedAt, etc.)
              let orderDate = null;
              
              // Check various possible date fields
              if (order.createdAt) {
                orderDate = new Date(order.createdAt);
              } else if (order.orderDate) {
                orderDate = new Date(order.orderDate);
              } else if (order.placedAt) {
                orderDate = new Date(order.placedAt);
              } else if (order.date) {
                orderDate = new Date(order.date);
              } else if (order.timestamp) {
                orderDate = new Date(order.timestamp);
              } else if (order.orderTime) {
                orderDate = new Date(order.orderTime);
              }
              
              
              // If we have a valid date from API, use it
              if (orderDate && !isNaN(orderDate.getTime())) {
                formattedDate = formatDate(orderDate);
              } else {
                // Try to parse from orderId
                // Based on examples: "0501260025" = "28th Dec 2025, 10:48 am"
                // Format appears to be: MMDDYYHHMM or similar
                const orderId = order.orderId || '';
                
                if (orderId.length >= 10) {
                  // Try to parse date and time from orderId
                  // Since date is correct, we know one format works - need to fix time positions
                  let parsedDate = null;
                  
                  // Try Format: DDMMYYHHMM (most common Indian format)
                  // Date positions: 0-2 (day), 2-4 (month), 4-6 (year)
                  // Time positions might be: 6-8 (hour), 8-10 (minute) OR 4-6, 6-8 OR reversed
                  const day = orderId.substring(0, 2);
                  const month = orderId.substring(2, 4);
                  const year = '20' + orderId.substring(4, 6);
                  
                  // Try time at positions 6-8, 8-10 (standard)
                  let hour = orderId.substring(6, 8);
                  let minute = orderId.substring(8, 10);
                  
                  let testDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
                  
                  // If this creates invalid date or future date, try alternative time positions
                  if (isNaN(testDate.getTime()) || testDate > new Date()) {
                    // Try time at positions 4-6, 6-8 (time before year)
                    hour = orderId.substring(4, 6);
                    minute = orderId.substring(6, 8);
                    const yearAlt = '20' + orderId.substring(8, 10);
                    testDate = new Date(`${yearAlt}-${month}-${day}T${hour}:${minute}:00`);
                    
                    if (!isNaN(testDate.getTime()) && testDate <= new Date()) {
                      parsedDate = testDate;
                    }
                  } else if (testDate <= new Date()) {
                    parsedDate = testDate;
                  }
                  
                  // If still no valid date, try YYMMDD format
                  if (!parsedDate) {
                    const year2 = '20' + orderId.substring(0, 2);
                    const month2 = orderId.substring(2, 4);
                    const day2 = orderId.substring(4, 6);
                    hour = orderId.substring(6, 8);
                    minute = orderId.substring(8, 10);
                    
                    testDate = new Date(`${year2}-${month2}-${day2}T${hour}:${minute}:00`);
                    if (!isNaN(testDate.getTime()) && testDate <= new Date()) {
                      parsedDate = testDate;
                    } else {
                      // Try with time at different positions for YYMMDD
                      hour = orderId.substring(4, 6);
                      minute = orderId.substring(6, 8);
                      const day2Alt = orderId.substring(8, 10);
                      testDate = new Date(`${year2}-${month2}-${day2Alt}T${hour}:${minute}:00`);
                      if (!isNaN(testDate.getTime()) && testDate <= new Date()) {
                        parsedDate = testDate;
                      }
                    }
                  }
                  
                  if (parsedDate) {
                    formattedDate = formatDate(parsedDate);
                  } else {
                    // If still no date, use current date/time as fallback
                    formattedDate = formatDate(new Date());
                  }
                } else {
                  // If orderId is too short, use current date/time
                  formattedDate = formatDate(new Date());
                }
              }
            } catch (e) {
              console.error("Error formatting date:", e);
              // Use current date as fallback
              formattedDate = formatDate(new Date());
            }

            // Get product images and names (all items)
            let productImagesList = [];
            let productNamesList = [];
            if (order.items && Array.isArray(order.items) && order.items.length > 0) {
              // Show all items
              productImagesList = order.items.map((item) => {
                const productId = item.productId || 1;
                const imageIndex = (parseInt(productId) - 1) % productImages.length;
                return {
                  id: productId,
                  image: productImages[imageIndex]
                };
              });
              
              // Extract product names for search
              productNamesList = order.items.map((item) => 
                item.productName || item.name || ''
              ).filter(name => name);
            }

            return {
              id: order.orderId,
              orderId: order.orderId,
              status: status,
              statusText: statusText,
              date: formattedDate,
              price: order.billSummary?.grandTotal || 0,
              products: productImagesList,
              productNames: productNamesList, // Add product names for search
            };
          });

          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Debounce search term (wait 300ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter orders based on search term (using useMemo for performance)
  const filteredOrders = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return orders; // Return all orders if search is empty
    }

    const searchLower = debouncedSearchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      // Search in orderId
      if (order.orderId?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in date
      if (order.date?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in price
      if (order.price?.toString().includes(searchLower)) {
        return true;
      }

      // Search in status text
      if (order.statusText?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in product names
      if (order.productNames && order.productNames.length > 0) {
        const hasMatchingProduct = order.productNames.some(name =>
          name.toLowerCase().includes(searchLower)
        );
        if (hasMatchingProduct) {
          return true;
        }
      }
      
      return false;
    });
  }, [orders, debouncedSearchTerm]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  const handleOrderAgain = (orderId) => {
    console.log('Order again:', orderId);
    // TODO: Implement order again functionality
  };

  const handleRateOrder = (orderId) => {
    console.log('Rate order:', orderId);
    // TODO: Implement rate order functionality
  };

  const handleMenuClick = (orderId) => {
    console.log('Menu clicked for order:', orderId);
    // TODO: Implement menu functionality
  };

  if (loading) {
    return (
      <div className="orders-history-container">
        <div className="orders-loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-history-container">
        <div className="orders-error">{error}</div>
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="orders-history-container">
        <div className="orders-empty">No orders found</div>
      </div>
    );
  }

  return (
    <div className="orders-history-container">
      {/* Search Box */}
      <div className="orders-search-container">
        <div className="search-input-wrapper">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search orders by ID, date, price, or status..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
        {debouncedSearchTerm && (
          <div className="search-results-count">
            Found {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </div>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 && debouncedSearchTerm ? (
        <div className="orders-empty">
          No orders found matching "{debouncedSearchTerm}"
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-status-section">
                {order.status === 'cancelled' ? (
                  <X size={16} weight="bold" className="status-icon cancelled-icon" />
                ) : (
                  <CheckCircle size={16} weight="fill" className="status-icon delivered-icon" />
                )}
                <span className="order-status-text">{order.statusText}</span>
              </div>
              <div className="order-price-section">
                <span className="order-price">₹{order.price}</span>
                <button 
                  className="order-menu-btn"
                  onClick={() => handleMenuClick(order.id)}
                >
                  <DotsThreeVertical size={20} weight="bold" />
                </button>
              </div>
            </div>

            {/* Order Date */}
            <div className="order-date">
              Placed at {order.date}
            </div>

            {/* Product Images */}
            <div className="order-products">
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <div key={index} className="order-product-image">
                    <img src={product.image} alt={`Product ${index + 1}`} />
                  </div>
                ))
              ) : (
                <div className="order-product-image">
                  <img src={product1} alt="Product" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              {order.status === 'cancelled' ? (
                <button 
                  className="order-again-btn"
                  onClick={() => handleOrderAgain(order.id)}
                >
                  Order Again
                </button>
              ) : (
                <>
                  <button 
                    className="rate-order-btn"
                    onClick={() => handleRateOrder(order.id)}
                  >
                    Rate Order
                  </button>
                  <button 
                    className="order-again-btn"
                    onClick={() => handleOrderAgain(order.id)}
                  >
                    Order Again
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

