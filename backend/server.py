from fastapi import FastAPI, APIRouter, HTTPException, Request, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class ProductVariant(BaseModel):
    name: str
    value: str
    price_modifier: float = 0.0

class ProductImage(BaseModel):
    url: str
    alt: str
    is_primary: bool = False

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    short_description: str
    price: float
    compare_at_price: Optional[float] = None
    category: str
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    benefits: List[str] = []
    how_to_use: str = ""
    why_love_it: List[str] = []
    in_stock: bool = True
    featured: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    short_description: str
    price: float
    compare_at_price: Optional[float] = None
    category: str
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    benefits: List[str] = []
    how_to_use: str = ""
    why_love_it: List[str] = []
    in_stock: bool = True
    featured: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[ProductImage]] = None
    variants: Optional[List[ProductVariant]] = None
    benefits: Optional[List[str]] = None
    how_to_use: Optional[str] = None
    why_love_it: Optional[List[str]] = None
    in_stock: Optional[bool] = None
    featured: Optional[bool] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    author_name: str
    rating: int = Field(ge=1, le=5)
    title: str
    content: str
    verified_purchase: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    author_name: str
    rating: int = Field(ge=1, le=5)
    title: str
    content: str

class Newsletter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class NewsletterCreate(BaseModel):
    email: EmailStr

class CartItem(BaseModel):
    product_id: str
    product_name: str
    product_image: str
    variant: Optional[str] = None
    price: float
    quantity: int

class CartRequest(BaseModel):
    items: List[CartItem]

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    city: str
    province: str
    postal_code: str
    country: str = "Canada"

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    items: List[CartItem]
    shipping_address: ShippingAddress
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    status: str = "pending"
    payment_status: str = "pending"
    stripe_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    shipping_address: ShippingAddress
    origin_url: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    order_id: str
    amount: float
    currency: str = "cad"
    status: str = "initiated"
    payment_status: str = "pending"
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== CONSTANTS ==============
CATEGORIES = [
    {"id": "ice-rollers", "name": "Ice Rollers", "slug": "ice-rollers"},
    {"id": "scalp-massagers", "name": "Scalp Massagers", "slug": "scalp-massagers"},
    {"id": "gua-sha", "name": "Gua Sha Tools", "slug": "gua-sha"},
    {"id": "face-rollers", "name": "Face Rollers", "slug": "face-rollers"},
    {"id": "hair-oil-applicators", "name": "Hair Oil Applicators", "slug": "hair-oil-applicators"},
    {"id": "under-eye-tools", "name": "Under Eye Tools", "slug": "under-eye-tools"},
    {"id": "cleansing-brushes", "name": "Cleansing Brushes", "slug": "cleansing-brushes"},
    {"id": "beauty-organizers", "name": "Beauty Organizers", "slug": "beauty-organizers"},
]

SHIPPING_RATE = 9.95
FREE_SHIPPING_THRESHOLD = 75.0
TAX_RATE = 0.13  # Ontario HST

