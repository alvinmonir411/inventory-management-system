# Inventory Management System

This repository contains a dealer inventory management system with a NestJS backend and a Next.js frontend.

The project is currently focused on master data and stock flow foundations:

- Backend modules completed:
  - Companies
  - Products
  - Stock
  - Routes
  - Shops
- Frontend pages completed:
  - Dashboard
  - Companies
  - Products
  - Stock

## Current Project Status

Completed so far:

- NestJS backend with TypeScript, TypeORM, and PostgreSQL
- Next.js frontend with App Router, TypeScript, and Tailwind CSS
- Database initialization scripts for development
- Demo seed data for companies, products, stock, routes, and shops
- Frontend pages connected to backend APIs
- Product search and pagination
- Stock search and pagination

Planned next:

- Frontend pages for routes and shops
- Sales flow
- Due and baki logic
- Returns
- Reports
- Safer migration-based schema evolution for production

## Tech Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS

## Project Structure

```text
inventory-management-system/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ database/
│  │  │  ├─ init.ts
│  │  │  ├─ reset.ts
│  │  │  └─ seed/
│  │  ├─ health/
│  │  └─ modules/
│  │     ├─ companies/
│  │     ├─ products/
│  │     ├─ stock/
│  │     ├─ routes/
│  │     └─ shops/
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ app/
│  │  ├─ companies/
│  │  ├─ products/
│  │  ├─ stock/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  ├─ lib/
│  ├─ types/
│  ├─ .env.local.example
│  └─ package.json
└─ README.md
```

## Backend Setup

Go to the backend:

```powershell
cd backend
```

Install dependencies if needed:

```powershell
npm install
```

Create backend env file:

```powershell
Copy-Item .env.example .env
```

Initialize the development database schema and demo data:

```powershell
npm run db:init
```

Start the backend:

```powershell
npm run start:dev
```

Backend default URL:

- `http://localhost:3001`
- API prefix: `http://localhost:3001/api`

Optional development reset:

```powershell
npm run db:reset
```

## Frontend Setup

Go to the frontend:

```powershell
cd frontend
```

Install dependencies if needed:

```powershell
npm install
```

Create frontend env file:

```powershell
Copy-Item .env.local.example .env.local
```

Start the frontend:

```powershell
npm run dev
```

Frontend default URL:

- `http://localhost:3000`

## Required Environment Variables

### Backend

File: `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@your-host/your-database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
DB_SYNCHRONIZE=false
DB_DROP_SCHEMA=false
DB_SEED_DEMO=true
```

Notes:

- `DB_SYNCHRONIZE` should stay `false` for normal runtime
- use `npm run db:init` when you need to create tables in development

### Frontend

File: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Frontend Pages Implemented

- `/`
  - dashboard layout
  - sidebar
  - topbar
  - navigation links
- `/companies`
  - company list from backend
  - selected company details
- `/products`
  - company-wise product list
  - add product form
  - edit product form
  - search
  - pagination
- `/stock`
  - current stock summary
  - low stock products
  - zero stock products
  - stock movements
  - opening stock form
  - stock in form
  - adjustment form
  - company filter
  - product filter
  - search
  - pagination

## Demo Data

Current demo data includes:

- 5 demo companies
- about 200 demo products per company
- opening stock for demo products
- 7 demo routes
- demo shops under each route

Demo routes:

- Pirgachha Bazar
- Chowdhurani
- Damurchakla
- Kaliganj
- Kandirhat
- Paotanahat
- Annodanagar

## API Endpoints Implemented So Far

### Companies APIs

- `POST /api/companies`
  - Create a company
- `GET /api/companies`
  - List companies
- `GET /api/companies/:id`
  - Get one company by id
- `PATCH /api/companies/:id`
  - Update a company
- `DELETE /api/companies/:id`
  - Delete a company when no products depend on it

### Products APIs

- `POST /api/products`
  - Create a product for a company
- `GET /api/products`
  - List products, optionally filtered by company or search
- `GET /api/products/:id`
  - Get one product by id
- `PATCH /api/products/:id`
  - Update a product
- `DELETE /api/products/:id`
  - Delete a product when no stock movements depend on it

### Stock APIs

- `POST /api/stock/opening`
  - Add opening stock
- `POST /api/stock/in`
  - Add stock in
- `POST /api/stock/adjustment`
  - Add stock adjustment
- `GET /api/stock/movements`
  - List stock movements by company and optional product
- `GET /api/stock/summary/current`
  - Show current stock summary by product
- `GET /api/stock/summary/low-stock`
  - Show low stock products
- `GET /api/stock/summary/zero-stock`
  - Show zero stock products

### Routes APIs

- `POST /api/routes`
  - Create a route
- `GET /api/routes`
  - List routes
- `GET /api/routes/:id`
  - Get route by id
- `PATCH /api/routes/:id`
  - Update route data
- `PATCH /api/routes/:id/deactivate`
  - Deactivate a route
- `GET /api/routes/:id/shops`
  - List shops under a route

### Shops APIs

- `POST /api/shops`
  - Create a shop under a route
- `GET /api/shops`
  - List shops with optional route and search filters
- `GET /api/shops/:id`
  - Get shop by id
- `PATCH /api/shops/:id`
  - Update a shop
- `PATCH /api/shops/:id/deactivate`
  - Deactivate a shop
- `GET /api/shops/route/:routeId`
  - List shops by route

## Local Testing Flow

Recommended local run order:

1. Start PostgreSQL or confirm Neon database access
2. Run backend database initialization:

```powershell
cd backend
npm run db:init
```

3. Start backend:

```powershell
npm run start:dev
```

4. Start frontend in another terminal:

```powershell
cd frontend
npm run dev
```

5. Open:

- `http://localhost:3000`

Suggested browser test order:

1. Companies page
2. Products page
3. Stock page

## Notes

- Backend runtime no longer performs destructive schema changes automatically
- Development schema creation is handled with `db:init`
- Development full reset is handled with `db:reset`
- Seed runs only after the required tables exist
