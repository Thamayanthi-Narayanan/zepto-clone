import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Categories from './components/Categories/Categories'
import Banners from './components/Banners/Banners'
import HeroSection from './components/HeroSection/HeroSection'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Footer from './components/Footer/Footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <Categories/>
    <Banners/>
    <HeroSection/>
    <HowItWorks/>
    <Footer/>
    </>
  )
}

export default App
