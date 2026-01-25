# Quick Fix Guide for Backend Developer

## 🚨 Urgent Issues to Fix

### Issue 1: 404 - `/api/admin/chat-list` Not Found

**Problem:** Endpoint returns 404 Not Found

**Solution:**
1. Check if endpoint exists in `AdminController`
2. Verify route: `@GetMapping("/chat-list")` with `@RequestMapping("/api/admin")`
3. Ensure method is public and returns proper response

**Quick Check:**
```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @GetMapping("/chat-list")  // ← Verify this exists
    public ResponseEntity<?> getChatList() {
        // Implementation
    }
}
```

---

### Issue 2: 500 - `/api/chat/send` Server Error

**Problem:** Endpoint returns 500 Internal Server Error

**Solution:**
1. **Check server logs** - Find the actual exception
2. **Verify request body** matches DTO:
   ```java
   public class ChatSendRequest {
       private Integer UserId;  // Capital U
       private String message;
   }
   ```
3. **Check database** - Ensure chat table exists
4. **Verify user exists** - UserId 49 must exist

**Common Fixes:**
- Add try-catch to handle exceptions
- Check null values
- Verify database connection
- Check validation annotations

---

### Issue 3: WebSocket Not Connecting

**Problem:** WebSocket connection closes immediately

**Solution:**
1. Verify `WebSocketConfig.java` has:
   ```java
   .setAllowedOriginPatterns("*")
   ```
2. Check if WebSocket server is running
3. Test endpoint: `/ws-chat/info` should return JSON
4. Check ngrok allows WebSocket connections

---

### Issue 4: REST API CORS (If Needed)

**Problem:** API calls might be blocked by CORS

**Solution:**
Add `CorsConfig.java`:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## ✅ Testing After Fixes

1. **Test Admin Endpoint:**
   ```bash
   curl -X GET \
     https://your-ngrok-url/api/admin/chat-list \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```
   Should return: 200 OK with chat list

2. **Test User Endpoint:**
   ```bash
   curl -X POST \
     https://your-ngrok-url/api/chat/send \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"UserId": 49, "message": "test"}'
   ```
   Should return: 200 OK with message data

3. **Test WebSocket:**
   - Frontend should show "WebSocket Connected" in console
   - No connection errors

---

## 📋 Checklist

- [ ] `/api/admin/chat-list` endpoint exists and returns 200
- [ ] `/api/chat/send` endpoint works without 500 error
- [ ] `/api/admin/chat/reply` endpoint works
- [ ] WebSocket `/ws-chat` connects successfully
- [ ] CORS is enabled for `/api/**` endpoints
- [ ] All endpoints return proper JSON responses
- [ ] Authentication tokens are validated correctly

---

## 🔍 Debug Steps

1. **Check Logs:**
   - Look for exceptions in server logs
   - Check for 404/500 errors
   - Verify request reaching backend

2. **Test Endpoints:**
   - Use Postman or curl to test each endpoint
   - Verify request/response formats
   - Check authentication

3. **Verify Database:**
   - Ensure chat tables exist
   - Check if data is being saved
   - Verify foreign key relationships

4. **Check Configuration:**
   - Verify CORS settings
   - Check WebSocket configuration
   - Ensure routes are mapped correctly

---

## Expected Response Formats

### Admin Chat List Response:
```json
{
  "message": "User chat list fetched successfully",
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "sessionId": 101,
      "userId": 25,
      "lastMessage": "Hello",
      "lastMessageTime": "2026-01-24T10:20:30",
      "status": "OPEN"
    }
  ]
}
```

### User Chat Send Response:
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

### Admin Chat Reply Response:
```json
{
  "message": "Reply sent successfully",
  "statusCode": 200,
  "success": true,
  "data": {
    "sessionId": 101,
    "sender": "ADMIN",
    "message": "Your order will be delivered soon",
    "timestamp": "2026-01-24T10:20:30"
  }
}
```

---

Once all these are fixed, the frontend will work perfectly!

