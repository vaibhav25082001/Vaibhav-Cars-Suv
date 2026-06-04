# 🚗 VAIBHAV Cars & SUV — Full-Stack Luxury Automotive Platform

<div align="center">

![VAIBHAV Cars & SUV](https://img.shields.io/badge/VAIBHAV-Cars%20%26%20SUV-C9A84C?style=for-the-badge&labelColor=0A0A0A)
![Version](https://img.shields.io/badge/version-1.0.0-gold?style=for-the-badge&labelColor=0A0A0A)
![License](https://img.shields.io/badge/license-MIT-C9A84C?style=for-the-badge&labelColor=0A0A0A)

**A premium, production-grade full-stack automotive platform — Tesla meets BMW meets Rolls-Royce.**  
Built with 6 interconnected applications sharing a single PostgreSQL database.

[Customer Website](#customer-website) · [Admin Dashboard](#admin-dashboard) · [Employee Portal](#employee-portal) · [Support Portal](#support-portal) · [Mobile App](#mobile-app) · [Backend API](#backend-api)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Applications](#applications)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Getting Started](#getting-started)
- [Mobile App — node_modules Setup](#mobile-app--node_modules-setup)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Car Models](#car-models)
- [Showrooms](#showrooms)
- [API Reference](#api-reference)

---

## 🌟 Overview

VAIBHAV Cars & SUV is a complete enterprise-grade automotive platform for a luxury Indian car brand. It covers every touchpoint of the customer journey — from browsing car models and booking test drives, to purchase, EMI management, after-sales service, and real-time customer support.

**Key highlights:**
- 6 interconnected applications (4 web portals + 1 REST API + 1 mobile app)
- 34 database tables with full relational integrity
- Real-time support via Socket.io (live tickets, chat, notifications)
- AI assistant (VAIA) powered by Claude, ChatGPT, and Gemini simultaneously
- Automated cron pipelines for sales analytics, SLA breach detection, and lead scoring
- Branded PDF generation for invoices, EMI schedules, payslips, and 10+ document types
- Full Indian locale: ₹ pricing, Indian names, 10-city showroom network

---

## 🏗 Architecture

```
vaibhav-cars/
├── backend/           ← Node.js + Express + Prisma + Socket.io + node-cron
├── customer-website/  ← React + Vite + Tailwind + Framer Motion
├── admin-dashboard/   ← React + Vite + Tailwind + Recharts + AG Grid
├── employee-portal/   ← React + Vite + Tailwind + Kanban (@hello-pangea/dnd)
├── support-portal/    ← React + Vite + Tailwind + Socket.io + AG Grid
└── mobile-app/        ← React Native (Expo SDK 51) + Redux Toolkit
```

All 6 applications share a **single PostgreSQL database** via Prisma ORM.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL | Primary database |
| Socket.io | Real-time events (tickets, chat, notifications) |
| JWT | Authentication (7-day access + 30-day refresh tokens) |
| node-cron | Automated pipelines |
| pdfkit | Branded PDF document generation |
| Docker | PostgreSQL containerization |

### Frontend (All 4 Web Apps)
| Technology | Purpose |
|---|---|
| React + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client |
| Recharts | Charts and analytics |
| Framer Motion | Premium animations (customer site) |
| AG Grid | Data grids (admin + support) |
| @hello-pangea/dnd | Drag-and-drop Kanban (employee portal) |

### Mobile App
| Technology | Purpose |
|---|---|
| React Native (Expo SDK 51) | Cross-platform mobile |
| React Navigation | Screen navigation |
| Redux Toolkit | Global state management |
| Victory Native | Charts |
| Socket.io Client | Real-time events |

### AI
| Provider | Model |
|---|---|
| Anthropic | claude-sonnet-4-20250514 |
| OpenAI | gpt-4o |
| Google | gemini-1.5-pro |

---

## 📱 Applications

### Customer Website
**Path:** `customer-website/`

The public-facing luxury car brand website.

**Features:**
- Hero slider with featured car models
- Full model catalog with filters (body type, fuel, price range)
- Interactive car configurator (model → color → interior → add-ons → finance)
- EMI calculator with real-time amortization
- Test drive booking (showroom + date + time slot)
- Service booking for existing vehicle owners
- Finance/loan application flow
- Customer account portal (vehicles, bookings, documents, wishlist)
- VAIA AI assistant widget (choose between Claude / ChatGPT / Gemini)
- Careers page with job listings and application form
- Offers and promotions section

---

### Admin Dashboard
**Path:** `admin-dashboard/`

The boss-level command center for management.

**Features:**
- Real-time KPI overview (revenue, sales, leads, conversion rate)
- Sales analytics (revenue charts, model performance, city breakdown, target vs achieved)
- Inventory management (AG Grid, stock updates, low-stock alerts)
- Employee management (profiles, performance leaderboard, bulk upload)
- Customer segmentation and 360° profiles
- Finance module (P&L charts, GST summary, profitability)
- Pipeline monitor (cron job status and logs)
- Reports center (generate and download any PDF report)
- AI Command Center (chat with VAIA using any provider)
- Notifications center

---

### Employee Portal
**Path:** `employee-portal/`

Role-aware portal for sales executives, service staff, and managers.

**Features:**
- Role-specific dashboards (Sales Exec / Service Staff / Manager)
- Customer leads management with interaction logging
- Drag-and-drop sales pipeline Kanban board
- Inventory view
- Service module (job cards, checklists, parts selection, status stepper)
- Performance charts (personal sales, commission, conversion funnel)
- Leave and attendance management (calendar, leave requests, approval queue)
- Payslip download
- Employee VAIA AI assistant
- Real-time notifications via Socket.io

---

### Support Portal
**Path:** `support-portal/`

Full-featured helpdesk for support agents and supervisors.

**Features:**
- Agent dashboard (open tickets, SLA warnings, team leaderboard, live activity feed)
- AG Grid ticket management with filters and bulk actions
- Ticket detail center (message thread, internal notes, timeline, properties)
- Canned responses panel
- Live chat module with Socket.io (typing indicators, customer info panel, transfer)
- Customer 360° view (full history, purchase records, tags)
- Analytics (volume, performance, agent comparison, SLA gauge, CSAT trend)
- Knowledge base (article editor and list)
- Escalation manager with audit trail
- Smart AI tools: smart reply, sentiment badge, thread summarizer, smart router

**Socket.io Events (real-time):**
```
ticket:new              → new ticket created
ticket:updated          → ticket status/assignment changed
ticket:escalated        → SLA breach auto-escalation
service:status_changed  → vehicle service status update
chat:message            → live chat message
chat:typing             → typing indicator
notification:new        → push notification
```

---

### Mobile App
**Path:** `mobile-app/`

iOS + Android app built with Expo SDK 51.

**Screens:**
- Onboarding (3-screen walkthrough)
- Auth (Login / Signup / Forgot Password / OTP verify)
- Home (owned car card, quick actions, featured banner, offers carousel)
- Explore (car catalog, filters, detail view, compare, wishlist)
- My Garage (vehicles, service history, expense tracker, documents hub)
- Test Drive Booking (4-step wizard)
- Service Booking (4-step wizard)
- Finance (EMI calculator, amortization, loan application, payment history)
- Support (raise ticket, ticket detail, emergency contact)
- VAIA AI screen (multi-provider chat)
- Notifications
- Profile (edit profile, bookings, loyalty points, referrals)

---

## 📦 Mobile App — node_modules Setup

> The `mobile-app/node_modules` folder is too large to upload as a single file to GitHub.  
> It has been split into **5 ZIP archives** for easy restoration.

### ZIP Files
| File | Contents |
|---|---|
| `NODE_Modules_1.zip` | Part 1 of 5 |
| `NODE_Modules_2.zip` | Part 2 of 5 |
| `NODE_Modules_3.zip` | Part 3 of 5 |
| `NODE_Modules_4.zip` | Part 4 of 5 |
| `NODE_Modules_5.zip` | Part 5 of 5 |

### How to restore node_modules

**Option A — Restore from ZIP files (if something goes wrong):**
```bash
cd mobile-app
# Extract all 5 ZIPs into node_modules
unzip NODE_Modules_1.zip -d node_modules
unzip NODE_Modules_2.zip -d node_modules
unzip NODE_Modules_3.zip -d node_modules
unzip NODE_Modules_4.zip -d node_modules
unzip NODE_Modules_5.zip -d node_modules
```

**Option B — Fresh install (recommended for new machines):**
```bash
cd mobile-app
npm install
# or
npx expo install
```

> 💡 **Tip:** Always try `npm install` first. Use the ZIP files only if installation fails due to network issues or version conflicts.

---

## 🗄 Database

**34 tables across 6 domains:**

| Domain | Tables |
|---|---|
| Customers | `customers`, `customer_vehicles`, `customer_activity_log`, `wishlists` |
| Cars | `car_models`, `car_inventory`, `car_configurations` |
| Showrooms | `showrooms`, `showroom_targets` |
| Sales | `purchases`, `emi_payments`, `expenses`, `leads`, `lead_interactions` |
| Bookings | `test_drive_bookings`, `service_bookings`, `service_job_items` |
| HR | `employees`, `employee_targets`, `attendance`, `leave_requests`, `leave_balance` |
| Support | `support_tickets`, `ticket_messages`, `ticket_escalations`, `canned_responses`, `kb_articles` |
| Analytics | `daily_sales_summary`, `monthly_revenue_summary`, `pipeline_logs` |
| Careers | `job_openings`, `job_applications` |
| System | `notifications`, `offers` |

**Seed data (realistic Indian data):**
- 10 car models · 5 showrooms · 50 employees · 500 customers
- 300 purchases · 1,500 EMI payments · 600 test drives · 400 service bookings
- 1,000 support tickets (with 3–8 messages each)
- 800 leads · 30 job openings · 200 applications
- 12 months of daily & monthly analytics summaries

---

## 🤖 AI Integration — VAIA

**VAIA (VAIBHAV AI Assistant)** appears in all 5 applications with a provider selector.

The backend `ai.service.js` routes to all 3 providers with a single unified function:

```javascript
generateResponse({ provider, prompt, systemPrompt, context })
// provider: "claude" | "chatgpt" | "gemini"
```

**Auto-fallback:** If a provider API key is missing, it automatically tries the next available one.

**System prompts per portal:**
- `vaia-customer.prompt.js` — Car shopping assistant
- `vaia-employee.prompt.js` — Sales and service assistant
- `vaia-support.prompt.js` — Smart reply and ticket routing
- `vaia-admin.prompt.js` — Business analytics assistant

---

## ⚙️ Cron Pipelines

| Pipeline | Schedule | Function |
|---|---|---|
| `daily-sales.pipeline.js` | Every midnight | Aggregates purchases → `daily_sales_summary` |
| `monthly-revenue.pipeline.js` | 1st of month, 1am | City + model + fuel breakdown → `monthly_revenue_summary` |
| `lead-scoring.pipeline.js` | Every 6 hours | Scores leads by test drives + wishlist + page views |
| `inventory-alert.pipeline.js` | Every 1 hour | Flags stock < 5 → creates notification |
| `sla-breach.pipeline.js` | Every 30 minutes | Auto-escalates tickets past SLA deadline |

**SLA Rules:**
| Priority | Deadline |
|---|---|
| Urgent | 4 hours |
| High | 8 hours |
| Normal | 24 hours |
| Low | 48 hours |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Docker Desktop (for PostgreSQL)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/vaibhav25082001/Vaibhav-Cars-Suv.git
cd Vaibhav-Cars-Suv
```

### 2. Start PostgreSQL via Docker
```bash
docker run --name vaibhav-postgres \
  -e POSTGRES_USER=vaibhav \
  -e POSTGRES_PASSWORD=vaibhav123 \
  -e POSTGRES_DB=vaibhav_cars \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys and DB URL
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 4. Start the web apps (each in a separate terminal)
```bash
# Customer Website
cd customer-website && npm install && npm run dev

# Admin Dashboard
cd admin-dashboard && npm install && npm run dev

# Employee Portal
cd employee-portal && npm install && npm run dev

# Support Portal
cd support-portal && npm install && npm run dev
```

### 5. Start the mobile app
```bash
cd mobile-app
npm install
npx expo start
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Database
DATABASE_URL="postgresql://vaibhav:vaibhav123@localhost:5432/vaibhav_cars"

# JWT
JWT_SECRET="your-jwt-secret-256-bit"
JWT_REFRESH_SECRET="your-refresh-secret-256-bit"

# AI Providers (at least one required)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AIza..."

# File Upload
UPLOAD_DIR="./uploads"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

---

## 📁 Folder Structure

```
vaibhav-cars/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← 34-table DB schema
│   │   └── seed.js                ← Full Indian seed data
│   └── src/
│       ├── routes/                ← 13 route files
│       ├── controllers/           ← 13 controller files
│       ├── services/              ← 13 service files (Prisma queries)
│       ├── middleware/            ← auth, role, error, upload, validate
│       ├── pipelines/             ← 5 cron jobs
│       ├── sockets/               ← Socket.io event handlers
│       ├── pdf/                   ← 13 pdfkit document generators
│       ├── ai/                    ← VAIA multi-provider AI service
│       └── utils/                 ← JWT, OTP, EMI calculator, etc.
├── customer-website/
├── admin-dashboard/
├── employee-portal/
├── support-portal/
└── mobile-app/
    ├── NODE_Modules_1.zip         ← node_modules backup (part 1/5)
    ├── NODE_Modules_2.zip         ← node_modules backup (part 2/5)
    ├── NODE_Modules_3.zip         ← node_modules backup (part 3/5)
    ├── NODE_Modules_4.zip         ← node_modules backup (part 4/5)
    └── NODE_Modules_5.zip         ← node_modules backup (part 5/5)
```

---

## 🚘 Car Models

| Model | Type | Price | Power | Fuel |
|---|---|---|---|---|
| VAIBHAV Apex S | Sedan | ₹45,00,000 | 320 BHP | Petrol |
| VAIBHAV Titan X | SUV | ₹72,00,000 | 420 BHP | Diesel |
| VAIBHAV Eclipse EV | EV | ₹68,00,000 | 520 BHP | Electric |
| VAIBHAV Rogue 4x4 | SUV | ₹85,00,000 | 480 BHP | Diesel |
| VAIBHAV Nova Hybrid | Hybrid | ₹52,00,000 | 280 BHP | Hybrid |
| VAIBHAV Crown GT | Sedan | ₹1,10,00,000 | 550 BHP | Petrol |
| VAIBHAV Drift R | Coupe | ₹95,00,000 | 510 BHP | Petrol |
| VAIBHAV Comfort 7 | MPV | ₹58,00,000 | 260 BHP | Diesel |
| VAIBHAV Blaze Sport | Hatch | ₹32,00,000 | 180 BHP | Petrol |
| VAIBHAV Phantom AWD | SUV | ₹1,45,00,000 | 600 BHP | Petrol |

---

## 🏢 Showrooms

| City | Location |
|---|---|
| Mumbai | Bandra West, Linking Road |
| Delhi | Connaught Place, KG Marg |
| Bangalore | Koramangala, 5th Block |
| Hyderabad | Jubilee Hills, Road No 36 |
| Pune | Koregaon Park, North Main Road |

---

## 🔐 Auth Roles

| Role | Access |
|---|---|
| `customer` | Customer website + mobile app |
| `employee` | Employee portal (role-aware dashboard) |
| `support_agent` | Support portal (ticket management + chat) |
| `support_supervisor` | Support portal (escalations + analytics) |
| `admin` | Admin dashboard (full access) |

---

## 📄 PDF Documents

All PDFs are branded with VAIBHAV gold header, GST breakdown, page numbers, and timestamp footer:

1. Purchase Invoice
2. EMI Schedule (full amortization table)
3. Test Drive Confirmation
4. Service Job Card Receipt
5. Quotation / Estimate (7-day validity)
6. Payslip
7. Sales Report
8. Monthly P&L
9. Inventory Valuation Report
10. Employee Performance Report
11. Customer History Report
12. Escalation Report
13. Bank Statement

---

## 🎨 Brand Guidelines

| Element | Value |
|---|---|
| Primary Black | `#0A0A0A` |
| Gold | `#C9A84C` |
| White | `#F5F5F5` |
| Charcoal | `#1A1A1A` |
| Navy | `#0F172A` |
| Heading Font | Playfair Display |
| Body Font | Inter |

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">
  <b>VAIBHAV Cars & SUV</b> — Where Luxury Meets Technology
  <br/>
  <i>Built with ❤️ in India</i>
</div>
