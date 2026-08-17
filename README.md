# Khoroch (খরচ) — AI-Powered Expense Tracker

<p align="center">
  <img src="frontend/public/logo-smooth-rounded.svg" alt="Khoroch Logo" width="180" />
</p>

<p align="center">
  <b>A modern, bilingual, intelligent personal finance manager tailored for Bangladesh & global workflows.</b><br />
  Powered by Next.js 15, React 19, NestJS, TypeORM, PostgreSQL, and Google Gemini AI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2015%20%7C%20React%2019-emerald?style=flat-square" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2010%20%7C%20TypeORM-blue?style=flat-square" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini%20Flash-orange?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/Language-English%20%7C%20বাংলা-green?style=flat-square" alt="Language" />
</p>

---

## ✨ Key Features

- **🎙️ Voice-to-Expense AI (বাংলা & English)**: Speak naturally (e.g. *"Uber ride 250 taka and dinner 450 taka বিকাশে দিলাম"*), and the AI automatically extracts merchants, amounts, categories, and payment channels into structured entries.
- **🧾 Receipt OCR & Instant Breakdown**: Upload physical receipt photos or invoices; Gemini Vision parses multi-item line totals, taxes, discounts, and stores receipts with Cloudinary.
- **📊 Interactive Analytics & Spending Trends**: Category distribution pie charts, 6-month trajectory bar charts, monthly cashflow metrics, and payment method share.
- **⚡ Utility Bills Tracker**: Keep track of electricity (DESCO/NESCO/DPDC), gas (Titas), water (WASA), and internet bills with 1-click status updates.
- **🔄 Recurring Subscriptions**: Monitor active software and entertainment memberships (Netflix, Spotify, ChatGPT Plus, Claude, Coursera) with upcoming renewal alerts.
- **🤝 Lend & Borrow Ledger (ধার ও দেনা)**: Detailed debt management with automatic balance calculation and 1-click settlement.
- **🎨 Modern Bilingual Experience**: Instant toggle between **English** and **বাংলা (Bangla)** with localized numbers (`০-৯`), dates, Bengali names, and Taka currency (`৳`).
- **🌓 Theme & Typography Customization**: Seamless Dark / Light mode switching, custom font pairing, and profile picture management.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + React 19
- **State Management**: Zustand with persistent storage
- **Styling**: Tailwind CSS + Custom CSS Variables Design System
- **Icons**: Phosphor Icons React
- **Data Visualization**: Recharts
- **Audio & Media**: Web Audio API / MediaRecorder + Cloudinary

### Backend
- **Framework**: NestJS (Modular Architecture)
- **Database & ORM**: PostgreSQL + TypeORM
- **Authentication**: JWT Auth Guard with Passport
- **AI Integrations**: Google Gemini Flash & Vision
- **File Uploads**: Multer + Cloudinary Storage Engine

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **PostgreSQL**: Running instance or Cloud Database (Neon / Supabase / ElephantSQL)
- **Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY

# Run database seeds (creates default categories, payment methods, demo data)
npm run seed

# Start development server
npm run start:dev
```
Backend runs on **`http://localhost:3001`**.

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Start development server
npm run dev
```
Frontend runs on **`http://localhost:3000`**.

---

## 📁 Project Structure

```text
khoroch-ai-powered-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── common/              # Guards, filters, interceptors, decorators
│   │   ├── config/              # Configuration services
│   │   ├── database/            # Entities, migrations, seeders
│   │   └── modules/
│   │       ├── ai/              # Voice parsing, receipt OCR, AI insights
│   │       ├── auth/            # Registration, login, JWT strategies
│   │       ├── bills/           # Utility bills tracking
│   │       ├── budgets/         # Monthly budget limits
│   │       ├── categories/      # Category taxonomy & icons
│   │       ├── expenses/        # Expense ledger CRUD & filtering
│   │       ├── loans/           # Lend & borrow debt ledger
│   │       ├── payment-methods/ # bKash, Nagad, Cards, Cash channels
│   │       ├── subscriptions/   # Recurring subscriptions
│   │       └── users/           # User profile & avatar management
├── frontend/
│   ├── public/                  # SVG wordmarks, payment logos, icons
│   └── src/
│       ├── app/
│       │   ├── admin/           # Admin user management
│       │   ├── analytics/       # Visual breakdown & insights
│       │   ├── bills/           # Utility bill manager
│       │   ├── expenses/        # Main expense ledger
│       │   ├── loans/           # Lend & borrow tracker
│       │   ├── login/           # Auth login
│       │   ├── profile/         # User profile & picture upload
│       │   ├── register/        # Auth registration
│       │   ├── settings/        # Preferences & appearance
│       │   └── subscriptions/   # Subscription manager
│       ├── components/          # Sidebar, modals (voice, receipt, expense), charts
│       ├── lib/                 # Axios instance & bilingual i18n dictionaries
│       └── store/               # Zustand application store
└── README.md
```

---

## 🔒 Default Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@khoroch.app` | `Admin@123` |
| **Demo User** | `tarek@khoroch.app` | `User@123` |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
