import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Product } from '../products/entities/product.entity';
import { Route } from '../routes/entities/route.entity';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    private readonly stockTransactionsService: StockTransactionsService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    this.validateItems(createSaleDto);

    const normalizedSaleNo = createSaleDto.saleNo.trim().toUpperCase();

    const existingSale = await this.salesRepository.findOne({
      where: { saleNo: normalizedSaleNo },
    });

    if (existingSale) {
      throw new ConflictException('Sale number already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const [route, warehouse] = await Promise.all([
        this.findRouteOrFail(createSaleDto.routeId, manager),
        this.findWarehouseOrFail(createSaleDto.warehouseId, manager),
      ]);

      const saleRepository = manager.getRepository(Sale);
      const saleItemRepository = manager.getRepository(SaleItem);

      const sale = await saleRepository.save(
        saleRepository.create({
          saleNo: normalizedSaleNo,
          saleDate: createSaleDto.saleDate,
          note: createSaleDto.note?.trim() || null,
          route,
          warehouse,
        }),
      );

      for (const itemDto of createSaleDto.items) {
        const product = await this.findProductOrFail(itemDto.productId, manager);

        await saleItemRepository.save(
          saleItemRepository.create({
            sale,
            product,
            quantity: itemDto.quantity,
            unitPrice: itemDto.unitPrice,
          }),
        );

        await this.stockTransactionsService.recordSale(
          {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: itemDto.quantity,
            transactionDate: createSaleDto.saleDate,
            referenceModule: 'sales',
            referenceId: sale.id,
            referenceCode: sale.saleNo,
            note: createSaleDto.note,
          },
          manager,
        );
      }

      return this.findOneWithManager(sale.id, manager);
    });
  }

  async findAll(querySalesDto: QuerySalesDto) {
    const page = querySalesDto.page ?? 1;
    const limit = querySalesDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.route', 'route')
      .leftJoinAndSelect('sale.warehouse', 'warehouse')
      .orderBy('sale.saleDate', 'DESC')
      .addOrderBy('sale.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (querySalesDto.routeId) {
      queryBuilder.andWhere('route.id = :routeId', {
        routeId: querySalesDto.routeId,
      });
    }

    if (querySalesDto.warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', {
        warehouseId: querySalesDto.warehouseId,
      });
    }

    if (querySalesDto.fromDate) {
      queryBuilder.andWhere('sale.sale_date >= :fromDate', {
        fromDate: querySalesDto.fromDate,
      });
    }

    if (querySalesDto.toDate) {
      queryBuilder.andWhere('sale.sale_date <= :toDate', {
        toDate: querySalesDto.toDate,
      });
    }

    const [sales, total] = await queryBuilder.getManyAndCount();
    const saleSummaries = await this.getSaleSummaries(sales.map((sale) => sale.id));

    return {
      data: sales.map((sale) => ({
        id: sale.id,
        saleNo: sale.saleNo,
        saleDate: sale.saleDate,
        note: sale.note,
        route: sale.route,
        warehouse: sale.warehouse,
        itemCount: saleSummaries[sale.id]?.itemCount ?? 0,
        totalAmount: saleSummaries[sale.id]?.totalAmount ?? 0,
        createdAt: sale.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.findOneWithManager(id);
  }

  private async findOneWithManager(id: string, manager?: EntityManager) {
    const saleRepository = manager
      ? manager.getRepository(Sale)
      : this.salesRepository;

    const sale = await saleRepository.findOne({
      where: { id },
      relations: {
        route: true,
        warehouse: true,
        items: {
          product: true,
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return {
      ...sale,
      totalAmount: this.calculateTotalAmount(sale.items),
    };
  }

  private calculateTotalAmount(items: SaleItem[]): number {
    return items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );
  }

  private async getSaleSummaries(saleIds: string[]) {
    if (saleIds.length === 0) {
      return {};
    }

    const rows = await this.saleItemsRepository
      .createQueryBuilder('item')
      .select('item.sale_id', 'saleId')
      .addSelect('COUNT(*)', 'itemCount')
      .addSelect('COALESCE(SUM(item.quantity * item.unit_price), 0)', 'totalAmount')
      .where('item.sale_id IN (:...saleIds)', { saleIds })
      .groupBy('item.sale_id')
      .getRawMany<{
        saleId: string;
        itemCount: string;
        totalAmount: string;
      }>();

    return rows.reduce<Record<string, { itemCount: number; totalAmount: number }>>(
      (acc, row) => {
        acc[row.saleId] = {
          itemCount: Number(row.itemCount),
          totalAmount: Number(row.totalAmount),
        };

        return acc;
      },
      {},
    );
  }

  private validateItems(createSaleDto: CreateSaleDto): void {
    if (createSaleDto.items.length === 0) {
      throw new BadRequestException('Sale must contain at least one item');
    }

    const uniqueProductIds = new Set(createSaleDto.items.map((item) => item.productId));

    if (uniqueProductIds.size !== createSaleDto.items.length) {
      throw new BadRequestException('Duplicate products are not allowed in a sale');
    }
  }

  private async findRouteOrFail(
    routeId: string,
    manager?: EntityManager,
  ): Promise<Route> {
    const route = await this.getRoutesRepository(manager).findOne({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
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

  private getRoutesRepository(manager?: EntityManager): Repository<Route> {
    return manager ? manager.getRepository(Route) : this.routesRepository;
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
