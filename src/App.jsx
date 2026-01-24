import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import SearchResults from './pages/SearchResults/SearchResults'
import ToastWrapper from './components/Toast/ToastWrapper'
// Admin imports
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminRoute from './components/Admin/AdminRoute'

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Admin routes - no Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          {/* Regular user routes - with Navbar */}
          <Route path="/" element={
            <>
              <Navbar/>
              <Home />
              <ToastWrapper/>
            </>
          } />
          <Route path="/product/:id" element={
            <>
              <Navbar/>
              <ProductDetail />
              <ToastWrapper/>
            </>
          } />
          <Route path="/search" element={
            <>
              <Navbar/>
              <SearchResults />
              <ToastWrapper/>
            </>
          } />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
