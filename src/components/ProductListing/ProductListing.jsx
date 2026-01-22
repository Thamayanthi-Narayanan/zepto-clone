import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductListing.css';
import { BASE_API_URL } from "../../api/apiConfig";
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

export default function ProductListing({ category = 'All' }) {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build API endpoint based on category
        let API_ENDPOINT;
        if (category === 'All' || !category) {
          API_ENDPOINT = "/api/products/all";
        } else {
          // Convert category name to lowercase for API endpoint
          const categoryName = category.toLowerCase();
          API_ENDPOINT = `/api/products/category/${categoryName}`;
        }
        
        const FULL_API_URL = BASE_API_URL + API_ENDPOINT;

        const response = await fetch(FULL_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          setError("Failed to fetch products: Data format incorrect.");
        }
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <section className="product-listing-section">
        <Loader size="medium" />
      </section>
    );
  }

  if (error) {
    return <section className="product-listing-section">Error: {error}</section>;
  }


  return (
    <section className="product-listing-section">
      <div className="product-listing-container">
        {products.map((product, index) => {
          const hasValidPrices =
            typeof product.mrp === "number" &&
            typeof product.price === "number" &&
            product.mrp > product.price;
          const discountAmount = hasValidPrices
            ? Math.round(product.mrp - product.price)
            : null;

          // Get image based on category and product ID
          const productId = product.id || (index + 1);
          // Get category from product data (not from props when showing "All")
          let productCategory = product.category || product.categoryName || product.productCategory || product.subcategoryName || 'all';
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
          else if (productCategory === 'all' && product.productName) {
            const productNameLower = String(product.productName).toLowerCase();
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
          
          const imageSrc = getProductImage(productCategory, productId);

          // Check if product is in cart and get quantity
          const cartItem = cartItems.find(item => item.id === product.id);
          const isInCart = !!cartItem;
          const quantity = cartItem?.qty || 0;

          // Handle quantity increase
          const handleIncrease = (e) => {
            e.stopPropagation();
            if (isInCart) {
              updateQuantity(product.id, quantity + 1);
            } else {
              addToCart(product);
            }
          };

          // Handle quantity decrease
          const handleDecrease = (e) => {
            e.stopPropagation();
            if (quantity > 1) {
              updateQuantity(product.id, quantity - 1);
            } else if (quantity === 1) {
              updateQuantity(product.id, 0); // This will remove from cart
            }
          };

          return (
          <div className="product-card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
            <div className="product-image-container">
              {imageSrc ? (
                <img 
                  src={imageSrc} 
                  alt={product.productName} 
                  className="product-image" 
                  loading="lazy"
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    // If beauty .webp.webp fails, try .webp, then .png
                    if (currentSrc.includes('beauty-product') && currentSrc.includes('.webp')) {
                      // If beauty .webp fails, try .png
                      const imageNumber = ((productId - 121) % 20) + 1;
                      e.target.src = `/product/beauty-product${imageNumber}.png`;
                    } else if (currentSrc.includes('home-product') && currentSrc.includes('.webp')) {
                      // If home .webp fails, try .png
                      const imageNumber = ((productId - 21) % 20) + 1;
                      e.target.src = `/product/home-product${imageNumber}.png`;
                    } else if (currentSrc.includes('fresh-product') && currentSrc.includes('.webp')) {
                      // If fresh .webp fails, try .png
                      const imageNumber = ((productId - 61) % 20) + 1;
                      e.target.src = `/product/fresh-product${imageNumber}.png`;
                    } else if (currentSrc.includes('toys-product') && currentSrc.includes('.webp')) {
                      // If toys .webp fails, try .png
                      const imageNumber = ((productId - 41) % 20) + 1;
                      e.target.src = `/product/toys-product${imageNumber}.png`;
                    } else if (currentSrc.includes('electronics-product') && currentSrc.includes('.webp')) {
                      // If electronics .webp fails, try .png
                      const imageNumber = ((productId - 81) % 20) + 1;
                      e.target.src = `/product/electronics-product${imageNumber}.png`;
                    } else if (currentSrc.includes('mobile-product') && currentSrc.includes('.webp')) {
                      // If mobile .webp fails, try .png
                      const imageNumber = ((productId - 101) % 20) + 1;
                      e.target.src = `/product/mobile-product${imageNumber}.png`;
                    } else if (currentSrc.includes('fashion-product') && currentSrc.includes('.webp')) {
                      // If fashion .webp fails, try .png
                      const imageNumber = ((productId - 141) % 20) + 1;
                      e.target.src = `/product/fashion-product${imageNumber}.png`;
                    } else if (currentSrc.includes('.png') && !currentSrc.includes('.png.png')) {
                      // For non-category products, try .png.png
                      e.target.src = `/product/product${productId}.png.png`;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
              ) : (
                <div className="product-image-placeholder">No Image</div>
              )}
              {isInCart && quantity > 0 ? (
                <div className="quantity-selector" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="qty-btn qty-decrease" 
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    className="qty-btn qty-increase" 
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button 
                  className="add-button" 
                  onClick={handleIncrease}
                >
                  ADD
                </button>
              )}
            </div>
            <div className="product-details">
              <div className="price-and-mrp">
                <div className="product-price-pill">
                  <span>₹{product.price}</span>
                </div>
                {product.mrp > 0 && <span className="mrp-price">₹{product.mrp}</span>}
              </div>
              {discountAmount && discountAmount > 0 && (
                <p className="discount-amount-text">₹{discountAmount} OFF</p>
              )}
              <h3 className="product-name">{product.productName}</h3>
              <p className="product-unit">{product.unitValue || product.unitType}</p>
              {product.rating && (
                <div className="product-rating-reviews">
                  <span className="star-icon"></span>
                  <span className="product-rating-value">{product.rating}</span>
                  <span className="product-total-reviews">({product.totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </section>
  );
}
