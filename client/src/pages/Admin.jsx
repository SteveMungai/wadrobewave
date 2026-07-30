import React, { useState } from 'react';
import { api } from '../api';
import { formatPrice } from '../formatPrice';

const emptyForm = { name: '', price: '', description: '', sizes: '', image: '' };

export function Admin({ token, products, refreshProducts }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      sizes: product.sizes.join(', '),
      image: product.image,
    });
    setImageFile(null);
    setFormError('');
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setFormError('');
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name || !form.price || !form.description || !form.sizes) {
      setFormError('Please fill in every field.');
      return;
    }
    if (!editingId && !imageFile && !form.image) {
      setFormError('Please choose an image.');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        const uploaded = await api.uploadImage(imageFile, token);
        imageUrl = uploaded.url;
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        image: imageUrl,
      };

      if (editingId) {
        await api.updateProduct(editingId, payload, token);
      } else {
        await api.createProduct(payload, token);
      }

      await refreshProducts();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Something went wrong saving the product.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await api.deleteProduct(product._id, token);
      await refreshProducts();
      if (editingId === product._id) resetForm();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="admin-page">
      <h2>Manage products</h2>

      <form className="admin-form" onSubmit={submitProduct}>
        <h3>{editingId ? 'Edit product' : 'Add a new product'}</h3>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price (Ksh)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Sizes, comma-separated (e.g. M, L, XL)"
          value={form.sizes}
          onChange={(e) => setForm({ ...form, sizes: e.target.value })}
        />
        <textarea
          placeholder="Description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label className="file-label">
          {editingId ? 'Replace image (optional)' : 'Product image'}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0] || null)}
          />
        </label>

        {(imageFile || form.image) && (
          <img
            className="admin-image-preview"
            src={imageFile ? URL.createObjectURL(imageFile) : form.image}
            alt="Preview"
          />
        )}

        {formError && <p className="form-error">{formError}</p>}

        <div className="admin-form-actions">
          <button className="btn-gold" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="admin-list-heading">Existing products ({products.length})</h3>
      <div className="admin-product-list">
        {products.map((product) => (
          <div className="admin-product-row" key={product._id}>
            <img src={product.image} alt={product.name} />
            <div className="admin-product-info">
              <div className="cart-row-name">{product.name}</div>
              <div className="cart-row-size">Ksh {formatPrice(product.price)}</div>
            </div>
            <div className="admin-product-actions">
              <a href="#" onClick={(e) => { e.preventDefault(); startEdit(product); }}>
                Edit
              </a>
              <a href="#" className="danger" onClick={(e) => { e.preventDefault(); deleteProduct(product); }}>
                Delete
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
