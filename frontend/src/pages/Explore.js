import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { productsApi, storesApi } from '../utils/api';
import { cartApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(location.state?.storeId || null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Lácteos', 'Panadería', 'Frutas', 'Verduras', 'Bebidas', 'Carnes'];

  useEffect(() => {
    loadData();
  }, [selectedStore, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, storesRes] = await Promise.all([
        productsApi.getAll({
          store_id: selectedStore,
          category: selectedCategory
        }),
        storesApi.getAll()
      ]);
      
      setProducts(productsRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar productos');
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setSelectedStore(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedStore || selectedCategory || searchQuery;

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
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="explore-title">Explorar Productos</h1>
        <p className="text-slate-600" data-testid="explore-subtitle">Descubre productos y ofertas de tu barrio</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid="search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 bg-white border border-slate-200 rounded-xl flex items-center gap-2 hover:border-primary/50 transition-all"
            data-testid="filter-toggle"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-600">Filtros activos:</span>
            {selectedStore && (
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                {stores.find(s => s.id === selectedStore)?.name}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedStore(null)} />
              </div>
            )}
            {selectedCategory && (
              <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm flex items-center gap-2">
                {selectedCategory}
                <X size={14} className="cursor-pointer" onClick={() => setSelectedCategory(null)} />
              </div>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-primary underline"
              data-testid="clear-filters"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-xl p-4 border border-slate-200"
            data-testid="filter-panel"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stores Filter */}
              <div>
                <h3 className="font-semibold mb-3">Comercios</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stores.map(store => (
                    <label key={store.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                      <input
                        type="radio"
                        name="store"
                        checked={selectedStore === store.id}
                        onChange={() => setSelectedStore(store.id)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{store.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="font-semibold mb-3">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-accent text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      data-testid={`category-${category}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Products Grid */}
      <div className="pb-20 md:pb-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12" data-testid="no-products">
            <p className="text-slate-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * index }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg group"
                data-testid={`product-${index}`}
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
                  {product.is_promoted && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                      OFERTA
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-500 mb-1">{product.category}</p>
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
                    Agregar al Carrito
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;