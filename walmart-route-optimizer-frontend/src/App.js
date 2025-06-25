import React, { useState, useEffect } from 'react';
import Map from './Components/Map';
import 'leaflet/dist/leaflet.css';

function App() {
  const [products, setProducts] = useState([]);
  const [route, setRoute] = useState([]);

  // 1. Fetch all products on load
  useEffect(() => {
    fetch('http://localhost:8080/api/products/get-products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);

        // 2. Extract all MongoDB _ids
        const allProductIds = data.map(p => p._id);

        // 3. Send them for route optimization
        fetch('http://localhost:8080/api/products/optimize-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allProductIds)
        })
          .then(res => res.json())
          .then(optimizedRoute => {
            console.log("Optimized Route:", optimizedRoute);
            setRoute(optimizedRoute);
          })
          .catch(err => console.error("Error optimizing route:", err));
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Walmart Route Optimizer (Full Store View)</h1>
      <Map products={products} route={route} />
    </div>
  );
}

export default App;
