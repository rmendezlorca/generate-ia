import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoritesApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const FavoriteButton = ({ productId, size = 'default' }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && productId) {
      checkFavorite();
    }
  }, [isAuthenticated, productId]);

  const checkFavorite = async () => {
    try {
      const response = await favoritesApi.check(productId);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar favoritos');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(productId);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await favoritesApi.add(productId);
        setIsFavorite(true);
        toast.success('Agregado a favoritos');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === 'small' 
    ? 'w-8 h-8' 
    : 'w-10 h-10';

  const iconSize = size === 'small' ? 16 : 20;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all ${
        isFavorite 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
      } shadow-lg disabled:opacity-50`}
      data-testid="favorite-btn"
    >
      <Heart 
        size={iconSize} 
        fill={isFavorite ? 'currentColor' : 'none'}
        className={loading ? 'animate-pulse' : ''}
      />
    </button>
  );
};

export default FavoriteButton;
