import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, TrendingDown, CreditCard, ArrowRight } from 'lucide-react';
import { cartApi, paymentsApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadCart();
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      const response = await cartApi.get();
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartApi.remove(productId);
      toast.success('Producto eliminado del carrito');
      loadCart();
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clear();
      toast.success('Carrito vaciado');
      loadCart();
    } catch (error) {
      toast.error('Error al vaciar el carrito');
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentsApi.mock({
        amount: cart.total,
        payment_method: 'mock',
        user_id: cart.user_id
      });

      if (response.data.success) {
        toast.success('Pago procesado exitosamente (MOCK)');
        await cartApi.clear();
        loadCart();
      }
    } catch (error) {
      toast.error('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="app-container py-12 px-4">
        <div className="max-w-md mx-auto text-center" data-testid="empty-cart">
          <ShoppingCart className="mx-auto text-slate-300 mb-4" size={80} />
          <h2 className="text-3xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-600 mb-6">Añade productos para comenzar a ahorrar</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            data-testid="explore-products-btn"
          >
            Explorar Productos
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container py-6 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="cart-title">
          <ShoppingCart className="inline text-primary mr-2" size={36} />
          Mi Carrito
        </h1>
        <p className="text-slate-600" data-testid="cart-subtitle">{cart.items.length} productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Productos</h2>
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              data-testid="clear-cart-btn"
            >
              <Trash2 size={16} />
              Vaciar carrito
            </button>
          </div>
          
          {cart.items.map((item, index) => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-xl p-4 shadow-card flex gap-4"
              data-testid={`cart-item-${index}`}
            >
              <img
                src={item.image_url}
                alt={item.product_name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{item.product_name}</h3>
                <p className="text-sm text-slate-600 mb-2">{item.store_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">${item.price}</span>
                  {item.original_price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">${item.original_price}</span>
                      <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium">
                        -{Math.round(((item.original_price - item.price) / item.original_price) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-2">Cantidad: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.product_id)}
                className="self-start p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all"
                data-testid={`remove-item-${index}`}
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-card sticky top-6" data-testid="cart-summary">
            <h2 className="text-xl font-bold mb-6">Resumen de Compra</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">${cart.total.toFixed(2)}</span>
              </div>
              
              {cart.total_savings > 0 && (
                <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-secondary" size={18} />
                    <span className="font-medium text-secondary">Ahorro</span>
                  </div>
                  <span className="font-bold text-secondary">${cart.total_savings.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total a Pagar</span>
                  <span className="text-2xl font-bold text-primary">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full py-4 bg-gradient-primary text-white rounded-xl font-bold shadow-glow-primary hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="checkout-btn"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Proceder al Pago
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-900 text-sm mb-2">Pago MOCK Activo</h3>
              <p className="text-xs text-blue-800 mb-2">
                El sistema de pagos está en modo de prueba. Para integrar Mercado Pago:
              </p>
              <details className="text-xs text-blue-700">
                <summary className="cursor-pointer font-medium mb-2">Ver instrucciones</summary>
                <div className="mt-2 space-y-1 bg-white p-2 rounded">
                  <p>1. Instalar: <code className="bg-slate-100 px-1 rounded">pip install mercadopago</code></p>
                  <p>2. Obtener API keys desde: <a href="https://www.mercadopago.com/developers" target="_blank" rel="noopener noreferrer" className="underline">Mercado Pago Developers</a></p>
                  <p>3. Agregar a <code className="bg-slate-100 px-1 rounded">/app/backend/.env</code>:</p>
                  <code className="block bg-slate-900 text-green-400 p-1 rounded mt-1 text-[10px]">MERCADOPAGO_ACCESS_TOKEN=tu_token</code>
                  <p className="mt-2">4. Reemplazar el endpoint mock en <code className="bg-slate-100 px-1 rounded">/app/backend/server.py</code> con la implementación real siguiendo los comentarios del código</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;