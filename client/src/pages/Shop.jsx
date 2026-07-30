import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatPrice } from '../formatPrice';

export function Shop({ productId, onAddedToCart, onRated }) {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const alreadyRatedKey = productId && `rated-${productId}`;
  const alreadyRated = alreadyRatedKey && !!localStorage.getItem(alreadyRatedKey);

  useEffect(() => {
    if (!productId) return;
    setProduct(null);
    setJustAdded(false);
    api
      .getProduct(productId)
      .then((p) => {
        setProduct(p);
        setSelectedSize(p.sizes[0]);
      })
      .catch((err) => console.error('Failed to load product:', err));
  }, [productId]);

  if (!product) {
    return <p className="empty-msg">No product selected. Go back to Collections and pick one.</p>;
  }

  const addToCart = async () => {
    try {
      await api.addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        size: selectedSize || product.sizes[0],
        image: product.image,
        qty: 1,
      });
      setJustAdded(true);
      onAddedToCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const submitRating = async (value) => {
    if (alreadyRated) return; // one rating per browser per product, tracked via localStorage
    try {
      const updated = await api.rateProduct(product._id, value);
      setProduct(updated);
      localStorage.setItem(alreadyRatedKey, 'true');
      onRated();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const average = product.ratingCount > 0 ? product.ratingSum / product.ratingCount : 0;

  return (
    <div className="product-detail">
      <img className="product-image" src={product.image} alt={product.name} />
      <div className="product-info">
        <h2>{product.name}</h2>
        <div className="product-price">Ksh {formatPrice(product.price)}</div>

        <div className="rating-block">
          <div className="star-row">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`star ${n <= (hoverStar || Math.round(average)) ? 'filled' : ''} ${
                  alreadyRated ? 'disabled' : ''
                }`}
                onMouseEnter={() => !alreadyRated && setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => submitRating(n)}
              >
                &#9733;
              </span>
            ))}
          </div>
          <span className="rating-summary">
            {product.ratingCount > 0
              ? `${average.toFixed(1)} (${product.ratingCount} rating${product.ratingCount === 1 ? '' : 's'})`
              : 'No ratings yet'}
            {alreadyRated && ' \u2014 thanks for rating!'}
          </span>
        </div>

        <div className="size-row">
          {product.sizes.map((size) => (
            <button
              key={size}
              className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
              onClick={() => {
                setSelectedSize(size);
                setJustAdded(false);
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <p className="product-description">{product.description}</p>

        <button className="btn-gold" onClick={addToCart}>
          Add to cart
        </button>
        {justAdded && <span className="added-msg">Added to cart</span>}
      </div>
    </div>
  );
}
