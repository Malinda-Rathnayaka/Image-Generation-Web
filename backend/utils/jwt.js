import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to embed in the token (e.g., id, role)
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_evo_jwt_secret_key_prod_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT string
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_evo_jwt_secret_key_prod_2026';
  return jwt.verify(token, secret);
};
