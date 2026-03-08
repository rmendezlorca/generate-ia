import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, TrendingDown, Clock, DollarSign, Route as RouteIcon } from 'lucide-react';
import { routesApi } from '../utils/api';
import { LeafletMap } from '../components/MapComponent';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const RoutePlanner = () => {
  const { user } = useAuth();
  const [destination, setDestination] = useState({ lat: '', lng: '' });
  const [maxDetour, setMaxDetour] = useState(2);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          toast.dismiss();
          toast.success('Ubicación obtenida');
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

  const handleOptimizeRoute = async () => {
    if (!userLocation) {
      toast.error('Primero activa tu ubicación actual');
      return;
    }

    if (!destination.lat || !destination.lng) {
      toast.error('Ingresa las coordenadas del destino');
      return;
    }

    setLoading(true);
    try {
      const response = await routesApi.optimize({
        user_lat: parseFloat(userLocation.lat),
        user_lng: parseFloat(userLocation.lng),
        destination_lat: parseFloat(destination.lat),
        destination_lng: parseFloat(destination.lng),
        max_detour_km: parseFloat(maxDetour)
      });
      
      setRoute(response.data);
      toast.success('Ruta optimizada generada');
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast.error('Error al generar la ruta');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentAsDestination = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDestination({ lat: latitude.toString(), lng: longitude.toString() });
          toast.dismiss();
          toast.success('Destino establecido');
        },
        () => {
          toast.dismiss();
          toast.error('No se pudo obtener la ubicación');
        }
      );
    }
  };

  return (
    <div className="app-container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="route-planner-title">
          <RouteIcon className="inline text-primary mr-2" size={36} />
          Planificador de Rutas
        </h1>
        <p className="text-slate-600" data-testid="route-planner-subtitle">
          Optimiza tu ruta de compras y maximiza tu ahorro
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Location */}
          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="location-panel">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Navigation className="text-primary" size={24} />
              Ubicación Actual
            </h2>
            {userLocation ? (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Ubicación establecida</p>
                  <p className="text-xs text-green-700 mt-1">
                    Lat: {parseFloat(userLocation.lat).toFixed(4)}, Lng: {parseFloat(userLocation.lng).toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={handleGetCurrentLocation}
                  className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-all"
                  data-testid="update-location-btn"
                >
                  Actualizar ubicación
                </button>
              </div>
            ) : (
              <button
                onClick={handleGetCurrentLocation}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                data-testid="get-location-btn"
              >
                <Navigation size={18} />
                Obtener Mi Ubicación
              </button>
            )}
          </div>

          {/* Destination */}
          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="destination-panel">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="text-accent" size={24} />
              Destino
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Latitud</label>
                <input
                  type="number"
                  step="0.0001"
                  value={destination.lat}
                  onChange={(e) => setDestination({ ...destination, lat: e.target.value })}
                  placeholder="-33.4489"
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  data-testid="destination-lat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Longitud</label>
                <input
                  type="number"
                  step="0.0001"
                  value={destination.lng}
                  onChange={(e) => setDestination({ ...destination, lng: e.target.value })}
                  placeholder="-70.6693"
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  data-testid="destination-lng"
                />
              </div>
              <button
                onClick={handleUseCurrentAsDestination}
                className="w-full py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-all"
                data-testid="use-current-destination"
              >
                Usar ubicación actual como destino
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="settings-panel">
            <h2 className="text-xl font-bold mb-4">Configuración</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Máximo desvío (km): {maxDetour}
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={maxDetour}
                onChange={(e) => setMaxDetour(e.target.value)}
                className="w-full"
                data-testid="max-detour-slider"
              />
              <p className="text-xs text-slate-500 mt-2">
                Permite hasta {maxDetour} km de desvío para encontrar mejores ofertas
              </p>
            </div>
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimizeRoute}
            disabled={loading}
            className="w-full py-4 bg-gradient-primary text-white rounded-xl font-bold shadow-glow-primary hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="optimize-route-btn"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Optimizando...
              </>
            ) : (
              <>
                <TrendingDown size={20} />
                Optimizar Ruta de Ahorro
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {route ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                  data-testid="route-distance"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Distancia Total</p>
                      <p className="text-2xl font-bold">{route.total_distance_km} km</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                  data-testid="route-time"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Tiempo Estimado</p>
                      <p className="text-2xl font-bold">{route.estimated_time_minutes} min</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                  data-testid="route-savings"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Ahorro Estimado</p>
                      <p className="text-2xl font-bold text-secondary">${route.total_savings}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl p-4 shadow-card" data-testid="route-map">
                <h3 className="text-xl font-bold mb-4">Ruta Optimizada</h3>
                <LeafletMap
                  stores={route.stores}
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={12}
                  height="400px"
                />
              </div>

              {/* Stores on Route */}
              <div className="bg-white rounded-xl p-6 shadow-card" data-testid="route-stores">
                <h3 className="text-xl font-bold mb-4">Comercios en la Ruta ({route.stores.length})</h3>
                <div className="space-y-3">
                  {route.stores.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                      data-testid={`route-store-${index}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={store.image_url}
                        alt={store.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold">{store.name}</h4>
                        <p className="text-sm text-slate-600">{store.category}</p>
                      </div>
                      {store.active_promotions > 0 && (
                        <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                          {store.active_promotions} ofertas
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-card text-center" data-testid="no-route">
              <RouteIcon className="mx-auto text-slate-300 mb-4" size={64} />
              <h3 className="text-xl font-bold mb-2">Optimiza tu ruta</h3>
              <p className="text-slate-600">
                Configura tu ubicación y destino para generar una ruta de ahorro inteligente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;