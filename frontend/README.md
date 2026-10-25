# Roomly — Luxury Hotel Management & Booking Frontend

Roomly is a production-grade, responsive hotel booking and property management frontend built with **React 18, Vite, TypeScript, Tailwind CSS, React Router v6, React Query, React Hook Form + Zod, and Recharts**.

---

## 🌟 Key Features

### 🏨 Guest & Public Experience
- **Home Landing Page (`/`)**: Hero experience, dynamic booking search bar, featured suite showcases, luxury amenities highlights, trust badges, and Privilege Club promotional banner.
- **Available Rooms & Suites (`/rooms`)**: Multi-faceted filter system (price slider, capacity, room categories, amenity checkboxes, search bar, and sorting).
- **Room Details & Gallery (`/rooms/:id`)**: High-res multi-photo gallery, specifications (sq ft, capacity, bed configuration, floor level), full amenities breakdown, stay policies, and sticky real-time price calculator.
- **Booking & Multi-Step Checkout (`/checkout`)**: Zod-validated guest contact details, special requests, 256-bit encrypted card simulation, discount code application, and booking confirmation with generated reservation code.
- **Authentication & Registration (`/login`, `/register`)**: Fast demo personas (Instant 1-Click Guest & Admin login), form validation, and privilege onboarding.

### 👤 Customer Portal
- **Customer Dashboard & My Bookings (`/customer/dashboard`)**: Lifetime stays, reward points, filterable reservation cards (Upcoming/Active, Past Stays, Cancelled), official PDF invoice viewer modal, and 100% refund reservation cancellation workflow.

### 🛡️ Admin Operations Suite
- **Operations Dashboard (`/admin`)**: Real-time PMS occupancy gauge (84.5%), monthly revenue projection vs target ($148,920), today's arrivals and departures, in-house VIP guests counter, live operations table with instant check-in/check-out clearance actions, and interactive Recharts revenue area chart.
- **Room Inventory Management (`/admin/rooms`)**: Full CRUD operations on all rooms (create, edit, delete, status toggle between Available, Occupied, Maintenance, Reserved, price adjustments).
- **Booking Management (`/admin/bookings`)**: Centralized reservation lifecycle manager with status tabs (Confirmed, Checked-In, Pending, Completed, Cancelled), details drawer, and status transitions.
- **Guest CRM & Directory (`/admin/guests`)**: Loyalty tier tagging (VIP, Gold, Silver, Regular), passport ID verification, lifetime spend metrics, and Add/Edit Guest modal (Stitch Screen 09) with stay preference tags and concierge notes.
- **Financial & Operations Reports (`/admin/reports`)**: Gross revenue charts, room category occupancy comparisons, booking acquisition channel donut chart, ADR and RevPAR metrics, and CSV report export.

### ⚡ Demo Persona Switcher
- Floating Persona Switcher widget in the bottom-right corner allowing one-click role switching between:
  - **Hotel Administrator** (`Alexander Wright`)
  - **Registered Guest** (`Sarah Jenkins - Gold Tier`)
  - **Logged Out / Visitor** (`Anonymous Guest`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🗺️ Route Catalog

| Route | View / Component | Access Level | Description |
|---|---|---|---|
| `/` | `HomePage` | Public | Luxury hotel landing page & search widget |
| `/rooms` | `RoomsPage` | Public | Filterable rooms catalog with price slider & sorting |
| `/rooms/:id` | `RoomDetailsPage` | Public | Photo gallery, suite specs, & sticky pricing widget |
| `/checkout` | `CheckoutPage` | Protected | Multi-step booking checkout & confirmation |
| `/login` | `LoginPage` | Public (Auth) | Login with 1-click fast demo credentials |
| `/register` | `RegisterPage` | Public (Auth) | Guest registration & privilege signup |
| `/customer/dashboard` | `CustomerDashboardPage` | Protected (Customer) | My bookings, invoice modal & cancellation |
| `/admin` | `AdminDashboardPage` | Protected (Admin) | Live operations dashboard & KPI metrics |
| `/admin/rooms` | `AdminRoomsPage` | Protected (Admin) | Room inventory CRUD management |
| `/admin/bookings` | `AdminBookingsPage` | Protected (Admin) | Reservation lifecycle & check-in/out clearance |
| `/admin/guests` | `AdminGuestsPage` | Protected (Admin) | Guest directory & Add/Edit Guest modal |
| `/admin/reports` | `AdminReportsPage` | Protected (Admin) | Financial intelligence & Recharts analytics |

---

## 🎨 Design System & Tokens
All colors, font scales, radii, and spacing tokens are configured in `tailwind.config.js` following the Material 3 design tokens extracted from Stitch:
- **Font**: `Plus Jakarta Sans` & `Material Symbols Outlined`
- **Primary Color**: `#004fd2`
- **Secondary Color**: `#006591`
- **Surface**: `#faf8ff` / `#eaedff`
- **On-Surface**: `#131b2e`
