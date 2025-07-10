// src/ShoppingCart.jsx
import React from 'react';

function ShoppingCart({ cart, onGenerateRoute }) {
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (<li key={item.sku}>{item.name}</li>))}
          </ul>
          <button onClick={onGenerateRoute}>Generate Route</button>
        </>
      )}
    </div>
  );
}

export default ShoppingCart;