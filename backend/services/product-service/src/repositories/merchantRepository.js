const pool = require("../db/db");

const getAllMerchants = async () => {
  const result = await pool.query(`
    SELECT 
      id, 
      business_name as name, 
      address,
      phone,
      logo_url,
      'Quality food and fast delivery' as description,
      '4.8' as rating,
      '25 min' as time,
      '🍱' as icon,
      'Restaurant' as category
    FROM merchant_profiles
    ORDER BY created_at DESC
  `);
  return result.rows;
};

const getMerchantById = async (id) => {
  const result = await pool.query(`
    SELECT 
      id, 
      business_name as name, 
      address,
      phone,
      logo_url,
      'Quality food and fast delivery' as description,
      '4.8' as rating,
      '25 min' as time,
      '🍱' as icon,
      'Restaurant' as category
    FROM merchant_profiles
    WHERE id = $1
  `, [id]);

  return result.rows[0];
};

module.exports = {
  getAllMerchants,
  getMerchantById,
};
