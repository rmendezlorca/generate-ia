from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "user"  # "user" or "store"
    store_id: Optional[str] = None  # If role is "store", this links to their store
    lat: Optional[float] = None
    lng: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "user"  # "user" or "store"
    store_id: Optional[str] = None  # Required if role is "store"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Store(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    address: str
    lat: float
    lng: float
    phone: Optional[str] = None
    image_url: str
    rating: float = 4.5
    is_premium: bool = False
    active_promotions: int = 0
    services: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    name: str
    description: str
    category: str
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    image_url: str  # Main image
    gallery_images: List[str] = []  # Additional gallery images (max 2 more)
    in_stock: bool = True
    is_promoted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    product_id: Optional[str] = None
    title: str
    description: str
    discount_percentage: float
    valid_until: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItem(BaseModel):
    product_id: str
    product_name: str
    store_id: str
    store_name: str
    quantity: int
    price: float
    original_price: Optional[float] = None
    image_url: str

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItem] = []
    total: float = 0.0
    total_savings: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    category: str
    available: bool = True

class RouteOptimizationRequest(BaseModel):
    destination_lat: float
    destination_lng: float
    user_lat: float
    user_lng: float
    max_detour_km: float = 2.0

class RouteOptimizationResponse(BaseModel):
    stores: List[Store]
    total_distance_km: float
    estimated_time_minutes: int
    total_savings: float
    waypoints: List[dict]

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # 'promotion', 'order', 'general'
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MockPaymentRequest(BaseModel):
    amount: float
    payment_method: str
    user_id: str

class MockPaymentResponse(BaseModel):
    success: bool
    transaction_id: str
    amount: float
    message: str

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    original_price: Optional[float] = None
    image_url: str
    gallery_images: List[str] = []
    in_stock: bool = True
    is_promoted: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    in_stock: Optional[bool] = None
    is_promoted: Optional[bool] = None

class PromotionCreate(BaseModel):
    title: str
    description: str
    discount_percentage: float
    valid_until: datetime
    product_id: Optional[str] = None

class Sale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    product_id: str
    product_name: str
    quantity: int
    price: float
    total: float
    customer_id: str
    customer_name: str
    payment_method: str = "platform"  # "platform", "cash", "qr"
    status: str = "completed"  # completed, pending, cancelled
    payment_status: str = "paid"  # paid, pending
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StoreStats(BaseModel):
    total_sales: float
    total_orders: int
    total_products: int
    active_promotions: int
    pending_amount: float
    this_month_sales: float

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # If registering as store, verify store exists
    if user_data.role == "store" and user_data.store_id:
        store = await db.stores.find_one({"id": user_data.store_id})
        if not store:
            raise HTTPException(status_code=400, detail="Store not found")
    
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role,
        store_id=user_data.store_id
    )
    
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_doc.pop("password", None)
    user_doc.pop("_id", None)
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/location")
async def update_location(lat: float, lng: float, current_user: User = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"lat": lat, "lng": lng}}
    )
    return {"message": "Location updated successfully"}

# ============= STORES ROUTES =============

@api_router.get("/stores", response_model=List[Store])
async def get_stores(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 10.0,
    min_rating: Optional[float] = None,
    category: Optional[str] = None,
    has_promotions: bool = False,
    service: Optional[str] = None
):
    query = {}
    
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    if category:
        query["category"] = category
    
    if has_promotions:
        query["active_promotions"] = {"$gt": 0}
    
    if service:
        query["services"] = service
    
    stores = await db.stores.find(query, {"_id": 0}).to_list(1000)
    
    for store in stores:
        if isinstance(store.get("created_at"), str):
            store["created_at"] = datetime.fromisoformat(store["created_at"])
    
    if lat is not None and lng is not None:
        # Filter by distance
        stores_with_distance = []
        for store in stores:
            distance = calculate_distance(lat, lng, store["lat"], store["lng"])
            if distance <= radius_km:
                store["distance"] = round(distance, 2)
                stores_with_distance.append(store)
        stores_with_distance.sort(key=lambda x: x["distance"])
        return stores_with_distance
    
    return stores

