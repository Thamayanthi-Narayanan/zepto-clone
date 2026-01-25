# Backend CORS Configuration - Required Setup

## Problem
The frontend running on `http://localhost:5173` cannot connect to the backend API and WebSocket endpoints due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solution
The backend needs to allow requests from `http://localhost:5173` for both REST API endpoints and WebSocket connections.

---

## For Spring Boot (Java) Backend

### Option 1: Global CORS Configuration (Recommended)

Create a new configuration class:

**File: `src/main/java/com/infinitevision/infinite_store/config/CorsConfig.java`**

```java
package com.infinitevision.infinite_store.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow CORS for all API endpoints
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Allow CORS for WebSocket endpoint
        registry.addMapping("/ws-chat/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Option 2: Update Existing WebSocketConfig

If you already have `WebSocketConfig.java`, update it to include CORS:

**File: `src/main/java/com/infinitevision/infinite_store/security/WebSocketConfig.java`**

```java
package com.infinitevision.infinite_store.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .setAllowedOrigins("http://localhost:5173")  // Add this line
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

### Option 3: Using @CrossOrigin Annotation (Per Controller)

If you prefer per-controller configuration:

```java
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    // Your controller code
}
```

---

## For Node.js/Express Backend

If your backend is Node.js/Express, add this middleware:

```javascript
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
```

---

## Important Notes

1. **Allowed Origin**: Make sure to use exactly `http://localhost:5173` (not `https` and not `localhost:5173` without protocol)

2. **Credentials**: Set `allowCredentials(true)` if you're using authentication tokens

3. **Methods**: Include `OPTIONS` method for preflight requests

4. **Headers**: Allow all headers with `allowedHeaders("*")` or specifically include:
   - `Content-Type`
   - `Authorization`
   - `ngrok-skip-browser-warning`

5. **WebSocket**: The WebSocket endpoint `/ws-chat` needs CORS enabled in the `registerStompEndpoints` method

---

## Testing After Configuration

After the backend developer makes these changes:

1. **Restart the backend server**
2. **Test API endpoint**:
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Authorization" \
        -X OPTIONS \
        https://hyperactively-florescent-addilyn.ngrok-free.dev/api/admin/chat-list
   ```
   Should return CORS headers in response

3. **Frontend should work**:
   - Refresh browser
   - Check console - no CORS errors
   - API calls should succeed
   - WebSocket should connect

---

## Production Considerations

For production, update the allowed origin to your production frontend URL:

```java
.allowedOrigins("https://your-production-domain.com")
```

Or use environment variables:

```java
.allowedOrigins(System.getenv("FRONTEND_URL", "http://localhost:5173"))
```

---

## Quick Checklist for Backend Developer

- [ ] Add CORS configuration for `/api/**` endpoints
- [ ] Add CORS configuration for `/ws-chat/**` WebSocket endpoint
- [ ] Allow `http://localhost:5173` as origin
- [ ] Include `OPTIONS` method for preflight
- [ ] Set `allowCredentials(true)` if using auth tokens
- [ ] Restart backend server
- [ ] Test with frontend

---

## Contact

If you have questions or need help, the frontend is ready and waiting for CORS to be enabled.

