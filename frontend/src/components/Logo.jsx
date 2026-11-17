import React from 'react';

/* Wordmark provisório — o logo definitivo ainda será definido. */
const Logo = ({ className = '' }) => (
  <span className={`logo ${className}`} aria-label="Teleios Studio">
    <span className="logo__mark" aria-hidden="true">T</span>
    <span className="logo__word" aria-hidden="true">
      <b>Teleios</b> studio
    </span>
  </span>
);

export default Logo;
