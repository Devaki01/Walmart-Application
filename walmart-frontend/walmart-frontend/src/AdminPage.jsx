// src/AdminPage.jsx (Fully Updated)

import React, { useState, useEffect, useRef } from 'react';
// Make sure to import getActiveFloorPlan from your api service
import { 
  fetchAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductLocation, 
  getActiveFloorPlan 
} from './api';
import ProductForm from './ProductForm';
import FloorPlanUploader from './FloorPlanUploader';
import './AdminPage.css';

function AdminPage() {
  // Global state for the page
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('placement'); // 'placement', 'management', or 'floorplan'
  const [floorPlanUrl, setFloorPlanUrl] = useState(''); // NEW STATE: To hold the current map URL

  // State for the 'Item Placement' tab
  const [selectedProductForPlacement, setSelectedProductForPlacement] = useState(null);
  const mapRef = useRef(null);

  // State for the 'Product Management' tab
  const [productToEdit, setProductToEdit] = useState(null);

  // UPDATED: useEffect now loads both products and the floor plan on initial mount
  useEffect(() => {
    loadProducts();
    loadFloorPlan();
  }, []);

  const loadProducts = async () => {
    const data = await fetchAllProducts();
    setProducts(data);
  };

  // NEW FUNCTION: Fetches the active floor plan URL and updates the state
  const loadFloorPlan = async () => {
    const settings = await getActiveFloorPlan();
    setFloorPlanUrl(settings.activeFloorPlanUrl);
  };
  
  // --- Handler Functions for Product Management (Unchanged) ---
  const handleFormSubmit = async (productData, isEditing) => {
    if (isEditing) {
      await updateProduct(productData.sku, productData);
    } else {
      await createProduct({ ...productData, location: null });
    }
    setProductToEdit(null);
    loadProducts();
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
  };

  const handleDelete = async (sku) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(sku);
      loadProducts();
    }
  };

  // --- Handler Function for Item Placement (Unchanged) ---
  const handleMapClick = async (e) => {
    if (!selectedProductForPlacement) {
      alert("Please select a product from the list first!");
      return;
    }
    const map = mapRef.current;
    if (map) {
      const rect = map.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const updatedProduct = await updateProductLocation(selectedProductForPlacement.sku, { x, y });
      setProducts(products.map(p => p.sku === updatedProduct.sku ? updatedProduct : p));
      setSelectedProductForPlacement(updatedProduct);
    }
  };

  return (
    <div className='adminPage'>
      <div className='flex-container'> 
        <div className='logo'> <h1> Walmart Pro </h1> </div>
        <div className='admin_dashboard'> <h1> Admin Dashboard </h1> </div>
      </div>

      <div className="admin-tabs">
        <button onClick={() => setActiveTab('placement')} className={activeTab === 'placement' ? 'active' : ''}>Item Placement</button>
        <button onClick={() => setActiveTab('management')} className={activeTab === 'management' ? 'active' : ''}>Product Management</button>
        <button onClick={() => setActiveTab('floorplan')} className={activeTab === 'floorplan' ? 'active' : ''}>Floor Plan</button>
      </div>

      {activeTab === 'placement' && (
        <div className="placement-view">
          <p>{selectedProductForPlacement ? `Click map to place: ${selectedProductForPlacement.name}` : "Select a product to place it on the map."}</p>
          <div className="admin-container">
            <div className="product-placement-list">
              <h2>Product List</h2>
              <ul>
                {products.map(p => (
                  <li key={p.sku} onClick={() => setSelectedProductForPlacement(p)} className={selectedProductForPlacement?.sku === p.sku ? 'selected' : ''}>
                    {p.name}
                    {p.location ? <span className="location-indicator">✔ Placed</span> : <span className="location-indicator-missing">✖ Missing</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div className="map-container-admin">
              {/* UPDATED: The map image source is now dynamic */}
              {floorPlanUrl && <img ref={mapRef} src={floorPlanUrl} alt="Store Floor Plan" onClick={handleMapClick} />}
              
              {products.map(p => p.location && (
                <div key={p.sku} className="location-dot" style={{ left: `${p.location.x}px`, top: `${p.location.y}px` }} title={`${p.name}`}></div>
              ))}
              {selectedProductForPlacement?.location && (
                <div className="location-dot selected" style={{ left: `${selectedProductForPlacement.location.x}px`, top: `${selectedProductForPlacement.location.y}px` }}></div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="management-view">
          <p>Add, edit, or delete product details here. Set their location in the 'Item Placement' tab.</p>
          <div className="admin-container">
            <div className="product-management-list">
              <h2>Product List</h2>
              <ul>
                {products.map(p => (
                  <li key={p.sku}>
                    <span>{p.name} ({p.sku})</span>
                    <div>
                      <button onClick={() => handleEditClick(p)}>Edit</button>
                      <button onClick={() => handleDelete(p.sku)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <ProductForm
              productToEdit={productToEdit}
              onFormSubmit={handleFormSubmit}
              onCancelEdit={() => setProductToEdit(null)}
            />
          </div>
        </div>
      )}

      {activeTab === 'floorplan' && (
        <div className="floorplan-view">
          {/* UPDATED: Pass the loadFloorPlan function as the callback prop */}
          <FloorPlanUploader onUploadSuccess={loadFloorPlan} />
          <div className="current-map-preview">
            <h3>Current Map Preview</h3>
            {floorPlanUrl ? <img src={floorPlanUrl} alt="Current floor plan" /> : <p>No map uploaded yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;