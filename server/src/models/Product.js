import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  sizes: { type: [String], required: true },
  ratingSum: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

export const Product = mongoose.model('Product', productSchema);
