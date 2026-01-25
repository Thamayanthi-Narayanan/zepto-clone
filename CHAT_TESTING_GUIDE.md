# Chat System Testing Guide

## Prerequisites
1. Make sure your dev server is running: `npm run dev`
2. Ensure backend API is accessible at: `https://hyperactively-florescent-addilyn.ngrok-free.dev`
3. Have browser console open (F12) to see logs and errors

---

## Testing Customer Chat

### Step 1: Login as a Customer
1. Open your app in browser (usually `http://localhost:5173`)
2. Click on the profile/user icon in the navbar
3. Login with your phone number and OTP
4. Make sure you're logged in (check that `userId` and `authToken` are in localStorage)

### Step 2: Open Customer Chat
1. Click on the profile icon again
2. In the profile modal, click on **"Customer Support"** tab
3. You should see three buttons: "Contact Us", "Chat with Us", "Call Us"
4. Click on **"Chat with Us"** button

### Step 3: Test Sending Messages
1. You should see the chat interface with a greeting message
2. Type a message in the input field (e.g., "Hello, I need help")
3. Click the send button (blue paper plane icon)
4. **Check Console:**
   - Look for: `Customer WebSocket connected`
   - Look for: API call to `/api/chat/send`
   - Check if message appears in the chat

### Step 4: Verify WebSocket Connection
1. Open browser console (F12)
2. Look for WebSocket connection logs:
   - `Customer WebSocket connected`
   - `STOMP: Connected`
3. If you see errors, check:
   - Backend WebSocket server is running
   - CORS is properly configured
   - ngrok tunnel is active

---

## Testing Admin Chat

### Step 1: Login as Admin
1. Navigate to: `http://localhost:5173/admin/login`
2. Enter admin email and password
3. Click login
4. You should be redirected to `/admin/dashboard`

### Step 2: View Chat List
1. In the admin dashboard, you should see:
   - Left sidebar with infinity logo (∞)
   - Middle panel: Chat list with all customer chats
   - Right panel: Active chat (empty if no chat selected)
2. **Check Console:**
   - Look for: `WebSocket connected successfully`
   - Look for: API call to `/api/admin/chat-list`
   - Check if chat list loads

### Step 3: Select a Chat
1. Click on any chat from the list (e.g., "User 25")
2. The right panel should show:
   - Chat header with customer name
   - Messages area (might be empty if no messages)
   - Input area at bottom

### Step 4: Test Admin Reply
1. Type a message in the input field (e.g., "Hello, how can I help you?")
2. Click the send button
3. **Check Console:**
   - Look for: API call to `/api/admin/chat/reply`
   - Check if message appears in the chat
   - Look for WebSocket message delivery

---

## Testing Real-Time Communication

### Test Scenario: Customer → Admin → Customer

1. **Customer Side:**
   - Open customer chat (as described above)
   - Send a message: "My order is not delivered"
   - Wait for confirmation

2. **Admin Side:**
   - Open admin dashboard
   - You should see the new message in the chat list
   - Click on that customer's chat
   - You should see the customer's message
   - Reply: "I'll check on that for you"
   - Send the reply

3. **Back to Customer Side:**
   - The customer should receive the admin's reply in real-time
   - Check console for: `Received admin reply:`
   - Message should appear automatically

---

## Common Issues & Troubleshooting

### Issue: WebSocket Not Connecting
**Symptoms:**
- Console shows: `WebSocket connection error`
- Messages not appearing in real-time

**Solutions:**
1. Check if backend WebSocket server is running
2. Verify ngrok tunnel is active
3. Check CORS settings in backend
4. Verify WebSocket URL in `websocketService.js`

### Issue: API Calls Failing
**Symptoms:**
- Console shows: `Failed to send message`
- Error messages in UI

**Solutions:**
1. Check network tab for API responses
2. Verify authentication token is present
3. Check if backend API is accessible
4. Verify request format matches API documentation

### Issue: Messages Not Appearing
**Symptoms:**
- Message sent but not showing
- WebSocket connected but no messages

**Solutions:**
1. Check browser console for errors
2. Verify sessionId matches between customer and admin
3. Check WebSocket subscription topic: `/topic/chat/{sessionId}`
4. Verify backend is broadcasting messages correctly

### Issue: Chat List Empty
**Symptoms:**
- Admin dashboard shows no chats
- "No chats found" message

**Solutions:**
1. Make sure at least one customer has sent a message
2. Check API response in network tab
3. Verify admin token is valid
4. Check if API returns data in expected format

---

## Testing Checklist

### Customer Chat
- [ ] Can open chat interface
- [ ] WebSocket connects successfully
- [ ] Can send messages
- [ ] Messages appear in chat
- [ ] Can receive admin replies in real-time
- [ ] Error handling works (try sending without login)

### Admin Chat
- [ ] Can login to admin dashboard
- [ ] Chat list loads from API
- [ ] Can select a chat
- [ ] Can see customer messages
- [ ] Can send replies
- [ ] Messages appear in chat
- [ ] Real-time updates work

### Integration
- [ ] Customer message appears in admin chat list
- [ ] Admin reply appears in customer chat
- [ ] WebSocket works bidirectionally
- [ ] Multiple chats work simultaneously

---

## Debugging Tips

1. **Check localStorage:**
   ```javascript
   // In browser console
   console.log('userId:', localStorage.getItem('userId'));
   console.log('authToken:', localStorage.getItem('authToken'));
   console.log('adminToken:', localStorage.getItem('adminToken'));
   ```

2. **Monitor WebSocket:**
   - Open browser DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Check connection status and messages

3. **Check API Calls:**
   - Open browser DevTools → Network tab
   - Look for calls to `/api/chat/send` and `/api/admin/chat/reply`
   - Check request/response payloads

4. **Test with Two Browsers:**
   - Open customer chat in Chrome
   - Open admin dashboard in Firefox/Edge
   - Test real-time communication between them

---

## Expected Console Logs

### Customer Chat:
```
Customer WebSocket connected
STOMP: Connected
Received admin reply: {sender: "ADMIN", message: "...", ...}
```

### Admin Chat:
```
WebSocket connected successfully
STOMP: Connected
Received WebSocket message: {sender: "CUSTOMER", message: "...", ...}
```

---

## Next Steps After Testing

If everything works:
1. Test with multiple customers
2. Test with multiple admins
3. Test error scenarios (network failures, invalid tokens)
4. Test chat history loading (if API available)

If issues found:
1. Check backend logs
2. Verify API endpoints are correct
3. Check WebSocket configuration
4. Review error messages in console

