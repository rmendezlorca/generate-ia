import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { backofficeApi } from '../../utils/api';
import { toast } from 'sonner';
import ImageUploader from '../../components/ImageUploader';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Lácteos',
    price: '',
    original_price: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    gallery_images: ['', ''],
    in_stock: true,
    is_promoted: false
  });

  const categories = ['Lácteos', 'Panadería', 'Frutas', 'Verduras', 'Bebidas', 'Carnes'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await backofficeApi.getProducts();
      setProducts(response.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        gallery_images: formData.gallery_images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await backofficeApi.updateProduct(editingProduct.id, data);
        toast.success('Producto actualizado');
      } else {
        await backofficeApi.createProduct(data);
        toast.success('Producto creado');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Error al guardar producto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      image_url: product.image_url,
      gallery_images: [...(product.gallery_images || []), '', ''].slice(0, 2),
      in_stock: product.in_stock,
      is_promoted: product.is_promoted
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await backofficeApi.deleteProduct(id);
        toast.success('Producto eliminado');
        loadProducts();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Lácteos',
      price: '',
      original_price: '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      gallery_images: ['', ''],
      in_stock: true,
      is_promoted: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Productos</h1>
          <p className="text-slate-600">{products.length} productos en total</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="h-12 px-6 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
          data-testid="add-product-btn"
        >
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-card hover:shadow-lg transition-all"
            data-testid={`product-${index}`}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_promoted && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                  PROMO
                </div>
              )}
              {!product.in_stock && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  AGOTADO
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-1">{product.category}</p>
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-primary">${product.price}</span>
                  {product.original_price && (
                    <span className="text-xs text-slate-400 line-through ml-2">${product.original_price}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
                  data-testid={`edit-${index}`}
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-1"
                  data-testid={`delete-${index}`}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="product-modal"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  data-testid="product-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  data-testid="product-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Precio</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    data-testid="product-price-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio Original (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Main Image Upload */}
              <ImageUploader
                label="Imagen Principal"
                currentImage={formData.image_url}
                onImageUploaded={(url) => setFormData({...formData, image_url: url})}
              />

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Galería de Imágenes (opcional - máx 2 adicionales)</label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.gallery_images.map((img, idx) => (
                    <ImageUploader
                      key={idx}
                      label={`Imagen ${idx + 2}`}
                      currentImage={img}
                      onImageUploaded={(url) => {
                        const newGallery = [...formData.gallery_images];
                        newGallery[idx] = url;
                        setFormData({...formData, gallery_images: newGallery});
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">En stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_promoted}
                    onChange={(e) => setFormData({...formData, is_promoted: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Promocionado</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                  data-testid="submit-product"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;