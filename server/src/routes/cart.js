import { Router } from 'express';
import { CartItem } from '../models/CartItem.js';

export const cartRouter = Router();

// GET /api/cart - list current cart items
cartRouter.get('/', async (req, res) => {
  const items = await CartItem.find().sort({ addedAt: 1 });
  res.json(items);
});

// POST /api/cart - add an item 
cartRouter.post('/', async (req, res) => {
  const { productId, name, price, size, image, qty } = req.body;
  if (!productId || !name || price == null || !size || !image || !qty) {
    return res.status(400).json({ error: 'Missing required cart item fields' });
  }

  const existing = await CartItem.findOne({ productId, size });
  if (existing) {
    existing.qty += qty;
    await existing.save();
    return res.json(existing);
  }

  const item = await CartItem.create({ productId, name, price, size, image, qty });
  res.status(201).json(item);
});

// PATCH /api/cart/:id - set quantity (removes the item if qty drops to 0 or below)
cartRouter.patch('/:id', async (req, res) => {
  const { qty } = req.body;
  if (qty == null) return res.status(400).json({ error: 'qty is required' });

  if (qty <= 0) {
    await CartItem.findByIdAndDelete(req.params.id);
    return res.json({ removed: true });
  }

  const item = await CartItem.findByIdAndUpdate(req.params.id, { qty }, { new: true });
  if (!item) return res.status(404).json({ error: 'Cart item not found' });
  res.json(item);
});

// DELETE /api/cart/:id - remove a single item
cartRouter.delete('/:id', async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ removed: true });
});

// DELETE /api/cart - clear the whole cart (used when placing an order)
cartRouter.delete('/', async (req, res) => {
  await CartItem.deleteMany({});
  res.json({ cleared: true });
});
