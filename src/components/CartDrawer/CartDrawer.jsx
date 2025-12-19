import React from "react";
import "./CartDrawer.css";

const mockCartItems = [
  {
    id: 1,
    name: "Surf Excel Matic Top Load Detergent Powder",
    unit: "1 pc (1 L)",
    price: 192,
    mrp: 225,
    qty: 1,
    imageUrl:
      "https://images.pexels.com/photos/7282400/pexels-photo-7282400.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "Surf Excel Matic Front Load Detergent Powder",
    unit: "1 pack (5 L)",
    price: 699,
    mrp: 858,
    qty: 1,
    imageUrl:
      "https://images.pexels.com/photos/7282278/pexels-photo-7282278.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    name: "Surf Excel Easy Wash Detergent Powder",
    unit: "1 pack (1.5 kg)",
    price: 198,
    mrp: 235,
    qty: 1,
    imageUrl:
      "https://images.pexels.com/photos/7282411/pexels-photo-7282411.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

export default function CartDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

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
            Yay! You saved <strong>₹269</strong> on this order
          </span>
        </div>

        {/* NO FEES card */}
        <div className="cart-fees-card">
          <div className="cart-fees-left">
            <div className="cart-fees-icon">₹0</div>
            <div className="cart-fees-text">
              <div className="cart-fees-title">NO FEES</div>
              <div className="cart-fees-sub">
                ₹0 Handling Fee · ₹0 Rain &amp; Surge Fee · ₹0 Delivery Fee above ₹99
              </div>
            </div>
          </div>
        </div>

        {/* Delivery row */}
        <div className="cart-delivery-row">
          <div className="cart-delivery-icon">⚡</div>
          <div className="cart-delivery-text">
            <div className="cart-delivery-title">Delivery in 6 mins</div>
          </div>
        </div>

        {/* Items list */}
        <div className="cart-items-list">
          {mockCartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-left">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item-image"
                />
              </div>
              <div className="cart-item-middle">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-unit">{item.unit}</div>
              </div>
              <div className="cart-item-right">
                <div className="cart-item-top-row">
                  <div className="cart-item-qty">
                    <button className="cart-qty-btn">−</button>
                    <span className="cart-qty-value">{item.qty}</span>
                    <button className="cart-qty-btn">+</button>
                  </div>
                  <div className="cart-item-price">₹{item.price}</div>
                </div>
                <div className="cart-item-mrp">₹{item.mrp}</div>
              </div>
            </div>
          ))}
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
              <span className="cart-bill-strike">₹1318</span>
              <span className="cart-bill-main">₹1121</span>
            </span>
          </div>
          <div className="cart-bill-row">
            <span className="cart-bill-label">Handling Fee</span>
            <span className="cart-bill-value">
              <span className="cart-bill-strike">₹10</span>
              <span className="cart-bill-free">FREE</span>
            </span>
          </div>
          <div className="cart-bill-row">
            <span className="cart-bill-label">Delivery Fee</span>
            <span className="cart-bill-value">
              <span className="cart-bill-strike">₹30</span>
              <span className="cart-bill-free">FREE</span>
            </span>
          </div>
          <div className="cart-bill-total-row">
            <span className="cart-bill-total-label">To Pay</span>
            <span className="cart-bill-total-value">
              <span className="cart-bill-strike-light">₹1358</span>
              <span className="cart-bill-main">₹1121</span>
            </span>
          </div>
        </div>

        {/* Savings on this order */}
        <div className="cart-savings-card">
          <div className="cart-savings-left">
            <div className="cart-savings-title">Savings on this order</div>
          </div>
          <div className="cart-savings-badge">₹237</div>
        </div>

        {/* Savings breakdown details */}
        <div className="cart-savings-detail-card">
          <div className="cart-savings-detail-row">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">%</div>
              <div className="cart-savings-detail-label">Discount on MRP</div>
            </div>
            <div className="cart-savings-detail-amount">₹197</div>
          </div>
          <div className="cart-savings-detail-row">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">Z</div>
              <div className="cart-savings-detail-label">FREE delivery savings</div>
            </div>
            <div className="cart-savings-detail-amount">₹30</div>
          </div>
          <div className="cart-savings-detail-row cart-savings-detail-row-last">
            <div className="cart-savings-detail-left">
              <div className="cart-savings-detail-icon">₹</div>
              <div className="cart-savings-detail-label">Savings on Handling fee</div>
            </div>
            <div className="cart-savings-detail-amount">₹10</div>
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
          <button className="cart-proceed-btn">Add Address to proceed</button>
        </div>
      </aside>
    </>
  );
}


