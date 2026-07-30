import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  image: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  addedAt: { type: Date, default: Date.now },
});

export const CartItem = mongoose.model('CartItem', cartItemSchema);
