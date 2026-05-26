const express = require('express');
const Stripe = require('stripe');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../services/supabase');

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
}

/**
 * POST /api/payments/create-checkout
 * Creates a Stripe Checkout session for the $12/month Pro subscription.
 * Returns { url } to redirect the client.
 */
router.post('/create-checkout', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const successUrl =
    req.body.success_url ||
    process.env.CLIENT_URL + '/dashboard?checkout=success' ||
    'http://localhost:5173/dashboard?checkout=success';

  const cancelUrl =
    req.body.cancel_url ||
    process.env.CLIENT_URL + '/pricing' ||
    'http://localhost:5173/pricing';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            unit_amount: 1200, // $12.00
            product_data: {
              name: 'Summit Pro',
              description: 'Unlimited AI question generation and advanced analytics',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        clerk_id: user.clerk_id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('payments POST /create-checkout error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/payments/webhook
 * Handles Stripe webhook events.
 * NOTE: This route uses express.raw() body — mounted before express.json() in index.js.
 * On checkout.session.completed → update user subscription to 'pro'.
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      if (userId) {
        const { error } = await supabase
          .from('users')
          .update({
            subscription: 'pro',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('payments webhook update user error:', error);
          // Return 200 anyway so Stripe doesn't retry endlessly — log for manual fix
        } else {
          console.log(`User ${userId} upgraded to Pro`);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      if (customerId) {
        const { error } = await supabase
          .from('users')
          .update({
            subscription: 'free',
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('payments webhook downgrade user error:', error);
        } else {
          console.log(`Customer ${customerId} subscription cancelled, downgraded to free`);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.warn(`Payment failed for customer: ${invoice.customer}`);
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return res.json({ received: true });
});

/**
 * GET /api/payments/status
 * Returns the current user's subscription status.
 */
router.get('/status', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  return res.json({
    subscription: user.subscription || 'free',
    isPro: user.subscription === 'pro',
  });
});

module.exports = router;
