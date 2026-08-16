# Khoroch — API Specification
## AI-Powered Expense Tracker REST API

---

## Overview

This document specifies the REST API endpoints, request/response schemas, query parameters, authentication mechanisms, and status codes for the **Khoroch** backend application (NestJS).

- **Base URL**: `/api/v1`
- **Authentication**: Bearer Token (`Authorization: Bearer <jwt_access_token>`)
- **Content-Type**: `application/json` (except multipart file uploads)
- **Standard Response Format**: All responses follow a consistent JSON envelope structure.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2026-08-16T09:00:00.000Z"
}
```

---

## API Summary Table

| Category | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register a new user account |
| | `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue JWT |
| | `POST` | `/api/v1/auth/refresh` | Public (Refresh Token) | Refresh expired access token |
| | `POST` | `/api/v1/auth/logout` | Authenticated | Invalidate refresh token / logout |
| **User & Profile** | `GET` | `/api/v1/users/me` | Authenticated | Get current user profile & preferences |
| | `PATCH` | `/api/v1/users/me` | Authenticated | Update user profile & preferences |
| | `PATCH` | `/api/v1/users/me/password` | Authenticated | Change user password |
| | `POST` | `/api/v1/users/me/avatar` | Authenticated | Upload user profile picture |
| **Monthly Budget** | `GET` | `/api/v1/budgets/summary` | Authenticated | Get budget summary & remaining balance |
| | `GET` | `/api/v1/budgets` | Authenticated | List all monthly budget history |
| | `POST` | `/api/v1/budgets` | Authenticated | Set/initialize monthly starting budget |
| | `PATCH` | `/api/v1/budgets/:id` | Authenticated | Update monthly starting balance |
| **Expenses** | `GET` | `/api/v1/expenses` | Authenticated | List & filter user expenses (paginated) |
| | `GET` | `/api/v1/expenses/:id` | Authenticated | Get single expense details with items |
| | `POST` | `/api/v1/expenses` | Authenticated | Create a manual expense |
| | `POST` | `/api/v1/expenses/batch-confirm` | Authenticated | Bulk confirm AI-generated expenses |
| | `PATCH` | `/api/v1/expenses/:id` | Authenticated | Update existing expense details |
| | `DELETE` | `/api/v1/expenses/:id` | Authenticated | Delete an expense (recalculates balance) |
| **AI Voice Entry** | `POST` | `/api/v1/ai/voice/parse` | Authenticated | Transcribe & extract expense from voice audio/text |
| **AI Receipt Scanning**| `POST` | `/api/v1/ai/receipts/scan` | Authenticated | Upload receipt image, run OCR & AI extraction |
| | `GET` | `/api/v1/receipts/:id` | Authenticated | Get receipt metadata & status |
| **Categories** | `GET` | `/api/v1/categories` | Authenticated | List enabled categories & subcategories |
| **Payment Methods**| `GET` | `/api/v1/payment-methods` | Authenticated | List enabled payment methods |
| **Analytics & Dashboard** | `GET` | `/api/v1/analytics/dashboard` | Authenticated | High-level metrics, trends, recent transactions |
| | `GET` | `/api/v1/analytics/breakdown` | Authenticated | Category & payment method spending breakdown |
| | `GET` | `/api/v1/analytics/trends` | Authenticated | Time-series spending trends (daily/weekly/monthly) |
| **Admin: Users** | `GET` | `/api/v1/admin/users` | Admin Only | List, filter, search all users |
| | `GET` | `/api/v1/admin/users/:id` | Admin Only | Get single user full profile & spending summary |
| | `PATCH` | `/api/v1/admin/users/:id/status`| Admin Only | Activate or deactivate a user account |
| | `PATCH` | `/api/v1/admin/users/:id/role` | Admin Only | Change user role (`user` / `admin`) |
| | `DELETE` | `/api/v1/admin/users/:id` | Admin Only | Delete user account and associated data |
| **Admin: Categories** | `POST` | `/api/v1/admin/categories` | Admin Only | Create a new category |
| | `PATCH` | `/api/v1/admin/categories/:id` | Admin Only | Update category name, icon, order, status |
| | `DELETE` | `/api/v1/admin/categories/:id` | Admin Only | Delete category (restricted if in use) |
| | `POST` | `/api/v1/admin/categories/:id/subcategories` | Admin Only | Create subcategory under parent category |
| | `PATCH` | `/api/v1/admin/subcategories/:id` | Admin Only | Update subcategory name, order, status |
| | `DELETE` | `/api/v1/admin/subcategories/:id` | Admin Only | Delete subcategory (restricted if in use) |
| **Admin: Payments** | `POST` | `/api/v1/admin/payment-methods` | Admin Only | Create a new payment method |
| | `PATCH` | `/api/v1/admin/payment-methods/:id` | Admin Only | Update payment method name, default, status |
| | `DELETE` | `/api/v1/admin/payment-methods/:id` | Admin Only | Delete payment method |
| **Admin: Expenses** | `GET` | `/api/v1/admin/expenses` | Admin Only | View and audit expenses across all users |
| | `DELETE` | `/api/v1/admin/expenses/:id` | Admin Only | Force delete an invalid expense record |
| **Admin: Analytics** | `GET` | `/api/v1/admin/analytics/overview` | Admin Only | Platform-wide stats (users, total volume, AI usage) |
| | `GET` | `/api/v1/admin/analytics/ai-logs` | Admin Only | View AI processing audit logs |
| **Admin: Settings** | `GET` | `/api/v1/admin/settings` | Admin Only | Get all system configuration settings |
| | `PATCH` | `/api/v1/admin/settings/:key` | Admin Only | Update specific system configuration setting |

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method & Route**: `POST /api/v1/auth/register`
- **Access**: Public
- **Description**: Registers a new user account with default BDT currency and preferred locale.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "Tarek",
  "lastName": "Rahman",
  "preferredCurrency": "BDT",
  "preferredLocale": "en"
}
```

**Success Response (`201 Created`)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "user@example.com",
      "firstName": "Tarek",
      "lastName": "Rahman",
      "role": "user",
      "preferredCurrency": "BDT",
      "preferredLocale": "en"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 User Login
- **Method & Route**: `POST /api/v1/auth/login`
- **Access**: Public
- **Description**: Authenticates user credentials and returns access & refresh tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "user@example.com",
      "firstName": "Tarek",
      "lastName": "Rahman",
      "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
      "role": "user",
      "preferredCurrency": "BDT",
      "preferredLocale": "en"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.3 Refresh Access Token
- **Method & Route**: `POST /api/v1/auth/refresh`
- **Access**: Public (Requires valid Refresh Token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.4 User Logout
- **Method & Route**: `POST /api/v1/auth/logout`
- **Access**: Authenticated

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

## 2. User & Profile Endpoints

### 2.1 Get Current User Profile
- **Method & Route**: `GET /api/v1/users/me`
- **Access**: Authenticated

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "user@example.com",
    "firstName": "Tarek",
    "lastName": "Rahman",
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
    "role": "user",
    "preferredCurrency": "BDT",
    "preferredLocale": "en",
    "createdAt": "2026-08-01T10:00:00.000Z",
    "lastLoginAt": "2026-08-16T08:00:00.000Z"
  }
}
```

