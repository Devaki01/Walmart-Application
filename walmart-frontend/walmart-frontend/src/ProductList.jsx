// src/ProductList.jsx

import React from 'react';

function ProductList({ products, addToCart }) {
  return (
    <div className="product-list">
      <h2>Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.sku}>
            {product.name} ({product.category})
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;