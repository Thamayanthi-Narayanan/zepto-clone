import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import { useCart } from '../../context/CartContext';
import { BASE_API_URL } from '../../api/apiConfig';
import product1 from '../../assets/product1.png';
import product2 from '../../assets/product2.png';
import product3 from '../../assets/product3.png';
import product4 from '../../assets/product4.png';
import product5 from '../../assets/product5.png';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
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

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <p>Loading product details...</p>
        </div>
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
  
  // Use local product images from assets folder - same logic as ProductListing
  const productImages = [product1, product2, product3, product4, product5];
  // Get the image index based on product ID (same as ProductListing logic)
  // Convert id to number and use modulo to cycle through images
  const productIdNum = parseInt(id) || 1;
  const imageIndex = (productIdNum - 1) % productImages.length;
  const mainProductImage = productImages[imageIndex];

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
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

