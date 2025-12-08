import React from "react";
import "./Categories.css";

export default function Categories() {
  const categories = [
    { name: "All" },
    { name: "Cafe" },
    { name: "Home" },
    { name: "Toys" },
    { name: "Fresh" },
    { name: "Electronics" },
    { name: "Mobiles" },
    { name: "Beauty" },
    { name: "Fashion" },
  ];

  return (
    <div className="categories">
      <div className="categories-container">
        {categories.map((cat, index) => (
          <div className={`category-item ${cat.name === "All" ? "active" : ""}`} key={index}>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
