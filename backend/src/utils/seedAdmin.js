require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('./logger');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: 'admin@neuralpath.in' });
  if (existing) {
    logger.info('Admin already exists.');
    process.exit(0);
  }

  await User.create({
    name: 'NeuralPath Admin',
    email: 'admin@neuralpath.in',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
    subscription: { plan: 'enterprise', status: 'active' }
  });

  logger.info('✅ Admin created: admin@neuralpath.in / Admin@123');
  process.exit(0);
}

seedAdmin().catch(e => { logger.error(e); process.exit(1); });
