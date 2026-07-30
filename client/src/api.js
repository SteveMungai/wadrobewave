const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  rateProduct: (id, rating) =>
    request(`/products/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating }) }),

  getCart: () => request('/cart'),
  addToCart: (item) => request('/cart', { method: 'POST', body: JSON.stringify(item) }),
  setCartQty: (id, qty) =>
    request(`/cart/${id}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  removeFromCart: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  createCheckoutSession: () => request('/checkout/create-session', { method: 'POST' }),

  // Auth
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (token) => request('/auth/me', { headers: authHeaders(token) }),

  //  Admin (require a logged-in admin's token)
  createProduct: (data, token) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),

  updateProduct: (id, data, token) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    }),

  deleteProduct: (id, token) =>
    request(`/products/${id}`, { method: 'DELETE', headers: authHeaders(token) }),

  uploadImage: async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Upload failed');
    }
    return res.json();
  },
};
