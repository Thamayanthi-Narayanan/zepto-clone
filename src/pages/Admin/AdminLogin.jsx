import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_API_URL } from '../../api/apiConfig';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ADMIN_LOGIN_URL = BASE_API_URL + "/api/admin/login";
      
      const response = await fetch(ADMIN_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        setError(errorData.message || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data === "LOGIN_OK") {
        // Store admin credentials
        // API returns data as "LOGIN_OK" string, so we store it as token
        localStorage.setItem('adminToken', result.data);
        localStorage.setItem('userRole', 'admin');
        
        // Clear any regular user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        
        console.log("Admin logged in successfully");
        setLoading(false);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(result.message || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error during admin login:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-subtitle">Access admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

