# ✅ Database Schema Updated!

## Summary of Changes

The database schema has been updated to match the exact requirements provided. Here's what changed:

### 🗄️ **New Database Schema (PostgreSQL 15)**

#### **Table: `users`**
Updated from generic structure to match exact specifications:
- ✅ Changed `user_id` → `id`
- ✅ Changed `password_hash` → `password`
- ✅ Changed `phone` → `mobile_no`
- ✅ Changed `email_verified` → `is_email_verified`
- ✅ Changed `phone_verified` → `is_mobile_verified`
- ✅ Added `full_name` (required)
- ✅ Added `signup_type` (default 'e' for email)
- ✅ Added `gender` (m/f/o with CHECK constraint)

#### **Table: `company_profile`**
Completely redesigned to match specifications:
- ✅ Changed from `companies` → `company_profile`
- ✅ Changed `user_id` → `owner_id` (Foreign Key to users.id)
- ✅ Added required address fields: `address`, `city`, `state`, `country`, `postal_code`
- ✅ Changed `company_website` → `website`
- ✅ Changed `industry_type` → `industry`
- ✅ Changed `establishment_year` → `founded_date` (DATE type)
- ✅ Changed `about_us` → `description`
- ✅ **Removed** `social_media_links` table
- ✅ **Added** `social_links` JSONB column (stores all social links in one column)
- ✅ Kept `logo_url` and `banner_url` for Cloudinary URLs

### 🔗 **External Services Integration**

#### **1. Firebase**
- ✅ Email/password authentication
- ✅ SMS OTP verification
- ✅ Configuration added in `.env.example`

#### **2. Cloudinary**
- ✅ Logo and banner image storage
- ✅ URLs stored in `logo_url` and `banner_url` columns
- ✅ Configuration added in `.env.example`

#### **3. Figma**
- ✅ UI design reference documented
- ✅ Frontend implementation follows Figma designs

#### **4. Database**
- ✅ PostgreSQL 15 on localhost
- ✅ Database name: `bluestock_company`
- ✅ Schema ready for import from `bluestock.in/backoffice-tech/company_db.sql`

### 📋 **Key Database Features**

#### **Normalization**
```
users (parent)
  └── company_profile (child via owner_id FK)
```

#### **JSONB Social Links Format**
```json
{
  "facebook": "https://facebook.com/company",
  "twitter": "https://twitter.com/company",
  "linkedin": "https://linkedin.com/company/name",
  "instagram": "https://instagram.com/company"
}
```

#### **Constraints**
- `users.email` - UNIQUE, NOT NULL
- `users.mobile_no` - UNIQUE, NOT NULL
- `users.gender` - CHECK (m, f, o)
- `company_profile.owner_id` - Foreign Key to users(id) with CASCADE DELETE
- All required fields marked as NOT NULL

#### **Indexes**
- `idx_users_email` - Fast email lookup
- `idx_users_mobile_no` - Fast mobile lookup
- `idx_users_firebase_uid` - Firebase integration
- `idx_company_profile_owner_id` - Fast company lookup by owner

#### **Triggers**
- Auto-update `updated_at` timestamp on users table
- Auto-update `updated_at` timestamp on company_profile table

### 📁 **Files Updated**

1. **backend/database/schema.sql**
   - Complete schema rewrite
   - Matches exact specifications
   - Includes comments and documentation

2. **backend/database/DATABASE_SCHEMA.md**
   - Comprehensive documentation
   - Table descriptions
   - Sample queries
   - Setup instructions

3. **backend/.env.example**
   - Updated comments
   - Added service descriptions
   - Clear configuration guide

### 🚀 **How to Use the New Schema**

#### **Step 1: Create Database**
```sql
CREATE DATABASE bluestock_company;
```

#### **Step 2: Run Migration**
```bash
cd backend
npm run migrate
```

#### **Step 3: Verify Tables**
```sql
\c bluestock_company
\dt

-- Expected output:
-- users
-- company_profile
-- otp_verifications
-- sessions
```

#### **Step 4: Check Schema**
```sql
\d users
\d company_profile
```

