import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { useCart } from '../../context/CartContext';
import { BASE_API_URL } from '../../api/apiConfig';
import Loader from '../../components/Loader/Loader';

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_ENDPOINT = `/api/products/${id}`;
        const FULL_API_URL = BASE_API_URL + API_ENDPOINT;

        const response = await fetch(FULL_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setProduct(result.data);
          // Debug: Log ALL product fields for beauty products
          if (result.data.id === 121 || result.data.id === 122) {
            console.log('Beauty Product - ALL Fields:', result.data);
          }
          // Debug: Log offers to check if they're coming from API
          console.log("Product data:", result.data);
          console.log("Product offers:", result.data.offers);
          console.log("Offers type:", typeof result.data.offers);
          console.log("Is array:", Array.isArray(result.data.offers));
        } else {
          throw new Error("Failed to fetch product: Data format incorrect.");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message || "Failed to fetch product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  // Check if product is in cart
  const isInCart = product ? cartItems.some(item => item.id === product.id) : false;

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <Loader size="medium" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error">
          <p>{error || "Product not found"}</p>
          <button onClick={() => navigate('/')} className="back-to-home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate netQty from unitType if not provided
  const netQty = product.netQty || `1 ${product.unitType || 'unit'}`;
  
  // Get the image based on category and product ID
  // Use product.id from API if available, otherwise use URL id
  const productIdNum = parseInt(product?.id) || parseInt(id) || 1;
  
  // Get category from product data - check multiple possible fields and normalize
  let productCategory = product?.category || product?.categoryName || product?.productCategory || product?.subcategoryName || 'all';
  // Normalize to lowercase for comparison
  productCategory = String(productCategory).toLowerCase().trim();
  
  // Special handling: If product ID is 21-40, it's definitely a home product
  if (productIdNum >= 21 && productIdNum <= 40) {
    productCategory = 'home';
  }
  // Special handling: If product ID is 41-60, it's definitely a toys product
  else if (productIdNum >= 41 && productIdNum <= 60) {
    productCategory = 'toys';
  }
  // Special handling: If product ID is 61-80, it's definitely a fresh product
  else if (productIdNum >= 61 && productIdNum <= 80) {
    productCategory = 'fresh';
  }
  // Special handling: If product ID is 81-100, it's definitely an electronics product
  else if (productIdNum >= 81 && productIdNum <= 100) {
    productCategory = 'electronics';
  }
  // Special handling: If product ID is 101-120, it's definitely a mobile product
  else if (productIdNum >= 101 && productIdNum <= 120) {
    productCategory = 'mobile';
  }
  // Special handling: If product ID is 121-140, it's definitely a beauty product
  // Beauty products: 121-140 (20 products, cycles through 20 images)
  else if (productIdNum >= 121 && productIdNum < 141) {
    productCategory = 'beauty';
  }
  // Special handling: If product ID is 141 or above, it's definitely a fashion product
  else if (productIdNum >= 141) {
    productCategory = 'fashion';
  }
  // If category is still 'all' but product name suggests category, set it
  else if (productCategory === 'all' && product?.productName) {
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
  
  const mainProductImage = getProductImage(productCategory, productIdNum);
  
  // Debug: Log image path for beauty products
  if (productIdNum === 121 || productIdNum === 122) {
    console.log('Beauty Product Image Debug:', {
      productId: productIdNum,
      category: productCategory,
      imagePath: mainProductImage,
      productData: {
        category: product?.category,
        categoryName: product?.categoryName,
        productCategory: product?.productCategory
      }
    });
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-link">{product.categoryName}</span>
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-current">{product.productName}</span>
      </div>

      <div className="product-detail-container">
        {/* Left Side - Main Image */}
        <div className="product-images-section">
          <div className="product-main-image">
            <img
              src={mainProductImage}
              alt={product.productName}
              className="main-image"
              onError={(e) => {
                const currentSrc = e.target.src;
                // If beauty .webp.webp fails, try .webp, then .png
                if (currentSrc.includes('beauty-product') && currentSrc.includes('.webp')) {
                  // If beauty .webp fails, try .png
                  const imageNumber = ((productIdNum - 121) % 20) + 1;
                  e.target.src = `/product/beauty-product${imageNumber}.png`;
                } else if (currentSrc.includes('home-product') && currentSrc.includes('.webp')) {
                  // If home .webp fails, try .png
                  const imageNumber = ((productIdNum - 21) % 20) + 1;
                  e.target.src = `/product/home-product${imageNumber}.png`;
                } else if (currentSrc.includes('fresh-product') && currentSrc.includes('.webp')) {
                  // If fresh .webp fails, try .png
                  const imageNumber = ((productIdNum - 61) % 20) + 1;
                  e.target.src = `/product/fresh-product${imageNumber}.png`;
                } else if (currentSrc.includes('toys-product') && currentSrc.includes('.webp')) {
                  // If toys .webp fails, try .png
                  const imageNumber = ((productIdNum - 41) % 20) + 1;
                  e.target.src = `/product/toys-product${imageNumber}.png`;
                } else if (currentSrc.includes('electronics-product') && currentSrc.includes('.webp')) {
                  // If electronics .webp fails, try .png
                  const imageNumber = ((productIdNum - 81) % 20) + 1;
                  e.target.src = `/product/electronics-product${imageNumber}.png`;
                } else if (currentSrc.includes('mobile-product') && currentSrc.includes('.webp')) {
                  // If mobile .webp fails, try .png
                  const imageNumber = ((productIdNum - 101) % 20) + 1;
                  e.target.src = `/product/mobile-product${imageNumber}.png`;
                } else if (currentSrc.includes('fashion-product') && currentSrc.includes('.webp')) {
                  // If fashion .webp fails, try .png
                  const imageNumber = ((productIdNum - 141) % 20) + 1;
                  e.target.src = `/product/fashion-product${imageNumber}.png`;
                } else if (currentSrc.includes('.png') && !currentSrc.includes('.png.png')) {
                  // For non-category products, try .png.png
                  e.target.src = `/product/product${productIdNum}.png.png`;
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
          </div>
        </div>

        {/* Right Side - Product Details */}
        <div className="product-info-section">
          <div className="product-header">
            <div className="product-title-wrapper">
              {product.highlight && (
                <span className="product-highlight-badge">{product.highlight}</span>
              )}
              <h1 className="product-name">{product.productName}</h1>
            </div>
          </div>

          {/* Brand */}
          {product.brand && (
            <div className="product-brand">
              Brand: <span className="brand-name">{product.brand}</span>
            </div>
          )}

          {/* Rating and Reviews */}
          {product.rating && (
            <div className="product-rating-section">
              <div className="product-rating">
                <span className="rating-star">★</span>
                <span className="rating-value">{product.rating}</span>
                {product.totalReviews && (
                  <span className="rating-reviews">({product.totalReviews.toLocaleString()} reviews)</span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="product-description">
              <p>{product.description}</p>
            </div>
          )}

          {/* Category and Subcategory */}
          <div className="product-category-info">
            {product.categoryName && (
              <span className="category-tag">{product.categoryName}</span>
            )}
            {product.subcategoryName && (
              <span className="category-tag">{product.subcategoryName}</span>
            )}
          </div>

          <div className="product-net-qty">
            Net Qty: {netQty}
          </div>

          <div className="product-price-section">
            <div className="price-row">
              <div className="product-price-box">
                ₹{product.price}
              </div>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="product-mrp">₹{product.mrp}</span>
                  {product.discountPercentage && (
                    <span className="product-discount">{product.discountPercentage}% OFF</span>
                  )}
                </>
              )}
            </div>
            <div className="product-mrp-info">
              MRP (incl. of all taxes)
            </div>
          </div>

          {/* Distributor */}
          {product.distributorName && (
            <div className="product-distributor">
              <span className="distributor-label">Distributor:</span>
              <span className="distributor-name">{product.distributorName}</span>
            </div>
          )}

          {/* Coupons & Offers Section */}
          <div className="coupons-offers-section">
            <h3 className="coupons-title">Coupons & Offers</h3>
            {product.offers && Array.isArray(product.offers) && product.offers.length > 0 ? (
              <div className="offers-list">
                {product.offers.map((offer, index) => (
                  <div key={index} className="offer-item">
                    <span className="offer-text">{offer}</span>
                    <span className="offer-arrow">›</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-offers-message">
                <p>No offers available at the moment</p>
              </div>
            )}
          </div>

          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${isInCart ? 'disabled' : ''}`} 
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

