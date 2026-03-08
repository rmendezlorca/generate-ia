import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { backofficeApi } from '../../utils/api';
import { toast } from 'sonner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await backofficeApi.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await backofficeApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Estado actualizado a: ${statusLabels[newStatus]}`);
      loadOrders();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const statusLabels = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    pending: Clock,
    preparing: Package,
    ready: CheckCircle,
    delivered: Truck,
    cancelled: XCircle
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading" data-testid="orders-title">Pedidos</h1>
          <p className="text-slate-600">Gestiona los pedidos de tus clientes</p>
        </div>
        <button
          onClick={loadOrders}
          className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
          data-testid="refresh-orders"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'Todos' : statusLabels[status]}
            {status !== 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {orders.filter(o => o.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">Sin pedidos</h3>
          <p className="text-slate-600">No hay pedidos {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white rounded-2xl p-6 border border-slate-100"
                data-testid={`order-${index}`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">Pedido #{order.id.slice(-6)}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusColors[order.status]}`}>
                        <StatusIcon size={14} />
                        {statusLabels[order.status]}
                      </span>
                      {order.delivery_type === 'delivery' && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <Truck size={14} />
                          Delivery
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {new Date(order.created_at).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</span>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                  <p className="font-medium">{order.user_name}</p>
                  {order.user_phone && (
                    <p className="text-sm text-slate-600">Tel: {order.user_phone}</p>
                  )}
                  {order.delivery_type === 'delivery' && order.delivery_address && (
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Dirección:</strong> {order.delivery_address}
                    </p>
                  )}
                  {order.delivery_notes && (
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Notas:</strong> {order.delivery_notes}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Productos:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'preparing')}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
                        >
                          Comenzar a Preparar
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="py-2 px-4 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-all"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
                      >
                        Marcar como Listo
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="flex-1 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-all"
                      >
                        Marcar como Entregado
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
