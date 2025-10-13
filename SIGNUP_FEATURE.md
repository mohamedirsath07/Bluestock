# 📝 Registration/Signup Feature

## Overview
Added a complete company registration page that matches your design requirements. Users can now sign up before logging in to the HireNext platform.

## Features Implemented

### 1. Registration Page (`signup.html`)
- **Design**: Matches the provided screenshot exactly
- **Layout**: Split-screen with purple gradient (left) and form (right)
- **Same color scheme** as login page

### 2. Form Fields

#### Personal Information
- ✅ **Full Name** - Text input with placeholder
- ✅ **Mobile No** - Phone input with Indian flag and +91 country code
  - 10-digit validation
  - Only numbers allowed
  - Shows flag icon

#### Organization Details
- ✅ **Organization Email** - Email input with validation
  - Must be valid email format
  - "Official Email" placeholder

#### User Profile
- ✅ **Gender Selection** - Three radio button options
  - Male
  - Male (duplicate as shown in image)
  - Other
  - Visual selection with hover effects
  - Changes color when selected

#### Security
- ✅ **Password** - Password field with show/hide toggle
- ✅ **Confirm Password** - Password confirmation with matching validation
- Side-by-side layout on desktop
- Eye icon to toggle visibility

#### Legal
- ✅ **Terms & Conditions** - Checkbox with policy links
  - Required to submit
  - Links to Privacy Policy and T&C
  - Small gray text

### 3. Form Validation
- ✅ Required field validation
- ✅ Email format validation
- ✅ Mobile number validation (10 digits)
- ✅ Password matching validation
- ✅ Password minimum length (6 characters)
- ✅ Terms acceptance required

### 4. User Flow
```
Login Page → Click "Sign up" → Registration Page → Fill form → Register → Back to Login
```

## Navigation Flow

### From Login to Signup
1. User clicks "Sign up" link on login page
2. Redirects to `/signup.html`

### From Signup to Login
1. User clicks "Login" link on signup page
2. After successful registration, redirects to login page
3. Can login with registered credentials

## Color Scheme (Matching Login Page)

- **Gradient Background**: `#E9D5FF → #A78BFA → #6366F1` (Purple to Indigo)
- **Register Button**: `#6366F1 → #8B5CF6` (Blue gradient)
- **Links**: `#6366F1` (Indigo blue)
- **Selected Gender**: `#EEF2FF` background with `#6366F1` text
- **Input Focus**: `#6366F1` border with light blue shadow

## File Structure

```
src/
├── signup.html           # Registration page
├── login.html            # Login page (updated link)
├── css/
│   ├── signup.css        # Registration styles
│   └── login.css         # Login styles
└── js/
    ├── signup.js         # Registration logic
    └── login.js          # Login logic (updated)
```

## Testing Instructions

### 1. Access Signup Page
- **From Login**: Click "Sign up" link
- **Direct URL**: `http://localhost:3000/signup.html`

### 2. Fill Registration Form
```
Full Name: John Doe
Mobile No: 9876543210
Organization Email: john@company.com
Gender: Select any option
Password: Test@123
Confirm Password: Test@123
✓ Check Terms & Conditions
```

### 3. Submit
- Click "Register" button
- See "Registering..." loading state
- Success alert appears
- Redirects to login page

### 4. Login with New Account
- Use registered email and password
- Login successfully
- Access main dashboard

## Validation Rules

| Field | Rules |
|-------|-------|
| Full Name | Required, any text |
| Mobile No | Required, exactly 10 digits, numbers only |
| Organization Email | Required, valid email format |
| Gender | Required, one option selected |
| Password | Required, minimum 6 characters |
| Confirm Password | Required, must match password |
| Terms | Required, must be checked |

## Mobile Responsive

### Desktop (>768px)
- Side-by-side layout
- Password fields in same row
- Larger form inputs

### Tablet (768px)
- Image stacks on top
- Password fields stack vertically
- Adjusted spacing

### Mobile (<480px)
- Full vertical stack
- Gender buttons full width
- Smaller fonts
- Touch-friendly sizes

## Data Storage

Registration data stored in localStorage:
```javascript
{
  fullName: "John Doe",
  mobile: "+919876543210",
  orgEmail: "john@company.com",
  gender: "male",
  registeredAt: "2025-10-13T..."
}
```

## Features Matching Screenshot

✅ **Full Name** field with placeholder
✅ **Mobile No** with India flag (+91)
✅ **Organization Email** field
✅ **Gender** radio buttons (3 options)
✅ **Password** side-by-side with Confirm Password
✅ **Eye icon** for password toggle
✅ **Terms checkbox** with policy links
✅ **Blue "Register" button** with gradient
✅ **"Already have an account? Login"** link
✅ **Purple gradient** on left side
✅ **"IMG Placeholder"** text in gradient
✅ **Same colors** as login page

## Security Notes

⚠️ **Current Implementation**: Demo mode
- Stores in localStorage (not secure for production)
- No backend API integration
- No email verification

🔒 **Production Recommendations**:
- Connect to backend API
- Add email verification (OTP)
- Hash passwords server-side
- Add CAPTCHA
- Implement rate limiting
- Use secure HTTP-only cookies
- Add phone number verification

## Customization

### Connect to Backend API
Edit `src/js/signup.js`:

```javascript
const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullName,
        mobile: '+91' + mobile,
        email: orgEmail,
        gender,
        password
    })
});

if (response.ok) {
    alert('Registration successful!');
    window.location.href = './login.html';
}
```

### Add More Countries
Update country code dropdown to support multiple countries.

### Email Verification
Add OTP verification step before completing registration.

## URLs

- **Signup Page**: `http://localhost:3000/signup.html`
- **Login Page**: `http://localhost:3000/login.html`
- **Main App**: `http://localhost:3000/index.html`

---

**Status**: ✅ Complete and Functional
**Created**: October 13, 2025
**Design**: Matches provided screenshot exactly
