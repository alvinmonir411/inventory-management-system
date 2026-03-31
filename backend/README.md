# Backend API Notes

This file is the running backend API reference for the current modules. Update it whenever backend endpoints change.

## Rules

- Sales and collections must be route-based.
- Do not build customer-wise or shop-wise sales linkage.
- Routes are business routes for future route-based sales and collections.

## Base

- Base URL: `/api`
- Authentication: all business endpoints require `Authorization: Bearer <jwt-token>` unless explicitly marked public.
- Public endpoints: `GET /api/health`, `POST /api/auth/login`

## Health

### `GET /api/health`

Response example:

```json
{
  "status": "ok",
  "timestamp": "2026-03-31T13:00:00.000Z"
}
```

## Auth

### `POST /api/auth/login`

Request example:

```json
{
  "username": "admin",
  "password": "strongpassword"
}
```

Response example:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": "1d",
  "user": {
    "id": "2f08a0e6-5331-4754-b15f-fc96b0df6de2",
    "username": "admin",
    "role": "admin"
  }
}
```

## Roles

### `GET /api/roles`

Response example:

```json
[
  {
    "id": "8cd6fd63-f299-4d5c-a6d6-8068ae8cc8ac",
    "name": "admin",
    "description": "Full administrative access",
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  {
    "id": "b0fc7906-bcdc-49bd-82ae-0cf01806f39a",
    "name": "operator",
    "description": "Operational access",
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/roles/:id`

Response example:

```json
{
  "id": "8cd6fd63-f299-4d5c-a6d6-8068ae8cc8ac",
  "name": "admin",
  "description": "Full administrative access",
  "createdAt": "2026-03-31T13:00:00.000Z",
  "updatedAt": "2026-03-31T13:00:00.000Z"
}
```

## Users

### `POST /api/users`

Request example:

```json
{
  "username": "operator1",
  "password": "strongpassword",
  "roleId": "b0fc7906-bcdc-49bd-82ae-0cf01806f39a",
  "isActive": true
}
```

### `GET /api/users`

Query examples:

- `/api/users`
- `/api/users?isActive=true`
- `/api/users?roleId=b0fc7906-bcdc-49bd-82ae-0cf01806f39a`

Response example:

```json
[
  {
    "id": "44f866de-4f5b-4d90-9194-0468a8a5297b",
    "username": "operator1",
    "role": {
      "id": "b0fc7906-bcdc-49bd-82ae-0cf01806f39a",
      "name": "operator",
      "description": "Operational access",
      "createdAt": "2026-03-31T13:00:00.000Z",
      "updatedAt": "2026-03-31T13:00:00.000Z"
    },
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/users/:id`

### `PATCH /api/users/:id`

Request example:

```json
{
  "roleId": "8cd6fd63-f299-4d5c-a6d6-8068ae8cc8ac",
  "isActive": false
}
```

### `DELETE /api/users/:id`

Response example:

```json
{
  "message": "User deleted successfully"
}
```

## Companies

### `POST /api/companies`

Request example:

```json
{
  "name": "ACI Limited",
  "note": "Main dealership supplier",
  "isActive": true
}
```

### `GET /api/companies`

Query examples:

- `/api/companies`
- `/api/companies?isActive=true`

Response example:

```json
[
  {
    "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
    "name": "ACI Limited",
    "note": "Main dealership supplier",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/companies/:id`

### `PATCH /api/companies/:id`

Request example:

```json
{
  "note": "Seasonal supplier",
  "isActive": false
}
```

### `DELETE /api/companies/:id`

Response example:

```json
{
  "message": "Company deleted successfully"
}
```

## Company Payments

Company payments reduce payable. Company payable should be derived as:

```text
SUM(purchase item quantity * purchase item unit price) - SUM(company payment amount)
```

No final payable value should be manually stored.

### `POST /api/company-payments`

Request example:

```json
{
  "paymentNo": "CP-0001",
  "companyId": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
  "paymentDate": "2026-03-31",
  "amount": 1500,
  "paymentMethod": "bank",
  "note": "Partial supplier payment"
}
```

### `GET /api/company-payments`

Query examples:

- `/api/company-payments`
- `/api/company-payments?page=1&limit=20`
- `/api/company-payments?companyId=0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57`
- `/api/company-payments?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "d3dd6ca9-b69f-43bc-95c9-f0f4dcd1e2d0",
      "paymentNo": "CP-0001",
      "paymentDate": "2026-03-31",
      "amount": 1500,
      "paymentMethod": "bank",
      "note": "Partial supplier payment",
      "company": {
        "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
        "name": "ACI Limited",
        "note": "Main dealership supplier",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/company-payments/:id`

Response example:

```json
{
  "id": "d3dd6ca9-b69f-43bc-95c9-f0f4dcd1e2d0",
  "paymentNo": "CP-0001",
  "paymentDate": "2026-03-31",
  "amount": 1500,
  "paymentMethod": "bank",
  "note": "Partial supplier payment",
  "company": {
    "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
    "name": "ACI Limited",
    "note": "Main dealership supplier",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "createdAt": "2026-03-31T13:00:00.000Z"
}
```

## Collections

Collections are route-based only. There is no customer-wise or shop-wise collection tracking in this system.

Route due should be derived as:

```text
SUM(sale item quantity * sale item unit price) - SUM(route collections)
```

Collections reduce route-wise due, but no final due value should be manually stored.

### `POST /api/collections`

Request example:

```json
{
  "collectionNo": "COL-0001",
  "routeId": "a93257df-2a79-4f14-8947-0d954b27c5d6",
  "collectionDate": "2026-03-31",
  "amount": 1200,
  "paymentMethod": "cash",
  "note": "Route collection deposit"
}
```

### `GET /api/collections`

Query examples:

- `/api/collections`
- `/api/collections?page=1&limit=20`
- `/api/collections?routeId=a93257df-2a79-4f14-8947-0d954b27c5d6`
- `/api/collections?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "0e32b232-66b1-4b53-b40f-62323bdc0f25",
      "collectionNo": "COL-0001",
      "collectionDate": "2026-03-31",
      "amount": 1200,
      "paymentMethod": "cash",
      "note": "Route collection deposit",
      "route": {
        "id": "a93257df-2a79-4f14-8947-0d954b27c5d6",
        "code": "DHK-NORTH-01",
        "name": "Dhaka North Route",
        "note": "Primary city route",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/collections/:id`

Response example:

```json
{
  "id": "0e32b232-66b1-4b53-b40f-62323bdc0f25",
  "collectionNo": "COL-0001",
  "collectionDate": "2026-03-31",
  "amount": 1200,
  "paymentMethod": "cash",
  "note": "Route collection deposit",
  "route": {
    "id": "a93257df-2a79-4f14-8947-0d954b27c5d6",
    "code": "DHK-NORTH-01",
    "name": "Dhaka North Route",
    "note": "Primary city route",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "createdAt": "2026-03-31T13:00:00.000Z"
}
```

## Categories

Categories are for product categorization only.

### `POST /api/categories`

Request example:

```json
{
  "name": "Beverages",
  "note": "Soft drinks and juices"
}
```

### `GET /api/categories`

Response example:

```json
[
  {
    "id": "6c5c3d67-cf37-43c5-8854-a2412d93bb55",
    "name": "Beverages",
    "note": "Soft drinks and juices",
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/categories/:id`

### `PATCH /api/categories/:id`

Request example:

```json
{
  "name": "Snacks",
  "note": "Biscuits and chips"
}
```

### `DELETE /api/categories/:id`

Response example:

```json
{
  "message": "Category deleted successfully"
}
```

## Damages

Damages reduce stock by writing a `damage` stock transaction with `quantityOut`. Stock balances must continue to be derived from stock transactions only.

### `POST /api/damages`

Request example:

```json
{
  "productId": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
  "warehouseId": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
  "damageDate": "2026-03-31",
  "quantity": 3,
  "reason": "Expired",
  "note": "Found during warehouse check"
}
```

### `GET /api/damages`

Query examples:

- `/api/damages`
- `/api/damages?page=1&limit=20`
- `/api/damages?productId=1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2`
- `/api/damages?warehouseId=0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612`
- `/api/damages?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "9ef4338c-7e31-4f90-801f-7798c98b4dd2",
      "damageDate": "2026-03-31",
      "quantity": 3,
      "reason": "Expired",
      "note": "Found during warehouse check",
      "product": {
        "id": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
        "code": "PRD-0001",
        "sku": "SKU-0001",
        "name": "Mojo 250ml",
        "purchasePrice": 28.5,
        "salePrice": 32,
        "mrp": 35,
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "warehouse": {
        "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
        "name": "Main Warehouse",
        "code": "WH-MAIN",
        "note": "Primary stock location",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/damages/:id`

Response example:

```json
{
  "id": "9ef4338c-7e31-4f90-801f-7798c98b4dd2",
  "damageDate": "2026-03-31",
  "quantity": 3,
  "reason": "Expired",
  "note": "Found during warehouse check",
  "product": {
    "id": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
    "code": "PRD-0001",
    "sku": "SKU-0001",
    "name": "Mojo 250ml",
    "purchasePrice": 28.5,
    "salePrice": 32,
    "mrp": 35,
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "warehouse": {
    "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
    "name": "Main Warehouse",
    "code": "WH-MAIN",
    "note": "Primary stock location",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "createdAt": "2026-03-31T13:00:00.000Z"
}
```

## Expenses

Expenses are simple summary-focused cost entries for reporting and profitability views.

### `POST /api/expenses`

Request example:

```json
{
  "expenseDate": "2026-03-31",
  "name": "Transport",
  "amount": 850,
  "note": "Route van fuel and helper allowance"
}
```

### `GET /api/expenses`

Query examples:

- `/api/expenses`
- `/api/expenses?page=1&limit=20`
- `/api/expenses?name=transport`
- `/api/expenses?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "6be902f0-a290-4248-9bb8-aa0d09d98772",
      "expenseDate": "2026-03-31",
      "name": "Transport",
      "amount": 850,
      "note": "Route van fuel and helper allowance",
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/expenses/:id`

Response example:

```json
{
  "id": "6be902f0-a290-4248-9bb8-aa0d09d98772",
  "expenseDate": "2026-03-31",
  "name": "Transport",
  "amount": 850,
  "note": "Route van fuel and helper allowance",
  "createdAt": "2026-03-31T13:00:00.000Z"
}
```

## Products

Products belong to a company, category, and unit. This module is designed for a practical catalog size and fast list/report filtering.

### `POST /api/products`

Request example:

```json
{
  "code": "PRD-0001",
  "sku": "SKU-0001",
  "name": "Mojo 250ml",
  "purchasePrice": 28.5,
  "salePrice": 32,
  "mrp": 35,
  "companyId": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
  "categoryId": "6c5c3d67-cf37-43c5-8854-a2412d93bb55",
  "unitId": "8f23910e-0b20-4c0b-b0fc-f4f5742b0282",
  "isActive": true
}
```

### `GET /api/products`

Query examples:

- `/api/products`
- `/api/products?page=1&limit=20`
- `/api/products?search=mojo`
- `/api/products?companyId=0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57`
- `/api/products?categoryId=6c5c3d67-cf37-43c5-8854-a2412d93bb55&isActive=true`

Response example:

```json
{
  "data": [
    {
      "id": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
      "code": "PRD-0001",
      "sku": "SKU-0001",
      "name": "Mojo 250ml",
      "purchasePrice": 28.5,
      "salePrice": 32,
      "mrp": 35,
      "isActive": true,
      "company": {
        "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
        "name": "ACI Limited",
        "note": "Main dealership supplier",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "category": {
        "id": "6c5c3d67-cf37-43c5-8854-a2412d93bb55",
        "name": "Beverages",
        "note": "Soft drinks and juices",
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "unit": {
        "id": "8f23910e-0b20-4c0b-b0fc-f4f5742b0282",
        "name": "piece",
        "symbol": "pcs",
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z",
      "updatedAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/products/:id`

### `PATCH /api/products/:id`

Request example:

```json
{
  "salePrice": 33,
  "mrp": 36,
  "isActive": false
}
```

### `DELETE /api/products/:id`

Response example:

```json
{
  "message": "Product deleted successfully"
}
```

## Purchases

Purchases increase stock and represent the source data for future company payable derivation. Payable should be derived from purchase and payment transactions, not stored manually on the purchase header.

### `POST /api/purchases`

Request example:

```json
{
  "purchaseNo": "PUR-0001",
  "purchaseDate": "2026-03-31",
  "companyId": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
  "warehouseId": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
  "supplierInvoiceNo": "SUP-INV-321",
  "note": "Month opening purchase",
  "items": [
    {
      "productId": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
      "quantity": 100,
      "unitPrice": 28.5
    }
  ]
}
```

### `GET /api/purchases`

Query examples:

- `/api/purchases`
- `/api/purchases?page=1&limit=20`
- `/api/purchases?companyId=0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57`
- `/api/purchases?warehouseId=0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612`
- `/api/purchases?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "11d4f903-b1f9-43a4-bf4d-901eb568b582",
      "purchaseNo": "PUR-0001",
      "supplierInvoiceNo": "SUP-INV-321",
      "purchaseDate": "2026-03-31",
      "note": "Month opening purchase",
      "company": {
        "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
        "name": "ACI Limited",
        "note": "Main dealership supplier",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "warehouse": {
        "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
        "name": "Main Warehouse",
        "code": "WH-MAIN",
        "note": "Primary stock location",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "itemCount": 1,
      "totalAmount": 2850,
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/purchases/:id`

Response example:

```json
{
  "id": "11d4f903-b1f9-43a4-bf4d-901eb568b582",
  "purchaseNo": "PUR-0001",
  "supplierInvoiceNo": "SUP-INV-321",
  "purchaseDate": "2026-03-31",
  "note": "Month opening purchase",
  "company": {
    "id": "0a4bf54e-0d28-4f1c-a4e1-19d62afb5e57",
    "name": "ACI Limited",
    "note": "Main dealership supplier",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "warehouse": {
    "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
    "name": "Main Warehouse",
    "code": "WH-MAIN",
    "note": "Primary stock location",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "items": [
    {
      "id": "fc4cbb1d-d23a-49a6-b9cd-6f160d343c64",
      "quantity": 100,
      "unitPrice": 28.5,
      "product": {
        "id": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
        "code": "PRD-0001",
        "sku": "SKU-0001",
        "name": "Mojo 250ml",
        "purchasePrice": 28.5,
        "salePrice": 32,
        "mrp": 35,
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "createdAt": "2026-03-31T13:00:00.000Z",
  "totalAmount": 2850
}
```

## Sales

Sales are route-based only. There is no customer-wise or shop-wise sales tracking in this system.

Due should be derived later as:

```text
SUM(sale item quantity * sale item unit price) - SUM(route collections)
```

No final due value should be manually stored on the sale.

### `POST /api/sales`

Request example:

```json
{
  "saleNo": "SAL-0001",
  "saleDate": "2026-03-31",
  "routeId": "a93257df-2a79-4f14-8947-0d954b27c5d6",
  "warehouseId": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
  "note": "Morning route dispatch",
  "items": [
    {
      "productId": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
      "quantity": 50,
      "unitPrice": 32
    }
  ]
}
```

### `GET /api/sales`

Query examples:

- `/api/sales`
- `/api/sales?page=1&limit=20`
- `/api/sales?routeId=a93257df-2a79-4f14-8947-0d954b27c5d6`
- `/api/sales?warehouseId=0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612`
- `/api/sales?fromDate=2026-03-01&toDate=2026-03-31`

Response example:

```json
{
  "data": [
    {
      "id": "2d676b3e-84b8-4a58-8a60-a0a95c4b9bc9",
      "saleNo": "SAL-0001",
      "saleDate": "2026-03-31",
      "note": "Morning route dispatch",
      "route": {
        "id": "a93257df-2a79-4f14-8947-0d954b27c5d6",
        "code": "DHK-NORTH-01",
        "name": "Dhaka North Route",
        "note": "Primary city route",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "warehouse": {
        "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
        "name": "Main Warehouse",
        "code": "WH-MAIN",
        "note": "Primary stock location",
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "itemCount": 1,
      "totalAmount": 1600,
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/sales/:id`

Response example:

```json
{
  "id": "2d676b3e-84b8-4a58-8a60-a0a95c4b9bc9",
  "saleNo": "SAL-0001",
  "saleDate": "2026-03-31",
  "note": "Morning route dispatch",
  "route": {
    "id": "a93257df-2a79-4f14-8947-0d954b27c5d6",
    "code": "DHK-NORTH-01",
    "name": "Dhaka North Route",
    "note": "Primary city route",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "warehouse": {
    "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
    "name": "Main Warehouse",
    "code": "WH-MAIN",
    "note": "Primary stock location",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  "items": [
    {
      "id": "4f90396b-f6ae-4200-b92a-145823266d53",
      "quantity": 50,
      "unitPrice": 32,
      "product": {
        "id": "1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2",
        "code": "PRD-0001",
        "sku": "SKU-0001",
        "name": "Mojo 250ml",
        "purchasePrice": 28.5,
        "salePrice": 32,
        "mrp": 35,
        "isActive": true,
        "createdAt": "2026-03-31T13:00:00.000Z",
        "updatedAt": "2026-03-31T13:00:00.000Z"
      },
      "createdAt": "2026-03-31T13:00:00.000Z"
    }
  ],
  "createdAt": "2026-03-31T13:00:00.000Z",
  "totalAmount": 1600
}
```

## Stock Transactions

Stock transactions are the single source of truth for inventory. There are no public CRUD endpoints for direct stock editing.

Rules:

- Purchase writes `quantityIn`
- Sale writes `quantityOut`
- Damage writes `quantityOut`
- Stock balance must always be derived from transactions
- Other modules must not update stock directly

Internal service methods:

- `recordPurchase(...)`
- `recordSale(...)`
- `recordDamage(...)`
- `getBalance({ productId, warehouseId })`

Example internal write shape:

```ts
await stockTransactionsService.recordPurchase({
  productId: '1bb1dbcf-77d3-46f7-9c0d-0db5d8b4d6a2',
  warehouseId: '0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612',
  quantity: 100,
  transactionDate: '2026-03-31',
  referenceModule: 'purchases',
  referenceId: 'purchase-header-uuid',
  referenceCode: 'PUR-0001',
  note: 'Initial stock receipt'
});
```

Balance formula:

```text
SUM(quantity_in) - SUM(quantity_out)
```

## Routes

Routes here represent business distribution routes. They do not link to retail shops or customer records.

### `POST /api/routes`

Request example:

```json
{
  "code": "DHK-NORTH-01",
  "name": "Dhaka North Route",
  "note": "Primary city route",
  "isActive": true
}
```

### `GET /api/routes`

Query examples:

- `/api/routes`
- `/api/routes?isActive=true`

Response example:

```json
[
  {
    "id": "a93257df-2a79-4f14-8947-0d954b27c5d6",
    "code": "DHK-NORTH-01",
    "name": "Dhaka North Route",
    "note": "Primary city route",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/routes/:id`

### `PATCH /api/routes/:id`

Request example:

```json
{
  "code": "DHK-NORTH-02",
  "isActive": false
}
```

### `DELETE /api/routes/:id`

Response example:

```json
{
  "message": "Route deleted successfully"
}
```

## Units

Units are reusable product units such as `pcs`, `box`, `carton`, `kg`, and `liter`.

### `POST /api/units`

Request example:

```json
{
  "name": "piece",
  "symbol": "pcs"
}
```

### `GET /api/units`

Response example:

```json
[
  {
    "id": "8f23910e-0b20-4c0b-b0fc-f4f5742b0282",
    "name": "piece",
    "symbol": "pcs",
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  },
  {
    "id": "b7a26a65-df0f-4854-8b68-c9e2e68fddee",
    "name": "carton",
    "symbol": "carton",
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/units/:id`

### `PATCH /api/units/:id`

Request example:

```json
{
  "name": "kilogram",
  "symbol": "kg"
}
```

### `DELETE /api/units/:id`

Response example:

```json
{
  "message": "Unit deleted successfully"
}
```

## Warehouses

Warehouses are simple stock locations for future warehouse-based stock transactions.

### `POST /api/warehouses`

Request example:

```json
{
  "name": "Main Warehouse",
  "code": "WH-MAIN",
  "note": "Primary stock location",
  "isActive": true
}
```

### `GET /api/warehouses`

Query examples:

- `/api/warehouses`
- `/api/warehouses?isActive=true`

Response example:

```json
[
  {
    "id": "0e4d17f5-18d0-4ed8-8f34-cce1c2b4f612",
    "name": "Main Warehouse",
    "code": "WH-MAIN",
    "note": "Primary stock location",
    "isActive": true,
    "createdAt": "2026-03-31T13:00:00.000Z",
    "updatedAt": "2026-03-31T13:00:00.000Z"
  }
]
```

### `GET /api/warehouses/:id`

### `PATCH /api/warehouses/:id`

Request example:

```json
{
  "code": "WH-SECONDARY",
  "isActive": false
}
```

### `DELETE /api/warehouses/:id`

Response example:

```json
{
  "message": "Warehouse deleted successfully"
}
```
