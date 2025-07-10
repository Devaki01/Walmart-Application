// src/ProductForm.jsx
import React, { useState, useEffect } from 'react';

function ProductForm({ productToEdit, onFormSubmit, onCancelEdit }) {
  const initialFormState = { sku: '', name: '', category: '' };
  const [product, setProduct] = useState(initialFormState);
  const isEditing = !!productToEdit;

  useEffect(() => {
    setProduct(isEditing ? productToEdit : initialFormState);
  }, [productToEdit, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.sku || !product.name || !product.category) return;
    onFormSubmit(product, isEditing);
    setProduct(initialFormState);
  };

  return (
    <div className="product-form">
      <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="sku" placeholder="SKU" value={product.sku} onChange={handleInputChange} disabled={isEditing} required />
        <input name="name" placeholder="Product Name" value={product.name} onChange={handleInputChange} required />
        <input name="category" placeholder="Category" value={product.category} onChange={handleInputChange} required />
        <div className="form-buttons">
            <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
            {isEditing && <button type="button" onClick={onCancelEdit}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

export default ProductForm;