import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section popular-searches">
        <h3>Popular Searches</h3>
        <div className="search-items">
          <p><strong>Products :</strong> Avocado | Strawberry | Pomegranate | Beetroot | Ash gourd | Bottle gourd | Lady finger | Potato | Lemon | Dalchini | Fennel seeds | Blueberry | Papaya | Dragon fruit | Mushroom | Lettuce</p>
          <p><strong>Brands :</strong> Yakult | My Muse | Aashirvaad Atta | Too Yumm | Lays | Figaro Olive Oil | Nandini Milk | Amul | Mother Dairy Near Me | Fortune Oil | Superyou | Durex Condoms | Ferns and Petals</p>
          <p><strong>Categories :</strong> Grocery | Cigarettes | Chips | Curd | Hukka flavour | Paan shop near me | Eggs price | Cheese slice | Fresh fruits | Fresh vegetables | Refined oil | Butter price | Paneer price</p>
        </div>
      </div>

      <div className="footer-section main-categories">
        <h3>Categories</h3>
        <div className="main-categories-grid">
          <div className="category-column">
            <p>Fruits & Vegetables</p>
            <p>Baby Food</p>
            <p>Breakfast & Sauces</p>
            <p>Cleaning Essentials</p>
            <p>Homegrown Brands</p>
          </div>
          <div className="category-column">
            <p>Atta, Rice, Oil & Dals</p>
            <p>Dairy, Bread & Eggs</p>
            <p>Tea, Coffee & More</p>
            <p>Home Needs</p>
            <p>Paan Corner</p>
          </div>
          <div className="category-column">
            <p>Masala & Dry Fruits</p>
            <p>Cold Drinks & Juices</p>
            <p>Biscuits</p>
            <p>Electricals & Accessories</p>
          </div>
          <div className="category-column">
            <p>Sweet Cravings</p>
            <p>Munchies</p>
            <p>Makeup & Beauty</p>
            <p>Hygiene & Grooming</p>
          </div>
          <div className="category-column">
            <p>Frozen Food & Ice Creams</p>
            <p>Meats, Fish & Eggs</p>
            <p>Bath & Body</p>
            <p>Health & Baby Care</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-left">
          <div className="social-icons">
            <i className="fab fa-instagram"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-facebook"></i>
            <i className="fab fa-linkedin"></i>
          </div>
          <p>© Infinite Store Marketplace Private Limited</p>
          <p>fssai lic no : 11224999000872</p>
        </div>
        <div className="footer-right">
          <div className="footer-links-group">
            <p>Home</p>
            <p>Delivery Areas</p>
            <p>Careers</p>
            <p>Customer Support</p>
            <p>Press</p>
            <p>Mojo - a Infinite Store Blog</p>
          </div>
          <div className="footer-links-group">
            <p>Privacy Policy</p>
            <p>Terms of Use</p>
            <p>Responsible Disclosure Policy</p>
            <p>Sell on Infinite Store</p>
            <p>Deliver with Infinite Store</p>
            <p>Franchise with Infinite Store</p>
          </div>
          <div className="download-app">
            <p>Download App</p>
            <div className="app-buttons">
              <button>Get it on play store</button>
              <button>Get it on app store</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
