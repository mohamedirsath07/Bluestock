import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

// Calculate setup progress
const calculateProgress = (company) => {
  const fields = [
    company.logo_url,
    company.banner_url,
    company.company_name,
    company.about_us,
    company.organization_type,
    company.industry_type,
    company.team_size,
    company.establishment_year,
    company.company_website,
    company.company_vision,
    company.map_location,
    company.contact_phone,
    company.contact_email,
  ];

  const filledFields = fields.filter(field => field !== null && field !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

// Get company information
export const getCompany = async (req, res) => {
  try {
    const userId = req.user.userId;

    const companyResult = await pool.query(
      `SELECT * FROM companies WHERE user_id = $1`,
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const company = companyResult.rows[0];

    // Get social media links
    const socialResult = await pool.query(
      `SELECT platform, profile_url FROM social_media_links WHERE company_id = $1`,
      [company.company_id]
    );

    res.json({
      success: true,
      data: {
        ...company,
        socialMediaLinks: socialResult.rows,
      },
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message,
    });
  }
};

// Update company information
export const updateCompany = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const {
      companyName,
      aboutUs,
      organizationType,
      industryType,
      teamSize,
      establishmentYear,
      companyWebsite,
      companyVision,
      mapLocation,
      contactPhone,
      contactEmail,
    } = req.body;

    await client.query('BEGIN');

    // Get company ID
    const companyResult = await client.query(
      'SELECT company_id FROM companies WHERE user_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const companyId = companyResult.rows[0].company_id;

    // Update company
    const updateResult = await client.query(
      `UPDATE companies
       SET company_name = COALESCE($1, company_name),
           about_us = COALESCE($2, about_us),
           organization_type = COALESCE($3, organization_type),
           industry_type = COALESCE($4, industry_type),
           team_size = COALESCE($5, team_size),
           establishment_year = COALESCE($6, establishment_year),
           company_website = COALESCE($7, company_website),
           company_vision = COALESCE($8, company_vision),
           map_location = COALESCE($9, map_location),
           contact_phone = COALESCE($10, contact_phone),
           contact_email = COALESCE($11, contact_email)
       WHERE company_id = $12
       RETURNING *`,
      [
        companyName,
        aboutUs,
        organizationType,
        industryType,
        teamSize,
        establishmentYear,
        companyWebsite,
        companyVision,
        mapLocation,
        contactPhone,
        contactEmail,
        companyId,
      ]
    );

    const updatedCompany = updateResult.rows[0];

    // Calculate and update progress
    const progress = calculateProgress(updatedCompany);
    await client.query(
      `UPDATE companies SET setup_progress = $1, is_complete = $2 WHERE company_id = $3`,
      [progress, progress === 100, companyId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: {
        ...updatedCompany,
        setup_progress: progress,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// Upload company images (logo/banner) to Cloudinary
export const uploadImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { imageType, imageData } = req.body; // imageType: 'logo' or 'banner', imageData: base64

    if (!['logo', 'banner'].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "logo" or "banner"',
      });
    }

    // Get company ID
    const companyResult = await pool.query(
      'SELECT company_id FROM companies WHERE user_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const companyId = companyResult.rows[0].company_id;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: `bluestock/companies/${companyId}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: imageType === 'logo' 
        ? [{ width: 400, height: 400, crop: 'limit' }]
        : [{ width: 1520, height: 400, crop: 'limit' }],
    });

    // Update company with image URL
    const field = imageType === 'logo' ? 'logo_url' : 'banner_url';
    await pool.query(
      `UPDATE companies SET ${field} = $1 WHERE company_id = $2`,
      [uploadResult.secure_url, companyId]
    );

    res.json({
      success: true,
      message: `${imageType} uploaded successfully`,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

// Add social media link
export const addSocialLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { platform, profileUrl } = req.body;

    // Get company ID
    const companyResult = await pool.query(
      'SELECT company_id FROM companies WHERE user_id = $1',
      [userId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const companyId = companyResult.rows[0].company_id;

    // Add social link
    const result = await pool.query(
      `INSERT INTO social_media_links (company_id, platform, profile_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, platform, profileUrl]
    );

    res.status(201).json({
      success: true,
      message: 'Social media link added successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add social media link',
      error: error.message,
    });
  }
};

// Delete social media link
export const deleteSocialLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { linkId } = req.params;

    // Verify ownership
    const result = await pool.query(
      `DELETE FROM social_media_links
       WHERE link_id = $1
       AND company_id IN (SELECT company_id FROM companies WHERE user_id = $2)
       RETURNING *`,
      [linkId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Social media link not found',
      });
    }

    res.json({
      success: true,
      message: 'Social media link deleted successfully',
    });
  } catch (error) {
    console.error('Delete social link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social media link',
      error: error.message,
    });
  }
};
