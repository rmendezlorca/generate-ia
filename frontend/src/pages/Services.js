import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Receipt, Wallet, Cake, Car, Grid3x3, Package } from 'lucide-react';
import { servicesApi } from '../utils/api';
import { toast } from 'sonner';

const iconMap = {
  Truck: Truck,
  Receipt: Receipt,
  Wallet: Wallet,
  Cake: Cake,
  Car: Car,
  Package: Package
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesApi.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    toast.info(`Servicio "${service.name}" - Próximamente disponible`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="app-container py-6 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-heading mb-2" data-testid="services-title">
          <Grid3x3 className="inline text-accent mr-2" size={36} />
          Servicios de Barrio
        </h1>
        <p className="text-slate-600" data-testid="services-subtitle">
          Descubre todos los servicios disponibles en tu comunidad
        </p>
      </div>

      {/* Services Grid */}
      <div className="pb-20 md:pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Package;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => handleServiceClick(service)}
                className="bg-white rounded-3xl p-6 shadow-card hover:shadow-float transition-all cursor-pointer group border border-slate-100 hover:border-primary/30 flex flex-col items-center text-center"
                data-testid={`service-card-${index}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="text-primary" size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-600">{service.description}</p>
                {!service.available && (
                  <div className="mt-3 px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                    Próximamente
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 border border-primary/20"
          data-testid="services-info"
        >
          <h2 className="text-2xl font-bold mb-4">Más servicios próximamente</h2>
          <p className="text-slate-700 mb-6">
            Estamos trabajando para agregar más servicios a tu comunidad. ¿Tienes alguna sugerencia? ¡Déjanos saber!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-2 text-primary">Pago de Cuentas</h3>
              <p className="text-sm text-slate-600">
                Paga servicios básicos, teléfono e internet en tu almacén de confianza
              </p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-2 text-accent">Delivery Local</h3>
              <p className="text-sm text-slate-600">
                Recibe tus compras directamente en tu hogar desde comercios cercanos
              </p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-2 text-secondary">Caja Vecina</h3>
              <p className="text-sm text-slate-600">
                Retira dinero en efectivo sin ir al banco
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;