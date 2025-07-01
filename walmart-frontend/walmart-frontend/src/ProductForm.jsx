// src/ProductForm.jsx

import React, { useState, useEffect } from 'react';

function ProductForm({ productToEdit, onFormSubmit, onCancelEdit }) {
  const [product, setProduct] = useState({ sku: '', name: '', category: '' });
  const isEditing = !!productToEdit;

  useEffect(() => {
    if (isEditing) {
      setProduct(productToEdit);
    } else {
      setProduct({ sku: '', name: '', category: '' });
    }
  }, [productToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(product, isEditing);
  };

  return (
    <div className="product-form">
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="sku"
          placeholder="SKU (e.g., SKU-DAIRY-004)"
          value={product.sku}
          onChange={handleInputChange}
          disabled={isEditing}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={product.category}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
        {isEditing && <button type="button" onClick={onCancelEdit}>Cancel Edit</button>}
      </form>
    </div>
  );
}

export default ProductForm;