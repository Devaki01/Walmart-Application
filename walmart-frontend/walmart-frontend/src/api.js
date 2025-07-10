const API_BASE_URL = 'http://localhost:8080/api';

const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) return response.json();
    return response.text();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
};

export const fetchAllProducts = () => apiFetch(`${API_BASE_URL}/products`);
export const createProduct = (productData) => apiFetch(`${API_BASE_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
export const updateProduct = (sku, productData) => apiFetch(`${API_BASE_URL}/products/${sku}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
export const deleteProduct = (sku) => apiFetch(`${API_BASE_URL}/products/${sku}`, { method: 'DELETE' });

export const fetchAllWaypoints = () => apiFetch(`${API_BASE_URL}/waypoints`);
export const createWaypoint = (locationData) => apiFetch(`${API_BASE_URL}/waypoints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: locationData }) });
export const connectWaypoints = (fromId, toId) => apiFetch(`${API_BASE_URL}/waypoints/${fromId}/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectToId: toId }) });
export const updateWaypointLocation = (id, location) => apiFetch(`${API_BASE_URL}/waypoints/${id}/location`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(location) });
export const deleteWaypoint = (id) => apiFetch(`${API_BASE_URL}/waypoints/${id}`, { method: 'DELETE' });

export const assignProductToWaypoint = (sku, waypointId) => apiFetch(`${API_BASE_URL}/products/${sku}/assign-waypoint`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ waypointId }) });
export const getSettings = () => apiFetch(`${API_BASE_URL}/settings`);
export const updateSettingLocation = (type, location) => apiFetch(`${API_BASE_URL}/settings/location/${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(location) });
export const fetchOptimizedRoute = (productSkus) => apiFetch(`${API_BASE_URL}/products/optimize-route`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productSkus) });
export const uploadFloorPlan = async () => Promise.resolve("Upload functionality is a placeholder.");
