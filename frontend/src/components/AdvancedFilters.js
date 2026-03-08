import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';

const AdvancedFilters = ({ filters, setFilters, onClose, categories, stores }) => {
  const sortOptions = [
    { value: '', label: 'Por defecto' },
    { value: 'price_asc', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'newest', label: 'Más Recientes' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg"
      data-testid="advanced-filters"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-primary" size={24} />
          <h3 className="text-xl font-bold">Filtros Avanzados</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          data-testid="close-filters"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-3">Rango de Precio</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Mín"
              value={filters.min_price || ''}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              data-testid="min-price"
            />
            <input
              type="number"
              placeholder="Máx"
              value={filters.max_price || ''}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              data-testid="max-price"
            />
          </div>
        </div>

        {/* Store */}
        <div>
          <label className="block text-sm font-medium mb-3">Comercio</label>
          <select
            value={filters.store_id || ''}
            onChange={(e) => setFilters({ ...filters, store_id: e.target.value })}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            data-testid="store-filter"
          >
            <option value="">Todos los comercios</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-3">Categoría</label>
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            data-testid="category-filter"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-3">Ordenar por</label>
          <select
            value={filters.sort_by || ''}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            data-testid="sort-filter"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <label className="block text-sm font-medium mb-3">Disponibilidad</label>
          <label className="flex items-center gap-3 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={filters.in_stock_only || false}
              onChange={(e) => setFilters({ ...filters, in_stock_only: e.target.checked })}
              className="w-4 h-4"
              data-testid="stock-filter"
            />
            <span className="text-sm">Solo productos en stock</span>
          </label>
        </div>

        {/* Promoted Only */}
        <div>
          <label className="block text-sm font-medium mb-3">Promociones</label>
          <label className="flex items-center gap-3 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={filters.promoted_only || false}
              onChange={(e) => setFilters({ ...filters, promoted_only: e.target.checked })}
              className="w-4 h-4"
              data-testid="promo-filter"
            />
            <span className="text-sm">Solo productos en oferta</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
        <button
          onClick={() => {
            setFilters({
              search: filters.search || '',
              min_price: '',
              max_price: '',
              store_id: '',
              category: '',
              sort_by: '',
              in_stock_only: false,
              promoted_only: false
            });
          }}
          className="flex-1 h-10 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
          data-testid="clear-filters"
        >
          Limpiar Filtros
        </button>
        <button
          onClick={onClose}
          className="flex-1 h-10 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all"
          data-testid="apply-filters"
        >
          Aplicar Filtros
        </button>
      </div>
    </motion.div>
  );
};

export default AdvancedFilters;