// src/MapView.jsx

import React, { useState, useEffect } from 'react';
import { getActiveFloorPlan } from './api'; // Import the new API function

function MapView({ route, onBack }) {
  const [floorPlanUrl, setFloorPlanUrl] = useState('');

  // This effect runs when the component mounts to fetch the current map's URL
  useEffect(() => {
    const fetchMap = async () => {
      const settings = await getActiveFloorPlan();
      setFloorPlanUrl(settings.activeFloorPlanUrl);
    };
    fetchMap();
  }, []);

  const generatePath = (routeData) => {
    if (!routeData || routeData.length === 0) {
      return "";
    }
    const firstPoint = routeData[0];
    let pathString = `M ${firstPoint.x} ${firstPoint.y}`;
    for (let i = 1; i < routeData.length; i++) {
      const point = routeData[i];
      pathString += ` L ${point.x} ${point.y}`;
    }
    return pathString;
  };

  const pathData = generatePath(route);

  return (
    <div className="map-view">
      <h2>Your Optimized Route</h2>
      <p>Follow the red line to gather your items efficiently!</p>
      
      <div className="map-container">
        {/* Only render the image if the URL has been fetched */}
        {floorPlanUrl && <img src={floorPlanUrl} alt="Store Floor Plan" />}
        
        <svg className="path-overlay" width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <path
            d={pathData}
            fill="none"
            stroke="red"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <button onClick={onBack} style={{ marginTop: '1rem' }}>Start New List</button>
    </div>
  );
}

export default MapView;