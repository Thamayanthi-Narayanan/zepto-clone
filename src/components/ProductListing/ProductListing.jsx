import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductListing.css';
import { BASE_API_URL } from "../../api/apiConfig";
import { useCart } from '../../context/CartContext';
import product1 from '../../assets/product1.png';
import product2 from '../../assets/product2.png';
import product3 from '../../assets/product3.png';
import product4 from '../../assets/product4.png';
import product5 from '../../assets/product5.png';

export default function ProductListing() {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_ENDPOINT = "/api/products/all";
  const FULL_API_URL = BASE_API_URL + API_ENDPOINT;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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
          console.error("API call successful but data not as expected:", result);
          setError("Failed to fetch products: Data format incorrect.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <section className="product-listing-section">Loading products...</section>;
  }

  if (error) {
    return <section className="product-listing-section">Error: {error}</section>;
  }

  // Array of product images
  const productImages = [product1, product2, product3, product4, product5];

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

          // Get image based on product index (cycle through if more than 5 products)
          const productImage = productImages[index % productImages.length];

          // Check if product is in cart
          const isInCart = cartItems.some(item => item.id === product.id);

          return (
          <div className="product-card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
            <div className="product-image-container">
              <img src={productImage} alt={product.productName} className="product-image" />
              <button 
                className={`add-button ${isInCart ? 'disabled' : ''}`} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (!isInCart) {
                    addToCart(product); 
                  }
                }}
                disabled={isInCart}
              >
                {isInCart ? 'ADDED' : 'ADD'}
              </button>
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
