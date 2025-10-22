# Quick Database Reference Card

## 📊 Tables Overview

### `users` (Parent Table)
```sql
id, email, password, full_name, signup_type, gender, 
mobile_no, is_mobile_verified, is_email_verified, 
firebase_uid, created_at, updated_at, last_login
```

### `company_profile` (Child Table - linked via owner_id)
```sql
id, owner_id (FK), company_name, address, city, state, 
country, postal_code, website, logo_url, banner_url, 
industry, founded_date, description, social_links (JSONB),
setup_progress, is_complete, created_at, updated_at
```

### `otp_verifications`
```sql
otp_id, user_id (FK), mobile_no, otp_code, expires_at,
verified, attempts, created_at
```

### `sessions`
```sql
session_id, user_id (FK), refresh_token, expires_at,
created_at, ip_address, user_agent
```

---

## 🔑 Key Points

| Feature | Detail |
|---------|--------|
| **Database** | PostgreSQL 15 on localhost |
| **DB Name** | `bluestock_company` |
| **Relationship** | users (1) → (1) company_profile |
| **Foreign Key** | company_profile.owner_id → users.id |
| **Social Links** | JSONB format in single column |
| **Images** | Cloudinary URLs in logo_url, banner_url |
| **Auth** | Firebase for SMS OTP, bcrypt for passwords |

---

## ⚡ Quick Commands

### Create Database
```bash
psql -U postgres -c "CREATE DATABASE bluestock_company;"
```

### Run Migration
```bash
cd backend && npm run migrate
```

### Connect to Database
```bash
psql -U postgres -d bluestock_company
```

### View Tables
```sql
\dt
```

### Describe Table
```sql
\d users
\d company_profile
```

---

## 📝 Common Queries

### Get User with Company
```sql
SELECT u.*, cp.company_name, cp.logo_url, cp.banner_url
FROM users u
LEFT JOIN company_profile cp ON u.id = cp.owner_id
WHERE u.email = 'user@example.com';
```

### Insert User
```sql
INSERT INTO users (email, password, full_name, gender, mobile_no)
VALUES ('user@example.com', 'hashed_password', 'John Doe', 'm', '+1234567890')
RETURNING id;
```

### Insert Company
```sql
INSERT INTO company_profile (owner_id, company_name, address, city, state, country, postal_code, industry)
VALUES (1, 'Company Name', '123 Street', 'City', 'State', 'Country', '12345', 'Industry')
RETURNING id;
```

### Update Social Links (JSONB)
```sql
UPDATE company_profile
SET social_links = '{"facebook": "url", "twitter": "url"}'::jsonb
WHERE owner_id = 1;
```

### Query Social Links
```sql
SELECT 
  company_name,
  social_links->>'facebook' as facebook_url,
  social_links->>'twitter' as twitter_url
FROM company_profile
WHERE id = 1;
```

---

## 🎯 Constraints

- `users.email` → UNIQUE, NOT NULL
- `users.mobile_no` → UNIQUE, NOT NULL
- `users.gender` → CHECK ('m', 'f', 'o')
- `company_profile.owner_id` → FK to users(id), CASCADE DELETE

---

## 🔗 External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| **Firebase** | Email auth + SMS OTP | backend/.env |
| **Cloudinary** | Logo/banner storage | backend/.env |
| **PostgreSQL** | Database | localhost:5432 |

---

## 📦 Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluestock_company
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=90d

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Create database
psql -U postgres -c "CREATE DATABASE bluestock_company;"

# 4. Run migration
npm run migrate

# 5. Start server
npm run dev
```

---

## ✅ Schema Validation

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check foreign keys
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

**Keep this card handy for quick reference during development!** 🎯
