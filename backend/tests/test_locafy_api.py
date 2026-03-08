"""
Locafy Marketplace API Tests
Tests for: Auth, Products, Reviews, Related Products, Stores, Promotions
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    """Health check tests - run first"""
    
    def test_api_available(self):
        """Test that API is reachable"""
        response = requests.get(f"{BASE_URL}/api/stores")
        assert response.status_code == 200

class TestAuth:
    """Authentication endpoint tests"""
    
    def test_merchant_login_success(self):
        """Test merchant login with provided credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "comercio@barrio.com",
            "password": "comercio123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "comercio@barrio.com"
        assert data["user"]["role"] == "store"  # Merchant user should have store role
        assert data["user"]["store_id"] is not None  # Merchant should have store_id
    
    def test_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
    
    def test_register_new_user(self):
        """Test user registration"""
        import uuid
        test_email = f"test_{uuid.uuid4().hex[:8]}@locafy.com"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "TEST User",
            "phone": "+56912345678"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_email
        assert data["user"]["role"] == "user"  # Default role

class TestStores:
    """Store endpoint tests"""
    
    def test_get_stores(self):
        """Test getting all stores"""
        response = requests.get(f"{BASE_URL}/api/stores")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify store structure
        store = data[0]
        assert "id" in store
        assert "name" in store
        assert "lat" in store
        assert "lng" in store
    
    def test_get_store_by_id(self):
        """Test getting single store by ID"""
        # First get all stores
        stores_response = requests.get(f"{BASE_URL}/api/stores")
        stores = stores_response.json()
        store_id = stores[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/stores/{store_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == store_id

class TestProducts:
    """Product endpoint tests"""
    
    def test_get_all_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_promoted_products(self):
        """Test getting promoted products only"""
        response = requests.get(f"{BASE_URL}/api/products?promoted_only=true")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # All returned products should be promoted
        for product in data:
            assert product.get("is_promoted") == True
    
    def test_get_product_by_id(self):
        """Test getting single product by ID"""
        # First get all products
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == product_id
        assert "name" in data
        assert "price" in data

class TestProductReviews:
    """Product reviews endpoint tests"""
    
    def test_get_reviews_for_product(self):
        """Test getting reviews for a product"""
        # First get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/products/{product_id}/reviews")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_review_requires_auth(self):
        """Test that creating review requires authentication"""
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        response = requests.post(f"{BASE_URL}/api/products/{product_id}/reviews", json={
            "rating": 5,
            "comment": "Great product!"
        })
        # Should fail without auth
        assert response.status_code in [401, 403]
    
    def test_create_review_with_auth(self):
        """Test creating a review with authentication"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "comercio@barrio.com",
            "password": "comercio123"
        })
        token = login_response.json()["access_token"]
        
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/api/products/{product_id}/reviews",
            json={
                "rating": 5,
                "comment": "TEST Review from testing"
            },
            headers=headers
        )
        
        # Should succeed or return 400 if already reviewed
        assert response.status_code in [200, 400]  # 400 if user already reviewed

class TestRelatedProducts:
    """Related products endpoint tests"""
    
    def test_get_related_products(self):
        """Test getting related products"""
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/products/{product_id}/related")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Related products should not include the original product
        for related in data:
            assert related["id"] != product_id

class TestPromotions:
    """Promotions endpoint tests"""
    
    def test_get_promotions(self):
        """Test getting active promotions"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

class TestCart:
    """Cart endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "comercio@barrio.com",
            "password": "comercio123"
        })
        return response.json()["access_token"]
    
    def test_get_cart_requires_auth(self):
        """Test that cart requires authentication"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code in [401, 403]
    
    def test_add_to_cart(self, auth_token):
        """Test adding product to cart"""
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers=headers
        )
        assert response.status_code == 200
        
        # Verify cart was updated
        cart_response = requests.get(f"{BASE_URL}/api/cart", headers=headers)
        assert cart_response.status_code == 200
        cart = cart_response.json()
        assert len(cart["items"]) > 0

class TestBackoffice:
    """Backoffice endpoint tests (merchant access)"""
    
    @pytest.fixture
    def merchant_token(self):
        """Get merchant authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "comercio@barrio.com",
            "password": "comercio123"
        })
        return response.json()["access_token"]
    
    def test_get_backoffice_stats(self, merchant_token):
        """Test getting backoffice stats"""
        headers = {"Authorization": f"Bearer {merchant_token}"}
        response = requests.get(f"{BASE_URL}/api/backoffice/stats", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_sales" in data
        assert "total_products" in data
    
    def test_get_backoffice_products(self, merchant_token):
        """Test getting store products in backoffice"""
        headers = {"Authorization": f"Bearer {merchant_token}"}
        response = requests.get(f"{BASE_URL}/api/backoffice/products", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
