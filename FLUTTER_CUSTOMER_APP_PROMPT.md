# Bariq Al-Yusr - Flutter Customer Mobile App Development Guide

## Project Overview

**App Name:** Bariq Al-Yusr (بريق اليسر)
**Type:** Customer Mobile App (Flutter)
**Platform:** iOS & Android
**Language:** Arabic (RTL) primary, English secondary
**Backend:** Flask REST API + WebSocket (Socket.IO)
**Base URL:** `https://api.bariq.sa/api/v1` (Production)
**WebSocket URL:** `wss://api.bariq.sa` (Production)

## What is Bariq?

Bariq Al-Yusr is a **Sharia-compliant Buy Now Pay Later (BNPL)** service for Saudi Arabia. Customers can:
- Shop at partner merchants using their credit limit
- Confirm purchases initiated by merchants
- Pay their dues via multiple payment methods (Mada, Credit Card, STC Pay, Apple Pay)
- Track transactions and payment history
- Receive real-time notifications

---

## Authentication

### JWT Token Structure

All authenticated endpoints require Bearer token in header:
```
Authorization: Bearer <access_token>
```

### Login

**POST** `/api/v1/auth/customer/login`

```json
// Request
{
  "username": "customer_username",
  "password": "password123"
}

// Response (Success)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customer": {
      "id": "uuid-string",
      "bariq_id": "123456",
      "username": "customer_username",
      "full_name_ar": "أحمد محمد",
      "full_name_en": "Ahmed Mohammed",
      "phone": "0512345678",
      "email": "ahmed@email.com",
      "city": "Riyadh",
      "status": "active",
      "credit_limit": 5000.00,
      "available_credit": 3500.00,
      "used_credit": 1500.00,
      "language": "ar"
    }
  }
}

// Response (Error)
{
  "success": false,
  "message": "Invalid credentials",
  "error_code": "AUTH_001"
}
```

### Refresh Token

**POST** `/api/v1/auth/refresh`

```json
// Request Header
Authorization: Bearer <refresh_token>

// Response
{
  "success": true,
  "data": {
    "access_token": "new_access_token..."
  }
}
```

---

## API Endpoints

### Profile

#### Get Profile
**GET** `/api/v1/customers/me`

```json
// Response
{
  "success": true,
  "data": {
    "customer": {
      "id": "uuid",
      "bariq_id": "123456",
      "username": "username",
      "full_name_ar": "الاسم بالعربي",
      "full_name_en": "Name in English",
      "phone": "0512345678",
      "email": "email@example.com",
      "city": "Riyadh",
      "district": "Al Olaya",
      "status": "active",
      "credit_limit": 5000.00,
      "available_credit": 3500.00,
      "used_credit": 1500.00,
      "language": "ar",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update Profile
**PUT** `/api/v1/customers/me`

```json
// Request
{
  "full_name_ar": "الاسم الجديد",
  "full_name_en": "New Name",
  "email": "newemail@example.com",
  "city": "Jeddah",
  "district": "Al Hamra",
  "language": "en"
}

// Response
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "customer": { ... }
  }
}
```

#### Change Password
**PUT** `/api/v1/customers/me/password`

```json
// Request
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}

// Response
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Credit

#### Get Credit Details
**GET** `/api/v1/customers/me/credit`

```json
// Response
{
  "success": true,
  "data": {
    "credit_limit": 5000.00,
    "available_credit": 3500.00,
    "used_credit": 1500.00,
    "utilization_percentage": 30.0,
    "pending_transactions": 2,
    "pending_amount": 500.00
  }
}
```

#### Get Credit Health
**GET** `/api/v1/customers/me/credit/health`

```json
// Response
{
  "success": true,
  "data": {
    "score": 85,
    "rating": "excellent",
    "factors": {
      "payment_history": 90,
      "utilization": 80,
      "account_age": 85
    },
    "recommendations": [
      "Keep paying on time",
      "Consider reducing credit utilization"
    ]
  }
}
```

#### Request Credit Increase
**POST** `/api/v1/customers/me/credit/request-increase`

```json
// Request
{
  "requested_amount": 7000.00,
  "reason": "Need more credit for business purchases"
}

// Response
{
  "success": true,
  "message": "Credit increase request submitted",
  "data": {
    "request_id": "uuid",
    "status": "pending",
    "requested_amount": 7000.00
  }
}
```

---

### Transactions

#### Get Transactions
**GET** `/api/v1/customers/me/transactions`

