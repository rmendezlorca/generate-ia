import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Star, MapPin, Package, Tag } from 'lucide-react';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';
import FavoriteButton from './FavoriteButton';

const ProductDetailModal = ({ product, store, isOpen, onClose, onAddToCart, onProductChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!isOpen || !product) return null;

  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

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
          className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
          data-testid="product-detail-modal"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            data-testid="close-detail-modal"
          >
            <X size={20} />
          </button>

          {/* Favorite Button */}
          <div className="absolute top-4 right-16 z-20">
            <FavoriteButton productId={product.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[90vh] overflow-y-auto">
            {/* Image Gallery Section */}
            <div className="relative bg-slate-50 p-8">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg mb-4">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={allImages[currentImageIndex]}
                  alt={`${product.name} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                      data-testid="prev-detail-image"
                    >
                      <ChevronLeft size={24} className="text-slate-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                      data-testid="next-detail-image"
                    >
                      <ChevronRight size={24} className="text-slate-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-full font-medium">
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-secondary text-white text-lg font-bold rounded-full shadow-lg">
                    -{discount}%
                  </div>
                )}

                {product.is_promoted && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg">
                    OFERTA
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-8">
              {/* Category & Stock */}
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full">
                  {product.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  product.in_stock
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.in_stock ? '✓ Disponible' : 'Agotado'}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold mb-4" data-testid="product-detail-name">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-primary">${product.price}</span>
                {product.original_price && (
                  <span className="text-xl text-slate-400 line-through">${product.original_price}</span>
                )}
              </div>

              {/* Savings */}
              {discount > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl mb-6">
                  <Tag size={18} />
                  <span className="font-bold">
                    Ahorras ${(product.original_price - product.price).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Package size={20} />
                  Descripción
                </h3>
                <p className="text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Store Info */}
              {store && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    Vendido por
                  </h3>
                  <div className="flex items-center gap-3">
                    <img 
                      src={store.image_url} 
                      alt={store.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold">{store.name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Star size={14} className="text-yellow-500" fill="#EAB308" />
                        <span>{store.rating}</span>
                        {store.distance && (
                          <>
                            <span>•</span>
                            <span>{store.distance} km</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Categoría</p>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Estado</p>
                  <p className="font-medium">{product.in_stock ? 'En Stock' : 'Agotado'}</p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  onAddToCart(product.id);
                  onClose();
                }}
                disabled={!product.in_stock}
                className="w-full h-14 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform active:scale-95"
                data-testid="add-to-cart-detail"
              >
                <ShoppingCart size={22} />
                <span className="text-lg">Agregar al Carrito</span>
              </button>

              {/* Extra Info */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-sm text-slate-600">
                <p>✓ Pago seguro en plataforma, QR o efectivo</p>
                <p>✓ Retiro en el comercio o delivery disponible</p>
                <p>✓ Consulta disponibilidad antes de tu visita</p>
              </div>

              {/* Reviews Section */}
              <ProductReviews productId={product.id} />

              {/* Related Products */}
              <RelatedProducts 
                productId={product.id} 
                onProductClick={(newProduct) => {
                  if (onProductChange) {
                    onProductChange(newProduct);
                    setCurrentImageIndex(0);
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