---

### 2.2 Update Profile & Preferences
- **Method & Route**: `PATCH /api/v1/users/me`
- **Access**: Authenticated

**Request Body**:
```json
{
  "firstName": "Tarek",
  "lastName": "Hasan",
  "preferredCurrency": "BDT",
  "preferredLocale": "bn"
}
```

---

### 2.3 Change Password
- **Method & Route**: `PATCH /api/v1/users/me/password`
- **Access**: Authenticated

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewStrongPassword456!"
}
```

---

### 2.4 Upload Profile Avatar
- **Method & Route**: `POST /api/v1/users/me/avatar`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`

**Request Body**: Form-data field `avatar` (image file: jpg/png/webp, max 5MB).

---

## 3. Monthly Balance & Budget Endpoints

### 3.1 Get Monthly Budget Summary & Remaining Balance
- **Method & Route**: `GET /api/v1/budgets/summary`
- **Access**: Authenticated
- **Query Parameters**:
  - `month` (integer, 1-12, default: current month)
  - `year` (integer, e.g. 2026, default: current year)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "budgetId": "b1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "month": 8,
    "year": 2026,
    "currency": "BDT",
    "startingBalance": 50000.00,
    "totalSpent": 18450.00,
    "remainingBalance": 31550.00,
    "spendingPercentage": 36.90,
    "isOverBudget": false,
    "isLowBalance": false
  }
}
```

---

### 3.2 List Budget History
- **Method & Route**: `GET /api/v1/budgets`
- **Access**: Authenticated
- **Query Parameters**: `year` (optional filter)

---

### 3.3 Set Monthly Starting Balance
- **Method & Route**: `POST /api/v1/budgets`
- **Access**: Authenticated
- **Description**: Sets or initializes the budget/starting balance for a given month and year.

**Request Body**:
```json
{
  "month": 8,
  "year": 2026,
  "startingBalance": 50000.00,
  "currency": "BDT"
}
```

---

### 3.4 Update Monthly Starting Balance
- **Method & Route**: `PATCH /api/v1/budgets/:id`
- **Access**: Authenticated

**Request Body**:
```json
{
  "startingBalance": 55000.00
}
```

---

## 4. Expense Management Endpoints

### 4.1 List Expenses (Paginated & Filterable)
- **Method & Route**: `GET /api/v1/expenses`
- **Access**: Authenticated
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `month` (1-12)
  - `year` (e.g., 2026)
  - `startDate` (YYYY-MM-DD)
  - `endDate` (YYYY-MM-DD)
  - `categoryId` (UUID)
  - `paymentMethodId` (UUID)
  - `source` (`manual` | `voice` | `receipt`)
  - `isConfirmed` (boolean, default: true)
  - `search` (string, searches merchant, description, notes)
  - `sortBy` (`expense_date` | `amount` | `created_at`, default: `expense_date`)
  - `sortOrder` (`ASC` | `DESC`, default: `DESC`)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "e1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "amount": 1250.00,
        "currency": "BDT",
        "description": "Weekly grocery shopping",
        "merchant": "Shwapno",
        "expenseDate": "2026-08-15",
        "expenseTime": "18:30:00",
        "source": "receipt",
        "isConfirmed": true,
        "receiptUrl": "https://res.cloudinary.com/.../receipt.jpg",
        "category": {
          "id": "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Food & Dining",
          "nameBn": "খাবার ও রেস্তোরাঁ",
          "icon": "utensils",
          "color": "#FF6B6B"
        },
        "subcategory": {
          "id": "s1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Groceries",
          "nameBn": "মুদি সামগ্রী"
        },
        "paymentMethod": {
          "id": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "bKash",
          "nameBn": "বিকাশ"
        },
        "createdAt": "2026-08-15T18:35:00.000Z"
      }
    ],
    "meta": {
      "totalItems": 45,
      "itemCount": 20,
      "itemsPerPage": 20,
      "totalPages": 3,
      "currentPage": 1
    }
  }
}
```

