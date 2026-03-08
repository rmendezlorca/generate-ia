import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Zap, TrendingUp, Clock } from 'lucide-react';
import { backofficeApi } from '../../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'store') {
      toast.error('Acceso denegado');
      navigate('/');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await backofficeApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Ventas Totales',
      value: `$${stats?.total_sales?.toFixed(0) || 0}`,
      icon: DollarSign,
      color: 'from-emerald-400 to-teal-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Órdenes',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Productos',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Promociones Activas',
      value: stats?.active_promotions || 0,
      icon: Zap,
      color: 'from-orange-400 to-red-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Ventas Este Mes',
      value: `$${stats?.this_month_sales?.toFixed(0) || 0}`,
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Por Cobrar',
      value: `$${stats?.pending_amount?.toFixed(0) || 0}`,
      icon: Clock,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="dashboard-title">
          Dashboard
        </h1>
        <p className="text-slate-600">Bienvenido al panel de administración</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-3xl p-6 shadow-card hover:shadow-float transition-all"
            data-testid={`stat-card-${index}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="text-white" size={28} />
              </div>
            </div>
            <h3 className="text-sm text-slate-600 mb-1">{stat.title}</h3>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 border border-primary/20">
        <h2 className="text-2xl font-bold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/backoffice/products')}
            className="bg-white rounded-xl p-4 hover:shadow-lg transition-all text-left"
            data-testid="goto-products"
          >
            <Package className="text-primary mb-2" size={24} />
            <h3 className="font-bold mb-1">Gestionar Productos</h3>
            <p className="text-sm text-slate-600">Agregar, editar o eliminar productos</p>
          </button>

          <button
            onClick={() => navigate('/backoffice/promotions')}
            className="bg-white rounded-xl p-4 hover:shadow-lg transition-all text-left"
            data-testid="goto-promotions"
          >
            <Zap className="text-orange-600 mb-2" size={24} />
            <h3 className="font-bold mb-1">Gestionar Promociones</h3>
            <p className="text-sm text-slate-600">Crear ofertas y descuentos</p>
          </button>

          <button
            onClick={() => navigate('/backoffice/sales')}
            className="bg-white rounded-xl p-4 hover:shadow-lg transition-all text-left"
            data-testid="goto-sales"
          >
            <DollarSign className="text-green-600 mb-2" size={24} />
            <h3 className="font-bold mb-1">Cuenta Corriente</h3>
            <p className="text-sm text-slate-600">Ver ventas e historial</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
