import React from 'react';
import Categories from '../../components/Categories/Categories';
import Banners from '../../components/Banners/Banners';
import ProductListing from '../../components/ProductListing/ProductListing';
import HeroSection from '../../components/HeroSection/HeroSection';
import HowItWorks from '../../components/HowItWorks/HowItWorks';
import Footer from '../../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Categories/>
      <Banners/>
      <ProductListing/>
      <HeroSection/>
      <HowItWorks/>
      <Footer/>
    </>
  );
}

