import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, QrCode, X } from 'lucide-react';

const PaymentMethodSelector = ({ isOpen, onClose, onSelectMethod, total }) => {
  const [selectedMethod, setSelectedMethod] = useState('platform');

  const paymentMethods = [
    {
      id: 'platform',
      name: 'Pago en Plataforma',
      description: 'Paga directamente con tu tarjeta',
      icon: CreditCard,
      color: 'from-blue-400 to-cyan-500',
      available: true
    },
    {
      id: 'qr',
      name: 'Código QR',
      description: 'Escanea para pagar con tu app bancaria',
      icon: QrCode,
      color: 'from-purple-400 to-pink-500',
      available: true
    },
    {
      id: 'cash',
      name: 'Efectivo',
      description: 'Paga en el comercio al retirar',
      icon: Banknote,
      color: 'from-green-400 to-emerald-500',
      available: true
    }
  ];

  const handleConfirm = () => {
    onSelectMethod(selectedMethod);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
        data-testid="payment-modal"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Método de Pago</h2>
            <p className="text-slate-600">Total a pagar: <span className="font-bold text-primary text-xl">${total.toFixed(2)}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            data-testid="close-payment-modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              disabled={!method.available}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              data-testid={`payment-method-${method.id}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}>
                  <method.icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-0.5">{method.name}</h3>
                  <p className="text-sm text-slate-600">{method.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary'
                    : 'border-slate-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* QR Code Display (if QR selected) */}
        {selectedMethod === 'qr' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
          >
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                {/* Placeholder QR Code */}
                <div className="grid grid-cols-8 gap-1 p-4">
                  {[...Array(64)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Escanea este código con tu app bancaria</p>
              <p className="text-xs text-slate-500 mt-1">Este es un QR de demostración</p>
            </div>
          </motion.div>
        )}

        {/* Cash Instructions */}
        {selectedMethod === 'cash' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <p className="text-sm text-green-900 font-medium">💵 Instrucciones:</p>
            <ul className="text-sm text-green-800 mt-2 space-y-1 ml-4 list-disc">
              <li>Presenta tu orden al retirar en el comercio</li>
              <li>Paga el monto exacto en efectivo</li>
              <li>Solicita tu comprobante de compra</li>
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
            data-testid="cancel-payment"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-12 bg-gradient-primary text-white rounded-xl font-bold shadow-glow-primary hover:opacity-90 transition-all"
            data-testid="confirm-payment"
          >
            Confirmar Pago
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentMethodSelector;