Query Parameters:
- `status`: filter by status (pending, confirmed, paid, overdue, cancelled)
- `page`: page number (default: 1)
- `per_page`: items per page (default: 20)

```json
// Response
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "reference_number": "BRQ-2024-001234",
        "merchant_id": "uuid",
        "branch_id": "uuid",
        "subtotal": 500.00,
        "discount": 0.00,
        "total_amount": 500.00,
        "items": [
          {"name": "Product 1", "qty": 2, "price": 250.00}
        ],
        "transaction_date": "2024-01-15T14:30:00Z",
        "due_date": "2024-01-25",
        "status": "confirmed",
        "paid_amount": 0.00,
        "returned_amount": 0.00,
        "remaining_amount": 500.00,
        "is_overdue": false,
        "merchant": {
          "id": "uuid",
          "name_ar": "متجر النور",
          "name_en": "Al Noor Store",
          "logo_url": "https://..."
        },
        "branch": {
          "id": "uuid",
          "name_ar": "فرع الرياض",
          "city": "Riyadh"
        }
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

#### Get Single Transaction
**GET** `/api/v1/customers/me/transactions/{transaction_id}`

```json
// Response
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "reference_number": "BRQ-2024-001234",
      "total_amount": 500.00,
      "status": "pending",
      "items": [...],
      "merchant": { ... },
      "branch": { ... },
      "payments": [
        {
          "id": "uuid",
          "amount": 100.00,
          "payment_method": "card",
          "status": "completed",
          "created_at": "2024-01-20T10:00:00Z"
        }
      ]
    }
  }
}
```

#### Confirm Transaction
**POST** `/api/v1/customers/me/transactions/{transaction_id}/confirm`

```json
// Response (Success)
{
  "success": true,
  "message": "Transaction confirmed successfully",
  "data": {
    "transaction": {
      "id": "uuid",
      "status": "confirmed",
      ...
    },
    "credit": {
      "available_credit": 3000.00,
      "used_credit": 2000.00
    }
  }
}

// Response (Error - Insufficient Credit)
{
  "success": false,
  "message": "Insufficient credit",
  "error_code": "CRED_002"
}
```

#### Reject Transaction
**POST** `/api/v1/customers/me/transactions/{transaction_id}/reject`

```json
// Request
{
  "reason": "I did not make this purchase"  // optional
}

// Response
{
  "success": true,
  "message": "Transaction rejected successfully",
  "data": {
    "transaction": {
      "id": "uuid",
      "status": "cancelled"
    }
  }
}
```

---

### Debt & Payments

#### Get Debt Summary
**GET** `/api/v1/customers/me/debt`

```json
// Response
{
  "success": true,
  "data": {
    "total_debt": 2500.00,
    "overdue_amount": 500.00,
    "due_this_week": 1000.00,
    "due_this_month": 2000.00,
    "oldest_due_date": "2024-01-10",
    "transactions_count": 5,
    "overdue_count": 1
  }
}
```

#### Get Payment History
**GET** `/api/v1/customers/me/payments`

Query Parameters:
- `page`: page number
- `per_page`: items per page

```json
// Response
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "reference_number": "PAY-2024-001234",
        "amount": 500.00,
        "payment_method": "card",
        "status": "completed",
        "transaction_id": "uuid",
        "transaction_reference": "BRQ-2024-001234",
        "gateway_reference": "TST2401...",
        "created_at": "2024-01-15T10:00:00Z",
        "completed_at": "2024-01-15T10:01:00Z"
      }
    ]
  },
  "meta": { ... }
}
```

#### Make Payment (Direct/Cash)
**POST** `/api/v1/customers/me/payments`

```json
// Request - Single Transaction
{
  "transaction_id": "uuid",
  "amount": 500.00,
  "payment_method": "cash"
}

// Request - Multiple Transactions
{
  "transaction_ids": ["uuid1", "uuid2", "uuid3"],
  "amount": 1500.00,
  "payment_method": "cash"
}

// Response
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 500.00,
      "status": "completed"
    },
    "credit": {
      "available_credit": 4000.00,
      "used_credit": 1000.00
    }
  }
}
```

#### Initiate Online Payment (PayTabs)
**POST** `/api/v1/customers/me/payments/initiate`

```json
// Request
{
  "transaction_ids": ["uuid1", "uuid2"],  // or "transaction_id": "uuid"
  "amount": 1000.00,
  "payment_method": "all"  // Options: all, creditcard, mada, stcpay, applepay
}

