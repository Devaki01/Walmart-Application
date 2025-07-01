// src/ShoppingCart.jsx

import React from 'react';

// Accept the new onGenerateRoute prop
function ShoppingCart({ cart, onGenerateRoute }) {
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item, index) => (
              <li key={`${item.sku}-${index}`}>{item.name}</li>
            ))}
          </ul>
          {/* Attach the function to the button's onClick */}
          <button onClick={onGenerateRoute}>Generate Route</button>
        </>
      )}
    </div>
  );
}

export default ShoppingCart;