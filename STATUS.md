# Bariq Project Status

## Last Updated: December 22, 2024

## All Steps Completed!

### Step 1: Project Structure (DONE)
- [x] Flask app factory
- [x] All database models (14 models)
- [x] All API routes (100+ endpoints)
- [x] Authentication system (JWT + Nafath mock)
- [x] Placeholder services
- [x] Configuration files

### Step 2: Implement Core Services (DONE)
- [x] CustomerService - 11 methods
- [x] MerchantService - 20 methods
- [x] TransactionService - 15 methods
- [x] PaymentService - 9 methods
- [x] SettlementService - 13 methods

### Step 3: Database Setup (DONE)
- [x] Initialized Flask-Migrate
- [x] Created initial migration
- [x] Applied migration (18 tables created)
- [x] Created seed data script
- [x] Seeded database with test data

### Step 4: Testing (DONE)
- [x] Health endpoint: `/api/v1/health`
- [x] Admin login: `admin@bariq.sa / Admin@123`
- [x] Merchant login: `owner@albaraka.sa / Owner@123`
- [x] Public endpoints working

### Step 5: Frontend Implementation (DONE)
- [x] React + Vite + Tailwind CSS v4 setup
- [x] Customer Portal with RTL Arabic support
- [x] Merchant Portal with dashboard
- [x] Admin Portal structure
- [x] Authentication context and protected routes

### Step 6: New Features (December 22, 2024) (DONE)
- [x] **Customer Username/Password Login** - Customers can now login with username/password after initial Nafath registration
- [x] **Bariq ID System** - Each customer gets a unique 6-digit Bariq ID for merchant lookups
- [x] **Merchant Customer Lookup by Bariq ID** - Merchants search customers by Bariq ID instead of National ID
- [x] **Transaction Confirmation System** - Customers must confirm pending transactions via app notification
- [x] **Points Display System** - UI shows "points" instead of "SAR" (1 point = 1 SAR)
- [x] **Fixed API Route Paths** - Frontend now uses correct `/merchants/me/...` paths

---

## How to Run:

### Backend (Flask):
```bash
cd ~/Desktop/bariq
source venv/bin/activate
flask run --port 5001
```

### Frontend (React):
```bash
cd ~/Desktop/bariq/frontend
npm run dev
```

**Servers:**
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

---

## Test Accounts:

| Role | Login | Password | Notes |
|------|-------|----------|-------|
| **Customer** | `ahmed_ali` | `Customer@123` | Bariq ID: `123456`, 2,500 points |
| **Merchant Owner** | `owner@albaraka.sa` | `Owner@123` | Al-Baraka Supermarket |
| **Merchant Cashier** | `cashier@albaraka.sa` | `Cashier@123` | Al-Baraka Branch |
| **Admin** | `admin@bariq.sa` | `Admin@123` | Full admin access |

---

## New Flow Summary:

### Customer Registration & Login:
1. New customer registers via Nafath (first time only)
2. After verification, customer creates username/password
3. Customer receives unique 6-digit **Bariq ID**
4. Future logins use username/password

### Merchant Transaction Flow:
1. Customer provides their **Bariq ID** to merchant
2. Merchant enters Bariq ID to look up customer
3. System shows customer name, status, and available points
4. Merchant creates transaction with items
5. Customer receives notification to confirm
6. Customer confirms in their app
7. Points are deducted from customer's balance

### Points System:
- 1 Point = 1 SAR (Saudi Riyal)
- Displayed as "points" throughout the UI
- Clear indication: "1 point = 1 SAR"

---

## API Endpoints Summary:

### Authentication:
- `POST /api/v1/auth/customer/login` - Customer username/password login
- `POST /api/v1/auth/merchant/login` - Merchant login
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/nafath/initiate` - Start Nafath registration
- `POST /api/v1/auth/nafath/verify` - Complete Nafath registration
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Customer:
- `GET /api/v1/customers/me` - Get profile
- `GET /api/v1/customers/me/credit` - Get credit/points details
- `GET /api/v1/customers/me/transactions` - Get transactions
- `POST /api/v1/customers/me/transactions/:id/confirm` - Confirm pending transaction
- `GET /api/v1/customers/me/notifications` - Get notifications

### Merchant:
- `GET /api/v1/merchants/customers/lookup/:bariq_id` - Look up customer by Bariq ID
- `POST /api/v1/merchants/me/transactions` - Create new transaction
- `GET /api/v1/merchants/me/transactions` - Get transactions
- `GET /api/v1/merchants/me/branches` - Get branches
- `GET /api/v1/merchants/me/staff` - Get staff
- `POST /api/v1/merchants/me/staff` - Add staff member

### Admin:
- `/api/v1/admin/...` - Admin management endpoints

### Public:
- `GET /api/v1/public/cities` - Get cities list
- `GET /api/v1/public/business-types` - Get business types

---

## Key Files:

### Backend:
- `app/models/customer.py` - Customer model with bariq_id, username, password
- `app/services/auth_service.py` - Authentication including customer login
- `app/services/transaction_service.py` - Transaction creation with Bariq ID
- `app/api/v1/merchants/__init__.py` - Merchant routes including customer lookup
- `scripts/seed_data.py` - Database seeding script

### Frontend:
- `frontend/src/services/api.js` - API service with all endpoints
- `frontend/src/context/AuthContext.jsx` - Authentication context
- `frontend/src/pages/customer/CustomerDashboard.jsx` - Customer dashboard with pending confirmations
- `frontend/src/pages/merchant/NewTransactionPage.jsx` - New transaction with Bariq ID lookup

---

## Database:
- SQLite for development: `instance/bariq_dev.db`
- PostgreSQL for production (update DATABASE_URL in .env)

### New Customer Fields:
- `bariq_id` - 6-digit unique identifier
- `username` - Login username
- `password_hash` - Hashed password

---

## Next Steps (Optional Enhancements):
- [ ] Add unit tests with pytest
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Set up Redis for rate limiting
- [ ] Integrate real Nafath API
- [ ] Add SMS/Email notifications (real integration)
- [ ] Set up Celery for background tasks
- [ ] Deploy to production server
- [ ] Add real-time notifications (WebSocket)
- [ ] Customer app push notifications
