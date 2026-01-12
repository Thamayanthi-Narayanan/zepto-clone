# How to Test on Mobile Using Ngrok

## Step 1: Install Ngrok

### Option A: Download from Website
1. Go to https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the zip file
4. Copy `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

### Option B: Using Package Manager
```bash
# Using Chocolatey (if installed)
choco install ngrok

# Or using Scoop (if installed)
scoop install ngrok
```

## Step 2: Sign Up for Free Ngrok Account
1. Go to https://dashboard.ngrok.com/signup
2. Sign up for free account
3. Get your authtoken from dashboard
4. Run: `ngrok config add-authtoken YOUR_AUTH_TOKEN`

## Step 3: Start Your React Dev Server
1. Open terminal in your project folder
2. Run:
```bash
cd zeepto
npm run dev
```
3. Your server should start on `http://localhost:5173`

## Step 4: Start Ngrok Tunnel
1. Open a NEW terminal window
2. Run:
```bash
ngrok http 5173
```
3. You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5173
```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

## Step 5: Access on Mobile
1. Make sure your phone is on the same WiFi network as your computer
2. Open browser on your phone
3. Enter the ngrok URL (e.g., `https://abc123.ngrok-free.app`)
4. Your React app will load!

## Step 6: Test Location Feature
1. Click "Select Location" in navbar
2. Click "Use My Current Location"
3. Allow location access when prompted
4. Test the location feature!

## Important Notes:
- Ngrok free tier gives you a random URL each time
- URL changes when you restart ngrok
- For permanent URL, upgrade to paid plan
- Make sure both devices are on same network (or use ngrok's public URL)

## Troubleshooting:
- If ngrok shows "tunnel not found", restart ngrok
- If mobile can't connect, check firewall settings
- Make sure dev server is running on port 5173
- Check ngrok dashboard for connection status

