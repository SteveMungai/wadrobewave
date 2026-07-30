import React, { useState } from 'react';
import { api } from '../api';
import { formatPrice } from '../formatPrice';

export function Checkout({ cartItems, refreshCart }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [placing, setPlacing] = useState(false);

  const changeQty = async (item, delta) => {
    try {
      await api.setCartQty(item._id, item.qty + delta);
      refreshCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (item) => {
    try {
      await api.removeFromCart(item._id);
      refreshCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // Server builds a Stripe Checkout session from the cart in MongoDB and hands back a URL 
      const { url } = await api.createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to start checkout:', err);
      alert(err.message || 'Something went wrong starting checkout. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-layout">
      <div className="cart-list">
        {cartItems.length === 0 && (
          <p className="empty-msg">Your cart is empty. Head to Collections to add something.</p>
        )}
        {cartItems.map((item) => (
          <div className="cart-row" key={item._id}>
            <img src={item.image} alt={item.name} />
            <div className="cart-row-info">
              <div className="cart-row-name">{item.name}</div>
              <div className="cart-row-size">Size: {item.size}</div>
              <div className="cart-row-remove" onClick={() => removeItem(item)}>
                Remove
              </div>
            </div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => changeQty(item, -1)}>
                -
              </button>
              <span>{item.qty}</span>
              <button className="qty-btn" onClick={() => changeQty(item, 1)}>
                +
              </button>
            </div>
            <div className="cart-row-price">Ksh {formatPrice(item.price * item.qty)}</div>
          </div>
        ))}
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Ksh {formatPrice(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <span>Ksh {formatPrice(subtotal)}</span>
        </div>

        <button
          className="btn-gold"
          disabled={cartItems.length === 0 || placing}
          onClick={placeOrder}
          style={{ marginTop: 20, width: '100%' }}
        >
          {placing ? 'Redirecting to Stripe...' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
