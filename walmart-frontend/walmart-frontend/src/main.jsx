// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx'
import AdminPage from './AdminPage.jsx'; // Import the new Admin Page
import './index.css'

// Create our browser router configuration
const router = createBrowserRouter([
  {
    path: "/", // The main shopping app
    element: <App />,
  },
  {
    path: "/admin", // The new admin dashboard
    element: <AdminPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)