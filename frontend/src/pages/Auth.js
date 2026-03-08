import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('¡Bienvenido de vuelta!');
          // Redirigir según el rol del usuario
          if (result.user?.role === 'store') {
            navigate('/backoffice');
          } else {
            navigate('/');
          }
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await register(
          formData.email,
          formData.password,
          formData.name,
          formData.phone
        );
        if (result.success) {
          toast.success('¡Cuenta creada exitosamente!');
          navigate('/');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const result = await login('demo@locafy.com', 'demo123');
    if (result.success) {
      toast.success('¡Sesión demo iniciada!');
      if (result.user?.role === 'store') {
        navigate('/backoffice');
      } else {
        navigate('/');
      }
    } else {
      toast.info('Crea una cuenta primero con email: demo@locafy.com, password: demo123');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8" data-testid="auth-logo">
          <h1 className="text-4xl font-bold font-heading text-primary mb-2">
            Locafy
          </h1>
          <p className="text-slate-600">Ahorra en cada esquina</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-float p-8" data-testid="auth-card">
          {/* Toggle */}
          <div className="flex gap-2 mb-8 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                isLogin ? 'bg-white shadow-sm text-primary' : 'text-slate-600'
              }`}
              data-testid="login-tab"
            >
              Ingresar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                !isLogin ? 'bg-white shadow-sm text-primary' : 'text-slate-600'
              }`}
              data-testid="register-tab"
            >
              Registrarse
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono (opcional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+56912345678"
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="phone-input"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-testid="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-primary text-white rounded-xl font-bold shadow-glow-primary hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="submit-btn"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Ingresar' : 'Crear Cuenta'}
                </>
              )}
            </button>
          </form>

          {/* Demo Button */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">o</span>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full mt-4 h-12 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="demo-login-btn"
            >
              Probar con cuenta demo
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              🔔 <strong>Notificaciones:</strong> Usando OneSignal por defecto.
            </p>
            <details className="text-xs text-blue-700 mt-2">
              <summary className="cursor-pointer font-medium">Configurar Firebase Cloud Messaging</summary>
              <div className="mt-2 space-y-1 bg-white p-2 rounded">
                <p>1. Crear proyecto en <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></p>
                <p>2. Agregar app web y obtener configuración</p>
                <p>3. Agregar credenciales a <code className="bg-slate-100 px-1 rounded">/app/frontend/.env</code></p>
                <p>4. Actualizar código en componentes de notificaciones</p>
              </div>
            </details>
          </div>

          {/* Store Access */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-bold text-purple-900 mb-2">¿Eres un comercio?</p>
            <p className="text-xs text-purple-700 mb-3">
              Accede al backoffice para gestionar tus productos y ventas
            </p>
            <div className="bg-white p-3 rounded-lg text-xs space-y-1 mb-3">
              <p><strong>Email:</strong> comercio@barrio.com</p>
              <p><strong>Password:</strong> comercio123</p>
            </div>
            <button
              onClick={() => navigate('/backoffice')}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:opacity-90 transition-all"
              data-testid="goto-backoffice"
            >
              Ir al Backoffice
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;