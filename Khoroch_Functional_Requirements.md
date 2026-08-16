# Functional Requirements
## Khoroch — AI-Powered Expense Tracker

---

## 1. Authentication & User Profile

| ID | Requirement |
|----|-------------|
| FR-1.1 | Users can register, log in, and log out securely using email and password or OAuth providers. |
| FR-1.2 | The system must issue a secure token/JWT upon successful authentication to manage sessions. |
| FR-1.3 | The system must enforce role-based access control (`User`, `Admin`) across all protected API routes and pages. |
| FR-1.4 | Passwords must be securely hashed before storage, never stored in plain text. |
| FR-1.5 | Users can view and manage their profile details, preferences, and account settings. |
| FR-1.6 | The system must isolate financial records so standard users can only access their own data. |

---

## 2. Monthly Balance & Budget Management

| ID | Requirement |
|----|-------------|
| FR-2.1 | Users can set and update a fixed monthly starting balance/budget for any given month. |
| FR-2.2 | The system must maintain isolated records of balance, expenses, and transaction history for each month. |
| FR-2.3 | The dashboard must display starting balance, total spent, remaining balance, and budget utilization percentage. |
| FR-2.4 | The system must automatically recalculate and update remaining balance whenever an expense is confirmed, edited, or deleted (`Remaining Balance = Monthly Starting Balance - Total Confirmed Expenses`). |

---

## 3. Expense Management

| ID | Requirement |
|----|-------------|
| FR-3.1 | Users can create, update, and delete manual expense entries. |
| FR-3.2 | Expense creation must capture amount, date, time, category, subcategory, item/description, payment method, and optional notes. |
| FR-3.3 | Users can search, filter (by date range, category, payment method, amount), and sort expense records. |
| FR-3.4 | Users can view a paginated, comprehensive history of all their recorded expenses. |
| FR-3.5 | Only confirmed expenses must affect the monthly balance calculation; drafts or unconfirmed scans must not alter balances. |

---

## 4. Categories & Subcategories

| ID | Requirement |
|----|-------------|
| FR-4.1 | The system must provide predefined default expense categories (e.g., Food & Dining, Transportation, Housing, Shopping, Health & Medical, Bills & Subscriptions, etc.). |
| FR-4.2 | Each category must support configurable subcategories for granular tracking. |
| FR-4.3 | Users can select matching category and subcategory pairs during expense creation and editing. |
| FR-4.4 | Active categories assigned to existing expenses cannot be deleted without reassigning or handling historical transactions. |

---

## 5. AI Voice Expense Entry

| ID | Requirement |
|----|-------------|
| FR-5.1 | Dashboard must provide a one-click microphone action to record natural language voice input in supported languages (English & Bangla). |
| FR-5.2 | The system must convert speech to text and process it using AI to extract amount, category, subcategory, item/description, date, merchant, and payment method. |
| FR-5.3 | AI must support detecting and splitting multiple discrete expense items from a single voice prompt. |
| FR-5.4 | AI must request user clarification or highlight missing fields when required transaction details cannot be inferred. |
| FR-5.5 | The system must display an interactive Confirmation modal displaying parsed expense items before saving. |
| FR-5.6 | Users can edit, add, or remove fields and items in the confirmation modal before final submission. |
| FR-5.7 | Confirmed voice expenses are saved as active records, and the total confirmed amount is automatically deducted from the monthly balance. |

---

## 6. AI Receipt Scanning

| ID | Requirement |
|----|-------------|
| FR-6.1 | Users can upload receipt images (JPG/JPEG, PNG, WEBP) from the dashboard or expense entry screen. |
| FR-6.2 | The system must process receipt images with OCR and AI to extract merchant, date, total amount, line items, unit prices, quantities, taxes/discounts, category, subcategory, and payment method. |
| FR-6.3 | The system must present an interactive Receipt Confirmation modal displaying all extracted receipt metadata and line items. |
| FR-6.4 | Users can modify extracted merchant details, total amount, line items, categories, date, payment method, and notes. |
| FR-6.5 | Expenses are committed to the database only after user review and explicit confirmation. |
| FR-6.6 | Confirmed receipt expense totals are automatically deducted from the user's monthly balance. |
| FR-6.7 | The original receipt image must be stored securely and linked to the created expense record for auditing. |

---

## 7. Dashboard & Spending Analytics

| ID | Requirement |
|----|-------------|
| FR-7.1 | Dashboard must provide high-level metric cards: Monthly Starting Balance, Total Spending, Remaining Balance, and Spending Percentage. |
| FR-7.2 | Dashboard must provide quick action buttons for Manual Add Expense, AI Voice Entry, and Receipt Upload. |
| FR-7.3 | Dashboard must display recent transactions, category-wise breakdown charts, and spending trend visualizations. |
| FR-7.4 | Analytics view must provide daily, weekly, monthly, and custom date range spending breakdowns. |
| FR-7.5 | Analytics view must show highest spending areas, average transaction values, budget pace, and category distributions. |

---

## 8. Payment Methods

| ID | Requirement |
|----|-------------|
| FR-8.1 | The system must support configurable payment methods (Cash, Credit Card, Debit Card, Bank Transfer, bKash, Nagad, Rocket, Other). |
| FR-8.2 | Users can assign a payment method to each expense record. |
| FR-8.3 | Users can filter analytics and expense histories by payment method. |

---

## 9. Admin Panel

| ID | Requirement |
|----|-------------|
| FR-9.1 | Admin can view, search, filter, activate, deactivate, or delete user accounts. |
| FR-9.2 | Admin can manage user roles and permissions. |
| FR-9.3 | Admin can create, update, reorder, enable, disable, or delete categories and subcategories across the system. |
| FR-9.4 | Admin can manage default payment methods and configure currency/system parameters. |
| FR-9.5 | Admin can inspect all recorded expenses across the system with receipt attachments and correct or purge invalid records. |
| FR-9.6 | Admin can view platform-wide analytics: total/active users, aggregate spending, top categories, AI voice & receipt scanner usage, and system audit logs. |

---

## 10. System Safety, Security & Data Integrity

| ID | Requirement |
|----|-------------|
| FR-10.1 | All API endpoints must validate input data and return standardized error responses for invalid payloads. |
| FR-10.2 | AI-generated expenses (voice or receipt) must never be committed to financial records without explicit user confirmation. |
| FR-10.3 | Cancelled or failed AI operations must roll back cleanly and make zero mutations to user balances or logs. |
| FR-10.4 | Every expense must have a globally unique identifier (UUID) and maintain referential integrity with its user, category, and receipt attachments. |
| FR-10.5 | Uploaded receipt files must be stored securely (cloud/object storage with strict access policies) and accessible only to the owner and authorized Admins. |
| FR-10.6 | The system must emit notifications/alerts for critical events, including low remaining monthly balance, successful AI extractions, and receipt processing errors. |
| FR-10.7 | The system must log security events, errors, and critical financial mutations for traceability. |

---
