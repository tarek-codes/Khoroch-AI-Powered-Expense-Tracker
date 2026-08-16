# Expense Tracker — Tech Stack

## Overview

This document defines the complete technology stack for the Expense Tracker application. The architecture follows a decoupled **frontend–backend** model with a **relational database**, integrated **AI/ML services**, and **cloud-ready infrastructure**.

> **Bilingual Support**: The application fully supports **English** and **Bangla (বাংলা)** across all user-facing surfaces — including UI text, voice input, and receipt scanning.

---

## Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│                     Next.js 16 (React 19)                       │
│         SSR · App Router · Server Actions · RSC                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTPS / REST + WebSocket
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API Server (NestJS)                          │
│        Controllers · Services · Guards · Pipes · Interceptors   │
│        JWT Auth · RBAC · Validation · Rate Limiting             │
├──────────────┬───────────────┬───────────────┬──────────────────┤
│   TypeORM    │  AI Services  │ File Storage  │  Notifications   │
│  PostgreSQL  │  Google AI    │  Cloudinary   │  WebSocket/SSE   │
└──────────────┴───────────────┴───────────────┴──────────────────┘
```

---

## 1. Frontend — Next.js 16

| Concern             | Technology                    | Purpose                                                                  |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| **Framework**        | Next.js 16 (App Router)       | SSR, SSG, RSC, Server Actions, file-based routing                        |
| **Language**         | TypeScript 5.x               | Type safety across the entire frontend codebase                          |
| **UI Library**       | React 19                      | Component-based UI with Server Components & concurrent features          |
| **Styling**          | Tailwind CSS 4                | Utility-first styling, responsive design, dark mode support              |
| **Component Library**| shadcn/ui                     | Accessible, customizable, Tailwind-based UI primitives                   |
| **State Management** | Zustand                       | Lightweight global state (auth, UI state, expense drafts)                |
| **Data Fetching**    | TanStack React Query v5       | Server-state caching, background refetching, optimistic updates          |
| **HTTP Client**      | Axios                         | API requests to NestJS backend with interceptors for auth tokens         |
| **Forms**            | React Hook Form + Zod         | Performant form handling with schema-based validation                    |
| **Charts**           | Recharts                      | Spending analytics, category distribution, budget utilization graphs     |
| **Date Handling**    | date-fns                      | Lightweight date manipulation and formatting                             |
| **Icons**            | Lucide React                  | Consistent, tree-shakeable icon set                                      |
| **Notifications**    | Sonner                        | Toast notifications for expense operations, AI feedback, error alerts    |
| **Voice Capture**    | Web Speech API (browser)      | Microphone input and speech-to-text in English (`en-US`) and Bangla (`bn-BD`) |
| **File Upload**      | react-dropzone                | Drag-and-drop receipt image upload (JPG, PNG, WEBP)                      |
| **Modals/Dialogs**   | shadcn/ui Dialog              | AI confirmation modals for voice and receipt expense review              |
| **Tables**           | TanStack Table                | Sortable, filterable, paginated tables for expense history & admin views |
| **Authentication**   | NextAuth.js v5 (Auth.js)      | Session management, JWT integration with NestJS backend                  |
| **Internationalization** | next-intl                 | Bilingual UI support — English and Bangla (বাংলা) with locale switching  |

### Key Frontend Responsibilities

- Dashboard rendering (balance, spending %, recent expenses, trends)
- Manual expense CRUD forms
- AI Voice entry: microphone button → speech capture (English or Bangla) → confirmation modal
- AI Receipt scanning: image upload (English or Bangla receipts) → preview → confirmation modal
- Spending analytics with interactive charts
- Admin Panel UI (user management, category/payment method config, system analytics)
- Real-time toast notifications and error feedback
- Locale-aware UI with language switcher (English ↔ Bangla)

---

## 2. Backend — NestJS

| Concern              | Technology                       | Purpose                                                                     |
| -------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| **Framework**         | NestJS 11                        | Modular, decorator-driven Node.js framework with DI, guards, pipes          |
| **Language**          | TypeScript 5.x                  | End-to-end type safety with shared DTOs/interfaces                          |
| **Runtime**           | Node.js 22 LTS                  | JavaScript runtime with native ESM and performance improvements             |
| **ORM**              | TypeORM                          | Entity-based PostgreSQL access, migrations, relations, query builder        |
| **Authentication**    | Passport.js + JWT               | Stateless JWT-based auth with access & refresh token strategy               |
| **Authorization**     | CASL                            | Attribute-based access control — RBAC for `User` and `Admin` roles          |
| **Validation**        | class-validator + class-transformer | DTO validation with decorators, auto-transformation of payloads        |
| **Configuration**     | @nestjs/config + Joi            | Environment-based configuration with schema validation                      |
| **File Upload**       | Multer (@nestjs/platform-express)| Multipart file handling for receipt image uploads                           |
| **File Storage**      | Cloudinary SDK                  | Cloud-based secure storage for receipt images                               |
| **AI Processing**     | Google Generative AI SDK (@google/genai) | Multilingual voice text analysis & receipt OCR (English + Bangla) |
| **Rate Limiting**     | @nestjs/throttler               | API rate limiting to prevent abuse                                          |
| **Logging**           | nestjs-pino (Pino)              | Structured, high-performance JSON logging                                   |
| **API Documentation** | @nestjs/swagger (OpenAPI)       | Auto-generated API docs from decorators                                     |
| **Task Scheduling**   | @nestjs/schedule                | Monthly balance initialization, cleanup jobs                                |
| **Real-time**         | @nestjs/websockets (Socket.IO)  | Real-time notifications (low balance alerts, processing status)             |
| **Security**          | Helmet + CORS                   | HTTP security headers, cross-origin configuration                           |
| **Hashing**           | bcrypt                          | Secure password hashing                                                     |

### Key Backend Responsibilities

- RESTful API for all expense, category, payment method, and user operations
- JWT-based authentication with role-based guards (`User`, `Admin`)
- AI Voice processing: receive transcribed text (English or Bangla) → call AI for extraction → return structured expenses
- AI Receipt processing: receive image (English or Bangla receipts) → call AI/OCR → return structured expense data
- Monthly balance management: automatic recalculation on every confirmed expense operation
- Admin endpoints: user management, category/subcategory CRUD, payment method config, system analytics
- Data integrity enforcement: unconfirmed expenses never affect balance, cascading recalculations on edit/delete

---

## 3. Database — PostgreSQL

| Concern              | Technology                  | Purpose                                                         |
| -------------------- | --------------------------- | --------------------------------------------------------------- |
| **Database Engine**   | PostgreSQL 17               | Robust relational database with JSON support, CTEs, window functions |
| **ORM Integration**   | TypeORM                    | Entity mapping, migrations, relations, query builder            |
| **Migration Management** | TypeORM CLI             | Version-controlled schema migrations                            |

### Core Data Model

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    Users     │     │  Monthly Budgets  │     │    Expenses     │
├─────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (PK)     │◄────│ user_id (FK)     │     │ id (PK)         │
│ email       │     │ month            │     │ user_id (FK)    │
│ password    │     │ year             │     │ amount          │
│ name        │     │ starting_balance │     │ date            │
│ role        │     │ total_spent      │     │ time            │
│ is_active   │     │ remaining_balance│     │ category_id(FK) │
│ created_at  │     └──────────────────┘     │ subcategory_id  │
│ updated_at  │                              │ description     │
└─────────────┘     ┌──────────────────┐     │ payment_method  │
                    │   Categories     │     │ notes           │
┌─────────────┐     ├──────────────────┤     │ is_confirmed    │
│  Subcategories│   │ id (PK)         │     │ source          │
├─────────────┤     │ name            │     │ receipt_url     │
│ id (PK)     │     │ is_enabled      │     │ monthly_budget  │
│ category_id │◄────│ sort_order      │     │   _id (FK)      │
│ name        │     │ is_default      │     │ created_at      │
└─────────────┘     └──────────────────┘     │ updated_at      │
                                             └─────────────────┘
┌──────────────────┐
│ Payment Methods  │
├──────────────────┤
│ id (PK)          │
│ name             │
│ is_enabled       │
│ is_default       │
│ sort_order       │
└──────────────────┘
```

