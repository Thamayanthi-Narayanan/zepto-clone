import React from 'react'; // Removed useState and useEffect
import './ProductListing.css';
// import { BASE_API_URL } from "../../api/apiConfig"; // Removed BASE_API_URL import

// Placeholder images for now since thumbnailUrl returns null
// import milkyMistPaneer from '../../assets/milky-mist-paneer.png';
// import freshOnion from '../../assets/fresh-onion.png';
// import nandiniFreshTonedMilk from '../../assets/nandini-fresh-toned-milk.png';
// import corianderLeaves from '../../assets/coriander-leaves.png';
// import bananaRobusta from '../../assets/banana-robusta.png';
// import nandiniThickCurdPouch from '../../assets/nandini-thick-curd-pouch.png';
// import tomatoLocal from '../../assets/tomato-local.png';
// import tenderCoconut from '../../assets/tender-coconut.png';


const staticProducts = [
  {
    id: 1,
    productName: "Milky Mist Paneer",
    mrp: 325.0,
    price: 199.0,
    thumbnailUrl: null, // Set to null
    rating: 4.5,
    unitType: "pack",
    unitValue: "500 g",
    discountPercentage: 38.77,
    totalReviews: 320,
    discountAmount: 126
  },
  {
    id: 2,
    productName: "Fresh Onion",
    mrp: 73.0,
    price: 38.0,
    thumbnailUrl: null, // Set to null
    rating: 4.4,
    unitType: "pack",
    unitValue: "900 - 1000 gm",
    discountPercentage: 47.94,
    totalReviews: 110,
    discountAmount: 35
  },
  {
    id: 3,
    productName: "Nandini Fresh Toned Fresh Milk (Pouch Blue)",
    mrp: 0.0, // Assuming no MRP for this item as per image/API. Will update if needed.
    price: 24.0,
    thumbnailUrl: null, // Set to null
    rating: 4.6,
    unitType: "pack",
    unitValue: "500 ml",
    discountPercentage: 0.0,
    totalReviews: 210,
    discountAmount: 0
  },
  {
    id: 4,
    productName: "Coriander leaves",
    mrp: 11.0,
    price: 7.0,
    thumbnailUrl: null, // Set to null
    rating: 4.4,
    unitType: "pack",
    unitValue: "100 g",
    discountPercentage: 36.36,
    totalReviews: 75,
    discountAmount: 4
  },
  {
    id: 5,
    productName: "Banana Robusta",
    mrp: 37.0,
    price: 23.0,
    thumbnailUrl: null, // Set to null
    rating: 4.5,
    unitType: "pcs",
    unitValue: "4",
    discountPercentage: 37.84,
    totalReviews: 180,
    discountAmount: 14
  },
  {
    id: 6,
    productName: "Nandini Thick Curd Pouch",
    mrp: 0.0, // Assuming no MRP for this item as per image/API. Will update if needed.
    price: 28.0,
    thumbnailUrl: null, // Set to null
    rating: 4.5,
    unitType: "pack",
    unitValue: "500 g",
    discountPercentage: 0.0,
    totalReviews: 180,
    discountAmount: 0
  },
  {
    id: 7,
    productName: "Tomato Local",
    mrp: 59.0,
    price: 28.0,
    thumbnailUrl: null, // Set to null
    rating: 4.5,
    unitType: "g",
    unitValue: "500",
    discountPercentage: 52.54,
    totalReviews: 180,
    discountAmount: 31
  },
  {
    id: 8,
    productName: "Tender Coconut",
    mrp: 68.0,
    price: 37.0,
    thumbnailUrl: null, // Set to null
    rating: 4.5,
    unitType: "pc",
    unitValue: "1",
    discountPercentage: 45.59,
    totalReviews: 180,
    discountAmount: 31
  },
];


export default function ProductListing() {
  // Removed state and useEffect hooks for API fetching
  // const [products, setProducts] = useState([]);
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(true);

  // Removed useEffect hook

  // Removed conditional rendering for loading/error

  return (
    <section className="product-listing-section">
      <div className="product-listing-container">
        {staticProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image-container">
              <img src={product.thumbnailUrl || 'placeholder.png'} alt={product.productName} className="product-image" />
              <button className="add-button">ADD</button>
            </div>
            <div className="product-details">
              <div className="product-price-pill">
                <span>₹{product.price}</span>
              </div>
              <div className="product-price-info">
                {product.mrp > 0 && <span className="mrp-price">₹{product.mrp}</span>}
              </div>
              {product.discountAmount > 0 && (
                <p className="discount-text">₹{product.discountAmount} OFF</p>
              )}
              <h3 className="product-name">{product.productName}</h3>
              <p className="product-unit">{product.unitValue}</p> {/* Reverted to unitValue */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
