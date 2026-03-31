# Backend Architecture

## Architectural Intent

- Build a clean NestJS backend for a dealer ERP system.
- Keep the codebase modular, production-ready, and easy to extend.
- Do not add business modules until requirements are explicitly requested.

## Core Domain Rules

- No customer tracking module.
- No shop tracking module for sales.
- Sales are route-based.
- Collections are route-based.
- Inventory is transaction-driven.
- Due and payable are derived from transaction records.

## Module Structure Conventions

- Each business area should live under `backend/src/modules/<module-name>`.
- A module should contain only its own controller, service, DTOs, entities, and supporting files when needed.
- Keep shared cross-cutting utilities under `backend/src/common`.
- Keep database configuration, data source, and migrations under `backend/src/database`.
- Avoid creating generic dumping-ground modules.

## DTO Conventions

- Use DTOs for every create, update, filter, and query input that enters controllers.
- Validate all incoming data with `class-validator`.
- Use `class-transformer` only where transformation improves safety or usability.
- Keep DTOs explicit and small.
- Do not expose entity classes directly as request DTOs.
- Prefer separate DTOs for write operations and reporting/filter operations.

## Entity Naming Conventions

- Use singular PascalCase for entity class names.
- Use `<name>.entity.ts` for entity file names.
- Use clear business names such as `Route`, `Sale`, `Collection`, `Purchase`, `StockTransaction`.
- Do not create entities implying customer/shop sales ledgers.
- Keep relation names explicit and business-readable.
- Store computed values only when there is a strong performance reason and the source-of-truth transaction model remains intact.

## Stock and Financial Modeling Rules

- Stock transaction records are the single source of truth for inventory.
- Every stock-changing event must create a stock transaction.
- Purchase transactions add stock.
- Sales transactions reduce stock.
- Damage transactions reduce stock.
- Current stock should be derived from transaction aggregates.
- Route receivable summaries should be derived from sales and collections.
- Company payable summaries should be derived from purchase and payment transactions.

## Migration Workflow

- All schema changes must go through TypeORM migrations.
- Never rely on `synchronize`.
- Keep migrations small, reviewable, and tied to explicit schema changes.
- Generate migrations only after entity changes are intentional and reviewed.

## Reporting and Query Design Principles

- Optimize for owner-facing summary reports.
- Prefer aggregate queries over row-heavy detail screens.
- Keep reporting queries route-focused, company-focused, product-focused, and date-range-focused.
- Avoid query patterns that assume customer-wise or shop-wise reporting.
- Design indexes around route, product, company, transaction date, and document reference patterns.
- Use transaction tables as the reporting base wherever practical.
- Keep reporting SQL efficient and predictable for PostgreSQL.

## Practical Development Rules

- Keep modules simple and maintainable.
- Avoid premature abstraction.
- Prefer explicit business logic over overly generic frameworks inside the app.
- Preserve clean boundaries so future frontend work can consume stable APIs easily.
