import React from 'react';

function MapView({ route, onBack }) {
  const generatePath = (routeData) => {
    if (!routeData || routeData.length === 0) return "";
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
        <img src="/walmart-map.svg" alt="Store Floor Plan" />
        <svg className="path-overlay" width="1200" height="800" viewBox="0 0 1200 800">
          {route.length > 0 && (
            <>
              <path d={pathData} fill="none" stroke="red" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
              {/* Start Circle */}
              <circle cx={route[0].x} cy={route[0].y} r="10" fill="green" />
              {/* End Circle */}
              <circle cx={route[route.length - 1].x} cy={route[route.length - 1].y} r="10" fill="blue" />
            </>
          )}
        </svg>
      </div>
      <button onClick={onBack} style={{ marginTop: '1rem' }}>Start New List</button>
    </div>
  );
}

export default MapView;
