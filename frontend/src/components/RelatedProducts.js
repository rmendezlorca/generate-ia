import React, { useState, useEffect } from 'react';
import { productsApi } from '../utils/api';

const RelatedProducts = ({ productId, onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedProducts();
  }, [productId]);

  const loadRelatedProducts = async () => {
    try {
      const response = await productsApi.getRelated(productId, 4);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 pt-6 mt-6">
      <h3 className="text-lg font-bold mb-4">Productos Relacionados</h3>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-slate-100 rounded-xl p-2 cursor-pointer hover:border-orange-200 transition-all"
            onClick={() => onProductClick(product)}
            data-testid={`related-product-${product.id}`}
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
    </div>
  );
};

export default RelatedProducts;
