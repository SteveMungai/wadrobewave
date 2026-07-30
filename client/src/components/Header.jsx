import React, { useState } from 'react';

export function Header({ page, setPage, cartCount, user, onLogout, searchQuery, onSearchChange }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    if (searchOpen && searchQuery) {
      onSearchChange(''); // clear when closing an active search
    }
    setSearchOpen(!searchOpen);
  };

  return (
    <header className="site-header">
      <div className="logo" >
        WadrobeWave
      </div>

      {!searchOpen && (
        <nav className="nav-links">
          <a
            href="#"
            className={`nav-link ${page === 'collections' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setPage('home');
            }}
          >
            HOME
          </a>
          <a
            href="#"
            className={`nav-link ${page === 'collections' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setPage('collections');
            }}
          >
            COLLECTIONS
          </a>
        </nav>
      )}

      {searchOpen && (
        <input
          type="text"
          autoFocus
          className="search-input"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (page !== 'collections') setPage('collections');
          }}
        />
      )}

      <div className="nav-icons">
        {user ? (
          <>
            {user.role === 'admin' && (
              <a
                href="#"
                className="admin-link"
                onClick={(e) => {
                  e.preventDefault();
                  setPage('admin');
                }}
              >
                Admin
              </a>
            )}
            <a
              href="#"
              className="nav-text-link"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
            >
              Log out ({user.name.split(' ')[0]})
            </a>
          </>
        ) : (
          <a
            href="#"
            className="nav-text-link"
            onClick={(e) => {
              e.preventDefault();
              setPage('login');
            }}
          >
            Log in
          </a>
        )}

        <span className="icon-search" onClick={toggleSearch}>
          &#128269;
        </span>
        <span className="icon-cart" onClick={() => setPage('checkout')}>
          &#128722;
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </span>
      </div>
    </header>
  );
}
