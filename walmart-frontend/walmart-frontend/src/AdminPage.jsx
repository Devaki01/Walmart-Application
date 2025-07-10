import React, { useState, useEffect, useCallback } from 'react';
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

    const handleMapClick = async (e) => {
        if (!settingMode) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newLocation = { x, y, z: 0 };
        try {
            if (settingMode === 'entrance' || settingMode === 'checkout') {
                setSettings(await updateSettingLocation(settingMode, newLocation));
                setMessage(`Updated ${settingMode} location.`);
                setSettingMode(null);
            } else if (settingMode === 'waypoint_create') {
                await createWaypoint(newLocation);
                setMessage(`New waypoint created.`);
                await loadData();
            } else if (settingMode === 'waypoint_move_end' && waypointToMove) {
                await updateWaypointLocation(waypointToMove.id, newLocation);
                setMessage(`Moved waypoint ${waypointToMove.id}.`);
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
            if (window.confirm(`Are you sure you want to delete waypoint ${waypoint.id}?`)) {
                try {
                    await deleteWaypoint(waypoint.id);
                    setMessage(`Deleted waypoint ${waypoint.id}.`);
                    setSettingMode(null);
                    await loadData();
                } catch (error) {
                    setMessage(`Error deleting waypoint.`);
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
            const updatedOrNewProduct = isEditing ? await updateProduct(productData.sku, productData) : await createProduct(productData);
            setProducts(prev => isEditing ? prev.map(p => p.sku === updatedOrNewProduct.sku ? updatedOrNewProduct : p) : [...prev, updatedOrNewProduct]);
            setMessage(`Product ${productData.name} ${isEditing ? 'updated' : 'created'}.`);
            setProductToEdit(null);
        } catch (error) {
            setMessage(`Error saving product.`);
        }
    };

    const handleDeleteClick = async (sku) => {
        if (window.confirm(`Delete product SKU: ${sku}?`)) {
            try {
                await deleteProduct(sku);
                setMessage(`Product ${sku} deleted.`);
                setProducts(prev => prev.filter(p => p.sku !== sku));
            } catch (error) {
                setMessage(`Error deleting product.`);
            }
        }
    };

    const renderMapWithOverlays = () => {
        const waypointMap = new Map(waypoints.map(wp => [wp.id, wp]));
        return (
            <div className="map-container-admin" onClick={handleMapClick}>
                <img src="/walmart-map.svg" alt="Store Floor Plan" />
                <svg className="path-overlay" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    {waypoints.map(wp => {
                        if (!wp.location || !wp.connections) return null;
                        const from = wp.location;
                        return wp.connections.map(toId => {
                            const toWp = waypointMap.get(toId);
                            if (!toWp || !toWp.location) return null;
                            const to = toWp.location;
                            return <line key={`${wp.id}-${toId}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(0, 100, 255, 0.5)" strokeWidth="2" />;
                        });
                    })}
                </svg>
                {waypoints.filter(wp => wp && wp.location).map(wp => (
                    <div 
                        key={wp.id} 
                        className={`waypoint-dot ${firstWaypointToConnect?.id === wp.id ? 'connecting' : ''} ${waypointToMove?.id === wp.id ? 'moving' : ''}`}
                        style={{ left: `${wp.location.x}px`, top: `${wp.location.y}px` }}
                        title={`Waypoint: ${wp.id}`}
                        onClick={(e) => { e.stopPropagation(); handleWaypointClick(wp); }}
                    ></div>
                ))}
                {activeTab === 'placement' && selectedProduct?.waypointId && (() => {
                    const wp = waypoints.find(w => w.id === selectedProduct.waypointId);
                    if (!wp || !wp.location) return null;
                    return <div className="location-dot selected" style={{ left: `${wp.location.x}px`, top: `${wp.location.y}px` }} title={`Location of ${selectedProduct.name}`} />;
                })()}
                {settings?.entranceLocation && <div className="setting-dot entrance" style={{ left: `${settings.entranceLocation.x}px`, top: `${settings.entranceLocation.y}px` }} title="Entrance">E</div>}
                {settings?.checkoutLocation && <div className="setting-dot checkout" style={{ left: `${settings.checkoutLocation.x}px`, top: `${settings.checkoutLocation.y}px` }} title="Checkout">C</div>}
            </div>
        );
    };

    const getInstructions = () => {
        if (settingMode === 'connect') return `Connection Mode: ${firstWaypointToConnect ? `Selected ${firstWaypointToConnect.id}. Click another waypoint to connect.` : 'Click a waypoint to start a connection.'}`;
        if (settingMode === 'waypoint_move_start') return 'Move Mode: Click the waypoint you wish to move.';
        if (settingMode === 'waypoint_move_end') return `Moving waypoint ${waypointToMove.id}. Click its new location on the map.`;
        if (settingMode === 'waypoint_delete') return 'Delete Mode: Click a waypoint to delete it.';
        if (settingMode) return `Mode: ${settingMode}. Click on the map.`;
        if (activeTab === 'placement') return selectedProduct ? `Placing: ${selectedProduct.name}. Click a waypoint.` : "Select a product to begin placement.";
        return 'Welcome to the Admin Dashboard.';
    };

    const cancelAllModes = () => {
        setSettingMode(null);
        setFirstWaypointToConnect(null);
        setWaypointToMove(null);
    };

    const changeTab = (tab) => {
        setActiveTab(tab);
        cancelAllModes();
        setSelectedProduct(null);
    }

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            <MessageDisplay message={message} clearMessage={() => setMessage('')} />
            <nav className="admin-nav">
                <button onClick={() => changeTab('placement')} className={activeTab === 'placement' ? 'active' : ''}>Product Placement</button>
                <button onClick={() => changeTab('management')} className={activeTab === 'management' ? 'active' : ''}>Product Management</button>
                <button onClick={() => changeTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Store Settings</button>
            </nav>
            <p className="instructions">{getInstructions()}</p>
            <div className="admin-content">
                {activeTab === 'placement' && (<div className="admin-container"><div className="product-placement-list"><h2>Product List</h2><ul>{products.map(p => (<li key={p.sku} onClick={() => setSelectedProduct(p)} className={selectedProduct?.sku === p.sku ? 'selected' : ''}>{p.name}<span className={p.waypointId ? 'location-indicator' : 'location-indicator-missing'}>{p.waypointId ? '✔' : '✖'}</span></li>))}</ul></div>{renderMapWithOverlays()}</div>)}
                {activeTab === 'management' && (<div className="management-view"><ProductForm productToEdit={productToEdit} onFormSubmit={handleFormSubmit} onCancelEdit={() => setProductToEdit(null)} /><div className="product-management-list"><h2>Manage Products</h2><table><thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Waypoint ID</th><th>Actions</th></tr></thead><tbody>{products.map(p => (<tr key={p.sku}><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{p.waypointId || 'N/A'}</td><td><button onClick={() => setProductToEdit(p)}>Edit</button><button onClick={() => handleDeleteClick(p.sku)}>Delete</button></td></tr>))}</tbody></table></div></div>)}
                {activeTab === 'settings' && (<div className="admin-container"><div className="settings-controls"><h2>Store Settings</h2><button onClick={() => setSettingMode('entrance')} disabled={!!settingMode}>Set Entrance</button><button onClick={() => setSettingMode('checkout')} disabled={!!settingMode}>Set Checkout</button><hr/><h2>Waypoint Management</h2><button onClick={() => setSettingMode('waypoint_create')} disabled={!!settingMode}>Create Waypoints</button><button onClick={() => setSettingMode('connect')} disabled={!!settingMode}>Connect Waypoints</button><button onClick={() => setSettingMode('waypoint_move_start')} disabled={!!settingMode}>Move Waypoint</button><button onClick={() => setSettingMode('waypoint_delete')} disabled={!!settingMode}>Delete Waypoint</button>{settingMode && <button onClick={cancelAllModes}>Cancel</button>}<hr/><FloorPlanUploader onUploadSuccess={loadData} /></div>{renderMapWithOverlays()}</div>)}
            </div>
        </div>
    );
}

export default AdminPage;
