import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductListing.css';
import { BASE_API_URL } from "../../api/apiConfig";
import { useCart } from '../../context/CartContext';
import Loader from '../Loader/Loader';
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
        console.log("Fetching products from:", FULL_API_URL);

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
          console.log(`Products fetched for category "${category}":`, result.data.length);
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

  // Array of product images (product1 to product20)
  const productImages = [
    product1, product2, product3, product4, product5,
    product6, product7, product8, product9, product10,
    product11, product12, product13, product14, product15,
    product16, product17, product18, product19, product20
  ];

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

          // Get image based on product ID (use product ID directly, fallback to index)
          const productId = product.id || (index + 1);
          const imageIndex = (parseInt(productId) - 1) % productImages.length;
          const productImage = productImages[imageIndex] || product1;

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
              <img src={productImage} alt={product.productName} className="product-image" />
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
