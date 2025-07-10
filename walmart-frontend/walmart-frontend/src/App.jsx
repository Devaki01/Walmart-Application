// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import { fetchAllProducts, fetchOptimizedRoute } from './api';
import ProductList from './ProductList';
import ShoppingCart from './ShoppingCart';
import MapView from './MapView';
import MessageDisplay from './MessageDisplay';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [route, setRoute] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productData = await fetchAllProducts();
        if (Array.isArray(productData)) {
            setProducts(productData);
        } else {
            console.error("Received non-array data for products:", productData);
            setProducts([]);
            setMessage('Error: Failed to load product data in the correct format.');
        }
      } catch (error) {
        setMessage('Error: Could not load products from the server.');
      }
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
      setMessage("Please add items to your cart first.");
      return;
    }
    try {
      const productSkus = cart.map(item => item.sku);
      const optimizedRouteData = await fetchOptimizedRoute(productSkus);
      if (optimizedRouteData?.length > 0) {
        setRoute(optimizedRouteData);
      } else {
        setMessage("Could not generate a route. Ensure items are placed correctly.");
      }
    } catch (error) {
      setMessage("Error: Failed to generate the route.");
    }
  };
  
  const handleStartNewList = () => {
    setCart([]);
    setRoute([]);
    setMessage('');
  };

  if (route.length > 0) {
    return (
      <div className="App">
        <MapView route={route} onBack={handleStartNewList} />
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Project Pathfinder</h1>
      </header>
      <main className="container">
        <MessageDisplay message={message} clearMessage={() => setMessage('')} />
        <ProductList products={products} addToCart={handleAddToCart} />
        <ShoppingCart cart={cart} onGenerateRoute={handleGenerateRoute} />
      </main>
    </div>
  );
}

export default App;