### Key Database Responsibilities

- ACID-compliant storage for all financial data
- Referential integrity via foreign keys (user → budget → expense → category)
- Indexing on frequently queried columns (user_id, date, category_id, month/year)
- Constraint enforcement: unique expense IDs, valid enum values for roles and source types
- Aggregate queries for analytics (daily/weekly/monthly spending, category breakdowns)

---

## 4. AI & Machine Learning Services

| Concern              | Technology                          | Purpose                                                          |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| **AI Provider**       | Google Gemini API (@google/genai)  | Natural language understanding and structured data extraction    |
| **Voice-to-Text**     | Web Speech API (browser-side)      | Real-time speech recognition — English (`en-US`) and Bangla (`bn-BD`) |
| **Voice Processing**  | Gemini — Text Analysis             | Extract amount, category, subcategory, date, merchant from English or Bangla text |
| **Receipt OCR**       | Gemini — Vision (multimodal)       | Extract merchant, items, prices, totals, tax from English and Bangla receipts |

### Bilingual AI Strategy

| Capability            | English Support                     | Bangla (বাংলা) Support                                          |
| --------------------- | ----------------------------------- | --------------------------------------------------------------- |
| **Voice Input**        | Web Speech API (`lang: en-US`)     | Web Speech API (`lang: bn-BD`)                                  |
| **Voice AI Extraction**| Gemini text prompt (English)       | Gemini text prompt (Bangla) — detects language automatically    |
| **Receipt Scanning**   | Gemini Vision — English text OCR   | Gemini Vision — Bangla text OCR (Unicode/Bengali script)        |
| **Amount Parsing**     | Standard numerals (123.45)         | Bengali numerals (১২৩.৪৫) converted to standard numerals       |
| **Mixed Language**     | —                                  | Handles Banglish (mixed English + Bangla) inputs gracefully     |

