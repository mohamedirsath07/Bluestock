# Bluestock API Documentation

**Base URL**: `http://localhost:5000/api`

All APIs return JSON responses with proper HTTP status codes. Protected endpoints require a JWT token in the `Authorization` header as `Bearer <token>`.

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Company Profile Endpoints](#company-profile-endpoints)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Request Examples](#request-examples)

---

## 🔐 Authentication Endpoints

### 1. Register User

Register a new user account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "company@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "gender": "m",
  "mobile_no": "+919876543210",
  "signup_type": "e"
}
```

**Field Requirements**:
- `email`: Valid email address (required)
- `password`: Min 8 characters with uppercase, lowercase, and number (required)
- `full_name`: 2-255 characters (required)
- `gender`: Must be `m` (male), `f` (female), or `o` (other) (required)
- `mobile_no`: Valid international format with country code (required)
- `signup_type`: `e` for email or `g` for Google (optional, default: `e`)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully. Please verify mobile OTP.",
  "data": {
    "user_id": 1
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "User already exists with this email or mobile number"
}
```

---

### 2. Login User

Authenticate user and receive JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "company@example.com",
  "password": "Password123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": 1,
    "email": "company@example.com",
    "full_name": "John Doe",
    "mobile_no": "+919876543210",
    "is_email_verified": false,
    "is_mobile_verified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Verify Email

Verify user's email address via Firebase link.

- **URL**: `/api/auth/verify-email`
- **Method**: `GET`
- **Authentication**: None (Public)

**Query Parameters**:
- `email`: User's email address
- `verificationCode`: Firebase verification code

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Email verification failed",
  "error": "Invalid verification code"
}
```

---

### 4. Verify Mobile

Verify user's mobile number via Firebase OTP.

- **URL**: `/api/auth/verify-mobile`
- **Method**: `POST`
- **Authentication**: None (Public)

**Request Body**:
```json
{
  "mobile_no": "+919876543210",
  "otp_code": "123456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Mobile number verified successfully"
}
```

**Error Responses**:

*Invalid OTP* (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

*Expired OTP* (400 Bad Request):
```json
{
  "success": false,
  "message": "OTP expired"
}
```

*Max Attempts* (400 Bad Request):
```json
{
  "success": false,
  "message": "Maximum verification attempts exceeded"
}
```

---

## 🏢 Company Profile Endpoints

All company endpoints require JWT authentication.

**Authorization Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Register Company Profile

Submit company profile details for the first time.

- **URL**: `/api/company/register`
- **Method**: `POST`
- **Authentication**: JWT Required

**Request Body**:
```json
{
  "company_name": "Tech Innovations Inc.",
  "address": "123 Tech Street, Silicon Valley",
  "city": "San Francisco",
  "state": "California",
  "country": "United States",
  "postal_code": "94105",
  "website": "https://techinnovations.com",
  "industry": "Software Development",
  "founded_date": "2020-01-15",
  "description": "We are a leading software development company..."
}
```

**Field Requirements**:
- `company_name`: 2-255 characters (required)
- `address`: Text (required)
- `city`: 2-50 characters (required)
- `state`: 2-50 characters (required)
- `country`: 2-50 characters (required)
- `postal_code`: 3-20 characters (required)
- `website`: Valid URL with protocol (optional)
- `industry`: Text (required)
- `founded_date`: ISO date format YYYY-MM-DD (optional)
- `description`: Max 2000 characters (optional)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Company profile registered successfully",
  "data": {
    "id": 1,
    "owner_id": 1,
    "company_name": "Tech Innovations Inc.",
    "address": "123 Tech Street, Silicon Valley",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "postal_code": "94105",
    "website": "https://techinnovations.com",
    "logo_url": null,
    "banner_url": null,
    "industry": "Software Development",
    "founded_date": "2020-01-15",
    "description": "We are a leading software development company...",
    "social_links": null,
    "setup_progress": 0,
    "is_complete": false,
    "created_at": "2025-10-22T10:30:00Z",
    "updated_at": "2025-10-22T10:30:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Company profile already exists"
}
```

---

### 6. Get Company Profile

Fetch company profile details.

