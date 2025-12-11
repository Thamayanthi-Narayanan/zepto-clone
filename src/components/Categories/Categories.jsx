import React, { useState, useEffect } from "react";
import "./Categories.css";
import { BASE_API_URL } from "../../api/apiConfig";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const API_ENDPOINT = "/api/metadata"; // Only the endpoint part
  const FULL_API_URL = BASE_API_URL + API_ENDPOINT;

  useEffect(() => {
    const fetchCategories = async () => {
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

        // Removed temporary logging of raw response text
        const result = await response.json(); // Reverted to direct JSON parsing
        if (result.success && result.data) {
          // API data format is [{ "All": "All" }, ...]
          // We need to extract the value from each object
          const extractedCategories = result.data.map(item => Object.values(item)[0]);
          setCategories(extractedCategories);
        } else {
          console.error("API call successful but data not as expected:", result);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="categories">
      <div className="categories-container">
        {categories.map((catName, index) => (
          <div className={`category-item ${catName === "All" ? "active" : ""}`} key={index}>
            <span>{catName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