---

### 4.2 Get Expense Details
- **Method & Route**: `GET /api/v1/expenses/:id`
- **Access**: Authenticated
- **Description**: Returns detailed single expense info including itemized breakdown (for receipt scans).

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "e1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "amount": 850.00,
    "currency": "BDT",
    "description": "Daily essentials",
    "merchant": "Agora",
    "notes": "Paid with bKash offer discount",
    "expenseDate": "2026-08-15",
    "expenseTime": "14:20:00",
    "source": "receipt",
    "isConfirmed": true,
    "receiptUrl": "https://res.cloudinary.com/.../receipt.jpg",
    "category": { "id": "uuid", "name": "Food & Dining" },
    "subcategory": { "id": "uuid", "name": "Groceries" },
    "paymentMethod": { "id": "uuid", "name": "bKash" },
    "items": [
      {
        "id": "item-uuid-1",
        "name": "Miniket Rice 5kg",
        "quantity": 1,
        "unitPrice": 450.00,
        "totalPrice": 450.00
      },
      {
        "id": "item-uuid-2",
        "name": "Farm Eggs 12pcs",
        "quantity": 1,
        "unitPrice": 180.00,
        "totalPrice": 180.00
      },
      {
        "id": "item-uuid-3",
        "name": "Soybean Oil 1L",
        "quantity": 1,
        "unitPrice": 220.00,
        "totalPrice": 220.00
      }
    ]
  }
}
```

---

### 4.3 Create Manual Expense
- **Method & Route**: `POST /api/v1/expenses`
- **Access**: Authenticated
- **Description**: Creates a confirmed manual expense and deducts amount from the monthly budget.

**Request Body**:
```json
{
  "amount": 350.00,
  "currency": "BDT",
  "categoryId": "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "subcategoryId": "s1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "paymentMethodId": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "description": "Lunch at restaurant",
  "merchant": "KFC Dhanmondi",
  "notes": "With colleagues",
  "expenseDate": "2026-08-16",
  "expenseTime": "13:30:00"
}
```

---

### 4.4 Batch Confirm AI-Generated Expenses
- **Method & Route**: `POST /api/v1/expenses/batch-confirm`
- **Access**: Authenticated
- **Description**: Confirms one or multiple expenses parsed from AI Voice or Receipt scanning and commits them to the database.

**Request Body**:
```json
{
  "source": "voice",
  "aiLogId": "log-uuid-1234",
  "receiptId": null,
  "expenses": [
    {
      "amount": 250.00,
      "currency": "BDT",
      "categoryId": "c1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "subcategoryId": "s1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "paymentMethodId": "p1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "CNG Ride to office",
      "merchant": "Local CNG",
      "expenseDate": "2026-08-16",
      "expenseTime": "09:15:00",
      "items": []
    },
    {
      "amount": 120.00,
      "currency": "BDT",
      "categoryId": "c2b2c3d4-e5f6-7890-abcd-ef1234567890",
      "subcategoryId": null,
      "paymentMethodId": "p2b2c3d4-e5f6-7890-abcd-ef1234567890",
      "description": "Morning coffee and biscuits",
      "merchant": "Tea Stall",
      "expenseDate": "2026-08-16",
      "expenseTime": "10:00:00",
      "items": []
    }
  ]
}
```

---

### 4.5 Update Expense
- **Method & Route**: `PATCH /api/v1/expenses/:id`
- **Access**: Authenticated
- **Description**: Modifies expense attributes. Recalculates monthly budget remaining balance accordingly.

**Request Body**:
```json
{
  "amount": 400.00,
  "description": "Lunch + Dessert",
  "categoryId": "c1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

### 4.6 Delete Expense
- **Method & Route**: `DELETE /api/v1/expenses/:id`
- **Access**: Authenticated
- **Description**: Deletes the expense record and restores the amount to the user's monthly remaining balance.

---

## 5. AI Voice Expense Entry Endpoints

### 5.1 Parse Voice Input (Audio or Transcribed Text)
- **Method & Route**: `POST /api/v1/ai/voice/parse`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data` (if audio file) OR `application/json` (if client-side transcript text)

**JSON Request Body (Text Mode)**:
```json
{
  "text": "আজকে সকালে রিকশা ভাড়া ৫০ টাকা এবং দুপুরে কাচ্চি খেলাম ৩৫০ টাকা বিকাশ দিয়ে",
  "language": "bn"
}
```

**Multipart Request (Audio File Mode)**:
- Field: `audio` (audio/webm, audio/wav, audio/mp3, audio/m4a, max 10MB)
- Field: `language` (`bn` | `en` | `auto`)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "aiLogId": "log-uuid-1234",
    "transcription": "আজকে সকালে রিকশা ভাড়া ৫০ টাকা এবং দুপুরে কাচ্চি খেলাম ৩৫০ টাকা বিকাশ দিয়ে",
    "detectedLanguage": "bn",
    "confidence": 0.95,
    "parsedExpenses": [
      {
        "tempId": "temp-1",
        "amount": 50.00,
        "currency": "BDT",
        "description": "রিকশা ভাড়া",
        "categorySuggested": {
          "id": "c_transport_uuid",
          "name": "Transportation"
        },
        "subcategorySuggested": {
          "id": "s_rickshaw_uuid",
          "name": "Rickshaw"
        },
        "paymentMethodSuggested": {
          "id": "p_cash_uuid",
          "name": "Cash"
        },
        "merchant": null,
        "expenseDate": "2026-08-16"
      },
      {
        "tempId": "temp-2",
        "amount": 350.00,
        "currency": "BDT",
        "description": "কাচ্চি খেলাম",
        "categorySuggested": {
          "id": "c_food_uuid",
          "name": "Food & Dining"
        },
        "subcategorySuggested": null,
        "paymentMethodSuggested": {
          "id": "p_bkash_uuid",
          "name": "bKash"
        },
        "merchant": null,
        "expenseDate": "2026-08-16"
      }
    ],
    "missingFieldsWarning": false
  }
}
```

---

## 6. AI Receipt Scanning Endpoints

### 6.1 Upload & Scan Receipt Image
- **Method & Route**: `POST /api/v1/ai/receipts/scan`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Receipt image file (`image/jpeg`, `image/png`, `image/webp`, max 10MB)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "receiptId": "rec-uuid-1234",
    "fileUrl": "https://res.cloudinary.com/khoroch/image/upload/v1/receipts/rec-1234.jpg",
    "aiLogId": "log-uuid-5678",
    "extractedData": {
      "merchant": "Shwapno Super Shop",
      "date": "2026-08-15",
      "subtotal": 850.00,
      "tax": 42.50,
      "discount": 0.00,
      "totalAmount": 892.50,
      "currency": "BDT",
      "paymentMethodSuggested": {
        "id": "p_bkash_uuid",
        "name": "bKash"
      },
      "categorySuggested": {
        "id": "c_food_uuid",
        "name": "Food & Dining"
      },
      "subcategorySuggested": {
        "id": "s_groceries_uuid",
        "name": "Groceries"
      },
      "items": [
        {
          "name": "Miniket Rice 5kg",
          "quantity": 1,
          "unitPrice": 450.00,
          "totalPrice": 450.00
        },
        {
          "name": "Egg Box 12pcs",
          "quantity": 1,
          "unitPrice": 180.00,
          "totalPrice": 180.00
        },
        {
          "name": "Rupchanda Oil 1L",
          "quantity": 1,
          "unitPrice": 220.00,
          "totalPrice": 220.00
        }
      ],
      "confidence": 0.94,
      "detectedLanguage": "en"
    }
  }
}
```

---

### 6.2 Get Receipt Details
- **Method & Route**: `GET /api/v1/receipts/:id`
- **Access**: Authenticated

---

## 7. Categories & Payment Methods (Public/User)

### 7.1 List All Enabled Categories & Subcategories
- **Method & Route**: `GET /api/v1/categories`
- **Access**: Authenticated
- **Description**: Returns all enabled categories with their nested subcategories.

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "c_food_uuid",
      "name": "Food & Dining",
      "nameBn": "খাবার ও রেস্তোরাঁ",
      "icon": "utensils",
      "color": "#FF6B6B",
      "sortOrder": 1,
      "subcategories": [
        {
          "id": "s_groceries_uuid",
          "name": "Groceries",
          "nameBn": "মুদি সামগ্রী",
          "sortOrder": 1
        },
        {
          "id": "s_restaurant_uuid",
          "name": "Restaurant",
          "nameBn": "রেস্তোরাঁ",
          "sortOrder": 2
        }
      ]
    }
  ]
}
```