### 📊 **Sample Data Insert**

#### **Create User**
```sql
INSERT INTO users (email, password, full_name, signup_type, gender, mobile_no)
VALUES (
  'john@example.com',
  '$2b$10$hashedpasswordhere',
  'John Doe',
  'e',
  'm',
  '+1234567890'
)
RETURNING id;
```

#### **Create Company Profile**
```sql
INSERT INTO company_profile (
  owner_id, company_name, address, city, state, country,
  postal_code, website, industry, description, social_links
)
VALUES (
  1,  -- user id from above
  'Tech Innovations Inc',
  '123 Silicon Valley Blvd',
  'San Francisco',
  'California',
  'USA',
  '94102',
  'https://techinnovations.com',
  'Software & IT',
  'Leading provider of innovative software solutions',
  '{"facebook": "https://facebook.com/techinnovations", "twitter": "https://twitter.com/techinnovations"}'::jsonb
);
```

### 🔍 **Query Examples**

#### **Get User with Company**
```sql
SELECT 
  u.id, u.email, u.full_name, u.mobile_no,
  u.is_mobile_verified, u.is_email_verified,
  cp.company_name, cp.industry, 
  cp.logo_url, cp.banner_url, cp.social_links
FROM users u
LEFT JOIN company_profile cp ON u.id = cp.owner_id
WHERE u.email = 'john@example.com';
```

#### **Update Company with Cloudinary URLs**
```sql
UPDATE company_profile
SET 
  logo_url = 'https://res.cloudinary.com/your-cloud/image/upload/v1234/logo.png',
  banner_url = 'https://res.cloudinary.com/your-cloud/image/upload/v1234/banner.jpg'
WHERE owner_id = 1;
```

#### **Add Social Links**
```sql
UPDATE company_profile
SET social_links = jsonb_build_object(
  'facebook', 'https://facebook.com/company',
  'twitter', 'https://twitter.com/company',
  'linkedin', 'https://linkedin.com/company/name',
  'instagram', 'https://instagram.com/company'
)
WHERE owner_id = 1;
```

### 📚 **Documentation Files**

- **DATABASE_SCHEMA.md** - Complete schema documentation
- **schema.sql** - SQL migration file
- **.env.example** - Environment configuration guide

### ✅ **Schema Compliance Checklist**

- [x] Users table matches exact specifications
- [x] Company_profile table matches exact specifications
- [x] Foreign key relationship (owner_id) implemented
- [x] All required columns present
- [x] Data types match specifications
- [x] Constraints properly defined
- [x] Indexes created for performance
- [x] Triggers for timestamp updates
- [x] JSONB for social links
- [x] Cloudinary URL storage
- [x] Firebase UID support
- [x] OTP verification table
- [x] Sessions table for tokens

### 🎯 **Next Steps**

1. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Migration**
   ```bash
   npm run migrate
   ```

4. **Start Backend**
   ```bash
   npm run dev
   ```

5. **Test Database**
   ```bash
   psql -U postgres -d bluestock_company
   \dt
   SELECT * FROM users;
   SELECT * FROM company_profile;
   ```

### 🔐 **Important Notes**

1. **Passwords**: Must be hashed with bcrypt before storing in `users.password`
2. **Mobile Numbers**: Must include country code (e.g., +1234567890)
3. **Social Links**: Store as JSONB for flexibility and efficient querying
4. **Cloudinary**: Only URLs stored in database, actual files in Cloudinary
5. **Firebase UID**: Optional field for Firebase Authentication integration
6. **Gender**: Must be 'm', 'f', or 'o' (enforced by CHECK constraint)
7. **Cascade Delete**: Deleting a user will automatically delete their company profile

---

## 🎉 Database Schema Successfully Updated!

Your PostgreSQL database schema now matches the exact specifications provided, including:
- ✅ Proper table structure (users, company_profile)
- ✅ Foreign key relationships
- ✅ JSONB for social links
- ✅ Cloudinary URL storage
- ✅ Firebase integration support
- ✅ Complete normalization

**Ready for development!** 🚀
