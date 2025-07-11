import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  fetchAllProducts, fetchAllWaypoints, assignProductToWaypoint,
  createProduct, createWaypoint, updateProduct, deleteProduct,
  getSettings, updateSettingLocation, connectWaypoints,
  updateWaypointLocation, deleteWaypoint
} from './api';
import ProductForm from './ProductForm';
import FloorPlanUploader from './FloorPlanUploader';
import MessageDisplay from './MessageDisplay';
import './AdminPage.css';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('placement');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [settingMode, setSettingMode] = useState(null);
  const [firstWaypointToConnect, setFirstWaypointToConnect] = useState(null);
  const [waypointToMove, setWaypointToMove] = useState(null);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New state for map dimensions
  const [mapNaturalDimensions, setMapNaturalDimensions] = useState({ width: 0, height: 0 });
  const mapRef = useRef(null); // Ref for the map container to get its current size

  const loadData = useCallback(async () => {
    try {
      const [productsData, waypointsData, settingsData] = await Promise.all([
        fetchAllProducts(), fetchAllWaypoints(), getSettings()
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setWaypoints(Array.isArray(waypointsData) ? waypointsData : []);
      setSettings(settingsData);
    } catch (error) {
      setMessage("Error: Could not load data from server.");
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMapImageLoad = (e) => {
    // Store the intrinsic (natural) dimensions of the image
    setMapNaturalDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
  };

  const handleMapClick = async (e) => {
    if (!settingMode || !mapRef.current || mapNaturalDimensions.width === 0) return; // Ensure map is loaded and dimensions are known

    const rect = mapRef.current.getBoundingClientRect();
    // Calculate click position relative to the map container in pixels
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates to normalized coordinates (0-1 range) based on current displayed map size
    const normalizedX = clickX / rect.width;
    const normalizedY = clickY / rect.height;

    // Scale normalized coordinates back to the natural dimensions of the image for storage
    const x = Math.round(normalizedX * mapNaturalDimensions.width);
    const y = Math.round(normalizedY * mapNaturalDimensions.height);

    const newLocation = { x, y, z: 0 };

    try {
      if (settingMode === 'entrance' || settingMode === 'checkout') {
        setSettings(await updateSettingLocation(settingMode, newLocation));
        setMessage(`Updated ${settingMode} location.`);
        setSettingMode(null);
      } else if (settingMode === 'waypoint_create') {
        await createWaypoint(newLocation);
        setMessage(`New waypoint created at (${x}, ${y}).`);
        await loadData();
      } else if (settingMode === 'waypoint_move_end' && waypointToMove) {
        await updateWaypointLocation(waypointToMove.id, newLocation);
        setMessage(`Moved waypoint ${waypointToMove.id} to (${x}, ${y}).`);
        setWaypointToMove(null);
        setSettingMode(null);
        await loadData();
      }
    } catch (error) {
      setMessage(`Error performing action for ${settingMode}.`);
    }
  };

  const handleWaypointClick = async (waypoint) => {
    if (settingMode === 'connect') {
      if (!firstWaypointToConnect) {
        setFirstWaypointToConnect(waypoint);
        setMessage(`Selected waypoint ${waypoint.id}. Click another to connect.`);
      } else {
        try {
          await connectWaypoints(firstWaypointToConnect.id, waypoint.id);
          setMessage(`Connected ${firstWaypointToConnect.id} and ${waypoint.id}.`);
          setFirstWaypointToConnect(null);
          await loadData();
        } catch (error) {
          setMessage("Error connecting waypoints.");
          setFirstWaypointToConnect(null);
        }
      }
    } else if (settingMode === 'waypoint_move_start') {
      setWaypointToMove(waypoint);
      setSettingMode('waypoint_move_end');
      setMessage(`Moving waypoint ${waypoint.id}. Click new location on map.`);
    } else if (settingMode === 'waypoint_delete') {
      if (window.confirm(`Delete waypoint ${waypoint.id}?`)) {
        try {
          await deleteWaypoint(waypoint.id);
          setMessage(`Deleted waypoint ${waypoint.id}.`);
          setSettingMode(null);
          await loadData();
        } catch (error) {
          setMessage("Error deleting waypoint.");
        }
      }
    } else if (activeTab === 'placement' && selectedProduct) {
      try {
        const updatedProduct = await assignProductToWaypoint(selectedProduct.sku, waypoint.id);
        setProducts(products.map(p => p.sku === updatedProduct.sku ? updatedProduct : p));
        setSelectedProduct(updatedProduct);
        setMessage(`Assigned ${updatedProduct.name} to waypoint ${waypoint.id}.`);
      } catch (error) {
        setMessage("Error assigning product.");
      }
    }
  };

  const handleFormSubmit = async (productData, isEditing) => {
    try {
      const result = isEditing
        ? await updateProduct(productData.sku, productData)
        : await createProduct(productData);
      setProducts(prev => isEditing
        ? prev.map(p => p.sku === result.sku ? result : p)
        : [...prev, result]);
      setMessage(`Product ${productData.name} ${isEditing ? 'updated' : 'created'}.`);
      setProductToEdit(null);
    } catch (error) {
      setMessage("Error saving product.");
    }
  };

  const handleDeleteClick = async (sku) => {
    if (window.confirm(`Delete product ${sku}?`)) {
      try {
        await deleteProduct(sku);
        setProducts(products.filter(p => p.sku !== sku));
        setMessage(`Product ${sku} deleted.`);
      } catch (error) {
        setMessage("Error deleting product.");
      }
    }
  };

  const cancelAllModes = () => {
    setSettingMode(null);
    setFirstWaypointToConnect(null);
    setWaypointToMove(null);
  };

  const renderMapWithOverlays = () => {
    const waypointMap = new Map(waypoints.map(wp => [wp.id, wp]));

    // Helper function to calculate percentage positions
    const getPercentagePosition = (location) => {
      if (!location || mapNaturalDimensions.width === 0 || mapNaturalDimensions.height === 0) {
        return { left: '0%', top: '0%' };
      }
      const left = (location.x / mapNaturalDimensions.width) * 100;
      const top = (location.y / mapNaturalDimensions.height) * 100;
      return { left: `${left}%`, top: `${top}%` };
    };

    return (
      <div className="fullscreen-map" ref={mapRef} onClick={handleMapClick}>
        <div className="map-header">
          <span className="level-badge">LEVEL 1</span>
          <span className="map-address">5025 East Sprague Avenue, Spokane Valley, WA 99212</span>
          <span className="created-date">Created on 15 Jun 2025</span>
        </div>
        <img
          src="/walmart-map.svg"
          alt="Store Map"
          className="map-image"
          onLoad={handleMapImageLoad} // Add onload handler
        />
        <svg className="path-overlay">
          {waypoints.map(wp => wp.connections?.map(toId => {
            const toWp = waypointMap.get(toId);
            if (!toWp || mapNaturalDimensions.width === 0 || mapNaturalDimensions.height === 0) return null;

            // Calculate percentage positions for lines
            const fromPos = getPercentagePosition(wp.location);
            const toPos = getPercentagePosition(toWp.location);

            // Convert percentages back to pixels relative to current SVG size for rendering lines
            // This assumes the SVG element scales with the map image.
            const rect = mapRef.current.getBoundingClientRect();
            const x1 = parseFloat(fromPos.left) / 100 * rect.width;
            const y1 = parseFloat(fromPos.top) / 100 * rect.height;
            const x2 = parseFloat(toPos.left) / 100 * rect.width;
            const y2 = parseFloat(toPos.top) / 100 * rect.height;

            return (
              <line
                key={`${wp.id}-${toId}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(0,100,255,0.5)"
                strokeWidth="2"
              />
            );
          }))}
        </svg>

        {waypoints.map(wp => (
          <div
            key={wp.id}
            className={`waypoint-dot ${firstWaypointToConnect?.id === wp.id ? 'connecting' : ''} ${waypointToMove?.id === wp.id ? 'moving' : ''}`}
            style={getPercentagePosition(wp.location)} // Use percentage positions
            onClick={(e) => { e.stopPropagation(); handleWaypointClick(wp); }}
            title={`Waypoint ${wp.id}`}
          ></div>
        ))}

        {settings?.entranceLocation && (
          <div
            className="setting-dot entrance"
            style={getPercentagePosition(settings.entranceLocation)} // Use percentage positions
          >E</div>
        )}
        {settings?.checkoutLocation && (
          <div
            className="setting-dot checkout"
            style={getPercentagePosition(settings.checkoutLocation)} // Use percentage positions
          >C</div>
        )}
      </div>
    );
  };

  const renderSidebarContent = () => {
    if (activeTab === 'placement') {
      return (
        <>
          <h2>Product List</h2>
          <ul>
            {products.map(p => (
              <li key={p.sku} onClick={() => setSelectedProduct(p)} className={selectedProduct?.sku === p.sku ? 'selected' : ''}>
                {p.name}
                <span className={p.waypointId ? 'location-indicator' : 'location-indicator-missing'}>
                  {p.waypointId ? '✔' : '✖'}
                </span>
              </li>
            ))}
          </ul>
        </>
      );
    }
    if (activeTab === 'management') {
      return (
        <>
          <ProductForm productToEdit={productToEdit} onFormSubmit={handleFormSubmit} onCancelEdit={() => setProductToEdit(null)} />
          <h2>Manage Products</h2>
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Waypoint</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.sku}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.waypointId || 'N/A'}</td>
                  <td>
                    <button onClick={() => setProductToEdit(p)}>Edit</button>
                    <button onClick={() => handleDeleteClick(p.sku)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
    if (activeTab === 'settings') {
      return (
        <>
          <h2>Store Settings</h2>
          <button onClick={() => setSettingMode('entrance')} disabled={!!settingMode}>Set Entrance</button>
          <button onClick={() => setSettingMode('checkout')} disabled={!!settingMode}>Set Checkout</button>
          <hr />
          <h2>Waypoint Tools</h2>
          <button onClick={() => setSettingMode('waypoint_create')} disabled={!!settingMode}>Create Waypoint</button>
          <button onClick={() => setSettingMode('connect')} disabled={!!settingMode}>Connect Waypoints</button>
          <button onClick={() => setSettingMode('waypoint_move_start')} disabled={!!settingMode}>Move Waypoint</button>
          <button onClick={() => setSettingMode('waypoint_delete')} disabled={!!settingMode}>Delete Waypoint</button>
          {settingMode && <button onClick={cancelAllModes}>Cancel</button>}
          <hr />
          <FloorPlanUploader onUploadSuccess={loadData} />
        </>
      );
    }
    return null;
  };

  return (
    <div className="admin-page fullscreen">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </button>

      {renderMapWithOverlays()} {/* Map rendering remains here */}

      {/* The sidebar is now outside the map div and conditionally rendered based on sidebarOpen */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h1>Admin Dashboard</h1>
        <MessageDisplay message={message} clearMessage={() => setMessage('')} />
        <nav className="admin-tabs">
          <button onClick={() => setActiveTab('placement')} className={activeTab === 'placement' ? 'active' : ''}>Product Placement</button>
          <button onClick={() => setActiveTab('management')} className={activeTab === 'management' ? 'active' : ''}>Product Management</button>
          <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Store Settings</button>
        </nav>
        <p className="current-mode-status">{settingMode ? `Mode: ${settingMode}` : selectedProduct ? `Placing: ${selectedProduct.name}` : 'Select a product'}</p>
        <div className="sidebar-content">{renderSidebarContent()}</div>
      </div>
    </div>
  );
}

export default AdminPage;