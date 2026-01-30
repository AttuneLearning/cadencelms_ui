# Testing the Learner Login Flow

## Quick Start

### 1. Start Backend
```bash
cd /home/adam/github/cadencelms_api
npm run dev
```
Expected output: `Server running on port 5000 in development mode`

### 2. Start Frontend
```bash
cd /home/adam/github/lms_ui/1_lms_ui_v2
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### 3. Create a Test User

**Option A: Register via API**
```bash
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@test.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "Learner",
    "role": "learner"
  }'
```

**Option B: Use Admin Account (if seeded)**
```bash
# Check if admin account exists
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "Admin123!"
  }'
```

### 4. Test Login in Browser

1. Open http://localhost:5173/login
2. Enter credentials:
   - Email: `learner@test.com`
   - Password: `Test123!`
3. Click "Log in"

## Debugging Login Issues

### Check Browser Console

Open DevTools (F12) → Console tab and look for these logs:

```javascript
// Successful login will show:
Auth response: { success: true, data: { user: {...}, token: "..." } }
Extracted data: { user: {...}, token: "..." }

// Failed login will show:
Login error: ApiClientError { message: "Invalid credentials", status: 401 }
Login failed in authStore: Error: Invalid credentials
```

### Check Network Tab

Open DevTools → Network tab:

1. **POST to `/api/v2/auth/login`**
   - Status: `200` (success) or `401` (invalid credentials)
   - Response payload should be:
     ```json
     {
       "success": true,
       "data": {
         "user": {
           "id": "...",
           "email": "...",
           "firstName": "...",
           "lastName": "...",
           "role": "learner"
         },
         "token": "eyJ...",
         "refreshToken": "...",
         "expiresIn": 3600
       }
     }
     ```

### Check localStorage

After successful login, check localStorage:

```javascript
// In browser console:
JSON.parse(localStorage.getItem('auth-storage'))

// Should contain:
{
  "state": {
    "accessToken": "eyJ...",
    "role": "learner",
    "roles": ["learner"],
    "isAuthenticated": true,
    "user": {
      "_id": "...",
      "email": "learner@test.com",
      "firstName": "Test",
      "lastName": "Learner"
    }
  }
}
```

## Common Issues & Solutions

### Issue 1: "Invalid credentials" Error

**Possible causes:**
1. User doesn't exist in database
2. Wrong password
3. Backend not running

**Solution:**
```bash
# Test backend directly
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@test.com","password":"Test123!"}'

# If this fails, create the user with register endpoint
```

### Issue 2: CORS Error in Console

**Error message:** `Access to XMLHttpRequest at 'http://localhost:5000/api/v2/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** Backend needs CORS configuration. Check `src/app.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 3: "Invalid response format from server"

**Possible causes:**
1. Backend returning different format than expected
2. Network error

**Solution:** Check console logs to see actual response format, then adjust `authStore.ts` parsing.

### Issue 4: Redirects to Login After Successful Login

**Possible causes:**
1. Token not being stored
2. Auth state not persisting

**Solution:** Check localStorage and ensure `isAuthenticated: true` is set.

## Expected Login Flow

1. **User enters credentials** → LoginForm validates
2. **Form submits** → Calls `authStore.login()`
3. **authStore calls API** → POST to `/api/v2/auth/login`
4. **Backend authenticates** → Returns token + user data
5. **authStore parses response** → Extracts token and user
6. **authStore updates state** → Sets `isAuthenticated: true`, `role: "learner"`
7. **authStore saves to localStorage** → Persists auth state
8. **LoginForm redirects** → Navigates to `/dashboard`
9. **Dashboard redirects by role** → Learner goes to `/learner/dashboard`
10. **LearnerDashboardPage renders** → Shows welcome message and stats

## What You Should See

### Successful Login:
- Login form briefly shows "Logging in..." button
- Browser navigates to `/learner/dashboard`
- Sidebar shows learner menu items:
  - Dashboard
  - My Courses
  - My Learning
  - Progress
  - Certificates
- Dashboard displays:
  - "Welcome back, [FirstName]!"
  - Stats cards (all showing 0 for now)
  - Quick actions section
  - Recent activity section

### Failed Login:
- Error message appears below password field
- Error message shows actual backend error (e.g., "Invalid credentials")
- Login button re-enables
- User stays on login page

## Testing Different Roles

### Test as Learner
```bash
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"learner@test.com","password":"Test123!","firstName":"Test","lastName":"Learner","role":"learner"}'
```
Expected: Redirects to `/learner/dashboard`

### Test as Staff
```bash
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com","password":"Test123!","firstName":"Staff","lastName":"Member","role":"staff"}'
```
Expected: Redirects to `/staff/dashboard`

### Test as Admin
```bash
# Use existing admin account or create one
curl -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"Admin123!"}'
```
Expected: Redirects to `/admin/dashboard`

## Troubleshooting Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] No CORS errors in console
- [ ] POST request to `/api/v2/auth/login` returns 200
- [ ] Response contains `{ success: true, data: { ... } }`
- [ ] localStorage contains `auth-storage` item
- [ ] `isAuthenticated: true` in auth state
- [ ] User has correct role (`learner`, `staff`, or `global-admin`)
- [ ] Redirects to correct dashboard based on role

## Next Steps After Successful Login

Once login works, you can test:
1. **Token persistence** - Refresh page, should stay logged in
2. **Token refresh** - Wait for token to expire, should auto-refresh
3. **Logout** - Click logout (if implemented), should clear state
4. **Protected routes** - Try accessing admin pages as learner, should redirect to `/unauthorized`
5. **Role-based sidebar** - Check that menu items match user's role