---

### 7.2 List All Enabled Payment Methods
- **Method & Route**: `GET /api/v1/payment-methods`
- **Access**: Authenticated

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "p_cash_uuid",
      "name": "Cash",
      "nameBn": "নগদ অর্থ",
      "icon": "banknote",
      "isDefault": true
    },
    {
      "id": "p_bkash_uuid",
      "name": "bKash",
      "nameBn": "বিকাশ",
      "icon": "smartphone",
      "isDefault": false
    }
  ]
}
```

---

## 8. Dashboard & Spending Analytics Endpoints

### 8.1 Get Dashboard Overview Analytics
- **Method & Route**: `GET /api/v1/analytics/dashboard`
- **Access**: Authenticated
- **Query Parameters**: `month` (1-12), `year` (e.g. 2026)

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "budget": {
      "startingBalance": 50000.00,
      "totalSpent": 18450.00,
      "remainingBalance": 31550.00,
      "spendingPercentage": 36.90
    },
    "recentExpenses": [
      {
        "id": "e1_uuid",
        "amount": 850.00,
        "description": "Groceries",
        "categoryName": "Food & Dining",
        "categoryColor": "#FF6B6B",
        "expenseDate": "2026-08-15",
        "paymentMethod": "bKash"
      }
    ],
    "topCategories": [
      {
        "categoryId": "c_food_uuid",
        "categoryName": "Food & Dining",
        "categoryColor": "#FF6B6B",
        "totalSpent": 8200.00,
        "percentage": 44.44
      },
      {
        "categoryId": "c_transport_uuid",
        "categoryName": "Transportation",
        "categoryColor": "#4ECDC4",
        "totalSpent": 3500.00,
        "percentage": 18.97
      }
    ]
  }
}
```

