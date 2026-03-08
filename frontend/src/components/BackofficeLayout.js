import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Zap, DollarSign, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BackofficeLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const navItems = [
    { path: '/backoffice', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/backoffice/products', icon: Package, label: 'Productos' },
    { path: '/backoffice/promotions', icon: Zap, label: 'Promociones' },
    { path: '/backoffice/sales', icon: DollarSign, label: 'Cuenta Corriente' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold font-heading gradient-primary bg-clip-text text-transparent" data-testid="backoffice-logo">
            Barrio
          </h1>
          <p className="text-sm text-slate-600 mt-1">Backoffice</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-slate-200">
          <div className="mb-3 p-3 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="w-full mb-2 py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            data-testid="goto-app"
          >
            <Home size={18} />
            Ir a la App
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            data-testid="logout-btn"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default BackofficeLayout;