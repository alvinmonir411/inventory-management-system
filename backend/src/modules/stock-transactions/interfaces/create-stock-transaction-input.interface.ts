export type CreateStockTransactionInput = {
  productId: string;
  warehouseId: string;
  quantity: number;
  transactionDate: string;
  referenceModule: string;
  referenceId: string;
  referenceCode?: string;
  note?: string;
};
