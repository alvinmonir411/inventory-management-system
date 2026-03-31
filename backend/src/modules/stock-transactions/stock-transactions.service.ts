import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateStockTransactionInput } from './interfaces/create-stock-transaction-input.interface';
import { StockBalanceFilter } from './interfaces/stock-balance-filter.interface';
import { StockTransaction } from './entities/stock-transaction.entity';
import { StockTransactionType } from './enums/stock-transaction-type.enum';

@Injectable()
export class StockTransactionsService {
  constructor(
    @InjectRepository(StockTransaction)
    private readonly stockTransactionsRepository: Repository<StockTransaction>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
  ) {}

  async recordPurchase(
    input: CreateStockTransactionInput,
    manager?: EntityManager,
  ): Promise<StockTransaction> {
    return this.createTransaction({
      ...input,
      type: StockTransactionType.Purchase,
      quantityIn: input.quantity,
      quantityOut: 0,
    }, manager);
  }

  async recordSale(
    input: CreateStockTransactionInput,
    manager?: EntityManager,
  ): Promise<StockTransaction> {
    return this.createTransaction({
      ...input,
      type: StockTransactionType.Sale,
      quantityIn: 0,
      quantityOut: input.quantity,
    }, manager);
  }

  async recordDamage(
    input: CreateStockTransactionInput,
    manager?: EntityManager,
  ): Promise<StockTransaction> {
    return this.createTransaction({
      ...input,
      type: StockTransactionType.Damage,
      quantityIn: 0,
      quantityOut: input.quantity,
    }, manager);
  }

  async getBalance(filter: StockBalanceFilter): Promise<number> {
    await Promise.all([
      this.findProductOrFail(filter.productId),
      this.findWarehouseOrFail(filter.warehouseId),
    ]);

    return this.getBalanceWithManager(filter);
  }

  private async createTransaction(
    input: CreateStockTransactionInput & {
      type: StockTransactionType;
      quantityIn: number;
      quantityOut: number;
    },
    manager?: EntityManager,
  ): Promise<StockTransaction> {
    this.validateQuantity(input.quantity);

    const [product, warehouse] = await Promise.all([
      this.findProductOrFail(input.productId, manager),
      this.findWarehouseOrFail(input.warehouseId, manager),
    ]);

    if (input.quantityOut > 0) {
      const currentBalance = await this.getBalanceWithManager(
        {
          productId: input.productId,
          warehouseId: input.warehouseId,
        },
        manager,
      );

      if (currentBalance < input.quantityOut) {
        throw new BadRequestException(
          'Insufficient stock for the requested transaction',
        );
      }
    }

    const transactionRepository = this.getStockTransactionsRepository(manager);
    const transaction = transactionRepository.create({
      type: input.type,
      product,
      warehouse,
      referenceModule: input.referenceModule.trim().toLowerCase(),
      referenceId: input.referenceId.trim(),
      referenceCode: input.referenceCode?.trim() || null,
      transactionDate: input.transactionDate,
      quantityIn: input.quantityIn,
      quantityOut: input.quantityOut,
      note: input.note?.trim() || null,
    });

    return transactionRepository.save(transaction);
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }
  }

  private async getBalanceWithManager(
    filter: StockBalanceFilter,
    manager?: EntityManager,
  ): Promise<number> {
    const result = await this.getStockTransactionsRepository(manager)
      .createQueryBuilder('stockTransaction')
      .select(
        'COALESCE(SUM(stockTransaction.quantityIn), 0) - COALESCE(SUM(stockTransaction.quantityOut), 0)',
        'balance',
      )
      .where('stockTransaction.product_id = :productId', {
        productId: filter.productId,
      })
      .andWhere('stockTransaction.warehouse_id = :warehouseId', {
        warehouseId: filter.warehouseId,
      })
      .getRawOne<{ balance: string }>();

    return Number(result?.balance ?? 0);
  }

  private async findProductOrFail(
    productId: string,
    manager?: EntityManager,
  ): Promise<Product> {
    const product = await this.getProductsRepository(manager).findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async findWarehouseOrFail(
    warehouseId: string,
    manager?: EntityManager,
  ): Promise<Warehouse> {
    const warehouse = await this.getWarehousesRepository(manager).findOne({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  private getStockTransactionsRepository(
    manager?: EntityManager,
  ): Repository<StockTransaction> {
    return manager
      ? manager.getRepository(StockTransaction)
      : this.stockTransactionsRepository;
  }

  private getProductsRepository(manager?: EntityManager): Repository<Product> {
    return manager ? manager.getRepository(Product) : this.productsRepository;
  }

  private getWarehousesRepository(
    manager?: EntityManager,
  ): Repository<Warehouse> {
    return manager ? manager.getRepository(Warehouse) : this.warehousesRepository;
  }
}