# ============== PRODUCT ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "Beautivra API", "version": "1.0.0"}

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        # Try by slug
        product = await db.products.find_one({"slug": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    return product

@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============== CATEGORIES ==============

@api_router.get("/categories")
async def get_categories():
    return CATEGORIES

# ============== REVIEWS ==============

@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(100)
    for r in reviews:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate):
    review = Review(**review_data.model_dump())
    doc = review.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    return review

# ============== NEWSLETTER ==============

@api_router.post("/newsletter")
async def subscribe_newsletter(data: NewsletterCreate):
    existing = await db.newsletter.find_one({"email": data.email.lower()})
    if existing:
        return {"message": "You're already subscribed!", "success": True}
    
    newsletter = Newsletter(email=data.email.lower())
    doc = newsletter.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    await db.newsletter.insert_one(doc)
    return {"message": "Thank you for subscribing!", "success": True}

@api_router.get("/admin/newsletter", response_model=List[Newsletter])
async def get_newsletter_subscribers():
    subscribers = await db.newsletter.find({}, {"_id": 0}).to_list(1000)
    for s in subscribers:
        if isinstance(s.get('subscribed_at'), str):
            s['subscribed_at'] = datetime.fromisoformat(s['subscribed_at'])
    return subscribers

# ============== CONTACT ==============

@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    contact = ContactMessage(**data.model_dump())
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    return {"message": "Thank you for your message. We'll get back to you soon!", "success": True}

# ============== CART & SHIPPING ==============

@api_router.post("/calculate-shipping")
async def calculate_shipping(cart: CartRequest):
    subtotal = sum(item.price * item.quantity for item in cart.items)
    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_RATE
    tax = (subtotal + shipping) * TAX_RATE
    total = subtotal + shipping + tax
    
    return {
        "subtotal": round(subtotal, 2),
        "shipping": round(shipping, 2),
        "tax": round(tax, 2),
        "total": round(total, 2),
        "free_shipping_threshold": FREE_SHIPPING_THRESHOLD,
        "tax_rate": TAX_RATE
    }

# ============== CHECKOUT & PAYMENTS ==============

def generate_order_number():
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    unique_part = str(uuid.uuid4())[:6].upper()
    return f"BV-{timestamp}-{unique_part}"

@api_router.post("/checkout")
async def create_checkout(data: CheckoutRequest, request: Request):
    # Calculate totals server-side to prevent manipulation
    subtotal = sum(item.price * item.quantity for item in data.items)
    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_RATE
    tax = (subtotal + shipping) * TAX_RATE
    total = subtotal + shipping + tax
    
    # Create order
    order_number = generate_order_number()
    order = Order(
        order_number=order_number,
        items=[item.model_dump() for item in data.items],
        shipping_address=data.shipping_address.model_dump(),
        subtotal=round(subtotal, 2),
        shipping_cost=round(shipping, 2),
        tax=round(tax, 2),
        total=round(total, 2)
    )
    
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    await db.orders.insert_one(order_doc)
    
    # Create Stripe checkout session
    api_key = os.environ.get('STRIPE_API_KEY')
    host_url = data.origin_url.rstrip('/')
    webhook_url = f"{str(request.base_url).rstrip('/')}api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{host_url}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/cart"
    
    checkout_request = CheckoutSessionRequest(
        amount=round(total, 2),
        currency="cad",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order.id,
            "order_number": order_number,
            "customer_email": data.shipping_address.email
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with session ID
    await db.orders.update_one(
        {"id": order.id},
        {"$set": {"stripe_session_id": session.session_id}}
    )
    
    # Create payment transaction record
    payment_tx = PaymentTransaction(
        session_id=session.session_id,
        order_id=order.id,
        amount=round(total, 2),
        currency="cad",
        status="initiated",
        payment_status="pending",
        metadata={
            "order_number": order_number,
            "customer_email": data.shipping_address.email
        }
    )
    tx_doc = payment_tx.model_dump()
    tx_doc['created_at'] = tx_doc['created_at'].isoformat()
    tx_doc['updated_at'] = tx_doc['updated_at'].isoformat()
    await db.payment_transactions.insert_one(tx_doc)
    
    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "order_id": order.id,
        "order_number": order_number
    }

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update payment transaction
    now = datetime.now(timezone.utc).isoformat()
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": status.status,
            "payment_status": status.payment_status,
            "updated_at": now
        }}
    )
    
    # If paid, update order status
    if status.payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if tx:
            await db.orders.update_one(
                {"id": tx["order_id"]},
                {"$set": {
                    "status": "confirmed",
                    "payment_status": "paid"
                }}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "metadata": status.metadata
    }

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        # Try by order number
        order = await db.orders.find_one({"order_number": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return order

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            now = datetime.now(timezone.utc).isoformat()
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": now
                }}
            )
            
            tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if tx:
                await db.orders.update_one(
                    {"id": tx["order_id"]},
                    {"$set": {
                        "status": "confirmed",
                        "payment_status": "paid"
                    }}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============== SEED DATA ==============

@api_router.post("/admin/seed")
async def seed_products():
    # Check if products already exist
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": f"Database already has {count} products", "seeded": False}
    
    products = [
        {
            "name": "Rose Quartz Gua Sha",
            "slug": "rose-quartz-gua-sha",
            "description": "Handcrafted from premium rose quartz, this traditional facial tool promotes lymphatic drainage and reduces puffiness. The natural cooling properties of the stone help soothe and calm your skin.",
            "short_description": "Premium rose quartz facial sculpting tool",
            "price": 42.00,
            "compare_at_price": 55.00,
            "category": "gua-sha",
            "images": [
                {"url": "https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg", "alt": "Rose Quartz Gua Sha", "is_primary": True}
            ],
            "variants": [
                {"name": "Stone", "value": "Rose Quartz", "price_modifier": 0},
                {"name": "Stone", "value": "Jade", "price_modifier": 5.00},
                {"name": "Stone", "value": "Obsidian", "price_modifier": 8.00}
            ],
            "benefits": ["Reduces puffiness", "Promotes lymphatic drainage", "Improves circulation", "Natural cooling effect"],
            "how_to_use": "Apply facial oil or serum. Hold the tool at a 15-degree angle against your skin. Use gentle, upward strokes from the center of your face outward. Repeat 3-5 times per area.",
            "why_love_it": ["100% authentic rose quartz", "Ergonomic design for easy grip", "Comes with silk storage pouch"],
            "in_stock": True,
            "featured": True,
            "meta_title": "Rose Quartz Gua Sha - Beautivra",
            "meta_description": "Premium rose quartz gua sha tool for facial sculpting and lymphatic drainage."
        },
        {
            "name": "Cryo Ice Roller",
            "slug": "cryo-ice-roller",
            "description": "Our signature ice roller features a stainless steel head that stays cold longer than traditional ice rollers. Perfect for morning de-puffing and soothing irritated skin.",
            "short_description": "Professional-grade stainless steel ice roller",
            "price": 38.00,
            "compare_at_price": None,
            "category": "ice-rollers",
            "images": [
                {"url": "https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg", "alt": "Cryo Ice Roller", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Silver", "price_modifier": 0},
                {"name": "Color", "value": "Rose Gold", "price_modifier": 5.00},
                {"name": "Color", "value": "Black", "price_modifier": 5.00}
            ],
            "benefits": ["Instant de-puffing", "Calms redness and irritation", "Tightens pores", "Relieves headaches"],
            "how_to_use": "Store in freezer for at least 2 hours. Roll gently across face in upward and outward motions. Use for 5-10 minutes for best results.",
            "why_love_it": ["Medical-grade stainless steel", "Stays cold 2x longer", "Easy-grip silicone handle"],
            "in_stock": True,
            "featured": True,
            "meta_title": "Cryo Ice Roller - Beautivra",
            "meta_description": "Professional stainless steel ice roller for instant de-puffing and skin soothing."
        },
        {
            "name": "Jade Face Roller",
            "slug": "jade-face-roller",
            "description": "Authentic Xiuyan jade double-ended roller. The larger stone is perfect for cheeks and forehead, while the smaller end targets delicate areas around eyes and nose.",
            "short_description": "Dual-ended authentic jade facial roller",
            "price": 48.00,
            "compare_at_price": 65.00,
            "category": "face-rollers",
            "images": [
                {"url": "https://images.pexels.com/photos/7208722/pexels-photo-7208722.jpeg", "alt": "Jade Face Roller", "is_primary": True}
            ],
            "variants": [
                {"name": "Stone", "value": "Green Jade", "price_modifier": 0},
                {"name": "Stone", "value": "White Jade", "price_modifier": 10.00}
            ],
            "benefits": ["Reduces fine lines", "Increases product absorption", "Promotes blood circulation", "Natural cooling"],
            "how_to_use": "Start at neck, rolling upward. Move to jawline, cheeks, forehead. Use small roller around eyes. Roll each area 5-10 times.",
            "why_love_it": ["100% authentic Xiuyan jade", "Smooth, silent rolling mechanism", "Dual-ended for all facial areas"],
            "in_stock": True,
            "featured": True,
            "meta_title": "Jade Face Roller - Beautivra",
            "meta_description": "Authentic Xiuyan jade face roller for facial massage and skincare absorption."
        },
        {
            "name": "Scalp Revival Massager",
            "slug": "scalp-revival-massager",
            "description": "Ergonomic silicone scalp massager with soft bristles that stimulate blood flow and distribute natural oils. Perfect for use in shower with shampoo or dry for relaxation.",
            "short_description": "Ergonomic silicone scalp massage brush",
            "price": 18.00,
            "compare_at_price": None,
            "category": "scalp-massagers",
            "images": [
                {"url": "https://images.pexels.com/photos/3785802/pexels-photo-3785802.jpeg", "alt": "Scalp Massager", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Blush Pink", "price_modifier": 0},
                {"name": "Color", "value": "Sage Green", "price_modifier": 0},
                {"name": "Color", "value": "Charcoal", "price_modifier": 0}
            ],
            "benefits": ["Stimulates hair growth", "Reduces dandruff", "Relieves tension headaches", "Deep cleanses scalp"],
            "how_to_use": "Use wet or dry. Apply gentle pressure and move in circular motions across entire scalp. Use 3-5 minutes daily.",
            "why_love_it": ["Ultra-soft medical-grade silicone", "Ergonomic palm-fit design", "Waterproof for shower use"],
            "in_stock": True,
            "featured": True,
            "meta_title": "Scalp Revival Massager - Beautivra",
            "meta_description": "Silicone scalp massager for hair growth stimulation and relaxation."
        },
        {
            "name": "Hair Oil Applicator Comb",
            "slug": "hair-oil-applicator-comb",
            "description": "Precision oil applicator with built-in reservoir and fine-tooth comb. Apply oils directly to roots without mess or waste.",
            "short_description": "Precision hair oil application tool",
            "price": 22.00,
            "compare_at_price": None,
            "category": "hair-oil-applicators",
            "images": [
                {"url": "https://images.pexels.com/photos/7796746/pexels-photo-7796746.jpeg", "alt": "Hair Oil Applicator", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Clear", "price_modifier": 0},
                {"name": "Color", "value": "Black", "price_modifier": 0}
            ],
            "benefits": ["No mess application", "Even distribution", "Saves product", "Easy cleaning"],
            "how_to_use": "Fill reservoir with oil. Part hair and apply directly to scalp. Comb through to distribute evenly.",
            "why_love_it": ["150ml capacity", "Precision nozzle tip", "Wide-tooth comb attachment included"],
            "in_stock": True,
            "featured": False,
            "meta_title": "Hair Oil Applicator - Beautivra",
            "meta_description": "Precision hair oil applicator comb for mess-free scalp treatments."
        },
        {
            "name": "Cooling Under Eye Wands",
            "slug": "cooling-under-eye-wands",
            "description": "Set of two zinc alloy cooling wands designed specifically for the delicate under-eye area. Reduces puffiness, dark circles, and fine lines.",
            "short_description": "Zinc alloy under-eye cooling wands (set of 2)",
            "price": 28.00,
            "compare_at_price": 35.00,
            "category": "under-eye-tools",
            "images": [
                {"url": "https://images.unsplash.com/photo-1573248303663-37d7a727a4bf", "alt": "Under Eye Cooling Wands", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Silver", "price_modifier": 0},
                {"name": "Color", "value": "Rose Gold", "price_modifier": 3.00}
            ],
            "benefits": ["Reduces dark circles", "Minimizes puffiness", "Smooths fine lines", "Enhances serum absorption"],
            "how_to_use": "Store in refrigerator. Apply eye cream, then gently press and roll wand from inner to outer corner. Repeat 5-10 times.",
            "why_love_it": ["Ergonomic curved design", "Stays cold for 20+ minutes", "Perfect for travel"],
            "in_stock": True,
            "featured": False,
            "meta_title": "Under Eye Cooling Wands - Beautivra",
            "meta_description": "Zinc alloy cooling wands for reducing under-eye puffiness and dark circles."
        },
        {
            "name": "Sonic Cleansing Brush",
            "slug": "sonic-cleansing-brush",
            "description": "Rechargeable sonic facial brush with ultra-soft silicone bristles. Three speed settings for gentle daily cleansing to deep exfoliation.",
            "short_description": "Rechargeable sonic silicone face brush",
            "price": 58.00,
            "compare_at_price": 75.00,
            "category": "cleansing-brushes",
            "images": [
                {"url": "https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg", "alt": "Sonic Cleansing Brush", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Blush", "price_modifier": 0},
                {"name": "Color", "value": "Mint", "price_modifier": 0},
                {"name": "Color", "value": "White", "price_modifier": 0}
            ],
            "benefits": ["Removes 99% of dirt and makeup", "Unclogs pores", "Gentle exfoliation", "Improves product absorption"],
            "how_to_use": "Wet face and apply cleanser. Turn on device and gently move across face in circular motions. Rinse and pat dry.",
            "why_love_it": ["8000 sonic pulses per minute", "Waterproof IPX7 rated", "USB rechargeable, 90 day battery"],
            "in_stock": True,
            "featured": True,
            "meta_title": "Sonic Cleansing Brush - Beautivra",
            "meta_description": "Rechargeable sonic facial cleansing brush with silicone bristles."
        },
        {
            "name": "Minimalist Beauty Organizer",
            "slug": "minimalist-beauty-organizer",
            "description": "Elegant acrylic organizer with dedicated slots for your Beautivra tools. Features velvet-lined compartments and a dust cover.",
            "short_description": "Acrylic tool organizer with dust cover",
            "price": 45.00,
            "compare_at_price": None,
            "category": "beauty-organizers",
            "images": [
                {"url": "https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg", "alt": "Beauty Organizer", "is_primary": True}
            ],
            "variants": [
                {"name": "Color", "value": "Clear", "price_modifier": 0},
                {"name": "Color", "value": "Rose Tint", "price_modifier": 8.00}
            ],
            "benefits": ["Keeps tools organized", "Protects from dust", "Display-worthy design", "Easy access"],
            "how_to_use": "Place your tools in designated compartments. Cover when not in use to protect from dust.",
            "why_love_it": ["Premium acrylic construction", "Velvet-lined compartments", "Stackable design"],
            "in_stock": True,
            "featured": False,
            "meta_title": "Beauty Organizer - Beautivra",
            "meta_description": "Minimalist acrylic beauty tool organizer with dust cover."
        }
    ]
    
    for p in products:
        product = Product(**p)
        doc = product.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.products.insert_one(doc)
    
    # Add sample reviews
    sample_reviews = [
        {"product_id": "", "author_name": "Sarah M.", "rating": 5, "title": "Life changing!", "content": "I use this every morning and my skin has never looked better. The quality is amazing.", "verified_purchase": True},
        {"product_id": "", "author_name": "Emily R.", "rating": 4, "title": "Great quality", "content": "Beautiful design and works exactly as described. Shipping was fast too!", "verified_purchase": True},
        {"product_id": "", "author_name": "Jessica L.", "rating": 5, "title": "So relaxing", "content": "My new favorite part of my skincare routine. Feels so luxurious.", "verified_purchase": True},
    ]
    
    # Get first product ID for reviews
    first_product = await db.products.find_one({}, {"_id": 0, "id": 1})
    if first_product:
        for review_data in sample_reviews:
            review_data["product_id"] = first_product["id"]
            review = Review(**review_data)
            doc = review.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.reviews.insert_one(doc)
    
    return {"message": f"Seeded {len(products)} products and {len(sample_reviews)} reviews", "seeded": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
