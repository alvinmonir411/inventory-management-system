import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemsRepository: Repository<PurchaseItem>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    private readonly stockTransactionsService: StockTransactionsService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    this.validateItems(createPurchaseDto);

    const normalizedPurchaseNo = createPurchaseDto.purchaseNo.trim().toUpperCase();
    const normalizedSupplierInvoiceNo =
      createPurchaseDto.supplierInvoiceNo?.trim().toUpperCase() || null;

    const existingPurchase = await this.purchasesRepository.findOne({
      where: { purchaseNo: normalizedPurchaseNo },
    });

    if (existingPurchase) {
      throw new ConflictException('Purchase number already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const [company, warehouse] = await Promise.all([
        this.findCompanyOrFail(createPurchaseDto.companyId, manager),
        this.findWarehouseOrFail(createPurchaseDto.warehouseId, manager),
      ]);

      const purchaseRepository = manager.getRepository(Purchase);
      const purchaseItemRepository = manager.getRepository(PurchaseItem);

      const purchase = await purchaseRepository.save(
        purchaseRepository.create({
          purchaseNo: normalizedPurchaseNo,
          supplierInvoiceNo: normalizedSupplierInvoiceNo,
          purchaseDate: createPurchaseDto.purchaseDate,
          note: createPurchaseDto.note?.trim() || null,
          company,
          warehouse,
        }),
      );

      for (const itemDto of createPurchaseDto.items) {
        const product = await this.findProductOrFail(itemDto.productId, manager);

        await purchaseItemRepository.save(
          purchaseItemRepository.create({
            purchase,
            product,
            quantity: itemDto.quantity,
            unitPrice: itemDto.unitPrice,
          }),
        );

        await this.stockTransactionsService.recordPurchase(
          {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: itemDto.quantity,
            transactionDate: createPurchaseDto.purchaseDate,
            referenceModule: 'purchases',
            referenceId: purchase.id,
            referenceCode: purchase.purchaseNo,
            note: createPurchaseDto.note,
          },
          manager,
        );
      }

      return this.findOneWithManager(purchase.id, manager);
    });
  }

  async findAll(queryPurchasesDto: QueryPurchasesDto) {
    const page = queryPurchasesDto.page ?? 1;
    const limit = queryPurchasesDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.company', 'company')
      .leftJoinAndSelect('purchase.warehouse', 'warehouse')
      .orderBy('purchase.purchaseDate', 'DESC')
      .addOrderBy('purchase.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (queryPurchasesDto.companyId) {
      queryBuilder.andWhere('company.id = :companyId', {
        companyId: queryPurchasesDto.companyId,
      });
    }

    if (queryPurchasesDto.warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', {
        warehouseId: queryPurchasesDto.warehouseId,
      });
    }

    if (queryPurchasesDto.fromDate) {
      queryBuilder.andWhere('purchase.purchase_date >= :fromDate', {
        fromDate: queryPurchasesDto.fromDate,
      });
    }

    if (queryPurchasesDto.toDate) {
      queryBuilder.andWhere('purchase.purchase_date <= :toDate', {
        toDate: queryPurchasesDto.toDate,
      });
    }

    const [purchases, total] = await queryBuilder.getManyAndCount();
    const purchaseSummaries = await this.getPurchaseSummaries(
      purchases.map((purchase) => purchase.id),
    );

    return {
      data: purchases.map((purchase) => ({
        id: purchase.id,
        purchaseNo: purchase.purchaseNo,
        supplierInvoiceNo: purchase.supplierInvoiceNo,
        purchaseDate: purchase.purchaseDate,
        note: purchase.note,
        company: purchase.company,
        warehouse: purchase.warehouse,
        itemCount: purchaseSummaries[purchase.id]?.itemCount ?? 0,
        totalAmount: purchaseSummaries[purchase.id]?.totalAmount ?? 0,
        createdAt: purchase.createdAt,
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
    const purchaseRepository = manager
      ? manager.getRepository(Purchase)
      : this.purchasesRepository;

    const purchase = await purchaseRepository.findOne({
      where: { id },
      relations: {
        company: true,
        warehouse: true,
        items: {
          product: true,
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return {
      ...purchase,
      totalAmount: this.calculateTotalAmount(purchase.items),
    };
  }

  private calculateTotalAmount(items: PurchaseItem[]): number {
    return items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );
  }

  private async getPurchaseSummaries(purchaseIds: string[]) {
    if (purchaseIds.length === 0) {
      return {};
    }

    const rows = await this.purchaseItemsRepository
      .createQueryBuilder('item')
      .select('item.purchase_id', 'purchaseId')
      .addSelect('COUNT(*)', 'itemCount')
      .addSelect('COALESCE(SUM(item.quantity * item.unit_price), 0)', 'totalAmount')
      .where('item.purchase_id IN (:...purchaseIds)', { purchaseIds })
      .groupBy('item.purchase_id')
      .getRawMany<{
        purchaseId: string;
        itemCount: string;
        totalAmount: string;
      }>();

    return rows.reduce<Record<string, { itemCount: number; totalAmount: number }>>(
      (acc, row) => {
        acc[row.purchaseId] = {
          itemCount: Number(row.itemCount),
          totalAmount: Number(row.totalAmount),
        };

        return acc;
      },
      {},
    );
  }

  private validateItems(createPurchaseDto: CreatePurchaseDto): void {
    if (createPurchaseDto.items.length === 0) {
      throw new BadRequestException('Purchase must contain at least one item');
    }

    const uniqueProductIds = new Set(createPurchaseDto.items.map((item) => item.productId));

    if (uniqueProductIds.size !== createPurchaseDto.items.length) {
      throw new BadRequestException('Duplicate products are not allowed in a purchase');
    }
  }

  private async findCompanyOrFail(
    companyId: string,
    manager?: EntityManager,
  ): Promise<Company> {
    const company = await this.getCompaniesRepository(manager).findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
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

  private getCompaniesRepository(manager?: EntityManager): Repository<Company> {
    return manager ? manager.getRepository(Company) : this.companiesRepository;
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
