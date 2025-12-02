import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      {/* POPULAR SEARCHES */}
      <div className="footer-section">
        <h3>Popular Searches</h3>

        <div className="footer-line">
          <span className="footer-title">Products :</span>
          <span className="footer-list">
            Avocado | Strawberry | Pomegranate | Beetroot | Ash gourd | Bottle gourd |
            Lady finger | Potato | Lemon | Dalchini | Fennel seeds | Blueberry |
            Papaya | Dragon fruit | Mushroom | Lettuce
          </span>
        </div>

        <div className="footer-line">
          <span className="footer-title">Brands :</span>
          <span className="footer-list">
            Yakult | My Muse | Aashirvaad Atta | Too Yumm | Lays | Figaro Olive Oil |
            Nandini Milk | Amul | Mother Dairy Near Me | Fortune Oil | Superyou |
            Durex Condoms | Ferns and Petals
          </span>
        </div>

        <div className="footer-line">
          <span className="footer-title">Categories :</span>
          <span className="footer-list">
            Grocery | Cigarettes | Chips | Curd | Hukka flavour |
            Paan shop near me | Eggs price | Cheese slice | Fresh fruits |
            Fresh vegetables | Refined oil | Butter price | Paneer price
          </span>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="footer-categories">
        <h3>Categories</h3>

        <div className="grid">
          <span>Fruits & Vegetables</span>
          <span>Atta, Rice, Oil & Dals</span>
          <span>Masala & Dry Fruits</span>
          <span>Sweet Cravings</span>
          <span>Frozen Food & Ice Creams</span>

          <span>Baby Food</span>
          <span>Dairy, Bread & Eggs</span>
          <span>Cold Drinks & Juices</span>
          <span>Munchies</span>
          <span>Meats, Fish & Eggs</span>

          <span>Breakfast & Sauces</span>
          <span>Tea, Coffee & More</span>
          <span>Biscuits</span>
          <span>Makeup & Beauty</span>
          <span>Bath & Body</span>

          <span>Cleaning Essentials</span>
          <span>Home Needs</span>
          <span>Electricals & Accessories</span>
          <span>Hygiene & Grooming</span>
          <span>Health & Baby Care</span>

          <span>Homegrown Brands</span>
          <span>Paan Corner</span>
        </div>
      </div>

      <hr className="footer-divider" />

      {/* BOTTOM SECTION */}
      <div className="footer-bottom">

        {/* LEFT LOGO + SOCIAL */}
        <div className="footer-left">
          <h2 className="footer-logo">zepto</h2>

          <div className="social-icons">
            <span>📷</span>
            <span>𝕏</span>
            <span>📘</span>
            <span>🔗</span>
          </div>

          <p>© Zepto Marketplace Private Limited</p>
          <p>fssai lic no : 112249990000872</p>
        </div>

        {/* CENTER LINKS */}
        <div className="footer-links">
          <div>
            <p>Home</p>
            <p>Delivery Areas</p>
            <p>Careers</p>
            <p>Customer Support</p>
            <p>Press</p>
            <p>Mojo - a Zepto Blog</p>
          </div>

          <div>
            <p>Privacy Policy</p>
            <p>Terms of Use</p>
            <p>Responsible Disclosure Policy</p>
            <p>Sell on Zepto</p>
            <p>Deliver with Zepto</p>
            <p>Franchise with Zepto</p>
          </div>
        </div>

        {/* RIGHT DOWNLOAD BUTTONS */}
        <div className="footer-app">
          <h4>Download App</h4>

          <button className="store-btn">
            ▶️ Get it on play store
          </button>

          <button className="store-btn">
            🍎 Get it on app store
          </button>
        </div>
      </div>

    </footer>
  );
}
