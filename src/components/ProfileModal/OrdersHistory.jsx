import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './OrdersHistory.css';
import { X, CheckCircle, DotsThreeVertical, MagnifyingGlass } from '@phosphor-icons/react';
import { BASE_API_URL } from '../../api/apiConfig';
import { useCart } from '../../context/CartContext';
import Loader from '../Loader/Loader';

// Image utility - beauty, home, and fresh products use .webp, others use .png
const getProductImage = (productCategory, productId) => {
  // Normalize category to lowercase
  const normalizedCategory = String(productCategory || '').toLowerCase().trim();
  
  // If beauty category, map product IDs to available images (1-20)
  // Product ID 121 → image 1, ID 122 → image 2, ..., ID 140 → image 20, then cycle
  // All beauty products start from ID 121
  if (normalizedCategory === 'beauty') {
    // Map product ID to image number (1-20)
    // For ID 121 → 1, ID 122 → 2, ..., ID 140 → 20, ID 141 → 1, etc.
    const imageNumber = ((productId - 121) % 20) + 1;
    return `/product/beauty-product${imageNumber}.webp`;
  }
  
  // If home category, map product IDs to available images (1-20)
  // Product ID 21 → image 1, ID 22 → image 2, ..., ID 40 → image 20, then cycle
  if (normalizedCategory === 'home') {
    const imageNumber = ((productId - 21) % 20) + 1;
    return `/product/home-product${imageNumber}.webp`;
  }
  
  // If fresh category, map product IDs to available images (1-20)
  // Product ID 61 → image 1, ID 62 → image 2, ..., ID 80 → image 20, then cycle
  if (normalizedCategory === 'fresh') {
    const imageNumber = ((productId - 61) % 20) + 1;
    return `/product/fresh-product${imageNumber}.webp`;
  }
  
  // If toys category, map product IDs to available images (1-20)
  // Product ID 41 → image 1, ID 42 → image 2, ..., ID 60 → image 20, then cycle
  if (normalizedCategory === 'toys') {
    const imageNumber = ((productId - 41) % 20) + 1;
    return `/product/toys-product${imageNumber}.webp`;
  }
  
  // If electronics category, map product IDs to available images (1-20)
  // Product ID 81 → image 1, ID 82 → image 2, ..., ID 100 → image 20, then cycle
  if (normalizedCategory === 'electronics') {
    const imageNumber = ((productId - 81) % 20) + 1;
    return `/product/electronics-product${imageNumber}.webp`;
  }
  
  // If mobile category, map product IDs to available images (1-20)
  // Product ID 101 → image 1, ID 102 → image 2, ..., ID 120 → image 20, then cycle
  if (normalizedCategory === 'mobile') {
    const imageNumber = ((productId - 101) % 20) + 1;
    return `/product/mobile-product${imageNumber}.webp`;
  }
  
  // If fashion category, map product IDs to available images (1-20)
  // Product ID 141 → image 1, ID 142 → image 2, ..., ID 160 → image 20, then cycle
  if (normalizedCategory === 'fashion') {
    const imageNumber = ((productId - 141) % 20) + 1;
    return `/product/fashion-product${imageNumber}.webp`;
  }
  
  // For all other products, use product{id}.png
  return `/product/product${productId}.png`;
};

