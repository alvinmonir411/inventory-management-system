# Inventory Management System

This repository contains a dealer inventory management system with a NestJS backend and a Next.js frontend.

The project currently covers real-data-ready master data, stock flow, route/shop setup, and sales flow. Demo seeding has been removed, so the system now starts with an empty schema and is ready for real company, product, shop, route, stock, and sales data.

## Current Project Status

Completed so far:

- NestJS backend with TypeScript, TypeORM, and PostgreSQL support
- Next.js frontend with App Router, TypeScript, and Tailwind CSS
- Safe development database initialization and reset scripts
- Backend modules:
  - Companies
  - Products
  - Stock
  - Routes
  - Shops
  - Sales
- Frontend pages:
  - Dashboard
  - Companies
  - Products
  - All Products
  - Stock
  - Routes
  - Shops
  - Sales list
  - Create sale
  - Sale details
- Real-data entry flow improvements for companies, routes, shops, products, and sales
- Full-width admin layout

Planned next:

- Returns flow
- Due collection flow
- Reports
- Migration-based database evolution for production
- Additional dashboard summaries and printing/export workflows

## Tech Stack

- Backend: NestJS, TypeScript, TypeORM, PostgreSQL
- Frontend: Next.js, React, TypeScript, Tailwind CSS

## Project Structure

```text
inventory-management-system/
├─ backend/
│  ├─ src/
│  │  ├─ common/
│  │  ├─ config/
│  │  ├─ database/
│  │  │  ├─ init.ts
│  │  │  ├─ reset.ts
│  │  │  └─ typeorm.config.ts
│  │  ├─ health/
│  │  └─ modules/
│  │     ├─ companies/
│  │     ├─ products/
│  │     ├─ stock/
│  │     ├─ routes/
│  │     ├─ shops/
│  │     └─ sales/
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ app/
│  │  ├─ companies/
│  │  ├─ products/
│  │  │  └─ all/
│  │  ├─ stock/
│  │  ├─ routes/
│  │  ├─ shops/
│  │  ├─ sales/
│  │  │  ├─ create/
│  │  │  └─ [id]/
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  ├─ lib/
│  ├─ types/
│  ├─ .env.local.example
│  └─ package.json
├─ .gitignore
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

Initialize the development database schema:

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

`db:reset` drops and recreates the schema without any demo data.

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
```

Notes:

- `DB_SYNCHRONIZE` should stay `false` for normal runtime
- use `npm run db:init` to create tables in development
- there is no demo seeding anymore

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
  - full-width admin shell
- `/companies`
  - company list
  - company details
  - add company
  - edit company
- `/products`
  - company-wise product list
  - current stock column
  - add product
  - edit product
  - company filter
  - search
  - pagination
- `/products/all`
  - all-company product list
  - current stock column
  - add product button
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
- `/routes`
  - route list
  - add route
  - edit route
- `/shops`
  - shop list
  - filter by route
  - add shop
  - edit shop
- `/sales`
  - sales list
  - filter by company
  - filter by route
  - filter by shop
  - filter by date
  - today sales summary
  - today profit summary
  - monthly sales summary
  - route-wise sales summary
  - company-wise sales summary
- `/sales/create`
  - create sale with multiple items
  - live line total and profit calculation
  - due validation
  - save and continue next order flow
- `/sales/[id]`
  - sale details
  - item breakdown
  - totals and profit

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

### Sales APIs

- `POST /api/sales`
  - Create a sale with multiple items and stock reduction
- `GET /api/sales`
  - List sales with optional filters
- `GET /api/sales/:id`
  - Get sale details by id
- `GET /api/sales/summary/today-sales`
  - Show today sales summary
- `GET /api/sales/summary/today-profit`
  - Show today profit summary
- `GET /api/sales/summary/monthly`
  - Show monthly sales summary
- `GET /api/sales/summary/route-wise`
  - Show route-wise sales summary
- `GET /api/sales/summary/company-wise`
  - Show company-wise sales summary

## Business Rules Implemented

- Every product belongs to a company
- Every stock movement belongs to a company and a product
- Current stock is derived from stock movements
- Inactive company or inactive product cannot receive stock movement
- Shop belongs to a route
- Inactive route does not accept new shop assignment
- A sale belongs to one company and one route
- A sale may belong to one shop
- If due amount is greater than zero, shop is required
- Sale creation validates stock before saving
- Sale creation creates `SALE_OUT` stock movements
- Sale totals and profits are calculated server-side

## Local Testing Flow

Recommended local run order:

1. Start PostgreSQL or confirm Neon database access
2. Initialize the database:

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

1. `/companies`
2. `/routes`
3. `/shops`
4. `/products`
5. `/stock`
6. `/sales/create`
7. `/sales`

## Notes

- Backend runtime does not perform destructive schema changes automatically
- Development schema creation is handled with `db:init`
- Development full reset is handled with `db:reset`
- The project no longer creates any demo data
- The current system is ready for real master data entry
