import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Toaster } from './components/ui/sonner';
import { cartApi, seedApi } from './utils/api';
import { useAuth } from './contexts/AuthContext';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import MapPage from './pages/MapPage';
import RoutePlanner from './pages/RoutePlanner';
import RouteSearch from './pages/RouteSearch';
import Cart from './pages/Cart';
import Services from './pages/Services';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Favorites from './pages/Favorites';

// Backoffice
import BackofficeLayout from './components/BackofficeLayout';
import Dashboard from './pages/backoffice/Dashboard';
import Products from './pages/backoffice/Products';
import Promotions from './pages/backoffice/Promotions';
import Sales from './pages/backoffice/Sales';
import Orders from './pages/backoffice/Orders';

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const hideNavigation = location.pathname === '/auth' || location.pathname.startsWith('/backoffice');

  useEffect(() => {
    // Seed database on first load
    const seedDatabase = async () => {
      try {
        await seedApi.seed();
      } catch (error) {
        // Database might already be seeded
        console.log('Database seeding skipped or already done');
      }
    };
    seedDatabase();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount();
    }
  }, [isAuthenticated, location]);

  const loadCartCount = async () => {
    try {
      const response = await cartApi.get();
      setCartCount(response.data.items.length);
    } catch (error) {
      // User might not have a cart yet
      setCartCount(0);
    }
  };

  return (
    <div className="App">
      {!hideNavigation && <Navigation cartCount={cartCount} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/route-search" element={<RouteSearch />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/services" element={<Services />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/favorites" element={<Favorites />} />
        
        {/* Backoffice Routes */}
        <Route path="/backoffice" element={<BackofficeLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="sales" element={<Sales />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;