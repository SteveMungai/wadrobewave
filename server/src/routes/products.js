import { Router } from 'express';
import { Product } from '../models/Product.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

export const productsRouter = Router();

// GET /api/products - list all products
productsRouter.get('/', async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

// GET /api/products/:id - single product detail
productsRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products/:id/rate - anyone can submit a 1-5 star rating.
productsRouter.post('/:id/rate', async (req, res) => {
  const rating = Number(req.body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be a number from 1 to 5' });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { ratingSum: rating, ratingCount: 1 } },
    { new: true }
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Admin-only routes below (require a logged-in admin's JWT) 

// POST /api/products - create a new product
productsRouter.post('/', authRequired, adminRequired, async (req, res) => {
  const { name, price, image, description, sizes } = req.body;
  if (!name || price == null || !image || !description || !sizes?.length) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }
  const product = await Product.create({ name, price, image, description, sizes });
  res.status(201).json(product);
});

// PUT /api/products/:id - update an existing product
productsRouter.put('/:id', authRequired, adminRequired, async (req, res) => {
  const { name, price, image, description, sizes } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, price, image, description, sizes },
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// DELETE /api/products/:id - remove a product
productsRouter.delete('/:id', authRequired, adminRequired, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ removed: true });
});