- **Language Detection**: Gemini auto-detects input language — no explicit flag required from the user
- **Bengali Numeral Conversion**: The backend normalizes Bengali digits (০-৯) to ASCII digits (0-9) before processing amounts
- **Bangla Receipt Support**: Gemini Vision handles Bengali script on receipts, including mixed English/Bangla merchant names and item descriptions

### AI Processing Flow

```text
Voice Path (English or Bangla):
  Browser Speech API (en-US / bn-BD) → Transcribed Text → Gemini Text Model
  → Language Auto-Detection → Structured JSON → Confirmation Modal

Receipt Path (English or Bangla):
  Image Upload → Gemini Vision Model (multilingual OCR)
  → Bengali Numeral Normalization → Structured JSON → Confirmation Modal
```

### AI Safety Rules

- AI-generated expenses are **never** auto-saved — user confirmation is mandatory
- Incomplete or ambiguous extractions trigger clarification prompts
- Cancelled AI operations produce **zero** side effects on financial data
- Bangla inputs with ambiguous amounts or categories prompt user clarification in the same language

---

## 5. DevOps & Infrastructure

| Concern              | Technology              | Purpose                                                       |
| -------------------- | ----------------------- | ------------------------------------------------------------- |
| **Containerization**  | Docker + Docker Compose | Consistent dev/prod environments for frontend, backend, and DB |
| **Version Control**   | Git + GitHub            | Source code management, branching, code reviews                |
| **Package Manager**   | pnpm                   | Fast, disk-efficient monorepo-friendly package management      |
| **Monorepo**          | pnpm Workspaces        | Shared types/interfaces between frontend and backend           |
| **Linting**           | ESLint 9 (flat config) | Code quality and consistency enforcement                       |
| **Formatting**        | Prettier               | Consistent code formatting                                     |
| **Environment Mgmt**  | dotenv / .env files    | Environment-specific configuration (DB, API keys, secrets)     |

---

## 6. Testing

| Concern              | Technology                   | Purpose                                              |
| -------------------- | ---------------------------- | ---------------------------------------------------- |
| **Unit Testing**      | Jest                        | Service/utility unit tests (backend + frontend)      |
| **Integration Testing** | Supertest                 | HTTP-level API integration tests for NestJS          |
| **E2E Testing**       | Playwright                  | End-to-end browser tests for critical user flows     |
| **Component Testing** | React Testing Library        | Isolated React component tests                       |

---

## 7. Project Structure