---

### 8.2 Get Category & Subcategory Breakdown
- **Method & Route**: `GET /api/v1/analytics/breakdown`
- **Access**: Authenticated
- **Query Parameters**:
  - `startDate` (YYYY-MM-DD)
  - `endDate` (YYYY-MM-DD)
  - `groupBy` (`category` | `subcategory` | `payment_method`)

---

### 8.3 Get Spending Trends
- **Method & Route**: `GET /api/v1/analytics/trends`
- **Access**: Authenticated
- **Query Parameters**:
  - `period` (`daily` | `weekly` | `monthly`, default: `daily`)
  - `startDate` (YYYY-MM-DD)
  - `endDate` (YYYY-MM-DD)

---

## 9. Admin Panel Endpoints

### 9.1 Admin User Management

#### 9.1.1 List All Users
- **Method & Route**: `GET /api/v1/admin/users`
- **Access**: Admin Only
- **Query Parameters**: `page`, `limit`, `search`, `role`, `isActive`, `sortBy`, `sortOrder`

#### 9.1.2 Get Single User Profile & Spend Summary
- **Method & Route**: `GET /api/v1/admin/users/:id`
- **Access**: Admin Only

#### 9.1.3 Toggle User Active Status
- **Method & Route**: `PATCH /api/v1/admin/users/:id/status`
- **Access**: Admin Only

