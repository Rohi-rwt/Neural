const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
 let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require("razorpay");

    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

const PLANS = {
  pro: {
    monthly: { price: 499, currency: 'INR', name: 'NeuralPath Pro Monthly' },
    yearly: { price: 3999, currency: 'INR', name: 'NeuralPath Pro Yearly' }
  }
};

// GET /api/subscriptions/plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: {
      free: {
        name: 'Free',
        price: 0,
        features: [
          '30 AI queries per day',
          '50 practice problems',
          '2 mock tests per week',
          'Basic progress tracking',
          'Community access'
        ]
      },
      pro: {
        name: 'Pro',
        monthlyPrice: 499,
        yearlyPrice: 3999,
        features: [
          'Unlimited AI Tutor access',
          'All 500+ problems',
          'Unlimited mock tests',
          'AI-generated roadmaps',
          'AI test generation',
          'Advanced analytics',
          'Interview simulator',
          'Priority support',
          'Resume builder'
        ]
      }
    }
  });
});

// POST /api/subscriptions/create-order
router.post('/create-order', protect, async (req, res, next) => {
  try {
    const { plan = 'pro', billing = 'monthly' } = req.body;

    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured.' });
    }

    const planConfig = PLANS[plan]?.[billing];
    if (!planConfig) {
      return res.status(400).json({ success: false, message: 'Invalid plan.' });
    }

    const order = await razorpay.orders.create({
      amount: planConfig.price * 100, // paise
      currency: planConfig.currency,
      receipt: `order_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id, plan, billing }
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    logger.error('Order creation error:', error);
    next(error);
  }
});

// POST /api/subscriptions/verify-payment
router.post('/verify-payment', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billing } = req.body;
    const crypto = require('crypto');

    if (razorpay) {
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

      if (expectedSign !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
      }
    }

    const endDate = new Date();
    if (billing === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    await User.findByIdAndUpdate(req.user.id, {
      'subscription.plan': plan || 'pro',
      'subscription.status': 'active',
      'subscription.startDate': new Date(),
      'subscription.endDate': endDate,
      'subscription.razorpaySubscriptionId': razorpay_payment_id
    });

    res.json({ success: true, message: 'Subscription activated! Welcome to Pro 🎉' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/subscriptions/cancel
router.delete('/cancel', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      'subscription.status': 'cancelled'
    });
    res.json({ success: true, message: 'Subscription cancelled. Access until end of billing period.' });
  } catch (error) { next(error); }
});

module.exports = router;
