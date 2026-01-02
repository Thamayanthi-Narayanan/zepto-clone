import React from "react";
import "./CartDrawer.css";
import { useCart } from '../../context/CartContext';
import { Trash } from '@phosphor-icons/react';

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
          {cartItems.map((item) => {
            const itemTotalPrice = item.price * item.qty;
            const itemTotalMRP = item.mrp * item.qty;
            return (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-left">
                  <img
                    src={item.thumbnailUrl || 'placeholder.png'}
                    alt={item.productName}
                    className="cart-item-image"
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
              <span className="cart-bill-strike">₹{totals.deliveryFeeMRP}</span>
              <span className="cart-bill-free">FREE</span>
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


