import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Zap } from 'lucide-react';
import { backofficeApi } from '../../utils/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    valid_until: ''
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const response = await backofficeApi.getPromotions();
      setPromotions(response.data);
    } catch (error) {
      toast.error('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await backofficeApi.createPromotion({
        ...formData,
        discount_percentage: parseFloat(formData.discount_percentage),
        valid_until: new Date(formData.valid_until).toISOString()
      });
      toast.success('Promoción creada');
      setShowModal(false);
      resetForm();
      loadPromotions();
    } catch (error) {
      toast.error('Error al crear promoción');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta promoción?')) {
      try {
        await backofficeApi.deletePromotion(id);
        toast.success('Promoción eliminada');
        loadPromotions();
      } catch (error) {
        toast.error('Error al eliminar promoción');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_percentage: '',
      valid_until: ''
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
          <h1 className="text-4xl font-bold font-heading mb-2">Promociones</h1>
          <p className="text-slate-600">{promotions.length} promociones activas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-12 px-6 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
          data-testid="add-promo-btn"
        >
          <Plus size={20} />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        {promotions.map((promo, index) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className="bg-white rounded-2xl p-6 border border-orange-200 shadow-card hover:shadow-lg transition-all"
            data-testid={`promo-${index}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-lg font-bold">
                    -{promo.discount_percentage}%
                  </div>
                  <Zap className="text-orange-500" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-slate-600 mb-4">{promo.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>Válido hasta {new Date(promo.valid_until).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Creado {formatDistanceToNow(new Date(promo.created_at), { addSuffix: true, locale: es })}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(promo.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                data-testid={`delete-promo-${index}`}
              >
                <Trash2 size={20} />
              </button>
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            data-testid="promo-modal"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nueva Promoción</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="¡Descuento especial!"
                  data-testid="promo-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Hasta 50% de descuento en productos seleccionados"
                  data-testid="promo-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descuento (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    data-testid="promo-discount-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Válido hasta</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    data-testid="promo-date-input"
                  />
                </div>
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
                  data-testid="submit-promo"
                >
                  Crear Promoción
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Promotions;