```text
expense-tracker/
├── apps/
│   ├── web/                          # Next.js 16 Frontend
│   │   ├── app/                      # App Router (pages, layouts, routes)
│   │   │   ├── (auth)/               # Auth routes (login, register)
│   │   │   ├── (dashboard)/          # Protected user routes
│   │   │   │   ├── dashboard/        # Main dashboard
│   │   │   │   ├── expenses/         # Expense management
│   │   │   │   └── analytics/        # Spending analytics
│   │   │   └── (admin)/              # Admin panel routes
│   │   │       ├── users/            # User management
│   │   │       ├── categories/       # Category management
│   │   │       ├── payment-methods/  # Payment method management
│   │   │       └── settings/         # System settings
│   │   ├── components/               # Reusable UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, API client, helpers
│   │   ├── stores/                   # Zustand state stores
│   │   └── types/                    # Frontend-specific types
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── auth/                 # Authentication module (JWT, Passport)
│       │   ├── users/                # User management module
│       │   ├── expenses/             # Expense CRUD module
│       │   ├── categories/           # Category & subcategory module
│       │   ├── payment-methods/      # Payment method module
│       │   ├── budgets/              # Monthly balance/budget module
│       │   ├── analytics/            # Spending analytics module
│       │   ├── ai/                   # AI processing module (voice + receipt)
│       │   ├── admin/                # Admin-specific endpoints
│       │   ├── notifications/        # Notification module
│       │   ├── common/               # Shared guards, pipes, interceptors
│       │   └── config/               # Configuration module
│       └── test/                     # E2E and integration tests
│
├── packages/
│   └── shared/                       # Shared types, DTOs, constants, enums
│       ├── types/
│       ├── constants/
│       └── enums/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

---

## 8. Requirement ↔ Tech Mapping

| Functional Requirement          | Frontend Tech                         | Backend Tech                         | Database                  |
| ------------------------------- | ------------------------------------- | ------------------------------------ | ------------------------- |
| Authentication & Profiles       | NextAuth.js v5, React Hook Form       | Passport.js, JWT, bcrypt             | Users table               |
| Monthly Balance & Budget        | Zustand, React Query, Recharts        | TypeORM, @nestjs/schedule            | Monthly Budgets table     |
| Expense Management              | React Hook Form, TanStack Table       | TypeORM, class-validator             | Expenses table            |
| Categories & Subcategories      | shadcn/ui Select, Combobox            | TypeORM CRUD, CASL guards            | Categories, Subcategories |
| AI Voice Entry (EN + BN)        | Web Speech API (en-US/bn-BD), shadcn Dialog | Gemini Multilingual Text Analysis  | Expenses (source: voice)  |
| AI Receipt Scanning (EN + BN)   | react-dropzone, shadcn Dialog         | Gemini Vision (multilingual OCR), Multer, Cloudinary | Expenses (source: receipt)|
| Dashboard                       | Recharts, React Query                 | Aggregate queries, WebSocket         | All tables (joins)        |
| Spending Analytics              | Recharts, TanStack Table              | SQL aggregations, CTEs               | Expenses, Budgets         |
| Payment Methods                 | shadcn/ui Select                      | TypeORM CRUD                         | Payment Methods table     |
| Admin Panel                     | TanStack Table, Recharts              | CASL (Admin role), admin endpoints   | All tables                |
| Notifications & Error Handling  | Sonner toasts                         | WebSocket/SSE, exception filters     | —                         |
| AI Confirmation & Safety        | Confirmation modals (shadcn Dialog)   | Validation pipes, transaction guards | is_confirmed flag         |
| Data Integrity & Security       | CSRF protection, HTTPS                | Helmet, CORS, bcrypt, JWT guards     | FK constraints, indexes   |
| Bilingual Support (EN + BN)     | next-intl, locale switcher            | Gemini multilingual prompts, Bengali numeral normalization | UTF-8 (Bengali script) |

---

## 9. Environment Variables

```text
# Database (Aiven PostgreSQL)
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SSL=true

# JWT
JWT_SECRET=
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRATION=7d

# AI (Google Gemini)
GOOGLE_AI_API_KEY=

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App — Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,bn
```

---

## 10. Version Summary

| Technology     | Version   |
| -------------- | --------- |
| Next.js        | 16.x      |
| React          | 19.x      |
| NestJS         | 11.x      |
| Node.js        | 22.x LTS  |
| TypeScript     | 5.x       |
| PostgreSQL     | 17.x      |
| TypeORM        | 0.3.x     |
| Tailwind CSS   | 4.x       |
| pnpm           | 10.x      |
| Docker         | 27.x      |
