import React from 'react';

export function Home({ setPage }) {
  return (
    <>
      <div className="hero">
        <h1>&ldquo;Discover Your Style, Anytime, Anywhere&rdquo;</h1>
        <button className="btn-gold" onClick={() => setPage('collections')}>
          SHOP
        </button>
      </div>

      <div className="intro">
        <p>
          Welcome to our fashion hub. From casual wear to formal attire, we bring you
          clothing designed for comfort, confidence, and style. Our curated collections
          make shopping effortless, with secure checkout and fast delivery right to
          your door.
        </p>
      </div>
    </>
  );
}