// Response
{
  "success": true,
  "message": "Payment page created",
  "data": {
    "payment_id": "uuid",
    "tran_ref": "TST2401234567890",
    "redirect_url": "https://secure.paytabs.sa/payment/page/...",
    "amount": 1000.00
  }
}
```

**Note:** After user completes payment on PayTabs page, they are redirected back to app. Use deep linking to handle callback.

#### Get Payment Status
**GET** `/api/v1/customers/me/payments/{payment_id}/status`

```json
// Response
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "completed",  // pending, processing, completed, failed, cancelled
    "amount": 1000.00,
    "payment_method": "mada",
    "gateway_reference": "TST2401234567890",
    "created_at": "2024-01-15T10:00:00Z",
    "completed_at": "2024-01-15T10:02:00Z"
  }
}
```

#### Query Gateway Status
**GET** `/api/v1/customers/me/payments/query/{tran_ref}`

```json
// Response
{
  "success": true,
  "data": {
    "tran_ref": "TST2401234567890",
    "payment_result": {
      "response_status": "A",  // A=Authorized, H=Hold, P=Pending, V=Voided, E=Error, D=Declined
      "response_code": "000",
      "response_message": "Authorised"
    },
    "cart_amount": 1000.00,
    "payment_info": {
      "payment_method": "Mada",
      "card_scheme": "Mada"
    }
  }
}
```

#### Get Available Payment Methods
**GET** `/api/v1/customers/me/payment-methods`

```json
// Response
{
  "success": true,
  "data": {
    "payment_methods": [
      {
        "id": "all",
        "name_ar": "جميع طرق الدفع",
        "name_en": "All Payment Methods"
      },
      {
        "id": "mada",
        "name_ar": "مدى",
        "name_en": "Mada"
      },
      {
        "id": "creditcard",
        "name_ar": "بطاقة ائتمان",
        "name_en": "Credit Card"
      },
      {
        "id": "stcpay",
        "name_ar": "STC Pay",
        "name_en": "STC Pay"
      },
      {
        "id": "applepay",
        "name_ar": "Apple Pay",
        "name_en": "Apple Pay"
      }
    ]
  }
}
```

---

### Stores (Merchants)

#### Get Stores List
**GET** `/api/v1/customers/stores`

Query Parameters:
- `city`: filter by city
- `search`: search by name
- `page`, `per_page`: pagination

```json
// Response
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "uuid",
        "name_ar": "متجر النور",
        "name_en": "Al Noor Store",
        "logo_url": "https://...",
        "category": "electronics",
        "city": "Riyadh",
        "branches_count": 5,
        "rating": 4.5
      }
    ]
  },
  "meta": { ... }
}
```

#### Get Store Details
**GET** `/api/v1/customers/stores/{merchant_id}`

```json
// Response
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid",
      "name_ar": "متجر النور",
      "name_en": "Al Noor Store",
      "description_ar": "متجر إلكترونيات",
      "logo_url": "https://...",
      "category": "electronics",
      "branches": [
        {
          "id": "uuid",
          "name_ar": "فرع الرياض",
          "city": "Riyadh",
          "address": "...",
          "phone": "...",
          "working_hours": "09:00-22:00",
          "location": {
            "lat": 24.7136,
            "lng": 46.6753
          }
        }
      ]
    }
  }
}
```

---

### Notifications

#### Get Notifications
**GET** `/api/v1/customers/me/notifications`

Query Parameters:
- `unread_only`: true/false
- `page`: page number

```json
// Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title_ar": "معاملة جديدة",
        "title_en": "New Transaction",
        "body_ar": "لديك معاملة جديدة بقيمة 500 ريال",
        "body_en": "You have a new transaction of 500 SAR",
        "type": "transaction_pending",
        "related_entity_type": "transaction",
        "related_entity_id": "uuid",
        "is_read": false,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "unread_count": 5
  },
  "meta": { ... }
}
```

#### Mark Notification as Read
**PUT** `/api/v1/customers/me/notifications/{notification_id}/read`

```json
// Response
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### Mark All as Read
**POST** `/api/v1/customers/me/notifications/read-all`

```json
// Response
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Device Registration (Push Notifications)

#### Get Registered Devices
**GET** `/api/v1/customers/me/devices`

```json
// Response
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "uuid",
        "device_type": "ios",
        "device_name": "iPhone 15 Pro",
        "is_active": true,
        "last_used_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Register Device (FCM)
**POST** `/api/v1/customers/me/devices`