- **URL**: `/api/company/profile`
- **Method**: `GET`
- **Authentication**: JWT Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "owner_id": 1,
    "company_name": "Tech Innovations Inc.",
    "address": "123 Tech Street, Silicon Valley",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "postal_code": "94105",
    "website": "https://techinnovations.com",
    "logo_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/logo.png",
    "banner_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.png",
    "industry": "Software Development",
    "founded_date": "2020-01-15",
    "description": "We are a leading software development company...",
    "social_links": {
      "facebook": "https://facebook.com/techinnovations",
      "twitter": "https://twitter.com/techinnovations",
      "linkedin": "https://linkedin.com/company/techinnovations"
    },
    "setup_progress": 85,
    "is_complete": false,
    "created_at": "2025-10-22T10:30:00Z",
    "updated_at": "2025-10-22T11:45:00Z",
    "email": "company@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Company profile not found"
}
```

---

### 7. Update Company Profile

Update existing company profile details.

- **URL**: `/api/company/profile`
- **Method**: `PUT`
- **Authentication**: JWT Required

**Request Body** (all fields optional):
```json
{
  "company_name": "Tech Innovations Inc.",
  "address": "456 Innovation Avenue",
  "city": "San Francisco",
  "state": "California",
  "country": "United States",
  "postal_code": "94105",
  "website": "https://techinnovations.com",
  "industry": "AI & Machine Learning",
  "founded_date": "2020-01-15",
  "description": "Updated description...",
  "social_links": {
    "facebook": "https://facebook.com/techinnovations",
    "twitter": "https://twitter.com/techinnovations",
    "linkedin": "https://linkedin.com/company/techinnovations",
    "instagram": "https://instagram.com/techinnovations"
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Company profile updated successfully",
  "data": {
    "id": 1,
    "owner_id": 1,
    "company_name": "Tech Innovations Inc.",
    "address": "456 Innovation Avenue",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "postal_code": "94105",
    "website": "https://techinnovations.com",
    "logo_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/logo.png",
    "banner_url": "https://res.cloudinary.com/demo/image/upload/v1234567890/banner.png",
    "industry": "AI & Machine Learning",
    "founded_date": "2020-01-15",
    "description": "Updated description...",
    "social_links": {
      "facebook": "https://facebook.com/techinnovations",
      "twitter": "https://twitter.com/techinnovations",
      "linkedin": "https://linkedin.com/company/techinnovations",
      "instagram": "https://instagram.com/techinnovations"
    },
    "setup_progress": 100,
    "is_complete": true,
    "created_at": "2025-10-22T10:30:00Z",
    "updated_at": "2025-10-22T12:00:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Company profile not found"
}
```

---

### 8. Upload Company Logo

Upload company logo to Cloudinary.

- **URL**: `/api/company/upload-logo`
- **Method**: `POST`
- **Authentication**: JWT Required

**Request Body**:
```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Field Requirements**:
- `imageData`: Base64 encoded image string with data URI prefix
- Supported formats: JPG, PNG, JPEG, WEBP
- Image will be resized to max 400x400px

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/bluestock/companies/1/logo/abc123.png",
    "public_id": "bluestock/companies/1/logo/abc123"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Company profile not found"
}
```

---

### 9. Upload Company Banner

Upload company banner to Cloudinary.

- **URL**: `/api/company/upload-banner`
- **Method**: `POST`
- **Authentication**: JWT Required

**Request Body**:
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Field Requirements**:
- `imageData`: Base64 encoded image string with data URI prefix
- Supported formats: JPG, PNG, JPEG, WEBP
- Image will be resized to max 1520x400px

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Company banner uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/bluestock/companies/1/banner/xyz789.jpg",
    "public_id": "bluestock/companies/1/banner/xyz789"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Company profile not found"
}
```

---

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [ ... ] // For validation errors
}
```

---

## ⚠️ Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Invalid or missing authentication |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |

---

## 📝 Request Examples

### Using cURL

**Register User**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@example.com",
    "password": "Password123!",
    "full_name": "John Doe",
    "gender": "m",
    "mobile_no": "+919876543210",
    "signup_type": "e"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@example.com",
    "password": "Password123!"
  }'
```

**Get Company Profile** (with JWT):
```bash
curl -X GET http://localhost:5000/api/company/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Update Company Profile** (with JWT):
```bash
curl -X PUT http://localhost:5000/api/company/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "company_name": "Tech Innovations Inc.",
    "address": "456 Innovation Avenue",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "postal_code": "94105"
  }'
```

---

### Using JavaScript (Fetch API)

**Register User**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'company@example.com',
    password: 'Password123!',
    full_name: 'John Doe',
    gender: 'm',
    mobile_no: '+919876543210',
    signup_type: 'e'
  })
});

const data = await response.json();
console.log(data);
```

**Login**:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'company@example.com',
    password: 'Password123!'
  })
});

const data = await response.json();
const token = data.data.token;
```

**Get Company Profile**:
```javascript
const response = await fetch('http://localhost:5000/api/company/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data);
```

**Upload Logo**:
```javascript
// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const logoFile = document.getElementById('logo-input').files[0];
const imageData = await fileToBase64(logoFile);

const response = await fetch('http://localhost:5000/api/company/upload-logo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ imageData })
});

const data = await response.json();
console.log(data.data.url); // Cloudinary URL
```

---

## 🔒 Authentication Flow

1. **Register** → Receive `user_id`
2. **Verify Mobile** → Send OTP via Firebase
3. **Login** → Receive JWT `token`
4. **Use Token** → Include in `Authorization` header for protected routes
5. **Token Expiry** → 90 days (as configured in JWT_EXPIRES_IN)

---

## 📌 Important Notes

1. **JWT Token**: 
   - Valid for 90 days
   - Must be included as `Bearer <token>` in Authorization header
   - Automatically validated by backend middleware

2. **Mobile Number Format**:
   - Must include country code (e.g., `+919876543210`)
   - Validated using `libphonenumber-js`

3. **Password Requirements**:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

4. **Image Upload**:
   - Send as base64 encoded string with data URI
   - Logo: Max 400x400px, auto-quality
   - Banner: Max 1520x400px, auto-quality
   - Supported formats: JPG, PNG, JPEG, WEBP

5. **Social Links**:
   - Stored as JSONB in database
   - Send as JSON object with platform keys
   - Example: `{"facebook": "url", "twitter": "url"}`

6. **Setup Progress**:
   - Automatically calculated based on filled fields
   - Range: 0-100
   - Updates automatically on profile update

---

## 🧪 Testing

Use tools like:
- **Postman**: Import endpoints and test
- **Thunder Client** (VS Code): Test directly in editor
- **cURL**: Command-line testing
- **Frontend Integration**: Use Axios or Fetch API

---

## 📞 Support

For issues or questions:
- Check `DATABASE_QUICK_REFERENCE.md` for database queries
- Check `SETUP_GUIDE_FULLSTACK.md` for environment setup
- Check backend logs in development mode

---

**Last Updated**: October 22, 2025
