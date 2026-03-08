import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, Route, ShoppingCart, Grid3x3, User, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './ui/badge';

export const Navigation = ({ cartCount = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio', testId: 'nav-home' },
    { path: '/map', icon: Map, label: 'Mapa', testId: 'nav-map' },
    { path: '/route-planner', icon: Route, label: 'Rutas', testId: 'nav-routes' },
    { path: '/services', icon: Grid3x3, label: 'Servicios', testId: 'nav-services' },
    { path: '/cart', icon: ShoppingCart, label: 'Carrito', badge: cartCount, testId: 'nav-cart' }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-slate-100 sticky top-0 z-40 glass-effect" data-testid="desktop-nav">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold font-heading gradient-primary bg-clip-text text-transparent" data-testid="app-logo">
            Barrio
          </h1>
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <Badge className="ml-1 bg-secondary text-white">{item.badge}</Badge>
                )}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all relative"
                data-testid="nav-notifications"
              >
                <Bell size={20} />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white hover:bg-accent/90 transition-all"
                data-testid="nav-profile"
              >
                <User size={18} />
                <span className="font-medium">{user?.name?.split(' ')[0]}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all"
              data-testid="nav-login"
            >
              Ingresar
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 h-16 md:hidden z-40 flex justify-around items-center" data-testid="mobile-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            data-testid={`mobile-${item.testId}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={22} strokeWidth={2.5} />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-secondary text-white text-xs">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};