'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = L.icon({
  iconUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  shadowSize: [40, 40],
  iconAnchor: [11, 36],
  shadowAnchor: [10, 34],
  popupAnchor: [0, -32],
});

const Map = ({ geoJson }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!geoJson) return;

    // Clean up any existing map on this container
    if (mapRef.current && mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    const map = L.map(mapRef.current).setView([37.92686, -96.76757], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const geoJsonLayer = L.geoJSON(geoJson, {
      pointToLayer: (feature, latlng) => {
        const marker = L.marker(latlng, { icon: customIcon });
        if (feature.properties?.popupContent) {
          marker.bindPopup(feature.properties.popupContent);
        }
        return marker;
      },
    }).addTo(map);

    map.fitBounds(geoJsonLayer.getBounds());

    // Clean up map on unmount
    return () => {
      map.remove();
    };
  }, [geoJson]);

  return (
    <div
      ref={mapRef}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default Map;