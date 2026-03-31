# Project Rules

## Business Scope

- This system is a dealer-level ERP for Bangladesh distribution business operations.
- This system is not a retail shop ERP.
- This system is not a customer relationship or customer billing system.
- Keep the product focused on summary-level business control for the owner.

## Hard Business Rules

- Do not implement customer-wise sales tracking.
- Do not implement shop-wise sales tracking.
- Sales must be tracked route-wise.
- Collections must be tracked route-wise.
- Stock must be managed only through stock transactions.
- Purchase increases stock.
- Sale reduces stock.
- Damage reduces stock.
- Due and payable values must be derived from transactions, not manually stored.

## Product Design Rules

- Keep the system simple, fast, and practical for non-technical users.
- Avoid unnecessary data entry and avoid low-value workflow complexity.
- Prefer clear summary views over overly detailed operational screens.
- Do not add features that push the product toward retail POS or customer-ledger ERP behavior.

## Technical Rules

- Backend stack: NestJS, TypeORM, PostgreSQL.
- Use migration-based database changes only.
- Never enable TypeORM `synchronize`.
- Use DTO validation for all write operations.
- Keep modules clean, small, and business-oriented.
- Keep frontend and backend fully separate.

## AI and Code Generation Guardrails

- Never generate customer/shop sales modules, customer ledgers, or retail POS flows.
- Always model sales and collections around routes.
- Always treat stock transactions as the source of truth for inventory.
- Always derive financial summary values from transaction data.
- Prefer minimal, maintainable solutions over generic ERP complexity.