@api_router.get("/stores/{store_id}", response_model=Store)
async def get_store(store_id: str):
    store = await db.stores.find_one({"id": store_id}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if isinstance(store.get("created_at"), str):
        store["created_at"] = datetime.fromisoformat(store["created_at"])
    return Store(**store)

# ============= PRODUCTS ROUTES =============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    store_id: Optional[str] = None,
    category: Optional[str] = None,
    promoted_only: bool = False,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    search: Optional[str] = None,
    sort_by: Optional[str] = None  # "price_asc", "price_desc", "name", "newest"
):
    query = {}
    if store_id:
        query["store_id"] = store_id
    if category:
        query["category"] = category
    if promoted_only:
        query["is_promoted"] = True
    if in_stock_only:
        query["in_stock"] = True
    
    # Price range filter
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["price"] = price_filter
    
    # Search filter
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get("created_at"), str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    
    # Sorting
    if sort_by == "price_asc":
        products.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "name":
        products.sort(key=lambda x: x["name"])
    elif sort_by == "newest":
        products.sort(key=lambda x: x["created_at"], reverse=True)
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    return Product(**product)

# ============= PROMOTIONS ROUTES =============

@api_router.get("/promotions", response_model=List[Promotion])
async def get_promotions(active_only: bool = True):
    query = {}
    if active_only:
        query["is_active"] = True
        query["valid_until"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    
    promotions = await db.promotions.find(query, {"_id": 0}).to_list(1000)
    
    for promo in promotions:
        if isinstance(promo.get("created_at"), str):
            promo["created_at"] = datetime.fromisoformat(promo["created_at"])
        if isinstance(promo.get("valid_until"), str):
            promo["valid_until"] = datetime.fromisoformat(promo["valid_until"])
    
    return promotions

# ============= CART ROUTES =============

@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        return Cart(user_id=current_user.id, items=[], total=0.0, total_savings=0.0)
    
    if isinstance(cart.get("updated_at"), str):
        cart["updated_at"] = datetime.fromisoformat(cart["updated_at"])
    
    return Cart(**cart)

@api_router.post("/cart/add")
async def add_to_cart(request: AddToCartRequest, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": request.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    store = await db.stores.find_one({"id": product["store_id"]}, {"_id": 0})
    
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    cart_item = CartItem(
        product_id=product["id"],
        product_name=product["name"],
        store_id=product["store_id"],
        store_name=store["name"] if store else "Unknown",
        quantity=request.quantity,
        price=product["price"],
        original_price=product.get("original_price"),
        image_url=product["image_url"]
    )
    
    if cart:
        # Update existing cart
        items = cart.get("items", [])
        item_exists = False
        for item in items:
            if item["product_id"] == request.product_id:
                item["quantity"] += request.quantity
                item_exists = True
                break
        
        if not item_exists:
            items.append(cart_item.model_dump())
        
        # Calculate totals
        total = sum(item["price"] * item["quantity"] for item in items)
        total_savings = sum(
            (item.get("original_price", item["price"]) - item["price"]) * item["quantity"]
            for item in items if item.get("original_price")
        )
        
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {
                "items": items,
                "total": total,
                "total_savings": total_savings,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new cart
        total = cart_item.price * cart_item.quantity
        total_savings = 0
        if cart_item.original_price:
            total_savings = (cart_item.original_price - cart_item.price) * cart_item.quantity
        
        new_cart = Cart(
            user_id=current_user.id,
            items=[cart_item],
            total=total,
            total_savings=total_savings
        )
        
        cart_dict = new_cart.model_dump()
        cart_dict["updated_at"] = cart_dict["updated_at"].isoformat()
        await db.carts.insert_one(cart_dict)
    
    return {"message": "Product added to cart successfully"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    
    total = sum(item["price"] * item["quantity"] for item in items)
    total_savings = sum(
        (item.get("original_price", item["price"]) - item["price"]) * item["quantity"]
        for item in items if item.get("original_price")
    )
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "items": items,
            "total": total,
            "total_savings": total_savings,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Product removed from cart"}

@api_router.delete("/cart/clear")
async def clear_cart(current_user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "items": [],
            "total": 0.0,
            "total_savings": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Cart cleared successfully"}

# ============= ROUTE OPTIMIZATION =============

@api_router.post("/routes/optimize", response_model=RouteOptimizationResponse)
async def optimize_route(request: RouteOptimizationRequest):
    # Get all stores
    stores = await db.stores.find({}, {"_id": 0}).to_list(1000)
    
    # Calculate direct distance to destination
    direct_distance = calculate_distance(
        request.user_lat, request.user_lng,
        request.destination_lat, request.destination_lng
    )
    
    # Find stores along the route (within detour radius)
    stores_on_route = []
    for store in stores:
        distance_to_store = calculate_distance(
            request.user_lat, request.user_lng,
            store["lat"], store["lng"]
        )
        distance_from_store_to_dest = calculate_distance(
            store["lat"], store["lng"],
            request.destination_lat, request.destination_lng
        )
        
        total_distance_via_store = distance_to_store + distance_from_store_to_dest
        detour = total_distance_via_store - direct_distance
        
        if detour <= request.max_detour_km and store.get("active_promotions", 0) > 0:
            store["detour"] = round(detour, 2)
            store["distance_to_store"] = round(distance_to_store, 2)
            if isinstance(store.get("created_at"), str):
                store["created_at"] = datetime.fromisoformat(store["created_at"])
            stores_on_route.append(store)
    
    # Sort by best value (less detour, more promotions)
    stores_on_route.sort(key=lambda x: (x["detour"], -x["active_promotions"]))
    
    # Take top 5 stores
    optimized_stores = stores_on_route[:5]
    
    # Calculate total route
    waypoints = [{"lat": request.user_lat, "lng": request.user_lng, "type": "start"}]
    total_distance = 0
    total_savings = 0
    
    current_lat, current_lng = request.user_lat, request.user_lng
    for store in optimized_stores:
        distance = calculate_distance(current_lat, current_lng, store["lat"], store["lng"])
        total_distance += distance
        waypoints.append({
            "lat": store["lat"],
            "lng": store["lng"],
            "type": "store",
            "store_name": store["name"],
            "promotions": store["active_promotions"]
        })
        current_lat, current_lng = store["lat"], store["lng"]
        total_savings += store["active_promotions"] * 5  # Mock savings calculation
    
    # Add destination
    distance_to_dest = calculate_distance(current_lat, current_lng, request.destination_lat, request.destination_lng)
    total_distance += distance_to_dest
    waypoints.append({"lat": request.destination_lat, "lng": request.destination_lng, "type": "destination"})
    
    # Estimate time (assuming 30 km/h average speed + 5 min per store)
    estimated_time = int((total_distance / 30) * 60) + (len(optimized_stores) * 5)
    
    return RouteOptimizationResponse(
        stores=[Store(**store) for store in optimized_stores],
        total_distance_km=round(total_distance, 2),
        estimated_time_minutes=estimated_time,
        total_savings=total_savings,
        waypoints=waypoints
    )

# ============= SERVICES ROUTES =============

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

# ============= NOTIFICATIONS ROUTES =============

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for notif in notifications:
        if isinstance(notif.get("created_at"), str):
            notif["created_at"] = datetime.fromisoformat(notif["created_at"])
    
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# ============= PAYMENT ROUTES (MOCK) =============

@api_router.post("/payments/mock", response_model=MockPaymentResponse)
async def mock_payment(request: MockPaymentRequest):
    """
    MOCK PAYMENT ENDPOINT - Simulates payment processing
    
    TO INTEGRATE WITH MERCADO PAGO:
    1. Install: pip install mercadopago
    2. Get API keys from: https://www.mercadopago.com/developers
    3. Add to .env: MERCADOPAGO_ACCESS_TOKEN=your_access_token
    4. Replace this function with actual Mercado Pago SDK calls
    
    Example integration:
    import mercadopago
    sdk = mercadopago.SDK(os.environ.get('MERCADOPAGO_ACCESS_TOKEN'))
    payment_data = {
        "transaction_amount": request.amount,
        "description": "Barrio Marketplace Purchase",
        "payment_method_id": request.payment_method,
        "payer": {"email": user_email}
    }
    payment_response = sdk.payment().create(payment_data)
    """
    
    # Mock successful payment
    transaction_id = f"MOCK-{uuid.uuid4()}"
    
    return MockPaymentResponse(
        success=True,
        transaction_id=transaction_id,
        amount=request.amount,
        message="Payment processed successfully (MOCK)"
    )

# ============= SEED DATA ROUTE =============

@api_router.post("/seed")
async def seed_database():
    """Seed database with sample data"""
    
    # Check if already seeded
    existing_stores = await db.stores.count_documents({})
    if existing_stores > 0:
        # Create demo store user if doesn't exist
        existing_store_user = await db.users.find_one({"email": "comercio@barrio.com"})
        if not existing_store_user:
            stores = await db.stores.find({}, {"_id": 0}).to_list(10)
            if stores:
                demo_store = stores[0]
                demo_store_user = {
                    "id": str(uuid.uuid4()),
                    "email": "comercio@barrio.com",
                    "password": hash_password("comercio123"),
                    "name": f"{demo_store['name']} - Admin",
                    "phone": demo_store.get("phone", ""),
                    "role": "store",
                    "store_id": demo_store["id"],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(demo_store_user)
                return {
                    "message": "Store user created",
                    "demo_store_login": {
                        "email": "comercio@barrio.com",
                        "password": "comercio123",
                        "store_name": demo_store["name"]
                    }
                }
        return {"message": "Database already seeded"}
    
    # Sample stores
    stores_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Almacén Don Pedro",
            "description": "Almacén de barrio con productos frescos",
            "category": "Almacén",
            "address": "Av. Principal 123",
            "lat": -33.4489,
            "lng": -70.6693,
            "phone": "+56912345678",
            "image_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400",
            "rating": 4.5,
            "is_premium": True,
            "active_promotions": 5,
            "services": ["delivery", "caja_vecina"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Panadería La Esquina",
            "description": "Pan fresco todos los días",
            "category": "Panadería",
            "address": "Calle 2 #456",
            "lat": -33.4519,
            "lng": -70.6712,
            "phone": "+56987654321",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
            "rating": 4.8,
            "is_premium": False,
            "active_promotions": 3,
            "services": ["reposteria"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Frutería El Valle",
            "description": "Frutas y verduras frescas",
            "category": "Frutería",
            "address": "Pasaje Los Aromos 789",
            "lat": -33.4469,
            "lng": -70.6730,
            "phone": "+56911223344",
            "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
            "rating": 4.6,
            "is_premium": True,
            "active_promotions": 8,
            "services": ["delivery"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lavado Express",
            "description": "Lavado de autos profesional",
            "category": "Servicios",
            "address": "Av. Providencia 234",
            "lat": -33.4499,
            "lng": -70.6650,
            "phone": "+56955667788",
            "image_url": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400",
            "rating": 4.3,
            "is_premium": False,
            "active_promotions": 2,
            "services": ["lavado_autos"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Minimarket 24/7",
            "description": "Abierto las 24 horas",
            "category": "Almacén",
            "address": "Calle San Martín 567",
            "lat": -33.4440,
            "lng": -70.6680,
            "phone": "+56933445566",
            "image_url": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
            "rating": 4.4,
            "is_premium": True,
            "active_promotions": 6,
            "services": ["delivery", "pago_cuentas"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.stores.insert_many(stores_data)
    
    # Sample products
    products_data = []
    categories = ["Lácteos", "Panadería", "Frutas", "Verduras", "Bebidas", "Carnes"]
    
    for store in stores_data:
        for i in range(10):
            product = {
                "id": str(uuid.uuid4()),
                "store_id": store["id"],
                "name": f"Producto {i+1} - {store['category']}",
                "description": f"Descripción del producto {i+1}",
                "category": categories[i % len(categories)],
                "price": round(1000 + (i * 500), 2),
                "original_price": round(1500 + (i * 500), 2) if i % 3 == 0 else None,
                "discount_percentage": 33.0 if i % 3 == 0 else None,
                "image_url": f"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
                "in_stock": True,
                "is_promoted": i % 3 == 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            products_data.append(product)
    
    await db.products.insert_many(products_data)
    
    # Sample services
    services_data = [
        {"id": str(uuid.uuid4()), "name": "Delivery", "description": "Entrega a domicilio", "icon": "Truck", "category": "delivery", "available": True},
        {"id": str(uuid.uuid4()), "name": "Pago de Cuentas", "description": "Paga tus cuentas aquí", "icon": "Receipt", "category": "pago_cuentas", "available": True},
        {"id": str(uuid.uuid4()), "name": "Caja Vecina", "description": "Retiro de dinero", "icon": "Wallet", "category": "caja_vecina", "available": True},
        {"id": str(uuid.uuid4()), "name": "Repostería", "description": "Pasteles y tortas por encargo", "icon": "Cake", "category": "reposteria", "available": True},
        {"id": str(uuid.uuid4()), "name": "Lavado de Autos", "description": "Lavado profesional", "icon": "Car", "category": "lavado_autos", "available": True},
    ]
    
    await db.services.insert_many(services_data)
    
    # Sample promotions
    promotions_data = []
    for store in stores_data[:3]:
        promo = {
            "id": str(uuid.uuid4()),
            "store_id": store["id"],
            "title": f"¡Descuento especial en {store['name']}!",
            "description": "Hasta 50% de descuento en productos seleccionados",
            "discount_percentage": 50.0,
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        promotions_data.append(promo)
    
    await db.promotions.insert_many(promotions_data)
    
    # Create a demo store user
    demo_store = stores_data[0]  # Almacén Don Pedro
    demo_store_user = {
        "id": str(uuid.uuid4()),
        "email": "comercio@barrio.com",
        "password": hash_password("comercio123"),
        "name": "Almacén Don Pedro - Admin",
        "phone": "+56912345678",
        "role": "store",
        "store_id": demo_store["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(demo_store_user)
    
    return {
        "message": "Database seeded successfully",
        "stores": len(stores_data),
        "products": len(products_data),
        "demo_store_login": {
            "email": "comercio@barrio.com",
            "password": "comercio123",
            "store_name": demo_store["name"]
        }
    }

# ============= BACKOFFICE ROUTES =============

# Middleware to check if user is a store owner
async def get_store_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "store" or not current_user.store_id:
        raise HTTPException(status_code=403, detail="Access denied. Store account required.")
    return current_user

# Dashboard Stats
@api_router.get("/backoffice/stats", response_model=StoreStats)
async def get_store_stats(store_user: User = Depends(get_store_user)):
    store_id = store_user.store_id
    
    # Get sales
    sales = await db.sales.find({"store_id": store_id}, {"_id": 0}).to_list(10000)
    total_sales = sum(sale.get("total", 0) for sale in sales)
    total_orders = len(sales)
    
    # Get pending sales
    pending_sales = [s for s in sales if s.get("payment_status") == "pending"]
    pending_amount = sum(sale.get("total", 0) for sale in pending_sales)
    
    # This month sales
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_sales = sum(
        sale.get("total", 0) for sale in sales 
        if datetime.fromisoformat(sale.get("created_at", "2020-01-01")) >= month_start
    )
    
    # Get products count
    products = await db.products.find({"store_id": store_id}).to_list(10000)
    total_products = len(products)
    
    # Get active promotions
    promotions = await db.promotions.find({
        "store_id": store_id,
        "is_active": True
    }).to_list(1000)
    active_promotions = len(promotions)
    
    return StoreStats(
        total_sales=total_sales,
        total_orders=total_orders,
        total_products=total_products,
        active_promotions=active_promotions,
        pending_amount=pending_amount,
        this_month_sales=this_month_sales
    )

# Products Management
@api_router.get("/backoffice/products", response_model=List[Product])
async def get_store_products(store_user: User = Depends(get_store_user)):
    products = await db.products.find(
        {"store_id": store_user.store_id},
        {"_id": 0}
    ).to_list(10000)
    
    for product in products:
        if isinstance(product.get("created_at"), str):
            product["created_at"] = datetime.fromisoformat(product["created_at"])
    
    return products

@api_router.post("/backoffice/products", response_model=Product)
async def create_store_product(
    product_data: ProductCreate,
    store_user: User = Depends(get_store_user)
):
    product = Product(
        store_id=store_user.store_id,
        **product_data.model_dump()
    )
    
    product_dict = product.model_dump()
    product_dict["created_at"] = product_dict["created_at"].isoformat()
    
    await db.products.insert_one(product_dict)
    
    # Update store's active_promotions count if promoted
    if product.is_promoted:
        await db.stores.update_one(
            {"id": store_user.store_id},
            {"$inc": {"active_promotions": 1}}
        )
    
    return product

@api_router.put("/backoffice/products/{product_id}", response_model=Product)
async def update_store_product(
    product_id: str,
    product_data: ProductUpdate,
    store_user: User = Depends(get_store_user)
):
    # Check if product belongs to store
    existing = await db.products.find_one({
        "id": product_id,
        "store_id": store_user.store_id
    }, {"_id": 0})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only provided fields
    update_dict = {k: v for k, v in product_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.products.update_one(
            {"id": product_id},
            {"$set": update_dict}
        )
    
    # Get updated product
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    
    return Product(**updated)

@api_router.delete("/backoffice/products/{product_id}")
async def delete_store_product(
    product_id: str,
    store_user: User = Depends(get_store_user)
):
    result = await db.products.delete_one({
        "id": product_id,
        "store_id": store_user.store_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# Promotions Management
@api_router.get("/backoffice/promotions", response_model=List[Promotion])
async def get_store_promotions(store_user: User = Depends(get_store_user)):
    promotions = await db.promotions.find(
        {"store_id": store_user.store_id},
        {"_id": 0}
    ).to_list(1000)
    
    for promo in promotions:
        if isinstance(promo.get("created_at"), str):
            promo["created_at"] = datetime.fromisoformat(promo["created_at"])
        if isinstance(promo.get("valid_until"), str):
            promo["valid_until"] = datetime.fromisoformat(promo["valid_until"])
    
    return promotions

@api_router.post("/backoffice/promotions", response_model=Promotion)
async def create_store_promotion(
    promo_data: PromotionCreate,
    store_user: User = Depends(get_store_user)
):
    promotion = Promotion(
        store_id=store_user.store_id,
        **promo_data.model_dump()
    )
    
    promo_dict = promotion.model_dump()
    promo_dict["created_at"] = promo_dict["created_at"].isoformat()
    promo_dict["valid_until"] = promo_dict["valid_until"].isoformat()
    
    await db.promotions.insert_one(promo_dict)
    
    # Update store's active_promotions count
    await db.stores.update_one(
        {"id": store_user.store_id},
        {"$inc": {"active_promotions": 1}}
    )
    
    return promotion

@api_router.delete("/backoffice/promotions/{promotion_id}")
async def delete_store_promotion(
    promotion_id: str,
    store_user: User = Depends(get_store_user)
):
    result = await db.promotions.delete_one({
        "id": promotion_id,
        "store_id": store_user.store_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    # Update store's active_promotions count
    await db.stores.update_one(
        {"id": store_user.store_id},
        {"$inc": {"active_promotions": -1}}
    )
    
    return {"message": "Promotion deleted successfully"}

# Sales / Cuenta Corriente
@api_router.get("/backoffice/sales", response_model=List[Sale])
async def get_store_sales(
    store_user: User = Depends(get_store_user),
    status: Optional[str] = None,
    limit: int = 100
):
    query = {"store_id": store_user.store_id}
    if status:
        query["payment_status"] = status
    
    sales = await db.sales.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    for sale in sales:
        if isinstance(sale.get("created_at"), str):
            sale["created_at"] = datetime.fromisoformat(sale["created_at"])
    
    return sales

# Mock sale creation for testing
@api_router.post("/backoffice/sales/mock")
async def create_mock_sale(store_user: User = Depends(get_store_user)):
    """Create a mock sale for testing the cuenta corriente"""
    products = await db.products.find({"store_id": store_user.store_id}).to_list(10)
    
    if not products:
        raise HTTPException(status_code=400, detail="No products found for this store")
    
    product = products[0]
    quantity = 2
    
    sale = Sale(
        store_id=store_user.store_id,
        product_id=product["id"],
        product_name=product["name"],
        quantity=quantity,
        price=product["price"],
        total=product["price"] * quantity,
        customer_id="demo-customer",
        customer_name="Cliente Demo",
        status="completed",
        payment_status="paid"
    )
    
    sale_dict = sale.model_dump()
    sale_dict["created_at"] = sale_dict["created_at"].isoformat()
    
    await db.sales.insert_one(sale_dict)
    
    return sale

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()