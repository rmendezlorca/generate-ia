import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, ShoppingCart, Route, Store } from 'lucide-react';
import { routesApi, cartApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const RouteSearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchParams, setSearchParams] = useState({
    origin_lat: user?.lat || -33.4489,
    origin_lng: user?.lng || -70.6693,
    destination_lat: '',
    destination_lng: '',
    product_search: '',
    max_detour_km: 2
  });
  const [destinationAddress, setDestinationAddress] = useState('');

  // Predefined destinations for demo
  const quickDestinations = [
    { name: 'Centro', lat: -33.4378, lng: -70.6504 },
    { name: 'Providencia', lat: -33.4262, lng: -70.6106 },
    { name: 'Las Condes', lat: -33.4103, lng: -70.5672 },
    { name: 'Ñuñoa', lat: -33.4569, lng: -70.5975 }
  ];

  const setQuickDestination = (dest) => {
    setSearchParams(prev => ({
      ...prev,
      destination_lat: dest.lat,
      destination_lng: dest.lng
    }));
    setDestinationAddress(dest.name);
  };

  const handleSearch = async () => {
    if (!searchParams.product_search.trim()) {
      toast.error('Ingresa un producto a buscar');
      return;
    }
    if (!searchParams.destination_lat || !searchParams.destination_lng) {
      toast.error('Selecciona un destino');
      return;
    }

    setLoading(true);
    try {
      const response = await routesApi.searchProducts({
        ...searchParams,
        destination_lat: parseFloat(searchParams.destination_lat),
        destination_lng: parseFloat(searchParams.destination_lng)
      });
      setResults(response.data);
      if (response.data.products_found === 0) {
        toast.info('No se encontraron productos en la ruta');
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar al carrito');
      navigate('/auth');
      return;
    }
    try {
      await cartApi.add(productId, 1);
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar producto');
    }
  };

  const openNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="app-container py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-heading mb-2 flex items-center gap-3" data-testid="route-search-title">
          <Route className="text-primary" />
          Buscar en Ruta
        </h1>
        <p className="text-slate-600">Encuentra productos en los locales de tu ruta</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        {/* Product Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">¿Qué producto buscas?</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchParams.product_search}
              onChange={(e) => setSearchParams(prev => ({ ...prev, product_search: e.target.value }))}
              placeholder="Ej: Leche, Pan, Frutas..."
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid="product-search-input"
            />
          </div>
        </div>

        {/* Origin */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tu ubicación (origen)</label>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
            <MapPin className="text-green-500" size={20} />
            <span className="text-slate-600">
              {user?.lat ? 'Mi ubicación actual' : 'Santiago Centro (por defecto)'}
            </span>
          </div>
        </div>

        {/* Destination */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Destino</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {quickDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => setQuickDestination(dest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  destinationAddress === dest.name
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                data-testid={`dest-${dest.name}`}
              >
                {dest.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="O ingresa coordenadas manualmente"
              className="flex-1 h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Max Detour */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Desvío máximo: {searchParams.max_detour_km} km
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={searchParams.max_detour_km}
            onChange={(e) => setSearchParams(prev => ({ ...prev, max_detour_km: parseFloat(e.target.value) }))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="search-route-btn"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Search size={20} />
              Buscar en mi Ruta
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 md:mb-6"
        >
          {/* Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{results.products_found}</p>
                <p className="text-xs text-slate-600">Productos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{results.stores_on_route}</p>
                <p className="text-xs text-slate-600">Locales en Ruta</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">"{results.search_query}"</p>
                <p className="text-xs text-slate-600">Búsqueda</p>
              </div>
            </div>
          </div>

          {/* Product Results */}
          {results.results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Search size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold mb-2">Sin resultados</h3>
              <p className="text-slate-600">No encontramos "{results.search_query}" en tu ruta</p>
              <p className="text-sm text-slate-500 mt-2">Intenta con otro producto o aumenta el desvío máximo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.results.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-orange-200 transition-all"
                  data-testid={`route-result-${index}`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-lg">{item.product.name}</h3>
                        <span className="text-lg font-bold text-primary">${item.product.price}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                        <Store size={14} />
                        <span>{item.store.name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-green-600 font-medium">
                          {item.distance_from_route_km} km de tu ruta
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => addToCart(item.product.id)}
                          className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          Agregar
                        </button>
                        <button
                          onClick={() => openNavigation(item.store.lat, item.store.lng)}
                          className="py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Navigation size={16} />
                          Ir
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RouteSearch;
