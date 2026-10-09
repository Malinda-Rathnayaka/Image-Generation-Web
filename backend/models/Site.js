import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    spentUsd: { type: Number, default: 0 },
    limits: {
      monthlyBudgetUsd: { type: Number, default: 10.00 },
      rateLimitRpm: { type: Number, default: 30 }
    },
    allowedOrigins: [String],
    blockedTerms: [String]
  },
  { timestamps: true }
);

const Site = mongoose.model('Site', siteSchema);
export default Site;