import React from 'react';
import { formatPrice } from '../formatPrice';


export function Collections({ products, onSelectProduct }) {
  if (products.length === 0) {
    return <p className="empty-msg">No products found.</p>;
  }

  return (
    <div className="grid">
      {products.map((product) => {
        const average = product.ratingCount > 0 ? product.ratingSum / product.ratingCount : 0;
        return (
          <div
            className="grid-item"
            key={product._id}
            onClick={() => onSelectProduct(product._id)}
          >
            <img src={product.image} alt={product.name} />
            <div className="grid-item-name">{product.name}</div>
            <div className="grid-item-price">Ksh {formatPrice(product.price)}</div>
            {product.ratingCount > 0 && (
              <div className="grid-item-rating">
                &#9733; {average.toFixed(1)} ({product.ratingCount})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
