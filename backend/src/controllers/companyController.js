import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

// Calculate setup progress
const calculateProgress = (company) => {
  const fields = [
    company.logo_url,
    company.banner_url,
    company.company_name,
    company.address,
    company.city,
    company.state,
    company.country,
    company.postal_code,
    company.website,
    company.industry,
    company.founded_date,
    company.description,
    company.social_links,
  ];

  const filledFields = fields.filter(field => field !== null && field !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

// Register company profile
export const registerCompany = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const {
      company_name,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      industry,
      founded_date,
      description,
    } = req.body;

    await client.query('BEGIN');

    // Check if company profile already exists
    const existingCompany = await client.query(
      'SELECT id FROM company_profile WHERE owner_id = $1',
      [userId]
    );

    if (existingCompany.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Company profile already exists',
      });
    }

    // Create company profile
    const result = await client.query(
      `INSERT INTO company_profile (
        owner_id, company_name, address, city, state, country, 
        postal_code, website, industry, founded_date, description, setup_progress
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [userId, company_name, address, city, state, country, postal_code, 
       website, industry, founded_date, description, 0]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Company profile registered successfully',
      data: result.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register company profile',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT cp.*, u.email, u.full_name 
       FROM company_profile cp
       LEFT JOIN users u ON cp.owner_id = u.id
       WHERE cp.owner_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company profile',
      error: error.message,
    });
  }
};

// Update company profile
export const updateCompanyProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const {
      company_name,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      industry,
      founded_date,
      description,
      social_links,
    } = req.body;

    await client.query('BEGIN');

    // Check if company exists
    const companyResult = await client.query(
      'SELECT id FROM company_profile WHERE owner_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    const companyId = companyResult.rows[0].id;

    // Update company profile
    const updateResult = await client.query(
      `UPDATE company_profile
       SET company_name = COALESCE($1, company_name),
           address = COALESCE($2, address),
           city = COALESCE($3, city),
           state = COALESCE($4, state),
           country = COALESCE($5, country),
           postal_code = COALESCE($6, postal_code),
           website = COALESCE($7, website),
           industry = COALESCE($8, industry),
           founded_date = COALESCE($9, founded_date),
           description = COALESCE($10, description),
           social_links = COALESCE($11::jsonb, social_links)
       WHERE id = $12
       RETURNING *`,
      [
        company_name,
        address,
        city,
        state,
        country,
        postal_code,
        website,
        industry,
        founded_date,
        description,
        social_links ? JSON.stringify(social_links) : null,
        companyId,
      ]
    );

    const updatedCompany = updateResult.rows[0];

    // Calculate and update progress
    const progress = calculateProgress(updatedCompany);
    await client.query(
      `UPDATE company_profile SET setup_progress = $1, is_complete = $2 WHERE id = $3`,
      [progress, progress === 100, companyId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: {
        ...updatedCompany,
        setup_progress: progress,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company profile',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Upload company logo to Cloudinary
export const uploadLogo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { imageData } = req.body; // base64 encoded image

    // Get company ID
    const companyResult = await pool.query(
      'SELECT id FROM company_profile WHERE owner_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    const companyId = companyResult.rows[0].id;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: `bluestock/companies/${companyId}/logo`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
    });

    // Update company profile with logo URL
    await pool.query(
      `UPDATE company_profile SET logo_url = $1 WHERE id = $2`,
      [uploadResult.secure_url, companyId]
    );

    res.json({
      success: true,
      message: 'Company logo uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message,
    });
  }
};

// Upload company banner to Cloudinary
export const uploadBanner = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { imageData } = req.body; // base64 encoded image

    // Get company ID
    const companyResult = await pool.query(
      'SELECT id FROM company_profile WHERE owner_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    const companyId = companyResult.rows[0].id;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: `bluestock/companies/${companyId}/banner`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 1520, height: 400, crop: 'limit', quality: 'auto' }],
    });

    // Update company profile with banner URL
    await pool.query(
      `UPDATE company_profile SET banner_url = $1 WHERE id = $2`,
      [uploadResult.secure_url, companyId]
    );

    res.json({
      success: true,
      message: 'Company banner uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error('Upload banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload banner',
      error: error.message,
    });
  }
};


