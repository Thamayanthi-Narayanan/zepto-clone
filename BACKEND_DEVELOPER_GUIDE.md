# Backend Developer Guide - Chat System Issues

## Overview
The frontend React application is ready and working. However, there are backend issues that need to be fixed for the chat system to function properly.

---

## ✅ What's Working

1. **CORS is Enabled** - WebSocket CORS is configured with `setAllowedOriginPatterns("*")`
2. **Proxy is Working** - Requests are reaching the backend successfully
3. **Frontend is Ready** - All frontend code is implemented and correct

---

## ❌ Problems to Fix

### Problem 1: 404 Error - `/api/admin/chat-list` Endpoint Not Found

**Error Details:**
```
GET /api/admin/chat-list
Response: 404 Not Found
Error Body: {"timestamp":"2026-01-24T10:20:14.372+00:00","status":404,"error":"Not Found","path":"/api/admin/chat-list"}
```

**What's Happening:**
- Frontend is calling: `GET /api/admin/chat-list`
- Backend is returning: 404 Not Found
- This means the endpoint doesn't exist or the route mapping is incorrect

**How to Fix:**

1. **Verify the endpoint exists in your controller:**
   ```java
   @RestController
   @RequestMapping("/api/admin")
   public class AdminController {
       
       @GetMapping("/chat-list")
       @PreAuthorize("hasRole('ADMIN')")
       public ResponseEntity<?> getChatList(
           @RequestHeader("Authorization") String token
       ) {
           // Your implementation
       }
   }
   ```

2. **Check the route mapping:**
   - Ensure `@RequestMapping("/api/admin")` is on the controller
   - Ensure `@GetMapping("/chat-list")` is on the method
   - Full path should be: `/api/admin/chat-list`

3. **Expected Response Format:**
   ```json
   {
     "message": "User chat list fetched successfully",
     "statusCode": 200,
     "success": true,
     "data": [
       {
         "sessionId": 101,
         "userId": 25,
         "lastMessage": "My order is not delivered yet",
         "lastMessageTime": "2026-01-21T15:10:30",
         "status": "OPEN"
       }
     ]
   }
   ```

4. **Authentication:**
   - Endpoint requires admin authentication
   - Token is sent in `Authorization: Bearer <token>` header
   - Verify token validation is working

---

### Problem 2: 500 Error - `/api/chat/send` Internal Server Error

**Error Details:**
```
POST /api/chat/send
Response: 500 Internal Server Error
Error: "Internal server error. Please try again later."
```

**What's Happening:**
- Frontend is sending: `POST /api/chat/send` with body `{"UserId": 49, "message": "hello"}`
- Backend is returning: 500 Internal Server Error
- This is a server-side error (not CORS, not 404)

**How to Fix:**

1. **Check Backend Logs:**
   - Look for the actual exception/error in your server logs
   - The error message will tell you what's wrong

2. **Verify Request Body Format:**
   - Frontend sends:
     ```json
     {
       "UserId": 49,
       "message": "hello"
     }
     ```
   - Ensure your DTO/Request class matches:
     ```java
     public class ChatSendRequest {
         private Integer UserId;  // Note: Capital U
         private String message;
         
         // Getters and setters
     }
     ```

3. **Common Causes:**
   - **Database Error**: Check if chat table exists and is accessible
   - **User Not Found**: Verify UserId 49 exists in database
   - **Null Pointer**: Check if any required fields are null
   - **Validation Error**: Check if validation annotations are correct
   - **Session Creation**: If creating a new chat session, ensure logic is correct

4. **Expected Response Format:**
   ```json
   {
     "message": "Message sent to admin successfully",
     "statusCode": 200,
     "success": true,
     "data": {
       "UserId": 49,
       "sender": "CUSTOMER",
       "message": "hello",
       "timestamp": "2026-01-24T10:20:30"
     }
   }
   ```

5. **Check Your Controller:**
   ```java
   @PostMapping("/chat/send")
   @PreAuthorize("hasRole('USER')")
   public ResponseEntity<?> sendMessage(
       @RequestBody ChatSendRequest request,
       @RequestHeader("Authorization") String token
   ) {
       try {
           // Your implementation
           // Make sure to handle exceptions properly
       } catch (Exception e) {
           // Log the error
           logger.error("Error sending message", e);
           return ResponseEntity.status(500)
               .body(new ErrorResponse("Internal server error. Please try again later."));
       }
   }
   ```

---

### Problem 3: WebSocket Connection Failing

**Error Details:**
```
STOMP: Connection closed to https://hyperactively-florescent-addilyn.ngrok-free.dev/ws-chat
WebSocket Closed
```

**What's Happening:**
- Frontend is trying to connect to: `/ws-chat`
- Connection is being closed immediately
- WebSocket CORS is configured but connection still fails

**How to Fix:**

