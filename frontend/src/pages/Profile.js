import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, LogOut, Settings, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="app-container py-6 px-4">
      <div className="max-w-3xl mx-auto pb-20 md:pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 mb-6 text-white relative overflow-hidden"
          data-testid="profile-header"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="profile-name">{user.name}</h1>
              <p className="text-white/90 flex items-center gap-2">
                <Mail size={16} />
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="stat-savings">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <TrendingDown className="text-secondary" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Ahorro Total</p>
                <p className="text-2xl font-bold text-secondary">$0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="stat-purchases">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Compras</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card" data-testid="stat-points">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Award className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-600">Puntos</p>
                <p className="text-2xl font-bold text-accent">0</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-card mb-6"
          data-testid="profile-info"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={24} />
            Información Personal
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone className="text-slate-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Teléfono</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            {user.lat && user.lng && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="text-slate-400" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Ubicación</p>
                  <p className="font-medium text-sm">
                    {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <button
            onClick={handleLogout}
            className="w-full h-12 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            data-testid="logout-btn"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// Import missing icon
import { TrendingDown, ShoppingBag } from 'lucide-react';

export default Profile;