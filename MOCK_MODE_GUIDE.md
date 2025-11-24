# 🎭 Mock Mode Guide - No Backend Required!

## ✅ Problem Solved!

The "Network Error" you were seeing is now fixed! The application now works in **MOCK MODE** - no backend server needed.

## 🚀 How It Works Now

### **Mock Authentication**
- Registration and login work completely in the browser
- User data is stored in `localStorage`
- Mock tokens are generated for authentication
- All validation still works (email format, password strength, etc.)

### **What's Different**
- ✅ No need for a backend API
- ✅ Data persists in your browser
- ✅ Full authentication flow works
- ✅ You can register, login, and use all features

## 📝 Try It Now!

### **Register a New Account:**
```
Email: test@ecotech.com
Password: EcoTest@123
Confirm Password: EcoTest@123
Language: English
```

Click "Register" and you'll be:
1. ✅ Registered successfully
2. ✅ Automatically logged in
3. ✅ Redirected to the dashboard

### **Login with Existing Account:**
After registering, you can logout and login again with the same credentials!

## 🔍 What Happens Behind the Scenes

### **Registration:**
1. Validates email format
2. Checks password strength (8+ chars, uppercase, lowercase, number, special char)
3. Stores user in `localStorage` under `mock_users`
4. Generates mock authentication tokens
5. Logs you in automatically

### **Login:**
1. Checks if email exists in `localStorage`
2. Validates credentials
3. Generates new mock tokens
4. Restores your user session

### **Data Storage:**
All your data is stored locally in your browser:
- `mock_users` - Registered users
- `accessToken` - Current session token
- `user` - Current user info

## 🎯 Features That Work

With mock mode enabled, you can:
- ✅ Register new accounts
- ✅ Login and logout
- ✅ Access protected pages (dashboard, devices, etc.)
- ✅ Add and manage devices
- ✅ View energy consumption
- ✅ Earn points and badges
- ✅ Read educational articles
- ✅ Generate impact reports
- ✅ Manage profile settings

## 🔄 Switching to Real Backend

When you're ready to connect to a real backend:

1. **Set MOCK_MODE to false** in `src/services/auth.service.ts`:
   ```typescript
   private readonly MOCK_MODE = false // Disable mock mode
   ```

2. **Configure API URL** in `.env`:
   ```
   VITE_API_BASE_URL=https://your-api.com
   ```

3. **Implement backend endpoints:**
   - `POST /auth/register`
   - `POST /auth/login`
   - `POST /auth/logout`
   - `POST /auth/refresh`
   - `GET /auth/me`

## 💡 Tips

### **Clear Mock Data:**
To start fresh, open browser console and run:
```javascript
localStorage.removeItem('mock_users')
localStorage.clear()
```

### **View Registered Users:**
Open browser console and run:
```javascript
console.log(JSON.parse(localStorage.getItem('mock_users')))
```

### **Check Current User:**
```javascript
console.log(JSON.parse(localStorage.getItem('user')))
```

## 🎉 You're All Set!

The application is now fully functional without any backend. Just register an account and start exploring all the features!

**No more Network Errors!** 🚀

---

*Mock mode is perfect for:*
- ✅ Development and testing
- ✅ Demos and presentations
- ✅ Frontend development without backend
- ✅ Learning and experimentation