**Request Body**:
```json
{
  "isActive": false
}
```

#### 9.1.4 Update User Role
- **Method & Route**: `PATCH /api/v1/admin/users/:id/role`
- **Access**: Admin Only

**Request Body**:
```json
{
  "role": "admin"
}
```

#### 9.1.5 Delete User Account
- **Method & Route**: `DELETE /api/v1/admin/users/:id`
- **Access**: Admin Only

---

### 9.2 Admin Category & Subcategory Management

#### 9.2.1 Create Category
- **Method & Route**: `POST /api/v1/admin/categories`
- **Access**: Admin Only

**Request Body**:
```json
{
  "name": "Utilities",
  "nameBn": "ইউটিলিটি",
  "icon": "zap",
  "color": "#F59E0B",
  "sortOrder": 16,
  "isEnabled": true
}
```

#### 9.2.2 Update Category
- **Method & Route**: `PATCH /api/v1/admin/categories/:id`
- **Access**: Admin Only

#### 9.2.3 Delete Category
- **Method & Route**: `DELETE /api/v1/admin/categories/:id`
- **Access**: Admin Only
- **Constraint**: Returns `400 Bad Request` if category is currently referenced in existing expenses or subcategories.

#### 9.2.4 Create Subcategory
- **Method & Route**: `POST /api/v1/admin/categories/:id/subcategories`
- **Access**: Admin Only

**Request Body**:
```json
{
  "name": "Electricity Bill",
  "nameBn": "বিদ্যুৎ বিল",
  "sortOrder": 1,
  "isEnabled": true
}
```

