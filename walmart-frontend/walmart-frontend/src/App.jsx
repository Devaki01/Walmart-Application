// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import { fetchAllProducts, fetchOptimizedRoute } from './api'; // import new function
import ProductList from './ProductList';
import ShoppingCart from './ShoppingCart';
import MapView from './MapView'; // import new component

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [route, setRoute] = useState([]); // <-- New state for the final route

  useEffect(() => {
    const getProducts = async () => {
      const productData = await fetchAllProducts();
      setProducts(productData);
    };
    getProducts();
  }, []);

  const handleAddToCart = (productToAdd) => {
    if (!cart.find(item => item.sku === productToAdd.sku)) {
      setCart([...cart, productToAdd]);
    }
  };

  const handleGenerateRoute = async () => {
    if (cart.length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
    // Extract just the SKU (or 'id') strings from the cart objects
    const productSkus = cart.map(item => item.sku);
    const optimizedRouteData = await fetchOptimizedRoute(productSkus);
    setRoute(optimizedRouteData); // <-- Update our route state with the response
  };
  
  const handleStartNewList = () => {
    setCart([]);
    setRoute([]);
  };

  // Conditional Rendering Logic
  if (route.length > 0) {
    // If we have a route, show the MapView
    return (
      <div className="App">
        <header><h1>Project Pathfinder</h1></header>
        <main>
          <MapView route={route} onBack={handleStartNewList} />
        </main>
      </div>
    );
  }

  // Otherwise, show the default product and cart view
  return (
    <div className="App">
      <header><h1>Project Pathfinder</h1></header>
      <main className="container">
        <ProductList products={products} addToCart={handleAddToCart} />
        <ShoppingCart cart={cart} onGenerateRoute={handleGenerateRoute} />
      </main>
    </div>
  );
}

export default App;