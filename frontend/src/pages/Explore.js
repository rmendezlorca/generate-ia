import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productsApi, storesApi, cartApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import AdvancedFilters from '../components/AdvancedFilters';
import ProductDetailModal from '../components/ProductDetailModal';

const Explore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    min_price: '',
    max_price: '',
    store_id: location.state?.storeId || '',
    category: '',
    sort_by: '',
    in_stock_only: false,
    promoted_only: false
  });

  const categories = ['Lácteos', 'Panadería', 'Frutas', 'Verduras', 'Bebidas', 'Carnes'];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ...filters,
        min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
        max_price: filters.max_price ? parseFloat(filters.max_price) : undefined
      };
      
      const [productsRes, storesRes] = await Promise.all([
        productsApi.getAll(filterParams),
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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    if (typeof value === 'boolean') return value;
    return value !== '' && value !== null && value !== undefined;
  }).length;

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
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid="search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 bg-white border border-slate-200 rounded-xl flex items-center gap-2 hover:border-primary/50 transition-all relative"
            data-testid="filter-toggle"
          >
            <SlidersHorizontal size={20} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <AdvancedFilters
              filters={filters}
              setFilters={setFilters}
              onClose={() => setShowFilters(false)}
              categories={categories}
              stores={stores}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Products Grid */}
      <div className="pb-20 md:pb-6">
        {products.length === 0 ? (
          <div className="text-center py-12" data-testid="no-products">
            <p className="text-slate-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => {
              const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.03 * index }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-orange-200 transition-all hover:shadow-lg group cursor-pointer"
                  onClick={() => handleProductClick(product)}
                  data-testid={`product-${index}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={allImages[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {allImages.length > 1 && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full font-medium">
                        1 / {allImages.length}
                      </div>
                    )}
                    {product.discount_percentage && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                        -{product.discount_percentage}%
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.id);
                      }}
                      className="w-full py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all transform active:scale-95"
                      data-testid={`add-to-cart-${index}`}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        store={stores.find(s => s.id === selectedProduct?.store_id)}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAddToCart={handleAddToCart}
        onProductChange={(newProduct) => setSelectedProduct(newProduct)}
      />
    </div>
  );
};

export default Explore;