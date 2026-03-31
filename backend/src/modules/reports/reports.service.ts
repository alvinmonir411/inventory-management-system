import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { toNumber } from '../../common/utils/number.util';
import { Collection } from '../collections/entities/collection.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanyPayment } from '../company-payments/entities/company-payment.entity';
import { Damage } from '../damages/entities/damage.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Product } from '../products/entities/product.entity';
import { PurchaseItem } from '../purchases/entities/purchase-item.entity';
import { Route } from '../routes/entities/route.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { StockTransaction } from '../stock-transactions/entities/stock-transaction.entity';
import { CompanySummaryFilter } from './interfaces/company-summary-filter.interface';
import { DailyTotalsFilter } from './interfaces/daily-totals-filter.interface';
import { DateRangeFilter } from './interfaces/date-range-filter.interface';
import { RouteSummaryFilter } from './interfaces/route-summary-filter.interface';
import { StockSummaryFilter } from './interfaces/stock-summary-filter.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemsRepository: Repository<PurchaseItem>,
    @InjectRepository(CompanyPayment)
    private readonly companyPaymentsRepository: Repository<CompanyPayment>,
    @InjectRepository(StockTransaction)
    private readonly stockTransactionsRepository: Repository<StockTransaction>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Damage)
    private readonly damagesRepository: Repository<Damage>,
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
  ) {}

  async getRouteSummary(filter: RouteSummaryFilter) {
    await this.ensureRouteExists(filter.routeId);

    const [salesTotal, collectionTotal] = await Promise.all([
      this.getRouteSalesTotal(filter),
      this.getRouteCollectionTotal(filter),
    ]);

    return {
      routeId: filter.routeId,
      salesTotal,
      collectionTotal,
      dueTotal: salesTotal - collectionTotal,
    };
  }

  async getCompanySummary(filter: CompanySummaryFilter) {
    await this.ensureCompanyExists(filter.companyId);

    const [purchaseTotal, paymentTotal] = await Promise.all([
      this.getCompanyPurchaseTotal(filter),
      this.getCompanyPaymentTotal(filter),
    ]);

    return {
      companyId: filter.companyId,
      purchaseTotal,
      paymentTotal,
      payableTotal: purchaseTotal - paymentTotal,
    };
  }

  async getOverallDueSummary(filter: DateRangeFilter = {}) {
    const [salesTotal, collectionTotal] = await Promise.all([
      this.getOverallSalesTotal(filter),
      this.getOverallCollectionTotal(filter),
    ]);

    return {
      salesTotal,
      collectionTotal,
      dueTotal: salesTotal - collectionTotal,
    };
  }

  async getOverallPayableSummary(filter: DateRangeFilter = {}) {
    const [purchaseTotal, paymentTotal] = await Promise.all([
      this.getOverallPurchaseTotal(filter),
      this.getOverallCompanyPaymentTotal(filter),
    ]);

    return {
      purchaseTotal,
      paymentTotal,
      payableTotal: purchaseTotal - paymentTotal,
    };
  }

  async getCurrentStockByProduct(filter: StockSummaryFilter = {}) {
    const queryBuilder = this.stockTransactionsRepository
      .createQueryBuilder('stockTransaction')
      .innerJoin('stockTransaction.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.code', 'productCode')
      .addSelect('product.name', 'productName')
      .addSelect(
        'COALESCE(SUM(stockTransaction.quantityIn), 0) - COALESCE(SUM(stockTransaction.quantityOut), 0)',
        'balance',
      )
      .groupBy('product.id')
      .addGroupBy('product.code')
      .addGroupBy('product.name')
      .orderBy('product.name', 'ASC');

    if (filter.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: filter.productId,
      });
    }

    if (filter.warehouseId) {
      queryBuilder.andWhere('stockTransaction.warehouse_id = :warehouseId', {
        warehouseId: filter.warehouseId,
      });
    }

    const rows = await queryBuilder.getRawMany<{
      productId: string;
      productCode: string;
      productName: string;
      balance: string;
    }>();

    return rows.map((row) => ({
      productId: row.productId,
      productCode: row.productCode,
      productName: row.productName,
      balance: toNumber(row.balance),
    }));
  }

  async getTotalStockValue(filter: StockSummaryFilter = {}) {
    const balanceSubQuery = this.stockTransactionsRepository
      .createQueryBuilder('stockTransaction')
      .select('stockTransaction.product_id', 'productId')
      .addSelect(
        'COALESCE(SUM(stockTransaction.quantity_in), 0) - COALESCE(SUM(stockTransaction.quantity_out), 0)',
        'balance',
      )
      .groupBy('stockTransaction.product_id');

    if (filter.productId) {
      balanceSubQuery.andWhere('stockTransaction.product_id = :productId', {
        productId: filter.productId,
      });
    }

    if (filter.warehouseId) {
      balanceSubQuery.andWhere('stockTransaction.warehouse_id = :warehouseId', {
        warehouseId: filter.warehouseId,
      });
    }

    const row = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin(
        `(${balanceSubQuery.getQuery()})`,
        'stockBalance',
        'stockBalance."productId" = product.id',
      )
      .setParameters(balanceSubQuery.getParameters())
      .select('COALESCE(SUM(stockBalance.balance), 0)', 'totalStockQuantity')
      .addSelect(
        'COALESCE(SUM(stockBalance.balance * product.purchase_price), 0)',
        'totalStockValue',
      )
      .getRawOne<{
        totalStockQuantity: string | null;
        totalStockValue: string | null;
      }>();

    return {
      totalStockQuantity: toNumber(row?.totalStockQuantity),
      totalStockValue: toNumber(row?.totalStockValue),
    };
  }

  async getDamageSummary(filter: DateRangeFilter & StockSummaryFilter = {}) {
    const queryBuilder = this.damagesRepository
      .createQueryBuilder('damage')
      .innerJoin('damage.product', 'product')
      .select('COALESCE(SUM(damage.quantity), 0)', 'totalQuantity')
      .addSelect(
        'COALESCE(SUM(damage.quantity * product.purchase_price), 0)',
        'totalValue',
      );

    if (filter.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: filter.productId,
      });
    }

    if (filter.warehouseId) {
      queryBuilder.andWhere('damage.warehouse_id = :warehouseId', {
        warehouseId: filter.warehouseId,
      });
    }

    this.applyDateRange(queryBuilder, 'damage.damage_date', filter);

    const row = await queryBuilder.getRawOne<{
      totalQuantity: string | null;
      totalValue: string | null;
    }>();

    return {
      totalDamageQuantity: toNumber(row?.totalQuantity),
      totalDamageValue: toNumber(row?.totalValue),
    };
  }

  async getExpenseSummary(filter: DateRangeFilter = {}) {
    const queryBuilder = this.expensesRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'totalExpenses');

    this.applyDateRange(queryBuilder, 'expense.expense_date', filter);

    const row = await queryBuilder.getRawOne<{ totalExpenses: string | null }>();

    return {
      totalExpenses: toNumber(row?.totalExpenses),
    };
  }

  async getDailyTotals(filter: DailyTotalsFilter = {}) {
    const [salesRows, collectionRows, purchaseRows, paymentRows, damageRows, expenseRows] =
      await Promise.all([
        this.getDailySalesTotals(filter),
        this.getDailyCollectionTotals(filter),
        this.getDailyPurchaseTotals(filter),
        this.getDailyCompanyPaymentTotals(filter),
        this.getDailyDamageTotals(filter),
        this.getDailyExpenseTotals(filter),
      ]);

    const dailyMap = new Map<
      string,
      {
        date: string;
        salesTotal: number;
        collectionTotal: number;
        routeDueChange: number;
        purchaseTotal: number;
        companyPaymentTotal: number;
        companyPayableChange: number;
        damageValue: number;
        expenseTotal: number;
      }
    >();

    const ensureDay = (date: string) => {
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          salesTotal: 0,
          collectionTotal: 0,
          routeDueChange: 0,
          purchaseTotal: 0,
          companyPaymentTotal: 0,
          companyPayableChange: 0,
          damageValue: 0,
          expenseTotal: 0,
        });
      }

      return dailyMap.get(date)!;
    };

    for (const row of salesRows) {
      const day = ensureDay(row.date);
      day.salesTotal = toNumber(row.total);
      day.routeDueChange += toNumber(row.total);
    }

    for (const row of collectionRows) {
      const day = ensureDay(row.date);
      day.collectionTotal = toNumber(row.total);
      day.routeDueChange -= toNumber(row.total);
    }

    for (const row of purchaseRows) {
      const day = ensureDay(row.date);
      day.purchaseTotal = toNumber(row.total);
      day.companyPayableChange += toNumber(row.total);
    }

    for (const row of paymentRows) {
      const day = ensureDay(row.date);
      day.companyPaymentTotal = toNumber(row.total);
      day.companyPayableChange -= toNumber(row.total);
    }

    for (const row of damageRows) {
      const day = ensureDay(row.date);
      day.damageValue = toNumber(row.total);
    }

    for (const row of expenseRows) {
      const day = ensureDay(row.date);
      day.expenseTotal = toNumber(row.total);
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getRouteSalesTotal(filter: RouteSummaryFilter): Promise<number> {
    const queryBuilder = this.saleItemsRepository
      .createQueryBuilder('saleItem')
      .innerJoin('saleItem.sale', 'sale')
      .select('COALESCE(SUM(saleItem.quantity * saleItem.unit_price), 0)', 'total')
      .where('sale.route_id = :routeId', { routeId: filter.routeId });

    this.applyDateRange(queryBuilder, 'sale.sale_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getRouteCollectionTotal(filter: RouteSummaryFilter): Promise<number> {
    const queryBuilder = this.collectionsRepository
      .createQueryBuilder('collection')
      .select('COALESCE(SUM(collection.amount), 0)', 'total')
      .where('collection.route_id = :routeId', { routeId: filter.routeId });

    this.applyDateRange(queryBuilder, 'collection.collection_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getCompanyPurchaseTotal(filter: CompanySummaryFilter): Promise<number> {
    const queryBuilder = this.purchaseItemsRepository
      .createQueryBuilder('purchaseItem')
      .innerJoin('purchaseItem.purchase', 'purchase')
      .select('COALESCE(SUM(purchaseItem.quantity * purchaseItem.unit_price), 0)', 'total')
      .where('purchase.company_id = :companyId', { companyId: filter.companyId });

    this.applyDateRange(queryBuilder, 'purchase.purchase_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getCompanyPaymentTotal(filter: CompanySummaryFilter): Promise<number> {
    const queryBuilder = this.companyPaymentsRepository
      .createQueryBuilder('companyPayment')
      .select('COALESCE(SUM(companyPayment.amount), 0)', 'total')
      .where('companyPayment.company_id = :companyId', {
        companyId: filter.companyId,
      });

    this.applyDateRange(queryBuilder, 'companyPayment.payment_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getOverallSalesTotal(filter: DateRangeFilter): Promise<number> {
    const queryBuilder = this.saleItemsRepository
      .createQueryBuilder('saleItem')
      .innerJoin('saleItem.sale', 'sale')
      .select('COALESCE(SUM(saleItem.quantity * saleItem.unit_price), 0)', 'total');

    this.applyDateRange(queryBuilder, 'sale.sale_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getOverallCollectionTotal(filter: DateRangeFilter): Promise<number> {
    const queryBuilder = this.collectionsRepository
      .createQueryBuilder('collection')
      .select('COALESCE(SUM(collection.amount), 0)', 'total');

    this.applyDateRange(queryBuilder, 'collection.collection_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getOverallPurchaseTotal(filter: DateRangeFilter): Promise<number> {
    const queryBuilder = this.purchaseItemsRepository
      .createQueryBuilder('purchaseItem')
      .innerJoin('purchaseItem.purchase', 'purchase')
      .select('COALESCE(SUM(purchaseItem.quantity * purchaseItem.unit_price), 0)', 'total');

    this.applyDateRange(queryBuilder, 'purchase.purchase_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getOverallCompanyPaymentTotal(
    filter: DateRangeFilter,
  ): Promise<number> {
    const queryBuilder = this.companyPaymentsRepository
      .createQueryBuilder('companyPayment')
      .select('COALESCE(SUM(companyPayment.amount), 0)', 'total');

    this.applyDateRange(queryBuilder, 'companyPayment.payment_date', filter);

    const row = await queryBuilder.getRawOne<{ total: string | null }>();

    return toNumber(row?.total);
  }

  private async getDailySalesTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.saleItemsRepository
      .createQueryBuilder('saleItem')
      .innerJoin('saleItem.sale', 'sale')
      .select('sale.sale_date', 'date')
      .addSelect('COALESCE(SUM(saleItem.quantity * saleItem.unit_price), 0)', 'total')
      .groupBy('sale.sale_date')
      .orderBy('sale.sale_date', 'ASC');

    this.applyDateRange(queryBuilder, 'sale.sale_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private async getDailyCollectionTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.collectionsRepository
      .createQueryBuilder('collection')
      .select('collection.collection_date', 'date')
      .addSelect('COALESCE(SUM(collection.amount), 0)', 'total')
      .groupBy('collection.collection_date')
      .orderBy('collection.collection_date', 'ASC');

    this.applyDateRange(queryBuilder, 'collection.collection_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private async getDailyPurchaseTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.purchaseItemsRepository
      .createQueryBuilder('purchaseItem')
      .innerJoin('purchaseItem.purchase', 'purchase')
      .select('purchase.purchase_date', 'date')
      .addSelect('COALESCE(SUM(purchaseItem.quantity * purchaseItem.unit_price), 0)', 'total')
      .groupBy('purchase.purchase_date')
      .orderBy('purchase.purchase_date', 'ASC');

    this.applyDateRange(queryBuilder, 'purchase.purchase_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private async getDailyCompanyPaymentTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.companyPaymentsRepository
      .createQueryBuilder('companyPayment')
      .select('companyPayment.payment_date', 'date')
      .addSelect('COALESCE(SUM(companyPayment.amount), 0)', 'total')
      .groupBy('companyPayment.payment_date')
      .orderBy('companyPayment.payment_date', 'ASC');

    this.applyDateRange(queryBuilder, 'companyPayment.payment_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private async getDailyDamageTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.damagesRepository
      .createQueryBuilder('damage')
      .innerJoin('damage.product', 'product')
      .select('damage.damage_date', 'date')
      .addSelect('COALESCE(SUM(damage.quantity * product.purchase_price), 0)', 'total')
      .groupBy('damage.damage_date')
      .orderBy('damage.damage_date', 'ASC');

    this.applyDateRange(queryBuilder, 'damage.damage_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private async getDailyExpenseTotals(filter: DailyTotalsFilter) {
    const queryBuilder = this.expensesRepository
      .createQueryBuilder('expense')
      .select('expense.expense_date', 'date')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
      .groupBy('expense.expense_date')
      .orderBy('expense.expense_date', 'ASC');

    this.applyDateRange(queryBuilder, 'expense.expense_date', filter);

    return queryBuilder.getRawMany<{ date: string; total: string }>();
  }

  private applyDateRange(
    queryBuilder: {
      andWhere: (condition: string, parameters: Record<string, string>) => unknown;
    },
    columnName: string,
    filter: DateRangeFilter,
  ): void {
    if (filter.fromDate) {
      queryBuilder.andWhere(`${columnName} >= :fromDate`, {
        fromDate: filter.fromDate,
      });
    }

    if (filter.toDate) {
      queryBuilder.andWhere(`${columnName} <= :toDate`, {
        toDate: filter.toDate,
      });
    }
  }

  private async ensureRouteExists(routeId: string): Promise<void> {
    const route = await this.routesRepository.findOne({
      where: { id: routeId },
      select: { id: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }
  }

  private async ensureCompanyExists(companyId: string): Promise<void> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }
}
