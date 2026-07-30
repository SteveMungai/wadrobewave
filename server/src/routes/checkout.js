import { Router } from 'express';
import Stripe from 'stripe';
import { CartItem } from '../models/CartItem.js';

export const checkoutRouter = Router();

// POST /api/checkout/create-session
// Builds a Stripe-hosted Checkout page from whatever's currently in the cart 
checkoutRouter.post('/create-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured on the server' });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const cartItems = await CartItem.find();
  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

//load image on checkout if a public URL is available
  const line_items = cartItems.map((item) => ({
    price_data: {
      currency: 'kes',
      product_data: {
        name: `${item.name} (Size: ${item.size})`,
        images: item.image.startsWith('http') ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100), // KES is not zero-decimal
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    shipping_address_collection: { allowed_countries: ['KE'] },
    success_url: `${clientUrl}/?checkout=success`,
    cancel_url: `${clientUrl}/?checkout=cancel`,
  });

  res.json({ url: session.url });
});
