// src/api.js

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return []; // Return an empty array on error
  }
};
export const fetchOptimizedRoute = async (productSkus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/optimize-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productSkus), // Send the array of SKU strings
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch optimized route:", error);
    return [];
  }
};
export const createProduct = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return await response.json();
};

export const updateProduct = async (sku, productData) => {
  const response = await fetch(`${API_BASE_URL}/products/${sku}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return await response.json();
};

export const deleteProduct = async (sku) => {
  await fetch(`${API_BASE_URL}/products/${sku}`, {
    method: 'DELETE',
  });
};

export const updateProductLocation = async (sku, location) => {
  const response = await fetch(`${API_BASE_URL}/products/${sku}/location`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  });
  return await response.json();
};

export const getActiveFloorPlan = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/floorplan/active`);
    if (!response.ok) throw new Error('Failed to get active floor plan');
    return await response.json();
  } catch (error) {
    console.error(error);
    return { activeFloorPlanUrl: '/floor-plan.svg' }; // Default fallback
  }
};

export const uploadFloorPlan = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/floorplan/upload`, {
      method: 'POST',
      body: formData, // NOTE: No 'Content-Type' header needed for FormData
    });
    if (!response.ok) throw new Error('File upload failed');
    return await response.text();
  } catch (error) {
    console.error(error);
    return null;
  }
};

// We will add the function to get the optimized route here later