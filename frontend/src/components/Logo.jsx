import React from 'react';

/* Wordmark provisório — o logo definitivo ainda será definido. */
const Logo = ({ className = '' }) => (
  <span className={`logo ${className}`} aria-label="Agência Teleios">
    <span className="logo__mark" aria-hidden="true">T</span>
    <span className="logo__word" aria-hidden="true">
      agência <b>Teleios</b>
    </span>
  </span>
);

export default Logo;
