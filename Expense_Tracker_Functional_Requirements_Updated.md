# Expense Tracker — Functional Requirements

## 1. Authentication & User Profile
- User registration, login, logout, and secure authentication.
- Profile management.
- Role-based access: `User` and `Admin`.
- Users can access only their own financial data.

## 2. Monthly Balance & Budget
- Users can set a fixed monthly starting balance/budget.
- Each month maintains its own balance, expenses, and spending history.
- Dashboard shows starting balance, total spent, remaining balance, and spending percentage.
- Balance updates automatically after every confirmed expense.

```text
Remaining Balance = Monthly Starting Balance - Total Confirmed Expenses
```

## 3. Expense Management
Users can:
- Add, edit, and delete expenses.
- Set amount, date, time, category, subcategory, items/description, payment method, and notes.
- Search and filter expenses.
- View complete expense history.
- Only confirmed expenses affect the balance.

## 4. Categories & Subcategories
Default categories may include:
- Food & Dining
- Transportation
- Housing
- Shopping
- Health & Medical
- Education
- Entertainment
- Travel
- Bills & Subscriptions
- Financial
- Family & Personal
- Pets
- Work & Business
- Gifts & Donations
- Other

Categories contain configurable subcategories.

## 5. AI Voice Expense Entry
- Dashboard provides a microphone button.
- Users can describe one or multiple expenses naturally.
- Speech is converted to text and processed by AI.
- AI extracts amount, category, subcategory, item/description, date, and merchant/payment method when available.
- AI can detect multiple expenses from one voice input.
- AI requests clarification when required information is missing.

### Voice Confirmation
- A confirmation modal appears after speaking ends.
- Users can edit, remove, or complete detected fields.
- Expenses are created only after confirmation.
- The total confirmed amount is automatically deducted from the monthly balance.

## 6. AI Receipt Scanning
- Users can upload receipt images from the dashboard.
- Support JPG/JPEG, PNG, and WEBP.
- AI/OCR extracts merchant, date, total, items, prices, quantities, category, subcategory, tax/discount, and payment method when available.
- A confirmation modal displays the extracted information.
- Users can edit merchant, amount, category, subcategory, items, prices, date, payment method, and notes.
- Users can add/remove items.
- Expense is created only after confirmation.
- Confirmed amount is automatically deducted from the monthly balance.
- Original receipt can be associated with the expense.

## 7. Dashboard
Displays:
- Monthly starting balance
- Remaining balance
- Total spending
- Spending percentage
- Recent expenses
- Category-wise spending
- Spending trends
- Add Expense button
- AI Voice button
- Receipt Upload button

## 8. Spending Analytics
Users can view:
- Daily, weekly, and monthly spending.
- Category/subcategory spending.
- Highest and average expenses.
- Budget utilization.
- Spending trends and category distribution.

## 9. Payment Methods
Support configurable methods such as:
- Cash
- Credit Card
- Debit Card
- Bank Transfer
- bKash
- Nagad
- Rocket
- Other

## 10. Admin Panel

### User Management
- View, search, and filter users.
- View profiles and spending activity.
- Activate/deactivate users.
- Delete users.
- Manage user roles.
- View account/activity information.

### Category Management
- Create, edit, delete, enable/disable categories.
- Create, edit, and delete subcategories.
- Reorder categories.
- Prevent deletion of actively used categories unless expenses are reassigned.

### Payment Method Management
- Create, edit, enable/disable, and delete payment methods.
- Manage default payment methods.

### Expense Management
- View expenses across the system.
- Search and filter expenses.
- View expense details and receipts.
- Correct or remove invalid records when necessary.

### System Settings
- Manage default categories and subcategories.
- Manage default payment methods.
- Configure supported currencies and application settings.

### Admin Analytics
Admins can view:
- Total and active users.
- Total expenses and recorded spending.
- Most-used categories.
- Monthly spending trends.
- AI voice usage.
- Receipt scanning usage.
- Recent system activity.

## 11. Notifications & Error Handling
Provide feedback for:
- Successful expense operations.
- Successful AI processing.
- Receipt processing failures.
- Invalid/unreadable receipts.
- AI uncertainty or missing information.
- Low remaining balance.

## 12. AI Confirmation & Safety
- AI-generated expenses must never be recorded without user confirmation.
- Users can correct AI-generated information.
- Invalid or incomplete expense data cannot be submitted.
- Cancelled AI operations must not modify financial data.

## 13. Data Integrity & Security
- Every expense has a unique identifier.
- Users can access only their own financial data.
- Admin access requires role-based authorization.
- Editing/deleting expenses recalculates the monthly balance.
- Unconfirmed expenses never affect the balance.
- Receipt images are stored securely.
- Monthly balances remain consistent with confirmed expense records.

## 14. Core Processing Flows

### Manual Expense
```text
Add Expense → Enter Details → Confirm → Save → Deduct Amount → Update Balance
```

### AI Voice
```text
Microphone → Speech-to-Text → AI Extraction → Confirmation Modal
→ Edit/Confirm → Save Expenses → Deduct Total → Update Balance
```

### AI Receipt
```text
Upload Receipt → OCR → AI Analysis → Confirmation Modal
→ Edit/Confirm → Save Expense → Deduct Amount → Update Balance
```

## 15. Primary Business Rule

> **Every confirmed expense—manual, voice-generated, or receipt-generated—must automatically affect the user's monthly remaining balance.**

```text
Remaining Balance
=
Monthly Starting Balance
-
Sum of All Confirmed Expenses for That Month
```
