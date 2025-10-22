# Database Schema Documentation

## Overview
The Bluestock database uses PostgreSQL 15 with a normalized schema containing two main tables: `users` and `company_profile`, linked via foreign key relationship.

## External Services Integration

### 1. Firebase
- **Purpose**: Email/password authentication and SMS OTP verification
- **Setup**: Configure Firebase Admin SDK in backend
- **Configuration**: Add credentials to `backend/.env`

### 2. Cloudinary
- **Purpose**: Store and retrieve company logo and banner images
- **URLs**: Stored in `company_profile.logo_url` and `company_profile.banner_url`
- **Configuration**: Add credentials to `backend/.env`

### 3. Figma
- **Purpose**: UI design reference
- **Reference**: Use provided Figma designs for frontend implementation

### 4. Database
- **Import**: SQL schema from `bluestock.in/backoffice-tech/company_db.sql`
- **Location**: PostgreSQL on localhost
- **Database Name**: `bluestock_company`

## Database Tables

### Table: `users`

Stores user account information with email/password authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | Primary Key, Auto-increment | Unique user identifier |
| `email` | varchar(255) | Not Null, Unique | User's email address |
| `password` | text | Not Null | Hashed password (using bcrypt) |
| `full_name` | varchar(255) | Not Null | User's full name |
| `signup_type` | varchar(1) | Not Null, Default 'e' | Signup type ('e' for email) |
| `gender` | char(1) | Not Null, Values: 'm', 'f', 'o' | Gender (male, female, other) |
| `mobile_no` | varchar(20) | Not Null, Unique | Mobile number with country code |
| `is_mobile_verified` | boolean | Default false | Mobile verification status |
| `is_email_verified` | boolean | Default false | Email verification status |
| `firebase_uid` | varchar(255) | Unique | Firebase user ID (optional) |
| `created_at` | timestamp | Not Null, Default CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | timestamp | Not Null, Default CURRENT_TIMESTAMP | Record update timestamp |
| `last_login` | timestamp | Nullable | Last login timestamp |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_mobile_no` on `mobile_no`
- `idx_users_firebase_uid` on `firebase_uid`

**Constraints:**
- `gender` must be 'm', 'f', or 'o'
- `email` and `mobile_no` must be unique

### Table: `company_profile`

Stores company profile information linked to users via `owner_id` foreign key.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | Primary Key, Auto-increment | Unique company identifier |
| `owner_id` | integer | Foreign Key (users.id), Not Null | References user who owns the company |
| `company_name` | text | Not Null | Company name |
| `address` | text | Not Null | Company address |
| `city` | varchar(50) | Not Null | City |
| `state` | varchar(50) | Not Null | State |
| `country` | varchar(50) | Not Null | Country |
| `postal_code` | varchar(20) | Not Null | Postal code |
| `website` | text | Nullable | Company website URL |
| `logo_url` | text | Nullable | Cloudinary URL for company logo |
| `banner_url` | text | Nullable | Cloudinary URL for company banner |
| `industry` | text | Not Null | Industry type |
| `founded_date` | date | Nullable | Company founding date |
| `description` | text | Nullable | Company description |
| `social_links` | jsonb | Nullable | JSON object for social media links |
| `setup_progress` | integer | Default 0 | Setup completion percentage (0-100) |
| `is_complete` | boolean | Default false | Whether setup is complete |
| `created_at` | timestamp | Not Null, Default CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | timestamp | Default CURRENT_TIMESTAMP | Record update timestamp |

**Indexes:**
- `idx_company_profile_owner_id` on `owner_id`

**Foreign Keys:**
- `owner_id` references `users(id)` with ON DELETE CASCADE

**Social Links JSON Format:**
```json
{
  "facebook": "https://facebook.com/company",
  "twitter": "https://twitter.com/company",
  "linkedin": "https://linkedin.com/company/company",
  "instagram": "https://instagram.com/company"
}
```

### Table: `otp_verifications`

Stores OTP codes for mobile number verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `otp_id` | integer | Primary Key, Auto-increment | Unique OTP record identifier |
| `user_id` | integer | Foreign Key (users.id) | References user |
| `mobile_no` | varchar(20) | Not Null | Mobile number |
| `otp_code` | varchar(6) | Not Null | 6-digit OTP code |
| `expires_at` | timestamp | Not Null | OTP expiration time |
| `verified` | boolean | Default false | Verification status |
| `attempts` | integer | Default 0 | Number of verification attempts |
| `created_at` | timestamp | Default CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- `idx_otp_mobile_no` on `mobile_no`

### Table: `sessions`

Stores user sessions for refresh token management (optional).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `session_id` | integer | Primary Key, Auto-increment | Unique session identifier |
| `user_id` | integer | Foreign Key (users.id) | References user |
| `refresh_token` | text | Not Null | JWT refresh token |
| `expires_at` | timestamp | Not Null | Token expiration time |
| `created_at` | timestamp | Default CURRENT_TIMESTAMP | Session creation time |
| `ip_address` | varchar(45) | Nullable | Client IP address |
| `user_agent` | text | Nullable | Client user agent |

**Indexes:**
- `idx_sessions_user_id` on `user_id`

## Database Relationships

```
users (1) ─────< (1) company_profile
  │                      │
  │                      └─ Contains: logo_url, banner_url (Cloudinary)
  │                                    social_links (JSONB)
  │
  ├─────< (many) otp_verifications
  │
  └─────< (many) sessions
