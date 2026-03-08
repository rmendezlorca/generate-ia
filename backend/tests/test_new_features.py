"""
Locafy Marketplace - New Features API Tests
Tests for: Favorites, Store Reviews, Orders, Route Search, Backoffice Orders
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============= FIXTURES =============

@pytest.fixture(scope="module")
def merchant_token():
    """Get merchant authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "comercio@barrio.com",
        "password": "comercio123"
    })
    assert response.status_code == 200, f"Merchant login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def test_user_token():
    """Create a test user and get token"""
    test_email = f"test_user_{uuid.uuid4().hex[:8]}@test.com"
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": test_email,
        "password": "testpass123",
        "name": "TEST User for New Features",
        "phone": "+56912345678"
    })
    assert response.status_code == 200, f"User registration failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def product_id():
    """Get a product ID for testing"""
    response = requests.get(f"{BASE_URL}/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0, "No products found"
    return products[0]["id"]

@pytest.fixture(scope="module")
def store_id():
    """Get a store ID for testing"""
    response = requests.get(f"{BASE_URL}/api/stores")
    assert response.status_code == 200
    stores = response.json()
    assert len(stores) > 0, "No stores found"
    return stores[0]["id"]


# ============= FAVORITES API TESTS =============

class TestFavoritesAPI:
    """Tests for favorites endpoints: GET/POST/DELETE /api/favorites"""
    
    def test_get_favorites_requires_auth(self):
        """Test that getting favorites requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code in [401, 403], "Should require auth"
    
    def test_add_favorite(self, test_user_token, product_id):
        """Test adding a product to favorites - POST /api/favorites/{product_id}"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.post(
            f"{BASE_URL}/api/favorites/{product_id}",
            headers=headers
        )
        # 200 success or 400 if already favorited
        assert response.status_code in [200, 400], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert "favorite_id" in data or "message" in data
    
    def test_get_favorites(self, test_user_token):
        """Test getting all favorites - GET /api/favorites"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.get(f"{BASE_URL}/api/favorites", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_check_favorite(self, test_user_token, product_id):
        """Test checking if product is favorite - GET /api/favorites/check/{product_id}"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.get(
            f"{BASE_URL}/api/favorites/check/{product_id}",
            headers=headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "is_favorite" in data
        assert isinstance(data["is_favorite"], bool)
    
    def test_remove_favorite(self, test_user_token, product_id):
        """Test removing product from favorites - DELETE /api/favorites/{product_id}"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # First make sure it's in favorites
        requests.post(f"{BASE_URL}/api/favorites/{product_id}", headers=headers)
        
        # Now remove it
        response = requests.delete(
            f"{BASE_URL}/api/favorites/{product_id}",
            headers=headers
        )
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
    
    def test_add_favorite_invalid_product(self, test_user_token):
        """Test adding non-existent product to favorites"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.post(
            f"{BASE_URL}/api/favorites/invalid-product-id-12345",
            headers=headers
        )
        assert response.status_code == 404


# ============= STORE REVIEWS API TESTS =============

class TestStoreReviewsAPI:
    """Tests for store reviews endpoints: GET/POST /api/stores/{id}/reviews"""
    
    def test_get_store_reviews(self, store_id):
        """Test getting reviews for a store - GET /api/stores/{store_id}/reviews"""
        response = requests.get(f"{BASE_URL}/api/stores/{store_id}/reviews")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_store_review_requires_auth(self, store_id):
        """Test that creating store review requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/stores/{store_id}/reviews",
            json={"rating": 5, "comment": "Great store!"}
        )
        assert response.status_code in [401, 403]
    
    def test_create_store_review(self, test_user_token, store_id):
        """Test creating a store review - POST /api/stores/{store_id}/reviews"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.post(
            f"{BASE_URL}/api/stores/{store_id}/reviews",
            json={
                "rating": 4,
                "comment": "TEST Store Review - Great service!"
            },
            headers=headers
        )
        # 200 success or 400 if user already reviewed
        assert response.status_code in [200, 400], f"Unexpected: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "review_id" in data
    
    def test_store_review_validates_rating(self, test_user_token, store_id):
        """Test that store review validates rating (1-5)"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Test invalid rating (too high)
        response = requests.post(
            f"{BASE_URL}/api/stores/{store_id}/reviews",
            json={"rating": 10, "comment": "Invalid rating"},
            headers=headers
        )
        assert response.status_code in [400, 422]


# ============= ORDERS API TESTS =============

class TestOrdersAPI:
    """Tests for orders endpoints: POST/GET /api/orders"""
    
    def test_create_order_requires_auth(self):
        """Test that creating order requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json={"delivery_type": "pickup"}
        )
        assert response.status_code in [401, 403]
    
    def test_create_order_empty_cart(self, test_user_token):
        """Test creating order with empty cart fails"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Clear cart first
        requests.delete(f"{BASE_URL}/api/cart/clear", headers=headers)
        
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_type": "pickup",
                "payment_method": "cash"
            },
            headers=headers
        )
        assert response.status_code == 400
        assert "vacío" in response.json().get("detail", "").lower() or "empty" in response.json().get("detail", "").lower()
    
    def test_create_order_with_pickup(self, test_user_token, product_id):
        """Test creating order with pickup option - POST /api/orders"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Add product to cart first
        cart_response = requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers=headers
        )
        assert cart_response.status_code == 200
        
        # Create order with pickup
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_type": "pickup",
                "payment_method": "cash"
            },
            headers=headers
        )
        assert response.status_code == 200, f"Order creation failed: {response.text}"
        
        data = response.json()
        assert "order_ids" in data
        assert len(data["order_ids"]) > 0
    
    def test_create_order_with_delivery(self, test_user_token, product_id):
        """Test creating order with delivery option"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Add product to cart first
        requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 2},
            headers=headers
        )
        
        # Create order with delivery
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "delivery_type": "delivery",
                "delivery_address": "Av. Test 123, Depto 4B",
                "delivery_notes": "Tocar el timbre 2 veces",
                "payment_method": "qr"
            },
            headers=headers
        )
        assert response.status_code == 200, f"Order failed: {response.text}"
    
    def test_get_user_orders(self, test_user_token):
        """Test getting user's orders - GET /api/orders"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


