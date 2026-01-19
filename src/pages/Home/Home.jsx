import React, { useState } from 'react';
import Categories from '../../components/Categories/Categories';
import Banners from '../../components/Banners/Banners';
import ProductListing from '../../components/ProductListing/ProductListing';
import HeroSection from '../../components/HeroSection/HeroSection';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Footer from '../../components/Footer/Footer';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Categories selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect}/>
      {selectedCategory === 'All' && <Banners/>}
      <ProductListing category={selectedCategory}/>
      {selectedCategory === 'All' && (
        <>
          <HeroSection/>
          <HowItWorks/>
        </>
      )}
      <Footer/>
    </>
  );
}

