import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const storesApi = {
  getAll: (lat, lng, params = {}) => {
    const query = new URLSearchParams();
    if (lat && lng) {
      query.append('lat', lat);
      query.append('lng', lng);
    }
    if (params.radius_km) query.append('radius_km', params.radius_km);
    if (params.min_rating) query.append('min_rating', params.min_rating);
    if (params.category) query.append('category', params.category);
    if (params.has_promotions) query.append('has_promotions', 'true');
    if (params.service) query.append('service', params.service);
    return axios.get(`${API}/stores?${query.toString()}`);
  },
  getById: (id) => axios.get(`${API}/stores/${id}`)
};

export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.store_id) query.append('store_id', params.store_id);
    if (params.category) query.append('category', params.category);
    if (params.promoted_only) query.append('promoted_only', 'true');
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);
    if (params.in_stock_only) query.append('in_stock_only', 'true');
    if (params.search) query.append('search', params.search);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    return axios.get(`${API}/products?${query.toString()}`);
  },
  getById: (id) => axios.get(`${API}/products/${id}`)
};

export const promotionsApi = {
  getAll: () => axios.get(`${API}/promotions?active_only=true`)
};

export const cartApi = {
  get: () => axios.get(`${API}/cart`, { headers: getAuthHeaders() }),
  add: (productId, quantity = 1) => 
    axios.post(`${API}/cart/add`, { product_id: productId, quantity }, { headers: getAuthHeaders() }),
  remove: (productId) => 
    axios.delete(`${API}/cart/remove/${productId}`, { headers: getAuthHeaders() }),
  clear: () => 
    axios.delete(`${API}/cart/clear`, { headers: getAuthHeaders() })
};

export const routesApi = {
  optimize: (data) => 
    axios.post(`${API}/routes/optimize`, data)
};

export const servicesApi = {
  getAll: () => axios.get(`${API}/services`)
};

export const notificationsApi = {
  getAll: () => axios.get(`${API}/notifications`, { headers: getAuthHeaders() }),
  markRead: (id) => 
    axios.put(`${API}/notifications/${id}/read`, {}, { headers: getAuthHeaders() })
};

export const paymentsApi = {
  mock: (data) => axios.post(`${API}/payments/mock`, data, { headers: getAuthHeaders() })
};

export const seedApi = {
  seed: () => axios.post(`${API}/seed`)
};

export const backofficeApi = {
  getStats: () => axios.get(`${API}/backoffice/stats`, { headers: getAuthHeaders() }),
  
  // Products
  getProducts: () => axios.get(`${API}/backoffice/products`, { headers: getAuthHeaders() }),
  createProduct: (data) => axios.post(`${API}/backoffice/products`, data, { headers: getAuthHeaders() }),
  updateProduct: (id, data) => axios.put(`${API}/backoffice/products/${id}`, data, { headers: getAuthHeaders() }),
  deleteProduct: (id) => axios.delete(`${API}/backoffice/products/${id}`, { headers: getAuthHeaders() }),
  
  // Promotions
  getPromotions: () => axios.get(`${API}/backoffice/promotions`, { headers: getAuthHeaders() }),
  createPromotion: (data) => axios.post(`${API}/backoffice/promotions`, data, { headers: getAuthHeaders() }),
  deletePromotion: (id) => axios.delete(`${API}/backoffice/promotions/${id}`, { headers: getAuthHeaders() }),
  
  // Sales
  getSales: (status) => {
    const params = status ? `?status=${status}` : '';
    return axios.get(`${API}/backoffice/sales${params}`, { headers: getAuthHeaders() });
  },
  createMockSale: () => axios.post(`${API}/backoffice/sales/mock`, {}, { headers: getAuthHeaders() })
};