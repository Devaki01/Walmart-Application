import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const CustomMapOverlay = ({ imageUrl, bounds }) => {
  const map = useMap();

  useEffect(() => {
    const overlay = L.imageOverlay(imageUrl, bounds).addTo(map);
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds);
    }, 200);
    return () => overlay.remove();
  }, [imageUrl, bounds, map]);

  return null;
};

export default CustomMapOverlay;
