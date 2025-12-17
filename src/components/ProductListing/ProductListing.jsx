import React, { useState, useEffect } from 'react';
import './ProductListing.css';
import { BASE_API_URL } from "../../api/apiConfig";

export default function ProductListing() {
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

  return (
    <section className="product-listing-section">
      <div className="product-listing-container">
        {products.map((product) => {
          const hasValidPrices =
            typeof product.mrp === "number" &&
            typeof product.price === "number" &&
            product.mrp > product.price;
          const discountAmount = hasValidPrices
            ? Math.round(product.mrp - product.price)
            : null;

          return (
          <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img src={product.thumbnailUrl || 'placeholder.png'} alt={product.productName} className="product-image" />
              <button className="add-button">ADD</button>
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
