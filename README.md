# Inventory Management System

## Project Overview

This repository contains a two-part ERP-style inventory and dealer operations system:

- `backend/`: a NestJS REST API
- `frontend/`: a Next.js admin workspace

The current implementation supports day-to-day master data management, stock movement tracking, purchases, sales, due collection, payable tracking, and summary dashboards. The frontend talks directly to the backend over HTTP using a shared typed API contract defined in `frontend/types/api.ts`.

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- `next/font` with Geist and Geist Mono
- `lucide-react`

### Backend

- NestJS 11
- TypeScript
- TypeORM 0.3
- PostgreSQL (`pg`)
- `class-validator`
- `class-transformer`
- `@nestjs/config`
- Joi environment validation

### Tooling

- ESLint in both apps
- Prettier in backend
- Jest and Supertest in backend

## Repository / Folder Structure

```text
.
|-- backend/
|   |-- src/
|   |   |-- common/
|   |   |-- config/
|   |   |-- database/
|   |   |-- health/
|   |   |-- modules/
|   |   |   |-- companies/
|   |   |   |-- products/
|   |   |   |-- purchases/
|   |   |   |-- routes/
|   |   |   |-- sales/
|   |   |   |-- shops/
|   |   |   `-- stock/
|   |   |-- app.module.ts
|   |   `-- main.ts
|   |-- test/
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |   |-- api/
|   |   `-- utils/
|   |-- public/
|   |-- types/
|   `-- package.json
|-- PROJECT_STATUS.md
`-- README.md
```

### Important folders

- `backend/src/config`: runtime configuration and Joi env validation
- `backend/src/database`: TypeORM setup plus init/reset/seed scripts
- `backend/src/modules/*`: domain modules and REST controllers
- `frontend/app`: Next.js routes
- `frontend/components`: page-level UI and reusable layout/UI components
- `frontend/lib/api`: frontend HTTP client wrappers for backend endpoints
- `frontend/types/api.ts`: frontend-side API and payload types

## Frontend Summary

The frontend is a server-rendered Next.js App Router application with most business screens implemented as client components using local React state and effect-driven data fetching.

### Implemented frontend routes

- `/`: dashboard with sales, due, low stock, route-wise sales, company-wise sales, and company-wise stock summary
- `/companies`: company CRUD workspace
- `/products`: company-scoped product management
- `/products/all`: cross-company product list with current stock
- `/routes`: route management
- `/shops`: shop management
- `/stock`: stock workspace with current stock, low stock, zero stock, movement history, and stock actions
- `/sales`: sales list with filters, pagination, due summaries, and ledger views
- `/sales/create`: sale creation flow
- `/sales/[id]`: sale details and payment collection
- `/sales/shops/[id]`: shop due details and payment history
- `/purchases`: purchase list and company payable summary
- `/purchases/create`: purchase creation flow
- `/purchases/[id]`: purchase details and payment tracking
- `/purchases/companies/[id]`: company payable ledger

### Frontend architecture notes

- API calls are centralized under `frontend/lib/api/*`.
- `frontend/lib/api/client.ts` uses `NEXT_PUBLIC_API_URL` and disables fetch caching with `cache: 'no-store'`.
- State management is local component state via `useState`, `useEffect`, and `useMemo`.
- The only shared React context currently present is `ToastProvider` for notifications.
- There is no Redux, Zustand, React Query, SWR, or other dedicated client-state/data-fetching library in the current codebase.

## Backend Summary

The backend is a NestJS REST API mounted under the global prefix `/api`. CORS is enabled for the configured frontend URL, and request validation is enforced globally through Nest's `ValidationPipe`.

### Loaded backend modules

- `HealthModule`
- `CompaniesModule`
- `ProductsModule`
- `PurchasesModule`
- `RoutesModule`
- `SalesModule`
- `ShopsModule`
- `StockModule`

### Backend behavior highlights

- Sales creation validates company, route, optional shop, product ownership, active flags, and available stock.
- Sales create `SALE_OUT` stock movements automatically.
- Purchases create `STOCK_IN` movements automatically.
- Due sales can receive follow-up payments.
- Purchases can receive follow-up supplier payments.
- Stock summary is calculated from stock movements rather than a stored balance table.
- The sales list is paginated; purchases are currently returned as a filtered list without pagination.

## Database / Models / Schema

The backend uses PostgreSQL via TypeORM with `autoLoadEntities: true`. The project currently relies on TypeORM synchronization scripts rather than migrations.

### Entities currently present

- `Company`
  - `name`, `code`, `address`, `phone`, `isActive`
- `Product`
  - belongs to `Company`
  - `name`, `sku`, `unit`, `buyPrice`, `salePrice`, `isActive`
  - unique index on `(companyId, sku)`
- `Route`
  - `name`, `area`, `isActive`
- `Shop`
  - belongs to `Route`
  - `name`, `ownerName`, `phone`, `address`, `isActive`
- `StockMovement`
  - belongs to `Company` and `Product`
  - `type`, `quantity`, `note`, `movementDate`
- `Purchase`
  - belongs to `Company`
  - `purchaseDate`, `referenceNo`, `totalAmount`, `paidAmount`, `payableAmount`, `note`
- `PurchaseItem`
  - belongs to `Purchase` and `Product`
  - `quantity`, `unitCost`, `lineTotal`
- `PurchasePayment`
  - belongs to `Purchase`
  - `amount`, `paymentDate`, `note`
- `Sale`
  - belongs to `Company`, `Route`, optional `Shop`
  - `saleDate`, `invoiceNo`, `totalAmount`, `paidAmount`, `dueAmount`, `totalProfit`, `note`
- `SaleItem`
  - belongs to `Sale` and `Product`
  - `quantity`, `unitPrice`, `buyPrice`, `lineTotal`, `lineProfit`
- `SalePayment`
  - belongs to `Sale`
  - `amount`, `paymentDate`, `note`

### Stock calculation model

Current stock is derived from stock movements:

- positive movement types increase stock
- `SALE_OUT` decreases stock
- low-stock and zero-stock summaries are calculated dynamically from the current stock summary

## Authentication & Authorization

No authentication or authorization system is implemented in the current codebase.

What exists:

- `JWT_SECRET` is required by backend environment validation
- config exposes `app.jwtSecret`

What does not currently exist:

- auth module
- login/logout endpoints
- user entity/model
- JWT issuing or verification
- guards, roles, or permissions
- session handling

At the moment, the frontend calls backend endpoints directly without any auth layer.

## API Overview

All backend routes are served under `/api`.

### Health

- `GET /api`
- `GET /api/health`

### Companies

- `POST /api/companies`
- `GET /api/companies`
- `GET /api/companies/:id`
- `PATCH /api/companies/:id`
- `DELETE /api/companies/:id`

### Products

- `POST /api/products`
- `GET /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Routes

- `POST /api/routes`
- `GET /api/routes`
- `GET /api/routes/:id`
- `GET /api/routes/:id/shops`
- `PATCH /api/routes/:id`
- `PATCH /api/routes/:id/deactivate`

### Shops

- `POST /api/shops`
- `GET /api/shops`
- `GET /api/shops/:id`
- `GET /api/shops/route/:routeId`
- `PATCH /api/shops/:id`
- `PATCH /api/shops/:id/deactivate`

### Stock

- `POST /api/stock/opening`
- `POST /api/stock/in`
- `POST /api/stock/adjustment`
- `GET /api/stock/movements`
- `GET /api/stock/summary/current`
- `GET /api/stock/summary/low-stock`
- `GET /api/stock/summary/zero-stock`
- `GET /api/stock/summary/investment`

### Purchases

- `POST /api/purchases`
- `GET /api/purchases`
- `GET /api/purchases/summary/company-wise-payable`
- `GET /api/purchases/companies/:companyId/payable-ledger`
- `GET /api/purchases/:id`
- `POST /api/purchases/:id/payments`

### Sales

- `POST /api/sales`
- `GET /api/sales`
- `GET /api/sales/summary/today-sales`
- `GET /api/sales/summary/today-profit`
- `GET /api/sales/summary/monthly`
- `GET /api/sales/summary/route-wise`
- `GET /api/sales/summary/company-wise`
- `GET /api/sales/summary/route-wise-due`
- `GET /api/sales/summary/shop-wise-due`
- `GET /api/sales/summary/company-wise-due`
- `GET /api/sales/summary/due-overview`
- `GET /api/sales/shops/:shopId/due-details`
- `GET /api/sales/:id`
- `POST /api/sales/:id/payments`

## Implemented Modules / Features

- Company CRUD
- Product CRUD with company ownership and per-company SKU uniqueness
- Route create/list/update/deactivate
- Shop create/list/update/deactivate
- Shop list enriched with total order count and total due
- Opening stock, stock-in, and stock adjustment entry
- Current stock summary, low-stock summary, zero-stock summary
- Stock investment summary by company, unit, and item
- Purchase creation with purchase items
- Company-wise purchase payable summary
- Company payable ledger and payment history
- Sale creation with multiple line items
- Automatic invoice number generation when invoice number is omitted
- Sales list with filtering and pagination
- Daily, monthly, route-wise, and company-wise sales summaries
- Due summaries by route, shop, and company
- Shop-specific due details and payment history
- Dashboard metrics and quick links
- Database init/reset/seed scripts with demo data

## Incomplete / Pending Features

These areas are missing or only partially implemented based on the current code:

- No authentication or authorization despite `JWT_SECRET` being configured
- No database migration files or migration workflow; schema management depends on sync scripts
- No Swagger/OpenAPI or generated API documentation
- No return/refund workflow even though `RETURN_IN` exists in the frontend `StockMovementType` union
- No backend endpoint for stock return-in movements
- No user/account management
- No audit log module beyond entity timestamps
- No export/report file generation
- No file uploads or media handling
- No background jobs or queue processing
- No explicit frontend environment example file
- Backend e2e coverage is minimal and currently only checks `/api/health`

## Environment Variables Needed

### Backend

Defined in `backend/.env.example` and validated by Joi:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:3000
DB_SYNCHRONIZE=false
DB_DROP_SCHEMA=false
```

Notes:

- `DATABASE_URL` is required.
- `FRONTEND_URL` is required for CORS.
- `JWT_SECRET` is required even though auth is not yet implemented.
- `DB_SYNCHRONIZE` and `DB_DROP_SCHEMA` are used by the database scripts.

### Frontend

Detected frontend runtime variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

If not set, the frontend defaults to `http://localhost:3001/api`.

## How to Run Locally

### 1. Start the backend

```bash
cd backend
npm install
copy .env.example .env
```

Update `.env` with a working PostgreSQL `DATABASE_URL`, then choose one of the following:

Initialize schema without demo data:

```bash
npm run db:init
```

Reset schema from scratch:

```bash
npm run db:reset
```

Seed demo data:

```bash
npm run db:seed
```

Run the backend:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api`.

### 2. Start the frontend

```bash
cd frontend
npm install
```

Set the API base URL if needed:

```bash
set NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Run the frontend:

```bash
npm run dev
```

The UI will be available at `http://localhost:3000`.

### 3. Verify the setup

- Open `http://localhost:3001/api/health`
- Open `http://localhost:3000`
- If seeded, review `/stock`, `/sales`, `/purchases`, and `/dashboard`

## Build / Deployment Notes

### Frontend

- Development: `npm run dev`
- Production build: `npm run build`
- Production serve: `npm run start`

### Backend

- Development: `npm run start:dev`
- Production build: `npm run build`
- Production serve: `npm run start:prod`

### Deployment considerations

- Deploy frontend and backend as separate services.
- Ensure `FRONTEND_URL` in backend matches the deployed frontend origin.
- Ensure `NEXT_PUBLIC_API_URL` in frontend points to the deployed backend `/api` base.
- The backend currently expects a PostgreSQL database reachable via `DATABASE_URL`.
- Because migrations are not implemented, production schema changes require caution.

## Known Issues / Risks

- Root and app-level README files were previously starter templates and may have been outdated.
- `JWT_SECRET` is mandatory in config, but no auth flow uses it yet.
- TypeORM synchronization is used instead of migrations, which is risky for production schema evolution.
- `backend/src/database/reset.ts` drops the schema when run.
- Frontend and backend depend on matching URL configuration for CORS and API access.
- `frontend/types/api.ts` includes `RETURN_IN`, but the backend has no matching stock endpoint at present.
- API error handling is centralized on the frontend, but there is no retry/cache layer.
- Git is not required at runtime, but local tooling assumptions may vary across Windows environments.

## Suggested Next Steps

- Implement authentication before exposing the API beyond trusted local/admin usage.
- Add a proper migration workflow for TypeORM.
- Introduce user and role models if this will be used by multiple operators.
- Decide whether product, company, route, and shop deactivation should replace hard deletes consistently across all modules.
- Add tests for sales, purchases, stock calculations, and due/payment flows.
- Add API docs or a Postman/Insomnia collection.
- Add a frontend `.env.example`.
- Implement stock returns if `RETURN_IN` is part of the intended workflow.
