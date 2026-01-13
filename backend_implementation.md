# QuickPrint Backend Implementation (Microservices)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              (Rate limiting, Auth, Routing)                  │
└─────────────┬───────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────┬──────────┬──────────┐
    ▼                   ▼          ▼          ▼          ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  Auth  │  │  User  │  │  Shop  │  │ Order  │  │Payment │
│Service │  │Service │  │Service │  │Service │  │Service │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                        ┌──────────┐        ┌──────────┐
                        │Notif.   │        │Analytics │
                        │Service  │        │Service   │
                        └──────────┘        └──────────┘
```

---

## 1. API Gateway

**Port**: 3000  
**Tech**: Express.js + http-proxy-middleware

### Responsibilities
- JWT validation
- Rate limiting
- Request routing to services
- CORS handling

### Routes
```
/api/auth/*      → Auth Service (3001)
/api/users/*     → User Service (3002)
/api/shops/*     → Shop Service (3003)
/api/orders/*    → Order Service (3004)
/api/payments/*  → Payment Service (3005)
/api/notifications/* → Notification Service (3006)
/api/analytics/* → Analytics Service (3007)
```

---

## 2. Auth Service

**Port**: 3001  
**Database**: MongoDB

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/phone/initiate` | Send OTP to phone |
| POST | `/phone/verify` | Verify OTP, return JWT |
| POST | `/google` | Google OAuth login |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate token |

---

## 3. User Service

**Port**: 3002  

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Get current user profile |
| PUT | `/me` | Update profile |
| GET | `/:id` | Get user by ID (internal) |

### Schema: `users`
```js
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  role: ['student', 'shop', 'admin'],
  college: String,
  createdAt: Date
}
```

---

## 4. Shop Service

**Port**: 3003  
**Database**: MongoDB (with geospatial index)

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nearby` | Find shops near location |
| GET | `/:id` | Get shop details |
| POST | `/register` | Register new shop |
| PUT | `/:id/pricing` | Update pricing |

### Schema: `shops`
```js
{
  _id: ObjectId,
  ownerId: ObjectId,
  businessName: String,
  address: {
    street: String, city: String, state: String, pincode: String,
    location: { type: 'Point', coordinates: [lng, lat] }
  },
  services: { colorPrinting: Boolean, binding: Boolean, ... },
  pricing: { bwSingle: Number, colorSingle: Number, ... },
  rating: Number,
  isActive: Boolean
}
```

---

## 5. Order Service

**Port**: 3004  
**File Storage**: S3 or local uploads

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create order |
| GET | `/my-orders` | Student's orders |
| GET | `/partner-orders` | Shop's orders |
| PUT | `/:id/status` | Update status |
| POST | `/upload` | Upload print file |

### Schema: `orders`
```js
{
  _id: ObjectId,
  orderNumber: String,
  userId: ObjectId,
  shopId: ObjectId,
  file: { url: String, name: String },
  printConfig: { pages: Number, color: Boolean, copies: Number, binding: String },
  status: ['pending', 'accepted', 'printing', 'completed', 'cancelled'],
  totalCost: Number,
  createdAt: Date
}
```

---

## 6. Payment Service

**Port**: 3005  
**Integration**: Razorpay / PhonePe / UPI

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiate` | Start payment |
| GET | `/:id/status` | Check payment status |
| POST | `/webhook` | Payment gateway callback |

---

## 7. Notification Service

**Port**: 3006  
**Tech**: Socket.io for real-time

### Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `new_order` | Server → Shop | New order alert |
| `order_update` | Server → User | Status change |

### REST Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user notifications |
| PUT | `/:id/read` | Mark as read |

---

## 8. Analytics Service

**Port**: 3007  

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Platform overview stats |
| GET | `/orders` | Order analytics |
| GET | `/revenue` | Revenue analytics |

---

## Folder Structure

```
backend/
├── api-gateway/
├── auth-service/
├── user-service/
├── shop-service/
├── order-service/
├── payment-service/
├── notification-service/
└── analytics-service/
```

---

## Frontend → Backend Mapping

| Frontend Component | Backend Service |
|-------------------|-----------------|
| `useAuth` | Auth Service |
| `useOrders` | Order Service |
| `ShopSelector` | Shop Service |
| `Notifications` | Notification Service |
| `PricingSettings` | Shop Service |
| `RevenueChart` | Analytics Service |
