# Admin Access Guide

## How Admin Accesses the Admin Panel

### Method 1: Direct URL (Recommended)
Admin can directly type or bookmark this URL:
```
http://localhost:5173/admin/login
```
or
```
https://yourdomain.com/admin/login
```

### Method 2: Browser Bookmark
1. Admin opens the website
2. Types `/admin/login` in the address bar
3. Press Enter
4. Bookmark the page for future use

### Method 3: Share Admin Login Link
Share this link with admins:
```
https://yourdomain.com/admin/login
```

## Step-by-Step Flow

### Step 1: Admin Opens Login Page
- URL: `http://localhost:5173/admin/login`
- Sees: Clean admin login page (no shopping content)
- No Navbar, no products, just login form

### Step 2: Admin Enters Credentials
- Email: `admin@example.com`
- Password: `admin_password`
- Clicks "Login" button

### Step 3: Backend Verifies
- API: `POST /api/admin/login`
- Backend checks if email/password is valid admin
- Returns: `{ success: true, token: '...', adminId: '...' }`

### Step 4: Frontend Stores Admin Data
- Stores `adminToken` in localStorage
- Stores `userRole: 'admin'` in localStorage
- Clears any regular user data

### Step 5: Redirect to Dashboard
- Automatically redirects to: `/admin/dashboard`
- Shows: Admin dashboard with customer chats list

## Route Structure

```
/admin/login          → Admin login page (public)
/admin/dashboard      → Admin dashboard (protected - requires login)
/admin/chat/:chatId   → View specific customer chat (protected)
```

## Protection

- `/admin/dashboard` and `/admin/chat/:chatId` are protected
- If admin not logged in → automatically redirects to `/admin/login`
- If regular user tries to access → redirects to `/admin/login`

## Example URLs

### Development (Local)
```
http://localhost:5173/admin/login
http://localhost:5173/admin/dashboard
```

### Production
```
https://yourdomain.com/admin/login
https://yourdomain.com/admin/dashboard
```

## Testing

1. Open browser
2. Go to: `http://localhost:5173/admin/login`
3. Enter admin credentials
4. Should redirect to dashboard
5. If you logout and try `/admin/dashboard` directly → should redirect to login