```json
// Request
{
  "fcm_token": "firebase_cloud_messaging_token...",
  "device_type": "ios",  // ios or android
  "device_name": "iPhone 15 Pro",
  "device_id": "unique_device_identifier"
}

// Response
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "uuid",
    "device_type": "ios",
    "is_active": true
  }
}
```

#### Unregister Device
**DELETE** `/api/v1/customers/me/devices/{device_id}`

```json
// Response
{
  "success": true,
  "message": "Device unregistered successfully"
}
```

---

## WebSocket (Real-Time Updates)

### Connection

Use Socket.IO client library for Flutter: `socket_io_client`

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

IO.Socket socket = IO.io(
  'https://api.bariq.sa',
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .setAuth({'token': accessToken})
    .setPath('/socket.io')
    .build(),
);

// Connect to customer namespace
socket.connect();

socket.onConnect((_) {
  print('Connected to WebSocket');
});

socket.onDisconnect((_) {
  print('Disconnected from WebSocket');
});
```

### Namespace

Connect to: `/customer`

### Events FROM Server (Listen)

| Event | Description | Data Structure |
|-------|-------------|----------------|
| `connected` | Connection successful | `{status, customer_id, message}` |
| `transaction_created` | New transaction pending | See below |
| `transaction_cancelled` | Transaction was cancelled | See below |
| `transaction_overdue` | Transaction became overdue | See below |
| `transaction_return` | Return processed | See below |
| `payment_completed` | Payment successful | See below |
| `credit_updated` | Credit changed | See below |
| `notification_new` | New notification | See below |
| `pong` | Response to ping | `{status: 'ok'}` |
| `subscribed` | Subscribed to transaction | `{type, id}` |
| `status` | Connection status | `{connected, customer_id, type}` |

#### Event Data Structures

**transaction_created / transaction_cancelled / transaction_overdue / transaction_return:**
```json
{
  "transaction_id": "uuid",
  "reference_number": "BRQ-2024-001234",
  "status": "pending",
  "total_amount": 500.00,
  "paid_amount": 0.00,
  "remaining_amount": 500.00,
  "customer_id": "uuid",
  "merchant_id": "uuid",
  "branch_id": "uuid",
  "due_date": "2024-01-25",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**payment_completed:**
```json
{
  "payment_id": "uuid",
  "reference_number": "PAY-2024-001234",
  "status": "completed",
  "amount": 500.00,
  "payment_method": "card",
  "transaction_id": "uuid",
  "customer_id": "uuid",
  "gateway_reference": "TST...",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**credit_updated:**
```json
{
  "customer_id": "uuid",
  "credit_limit": 5000.00,
  "available_credit": 4000.00,
  "used_credit": 1000.00
}
```

**notification_new:**
```json
{
  "notification_id": "uuid",
  "title_ar": "إشعار",
  "title_en": "Notification",
  "body_ar": "...",
  "body_en": "...",
  "type": "transaction_pending",
  "related_entity_type": "transaction",
  "related_entity_id": "uuid",
  "is_read": false,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Events TO Server (Emit)

| Event | Description | Data |
|-------|-------------|------|
| `ping` | Keep-alive | none |
| `subscribe_transaction` | Watch specific transaction | `{transaction_id: 'uuid'}` |
| `unsubscribe_transaction` | Stop watching | `{transaction_id: 'uuid'}` |
| `get_status` | Get connection status | none |

### Flutter Implementation Example

```dart
class WebSocketService {
  late IO.Socket socket;
  final String baseUrl = 'https://api.bariq.sa';

  void connect(String accessToken) {
    socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': accessToken})
        .setPath('/socket.io')
        .enableAutoConnect()
        .build(),
    );

    socket.nsp = '/customer';

    // Connection events
    socket.onConnect((_) => print('Connected'));
    socket.onDisconnect((_) => print('Disconnected'));
    socket.onError((error) => print('Error: $error'));

    // Business events
    socket.on('transaction_created', (data) {
      // Show notification, refresh transactions list
      _handleNewTransaction(data);
    });

    socket.on('payment_completed', (data) {
      // Update UI, show success message
      _handlePaymentComplete(data);
    });

    socket.on('credit_updated', (data) {
      // Update credit display
      _handleCreditUpdate(data);
    });

    socket.on('notification_new', (data) {
      // Show push notification / update badge
      _handleNewNotification(data);
    });

    socket.connect();
  }

  void subscribeToTransaction(String transactionId) {
    socket.emit('subscribe_transaction', {'transaction_id': transactionId});
  }

  void ping() {
    socket.emit('ping');
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid or missing token |
| `AUTH_002` | Token expired |
| `AUTH_003` | Access denied |
| `VAL_001` | Validation error |
| `CUST_001` | Customer not found |
| `CUST_002` | Account suspended |
| `CRED_001` | Credit not available |
| `CRED_002` | Insufficient credit |
| `TXN_001` | Transaction not found |
| `TXN_002` | Transaction already confirmed |
| `TXN_003` | Transaction expired |
| `PAY_001` | Payment failed |
| `PAY_002` | Invalid amount |
| `PAY_006` | Payment not found |
| `SYS_001` | System error |

---

## App Features to Implement

### Core Features (Must Have)

1. **Authentication**
   - Login screen (username/password)
   - Token storage (secure storage)
   - Auto-refresh token
   - Logout

2. **Dashboard/Home**
   - Credit summary card (limit, available, used)
   - Recent transactions list
   - Quick pay button
   - Pending confirmations badge

3. **Transactions**
   - List all transactions (with filters)
   - Transaction details screen
   - Confirm/Reject pending transactions
   - Transaction timeline/history

4. **Payments**
   - Pay single transaction
   - Pay multiple transactions
   - Payment methods selection
   - Payment history
   - WebView for PayTabs payment page

5. **Notifications**
   - Notifications list
   - Mark as read
   - Push notifications (FCM)
   - Real-time updates via WebSocket

6. **Profile**
   - View profile
   - Edit profile
   - Change password
   - Language switch (AR/EN)

7. **Stores**
   - Browse partner merchants
   - Store details
   - Branch locations (map)

### Nice to Have Features

1. **Biometric Login** - Face ID / Fingerprint
2. **Credit Health** - Score visualization
3. **Payment Reminders** - Local notifications for due dates
4. **Transaction Search** - Search by reference/merchant
5. **Receipt Download** - PDF generation
6. **Dark Mode** - Theme support
7. **Offline Mode** - Cache recent data

---

## UI/UX Requirements

### Design Guidelines

1. **Language:** RTL layout for Arabic, LTR for English
2. **Colors:** Teal primary (#14B8A6), consistent with brand
3. **Typography:** Arabic-friendly fonts (Cairo, Tajawal)
4. **Components:** Material Design 3 / Cupertino for iOS feel

### Key Screens

1. Splash Screen
2. Login Screen
3. Home/Dashboard
4. Transactions List
5. Transaction Details
6. Payment Screen
7. Payment WebView
8. Notifications
9. Profile
10. Stores List
11. Store Details
12. Settings

---

## Testing Data

For development/testing, use these credentials:

```
Username: testcustomer
Password: Test123!
```

Test transaction flow:
1. Login
2. Merchant creates transaction (use merchant app/dashboard)
3. Customer receives real-time notification
4. Customer confirms transaction
5. Customer initiates payment
6. Complete payment on PayTabs page
7. Verify credit is restored

---

## Dependencies (Flutter packages)

```yaml
dependencies:
  # HTTP & API
  dio: ^5.0.0
  retrofit: ^4.0.0

  # State Management
  flutter_bloc: ^8.0.0  # or provider/riverpod

  # WebSocket
  socket_io_client: ^2.0.0

  # Storage
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.0.0

  # Push Notifications
  firebase_core: ^2.0.0
  firebase_messaging: ^14.0.0

  # UI
  flutter_localizations:
  intl: ^0.18.0
  cached_network_image: ^3.0.0
  shimmer: ^3.0.0

  # WebView (for payments)
  webview_flutter: ^4.0.0

  # Maps
  google_maps_flutter: ^2.0.0

  # Utils
  url_launcher: ^6.0.0
  connectivity_plus: ^5.0.0
```

---

## Notes for Developer

1. **Always handle RTL/LTR** - Use `Directionality` widget
2. **Token refresh** - Implement interceptor in Dio to auto-refresh
3. **WebSocket reconnection** - Handle disconnects gracefully
4. **Error handling** - Show user-friendly Arabic/English messages
5. **Loading states** - Use shimmer/skeleton screens
6. **Pull to refresh** - On all list screens
7. **Pagination** - Implement infinite scroll
8. **Deep linking** - Handle PayTabs callback URL
9. **Secure storage** - Never store tokens in plain SharedPreferences

---

## API Response Format

All API responses follow this format:

```json
// Success
{
  "success": true,
  "message": "Optional success message",
  "data": { ... },
  "meta": { ... }  // For paginated responses
}

// Error
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

Always check `success` field first before accessing `data`.
