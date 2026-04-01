import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';
import { Route } from '../routes/entities/route.entity';
import { Shop } from '../shops/entities/shop.entity';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { StockMovementType } from '../stock/enums/stock-movement-type.enum';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SalesSummaryQueryDto } from './dto/sales-summary-query.dto';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const sale = await this.dataSource.transaction(async (manager) => {
      const company = await manager.getRepository(Company).findOne({
        where: { id: createSaleDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found.');
      }

      if (!company.isActive) {
        throw new BadRequestException(
          'Cannot create a sale for an inactive company.',
        );
      }

      const route = await manager.getRepository(Route).findOne({
        where: { id: createSaleDto.routeId },
      });

      if (!route) {
        throw new NotFoundException('Route not found.');
      }

      if (!route.isActive) {
        throw new BadRequestException(
          'Cannot create a sale for an inactive route.',
        );
      }

      let shop: Shop | null = null;
      if (createSaleDto.shopId) {
        shop = await manager.getRepository(Shop).findOne({
          where: { id: createSaleDto.shopId },
        });

        if (!shop) {
          throw new NotFoundException('Shop not found.');
        }

        if (!shop.isActive) {
          throw new BadRequestException(
            'Cannot create a sale for an inactive shop.',
          );
        }

        if (shop.routeId !== route.id) {
          throw new BadRequestException(
            'Selected shop does not belong to the selected route.',
          );
        }
      }

      const productIds = [
        ...new Set(createSaleDto.items.map((item) => item.productId)),
      ];
      const products = await manager
        .getRepository(Product)
        .findByIds(productIds);

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products were not found.');
      }

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );
      const requiredQuantities = new Map<number, number>();

      for (const item of createSaleDto.items) {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found.`);
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Cannot sell inactive product "${product.name}".`,
          );
        }

        if (product.companyId !== company.id) {
          throw new BadRequestException(
            `Product "${product.name}" does not belong to the selected company.`,
          );
        }

        requiredQuantities.set(
          item.productId,
          this.roundToThree(
            (requiredQuantities.get(item.productId) ?? 0) + item.quantity,
          ),
        );
      }

      const availableStockByProduct = await this.getCurrentStockByProduct(
        manager,
        company.id,
        productIds,
      );

      for (const [
        productId,
        requiredQuantity,
      ] of requiredQuantities.entries()) {
        const product = productsById.get(productId)!;
        const availableQuantity = availableStockByProduct.get(productId) ?? 0;

        if (availableQuantity < requiredQuantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Available: ${availableQuantity}, required: ${requiredQuantity}.`,
          );
        }
      }

      const preparedItems = createSaleDto.items.map((item) => {
        const product = productsById.get(item.productId)!;
        const quantity = this.roundToThree(item.quantity);
        const unitPrice = this.roundToTwo(item.unitPrice);
        const buyPrice = this.roundToTwo(product.buyPrice);
        const lineTotal = this.roundToTwo(quantity * unitPrice);
        const lineProfit = this.roundToTwo((unitPrice - buyPrice) * quantity);

        return {
          productId: product.id,
          quantity,
          unitPrice,
          buyPrice,
          lineTotal,
          lineProfit,
        };
      });

      const totalAmount = this.roundToTwo(
        preparedItems.reduce((sum, item) => sum + item.lineTotal, 0),
      );
      const totalProfit = this.roundToTwo(
        preparedItems.reduce((sum, item) => sum + item.lineProfit, 0),
      );
      const paidAmount = this.roundToTwo(createSaleDto.paidAmount);

      if (paidAmount > totalAmount) {
        throw new BadRequestException(
          'Paid amount cannot be greater than total amount.',
        );
      }

      const dueAmount = this.roundToTwo(totalAmount - paidAmount);

      if (dueAmount > 0 && !createSaleDto.shopId) {
        throw new BadRequestException(
          'Shop is required when the sale has a due amount.',
        );
      }

      const saleRepository = manager.getRepository(Sale);
      const invoiceNo = createSaleDto.invoiceNo?.trim()
        ? await this.ensureInvoiceNoAvailable(
            saleRepository,
            createSaleDto.invoiceNo.trim(),
          )
        : await this.generateInvoiceNo(saleRepository, createSaleDto.saleDate);

      const sale = saleRepository.create({
        companyId: company.id,
        routeId: route.id,
        shopId: shop?.id ?? null,
        saleDate: createSaleDto.saleDate,
        invoiceNo,
        totalAmount,
        paidAmount,
        dueAmount,
        totalProfit,
        note: createSaleDto.note?.trim() || null,
      });

      const savedSale = await saleRepository.save(sale);

      await manager.getRepository(SaleItem).save(
        manager.getRepository(SaleItem).create(
          preparedItems.map((item) => ({
            saleId: savedSale.id,
            ...item,
          })),
        ),
      );

      await manager.getRepository(StockMovement).save(
        manager.getRepository(StockMovement).create(
          preparedItems.map((item) => ({
            companyId: company.id,
            productId: item.productId,
            type: StockMovementType.SALE_OUT,
            quantity: item.quantity,
            note: `Sale ${invoiceNo}`,
            movementDate: createSaleDto.saleDate,
          })),
        ),
      );

      return savedSale.id;
    });

    return this.findOne(sale);
  }

  async findAll(query: QuerySalesDto) {
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.company', 'company')
      .leftJoinAndSelect('sale.route', 'route')
      .leftJoinAndSelect('sale.shop', 'shop')
      .orderBy('sale.saleDate', 'DESC')
      .addOrderBy('sale.id', 'DESC');

    this.applySalesFilters(queryBuilder, query);

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: {
        company: true,
        route: true,
        shop: true,
        items: {
          product: true,
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found.');
    }

    return sale;
  }

  async getTodaySalesSummary(query: SalesSummaryQueryDto) {
    const { start, end } = this.getDayRange(query.date);
    const summary = await this.getAggregateSummary({
      ...query,
      fromDate: start,
      toDate: end,
    });

    return {
      date: start.toISOString(),
      saleCount: summary.saleCount,
      totalAmount: summary.totalAmount,
      paidAmount: summary.paidAmount,
      dueAmount: summary.dueAmount,
    };
  }

  async getTodayProfitSummary(query: SalesSummaryQueryDto) {
    const { start, end } = this.getDayRange(query.date);
    const summary = await this.getAggregateSummary({
      ...query,
      fromDate: start,
      toDate: end,
    });

    return {
      date: start.toISOString(),
      saleCount: summary.saleCount,
      totalProfit: summary.totalProfit,
    };
  }

  async getMonthlySalesSummary(query: SalesSummaryQueryDto) {
    const { start, end, year, month } = this.getMonthRange(
      query.year,
      query.month,
    );
    const summary = await this.getAggregateSummary({
      ...query,
      fromDate: start,
      toDate: end,
    });

    return {
      year,
      month,
      saleCount: summary.saleCount,
      totalAmount: summary.totalAmount,
      paidAmount: summary.paidAmount,
      dueAmount: summary.dueAmount,
      totalProfit: summary.totalProfit,
    };
  }

  async getRouteWiseSalesSummary(query: SalesSummaryQueryDto) {
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.route', 'route')
      .select('sale.routeId', 'routeId')
      .addSelect('route.name', 'routeName')
      .addSelect('route.area', 'routeArea')
      .addSelect('COUNT(sale.id)', 'saleCount')
      .addSelect('COALESCE(SUM(sale.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(sale.paidAmount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(sale.dueAmount), 0)', 'dueAmount')
      .addSelect('COALESCE(SUM(sale.totalProfit), 0)', 'totalProfit')
      .groupBy('sale.routeId')
      .addGroupBy('route.name')
      .addGroupBy('route.area')
      .orderBy('route.name', 'ASC');

    this.applySalesFilters(queryBuilder, query);

    const rows = await queryBuilder.getRawMany<{
      routeId: string;
      routeName: string;
      routeArea: string | null;
      saleCount: string;
      totalAmount: string;
      paidAmount: string;
      dueAmount: string;
      totalProfit: string;
    }>();

    return rows.map((row) => ({
      routeId: Number(row.routeId),
      routeName: row.routeName,
      routeArea: row.routeArea,
      saleCount: Number(row.saleCount),
      totalAmount: Number(row.totalAmount),
      paidAmount: Number(row.paidAmount),
      dueAmount: Number(row.dueAmount),
      totalProfit: Number(row.totalProfit),
    }));
  }

  async getCompanyWiseSalesSummary(query: SalesSummaryQueryDto) {
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.company', 'company')
      .select('sale.companyId', 'companyId')
      .addSelect('company.name', 'companyName')
      .addSelect('company.code', 'companyCode')
      .addSelect('COUNT(sale.id)', 'saleCount')
      .addSelect('COALESCE(SUM(sale.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(sale.paidAmount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(sale.dueAmount), 0)', 'dueAmount')
      .addSelect('COALESCE(SUM(sale.totalProfit), 0)', 'totalProfit')
      .groupBy('sale.companyId')
      .addGroupBy('company.name')
      .addGroupBy('company.code')
      .orderBy('company.name', 'ASC');

    this.applySalesFilters(queryBuilder, query);

    const rows = await queryBuilder.getRawMany<{
      companyId: string;
      companyName: string;
      companyCode: string;
      saleCount: string;
      totalAmount: string;
      paidAmount: string;
      dueAmount: string;
      totalProfit: string;
    }>();

    return rows.map((row) => ({
      companyId: Number(row.companyId),
      companyName: row.companyName,
      companyCode: row.companyCode,
      saleCount: Number(row.saleCount),
      totalAmount: Number(row.totalAmount),
      paidAmount: Number(row.paidAmount),
      dueAmount: Number(row.dueAmount),
      totalProfit: Number(row.totalProfit),
    }));
  }

  private async getCurrentStockByProduct(
    manager: EntityManager,
    companyId: number,
    productIds: number[],
  ) {
    if (productIds.length === 0) {
      return new Map<number, number>();
    }

    const rows = await manager
      .getRepository(StockMovement)
      .createQueryBuilder('movement')
      .select('movement.productId', 'productId')
      .addSelect(
        `
          COALESCE(
            SUM(
              CASE
                WHEN movement.type = :saleOutType THEN -movement.quantity
                ELSE movement.quantity
              END
            ),
            0
          )
        `,
        'currentStock',
      )
      .where('movement.companyId = :companyId', { companyId })
      .andWhere('movement.productId IN (:...productIds)', { productIds })
      .groupBy('movement.productId')
      .setParameter('saleOutType', StockMovementType.SALE_OUT)
      .getRawMany<{ productId: string; currentStock: string }>();

    return new Map(
      rows.map((row) => [Number(row.productId), Number(row.currentStock)]),
    );
  }

  private async getAggregateSummary(query: SalesSummaryQueryDto) {
    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .select('COUNT(sale.id)', 'saleCount')
      .addSelect('COALESCE(SUM(sale.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(sale.paidAmount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(sale.dueAmount), 0)', 'dueAmount')
      .addSelect('COALESCE(SUM(sale.totalProfit), 0)', 'totalProfit');

    this.applySalesFilters(queryBuilder, query);

    const row = await queryBuilder.getRawOne<{
      saleCount: string;
      totalAmount: string;
      paidAmount: string;
      dueAmount: string;
      totalProfit: string;
    }>();

    return {
      saleCount: Number(row?.saleCount ?? 0),
      totalAmount: Number(row?.totalAmount ?? 0),
      paidAmount: Number(row?.paidAmount ?? 0),
      dueAmount: Number(row?.dueAmount ?? 0),
      totalProfit: Number(row?.totalProfit ?? 0),
    };
  }

  private applySalesFilters(
    queryBuilder: SelectQueryBuilder<Sale>,
    query: QuerySalesDto | SalesSummaryQueryDto,
  ) {
    if (query.companyId) {
      queryBuilder.andWhere('sale.companyId = :companyId', {
        companyId: query.companyId,
      });
    }

    if (query.routeId) {
      queryBuilder.andWhere('sale.routeId = :routeId', {
        routeId: query.routeId,
      });
    }

    if (query.shopId) {
      queryBuilder.andWhere('sale.shopId = :shopId', {
        shopId: query.shopId,
      });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('sale.saleDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      queryBuilder.andWhere('sale.saleDate <= :toDate', {
        toDate: query.toDate,
      });
    }
  }

  private async ensureInvoiceNoAvailable(
    saleRepository: Repository<Sale>,
    invoiceNo: string,
  ) {
    const existingSale = await saleRepository.findOne({
      where: { invoiceNo },
    });

    if (existingSale) {
      throw new ConflictException('Invoice number already exists.');
    }

    return invoiceNo;
  }

  private async generateInvoiceNo(
    saleRepository: Repository<Sale>,
    saleDate: Date,
  ) {
    const datePart = this.formatInvoiceDate(saleDate);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `INV-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
      const existingSale = await saleRepository.findOne({
        where: { invoiceNo: candidate },
      });

      if (!existingSale) {
        return candidate;
      }
    }

    return `INV-${datePart}-${Date.now()}`;
  }

  private formatInvoiceDate(value: Date) {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}${month}${day}`;
  }

  private getDayRange(date?: Date) {
    const baseDate = date ? new Date(date) : new Date();
    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getMonthRange(year?: number, month?: number) {
    const today = new Date();
    const resolvedYear = year ?? today.getFullYear();
    const resolvedMonth = month ?? today.getMonth() + 1;
    const start = new Date(resolvedYear, resolvedMonth - 1, 1, 0, 0, 0, 0);
    const end = new Date(resolvedYear, resolvedMonth, 0, 23, 59, 59, 999);

    return {
      start,
      end,
      year: resolvedYear,
      month: resolvedMonth,
    };
  }

  private roundToTwo(value: number) {
    return Number(value.toFixed(2));
  }

  private roundToThree(value: number) {
    return Number(value.toFixed(3));
  }
}
