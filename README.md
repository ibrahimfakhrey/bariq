# Bariq Al-Yusr - بريق اليسر

A Sharia-compliant Buy Now Pay Later (BNPL) platform for essential goods in Saudi Arabia.

## Overview

Bariq Al-Yusr enables customers to purchase essential goods from approved stores and pay back the exact same amount within 10 days - with **NO interest, NO fees, and NO penalties**.

## Features

### For Customers
- Register via Nafath (Saudi National ID)
- Get a credit limit for purchases
- Buy from approved stores
- Pay back within 10 days
- Track transactions and payments

### For Merchants
- Register store and branches
- Accept Bariq payments
- Manage staff and operations
- Track settlements and reports

### For Admin
- Approve merchants
- Manage customers and credit limits
- Process settlements
- View reports and analytics

## Tech Stack

- **Backend**: Flask, Flask-SQLAlchemy, PostgreSQL
- **Authentication**: JWT (Flask-JWT-Extended)
- **Database**: PostgreSQL

## Setup

1. Clone the repository
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment file:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your configuration

6. Initialize database:
   ```bash
   flask db upgrade
   flask init-db
   ```

7. Run the application:
   ```bash
   python wsgi.py
   ```

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Health Check
```
GET /api/v1/health
```

### Authentication
```
POST /api/v1/auth/nafath/initiate
POST /api/v1/auth/nafath/verify
POST /api/v1/auth/merchant/login
POST /api/v1/auth/admin/login
POST /api/v1/auth/refresh
```

See `BARIQ_PROJECT_PLAN.md` for complete API documentation.

## Project Structure

```
bariq/
├── app/
│   ├── __init__.py         # App factory
│   ├── config.py           # Configuration
│   ├── extensions.py       # Flask extensions
│   ├── models/             # Database models
│   ├── api/v1/             # API routes
│   ├── services/           # Business logic
│   ├── schemas/            # Marshmallow schemas
│   └── utils/              # Utilities
├── migrations/             # Database migrations
├── tests/                  # Test suite
├── requirements.txt
├── wsgi.py
└── README.md
```

## License

Proprietary - All rights reserved

## Contact

For inquiries, please contact the development team.
