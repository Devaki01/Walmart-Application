import React from 'react';
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import CustomMapOverlay from './CustomMapOverlay';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapHeight = 4400;
const mapWidth = 6800;
const bounds = [[0, 0], [mapHeight, mapWidth]];
const leafletCenter = [mapHeight / 2, mapWidth / 2];

function Map({ products = [], route = [] }) {
  return (
    <MapContainer
      center={leafletCenter}
      zoom={-1}
      minZoom={-4}
      maxZoom={4}
      scrollWheelZoom={true}
      crs={L.CRS.Simple}
      style={{ height: '90vh', width: '100%' }}
    >
      <CustomMapOverlay
        imageUrl="/resources/floorplan.png"
        bounds={bounds}
      />

      {/* Product Markers */}
      {products.map(product => (
        <Marker
          key={product._id}
          position={[product.yCoordinate, product.xCoordinate]}
        >
          <Popup>{product.name}</Popup>
        </Marker>
      ))}

      {/* Route Polyline */}
      {route.length > 1 && (
        <Polyline
          positions={route.map(p => [p.yCoordinate, p.xCoordinate])}
          color="blue"
          weight={4}
        />
      )}
    </MapContainer>
  );
}

export default Map;
