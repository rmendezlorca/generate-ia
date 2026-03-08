import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MapPin, Navigation, Phone, Clock, Zap, ExternalLink } from 'lucide-react';
import { productsApi } from '../utils/api';
import StoreReviews from './StoreReviews';

const StoreDetailModal = ({ store, isOpen, onClose, onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && store) {
      loadStoreProducts();
    }
  }, [isOpen, store]);

  const loadStoreProducts = async () => {
    try {
      const response = await productsApi.getAll({ store_id: store.id });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading store products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = () => {
    // Open in Google Maps or Apple Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openInMaps = () => {
    // Open location in maps
    const url = `https://www.openstreetmap.org/?mlat=${store.lat}&mlon=${store.lng}&zoom=17`;
    window.open(url, '_blank');
  };

  if (!isOpen || !store) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
          data-testid="store-detail-modal"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            data-testid="close-store-modal"
          >
            <X size={20} />
          </button>

          <div className="max-h-[90vh] overflow-y-auto">
            {/* Store Header */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={store.image_url}
                alt={store.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  {store.is_premium && (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Star size={12} fill="white" /> Premium
                    </span>
                  )}
                  {store.active_promotions > 0 && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Zap size={12} /> {store.active_promotions} ofertas
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{store.name}</h1>
                <p className="text-white/80 text-sm">{store.category}</p>
              </div>
            </div>

            <div className="p-6">
              {/* Store Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Star size={18} fill="#EAB308" />
                    <span className="font-bold text-slate-900">{store.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500">Calificación</p>
                </div>
                {store.distance && (
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="font-bold text-slate-900">{store.distance} km</p>
                    <p className="text-xs text-slate-500">Distancia</p>
                  </div>
                )}
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="font-bold text-slate-900">{products.length}</p>
                  <p className="text-xs text-slate-500">Productos</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="font-bold text-slate-900">{store.active_promotions || 0}</p>
                  <p className="text-xs text-slate-500">Ofertas</p>
                </div>
              </div>

              {/* Address & Navigation */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="text-primary mt-1" size={20} />
                  <div className="flex-1">
                    <p className="font-medium">{store.address}</p>
                    {store.phone && (
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Phone size={14} />
                        {store.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openNavigation}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    data-testid="navigate-to-store"
                  >
                    <Navigation size={18} />
                    Cómo llegar
                  </button>
                  <button
                    onClick={openInMaps}
                    className="py-3 px-4 bg-white border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    data-testid="view-in-maps"
                  >
                    <ExternalLink size={18} />
                    Ver en Mapa
                  </button>
                </div>
              </div>

              {/* Store Description */}
              {store.description && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Acerca de</h3>
                  <p className="text-slate-600">{store.description}</p>
                </div>
              )}

              {/* Products */}
              <div className="mb-6">
                <h3 className="font-bold mb-4">Productos ({products.length})</h3>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No hay productos disponibles</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {products.slice(0, 9).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border border-slate-100 rounded-xl p-2 cursor-pointer hover:border-orange-200 transition-all"
                        onClick={() => {
                          if (onProductClick) onProductClick(product);
                        }}
                        data-testid={`store-product-${product.id}`}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-medium line-clamp-1">{product.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold">${product.price}</span>
                          {product.original_price && (
                            <span className="text-xs text-slate-400 line-through">${product.original_price}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {products.length > 9 && (
                  <p className="text-center text-sm text-slate-500 mt-2">
                    +{products.length - 9} productos más
                  </p>
                )}
              </div>

              {/* Store Reviews */}
              <StoreReviews storeId={store.id} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoreDetailModal;
