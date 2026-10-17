import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

export const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@evoart.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        status: 'active',
        credits: 1000,
        lastLogin: new Date()
      });

      console.log(`[Seed] Successfully seeded Admin account: ${newAdmin.email} (Role: ${newAdmin.role})`);
    } else {
      let updated = false;
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        updated = true;
      }
      if (existingAdmin.status !== 'active') {
        existingAdmin.status = 'active';
        updated = true;
      }
      if (updated) {
        await existingAdmin.save();
        console.log(`[Seed] Existing user ${existingAdmin.email} elevated to Admin role.`);
      } else {
        console.log(`[Seed] Admin user already exists: ${existingAdmin.email}`);
      }
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed admin account:', error.message);
  }
};

// If run directly from terminal (e.g. node utils/seedAdmin.js or npm run seed:admin)
const isDirectRun = process.argv[1] && process.argv[1].endsWith('seedAdmin.js');
if (isDirectRun) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      console.log('[Seed] Seeding process finished.');
      process.exit(0);
    } catch (err) {
      console.error('[Seed Fatal Error]:', err);
      process.exit(1);
    }
  })();
}
