import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation2, Sparkles } from 'lucide-react';
import { LeafletMap } from '../components/MapComponent';
import { storesApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [center, setCenter] = useState([-33.4489, -70.6693]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setCenter([user.lat, user.lng]);
      setLocationEnabled(true);
    }
    loadStores();
  }, [user]);

  const loadStores = async () => {
    try {
      const response = await storesApi.getAll(user?.lat, user?.lng);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast.error('Error al cargar comercios');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo ubicación...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCenter([latitude, longitude]);
          setLocationEnabled(true);
          toast.dismiss();
          toast.success('Ubicación actualizada');
          
          // Reload stores with new location
          const response = await storesApi.getAll(latitude, longitude);
          setStores(response.data);
        },
        (error) => {
          toast.dismiss();
          toast.error('No se pudo obtener la ubicación');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
    }
  };

  const handleStoreClick = (store) => {
    setSelectedStore(store);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="app-container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="map-title">Mapa de Comercios</h1>
        <p className="text-slate-600" data-testid="map-subtitle">Explora comercios y ofertas cerca de ti</p>
      </div>

      {/* Location Banner */}
      {!locationEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20"
          data-testid="location-banner"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" size={24} />
              <div>
                <h3 className="font-bold">Activa tu ubicación</h3>
                <p className="text-sm text-slate-600">Encuentra comercios y ofertas más cercanas a ti</p>
              </div>
            </div>
            <button
              onClick={handleEnableLocation}
              className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
              data-testid="enable-location-btn"
            >
              <Navigation2 size={18} />
              Activar Ubicación
            </button>
          </div>
        </motion.div>
      )}

      {/* Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-4 shadow-card" data-testid="map-container">
            <LeafletMap
              stores={stores}
              center={center}
              zoom={13}
              onStoreClick={handleStoreClick}
              height="600px"
            />
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 mb-2">Configuración de Mapa</h3>
            <p className="text-sm text-blue-800 mb-2">
              Actualmente usando: <strong>OpenStreetMap (Leaflet)</strong> - Gratis
            </p>
            <details className="text-sm text-blue-700">
              <summary className="cursor-pointer font-medium mb-2">Cómo cambiar a Google Maps</summary>
              <div className="mt-2 space-y-1 text-xs bg-white p-3 rounded-lg">
                <p>1. Obtener API key de: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
                <p>2. Agregar a <code className="bg-slate-100 px-1 rounded">/app/frontend/.env</code>:</p>
                <code className="block bg-slate-900 text-green-400 p-2 rounded mt-1">REACT_APP_GOOGLE_MAPS_KEY=tu_api_key</code>
                <p>3. Ver instrucciones completas en <code className="bg-slate-100 px-1 rounded">/app/frontend/src/components/MapComponent.js</code></p>
              </div>
            </details>
          </div>
        </div>

        {/* Stores List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading" data-testid="stores-list-title">
            Comercios ({stores.length})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {stores.map((store) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                  selectedStore?.id === store.id
                    ? 'border-primary shadow-lg'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
                onClick={() => {
                  handleStoreClick(store);
                  setCenter([store.lat, store.lng]);
                }}
                data-testid={`store-item-${store.id}`}
              >
                <div className="flex gap-3">
                  <img
                    src={store.image_url}
                    alt={store.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{store.name}</h3>
                    <p className="text-sm text-slate-600">{store.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {store.active_promotions > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {store.active_promotions} ofertas
                        </span>
                      )}
                      {store.distance && (
                        <span className="text-xs text-slate-500">
                          {store.distance} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;