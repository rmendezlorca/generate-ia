import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, User, Calendar, CheckCircle, Clock, Download } from 'lucide-react';
import { backofficeApi } from '../../utils/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSales();
  }, [filter]);

  const loadSales = async () => {
    try {
      const status = filter === 'pending' ? 'pending' : null;
      const response = await backofficeApi.getSales(status);
      setSales(response.data);
    } catch (error) {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMockSale = async () => {
    try {
      await backofficeApi.createMockSale();
      toast.success('Venta de prueba creada');
      loadSales();
    } catch (error) {
      toast.error('Error al crear venta de prueba');
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingSales = sales.filter(s => s.payment_status === 'pending');
  const paidSales = sales.filter(s => s.payment_status === 'paid');

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
          <h1 className="text-4xl font-bold font-heading mb-2">Cuenta Corriente</h1>
          <p className="text-slate-600">Historial de ventas y pagos</p>
        </div>
        <button
          onClick={handleCreateMockSale}
          className="h-12 px-6 bg-secondary text-white rounded-full font-bold hover:bg-secondary/90 transition-all"
          data-testid="create-mock-sale"
        >
          Crear Venta Demo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white">
          <DollarSign className="mb-3" size={32} />
          <h3 className="text-lg font-medium mb-1">Total Ventas</h3>
          <p className="text-3xl font-bold">${totalSales.toFixed(0)}</p>
          <p className="text-sm mt-2 opacity-90">{sales.length} transacciones</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-6 text-white">
          <CheckCircle className="mb-3" size={32} />
          <h3 className="text-lg font-medium mb-1">Pagado</h3>
          <p className="text-3xl font-bold">${paidSales.reduce((s, sale) => s + sale.total, 0).toFixed(0)}</p>
          <p className="text-sm mt-2 opacity-90">{paidSales.length} ventas</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white">
          <Clock className="mb-3" size={32} />
          <h3 className="text-lg font-medium mb-1">Pendiente</h3>
          <p className="text-3xl font-bold">${pendingSales.reduce((s, sale) => s + sale.total, 0).toFixed(0)}</p>
          <p className="text-sm mt-2 opacity-90">{pendingSales.length} ventas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
        <span className="font-medium">Filtrar:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            data-testid="filter-all"
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            data-testid="filter-pending"
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Cantidad</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.03 * index }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  data-testid={`sale-${index}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{formatDistanceToNow(new Date(sale.created_at), { addSuffix: true, locale: es })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-slate-400" />
                      <span className="font-medium">{sale.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-slate-400" />
                      <span>{sale.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{sale.quantity}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary text-lg">${sale.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sale.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {sale.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <div className="text-center py-12" data-testid="no-sales">
            <Package className="mx-auto text-slate-300 mb-4" size={64} />
            <p className="text-slate-500 text-lg">No hay ventas registradas</p>
            <p className="text-slate-400 text-sm mt-2">Crea una venta demo para probar</p>
          </div>
        )}
      </div>

      {/* Export Button */}
      {sales.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => toast.info('Funcionalidad de exportar próximamente')}
            className="h-12 px-6 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Exportar a Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default Sales;