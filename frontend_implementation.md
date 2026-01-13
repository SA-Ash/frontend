# QuickPrint Frontend Implementation

## Tech Stack
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **State**: React Context (Auth, Orders)

---

## Folder Structure
```
src/
├── pages/           # Top-level pages
├── routes/          # Nested route views
│   ├── student/     # Student dashboard views
│   ├── partner/     # Partner dashboard views
│   └── admin/       # Admin dashboard views
├── Components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
├── config/          # Environment config
└── data/            # Static/mock data
```

---

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with features |
| Login | `/login` | Student/Partner login (phone OTP, email) |
| Signup | `/signup` | New user registration |
| AdminLogin | `/adminlogin` | Admin authentication |

---

## Route Groups

### Student (`/student/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/student` | `StudentDashboard` | Upload docs, select shop, configure print |
| `/student/orders` | `StudentOrders` | View order history |
| `/student/settings` | `StudentSettings` | Profile & preferences |

### Partner (`/partner/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/partner` | `PartnerDashboard` | Overview, stats, recent orders |
| `/partner/orders` | `PartnerOrders` | Manage incoming orders |
| `/partner/orders/:id` | `PartnerOrderDetails` | Single order view |
| `/partner/reports` | `Reports` | Analytics & reports |
| `/partner/settings` | `PartnerSettings` | Shop settings |

### Admin (`/admin/*`)
| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `Admin` | Dashboard overview |
| `/admin/orders` | `OrderAnalytics` | Order analytics |
| `/admin/partners` | `PartnerManagement` | Manage partners |
| `/admin/users` | `UserInsights` | User analytics |
| `/admin/revenue` | `RevenueChart` | Revenue analytics |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `UploadSection` | Drag-drop file upload (PDF, images) |
| `ShopSelector` | Display nearby shops, select one |
| `PrintOptions` | Configure print settings (color, copies, binding) |
| `AllOrders` | List all orders with status |
| `Notifications` | Real-time notification display |
| `PartnerRegistration` | Multi-step partner onboarding form |
| `PricingSettings` | Shop pricing configuration |
| `LocationPermission` | Request location access |

---

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state & login/logout |
| `useOrders` | Student order management (create, list, update) |
| `usePartnerOrders` | Partner order management |
| `useGeolocation` | Location tracking |

---

## Data Flow

1. **Auth**: `useAuth` → localStorage tokens → `AuthContext`
2. **Orders**: `useOrders` → localStorage persistence → `OrdersContext`
3. **Partner Orders**: `usePartnerOrders` → localStorage → `PartnerOrdersContext`

---

## Current State

The frontend is running in **offline mode**. All API service imports have been removed and replaced with localStorage-based mock implementations.
