# 🔄 Updated Application Flow

## New User Journey

### Step-by-Step Flow

```
1. Login Page (login.html)
   ↓
   User enters email & password
   ↓
   Clicks "Login" button
   ↓
2. Registration Page (signup.html)  ← NEW FLOW
   ↓
   User fills registration form:
   - Full Name
   - Mobile No (+91)
   - Organization Email
   - Gender
   - Password
   - Confirm Password
   - Accept Terms
   ↓
   Clicks "Register" button
   ↓
3. Main Dashboard (index.html)
   ↓
   User can now:
   - Upload company logo & banner
   - Fill company information
   - Complete founding info
   - Track setup progress
   ↓
   Clicks "Logout" button
   ↓
4. Back to Login Page
```

## Page Flow Diagram

```
┌─────────────────┐
│  Login Page     │  Entry point
│  (login.html)   │  - Email & Password
└────────┬────────┘
         │
         │ Click "Login"
         ↓
┌─────────────────┐
│ Registration    │  Step 2: Complete profile
│ (signup.html)   │  - Personal details
└────────┬────────┘  - Organization info
         │           - Password setup
         │ Click "Register"
         ↓
┌─────────────────┐
│ Main Dashboard  │  Step 3: Use application
│ (index.html)    │  - Company Info
└────────┬────────┘  - Founding Info
         │           - Progress tracking
         │ Click "Logout"
         ↓
┌─────────────────┐
│  Login Page     │  Return to start
│  (login.html)   │
└─────────────────┘
```

## What Changed

### Before (Old Flow)
```
Login → Main Dashboard
```

### After (New Flow)
```
Login → Registration → Main Dashboard
```

## Purpose

This flow ensures that:
1. ✅ Users authenticate first (Login page)
2. ✅ Users complete their profile (Registration page)
3. ✅ Users access the full application (Main Dashboard)

## Navigation Options

### From Login Page
- **Login Button** → Goes to Registration page
- **"Sign up" Link** → Also goes to Registration page

### From Registration Page
- **Register Button** → Goes to Main Dashboard (after validation)
- **"Login" Link** → Goes back to Login page

### From Main Dashboard
- **Logout Button** → Goes back to Login page

## Testing the Flow

### Test Case 1: Complete Registration Flow
1. Open `http://localhost:3000/login.html`
2. Enter any email (e.g., `test@company.com`)
3. Enter any password (e.g., `password123`)
4. Click **"Login"** button
5. ✅ Should redirect to **Registration page**
6. Fill all registration fields
7. Click **"Register"** button
8. ✅ Should redirect to **Main Dashboard**

### Test Case 2: Direct Access Protection
1. Try to access `http://localhost:3000/index.html` directly
2. ✅ Should redirect to Login page (not logged in)

### Test Case 3: Logout Flow
1. From Main Dashboard
2. Click **"Logout"** button in header
3. ✅ Should redirect to Login page

## Data Flow

### Login Page → Registration Page
- Stores: `userEmail`, `loginAttempted`
- User proceeds to complete registration

### Registration Page → Main Dashboard
- Stores: `registeredUser`, `isLoggedIn`
- User can now access protected content

### Main Dashboard → Login Page
- Clears: `isLoggedIn`, `userEmail`
- User must login again

## localStorage Keys

| Key | Set At | Purpose |
|-----|--------|---------|
| `userEmail` | Login | Track user email |
| `loginAttempted` | Login | Mark login attempt |
| `registeredUser` | Registration | Store user profile |
| `isLoggedIn` | Registration | Auth token |
| `hireNextCompanyData` | Dashboard | Form data |

## Why This Flow?

### Benefits
1. **Two-step onboarding** - Separates auth from profile setup
2. **Better UX** - Focused forms for each step
3. **Data collection** - Gathers complete user info before dashboard access
4. **Progressive disclosure** - Shows features after user commits

## Alternative Links

Users can still navigate between pages using:
- "Sign up" link on Login → Registration
- "Login" link on Registration → Login
- "Logout" button on Dashboard → Login

---

**Updated Flow Active**: ✅ Yes
**Last Updated**: October 13, 2025
**Flow**: Login → Registration → Dashboard
