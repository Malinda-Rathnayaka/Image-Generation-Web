import crypto from 'crypto';
import Site from '../models/Site.js';

export const authMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const userId = req.headers['x-user-id'];

  if (!apiKey || !userId) {
    return res.status(401).json({
      success: false,
      error: 'MISSING_HEADERS',
      message: 'Both x-api-key and x-user-id headers are required.'
    });
  }

  try {
    // 1. Hash incoming plain x-api-key header using SHA-256
    const hash = crypto.createHash('sha256').update(apiKey.trim()).digest('hex');

    console.log('[AUTH DEBUG] Received Header Key:', `"${apiKey}"`);
    console.log('[AUTH DEBUG] Computed Hash:', hash);

    // 2. Search MongoDB using keyHash
    const site = await Site.findOne({ keyHash: hash, active: true });

    console.log('[AUTH DEBUG] MongoDB Site Result:', site ? site.name : 'NOT FOUND');

    if (!site) {
      return res.status(403).json({ 
        success: false, 
        error: 'INVALID_API_KEY', 
        message: 'Unauthorized API key.' 
      });
    }

    // 3. Check spending cap
    const budgetCap = site.limits?.monthlyBudgetUsd ?? 10.00;
    if (site.spentUsd >= budgetCap) {
      return res.status(429).json({
        success: false,
        error: 'SPENDING_CAP_EXCEEDED',
        message: 'Site budget limit reached.'
      });
    }

    req.site = site;
    req.userId = userId;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
};