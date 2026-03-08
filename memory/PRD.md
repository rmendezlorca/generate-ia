# Locafy - Local Marketplace App PRD

## Overview
Locafy is a local marketplace application that connects customers with nearby stores, featuring product discovery, promotions, route planning, and a merchant backoffice.

## Tech Stack
- **Frontend:** React 18, TailwindCSS, Framer Motion, Leaflet (maps)
- **Backend:** FastAPI (Python), MongoDB
- **Authentication:** JWT-based with role-based access (customer/store)

## Core Features

### Customer Features
- [x] User authentication (login/register)
- [x] Product discovery with advanced filters (category, price, stock, promotions)
- [x] Interactive map with stores and promotions
- [x] Route planner for optimized shopping trips
- [x] Shopping cart with multiple payment options
- [x] **Product detail modal with image carousel**
- [x] **Product reviews with photo upload**
- [x] **Related products recommendations**
- [x] Notifications system

### Merchant Features (Backoffice)
- [x] Dashboard with sales statistics
- [x] Product management (CRUD with multi-image support)
- [x] Promotion management
- [x] Sales tracking (Cuenta Corriente)
- [x] Image upload for products
- [x] **Automatic redirect to backoffice after login**

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/location

### Products
- GET /api/products
- GET /api/products/{id}
- GET /api/products/{id}/reviews
- POST /api/products/{id}/reviews
- GET /api/products/{id}/related

### Stores
- GET /api/stores
- GET /api/stores/{id}

### Cart
- GET /api/cart
- POST /api/cart/add
- DELETE /api/cart/remove/{id}
- DELETE /api/cart/clear

### Backoffice
- GET /api/backoffice/stats
- GET/POST/PUT/DELETE /api/backoffice/products
- GET/POST/DELETE /api/backoffice/promotions
- GET /api/backoffice/sales
- POST /api/upload/image

## Test Credentials
- **Customer:** demo@locafy.com / demo123
- **Merchant:** comercio@barrio.com / comercio123

## Completed Tasks (March 2026)

### Session 1
1. ✅ Changed app name from "Barrio" to "Locafy"
2. ✅ Fixed UI bug where "ofertas" appeared as orange rectangle (CSS gradient-primary issue)
3. ✅ Fixed Product Detail Modal - now opens correctly when clicking products
4. ✅ Implemented image carousel with navigation arrows and thumbnails
5. ✅ Added product reviews system (backend + frontend)
6. ✅ Added related products section
7. ✅ Fixed merchant login redirection to /backoffice
8. ✅ All tests passing (18/18 backend, 9/9 frontend)

## Known Issues
- Image gallery URLs for additional images may be invalid (test data issue)
- Payment integration is mocked (/api/payments/mock)

## Upcoming/Future Tasks

### P0 (High Priority)
- [ ] Implement image zoom functionality in product modal
- [ ] Real payment integration (Mercado Pago suggested by user)

### P1 (Medium Priority)
- [ ] Firebase/Google Maps integration
- [ ] Push notifications with Firebase Cloud Messaging
- [ ] Order history for customers

### P2 (Low Priority)
- [ ] Admin panel for super-admin oversight
- [ ] Monetization model (freemium/premium subscriptions)
- [ ] Analytics dashboard

## Architecture

```
/app/
├── backend/
│   ├── server.py (FastAPI app, all endpoints)
│   ├── uploads/ (uploaded images)
│   ├── tests/ (pytest test files)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/ (Shadcn components)
        │   ├── Navigation.js
        │   ├── ProductDetailModal.js
        │   ├── ProductReviews.js
        │   ├── RelatedProducts.js
        │   └── ...
        ├── contexts/
        │   └── AuthContext.js
        ├── pages/
        │   ├── backoffice/
        │   └── ...
        └── utils/
            └── api.js
```
