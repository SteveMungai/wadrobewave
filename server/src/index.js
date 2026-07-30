import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { seedProducts } from './seedData.js';
import { productsRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import { authRouter } from './routes/auth.js';
import { uploadRouter } from './routes/upload.js';
import { checkoutRouter } from './routes/checkout.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serves uploaded product images at http://localhost:4000/uploads/<file>
app.use('/uploads', express.static('uploads'));

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/checkout', checkoutRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function start() {
  if (!process.env.JWT_SECRET) {
    console.warn(
      'WARNING: JWT_SECRET is not set in .env - using an insecure default. Set a real one before deploying anywhere.'
    );
  }

  await connectDB();

  // Seed the products collection once, the first time the server boots against an empty database.
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} products into MongoDB`);
  }

  // Seed one admin account if none exists yet, using the credentials
  
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });
    console.log(`Seeded admin account: ${process.env.ADMIN_EMAIL}`);
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
