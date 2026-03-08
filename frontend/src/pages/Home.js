import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin, TrendingDown, Sparkles, ArrowRight, Star, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsApi, storesApi, promotionsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { cartApi } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [promotedProducts, setPromotedProducts] = useState([]);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [productsRes, storesRes, promosRes] = await Promise.all([
        productsApi.getAll({ promoted_only: true }),
        storesApi.getAll(user?.lat, user?.lng, 10),
        promotionsApi.getAll()
      ]);
      
      setPromotedProducts(productsRes.data.slice(0, 8));
      setNearbyStores(storesRes.data.slice(0, 6));
      setPromotions(promosRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8 md:py-12 px-4"
        data-testid="hero-section"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary-600 rounded-full text-sm font-medium" data-testid="hero-badge">
              <Sparkles size={16} />
              <span>Ahorra en cada esquina</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight" data-testid="hero-title">
              Descubre las mejores <span className="gradient-primary bg-clip-text text-transparent">ofertas</span> de tu barrio
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed" data-testid="hero-description">
              Explora productos, promociones y servicios cercanos. Planifica tu ruta de ahorro y compra inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/map')}
                className="h-12 px-8 rounded-full bg-primary text-white font-bold shadow-glow-primary hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                data-testid="explore-map-btn"
              >
                <Map size={20} />
                Explorar Mapa
              </button>
              <button
                onClick={() => navigate('/route-planner')}
                className="h-12 px-8 rounded-full bg-white text-primary border-2 border-primary/20 hover:border-primary/50 font-bold transition-all flex items-center justify-center gap-2"
                data-testid="plan-route-btn"
              >
                <ArrowRight size={20} />
                Planificar Ruta
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1651493355781-20b4e12f3231?crop=entropy&cs=srgb&fm=jpg&q=85&w=600"
              alt="Person using shopping app"
              className="rounded-3xl shadow-float w-full"
              data-testid="hero-image"
            />
          </div>
        </div>
      </motion.section>

      {/* Promotions Highlight */}
      {promotions.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="py-6 px-4"
          data-testid="promotions-section"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold font-heading" data-testid="promotions-title">
              <Zap className="inline text-primary mr-2" size={28} />
              Promociones Activas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-3xl p-6 border border-orange-200 shadow-card hover:shadow-float transition-all cursor-pointer group"
                onClick={() => navigate('/explore')}
                data-testid={`promo-card-${index}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    -{promo.discount_percentage}%
                  </div>
                  <TrendingDown className="text-secondary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{promo.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{promo.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Válido hasta {new Date(promo.valid_until).toLocaleDateString()}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Promoted Products */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="py-6 px-4"
        data-testid="products-section"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold font-heading" data-testid="products-title">Productos en Oferta</h2>
          <button
            onClick={() => navigate('/explore')}
            className="text-primary font-medium hover:underline flex items-center gap-1"
            data-testid="view-all-products"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        <div className="product-grid">
          {promotedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg group"
              data-testid={`product-card-${index}`}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.discount_percentage && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                    -{product.discount_percentage}%
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    {product.original_price && (
                      <span className="text-xs text-slate-400 line-through ml-2">${product.original_price}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all transform active:scale-95"
                  data-testid={`add-to-cart-${index}`}
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Nearby Stores */}
      {nearbyStores.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="py-6 px-4 pb-20 md:pb-6"
          data-testid="stores-section"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold font-heading" data-testid="stores-title">
              <MapPin className="inline text-accent mr-2" size={28} />
              Comercios Cercanos
            </h2>
            <button
              onClick={() => navigate('/map')}
              className="text-primary font-medium hover:underline flex items-center gap-1"
              data-testid="view-all-stores"
            >
              Ver mapa <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-3xl p-4 border border-slate-100 flex flex-col gap-3 relative store-card cursor-pointer"
                onClick={() => navigate('/explore', { state: { storeId: store.id } })}
                data-testid={`store-card-${index}`}
              >
                {store.is_premium && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-premium text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star size={12} fill="white" /> Premium
                  </div>
                )}
                <img
                  src={store.image_url}
                  alt={store.name}
                  className="w-full h-32 object-cover rounded-2xl"
                />
                <div>
                  <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{store.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={14} className="text-yellow-500" fill="#EAB308" />
                      <span className="font-medium">{store.rating}</span>
                    </div>
                    {store.active_promotions > 0 && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <Zap size={14} />
                        <span>{store.active_promotions} ofertas</span>
                      </div>
                    )}
                  </div>
                  {store.distance && (
                    <p className="text-xs text-slate-500 mt-2">{store.distance} km de distancia</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default Home;