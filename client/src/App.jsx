import React, { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Collections } from './pages/Collections';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';

export function App() {
  const [page, setPageState] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const refreshCart = useCallback(async () => {
    setCartItems(await api.getCart());
  }, []);

  const refreshProducts = useCallback(async () => {
    setProducts(await api.getProducts());
  }, []);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCart()])
      .then(([productsRes, cartRes]) => {
        setProducts(productsRes);
        setCartItems(cartRes);
      })
      .catch((err) => console.error('Failed to load initial data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Restore a session from a saved token on first load.
  useEffect(() => {
    if (!token) {
      setAuthChecked(true);
      return;
    }
    api
      .getMe(token)
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('authToken');
        setToken(null);
      })
      .finally(() => setAuthChecked(true));
  }, [token]);

  // Stripe redirects the browser back here after checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    if (!status) return;

    window.history.replaceState({}, '', window.location.pathname);

    if (status === 'success') {
      api
        .clearCart()
        .then(refreshCart)
        .then(() => alert('Payment successful! Your order has been placed.'));
      setPageState('home');
    } else if (status === 'cancel') {
      alert('Checkout was cancelled - your cart is still saved.');
      setPageState('checkout');
    }
  }, [refreshCart]);

  const setPage = (nextPage) => {
    setPageState(nextPage);
    window.scrollTo(0, 0);
  };

  const goToProduct = (productId) => {
    setSelectedProductId(productId);
    setPage('shop');
  };

  const handleAuthed = (newToken, newUser) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
    setPage('home');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setPage('home');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const visibleProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  if (loading || !authChecked) {
    return (
      <div className="page">
        <p className="empty-msg">Loading&hellip;</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        user={user}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {page === 'home' && <Home setPage={setPage} />}
      {page === 'collections' && (
        <Collections products={visibleProducts} onSelectProduct={goToProduct} />
      )}
      {page === 'shop' && (
        <Shop
          productId={selectedProductId}
          onAddedToCart={refreshCart}
          onRated={refreshProducts}
        />
      )}
      {page === 'checkout' && <Checkout cartItems={cartItems} refreshCart={refreshCart} />}
      {page === 'login' && <Auth onAuthed={handleAuthed} />}
      {page === 'admin' &&
        (user?.role === 'admin' ? (
          <Admin token={token} products={products} refreshProducts={refreshProducts} />
        ) : (
          <div className="admin-login">
            <h2>Admins only</h2>
            <p style={{ color: '#999', marginBottom: 20 }}>
              {user
                ? "This account doesn't have admin access."
                : 'Log in with an admin account to see this page.'}
            </p>
            {!user && (
              <button className="btn-gold" onClick={() => setPage('login')}>
                Log in
              </button>
            )}
          </div>
        ))}

      <footer className="site-footer">&copy; 2026 WadrobeWave. All rights reserved.</footer>
    </div>
  );
}
