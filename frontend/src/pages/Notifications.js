import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, ShoppingBag, Info, Check } from 'lucide-react';
import { notificationsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const iconMap = {
  promotion: Zap,
  order: ShoppingBag,
  general: Info
};

const colorMap = {
  promotion: 'text-primary bg-primary/10',
  order: 'text-secondary bg-secondary/10',
  general: 'text-accent bg-accent/10'
};

const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationsApi.markRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-container py-6 px-4">
      <div className="max-w-3xl mx-auto pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold font-heading mb-2" data-testid="notifications-title">
            <Bell className="inline text-primary mr-2" size={36} />
            Notificaciones
          </h1>
          <p className="text-slate-600" data-testid="notifications-subtitle">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-card text-center" data-testid="no-notifications">
            <Bell className="mx-auto text-slate-300 mb-4" size={64} />
            <h3 className="text-xl font-bold mb-2">No tienes notificaciones</h3>
            <p className="text-slate-600">Te avisaremos cuando haya ofertas nuevas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const IconComponent = iconMap[notification.type] || Info;
              const colorClass = colorMap[notification.type] || 'text-slate-600 bg-slate-100';
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`bg-white rounded-xl p-4 shadow-card border transition-all ${
                    notification.read ? 'border-slate-100' : 'border-primary/30'
                  }`}
                  data-testid={`notification-${index}`}
                >
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                            data-testid={`mark-read-${index}`}
                          >
                            <Check size={14} />
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Notification Settings Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-bold text-blue-900 text-sm mb-2">🔔 Configuración de Notificaciones</h3>
          <p className="text-xs text-blue-800 mb-2">
            Actualmente usando: <strong>OneSignal</strong> (por defecto)
          </p>
          <details className="text-xs text-blue-700">
            <summary className="cursor-pointer font-medium mb-2">Cómo configurar Firebase Cloud Messaging</summary>
            <div className="mt-2 space-y-1 bg-white p-3 rounded-lg">
              <p>1. Crear proyecto en <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></p>
              <p>2. Añadir aplicación web y obtener configuración</p>
              <p>3. Habilitar Cloud Messaging en Firebase</p>
              <p>4. Agregar credenciales a <code className="bg-slate-100 px-1 rounded">/app/frontend/.env</code>:</p>
              <code className="block bg-slate-900 text-green-400 p-2 rounded mt-1 text-[10px]">
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_dominio
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
              </code>
              <p className="mt-2">5. Instalar Firebase: <code className="bg-slate-100 px-1 rounded">yarn add firebase</code></p>
              <p>6. Actualizar código para inicializar Firebase y solicitar permisos de notificaciones</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Notifications;