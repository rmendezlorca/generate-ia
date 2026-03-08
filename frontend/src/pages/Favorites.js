import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { favoritesApi, cartApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await favoritesApi.remove(productId);
      setFavorites(prev => prev.filter(f => f.product.id !== productId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      toast.error('Error al eliminar de favoritos');
    }
  };

  const addToCart = async (productId) => {
    try {
      await cartApi.add(productId, 1);
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container py-12 px-4">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Mis Favoritos</h2>
          <p className="text-slate-600 mb-6">Inicia sesión para ver tus productos favoritos</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="app-container py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-heading mb-2 flex items-center gap-3">
          <Heart className="text-red-500" fill="#EF4444" />
          Mis Favoritos
        </h1>
        <p className="text-slate-600">{favorites.length} productos guardados</p>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No tienes favoritos aún</h3>
          <p className="text-slate-600 mb-6">Explora productos y guarda tus preferidos</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-6">
          {favorites.map((item, index) => (
            <motion.div
              key={item.favorite_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg"
              data-testid={`favorite-item-${index}`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFavorite(item.product.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  data-testid="remove-favorite-btn"
                >
                  <Trash2 size={18} />
                </button>
                {item.product.discount_percentage && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                    -{item.product.discount_percentage}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-1">{item.product.category}</p>
                <h3 className="font-bold text-lg mb-2">{item.product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold text-primary">${item.product.price}</span>
                    {item.product.original_price && (
                      <span className="text-sm text-slate-400 line-through ml-2">${item.product.original_price}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(item.product.id)}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  data-testid="add-to-cart-from-favorite"
                >
                  <ShoppingCart size={18} />
                  Agregar al Carrito
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
