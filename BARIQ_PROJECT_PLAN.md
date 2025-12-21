# بريق اليسر - Bariq Al-Yusr
## Complete Project Plan & Technical Documentation

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Design](#3-database-design)
4. [API Endpoints](#4-api-endpoints)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Business Logic & Rules](#6-business-logic--rules)
7. [UI/UX Design Guidelines](#7-uiux-design-guidelines)
8. [Color Scheme & Branding](#8-color-scheme--branding)
9. [Page Structures](#9-page-structures)
10. [Project File Structure](#10-project-file-structure)
11. [Implementation Phases](#11-implementation-phases)
12. [Security Considerations](#12-security-considerations)

---

# 1. Project Overview

## 1.1 What is Bariq Al-Yusr?

**بريق اليسر** (Bariq Al-Yusr) is a Sharia-compliant Buy Now Pay Later (BNPL) platform specifically designed for **essential goods** in Saudi Arabia.

### Core Concept:
- Customer registers via **Nafath** (Saudi national identity)
- Gets a **credit limit** (سُلفة) for purchasing
- Buys **real goods only** from **approved merchants**
- Pays back the **exact same amount** within **10 days**
- **NO interest, NO fees, NO penalties**

### What Makes It Different:
| Traditional BNPL | Bariq Al-Yusr |
|------------------|---------------|
| Focuses on luxury/consumer goods | Focuses on **essential goods** (groceries, necessities) |
| Charges interest or fees | **Zero interest, zero fees** |
| Long repayment periods | Short **10-day** repayment |
| May not be Sharia-compliant | **Fully Sharia-compliant** |
| Gives cash | Only enables **real purchases** |

### Revenue Model:
1. **Commission from merchants** on each transaction
2. **Subscription plans** for merchants (premium features)
3. **Optional services** for customers (notifications, reports)

---

## 1.2 System Users

### A. Customers (العملاء)
- End users who buy from stores
- Register via Nafath
- Get credit limit
- Make purchases and repay

### B. Merchants (المتاجر)
Hierarchical structure:
```
Merchant (المتجر الرئيسي)
├── Regions (المناطق)
│   ├── Branches (الفروع)
│   │   ├── Branch Manager (مدير الفرع)
│   │   └── Cashiers (كاشير)
│   └── Region Manager (مدير المنطقة)
└── General Manager (المدير العام)
```

### C. Admin Staff (فريق الإدارة)
- **Super Admin**: Full system control
- **Accountant**: Financial settlements
- **Sales Team**: Merchant acquisition
- **Customer Support**: Handle tickets
- **Collections**: Handle late payments (future)

---

## 1.3 Core User Journeys

### Customer Journey:
```
1. Register via Nafath
2. Get credit limit assigned
3. Visit approved store
4. Cashier creates invoice
5. Customer confirms payment via app/QR
6. Amount deducted from credit limit
7. Customer receives goods
8. After 10 days, customer pays back
9. Credit limit restored
```

### Merchant Journey:
```
1. Register merchant account
2. Submit business documents
3. Admin approves merchant
4. Set up regions/branches/staff
5. Start accepting Bariq payments
6. View daily transactions
7. Receive settlements periodically
```

### Settlement Cycle:
```
1. Transactions accumulate per branch
2. Settlement period closes (e.g., weekly)
3. System calculates: Total - Commission = Net
4. Admin reviews and approves
5. Transfer to merchant bank account
6. Settlement marked as completed
```

---

# 2. Tech Stack

## 2.1 Backend Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Flask | 3.0+ |
| **ORM** | Flask-SQLAlchemy | 3.1+ |
| **Database** | PostgreSQL | 15+ |
| **Migrations** | Flask-Migrate (Alembic) | 4.0+ |
| **Authentication** | Flask-JWT-Extended | 4.6+ |
| **Validation** | Marshmallow | 3.20+ |
| **CORS** | Flask-CORS | 4.0+ |
| **Rate Limiting** | Flask-Limiter | 3.5+ |
| **Caching** | Redis + Flask-Caching | - |
| **Task Queue** | Celery + Redis | 5.3+ |
| **API Docs** | Flask-RESTX or Flasgger | - |
| **Testing** | Pytest | 7.4+ |

## 2.2 Frontend Stack (Dashboards)

| Component | Technology |
|-----------|------------|
| **Framework** | React 18 or Next.js 14 |
| **UI Library** | Tailwind CSS + Headless UI |
| **State Management** | React Query + Zustand |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts or Chart.js |
| **Tables** | TanStack Table |
| **Icons** | Heroicons or Lucide |
| **RTL Support** | Built-in Tailwind RTL |

## 2.3 Infrastructure

| Component | Technology |
|-----------|------------|
| **Web Server** | Gunicorn + Nginx |
| **Containerization** | Docker + Docker Compose |
| **Cloud** | AWS (Saudi Region) or local |
| **File Storage** | AWS S3 or MinIO |
| **Email** | AWS SES or SendGrid |
| **SMS** | Twilio or local provider |

---

# 3. Database Design

## 3.1 Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Customer  │────<│ Transaction │>────│   Branch    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CreditLimit │     │   Payment   │     │   Region    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Settlement  │     │  Merchant   │
                    └─────────────┘     └─────────────┘
```

## 3.2 Complete Database Schema

### Table: customers
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Nafath Data
    national_id VARCHAR(10) UNIQUE NOT NULL,
    nafath_id VARCHAR(100) UNIQUE,

    -- Personal Info
    full_name_ar VARCHAR(200) NOT NULL,
    full_name_en VARCHAR(200),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10), -- male, female

    -- Address
    city VARCHAR(100),
    district VARCHAR(100),
    address_line TEXT,

    -- Account Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, blocked
    status_reason TEXT,

    -- Credit Info
    credit_limit DECIMAL(10,2) DEFAULT 0,
    available_credit DECIMAL(10,2) DEFAULT 0,
    used_credit DECIMAL(10,2) DEFAULT 0,

    -- Settings
    language VARCHAR(5) DEFAULT 'ar',
    notifications_enabled BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    verified_at TIMESTAMP,

    -- Indexes
    CONSTRAINT chk_status CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
    CONSTRAINT chk_gender CHECK (gender IN ('male', 'female'))
);

CREATE INDEX idx_customers_national_id ON customers(national_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
```

### Table: merchants
```sql
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Business Info
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    commercial_registration VARCHAR(50) UNIQUE NOT NULL,
    tax_number VARCHAR(50),
    business_type VARCHAR(50), -- grocery, supermarket, pharmacy, etc.

    -- Contact Info
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    website VARCHAR(255),

    -- Address (HQ)
    city VARCHAR(100),
    district VARCHAR(100),
    address_line TEXT,

    -- Bank Info
    bank_name VARCHAR(100),
    iban VARCHAR(34),
    account_holder_name VARCHAR(200),

    -- Commission Settings
    commission_rate DECIMAL(5,2) DEFAULT 2.50, -- percentage

    -- Contract Info
    contract_start_date DATE,
    contract_end_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, terminated
    status_reason TEXT,
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMP,

    -- Subscription/Plan
    plan_type VARCHAR(20) DEFAULT 'basic', -- basic, premium, enterprise

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_merchant_status CHECK (status IN ('pending', 'active', 'suspended', 'terminated'))
);

CREATE INDEX idx_merchants_cr ON merchants(commercial_registration);
CREATE INDEX idx_merchants_status ON merchants(status);
```

### Table: regions
```sql
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,

    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Coverage
    city VARCHAR(100),
    area_description TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(merchant_id, name_ar)
);

CREATE INDEX idx_regions_merchant ON regions(merchant_id);
```

### Table: branches
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

    -- Branch Info
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(20), -- internal branch code

    -- Location
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    address_line TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),

    -- Operating Hours (JSON)
    operating_hours JSONB DEFAULT '{}',

    -- Settlement Settings
    settlement_cycle VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, biweekly, monthly

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(merchant_id, code)
);

CREATE INDEX idx_branches_merchant ON branches(merchant_id);
CREATE INDEX idx_branches_region ON branches(region_id);
CREATE INDEX idx_branches_location ON branches(city, district);
```

### Table: merchant_users
```sql
CREATE TABLE merchant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,

    -- Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Personal Info
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    national_id VARCHAR(10),

    -- Role
    role VARCHAR(30) NOT NULL, -- owner, general_manager, region_manager, branch_manager, cashier

    -- Permissions (JSON array)
    permissions JSONB DEFAULT '[]',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT chk_merchant_user_role CHECK (role IN ('owner', 'general_manager', 'region_manager', 'branch_manager', 'cashier'))
);

CREATE INDEX idx_merchant_users_merchant ON merchant_users(merchant_id);
CREATE INDEX idx_merchant_users_branch ON merchant_users(branch_id);
CREATE INDEX idx_merchant_users_role ON merchant_users(role);
```

### Table: admin_users
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Personal Info
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),

    -- Role
    role VARCHAR(30) NOT NULL, -- super_admin, accountant, sales, support, collections

    -- Department
    department VARCHAR(50),

    -- Permissions (JSON array)
    permissions JSONB DEFAULT '[]',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT chk_admin_role CHECK (role IN ('super_admin', 'accountant', 'sales', 'support', 'collections'))
);
```

### Table: transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    reference_number VARCHAR(20) UNIQUE NOT NULL, -- BRQ-2024-XXXXX

    -- Parties
    customer_id UUID NOT NULL REFERENCES customers(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    cashier_id UUID REFERENCES merchant_users(id),

    -- Amount
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Items (JSON array)
    items JSONB DEFAULT '[]',
    -- Example: [{"name": "Item 1", "qty": 2, "price": 50.00}, ...]

    -- Dates
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL, -- transaction_date + 10 days

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending: waiting customer confirmation
    -- confirmed: customer confirmed, goods delivered
    -- paid: customer paid back
    -- overdue: past due date, not paid
    -- cancelled: cancelled before completion
    -- refunded: fully refunded

    -- Payment Info
    paid_amount DECIMAL(10,2) DEFAULT 0,
    paid_at TIMESTAMP,

    -- Return Info
    returned_amount DECIMAL(10,2) DEFAULT 0,

    -- Settlement
    settlement_id UUID REFERENCES settlements(id),

    -- Notes
    notes TEXT,
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_transaction_status CHECK (status IN ('pending', 'confirmed', 'paid', 'overdue', 'cancelled', 'refunded'))
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX idx_transactions_branch ON transactions(branch_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
```

### Table: transaction_returns
```sql
CREATE TABLE transaction_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),

    -- Return Info
    return_amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    -- damaged, wrong_item, customer_changed_mind, defective, other
    reason_details TEXT,

    -- Items Returned (JSON)
    returned_items JSONB DEFAULT '[]',

    -- Processed By
    processed_by UUID REFERENCES merchant_users(id),

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,

    CONSTRAINT chk_return_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_returns_transaction ON transaction_returns(transaction_id);
```

### Table: payments
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    reference_number VARCHAR(20) UNIQUE NOT NULL, -- PAY-2024-XXXXX

    -- Transaction
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Amount
    amount DECIMAL(10,2) NOT NULL,

    -- Payment Method
    payment_method VARCHAR(30), -- bank_transfer, card, wallet, cash

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded

    -- External Reference (from payment gateway)
    external_reference VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
```

### Table: settlements
```sql
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    reference_number VARCHAR(20) UNIQUE NOT NULL, -- STL-2024-XXXXX

    -- Merchant/Branch
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Amounts
    gross_amount DECIMAL(12,2) NOT NULL, -- total transactions
    returns_amount DECIMAL(12,2) DEFAULT 0, -- total returns
    commission_amount DECIMAL(12,2) NOT NULL, -- our commission
    net_amount DECIMAL(12,2) NOT NULL, -- amount to transfer

    -- Transaction Count
    transaction_count INT DEFAULT 0,
    return_count INT DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'open',
    -- open: still collecting transactions
    -- closed: period ended, pending review
    -- approved: reviewed and approved
    -- transferred: money sent
    -- completed: confirmed received

    -- Bank Transfer Info
    transfer_reference VARCHAR(100),
    transferred_at TIMESTAMP,

    -- Approval
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_settlement_status CHECK (status IN ('open', 'closed', 'approved', 'transferred', 'completed'))
);

CREATE INDEX idx_settlements_merchant ON settlements(merchant_id);
CREATE INDEX idx_settlements_branch ON settlements(branch_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_period ON settlements(period_start, period_end);
```

### Table: credit_limit_requests
```sql
CREATE TABLE credit_limit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Request
    current_limit DECIMAL(10,2) NOT NULL,
    requested_limit DECIMAL(10,2) NOT NULL,
    reason TEXT,

    -- Decision
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_limit DECIMAL(10,2),
    decision_reason TEXT,
    decided_by UUID REFERENCES admin_users(id),
    decided_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_credit_request_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_credit_requests_customer ON credit_limit_requests(customer_id);
CREATE INDEX idx_credit_requests_status ON credit_limit_requests(status);
```

### Table: support_tickets
```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- TKT-2024-XXXXX

    -- Requester (one of these)
    customer_id UUID REFERENCES customers(id),
    merchant_user_id UUID REFERENCES merchant_users(id),

    -- Category
    category VARCHAR(50) NOT NULL,
    -- payment_issue, transaction_issue, account_issue, technical, complaint, inquiry, other

    -- Content
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    -- Related Entities
    related_transaction_id UUID REFERENCES transactions(id),

    -- Priority
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

    -- Status
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, waiting_customer, resolved, closed

    -- Assignment
    assigned_to UUID REFERENCES admin_users(id),

    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_ticket_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT chk_ticket_status CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed'))
);

CREATE INDEX idx_tickets_customer ON support_tickets(customer_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
```

### Table: support_ticket_messages
```sql
CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

    -- Sender (one of these)
    sender_type VARCHAR(20) NOT NULL, -- customer, merchant, admin
    customer_id UUID REFERENCES customers(id),
    merchant_user_id UUID REFERENCES merchant_users(id),
    admin_user_id UUID REFERENCES admin_users(id),

    -- Content
    message TEXT NOT NULL,

    -- Attachments (JSON array of URLs)
    attachments JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_message_sender CHECK (sender_type IN ('customer', 'merchant', 'admin'))
);

CREATE INDEX idx_ticket_messages_ticket ON support_ticket_messages(ticket_id);
```

### Table: notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recipient (one of these)
    customer_id UUID REFERENCES customers(id),
    merchant_user_id UUID REFERENCES merchant_users(id),
    admin_user_id UUID REFERENCES admin_users(id),

    -- Content
    title_ar VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    body_ar TEXT NOT NULL,
    body_en TEXT,

    -- Type
    type VARCHAR(50) NOT NULL,
    -- transaction_confirmed, payment_reminder, payment_received,
    -- settlement_ready, account_update, promotion, system

    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Delivery
    sent_via JSONB DEFAULT '["in_app"]', -- in_app, sms, email, push

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_customer ON notifications(customer_id);
CREATE INDEX idx_notifications_merchant_user ON notifications(merchant_user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

### Table: audit_logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    actor_type VARCHAR(20) NOT NULL, -- customer, merchant_user, admin_user, system
    actor_id UUID,
    actor_email VARCHAR(255),
    actor_ip VARCHAR(45),

    -- Action
    action VARCHAR(100) NOT NULL,
    -- Examples: customer.created, transaction.confirmed, merchant.approved,
    -- settlement.transferred, user.login, user.logout, credit_limit.updated

    -- Target
    entity_type VARCHAR(50),
    entity_id UUID,

    -- Details
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

### Table: system_settings
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,

    -- Who can modify
    editable_by VARCHAR(20) DEFAULT 'super_admin',

    -- Timestamps
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES admin_users(id)
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
('default_credit_limit', '500', 'Default credit limit for new customers (SAR)'),
('max_credit_limit', '5000', 'Maximum credit limit (SAR)'),
('repayment_days', '10', 'Days until payment is due'),
('default_commission_rate', '2.5', 'Default merchant commission percentage'),
('min_transaction_amount', '10', 'Minimum transaction amount (SAR)'),
('max_transaction_amount', '2000', 'Maximum single transaction (SAR)');
```

### Table: promotions_banners
```sql
CREATE TABLE promotions_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content
    title_ar VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    description_ar TEXT,
    description_en TEXT,
    image_url VARCHAR(500),

    -- Link
    link_type VARCHAR(30), -- merchant, external, none
    link_merchant_id UUID REFERENCES merchants(id),
    link_url VARCHAR(500),

    -- Display
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- Schedule
    start_date TIMESTAMP,
    end_date TIMESTAMP,

    -- Target
    target_audience VARCHAR(20) DEFAULT 'all', -- all, new_customers, existing_customers

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: customer_ratings
```sql
CREATE TABLE customer_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- What's being rated
    transaction_id UUID REFERENCES transactions(id),
    merchant_id UUID REFERENCES merchants(id),
    branch_id UUID REFERENCES branches(id),

    -- Who's rating
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Rating
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(customer_id, transaction_id)
);

CREATE INDEX idx_ratings_merchant ON customer_ratings(merchant_id);
CREATE INDEX idx_ratings_branch ON customer_ratings(branch_id);
```

---

# 4. API Endpoints

## 4.1 API Structure Overview

Base URL: `https://api.bariq.sa/v1`

### Response Format (Standard)
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... },
    "meta": {
        "page": 1,
        "per_page": 20,
        "total": 100,
        "total_pages": 5
    }
}
```

### Error Response Format
```json
{
    "success": false,
    "message": "Error description",
    "error_code": "VALIDATION_ERROR",
    "errors": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ]
}
```

---

## 4.2 Authentication Endpoints

### Public Auth
```
POST   /auth/nafath/initiate
       Description: Start Nafath authentication
       Body: { "national_id": "1234567890" }
       Response: { "transaction_id": "xxx", "random_number": "12" }

POST   /auth/nafath/verify
       Description: Verify Nafath authentication
       Body: { "transaction_id": "xxx", "national_id": "1234567890" }
       Response: { "access_token": "xxx", "refresh_token": "xxx", "customer": {...} }

POST   /auth/merchant/login
       Description: Merchant user login
       Body: { "email": "...", "password": "..." }
       Response: { "access_token": "xxx", "refresh_token": "xxx", "user": {...} }

POST   /auth/admin/login
       Description: Admin user login
       Body: { "email": "...", "password": "..." }
       Response: { "access_token": "xxx", "refresh_token": "xxx", "user": {...} }

POST   /auth/refresh
       Description: Refresh access token
       Headers: Authorization: Bearer {refresh_token}
       Response: { "access_token": "xxx" }

POST   /auth/logout
       Description: Logout and invalidate tokens
       Headers: Authorization: Bearer {access_token}
       Response: { "message": "Logged out successfully" }

POST   /auth/forgot-password
       Description: Request password reset
       Body: { "email": "..." }
       Response: { "message": "Reset link sent" }

POST   /auth/reset-password
       Description: Reset password with token
       Body: { "token": "...", "password": "...", "password_confirmation": "..." }
       Response: { "message": "Password reset successfully" }
```

---

## 4.3 Customer Endpoints

### Profile
```
GET    /customers/me
       Description: Get current customer profile
       Response: {
           "id": "uuid",
           "national_id": "1234567890",
           "full_name_ar": "محمد أحمد",
           "phone": "+966501234567",
           "email": "...",
           "status": "active",
           "credit_limit": 1000.00,
           "available_credit": 750.00,
           "used_credit": 250.00,
           "created_at": "..."
       }

PUT    /customers/me
       Description: Update customer profile
       Body: { "email": "...", "phone": "...", "city": "...", "language": "ar" }
       Response: { "customer": {...} }

PUT    /customers/me/notifications
       Description: Update notification preferences
       Body: { "notifications_enabled": true, "sms_enabled": true, "email_enabled": false }
```

### Credit
```
GET    /customers/me/credit
       Description: Get credit details
       Response: {
           "credit_limit": 1000.00,
           "available_credit": 750.00,
           "used_credit": 250.00,
           "pending_transactions": 1,
           "pending_amount": 250.00
       }

POST   /customers/me/credit/request-increase
       Description: Request credit limit increase
       Body: { "requested_amount": 1500, "reason": "..." }
       Response: { "request_id": "uuid", "status": "pending" }

GET    /customers/me/credit/requests
       Description: Get credit increase request history
       Response: { "requests": [...] }
```

### Transactions
```
GET    /customers/me/transactions
       Description: Get customer transactions
       Query: ?status=confirmed&page=1&per_page=20&from_date=2024-01-01&to_date=2024-12-31
       Response: {
           "transactions": [
               {
                   "id": "uuid",
                   "reference_number": "BRQ-2024-00001",
                   "merchant": { "name_ar": "...", "name_en": "..." },
                   "branch": { "name_ar": "...", "city": "..." },
                   "total_amount": 250.00,
                   "due_date": "2024-01-15",
                   "status": "confirmed",
                   "items": [...],
                   "created_at": "..."
               }
           ],
           "meta": { "page": 1, "total": 50, ... }
       }

GET    /customers/me/transactions/:id
       Description: Get single transaction details
       Response: { "transaction": {...} }

POST   /customers/me/transactions/:id/confirm
       Description: Confirm a pending transaction
       Body: { "pin": "1234" } // optional security
       Response: { "transaction": {...}, "new_available_credit": 750.00 }
```

### Payments (Debt)
```
GET    /customers/me/debt
       Description: Get current debt summary
       Response: {
           "total_debt": 500.00,
           "transactions": [
               {
                   "id": "uuid",
                   "reference_number": "BRQ-2024-00001",
                   "amount": 250.00,
                   "paid_amount": 0,
                   "remaining": 250.00,
                   "due_date": "2024-01-15",
                   "days_until_due": 5,
                   "is_overdue": false
               }
           ]
       }

GET    /customers/me/payments
       Description: Get payment history
       Response: { "payments": [...] }

POST   /customers/me/payments
       Description: Make a payment
       Body: {
           "transaction_id": "uuid",
           "amount": 250.00,
           "payment_method": "bank_transfer"
       }
       Response: { "payment": {...}, "new_available_credit": 1000.00 }
```

### Stores (Merchants)
```
GET    /customers/stores
       Description: Get available stores for customer
       Query: ?city=Riyadh&lat=24.7136&lng=46.6753&radius=10&search=بندة
       Response: {
           "merchants": [
               {
                   "id": "uuid",
                   "name_ar": "بندة",
                   "name_en": "Panda",
                   "business_type": "supermarket",
                   "branches": [
                       {
                           "id": "uuid",
                           "name_ar": "فرع النخيل",
                           "city": "Riyadh",
                           "district": "Al Nakheel",
                           "distance_km": 2.5,
                           "latitude": 24.7136,
                           "longitude": 46.6753
                       }
                   ],
                   "rating": 4.5,
                   "total_ratings": 120
               }
           ]
       }

GET    /customers/stores/:id
       Description: Get store details
       Response: { "merchant": {...}, "branches": [...] }
```

### Ratings
```
POST   /customers/me/ratings
       Description: Rate a transaction/store
       Body: {
           "transaction_id": "uuid",
           "rating": 5,
           "comment": "خدمة ممتازة"
       }
       Response: { "rating": {...} }

GET    /customers/me/ratings
       Description: Get my ratings
       Response: { "ratings": [...] }
```

### Support
```
POST   /customers/me/support/tickets
       Description: Create support ticket
       Body: {
           "category": "transaction_issue",
           "subject": "مشكلة في العملية",
           "description": "...",
           "related_transaction_id": "uuid"
       }
       Response: { "ticket": {...} }

GET    /customers/me/support/tickets
       Description: Get my tickets
       Response: { "tickets": [...] }

GET    /customers/me/support/tickets/:id
       Description: Get ticket details with messages
       Response: { "ticket": {...}, "messages": [...] }

POST   /customers/me/support/tickets/:id/messages
       Description: Add message to ticket
       Body: { "message": "..." }
       Response: { "message": {...} }
```

### Notifications
```
GET    /customers/me/notifications
       Description: Get notifications
       Query: ?unread_only=true&page=1
       Response: { "notifications": [...], "unread_count": 5 }

PUT    /customers/me/notifications/:id/read
       Description: Mark notification as read
       Response: { "notification": {...} }

PUT    /customers/me/notifications/read-all
       Description: Mark all as read
       Response: { "message": "All notifications marked as read" }
```

### Promotions
```
GET    /customers/promotions
       Description: Get active promotions/banners
       Response: { "promotions": [...] }
```

---

## 4.4 Merchant Endpoints

### Registration & Profile
```
POST   /merchants/register
       Description: Register new merchant
       Body: {
           "name_ar": "اسم المتجر",
           "name_en": "Store Name",
           "commercial_registration": "1234567890",
           "tax_number": "...",
           "business_type": "supermarket",
           "email": "...",
           "phone": "...",
           "city": "Riyadh",
           "address_line": "...",
           "bank_name": "Al Rajhi",
           "iban": "SA...",
           "owner": {
               "full_name": "...",
               "email": "...",
               "phone": "...",
               "password": "..."
           }
       }
       Response: { "merchant": {...}, "message": "Pending approval" }

GET    /merchants/me
       Description: Get merchant profile
       Response: { "merchant": {...} }

PUT    /merchants/me
       Description: Update merchant profile
       Body: { "phone": "...", "website": "..." }
       Response: { "merchant": {...} }
```

### Regions Management
```
GET    /merchants/me/regions
       Description: Get all regions
       Response: { "regions": [...] }

POST   /merchants/me/regions
       Description: Create region
       Body: { "name_ar": "المنطقة الوسطى", "name_en": "Central Region", "city": "Riyadh" }
       Response: { "region": {...} }

PUT    /merchants/me/regions/:id
       Description: Update region
       Body: { "name_ar": "...", "is_active": true }
       Response: { "region": {...} }

DELETE /merchants/me/regions/:id
       Description: Delete region (if no branches)
       Response: { "message": "Region deleted" }
```

### Branches Management
```
GET    /merchants/me/branches
       Description: Get all branches
       Query: ?region_id=uuid&is_active=true
       Response: { "branches": [...] }

POST   /merchants/me/branches
       Description: Create branch
       Body: {
           "region_id": "uuid",
           "name_ar": "فرع النخيل",
           "name_en": "Al Nakheel Branch",
           "code": "RYD-001",
           "city": "Riyadh",
           "district": "Al Nakheel",
           "address_line": "...",
           "latitude": 24.7136,
           "longitude": 46.6753,
           "phone": "...",
           "operating_hours": {
               "sunday": { "open": "08:00", "close": "23:00" },
               "monday": { "open": "08:00", "close": "23:00" },
               ...
           }
       }
       Response: { "branch": {...} }

GET    /merchants/me/branches/:id
       Description: Get branch details
       Response: { "branch": {...} }

PUT    /merchants/me/branches/:id
       Description: Update branch
       Body: { "name_ar": "...", "is_active": true, ... }
       Response: { "branch": {...} }

DELETE /merchants/me/branches/:id
       Description: Deactivate branch
       Response: { "message": "Branch deactivated" }
```

### Staff Management
```
GET    /merchants/me/staff
       Description: Get all staff
       Query: ?role=cashier&branch_id=uuid&is_active=true
       Response: { "staff": [...] }

POST   /merchants/me/staff
       Description: Add staff member
       Body: {
           "full_name": "...",
           "email": "...",
           "phone": "...",
           "password": "...",
           "role": "cashier",
           "branch_id": "uuid",
           "permissions": ["create_invoice", "view_transactions"]
       }
       Response: { "staff": {...} }

GET    /merchants/me/staff/:id
       Description: Get staff details
       Response: { "staff": {...} }

PUT    /merchants/me/staff/:id
       Description: Update staff
       Body: { "role": "branch_manager", "branch_id": "uuid", "is_active": true }
       Response: { "staff": {...} }

DELETE /merchants/me/staff/:id
       Description: Deactivate staff
       Response: { "message": "Staff deactivated" }
```

### Transactions (Invoices)
```
POST   /merchants/me/transactions
       Description: Create new transaction/invoice
       Body: {
           "branch_id": "uuid",
           "customer_national_id": "1234567890",
           "items": [
               { "name": "حليب", "quantity": 2, "price": 8.50 },
               { "name": "خبز", "quantity": 1, "price": 3.00 }
           ],
           "discount": 0,
           "notes": "..."
       }
       Response: {
           "transaction": {
               "id": "uuid",
               "reference_number": "BRQ-2024-00001",
               "total_amount": 20.00,
               "due_date": "2024-01-25",
               "status": "pending",
               "customer": { "full_name_ar": "...", "available_credit": 980.00 },
               "qr_code": "base64...", // for customer to scan
               ...
           }
       }

GET    /merchants/me/transactions
       Description: Get transactions
       Query: ?branch_id=uuid&status=confirmed&from_date=...&to_date=...&page=1
       Response: { "transactions": [...], "summary": { "total_amount": 5000, "count": 25 } }

GET    /merchants/me/transactions/:id
       Description: Get transaction details
       Response: { "transaction": {...} }

POST   /merchants/me/transactions/:id/cancel
       Description: Cancel pending transaction
       Body: { "reason": "Customer cancelled" }
       Response: { "transaction": {...} }
```

### Returns
```
POST   /merchants/me/transactions/:id/returns
       Description: Process return
       Body: {
           "return_amount": 8.50,
           "reason": "damaged",
           "reason_details": "المنتج تالف",
           "returned_items": [
               { "name": "حليب", "quantity": 1, "price": 8.50 }
           ]
       }
       Response: { "return": {...}, "transaction": {...} }

GET    /merchants/me/returns
       Description: Get all returns
       Query: ?branch_id=uuid&from_date=...&to_date=...
       Response: { "returns": [...] }
```

### Reports & Analytics
```
GET    /merchants/me/reports/summary
       Description: Get summary dashboard
       Query: ?from_date=...&to_date=...&branch_id=uuid
       Response: {
           "total_transactions": 150,
           "total_amount": 25000.00,
           "total_returns": 5,
           "returns_amount": 500.00,
           "net_amount": 24500.00,
           "average_transaction": 166.67,
           "unique_customers": 85
       }

GET    /merchants/me/reports/transactions
       Description: Detailed transaction report
       Query: ?from_date=...&to_date=...&branch_id=uuid&group_by=day
       Response: {
           "data": [
               { "date": "2024-01-15", "count": 25, "amount": 3500.00 },
               { "date": "2024-01-16", "count": 30, "amount": 4200.00 },
               ...
           ]
       }

GET    /merchants/me/reports/branches
       Description: Branch performance comparison
       Response: {
           "branches": [
               {
                   "branch": { "id": "...", "name_ar": "..." },
                   "transactions": 50,
                   "amount": 8000.00,
                   "returns": 2,
                   "average_rating": 4.5
               },
               ...
           ]
       }

GET    /merchants/me/reports/cashiers
       Description: Cashier performance
       Query: ?branch_id=uuid&from_date=...&to_date=...
       Response: {
           "cashiers": [
               {
                   "cashier": { "id": "...", "full_name": "..." },
                   "transactions": 30,
                   "amount": 5000.00,
                   "returns": 1
               },
               ...
           ]
       }

GET    /merchants/me/reports/peak-hours
       Description: Peak hours analysis
       Query: ?branch_id=uuid
       Response: {
           "hourly": [
               { "hour": 9, "transactions": 5, "amount": 750.00 },
               { "hour": 10, "transactions": 12, "amount": 1800.00 },
               ...
           ],
           "peak_hour": 18,
           "peak_day": "friday"
       }
```

### Settlements
```
GET    /merchants/me/settlements
       Description: Get settlements
       Query: ?status=completed&branch_id=uuid&page=1
       Response: { "settlements": [...] }

GET    /merchants/me/settlements/:id
       Description: Get settlement details
       Response: {
           "settlement": {
               "id": "uuid",
               "reference_number": "STL-2024-00001",
               "period_start": "2024-01-01",
               "period_end": "2024-01-07",
               "gross_amount": 10000.00,
               "returns_amount": 200.00,
               "commission_amount": 245.00,
               "net_amount": 9555.00,
               "status": "transferred",
               "transactions": [...] // list of included transactions
           }
       }

GET    /merchants/me/settlements/:id/statement
       Description: Download settlement statement (PDF)
       Response: PDF file
```

### Support
```
POST   /merchants/me/support/tickets
       Description: Create support ticket
       Body: { "category": "...", "subject": "...", "description": "..." }
       Response: { "ticket": {...} }

GET    /merchants/me/support/tickets
       Response: { "tickets": [...] }

GET    /merchants/me/support/tickets/:id
       Response: { "ticket": {...}, "messages": [...] }

POST   /merchants/me/support/tickets/:id/messages
       Body: { "message": "..." }
       Response: { "message": {...} }
```

### Notifications
```
GET    /merchants/me/notifications
       Response: { "notifications": [...] }

PUT    /merchants/me/notifications/:id/read
       Response: { "notification": {...} }
```

---

## 4.5 Admin Endpoints

### Dashboard
```
GET    /admin/dashboard
       Description: Executive dashboard
       Response: {
           "customers": {
               "total": 5000,
               "active": 4500,
               "new_today": 25,
               "new_this_week": 150
           },
           "merchants": {
               "total": 100,
               "active": 95,
               "pending_approval": 5,
               "total_branches": 350
           },
           "transactions": {
               "today": { "count": 500, "amount": 75000.00 },
               "this_week": { "count": 3200, "amount": 480000.00 },
               "this_month": { "count": 12000, "amount": 1800000.00 }
           },
           "payments": {
               "on_time_rate": 92.5,
               "overdue_count": 150,
               "overdue_amount": 45000.00
           },
           "revenue": {
               "today": 1875.00,
               "this_week": 12000.00,
               "this_month": 45000.00
           }
       }

GET    /admin/dashboard/charts/transactions
       Description: Transaction trends
       Query: ?period=30days
       Response: { "data": [...] }

GET    /admin/dashboard/charts/revenue
       Description: Revenue trends
       Query: ?period=30days
       Response: { "data": [...] }
```

### Customer Management
```
GET    /admin/customers
       Description: List all customers
       Query: ?status=active&search=محمد&city=Riyadh&page=1&per_page=20
       Response: { "customers": [...], "meta": {...} }

GET    /admin/customers/:id
       Description: Get customer details
       Response: {
           "customer": {...},
           "statistics": {
               "total_transactions": 25,
               "total_spent": 5000.00,
               "total_paid": 4500.00,
               "outstanding": 500.00,
               "on_time_payments": 23,
               "late_payments": 2
           }
       }

PUT    /admin/customers/:id
       Description: Update customer
       Body: { "status": "suspended", "status_reason": "..." }
       Response: { "customer": {...} }

PUT    /admin/customers/:id/credit-limit
       Description: Update credit limit
       Body: { "credit_limit": 1500, "reason": "Good payment history" }
       Response: { "customer": {...} }

GET    /admin/customers/:id/transactions
       Description: Customer transaction history
       Response: { "transactions": [...] }

GET    /admin/customers/:id/payments
       Description: Customer payment history
       Response: { "payments": [...] }
```

### Credit Limit Requests
```
GET    /admin/credit-requests
       Description: List credit increase requests
       Query: ?status=pending&page=1
       Response: { "requests": [...] }

GET    /admin/credit-requests/:id
       Description: Get request details
       Response: { "request": {...}, "customer": {...}, "statistics": {...} }

PUT    /admin/credit-requests/:id/approve
       Description: Approve request
       Body: { "approved_limit": 1500, "reason": "..." }
       Response: { "request": {...} }

PUT    /admin/credit-requests/:id/reject
       Description: Reject request
       Body: { "reason": "..." }
       Response: { "request": {...} }
```

### Merchant Management
```
GET    /admin/merchants
       Description: List all merchants
       Query: ?status=pending&business_type=supermarket&search=...&page=1
       Response: { "merchants": [...], "meta": {...} }

GET    /admin/merchants/:id
       Description: Get merchant details
       Response: {
           "merchant": {...},
           "statistics": {
               "total_transactions": 1500,
               "total_amount": 250000.00,
               "total_commission": 6250.00,
               "active_branches": 15,
               "total_customers": 500
           },
           "regions": [...],
           "branches": [...]
       }

PUT    /admin/merchants/:id
       Description: Update merchant
       Body: { "status": "active", "commission_rate": 2.5 }
       Response: { "merchant": {...} }

PUT    /admin/merchants/:id/approve
       Description: Approve pending merchant
       Body: { "commission_rate": 2.5 }
       Response: { "merchant": {...} }

PUT    /admin/merchants/:id/suspend
       Description: Suspend merchant
       Body: { "reason": "..." }
       Response: { "merchant": {...} }

GET    /admin/merchants/:id/transactions
       Response: { "transactions": [...] }

GET    /admin/merchants/:id/settlements
       Response: { "settlements": [...] }
```

### Transaction Management
```
GET    /admin/transactions
       Description: List all transactions
       Query: ?status=overdue&merchant_id=...&from_date=...&to_date=...&page=1
       Response: { "transactions": [...], "meta": {...} }

GET    /admin/transactions/:id
       Description: Get transaction details
       Response: { "transaction": {...} }

GET    /admin/transactions/overdue
       Description: Get overdue transactions
       Response: {
           "transactions": [...],
           "summary": {
               "total_count": 150,
               "total_amount": 45000.00,
               "by_days_overdue": {
                   "1-7": { "count": 80, "amount": 24000.00 },
                   "8-14": { "count": 40, "amount": 12000.00 },
                   "15-30": { "count": 20, "amount": 6000.00 },
                   "30+": { "count": 10, "amount": 3000.00 }
               }
           }
       }
```

### Settlement Management
```
GET    /admin/settlements
       Description: List all settlements
       Query: ?status=closed&merchant_id=...&page=1
       Response: { "settlements": [...] }

GET    /admin/settlements/:id
       Description: Get settlement details
       Response: { "settlement": {...}, "transactions": [...] }

PUT    /admin/settlements/:id/approve
       Description: Approve settlement
       Response: { "settlement": {...} }

PUT    /admin/settlements/:id/transfer
       Description: Mark as transferred
       Body: { "transfer_reference": "BANK-REF-123" }
       Response: { "settlement": {...} }

POST   /admin/settlements/close-period
       Description: Close settlement period for all branches
       Body: { "period_end_date": "2024-01-31" }
       Response: { "closed_settlements": [...] }
```

### Admin Staff Management
```
GET    /admin/staff
       Description: List admin staff
       Response: { "staff": [...] }

POST   /admin/staff
       Description: Add admin staff
       Body: {
           "full_name": "...",
           "email": "...",
           "phone": "...",
           "password": "...",
           "role": "support",
           "department": "Customer Service",
           "permissions": [...]
       }
       Response: { "staff": {...} }

GET    /admin/staff/:id
       Response: { "staff": {...} }

PUT    /admin/staff/:id
       Body: { "role": "...", "permissions": [...], "is_active": true }
       Response: { "staff": {...} }

DELETE /admin/staff/:id
       Response: { "message": "Staff deactivated" }
```

### Support Tickets
```
GET    /admin/support/tickets
       Description: List all tickets
       Query: ?status=open&priority=high&category=...&assigned_to=...&page=1
       Response: { "tickets": [...] }

GET    /admin/support/tickets/:id
       Response: { "ticket": {...}, "messages": [...] }

PUT    /admin/support/tickets/:id
       Description: Update ticket
       Body: { "status": "in_progress", "assigned_to": "uuid", "priority": "high" }
       Response: { "ticket": {...} }

POST   /admin/support/tickets/:id/messages
       Body: { "message": "..." }
       Response: { "message": {...} }

PUT    /admin/support/tickets/:id/resolve
       Body: { "resolution": "..." }
       Response: { "ticket": {...} }
```

### Reports
```
GET    /admin/reports/overview
       Description: General overview report
       Query: ?from_date=...&to_date=...
       Response: { ... comprehensive stats ... }

GET    /admin/reports/financial
       Description: Financial report
       Query: ?from_date=...&to_date=...
       Response: {
           "revenue": {
               "total_commission": 45000.00,
               "by_merchant_type": {...}
           },
           "transactions": {...},
           "settlements": {...}
       }

GET    /admin/reports/risk
       Description: Risk report
       Response: {
           "overdue_summary": {...},
           "high_risk_customers": [...],
           "default_rate": 2.5
       }

GET    /admin/reports/growth
       Description: Growth metrics
       Response: {
           "customer_growth": {...},
           "merchant_growth": {...},
           "transaction_growth": {...}
       }

GET    /admin/reports/merchants
       Description: Merchant performance report
       Response: { "merchants": [...ranked by performance...] }

POST   /admin/reports/export
       Description: Export report
       Body: { "report_type": "financial", "format": "xlsx", "from_date": "...", "to_date": "..." }
       Response: { "download_url": "..." }
```

### Audit Logs
```
GET    /admin/audit-logs
       Description: View audit trail
       Query: ?actor_type=admin_user&action=merchant.approved&from_date=...&page=1
       Response: { "logs": [...] }

GET    /admin/audit-logs/:id
       Response: { "log": {...} }
```

### System Settings
```
GET    /admin/settings
       Description: Get all settings
       Response: { "settings": {...} }

PUT    /admin/settings/:key
       Description: Update setting
       Body: { "value": ... }
       Response: { "setting": {...} }
```

### Promotions/Banners
```
GET    /admin/promotions
       Response: { "promotions": [...] }

POST   /admin/promotions
       Body: {
           "title_ar": "...",
           "title_en": "...",
           "description_ar": "...",
           "image_url": "...",
           "link_type": "merchant",
           "link_merchant_id": "uuid",
           "start_date": "...",
           "end_date": "...",
           "target_audience": "all"
       }
       Response: { "promotion": {...} }

PUT    /admin/promotions/:id
       Response: { "promotion": {...} }

DELETE /admin/promotions/:id
       Response: { "message": "Deleted" }
```

### Notifications (Bulk)
```
POST   /admin/notifications/send
       Description: Send bulk notification
       Body: {
           "target": "all_customers", // or "specific", "merchant_users"
           "customer_ids": [...], // if specific
           "title_ar": "...",
           "body_ar": "...",
           "send_via": ["in_app", "sms"]
       }
       Response: { "sent_count": 5000 }
```

---

## 4.6 Public/Utility Endpoints

```
GET    /public/cities
       Description: Get list of Saudi cities
       Response: { "cities": ["Riyadh", "Jeddah", "Dammam", ...] }

GET    /public/business-types
       Description: Get merchant business types
       Response: { "types": [
           { "key": "supermarket", "name_ar": "سوبرماركت", "name_en": "Supermarket" },
           { "key": "grocery", "name_ar": "بقالة", "name_en": "Grocery" },
           ...
       ]}

GET    /health
       Description: API health check
       Response: { "status": "healthy", "timestamp": "..." }

GET    /version
       Description: API version
       Response: { "version": "1.0.0", "environment": "production" }
```

---

# 5. User Roles & Permissions

## 5.1 Customer Permissions
Customers have implicit permissions based on their account status:
- `active`: Full access to buy, pay, view history
- `pending`: Can only view profile, no transactions
- `suspended`: Read-only access
- `blocked`: No access

## 5.2 Merchant User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **owner** | Full access to everything |
| **general_manager** | All except billing/contract changes |
| **region_manager** | Manage branches/staff in their region |
| **branch_manager** | Manage staff and view reports for their branch |
| **cashier** | Create invoices, view own transactions |

### Permission List:
```python
MERCHANT_PERMISSIONS = [
    # Transactions
    "transaction.create",
    "transaction.view",
    "transaction.view_all",  # view other branches
    "transaction.cancel",

    # Returns
    "return.create",
    "return.view",
    "return.approve",

    # Staff
    "staff.view",
    "staff.create",
    "staff.update",
    "staff.delete",

    # Branches
    "branch.view",
    "branch.create",
    "branch.update",
    "branch.delete",

    # Regions
    "region.view",
    "region.create",
    "region.update",
    "region.delete",

    # Reports
    "report.view_branch",
    "report.view_region",
    "report.view_all",
    "report.export",

    # Settlements
    "settlement.view",

    # Settings
    "settings.view",
    "settings.update",
]
```

## 5.3 Admin User Roles & Permissions

| Role | Description | Access Level |
|------|-------------|--------------|
| **super_admin** | Full system control | Everything |
| **accountant** | Financial operations | Settlements, financial reports |
| **sales** | Merchant acquisition | Merchant management |
| **support** | Customer service | Tickets, customer viewing |
| **collections** | Debt collection | Overdue transactions, customer contact |

### Permission List:
```python
ADMIN_PERMISSIONS = [
    # Customers
    "customer.view",
    "customer.update",
    "customer.suspend",
    "customer.credit.update",

    # Merchants
    "merchant.view",
    "merchant.approve",
    "merchant.update",
    "merchant.suspend",

    # Transactions
    "transaction.view",

    # Settlements
    "settlement.view",
    "settlement.approve",
    "settlement.transfer",

    # Support
    "ticket.view",
    "ticket.assign",
    "ticket.respond",
    "ticket.resolve",

    # Reports
    "report.view",
    "report.export",

    # Admin Staff
    "staff.view",
    "staff.create",
    "staff.update",
    "staff.delete",

    # Settings
    "settings.view",
    "settings.update",

    # Audit
    "audit.view",

    # Promotions
    "promotion.view",
    "promotion.create",
    "promotion.update",
    "promotion.delete",

    # Notifications
    "notification.send_bulk",
]
```

---

# 6. Business Logic & Rules

## 6.1 Credit Limit Rules

```python
# Default credit limits
DEFAULT_CREDIT_LIMIT = 500  # SAR for new customers
MAX_CREDIT_LIMIT = 5000     # SAR maximum

# Credit limit increase eligibility
CREDIT_INCREASE_RULES = {
    "min_transactions": 5,           # Minimum completed transactions
    "min_on_time_payments": 80,      # Minimum % on-time payments
    "min_account_age_days": 30,      # Minimum account age
    "max_pending_requests": 1,       # Only 1 pending request at a time
    "cooldown_days": 30,             # Days between requests
}
```

## 6.2 Transaction Rules

```python
TRANSACTION_RULES = {
    "repayment_days": 10,            # Days until due
    "min_amount": 10,                # Minimum transaction SAR
    "max_amount": 2000,              # Maximum single transaction SAR
    "max_daily_transactions": 5,     # Per customer per day
    "max_daily_amount": 2000,        # Per customer per day SAR
}
```

## 6.3 Overdue/Late Payment Rules

```python
OVERDUE_RULES = {
    # Status changes
    "overdue_after_days": 0,         # Mark overdue immediately after due date

    # Notifications
    "reminder_before_days": [3, 1],  # Send reminder X days before due
    "reminder_after_days": [1, 3, 7, 14],  # Send reminder X days after due

    # Account restrictions
    "suspend_after_days": 14,        # Suspend account after X days overdue
    "block_after_days": 30,          # Block account after X days overdue

    # NO LATE FEES - This is a core principle
    "late_fees": False,
}
```

## 6.4 Settlement Rules

```python
SETTLEMENT_RULES = {
    "default_cycle": "weekly",       # weekly, biweekly, monthly
    "processing_days": 2,            # Days to process after period close
    "commission_rate_default": 2.5,  # Default commission %
    "commission_rate_min": 1.0,      # Minimum commission %
    "commission_rate_max": 5.0,      # Maximum commission %
}
```

## 6.5 Return Rules

```python
RETURN_RULES = {
    "max_return_days": 3,            # Days after transaction to allow return
    "requires_approval": True,       # Returns need manager approval
    "valid_reasons": [
        "damaged",
        "wrong_item",
        "defective",
        "customer_changed_mind",
        "other"
    ]
}
```

---

# 7. UI/UX Design Guidelines

## 7.1 Design Principles

1. **Simplicity First**: Clean, uncluttered interfaces
2. **Mobile-First**: All dashboards responsive
3. **RTL Support**: Full Arabic/RTL support
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Consistency**: Unified design language across all apps
6. **Speed**: Fast loading, optimistic UI updates

## 7.2 Typography

### Arabic Font
```css
font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
```

### English Font
```css
font-family: 'Inter', 'IBM Plex Sans', sans-serif;
```

### Font Sizes
```css
/* Tailwind scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## 7.3 Spacing System

```css
/* Tailwind default spacing */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
```

## 7.4 Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - buttons, inputs */
--radius-md: 0.5rem;   /* 8px - cards */
--radius-lg: 0.75rem;  /* 12px - modals */
--radius-xl: 1rem;     /* 16px - large cards */
--radius-full: 9999px; /* pills, avatars */
```

## 7.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

# 8. Color Scheme & Branding

## 8.1 Primary Brand Colors

The brand is called "بريق اليسر" which translates to "Glimmer of Ease". The colors should convey:
- **Trust & Reliability** (financial service)
- **Freshness & Clarity** (transparent, no hidden fees)
- **Warmth & Accessibility** (approachable, friendly)

### Main Palette

```css
:root {
  /* ========================================
     PRIMARY - Teal/Cyan (Trust, Clarity)
     ======================================== */
  --primary-50: #ecfeff;
  --primary-100: #cffafe;
  --primary-200: #a5f3fc;
  --primary-300: #67e8f9;
  --primary-400: #22d3ee;
  --primary-500: #06b6d4;   /* Main Primary */
  --primary-600: #0891b2;   /* Primary Dark */
  --primary-700: #0e7490;
  --primary-800: #155e75;
  --primary-900: #164e63;
  --primary-950: #083344;

  /* ========================================
     SECONDARY - Warm Gold (Ease, Warmth)
     ======================================== */
  --secondary-50: #fffbeb;
  --secondary-100: #fef3c7;
  --secondary-200: #fde68a;
  --secondary-300: #fcd34d;
  --secondary-400: #fbbf24;
  --secondary-500: #f59e0b;   /* Main Secondary */
  --secondary-600: #d97706;
  --secondary-700: #b45309;
  --secondary-800: #92400e;
  --secondary-900: #78350f;

  /* ========================================
     ACCENT - Deep Blue (Professionalism)
     ======================================== */
  --accent-50: #eff6ff;
  --accent-100: #dbeafe;
  --accent-200: #bfdbfe;
  --accent-300: #93c5fd;
  --accent-400: #60a5fa;
  --accent-500: #3b82f6;
  --accent-600: #2563eb;   /* Main Accent */
  --accent-700: #1d4ed8;
  --accent-800: #1e40af;
  --accent-900: #1e3a8a;

  /* ========================================
     NEUTRAL - Slate Gray
     ======================================== */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
  --neutral-950: #020617;

  /* ========================================
     SEMANTIC COLORS
     ======================================== */

  /* Success - Green */
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-200: #bbf7d0;
  --success-300: #86efac;
  --success-400: #4ade80;
  --success-500: #22c55e;   /* Main Success */
  --success-600: #16a34a;
  --success-700: #15803d;

  /* Warning - Amber */
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-200: #fde68a;
  --warning-300: #fcd34d;
  --warning-400: #fbbf24;
  --warning-500: #f59e0b;   /* Main Warning */
  --warning-600: #d97706;
  --warning-700: #b45309;

  /* Error - Red */
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-300: #fca5a5;
  --error-400: #f87171;
  --error-500: #ef4444;   /* Main Error */
  --error-600: #dc2626;
  --error-700: #b91c1c;

  /* Info - Blue */
  --info-50: #eff6ff;
  --info-100: #dbeafe;
  --info-200: #bfdbfe;
  --info-300: #93c5fd;
  --info-400: #60a5fa;
  --info-500: #3b82f6;   /* Main Info */
  --info-600: #2563eb;
  --info-700: #1d4ed8;
}
```

## 8.2 Color Usage Guidelines

### Background Colors
```css
/* Page backgrounds */
--bg-page: var(--neutral-50);        /* Light mode */
--bg-page-dark: var(--neutral-900);  /* Dark mode */

/* Card backgrounds */
--bg-card: #ffffff;
--bg-card-dark: var(--neutral-800);

/* Sidebar */
--bg-sidebar: var(--primary-900);
--bg-sidebar-hover: var(--primary-800);
```

### Text Colors
```css
/* Primary text */
--text-primary: var(--neutral-900);
--text-primary-dark: var(--neutral-50);

/* Secondary text */
--text-secondary: var(--neutral-600);
--text-secondary-dark: var(--neutral-400);

/* Muted text */
--text-muted: var(--neutral-400);
--text-muted-dark: var(--neutral-500);
```

### Button Colors
```css
/* Primary button */
--btn-primary-bg: var(--primary-500);
--btn-primary-bg-hover: var(--primary-600);
--btn-primary-text: #ffffff;

/* Secondary button */
--btn-secondary-bg: var(--neutral-100);
--btn-secondary-bg-hover: var(--neutral-200);
--btn-secondary-text: var(--neutral-700);

/* Success button */
--btn-success-bg: var(--success-500);
--btn-success-bg-hover: var(--success-600);

/* Danger button */
--btn-danger-bg: var(--error-500);
--btn-danger-bg-hover: var(--error-600);
```

### Status Colors
```css
/* Transaction/Order Status */
--status-pending: var(--warning-500);
--status-confirmed: var(--primary-500);
--status-paid: var(--success-500);
--status-overdue: var(--error-500);
--status-cancelled: var(--neutral-400);

/* Account Status */
--status-active: var(--success-500);
--status-suspended: var(--warning-500);
--status-blocked: var(--error-500);
```

## 8.3 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'Tajawal', 'sans-serif'],
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## 8.4 Logo Concepts

The logo should incorporate:
1. **بريق** (Bariq/Glimmer): A sparkle or light element
2. **اليسر** (Al-Yusr/Ease): Smooth, flowing forms
3. **Shopping/Payment**: Subtle reference to commerce

Suggested logo elements:
- A stylized "ب" (Ba) with a sparkle/star
- Teal/cyan as primary color
- Gold accent for the sparkle
- Clean, modern Arabic typography

---

# 9. Page Structures

## 9.1 Customer Web App Pages

### Home/Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Notifications | Profile                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Credit Summary Card                      │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │Available│  │  Used   │  │   Due Date      │  │   │
│  │  │ ر.س 750 │  │ ر.س 250 │  │   15 يناير     │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │   │
│  │                                                  │   │
│  │  [████████████░░░░] 75% Available               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Quick Actions:                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│  │  Pay Now  │ │  Stores   │ │  History  │            │
│  └───────────┘ └───────────┘ └───────────┘            │
│                                                         │
│  Current Debt:                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Transaction #BRQ-001 | ر.س 250 | Due: 5 days   │   │
│  │ [Pay Now Button]                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent Transactions:                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ بندة - فرع النخيل | ر.س 150 | 10 يناير         │   │
│  │ كارفور - فرع الرياض | ر.س 100 | 8 يناير        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Stores List
```
┌─────────────────────────────────────────────────────────┐
│  ← Back |  المتاجر المعتمدة  | Filter                   │
├─────────────────────────────────────────────────────────┤
│  [Search: ابحث عن متجر...                    🔍]       │
│                                                         │
│  📍 موقعك: الرياض - النخيل                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏪 بندة                                         │   │
│  │    سوبرماركت | ⭐ 4.5 (120 تقييم)              │   │
│  │    3 فروع قريبة منك                             │   │
│  │    📍 أقرب فرع: 2.5 كم                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏪 كارفور                                       │   │
│  │    هايبرماركت | ⭐ 4.3 (95 تقييم)              │   │
│  │    2 فروع قريبة منك                             │   │
│  │    📍 أقرب فرع: 4.1 كم                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Transaction History
```
┌─────────────────────────────────────────────────────────┐
│  ← Back |  سجل العمليات                                 │
├─────────────────────────────────────────────────────────┤
│  Filter: [All ▼] [This Month ▼]                        │
│                                                         │
│  يناير 2024                                             │
│  ────────────────────────────────────────               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 15 يناير                                        │   │
│  │ بندة - فرع النخيل                               │   │
│  │ ر.س 250.00                                      │   │
│  │ 🟢 تم السداد                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 10 يناير                                        │   │
│  │ كارفور - فرع الرياض                             │   │
│  │ ر.س 150.00                                      │   │
│  │ 🟡 في انتظار السداد (باقي 3 أيام)               │   │
│  │ [سدد الآن]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 9.2 Merchant Dashboard Pages

### Sidebar Navigation
```
┌──────────────────────┐
│  🏪 اسم المتجر       │
│  فرع: النخيل         │
├──────────────────────┤
│  📊 لوحة التحكم      │
│  📝 إنشاء فاتورة     │
│  📋 العمليات         │
│  ↩️  المرتجعات       │
│  📈 التقارير         │
│  💰 التسويات         │
│  ──────────────────  │
│  🏢 الفروع           │
│  👥 الموظفين         │
│  ⚙️  الإعدادات       │
│  🎫 الدعم الفني      │
└──────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Sidebar │              لوحة التحكم                    │ 🔔 │ 👤      │
├──────────┼──────────────────────────────────────────────────────────────┤
│          │                                                              │
│  Nav     │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│          │  │  عمليات اليوم │ │ إجمالي اليوم │ │ متوسط العملية│         │
│          │  │     45       │ │  ر.س 6,750  │ │   ر.س 150   │         │
│          │  │  ↑ 12%       │ │   ↑ 8%      │ │    ↓ 3%     │         │
│          │  └──────────────┘ └──────────────┘ └──────────────┘         │
│          │                                                              │
│          │  ┌────────────────────────────────────────────────────┐     │
│          │  │              📊 مبيعات الأسبوع                     │     │
│          │  │  [Chart showing daily sales trend]                 │     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
│          │  آخر العمليات:                                              │
│          │  ┌────────────────────────────────────────────────────┐     │
│          │  │ # │ الرقم المرجعي │ العميل │ المبلغ │ الحالة │ الوقت │  │
│          │  │ 1 │ BRQ-2024-001 │ م***د  │ 150   │ ✅    │ 10:30│     │
│          │  │ 2 │ BRQ-2024-002 │ أ***م  │ 200   │ ⏳    │ 10:25│     │
│          │  │ 3 │ BRQ-2024-003 │ س***ى  │ 85    │ ✅    │ 10:20│     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

### Create Invoice
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Sidebar │              إنشاء فاتورة جديدة              │ 🔔 │ 👤      │
├──────────┼──────────────────────────────────────────────────────────────┤
│          │                                                              │
│  Nav     │  معلومات العميل:                                            │
│          │  ┌────────────────────────────────────────────────────┐     │
│          │  │ رقم الهوية: [1234567890        ] [🔍 بحث]          │     │
│          │  │                                                    │     │
│          │  │ ✅ العميل: محمد أحمد العمري                        │     │
│          │  │    الرصيد المتاح: ر.س 750                          │     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
│          │  المنتجات:                                                   │
│          │  ┌────────────────────────────────────────────────────┐     │
│          │  │ المنتج          │ الكمية │ السعر  │ الإجمالي      │     │
│          │  │ [حليب طويل...▼] │ [2   ] │ 8.50  │ 17.00         │     │
│          │  │ [خبز أبيض...▼]  │ [1   ] │ 3.00  │ 3.00          │     │
│          │  │ [+ إضافة منتج]                                     │     │
│          │  ├────────────────────────────────────────────────────┤     │
│          │  │                          المجموع: ر.س 20.00       │     │
│          │  │                          الخصم:   ر.س 0.00        │     │
│          │  │                          الإجمالي: ر.س 20.00      │     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
│          │  ┌────────────────────────────────────────────────────┐     │
│          │  │        [إلغاء]              [إنشاء الفاتورة]       │     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

## 9.3 Admin Dashboard Pages

### Executive Dashboard
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔷 بريق اليسر - لوحة الإدارة                           │ 🔔 │ 👤      │
├───────────┬─────────────────────────────────────────────────────────────┤
│           │                                                             │
│  📊 الرئيسية│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  👥 العملاء │  │ العملاء    │ │ المتاجر   │ │ العمليات  │ │ الإيرادات ││
│  🏪 المتاجر │  │   5,000    │ │    100    │ │   12,500  │ │ ر.س 45K  ││
│  📋 العمليات│  │ +150 هذا   │ │ 5 بانتظار │ │ اليوم:500 │ │ هذا الشهر ││
│  💰 التسويات│  │  الأسبوع   │ │ الموافقة  │ │           │ │           ││
│  📈 التقارير│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│  ──────── │                                                             │
│  🎫 الدعم  │  ┌─────────────────────────────────────────────────────┐   │
│  👤 الموظفين│  │              📊 إحصائيات العمليات                  │   │
│  ⚙️ الإعدادات│  │  [Interactive chart - transactions over time]      │   │
│  📝 سجل    │  └─────────────────────────────────────────────────────┘   │
│    التدقيق │                                                             │
│           │  ┌──────────────────────┐ ┌──────────────────────────────┐ │
│           │  │   ⚠️ تنبيهات         │ │   📋 آخر النشاطات           │ │
│           │  │ • 5 متاجر بانتظار   │ │ • تمت الموافقة على متجر X  │ │
│           │  │ • 150 عملية متأخرة  │ │ • عميل جديد سجل            │ │
│           │  │ • 3 طلبات زيادة حد  │ │ • تسوية #123 تمت           │ │
│           │  └──────────────────────┘ └──────────────────────────────┘ │
│           │                                                             │
└───────────┴─────────────────────────────────────────────────────────────┘
```

---

# 10. Project File Structure

## 10.1 Backend (Flask)

```
bariq-backend/
├── app/
│   ├── __init__.py              # App factory
│   ├── config.py                # Configuration
│   ├── extensions.py            # Flask extensions init
│   │
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── customer.py
│   │   ├── merchant.py
│   │   ├── branch.py
│   │   ├── region.py
│   │   ├── merchant_user.py
│   │   ├── admin_user.py
│   │   ├── transaction.py
│   │   ├── payment.py
│   │   ├── settlement.py
│   │   ├── support_ticket.py
│   │   ├── notification.py
│   │   ├── audit_log.py
│   │   └── mixins.py            # Common model mixins
│   │
│   ├── schemas/                 # Marshmallow schemas
│   │   ├── __init__.py
│   │   ├── customer.py
│   │   ├── merchant.py
│   │   ├── transaction.py
│   │   ├── payment.py
│   │   └── ...
│   │
│   ├── api/                     # API Blueprints
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py
│   │   │   │   └── services.py
│   │   │   ├── customers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py
│   │   │   │   └── services.py
│   │   │   ├── merchants/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py
│   │   │   │   └── services.py
│   │   │   ├── admin/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes.py
│   │   │   │   └── services.py
│   │   │   └── public/
│   │   │       ├── __init__.py
│   │   │       └── routes.py
│   │   └── errors.py            # Error handlers
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── nafath_service.py
│   │   ├── credit_service.py
│   │   ├── transaction_service.py
│   │   ├── settlement_service.py
│   │   ├── notification_service.py
│   │   └── audit_service.py
│   │
│   ├── utils/                   # Utilities
│   │   ├── __init__.py
│   │   ├── helpers.py
│   │   ├── validators.py
│   │   ├── decorators.py
│   │   ├── constants.py
│   │   └── reference_generator.py
│   │
│   └── tasks/                   # Celery tasks
│       ├── __init__.py
│       ├── notifications.py
│       ├── settlements.py
│       └── reminders.py
│
├── migrations/                  # Alembic migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── tests/                       # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_customers.py
│   ├── test_merchants.py
│   ├── test_transactions.py
│   └── ...
│
├── scripts/                     # Utility scripts
│   ├── seed_data.py
│   └── create_admin.py
│
├── .env.example
├── .gitignore
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── docker-compose.yml
├── wsgi.py
└── README.md
```

## 10.2 Frontend (React/Next.js)

```
bariq-dashboard/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (merchant)/          # Merchant dashboard
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── returns/
│   │   │   ├── reports/
│   │   │   ├── settlements/
│   │   │   ├── branches/
│   │   │   ├── staff/
│   │   │   └── settings/
│   │   ├── (admin)/             # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── merchants/
│   │   │   ├── transactions/
│   │   │   ├── settlements/
│   │   │   ├── reports/
│   │   │   ├── support/
│   │   │   ├── staff/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── PieChart.tsx
│   │   ├── forms/
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── MerchantForm.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── ...
│   │   └── tables/
│   │       ├── CustomersTable.tsx
│   │       ├── TransactionsTable.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCustomers.ts
│   │   ├── useMerchants.ts
│   │   ├── useTransactions.ts
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.ts              # Auth utilities
│   │   └── utils.ts             # General utilities
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── customer.ts
│   │   ├── merchant.ts
│   │   ├── transaction.ts
│   │   └── ...
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

# 11. Implementation Phases

## Phase 1: Foundation (Week 1-2)

### Backend
- [ ] Set up Flask project structure
- [ ] Configure SQLAlchemy and PostgreSQL
- [ ] Create all database models
- [ ] Set up migrations with Alembic
- [ ] Implement authentication system (JWT)
- [ ] Create base API structure
- [ ] Set up error handling
- [ ] Configure CORS

### Frontend
- [ ] Set up Next.js project
- [ ] Configure Tailwind CSS with RTL
- [ ] Create base UI components
- [ ] Set up API client
- [ ] Create authentication pages
- [ ] Implement auth flow

## Phase 2: Core Customer Features (Week 3-4)

### Backend
- [ ] Nafath integration (mock for dev)
- [ ] Customer registration/login
- [ ] Customer profile endpoints
- [ ] Credit limit management
- [ ] Transaction creation/confirmation
- [ ] Payment tracking
- [ ] Basic notifications

### Frontend (Admin)
- [ ] Customer list page
- [ ] Customer detail page
- [ ] Credit limit management UI

## Phase 3: Merchant Features (Week 5-6)

### Backend
- [ ] Merchant registration
- [ ] Branch/Region management
- [ ] Staff management
- [ ] Invoice creation
- [ ] Transaction processing
- [ ] Returns handling
- [ ] Basic reports

### Frontend (Merchant)
- [ ] Merchant dashboard
- [ ] Invoice creation page
- [ ] Transaction list
- [ ] Branch management
- [ ] Staff management

## Phase 4: Admin Features (Week 7-8)

### Backend
- [ ] Admin dashboard stats
- [ ] Merchant approval flow
- [ ] Settlement management
- [ ] Support ticket system
- [ ] Comprehensive reports
- [ ] Audit logging

### Frontend (Admin)
- [ ] Executive dashboard
- [ ] Merchant management
- [ ] Settlement management
- [ ] Support tickets
- [ ] Reports pages
- [ ] System settings

## Phase 5: Polish & Testing (Week 9-10)

- [ ] Complete all reports
- [ ] Notification system
- [ ] Email integration
- [ ] SMS integration
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

# 12. Security Considerations

## 12.1 Authentication & Authorization

```python
# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

# Password Requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_DIGIT = True
PASSWORD_REQUIRE_SPECIAL = True
```

## 12.2 Rate Limiting

```python
# Rate limits per endpoint type
RATE_LIMITS = {
    'auth': '5 per minute',
    'api': '100 per minute',
    'sensitive': '10 per minute',
}
```

## 12.3 Data Protection

- All sensitive data encrypted at rest
- HTTPS only in production
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection
- Secure headers (CSP, HSTS, etc.)

## 12.4 Audit Requirements

All sensitive operations must be logged:
- User login/logout
- Credit limit changes
- Transaction status changes
- Merchant approval/suspension
- Settlement processing
- Admin actions

---

# Appendix A: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 403 | Insufficient permissions |
| AUTH_004 | 401 | Nafath verification failed |
| CUST_001 | 404 | Customer not found |
| CUST_002 | 400 | Insufficient credit |
| CUST_003 | 403 | Account suspended |
| MERCH_001 | 404 | Merchant not found |
| MERCH_002 | 403 | Merchant not approved |
| TXN_001 | 404 | Transaction not found |
| TXN_002 | 400 | Transaction already confirmed |
| TXN_003 | 400 | Transaction cancelled |
| VAL_001 | 400 | Validation error |
| SYS_001 | 500 | Internal server error |

---

# Appendix B: Nafath Integration Notes

Nafath is Saudi Arabia's national single sign-on service.

### Flow:
1. User enters National ID
2. System calls Nafath API to initiate auth
3. Nafath sends push notification to user's Absher app
4. User sees random number and confirms in Absher
5. System polls/receives callback for verification
6. If verified, system creates/logs in user

### Required Data from Nafath:
- National ID (الهوية الوطنية)
- Full Name (Arabic)
- Date of Birth
- Gender

### Sandbox/Development:
Use mock Nafath service during development that simulates the flow.

---

# Appendix C: Localization

## Arabic Translations for Common Terms

| English | Arabic |
|---------|--------|
| Dashboard | لوحة التحكم |
| Customers | العملاء |
| Merchants | المتاجر |
| Transactions | العمليات |
| Payments | المدفوعات |
| Settlements | التسويات |
| Reports | التقارير |
| Settings | الإعدادات |
| Profile | الملف الشخصي |
| Credit Limit | حد الشراء |
| Available Credit | الرصيد المتاح |
| Due Date | تاريخ الاستحقاق |
| Overdue | متأخر |
| Paid | مسدد |
| Pending | قيد الانتظار |
| Confirmed | مؤكد |
| Cancelled | ملغي |
| Branch | فرع |
| Region | منطقة |
| Cashier | كاشير |
| Invoice | فاتورة |
| Return | مرتجع |
| Support | الدعم الفني |

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Project:** Bariq Al-Yusr (بريق اليسر)

