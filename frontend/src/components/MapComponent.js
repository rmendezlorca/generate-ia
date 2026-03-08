import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zap } from 'lucide-react';

/*
 * MAP CONFIGURATION
 * 
 * CURRENT: Using OpenStreetMap (Leaflet) - FREE
 * 
 * TO SWITCH TO GOOGLE MAPS:
 * 1. Get API key from: https://console.cloud.google.com/google/maps-apis
 * 2. Add to /app/frontend/.env: REACT_APP_GOOGLE_MAPS_KEY=your_key_here
 * 3. Uncomment the GoogleMap component below
 * 4. In parent components, replace <LeafletMap /> with <GoogleMap />
 * 5. yarn add @react-google-maps/api
 * 
 * Google Maps Code (uncomment when ready):
 * 
 * import { GoogleMap as GMap, LoadScript, Marker } from '@react-google-maps/api';
 * 
 * export const GoogleMap = ({ stores, center, zoom = 13, onStoreClick }) => {
 *   const mapStyles = { height: '100%', width: '100%' };
 *   
 *   return (
 *     <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
 *       <GMap
 *         mapContainerStyle={mapStyles}
 *         zoom={zoom}
 *         center={center}
 *       >
 *         {stores.map(store => (
 *           <Marker
 *             key={store.id}
 *             position={{ lat: store.lat, lng: store.lng }}
 *             onClick={() => onStoreClick && onStoreClick(store)}
 *           />
 *         ))}
 *       </GMap>
 *     </LoadScript>
 *   );
 * };
 */

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker for stores with promotions
const createCustomIcon = (hasPromotions) => {
  const color = hasPromotions ? '#FF6B00' : '#6200EA';
  const iconHtml = `
    <div style="
      background: ${color};
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-center: center;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        ${hasPromotions 
          ? '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />' 
          : '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />'}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export const LeafletMap = ({ stores = [], center = [-33.4489, -70.6693], zoom = 13, onStoreClick, height = '500px' }) => {
  return (
    <div style={{ height, width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createCustomIcon(store.active_promotions > 0)}
            eventHandlers={{
              click: () => onStoreClick && onStoreClick(store)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-base">{store.name}</h3>
                <p className="text-sm text-gray-600">{store.category}</p>
                {store.active_promotions > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-orange-600">
                    <Zap size={14} />
                    <span className="text-xs font-medium">{store.active_promotions} promociones</span>
                  </div>
                )}
                {store.distance && (
                  <p className="text-xs text-gray-500 mt-1">{store.distance} km de distancia</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;