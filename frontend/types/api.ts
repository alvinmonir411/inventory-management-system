export type Company = {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductUnit = 'PCS' | 'KG' | 'LITER' | 'PACK' | 'DOZEN' | 'OTHER';

export type Product = {
  id: number;
  companyId: number;
  name: string;
  sku: string;
  unit: ProductUnit;
  buyPrice: number;
  salePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
};

export type StockMovementType =
  | 'OPENING'
  | 'STOCK_IN'
  | 'SALE_OUT'
  | 'RETURN_IN'
  | 'ADJUSTMENT';

export type StockMovement = {
  id: number;
  companyId: number;
  productId: number;
  type: StockMovementType;
  quantity: number;
  note: string | null;
  movementDate: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  product?: Product;
};

export type StockSummaryItem = {
  productId: number;
  companyId: number;
  company?: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
  };
  productName: string;
  sku: string;
  unit: ProductUnit;
  isActive: boolean;
  currentStock: number;
  isLowStock?: boolean;
  isZeroStock?: boolean;
};

export type CreateProductPayload = {
  companyId: number;
  name: string;
  sku: string;
  unit: ProductUnit;
  buyPrice: number;
  salePrice: number;
  isActive?: boolean;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CreateStockMovementPayload = {
  companyId: number;
  productId: number;
  quantity: number;
  note?: string;
  movementDate: string;
};