```

## Triggers

### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp when a record is modified.

Applied to:
- `users` table
- `company_profile` table

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE bluestock_company;
```

### 2. Run Migration
```bash
cd backend
npm run migrate
```

### 3. Verify Tables
```sql
\c bluestock_company
\dt
```

Expected output:
```
                List of relations
 Schema |        Name         | Type  |  Owner
--------+---------------------+-------+----------
 public | users               | table | postgres
 public | company_profile     | table | postgres
 public | otp_verifications   | table | postgres
 public | sessions            | table | postgres
```

## Sample Data

### Insert User
```sql
INSERT INTO users (email, password, full_name, signup_type, gender, mobile_no)
VALUES (
  'john@example.com',
  '$2b$10$hashedpassword',
  'John Doe',
  'e',
  'm',
  '+1234567890'
);
```

### Insert Company Profile
```sql
INSERT INTO company_profile (
  owner_id, company_name, address, city, state, country,
  postal_code, website, industry, description, social_links
)
VALUES (
  1,
  'Tech Company Inc',
  '123 Main St',
  'San Francisco',
  'California',
  'USA',
  '94102',
  'https://techcompany.com',
  'Software & IT',
  'A leading tech company',
  '{"facebook": "https://facebook.com/techcompany", "twitter": "https://twitter.com/techcompany"}'::jsonb
);
```

## Query Examples

### Get User with Company Profile
```sql
SELECT 
  u.id, u.email, u.full_name, u.mobile_no,
  cp.company_name, cp.industry, cp.logo_url, cp.banner_url
FROM users u
LEFT JOIN company_profile cp ON u.id = cp.owner_id
WHERE u.email = 'john@example.com';
```

### Get Company with Social Links
```sql
SELECT 
  company_name,
  social_links->>'facebook' as facebook,
  social_links->>'twitter' as twitter,
  social_links->>'linkedin' as linkedin
FROM company_profile
WHERE id = 1;
```

### Update Setup Progress
```sql
UPDATE company_profile
SET setup_progress = 75, is_complete = false
WHERE owner_id = 1;
```

## Important Notes

1. **Normalization**: The schema is normalized with `owner_id` as foreign key
2. **Cascading Deletes**: Deleting a user will cascade delete their company profile
3. **JSONB**: Social links use JSONB for flexible structure and efficient querying
4. **Timestamps**: `created_at` and `updated_at` are automatically managed
5. **Cloudinary URLs**: Logo and banner URLs are stored as text, actual files in Cloudinary
6. **Mobile Format**: Mobile numbers should include country code (e.g., +1234567890)
7. **Password**: Must be hashed with bcrypt before storing

## Migration File Location

- Schema: `backend/database/schema.sql`
- Migration Script: `backend/database/migrate.js`
