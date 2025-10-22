# 🚀 Bluestock API Quick Reference

## Base URL
```
http://localhost:5000/api
```

---

## 🔓 Public Endpoints (No Auth Required)

### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "gender": "m",
  "mobile_no": "+919876543210",
  "signup_type": "e"
}

→ Returns: { success: true, data: { user_id: 1 } }
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "Password123!"
}

→ Returns: { success: true, data: { token: "jwt_token...", user_id: 1 } }
```

### 3. Verify Email
```http
GET /auth/verify-email?email=test@example.com&verificationCode=123456

→ Returns: { success: true, message: "Email verified successfully" }
```

### 4. Verify Mobile OTP
```http
POST /auth/verify-mobile
Content-Type: application/json

{
  "mobile_no": "+919876543210",
  "otp_code": "123456"
}

→ Returns: { success: true, message: "Mobile verified successfully" }
```

---

## 🔒 Protected Endpoints (JWT Required)

**Add to all requests:**
```http
Authorization: Bearer <your_jwt_token>
```

### 5. Get Current User
```http
GET /auth/me

→ Returns: { success: true, data: { id, email, full_name, ... } }
```

### 6. Register Company Profile
```http
POST /company/register
Content-Type: application/json

{
  "company_name": "Tech Co",
  "address": "123 Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "postal_code": "400001",
  "website": "https://example.com",
  "industry": "Technology",
  "founded_date": "2020-01-15",
  "description": "Description here..."
}

→ Returns: { success: true, data: { id, owner_id, ... } }
```

### 7. Get Company Profile
```http
GET /company/profile

→ Returns: { success: true, data: { id, company_name, logo_url, ... } }
```

### 8. Update Company Profile
```http
PUT /company/profile
Content-Type: application/json

{
  "company_name": "Updated Name",
  "description": "New description",
  "social_links": {
    "facebook": "https://facebook.com/company",
    "twitter": "https://twitter.com/company"
  }
}

→ Returns: { success: true, data: { ...updated_profile, setup_progress: 85 } }
```

### 9. Upload Logo
```http
POST /company/upload-logo
Content-Type: application/json

{
  "imageData": "data:image/png;base64,iVBORw0KGgo..."
}

→ Returns: { success: true, data: { url: "cloudinary_url", public_id: "..." } }
```

### 10. Upload Banner
```http
POST /company/upload-banner
Content-Type: application/json

{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZ..."
}

→ Returns: { success: true, data: { url: "cloudinary_url", public_id: "..." } }
```

---

## 📋 Field Requirements

### Register User
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| email | string | ✅ | Valid email format |
| password | string | ✅ | Min 8 chars, uppercase, lowercase, number |
| full_name | string | ✅ | 2-255 characters |
| gender | string | ✅ | 'm', 'f', or 'o' |
| mobile_no | string | ✅ | International format with country code |
| signup_type | string | ❌ | 'e' or 'g' (default: 'e') |

### Company Profile
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| company_name | string | ✅ | 2-255 characters |
| address | string | ✅ | Text |
| city | string | ✅ | 2-50 characters |
| state | string | ✅ | 2-50 characters |
| country | string | ✅ | 2-50 characters |
| postal_code | string | ✅ | 3-20 characters |
| website | string | ❌ | Valid URL with protocol |
| industry | string | ✅ | Text |
| founded_date | date | ❌ | ISO format (YYYY-MM-DD) |
| description | string | ❌ | Max 2000 characters |
| social_links | object | ❌ | JSON object |

---

## 🔑 Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

---

## 🧪 Quick Test Commands

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","full_name":"Test User","gender":"m","mobile_no":"+919876543210"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

### Test Protected Route
```bash
# Save token from login response
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/company/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💡 Common Errors

### 400 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 - Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Company profile not found"
}
```

---

## 📱 Social Links Format

Store as JSON object in `social_links` field:

```json
{
  "facebook": "https://facebook.com/yourcompany",
  "twitter": "https://twitter.com/yourcompany",
  "linkedin": "https://linkedin.com/company/yourcompany",
  "instagram": "https://instagram.com/yourcompany",
  "youtube": "https://youtube.com/@yourcompany"
}
```

---

## 🖼️ Image Upload Format

Convert file to base64 with data URI:

```javascript
// JavaScript example
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const file = document.getElementById('fileInput').files[0];
const imageData = await fileToBase64(file);

// Send to API
await fetch('/api/company/upload-logo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ imageData })
});
```

---

## ⏱️ JWT Token

- **Validity**: 90 days
- **Format**: `Bearer <token>`
- **Header**: `Authorization`
- **Storage**: Store in localStorage/sessionStorage
- **Renewal**: Login again when expired

---

## 📊 Setup Progress

Auto-calculated based on filled fields:

```
Tracked fields (13 total):
- logo_url
- banner_url
- company_name
- address
- city
- state
- country
- postal_code
- website
- industry
- founded_date
- description
- social_links

Progress = (filled_fields / 13) * 100
```

---

## 🎯 Complete Flow

```
1. Register User
   POST /auth/register
   → Receive user_id

2. Verify Mobile (Optional but recommended)
   POST /auth/verify-mobile
   → Mobile verified

3. Login
   POST /auth/login
   → Receive JWT token

4. Register Company
   POST /company/register (with JWT)
   → Company profile created

5. Upload Images
   POST /company/upload-logo (with JWT)
   POST /company/upload-banner (with JWT)
   → Images uploaded to Cloudinary

6. Update Profile
   PUT /company/profile (with JWT)
   → Profile updated with social links

7. Check Progress
   GET /company/profile (with JWT)
   → View setup_progress (0-100)
```

---

## 📚 Documentation

- **Full API Docs**: `API_DOCUMENTATION.md`
- **Database Schema**: `DATABASE_SCHEMA.md`
- **Setup Guide**: `SETUP_GUIDE_FULLSTACK.md`
- **Quick DB Reference**: `DATABASE_QUICK_REFERENCE.md`

---

**Server**: `npm run dev` (Port 5000)  
**Database**: PostgreSQL on localhost:5432  
**Frontend**: React on localhost:5173  

---

**Updated**: October 22, 2025
