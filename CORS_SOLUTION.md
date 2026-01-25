# CORS Issue - Solution Required

## Problem
The backend API is blocking requests from `http://localhost:5173` due to CORS policy.

## Current Status
- API calls to `/api/admin/chat-list` are blocked by CORS
- WebSocket connections to `/ws-chat` are also blocked
- Vite proxy is configured but may need backend CORS configuration

## Solution Options

### Option 1: Backend CORS Configuration (RECOMMENDED)
Ask your backend developer to add CORS configuration to allow `http://localhost:5173`:

**For Spring Boot (Java):**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        
        registry.addMapping("/ws-chat/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**Or using @CrossOrigin annotation:**
```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    // ...
}
```

### Option 2: Use Vite Proxy (Current Setup)
The Vite proxy is configured in `vite.config.js`. Make sure:
1. Dev server is restarted after config changes
2. All API calls use relative URLs (e.g., `/api/admin/chat-list`)
3. WebSocket uses relative URL (`/ws-chat`)

### Option 3: Temporary Workaround
If CORS can't be configured immediately, you can:
1. Use a browser extension to disable CORS (NOT for production)
2. Or deploy frontend to same domain as backend

## What to Tell Your Backend Developer

"Please enable CORS for `http://localhost:5173` for the following endpoints:
- `/api/**` (all API endpoints)
- `/ws-chat/**` (WebSocket endpoint)

This is needed for local development. The frontend is running on `http://localhost:5173` and needs to communicate with the backend API."

## Testing After CORS is Fixed

1. Refresh browser
2. Check console - should see successful API calls
3. WebSocket should connect successfully
4. Chat list should load in admin dashboard