export default function OrdersHistory() {
  const { addToCart, setToastMessage, setShowToast, fetchCartItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [reorderingOrderId, setReorderingOrderId] = useState(null);


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
                const productId = item.productId || item.id || 1;
                // Get category from product data (same logic as ProductListing)
                let productCategory = item.category || item.categoryName || item.productCategory || item.subcategoryName || 'all';
                // Normalize to lowercase
                productCategory = String(productCategory).toLowerCase().trim();
                
                // Special handling: If product ID is 21-40, it's definitely a home product
                if (productId >= 21 && productId <= 40) {
                  productCategory = 'home';
                }
                // Special handling: If product ID is 41-60, it's definitely a toys product
                else if (productId >= 41 && productId <= 60) {
                  productCategory = 'toys';
                }
                // Special handling: If product ID is 61-80, it's definitely a fresh product
                else if (productId >= 61 && productId <= 80) {
                  productCategory = 'fresh';
                }
                // Special handling: If product ID is 81-100, it's definitely an electronics product
                else if (productId >= 81 && productId <= 100) {
                  productCategory = 'electronics';
                }
                // Special handling: If product ID is 101-120, it's definitely a mobile product
                else if (productId >= 101 && productId <= 120) {
                  productCategory = 'mobile';
                }
                // Special handling: If product ID is 121-140, it's definitely a beauty product
                // Beauty products: 121-140 (20 products, cycles through 20 images)
                else if (productId >= 121 && productId < 141) {
                  productCategory = 'beauty';
                }
                // Special handling: If product ID is 141 or above, it's definitely a fashion product
                else if (productId >= 141) {
                  productCategory = 'fashion';
                }
                // If category is still 'all' but product name suggests category, set it
                else if (productCategory === 'all' && (item.productName || item.name)) {
                  const productNameLower = String(item.productName || item.name || '').toLowerCase();
                  if (productNameLower.includes('beauty') || productNameLower.includes('cosmetic') || productNameLower.includes('makeup') || productNameLower.includes('lipstick') || productNameLower.includes('maybelline')) {
                    productCategory = 'beauty';
                  } else if (productNameLower.includes('home') || productNameLower.includes('furniture') || productNameLower.includes('decor')) {
                    productCategory = 'home';
                  } else if (productNameLower.includes('fresh') || productNameLower.includes('vegetable') || productNameLower.includes('fruit') || productNameLower.includes('grocery')) {
                    productCategory = 'fresh';
                  } else if (productNameLower.includes('toy') || productNameLower.includes('toy') || productNameLower.includes('game') || productNameLower.includes('play')) {
                    productCategory = 'toys';
                  } else if (productNameLower.includes('electronic') || productNameLower.includes('laptop') || productNameLower.includes('tablet') || productNameLower.includes('device')) {
                    productCategory = 'electronics';
                  } else if (productNameLower.includes('mobile') || productNameLower.includes('phone') || productNameLower.includes('smartphone')) {
                    productCategory = 'mobile';
                  } else if (productNameLower.includes('fashion') || productNameLower.includes('clothing') || productNameLower.includes('apparel') || productNameLower.includes('wear') || productNameLower.includes('dress') || productNameLower.includes('shirt') || productNameLower.includes('pant')) {
                    productCategory = 'fashion';
                  }
                }
                
                return {
                  id: productId,
                  image: getProductImage(productCategory, productId)
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

  const handleOrderAgain = async (orderId) => {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      setToastMessage('Please login to reorder');
      setShowToast(true);
      return;
    }

    setReorderingOrderId(orderId);

    try {
      // Fetch order details by Order ID
      const GET_ORDER_URL = BASE_API_URL + `/api/orders/${orderId}`;
      console.log("Fetching order details - URL:", GET_ORDER_URL);

      const response = await fetch(GET_ORDER_URL, {
        method: "GET",
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
          console.error("Failed to parse error response:", jsonError);
        }

        if (response.status === 401) {
          setToastMessage('Please login to reorder');
          setShowToast(true);
          localStorage.removeItem('authToken');
        } else if (response.status === 404) {
          setToastMessage('Order not found');
          setShowToast(true);
        } else if (response.status === 500) {
          setToastMessage(errorData.message || "Internal server error. Please try again later.");
          setShowToast(true);
        } else {
          setToastMessage(errorData.message || "Failed to fetch order details. Please try again.");
          setShowToast(true);
        }
        setReorderingOrderId(null);
        return;
      }

      const result = await response.json();
      console.log("Order details fetched:", result);

      // Check if order has products
      if (!result.products || result.products.length === 0) {
        setToastMessage('No products found in this order');
        setShowToast(true);
        setReorderingOrderId(null);
        return;
      }

      // Add each product to cart with correct quantity
      let addedCount = 0;
      let failedProducts = [];

      // Add all products to cart
      for (const product of result.products) {
        try {
          // Create product object matching cart format
          const productToAdd = {
            id: product.productId,
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            qty: 1, // addToCart adds one at a time
          };

          // Add product to cart (quantity) times
          // Note: addToCart adds one item at a time, so we call it multiple times for quantity
          for (let i = 0; i < product.quantity; i++) {
            try {
              await addToCart(productToAdd, true); // suppressToast = true
              addedCount++;
            } catch (err) {
              console.error(`Error adding product ${product.productId} to cart:`, err);
              failedProducts.push(product.productName);
            }
          }
        } catch (err) {
          console.error(`Error adding product ${product.productId} to cart:`, err);
          failedProducts.push(product.productName);
        }
      }

      // Refresh cart items to show newly added products
      await fetchCartItems();

      // Show final success message and open cart drawer
      if (addedCount > 0 && failedProducts.length === 0) {
        // Wait a bit to let individual toasts finish, then show final message
        setTimeout(() => {
          setToastMessage(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`);
          setShowToast(true);
          
          // Dispatch event to open cart drawer
          window.dispatchEvent(new CustomEvent('openCartDrawer'));
        }, 500);
      } else if (addedCount > 0 && failedProducts.length > 0) {
        setTimeout(() => {
          setToastMessage(`Added ${addedCount} items, but some failed. Please try again.`);
          setShowToast(true);
        }, 500);
      } else if (failedProducts.length > 0) {
        setTimeout(() => {
          setToastMessage('Failed to add items to cart. Please try again.');
          setShowToast(true);
        }, 500);
      }

    } catch (err) {
      console.error("Error reordering:", err);
      setToastMessage("Network error. Please try again.");
      setShowToast(true);
    } finally {
      setReorderingOrderId(null);
    }
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
        <Loader size="medium" />
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
                    <img 
                      src={product.image} 
                      alt={`Product ${index + 1}`}
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        // If beauty .webp.webp fails, try .webp, then .png
                        if (currentSrc.includes('beauty-product') && currentSrc.includes('.webp')) {
                          // If beauty .webp fails, try .png
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 121) % 20) + 1;
                          e.target.src = `/product/beauty-product${imageNumber}.png`;
                        } else if (currentSrc.includes('home-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 21) % 20) + 1;
                          e.target.src = `/product/home-product${imageNumber}.png`;
                        } else if (currentSrc.includes('fresh-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 61) % 20) + 1;
                          e.target.src = `/product/fresh-product${imageNumber}.png`;
                        } else if (currentSrc.includes('toys-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 41) % 20) + 1;
                          e.target.src = `/product/toys-product${imageNumber}.png`;
                        } else if (currentSrc.includes('electronics-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 81) % 20) + 1;
                          e.target.src = `/product/electronics-product${imageNumber}.png`;
                        } else if (currentSrc.includes('mobile-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 101) % 20) + 1;
                          e.target.src = `/product/mobile-product${imageNumber}.png`;
                        } else if (currentSrc.includes('fashion-product') && currentSrc.includes('.webp')) {
                          const productId = product.id || 1;
                          const imageNumber = ((productId - 141) % 20) + 1;
                          e.target.src = `/product/fashion-product${imageNumber}.png`;
                        } else if (currentSrc.includes('.png') && !currentSrc.includes('.png.png')) {
                          // For non-category products, try .png.png
                          const productId = product.id || 1;
                          e.target.src = `/product/product${productId}.png.png`;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="order-product-image">
                  <img 
                    src={getProductImage('all', 1)} 
                    alt="Product"
                    onError={(e) => {
                      if (e.target.src.includes('.png') && !e.target.src.includes('.png.png')) {
                        e.target.src = `/product/product1.png.png`;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              {order.status === 'cancelled' ? (
                <button 
                  className="order-again-btn"
                  onClick={() => handleOrderAgain(order.orderId || order.id)}
                  disabled={reorderingOrderId === (order.orderId || order.id)}
                >
                  {reorderingOrderId === (order.orderId || order.id) ? 'Adding to Cart...' : 'Order Again'}
                </button>
              ) : (
                <>
                  <button 
                    className="rate-order-btn"
                    onClick={() => handleRateOrder(order.orderId || order.id)}
                  >
                    Rate Order
                  </button>
                  <button 
                    className="order-again-btn"
                    onClick={() => handleOrderAgain(order.orderId || order.id)}
                    disabled={reorderingOrderId === (order.orderId || order.id)}
                  >
                    {reorderingOrderId === (order.orderId || order.id) ? 'Adding to Cart...' : 'Order Again'}
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

