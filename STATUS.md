# Bariq Web App - Project Status (December 23, 2025)

## Current State: MVP Ready for Testing

The application is now functional with complete customer and merchant portals.

---

## What's Working

### Backend (Flask API)
- JWT Authentication (Customer, Merchant, Admin)
- Customer CRUD + Credit Management
- Merchant CRUD + Branch/Staff Management
- Transaction Creation & Confirmation Flow
- Payment Processing
- Settlement Tracking
- All API endpoints tested and functional

### Frontend (Jinja2 Templates)

#### Public Pages
| Page | URL | Status |
|------|-----|--------|
| Landing Page | `/` | Complete |
| Login Page | `/login` | Complete |

#### Customer Portal
| Page | URL | Status |
|------|-----|--------|
| Dashboard | `/customer` | Complete |
| Transactions | `/customer/transactions` | Complete |
| Profile | `/customer/profile` | Complete |
| Credit Details | `/customer/credit` | Complete |
| Payments | `/customer/payments` | Complete |
| Make Payment | `/customer/pay` | Complete |

#### Merchant Portal
| Page | URL | Status |
|------|-----|--------|
| Dashboard | `/merchant` | Complete |
| New Transaction | `/merchant/new-transaction` | Complete |
| Transactions | `/merchant/transactions` | Complete |
| Settlements | `/merchant/settlements` | Complete |
| Staff | `/merchant/staff` | Complete |
| Branches | `/merchant/branches` | Complete |

---

## Test Credentials

| Role | Username/Email | Password |
|------|----------------|----------|
| Customer | `ahmed_ali` | `Customer@123` |
| Merchant Owner | `owner@albaraka.sa` | `Owner@123` |
| Merchant Cashier | `cashier@albaraka.sa` | `Cashier@123` |
| Admin | `admin@bariq.sa` | `Admin@123` |

**Customer Bariq ID:** `123456` (for merchant lookup)

---

## Latest Session Updates

### Merchant Settlements Page - Complete Rewrite
- Summary cards (total settlements, transferred, pending amounts)
- Status filter tabs (All, Pending, Approved, Transferred)
- Full data table with all settlement fields
- Settlement details modal with breakdown
- Fixed Settlement model `to_dict()` method

### Bug Fixes
- Modal CSS specificity issue (modals appearing on page load)
- Added `.modal.hidden { display: none !important; }`
- Added missing `getSettlementDetails()` API method

---

## Files Structure

```
bariq/
├── wsgi.py                 # Entry point - run this
├── app/
│   ├── __init__.py         # Flask app factory
│   ├── extensions.py       # Flask extensions
│   ├── api/v1/             # REST API endpoints
│   │   ├── auth/           # Authentication
│   │   ├── customers/      # Customer endpoints
│   │   ├── merchants/      # Merchant endpoints
│   │   └── admin/          # Admin endpoints
│   ├── models/             # SQLAlchemy models
│   ├── services/           # Business logic
│   ├── static/
│   │   ├── css/main.css    # Global styles
│   │   └── js/api.js       # API helper + auth
│   └── templates/          # Jinja2 HTML templates
│       ├── base.html       # Base layout
│       ├── customer/       # Customer portal
│       └── merchant/       # Merchant portal
├── scripts/
│   └── seed_data.py        # Database seeding
└── migrations/             # Database migrations
```

---

## How to Run

```bash
cd /Users/ibrahimfakhry/Desktop/bariq
source venv/bin/activate
python wsgi.py
```

Server runs at: **http://localhost:5001**

---

## Next Steps (Priority Order)

### 1. Admin Dashboard (High Priority)
Create admin portal at `/admin` with:
- Dashboard with system-wide statistics
- Customer management (view, activate, suspend, adjust credit)
- Merchant management (approve, suspend merchants)
- Transaction monitoring
- Settlement approval workflow
- System settings management

### 2. Customer Registration (High Priority)
- Registration page with form
- Nafath authentication mock/integration
- OTP verification flow
- Credit limit assignment

### 3. Merchant Registration (Medium Priority)
- Merchant signup form
- Business verification process
- Admin approval workflow

### 4. Enhanced Features (Medium Priority)
- Notifications system (in-app + email)
- Transaction history export (PDF/Excel)
- Merchant analytics dashboard
- Customer credit score display

### 5. Security & Production (Before Launch)
- Input validation enhancement
- Rate limiting
- HTTPS setup
- Environment variables for secrets
- Database backup strategy

---

## Known Limitations

1. **No Admin UI** - Admin endpoints exist but no frontend
2. **No Registration** - Users must be seeded manually
3. **No Email/SMS** - Notifications are in-app only
4. **Mock Nafath** - No real Nafath integration yet
5. **No Payment Gateway** - Payments are recorded but not processed

---

## Tech Stack

- **Backend:** Flask 3.x, SQLAlchemy, Flask-JWT-Extended
- **Database:** PostgreSQL (configured) / SQLite (dev fallback)
- **Frontend:** Jinja2, Vanilla JS, Custom CSS
- **Auth:** JWT tokens with refresh
- **Design:** RTL Arabic, Teal & White theme, Mobile responsive
