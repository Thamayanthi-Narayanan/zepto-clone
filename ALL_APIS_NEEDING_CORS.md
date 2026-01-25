# All APIs That Need CORS Enabled

## Summary
CORS should be enabled for **ALL** `/api/**` endpoints. This is a blanket configuration that covers all REST API calls.

---

## All API Endpoints That Need CORS

Based on your application, these are the endpoints that need CORS:

### 1. Admin APIs
- ✅ `/api/admin/login` - Admin login
- ✅ `/api/admin/chat-list` - Get all customer chats
- ✅ `/api/admin/chat/reply` - Admin send message to customer

### 2. User/Customer APIs
- ✅ `/api/chat/send` - Customer send message to admin
- ✅ `/api/cart` - Cart operations (GET, POST, DELETE)
- ✅ `/api/profile` - User profile data
- ✅ `/api/orders` - Order history
- ✅ `/api/products` - Product listings
- ✅ `/api/metadata` - Categories and metadata

### 3. Authentication APIs
- ✅ `/api/auth/**` - All authentication endpoints
- ✅ `/api/user/**` - All user-related endpoints

### 4. WebSocket
- ✅ `/ws-chat/**` - WebSocket endpoint (already fixed)

---

## How to Enable CORS for ALL APIs

**One configuration covers everything:**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // This ONE configuration covers ALL /api/** endpoints
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**This single configuration enables CORS for:**
- All current API endpoints
- All future API endpoints under `/api/**`
- No need to configure each endpoint individually

---

## How to Check if CORS is Enabled

### Method 1: Browser Developer Tools

1. **Open your frontend** (http://localhost:5173)
2. **Open Browser DevTools** (F12)
3. **Go to Network tab**
4. **Make an API call** (e.g., open admin dashboard)
5. **Check the request:**
   - If CORS is **ENABLED**: Request succeeds, no CORS errors
   - If CORS is **DISABLED**: You'll see red error: "CORS policy blocked"

### Method 2: Check Response Headers

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Click on any API request**
4. **Check Response Headers** - Look for:
   - ✅ `Access-Control-Allow-Origin: *` or `Access-Control-Allow-Origin: http://localhost:5173`
   - ✅ `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - ✅ `Access-Control-Allow-Headers: *`
   - ✅ `Access-Control-Allow-Credentials: true`

**If you see these headers = CORS is enabled ✅**

### Method 3: Test with cURL Command

Open terminal/command prompt and run:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     -v \
     https://hyperactively-florescent-addilyn.ngrok-free.dev/api/admin/chat-list
```

**Look for these headers in response:**
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
< Access-Control-Allow-Headers: *
```

**If you see these = CORS is enabled ✅**

### Method 4: Check Backend Code

Look in your backend codebase:

1. **Check if CorsConfig.java exists:**
   ```
   src/main/java/com/infinitevision/infinite_store/config/CorsConfig.java
   ```

2. **Check WebSocketConfig.java:**
   ```
   src/main/java/com/infinitevision/infinite_store/security/WebSocketConfig.java
   ```
   Should have: `.setAllowedOriginPatterns("*")`

3. **Check for @CrossOrigin annotations:**
   Search for `@CrossOrigin` in your controller files

---

## Current Status Checklist

### ✅ Already Fixed:
- [x] WebSocket CORS - `/ws-chat/**` (using `setAllowedOriginPatterns("*")`)

### ⚠️ Still Needed:
- [ ] REST API CORS - `/api/**` (needs CorsConfig.java)

---

## Quick Test Script

After backend adds CORS, test these endpoints:

```javascript
// Test 1: Admin Chat List
fetch('https://hyperactively-florescent-addilyn.ngrok-free.dev/api/admin/chat-list', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => console.log('✅ Admin API works:', r.status))
.catch(e => console.log('❌ Admin API failed:', e));

// Test 2: User Chat Send
fetch('https://hyperactively-florescent-addilyn.ngrok-free.dev/api/chat/send', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ UserId: 1, message: 'test' })
})
.then(r => console.log('✅ User API works:', r.status))
.catch(e => console.log('❌ User API failed:', e));
```

---

## Summary

**What needs CORS:**
- ✅ ALL `/api/**` endpoints (one config covers all)
- ✅ `/ws-chat/**` WebSocket (already fixed)

**How to check:**
1. Browser DevTools → Network tab → Check response headers
2. Look for `Access-Control-Allow-Origin` header
3. No CORS errors in console = working ✅

**Current status:**
- WebSocket: ✅ Fixed
- REST API: ⚠️ Needs CorsConfig.java