# ============= BACKOFFICE ORDERS API TESTS =============

class TestBackofficeOrdersAPI:
    """Tests for backoffice orders endpoints: GET/PUT /api/backoffice/orders"""
    
    def test_get_backoffice_orders_requires_store_role(self, test_user_token):
        """Test that getting store orders requires store role"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        response = requests.get(f"{BASE_URL}/api/backoffice/orders", headers=headers)
        assert response.status_code == 403
    
    def test_get_backoffice_orders(self, merchant_token):
        """Test getting store orders - GET /api/backoffice/orders"""
        headers = {"Authorization": f"Bearer {merchant_token}"}
        response = requests.get(f"{BASE_URL}/api/backoffice/orders", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If orders exist, verify structure
        if len(data) > 0:
            order = data[0]
            assert "id" in order
            assert "status" in order
            assert "items" in order
            assert "total" in order
    
    def test_update_order_status(self, merchant_token):
        """Test updating order status - PUT /api/backoffice/orders/{id}/status"""
        headers = {"Authorization": f"Bearer {merchant_token}"}
        
        # Get orders first
        orders_response = requests.get(f"{BASE_URL}/api/backoffice/orders", headers=headers)
        orders = orders_response.json()
        
        if len(orders) > 0:
            order_id = orders[0]["id"]
            current_status = orders[0]["status"]
            
            # Only test if order is in pending status
            if current_status == "pending":
                response = requests.put(
                    f"{BASE_URL}/api/backoffice/orders/{order_id}/status?status=preparing",
                    headers=headers
                )
                assert response.status_code == 200
        else:
            pytest.skip("No orders available to test status update")


# ============= ROUTE SEARCH API TESTS =============

class TestRouteSearchAPI:
    """Tests for route search endpoint: POST /api/route-search"""
    
    def test_route_search_basic(self):
        """Test basic route search - POST /api/route-search"""
        response = requests.post(
            f"{BASE_URL}/api/route-search",
            json={
                "origin_lat": -33.4489,
                "origin_lng": -70.6693,
                "destination_lat": -33.4378,
                "destination_lng": -70.6504,
                "product_search": "Producto",
                "max_detour_km": 2.0
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "search_query" in data
        assert "stores_on_route" in data
        assert "products_found" in data
        assert "results" in data
    
    def test_route_search_with_results(self):
        """Test route search returns correct structure"""
        response = requests.post(
            f"{BASE_URL}/api/route-search",
            json={
                "origin_lat": -33.4489,
                "origin_lng": -70.6693,
                "destination_lat": -33.4262,
                "destination_lng": -70.6106,
                "product_search": "Producto 1",
                "max_detour_km": 5.0
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify results structure if any
        if len(data["results"]) > 0:
            result = data["results"][0]
            assert "product" in result
            assert "store" in result
            assert "distance_from_route_km" in result
    
    def test_route_search_no_results(self):
        """Test route search with non-existent product"""
        response = requests.post(
            f"{BASE_URL}/api/route-search",
            json={
                "origin_lat": -33.4489,
                "origin_lng": -70.6693,
                "destination_lat": -33.4378,
                "destination_lng": -70.6504,
                "product_search": "nonexistent_product_xyz123",
                "max_detour_km": 0.1
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["products_found"] == 0


# ============= CART WITH DELIVERY OPTIONS TESTS =============

class TestCartDeliveryOptions:
    """Tests for cart and delivery type options"""
    
    def test_cart_structure(self, test_user_token, product_id):
        """Test cart returns correct structure"""
        headers = {"Authorization": f"Bearer {test_user_token}"}
        
        # Add item to cart
        requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers=headers
        )
        
        response = requests.get(f"{BASE_URL}/api/cart", headers=headers)
        assert response.status_code == 200
        
        cart = response.json()
        assert "items" in cart
        assert "total" in cart
        assert "total_savings" in cart


# ============= NOTIFICATIONS TESTS =============

class TestNotifications:
    """Tests for notifications (order notifications to merchant)"""
    
    def test_get_notifications_requires_auth(self):
        """Test getting notifications requires auth"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code in [401, 403]
    
    def test_get_merchant_notifications(self, merchant_token):
        """Test merchant can get notifications"""
        headers = {"Authorization": f"Bearer {merchant_token}"}
        response = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