#### 9.2.5 Update Subcategory
- **Method & Route**: `PATCH /api/v1/admin/subcategories/:id`
- **Access**: Admin Only

#### 9.2.6 Delete Subcategory
- **Method & Route**: `DELETE /api/v1/admin/subcategories/:id`
- **Access**: Admin Only

---

### 9.3 Admin Payment Method Management

#### 9.3.1 Create Payment Method
- **Method & Route**: `POST /api/v1/admin/payment-methods`
- **Access**: Admin Only

**Request Body**:
```json
{
  "name": "Upay",
  "nameBn": "উপায়",
  "icon": "wallet",
  "sortOrder": 9,
  "isEnabled": true,
  "isDefault": false
}
```

#### 9.3.2 Update Payment Method
- **Method & Route**: `PATCH /api/v1/admin/payment-methods/:id`
- **Access**: Admin Only

#### 9.3.3 Delete Payment Method
- **Method & Route**: `DELETE /api/v1/admin/payment-methods/:id`
- **Access**: Admin Only

---

### 9.4 Admin Expense Audit & Management

#### 9.4.1 List All Platform Expenses
- **Method & Route**: `GET /api/v1/admin/expenses`
- **Access**: Admin Only
- **Query Parameters**: `page`, `limit`, `userId`, `categoryId`, `source`, `startDate`, `endDate`

#### 9.4.2 Force Delete Expense
- **Method & Route**: `DELETE /api/v1/admin/expenses/:id`
- **Access**: Admin Only

---

### 9.5 Admin Analytics & Logs

#### 9.5.1 Platform Overview Analytics
- **Method & Route**: `GET /api/v1/admin/analytics/overview`
- **Access**: Admin Only

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 980,
    "totalExpensesCount": 45200,
    "totalVolumeTracked": 12845000.00,
    "aiVoiceUsageCount": 18200,
    "receiptScansCount": 14350,
    "currency": "BDT"
  }
}
```

#### 9.5.2 List AI Processing Logs
- **Method & Route**: `GET /api/v1/admin/analytics/ai-logs`
- **Access**: Admin Only
- **Query Parameters**: `page`, `limit`, `type` (`voice` | `receipt`), `wasConfirmed`, `userId`

---

### 9.6 Admin System Settings

#### 9.6.1 Get System Settings
- **Method & Route**: `GET /api/v1/admin/settings`
- **Access**: Admin Only

**Success Response (`200 OK`)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "default_currency": "BDT",
    "supported_currencies": ["BDT", "USD"],
    "supported_locales": ["en", "bn"],
    "max_receipt_size_bytes": 10485760,
    "low_balance_threshold_pct": 10
  }
}
```

#### 9.6.2 Update System Setting
- **Method & Route**: `PATCH /api/v1/admin/settings/:key`
- **Access**: Admin Only

**Request Body**:
```json
{
  "value": 15
}
```

---

## 10. HTTP Status & Error Codes

| Status Code | Code | Meaning |
| :--- | :--- | :--- |
| `200 OK` | `SUCCESS` | Request succeeded |
| `201 Created` | `CREATED` | Resource successfully created |
| `400 Bad Request` | `VALIDATION_ERROR` / `BAD_REQUEST` | Invalid payload or business rule violation |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing or invalid Bearer JWT |
| `403 Forbidden` | `FORBIDDEN` | Insufficient permissions (e.g. non-admin accessing admin route) |
| `404 Not Found` | `NOT_FOUND` | Requested entity does not exist |
| `409 Conflict` | `CONFLICT` | Unique constraint conflict (e.g. duplicate email, budget period) |
| `422 Unprocessable Entity` | `AI_PARSING_FAILED` | AI could not extract valid expenses from audio/receipt |
| `500 Internal Server Error` | `INTERNAL_ERROR` | Unexpected server failure |

**Standard Error Response Format**:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "amount must be a positive number",
    "categoryId must be a valid UUID"
  ],
  "timestamp": "2026-08-16T09:00:00.000Z",
  "path": "/api/v1/expenses"
}
```

---
