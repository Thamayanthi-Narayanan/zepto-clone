// Base API URL - empty string uses Vite proxy
export const BASE_API_URL = "";

// Backend URL for reference
export const BACKEND_URL = "https://hyperactively-florescent-addilyn.ngrok-free.dev";

// Helper function to get the API URL (uses Vite proxy)
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If BASE_API_URL is set, use it
  if (BASE_API_URL) {
    return `${BASE_API_URL}${cleanEndpoint}`;
  }
  
  // Use relative URL to go through Vite proxy (avoids CORS)
  return cleanEndpoint;
};
