import React from "react";
import "./CartDrawer.css";
import { useCart } from '../../context/CartContext';
import { Trash } from '@phosphor-icons/react';

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

export default function CartDrawer({ isOpen, onClose, onOpenAddressModal }) {
  const { cartItems, updateQuantity, calculateTotals, removeFromCart } = useCart();
  const totals = calculateTotals();
  

  if (!isOpen) return null;

  // Show empty state if cart is empty
  if (cartItems.length === 0) {
    return (
      <>
        <div className="cart-overlay" onClick={onClose} />
        <aside className="cart-drawer">
          <header className="cart-header">
            <button className="cart-back-button" onClick={onClose}>
              ←
            </button>
            <span className="cart-title">Cart</span>
          </header>
          <div className="cart-empty-state">
            <div className="cart-empty-icon" />
            <p className="cart-empty-text">Your cart is empty</p>
            <button className="cart-browse-button" onClick={onClose}>
              Browse Products
            </button>
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-drawer">
        <header className="cart-header">
          <button className="cart-back-button" onClick={onClose}>
            ←
          </button>
          <span className="cart-title">Cart</span>
        </header>

        {/* Savings banner */}
        <div className="cart-savings-banner">
          <span className="cart-savings-text">
            Yay! You saved <strong>₹{Math.round(totals.totalSavingsOnOrder)}</strong> on this order
          </span>
        </div>

        {/* NO FEES card - only show when delivery fee is FREE */}
        {totals.deliveryFee === 0 && (
          <div className="cart-fees-card">
            <div className="cart-fees-left">
              <div className="cart-fees-icon">₹0</div>
              <div className="cart-fees-text">
                <div className="cart-fees-title">NO FEES</div>
                <div className="cart-fees-sub">
                  ₹0 Handling Fee · ₹0 Rain &amp; Surge Fee · ₹0 Delivery Fee above ₹200
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery row */}
        <div className="cart-delivery-row">
          <div className="cart-delivery-icon">⚡</div>
          <div className="cart-delivery-text">
            <div className="cart-delivery-title">Delivery in 6 mins</div>
          </div>
        </div>

        {/* Items list */}
        <div className="cart-items-list">
          {cartItems.map((item) => {
            const itemTotalPrice = item.price * item.qty;
            const itemTotalMRP = item.mrp * item.qty;
            // Get product image based on category and productId
            const productId = item.productId || item.id;
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
            else if (productCategory === 'all' && item.productName) {
              const productNameLower = String(item.productName).toLowerCase();
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
            
            const productImage = getProductImage(productCategory, productId);
            
            return (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-left">
                  <img
                    src={productImage}
                    alt={item.productName}
                    className="cart-item-image"
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
                </div>
                <div className="cart-item-middle">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="cart-item-unit">{item.unitValue || item.unitType}</div>
                </div>
                <div className="cart-item-right">
                  <div className="cart-item-top-row">
                    <div className="cart-item-qty">
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.qty - 1)}>−</button>
                      <span className="cart-qty-value">{item.qty}</span>
                      <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">₹{itemTotalPrice}</div>
                    <button 
                      className="cart-item-remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash size={18} weight="regular" />
                    </button>
                  </div>
                  <div className="cart-item-mrp">₹{itemTotalMRP}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missed something row just below items */}
        <div className="cart-missed-row">
          <span className="cart-missed-text">Missed something?</span>
          <button className="cart-add-more-btn">+ Add More Items</button>
        </div>

        {/* Coupons banner */}
        <div className="cart-coupons-card">
          <div className="cart-coupons-icon">% </div>
          <div className="cart-coupons-content">
            <div className="cart-coupons-title">
              You have unlocked <span className="cart-coupons-highlight">21 new coupons</span>
            </div>
            <div className="cart-coupons-subtitle">Explore Now</div>
          </div>
          <div className="cart-coupons-arrow">›</div>
        </div>

        {/* Bill summary */}
        <div className="cart-bill-card">
          <div className="cart-bill-header">
            <div className="cart-bill-icon">🧾</div>
            <div className="cart-bill-title">Bill summary</div>
          </div>
          <div className="cart-bill-row">
            <span className="cart-bill-label">Item Total</span>
            <span className="cart-bill-value">
              <span className="cart-bill-strike">₹{Math.round(totals.itemTotalMRP)}</span>
              <span className="cart-bill-main">₹{Math.round(totals.itemTotal)}</span>
            </span>
          </div>
          <div className="cart-bill-row">
            <span className="cart-bill-label">Handling Fee</span>
            <span className="cart-bill-value">
              <span className="cart-bill-strike">₹{totals.handlingFeeMRP}</span>
              <span className="cart-bill-free">FREE</span>
            </span>
          </div>
          <div className="cart-bill-row">
            <span className="cart-bill-label">Delivery Fee</span>
            <span className="cart-bill-value">
              {totals.deliveryFee === 0 ? (
                <>
                  <span className="cart-bill-strike">₹{totals.deliveryFeeMRP}</span>
                  <span className="cart-bill-free">FREE</span>
                </>
              ) : (
                <span className="cart-bill-main">₹{totals.deliveryFee}</span>
              )}
            </span>
          </div>
          <div className="cart-bill-total-row">
            <span className="cart-bill-total-label">To Pay</span>
            <span className="cart-bill-total-value">
              <span className="cart-bill-strike-light">₹{Math.round(totals.totalMRP)}</span>
              <span className="cart-bill-main">₹{Math.round(totals.totalToPay)}</span>
            </span>
          </div>
        </div>

        {/* Savings on this order */}
        <div className="cart-savings-card">
          <div className="cart-savings-left">
            <div className="cart-savings-title">Savings on this order</div>
          </div>
          <div className="cart-savings-badge">₹{Math.round(totals.totalSavingsOnOrder)}</div>
        </div>

        {/* Savings breakdown details */}
        <div className="cart-savings-detail-card">
          <div className="cart-savings-detail-row">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">%</div>
              <div className="cart-savings-detail-label">Discount on MRP</div>
            </div>
            <div className="cart-savings-detail-amount">₹{Math.round(totals.discountOnMRP)}</div>
          </div>
          <div className="cart-savings-detail-row">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">Z</div>
              <div className="cart-savings-detail-label">FREE delivery savings</div>
            </div>
            <div className="cart-savings-detail-amount">₹{totals.freeDeliverySavings}</div>
          </div>
          <div className="cart-savings-detail-row cart-savings-detail-row-last">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">₹</div>
              <div className="cart-savings-detail-label">Savings on Handling fee</div>
            </div>
            <div className="cart-savings-detail-amount">₹{totals.savingsOnHandlingFee}</div>
          </div>
        </div>

        {/* Delivery instructions / tips / safety card */}
        <div className="cart-delivery-info-card">
          <div className="cart-delivery-info-row">
            <div className="cart-delivery-info-left">
              <div className="cart-delivery-info-icon">💬</div>
              <div className="cart-delivery-info-text">
                <div className="cart-delivery-info-title">Delivery Instructions</div>
                <div className="cart-delivery-info-subtitle">
                  Delivery partner will be notified
                </div>
              </div>
            </div>
            <div className="cart-delivery-info-arrow">›</div>
          </div>

          <div className="cart-delivery-info-row">
            <div className="cart-delivery-info-left">
              <div className="cart-delivery-info-icon">💰</div>
              <div className="cart-delivery-info-text">
                <div className="cart-delivery-info-title">Delivery Partner Tip</div>
                <div className="cart-delivery-info-subtitle">
                  This amount goes to your delivery partner
                </div>
              </div>
            </div>
            <div className="cart-delivery-info-arrow">›</div>
          </div>

          <div className="cart-delivery-info-row cart-delivery-info-row-last">
            <div className="cart-delivery-info-left">
              <div className="cart-delivery-info-icon">🛡️</div>
              <div className="cart-delivery-info-text">
                <div className="cart-delivery-info-title">Delivery Partner’s Safety</div>
                <div className="cart-delivery-info-subtitle">
                  Learn more about how we ensure their safety
                </div>
              </div>
            </div>
            <div className="cart-delivery-info-arrow">›</div>
          </div>
        </div>

        {/* Bottom proceed button */}
        <div className="cart-bottom-section">
          <button 
            className="cart-proceed-btn"
            onClick={onOpenAddressModal}
          >
            Add Address to proceed
          </button>
        </div>
      </aside>
    </>
  );
}


