const express = require('express');
const Stripe = require('stripe');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
}

// POST /api/payments/create-checkout
router.post('/create-checkout', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });

  let stripe;
  try { stripe = getStripe(); } catch (e) { return res.status(500).json({ error: e.message }); }

  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          unit_amount: 1200,
          product_data: { name: 'Summit Pro', description: 'Full library, AI generation, advanced analytics' },
        },
        quantity: 1,
      }],
      customer_email: user.email || undefined,
      metadata: { user_id: user.id },
      success_url: `${base}/dashboard?checkout=success`,
      cancel_url: `${base}/library`,
    });
    return res.json({ url: session.url });
  } catch (e) {
    console.error('create-checkout error:', e.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/webhook  (raw body — mounted before express.json in index.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let stripe;
  try { stripe = getStripe(); } catch (e) { return res.status(500).json({ error: e.message }); }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: `Webhook signature invalid: ${e.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const userId = s.metadata?.user_id;
      if (userId) {
        await db.query(
          `UPDATE users SET subscription='pro', stripe_customer_id=$1, stripe_subscription_id=$2 WHERE id=$3`,
          [s.customer, s.subscription, userId]
        );
        console.log(`User ${userId} upgraded to Pro`);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const customerId = event.data.object.customer;
      if (customerId) {
        await db.query(
          `UPDATE users SET subscription='free' WHERE stripe_customer_id=$1`, [customerId]
        );
      }
    }
  } catch (e) {
    console.error('webhook db error:', e.message);
    // Return 200 so Stripe doesn't retry — log for manual fix
  }

  return res.json({ received: true });
});

// GET /api/payments/status
router.get('/status', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  return res.json({ subscription: user.subscription || 'free', isPro: user.subscription === 'pro' });
});

module.exports = router;