1. **Verify WebSocketConfig is Correct:**
   ```java
   @Configuration
   @EnableWebSocketMessageBroker
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

       @Override
       public void registerStompEndpoints(StompEndpointRegistry registry) {
           registry.addEndpoint("/ws-chat")
                   .setAllowedOriginPatterns("*")  // ✅ Already done
                   .withSockJS();
       }

       @Override
       public void configureMessageBroker(MessageBrokerRegistry registry) {
           registry.enableSimpleBroker("/topic");
           registry.setApplicationDestinationPrefixes("/app");
       }
   }
   ```

2. **Check WebSocket Server Status:**
   - Verify WebSocket server is running
   - Check if port is accessible
   - Test WebSocket endpoint directly

3. **Verify SockJS is Working:**
   - SockJS uses multiple transport methods
   - Ensure all transports are allowed
   - Check if `/ws-chat/info` endpoint is accessible

4. **Check Backend Logs:**
   - Look for WebSocket connection errors
   - Check for any authentication issues
   - Verify no exceptions during connection

5. **Test WebSocket Endpoint:**
   ```bash
   # Test if endpoint is accessible
   curl -i -N -H "Connection: Upgrade" \
        -H "Upgrade: websocket" \
        -H "Sec-WebSocket-Version: 13" \
        -H "Sec-WebSocket-Key: test" \
        https://hyperactively-florescent-addilyn.ngrok-free.dev/ws-chat
   ```

6. **Common Issues:**
   - **ngrok Configuration**: Ensure ngrok allows WebSocket connections
   - **Firewall**: Check if WebSocket ports are open
   - **SSL/TLS**: Verify HTTPS/WSS is configured correctly
   - **Authentication**: If WebSocket requires auth, ensure it's configured

---

## Additional Requirements

### REST API CORS Configuration

**Current Status:** WebSocket CORS is enabled, but REST API CORS might need configuration.

**Add This Configuration:**

Create file: `src/main/java/com/infinitevision/infinite_store/config/CorsConfig.java`

```java
package com.infinitevision.infinite_store.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow CORS for all REST API endpoints
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")  // Or use .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**Note:** If you already have CORS configured, verify it includes `/api/**` pattern.

---

## Testing Checklist

After making changes, test these:

### 1. Test Admin Chat List Endpoint
```bash
curl -X GET \
  https://hyperactively-florescent-addilyn.ngrok-free.dev/api/admin/chat-list \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** 200 OK with chat list data

### 2. Test User Chat Send Endpoint
```bash
curl -X POST \
  https://hyperactively-florescent-addilyn.ngrok-free.dev/api/chat/send \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"UserId": 49, "message": "test message"}'
```

**Expected:** 200 OK with message data

### 3. Test Admin Chat Reply Endpoint
```bash
curl -X POST \
  https://hyperactively-florescent-addilyn.ngrok-free.dev/api/admin/chat/reply \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 101, "message": "Your order will be delivered soon"}'
```

**Expected:** 200 OK with reply data

### 4. Test WebSocket Connection
- Use a WebSocket client tool
- Or check frontend console for connection success

---

## Summary of Required Actions

1. ✅ **WebSocket CORS** - Already configured (using `setAllowedOriginPatterns("*")`)

2. ⚠️ **REST API CORS** - Add `CorsConfig.java` if not already present

3. ❌ **Fix 404 Error** - Implement/verify `/api/admin/chat-list` endpoint

4. ❌ **Fix 500 Error** - Debug and fix `/api/chat/send` endpoint

5. ❌ **Fix WebSocket** - Verify WebSocket server is running and accessible

---

## Frontend Request Details

### Admin Chat List Request
```
Method: GET
URL: /api/admin/chat-list
Headers:
  - Authorization: Bearer <admin_token>
  - Content-Type: application/json
  - ngrok-skip-browser-warning: true
```

### User Chat Send Request
```
Method: POST
URL: /api/chat/send
Headers:
  - Authorization: Bearer <user_token>
  - Content-Type: application/json
  - ngrok-skip-browser-warning: true
Body:
  {
    "UserId": 49,
    "message": "hello"
  }
```

### Admin Chat Reply Request
```
Method: POST
URL: /api/admin/chat/reply
Headers:
  - Authorization: Bearer <admin_token>
  - Content-Type: application/json
  - ngrok-skip-browser-warning: true
Body:
  {
    "sessionId": 101,
    "message": "Your order will be delivered soon"
  }
```

### WebSocket Connection
```
URL: /ws-chat
Protocol: SockJS over WebSocket
Topics: /topic/chat/{sessionId}
```

---

## Contact

If you need clarification on any of these issues, please check:
- Backend server logs for detailed error messages
- API documentation for expected request/response formats
- WebSocket configuration in `WebSocketConfig.java`

The frontend is ready and waiting for these backend fixes.

