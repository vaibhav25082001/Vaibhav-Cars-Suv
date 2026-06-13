# 🚗 VAIBHAV Cars & SUV — Full-Stack Luxury Automotive Platform

<div align="center">

![VAIBHAV Cars & SUV](https://img.shields.io/badge/VAIBHAV-Cars%20%26%20SUV-C9A84C?style=for-the-badge&labelColor=0A0A0A)
![Version](https://img.shields.io/badge/version-1.0.0-gold?style=for-the-badge&labelColor=0A0A0A)
![License](https://img.shields.io/badge/license-MIT-C9A84C?style=for-the-badge&labelColor=0A0A0A)

**A premium, production-grade full-stack automotive platform for a luxury Indian car brand.**
Built with 6 interconnected applications sharing a single PostgreSQL database.

[Customer Website](#-customer-website) · [Admin Dashboard](#-admin-dashboard) · [Employee Portal](#-employee-portal) · [Support Portal](#-support-portal) · [Mobile App](#-mobile-app) · [Backend API](#-backend-api)

</div>

---

## 🌟 Overview

VAIBHAV Cars & SUV is a complete enterprise-grade automotive platform covering every touchpoint of the customer journey — from browsing car models and booking test drives, to purchase, EMI management, after-sales service, and real-time customer support.

**Key highlights:**
- 6 interconnected applications (4 web portals + 1 REST API + 1 mobile app)
- 34 database tables with full relational integrity
- Real-time support via Socket.io (live tickets, chat, notifications)
- AI assistant (VAIA) powered by Claude, ChatGPT, and Gemini simultaneously
- Automated cron pipelines for sales analytics, SLA breach detection, and lead scoring
- Branded PDF generation for invoices, EMI schedules, payslips, and 10+ document types
- Full Indian locale: ₹ pricing, Indian names, 10-city showroom network

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + Express | REST API server |
| **Database** | PostgreSQL | Primary database |
| **ORM** | Prisma | Database access layer |
| **Real-time** | Socket.io | Live tickets, chat, notifications |
| **Auth** | JWT (15m access + 7d refresh tokens) | Authentication & authorization |
| **Background Jobs** | node-cron | 5 automated pipelines |
| **PDF** | pdfkit | Branded document generation |
| **Frontend (×4)** | React + Vite | UI framework + build tool |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Mobile** | React Native (Expo SDK 51) | Cross-platform iOS + Android |
| **AI** | Claude / ChatGPT / Gemini | Multi-provider AI assistant |

---

## 📁 Project Structure

```
Vaibhav-Cars-Suv/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          ← 34-table DB schema
│   │   └── seed.js                ← Full Indian seed data
│   └── src/
│       ├── routes/                ← 15 route files
│       ├── services/              ← 16 service files (Prisma queries)
│       ├── middleware/            ← auth, role, error, upload, validate
│       ├── pipelines/             ← 5 cron jobs
│       ├── sockets/               ← Socket.io event handlers
│       ├── pdf/                   ← pdfkit document generators
│       ├── ai/                    ← VAIA multi-provider AI service
│       ├── config/                ← env + db configuration
│       └── utils/                 ← JWT, OTP, EMI calculator, etc.
├── customer-website/              ← React + Vite (port 5173)
├── admin-dashboard/               ← React + Vite (port 5174)
├── employee-portal/               ← React + Vite (port 5175)
├── support-portal/                ← React + Vite (port 5176)
└── mobile-app/                    ← React Native (Expo SDK 51)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (local or Docker)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/vaibhav25082001/Vaibhav-Cars-Suv.git
cd Vaibhav-Cars-Suv
```

### 2. Install dependencies
```bash
# Backend
cd backend && npm install

# Customer Website
cd ../customer-website && npm install

# Admin Dashboard
cd ../admin-dashboard && npm install

# Employee Portal
cd ../employee-portal && npm install

# Support Portal
cd ../support-portal && npm install

# Mobile App
cd ../mobile-app && npm install
```

### 3. Set up environment variables
```bash
# Copy .env.example to .env in each app and fill in values
cp backend/.env.example backend/.env
cp customer-website/.env.example customer-website/.env
cp admin-dashboard/.env.example admin-dashboard/.env
cp employee-portal/.env.example employee-portal/.env
cp support-portal/.env.example support-portal/.env
cp mobile-app/.env.example mobile-app/.env
```

### 4. Set up the database
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Start each app

```bash
# Backend (port 5000)
cd backend && npm run dev

# Customer Website (port 5173)
cd customer-website && npm run dev

# Admin Dashboard (port 5174)
cd admin-dashboard && npm run dev

# Employee Portal (port 5175)
cd employee-portal && npm run dev

# Support Portal (port 5176)
cd support-portal && npm run dev

# Mobile App
cd mobile-app && npx expo start
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/vaibhav_cars?schema=public` |
| `JWT_SECRET` | Secret for signing access tokens | `replace-with-a-secure-jwt-secret` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | `replace-with-a-secure-jwt-refresh-secret` |
| `JWT_EXPIRES_IN` | Access token expiration (default: **15m**) | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration (default: **7d**) | `7d` |
| `PORT` | Backend server port | `5000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | `sk-ant-...` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `AIza...` |
| `SMTP_HOST` | SMTP server host | `smtp.example.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | _(your email)_ |
| `SMTP_PASS` | SMTP password | _(your password)_ |

### Frontend Apps (`customer-website/.env`, etc.)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |
| `VITE_PORT` | Vite dev server port | `5173` / `5174` / `5175` / `5176` |

### Mobile App (`mobile-app/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `EXPO_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

---

## 🔌 API Routes

All routes are registered in `backend/src/app.js`:

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentication (login, register, refresh, logout) |
| `/api/cars` | Car model catalog and wishlist |
| `/api/inventory` | Car inventory management |
| `/api/bookings` | Test drive and service bookings |
| `/api/purchases` | Purchase processing and EMI payments |
| `/api/customers` | Customer profiles and management |
| `/api/employees` | Employee management, attendance, and leave |
| `/api/support` | Support tickets, messages, and escalations |
| `/api/admin` | Admin dashboard data and operations |
| `/api/analytics` | Sales, lead, service, and support analytics |
| `/api/documents` | PDF document generation and downloads |
| `/api/careers` | Job openings and applications |
| `/api/ai` | VAIA AI assistant (multi-provider) |
| `/api/offers` | Promotional offers |
| `/api/notifications` | Notification management |

---

## 📜 Available Scripts

### Backend
| Script | Command |
|--------|---------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run seed` | Seed the database |

### Web Apps (customer-website, admin-dashboard, employee-portal, support-portal)
| Script | Command |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Mobile App
| Script | Command |
|--------|---------|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web |

---

## 🗄 Database

**34 Prisma models** across the following domains:

| Domain | Models |
|--------|--------|
| **Customers** | `Customer`, `CustomerVehicle`, `CustomerActivityLog`, `Wishlist` |
| **Cars** | `CarModel`, `CarInventory`, `CarConfiguration` |
| **Showrooms** | `Showroom`, `ShowroomTarget` |
| **Sales** | `Purchase`, `EmiPayment`, `Expense`, `Lead`, `LeadInteraction` |
| **Bookings** | `TestDriveBooking`, `ServiceBooking`, `ServiceJobItem` |
| **HR** | `Employee`, `EmployeeTarget`, `Attendance`, `LeaveRequest`, `LeaveBalance` |
| **Support** | `SupportTicket`, `TicketMessage`, `TicketEscalation`, `CannedResponse`, `KbArticle` |
| **Analytics** | `DailySalesSummary`, `MonthlyRevenueSummary`, `PipelineLog` |
| **Careers** | `JobOpening`, `JobApplication` |
| **System** | `Notification`, `Offer` |

---

## ⚙️ Cron Pipelines

| Pipeline | Schedule | Description |
|----------|----------|-------------|
| `daily-sales.pipeline.js` | Every midnight | Aggregates daily sales → `DailySalesSummary` |
| `monthly-revenue.pipeline.js` | 1st of month, 1:15 AM | Revenue + expense breakdown → `MonthlyRevenueSummary` |
| `lead-scoring.pipeline.js` | Every 6 hours | Scores leads by activity |
| `inventory-alert.pipeline.js` | Every 1 hour | Flags low stock, creates notifications |
| `sla-breach.pipeline.js` | Every 30 minutes | Auto-escalates tickets past SLA deadline |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT License — see LICENSE file for details.

---

<div align="center">
  <b>VAIBHAV Cars & SUV</b> — Where Luxury Meets Technology
  <br/>
  <i>Built with ❤️ in India</i>
</div>
