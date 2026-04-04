import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { StockMovementType } from '../stock/enums/stock-movement-type.enum';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { ReceivePurchasePaymentDto } from './dto/receive-purchase-payment.dto';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchasePayment } from './entities/purchase-payment.entity';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    const purchaseId = await this.dataSource.transaction(async (manager) => {
      const company = await manager.getRepository(Company).findOne({
        where: { id: createPurchaseDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found.');
      }

      if (!company.isActive) {
        throw new BadRequestException(
          'Cannot create a purchase for an inactive company.',
        );
      }

      const productIds = createPurchaseDto.items.map((item) => item.productId);
      const uniqueProductIds = [...new Set(productIds)];

      if (uniqueProductIds.length !== productIds.length) {
        throw new BadRequestException(
          'Duplicate products are not allowed in a single purchase.',
        );
      }

      const products = await manager
        .getRepository(Product)
        .findByIds(uniqueProductIds);

      if (products.length !== uniqueProductIds.length) {
        throw new NotFoundException('One or more products were not found.');
      }

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );
      const preparedItems = createPurchaseDto.items.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found.`);
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Cannot purchase inactive product "${product.name}".`,
          );
        }

        if (product.companyId !== company.id) {
          throw new BadRequestException(
            `Product "${product.name}" does not belong to the selected company.`,
          );
        }

        const quantity = this.roundToThree(item.quantity);
        const unitCost = this.roundToTwo(item.unitCost);
        const lineTotal = this.roundToTwo(quantity * unitCost);

        return {
          productId: product.id,
          quantity,
          unitCost,
          lineTotal,
        };
      });

      const totalAmount = this.roundToTwo(
        preparedItems.reduce((sum, item) => sum + item.lineTotal, 0),
      );
      const referenceNo = createPurchaseDto.referenceNo?.trim() || null;

      if (referenceNo) {
        await this.ensureReferenceNoAvailable(
          manager.getRepository(Purchase),
          referenceNo,
        );
      }

      const purchase = manager.getRepository(Purchase).create({
        companyId: company.id,
        purchaseDate: createPurchaseDto.purchaseDate,
        referenceNo,
        totalAmount,
        paidAmount: 0,
        payableAmount: totalAmount,
        note: createPurchaseDto.note?.trim() || null,
      });
      const savedPurchase = await manager.getRepository(Purchase).save(purchase);

      await manager.getRepository(PurchaseItem).save(
        manager.getRepository(PurchaseItem).create(
          preparedItems.map((item) => ({
            purchaseId: savedPurchase.id,
            ...item,
          })),
        ),
      );

      const stockMovementNote = referenceNo
        ? `Purchase ${referenceNo}`
        : `Purchase #${savedPurchase.id}`;

      await manager.getRepository(StockMovement).save(
        manager.getRepository(StockMovement).create(
          preparedItems.map((item) => ({
            companyId: company.id,
            productId: item.productId,
            type: StockMovementType.STOCK_IN,
            quantity: item.quantity,
            note: stockMovementNote,
            movementDate: createPurchaseDto.purchaseDate,
          })),
        ),
      );

      return savedPurchase.id;
    });

    return this.findOne(purchaseId);
  }

  async findAll(query: QueryPurchasesDto) {
    const queryBuilder = this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.company', 'company')
      .orderBy('purchase.purchaseDate', 'DESC')
      .addOrderBy('purchase.id', 'DESC');

    this.applyPurchaseFilters(queryBuilder, query);

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const purchase = await this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.company', 'company')
      .leftJoinAndSelect('purchase.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('purchase.payments', 'payments')
      .where('purchase.id = :id', { id })
      .orderBy('items.id', 'ASC')
      .addOrderBy('payments.paymentDate', 'DESC')
      .addOrderBy('payments.id', 'DESC')
      .getOne();

    if (!purchase) {
      throw new NotFoundException('Purchase not found.');
    }

    return purchase;
  }

  async getCompanyWisePayableSummary(query: QueryPurchasesDto) {
    const queryBuilder = this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.company', 'company')
      .select('purchase.companyId', 'companyId')
      .addSelect('company.name', 'companyName')
      .addSelect('company.code', 'companyCode')
      .addSelect('COUNT(purchase.id)', 'purchaseCount')
      .addSelect(
        'COUNT(CASE WHEN purchase.payableAmount > 0 THEN 1 END)',
        'payablePurchaseCount',
      )
      .addSelect('COALESCE(SUM(purchase.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(purchase.paidAmount), 0)', 'totalPaid')
      .addSelect('COALESCE(SUM(purchase.payableAmount), 0)', 'totalPayable')
      .addSelect('MAX(purchase.purchaseDate)', 'lastPurchaseDate')
      .groupBy('purchase.companyId')
      .addGroupBy('company.name')
      .addGroupBy('company.code')
      .having('COALESCE(SUM(purchase.payableAmount), 0) > 0')
      .orderBy('"totalPayable"', 'DESC')
      .addOrderBy('company.name', 'ASC');

    this.applyPurchaseFilters(queryBuilder, query);

    const rows = await queryBuilder.getRawMany<{
      companyId: string;
      companyName: string;
      companyCode: string;
      purchaseCount: string;
      payablePurchaseCount: string;
      totalAmount: string;
      totalPaid: string;
      totalPayable: string;
      lastPurchaseDate: string | null;
    }>();

    return rows.map((row) => ({
      companyId: Number(row.companyId),
      companyName: row.companyName,
      companyCode: row.companyCode,
      purchaseCount: Number(row.purchaseCount),
      payablePurchaseCount: Number(row.payablePurchaseCount),
      totalAmount: Number(row.totalAmount),
      totalPaid: Number(row.totalPaid),
      totalPayable: Number(row.totalPayable),
      lastPurchaseDate: row.lastPurchaseDate,
    }));
  }

  async getCompanyPayableLedger(companyId: number) {
    const company = await this.dataSource.getRepository(Company).findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const summaryRow = await this.purchasesRepository
      .createQueryBuilder('purchase')
      .select('COUNT(purchase.id)', 'purchaseCount')
      .addSelect(
        'COUNT(CASE WHEN purchase.payableAmount > 0 THEN 1 END)',
        'payablePurchaseCount',
      )
      .addSelect('COALESCE(SUM(purchase.totalAmount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(purchase.paidAmount), 0)', 'totalPaid')
      .addSelect('COALESCE(SUM(purchase.payableAmount), 0)', 'totalPayable')
      .addSelect('MAX(purchase.purchaseDate)', 'lastPurchaseDate')
      .where('purchase.companyId = :companyId', { companyId })
      .getRawOne<{
        purchaseCount: string;
        payablePurchaseCount: string;
        totalAmount: string;
        totalPaid: string;
        totalPayable: string;
        lastPurchaseDate: string | null;
      }>();

    const payablePurchases = await this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.company', 'company')
      .leftJoinAndSelect('purchase.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('purchase.companyId = :companyId', { companyId })
      .andWhere('purchase.payableAmount > 0')
      .orderBy('purchase.purchaseDate', 'DESC')
      .addOrderBy('purchase.id', 'DESC')
      .addOrderBy('items.id', 'ASC')
      .getMany();

    const paymentHistoryRows = await this.dataSource
      .getRepository(PurchasePayment)
      .createQueryBuilder('payment')
      .leftJoin('payment.purchase', 'purchase')
      .leftJoin('purchase.company', 'company')
      .select('payment.id', 'id')
      .addSelect('payment.purchaseId', 'purchaseId')
      .addSelect('payment.amount', 'amount')
      .addSelect('payment.paymentDate', 'paymentDate')
      .addSelect('payment.note', 'note')
      .addSelect('purchase.referenceNo', 'referenceNo')
      .addSelect('purchase.totalAmount', 'purchaseTotalAmount')
      .addSelect('purchase.paidAmount', 'purchasePaidAmount')
      .addSelect('purchase.payableAmount', 'purchasePayableAmount')
      .addSelect('company.id', 'companyId')
      .addSelect('company.name', 'companyName')
      .addSelect('company.code', 'companyCode')
      .where('purchase.companyId = :companyId', { companyId })
      .orderBy('payment.paymentDate', 'DESC')
      .addOrderBy('payment.id', 'DESC')
      .getRawMany<{
        id: string;
        purchaseId: string;
        amount: string;
        paymentDate: string;
        note: string | null;
        referenceNo: string | null;
        purchaseTotalAmount: string;
        purchasePaidAmount: string;
        purchasePayableAmount: string;
        companyId: string;
        companyName: string;
        companyCode: string;
      }>();

    return {
      company,
      summary: {
        purchaseCount: Number(summaryRow?.purchaseCount ?? 0),
        payablePurchaseCount: Number(summaryRow?.payablePurchaseCount ?? 0),
        totalAmount: Number(summaryRow?.totalAmount ?? 0),
        totalPaid: Number(summaryRow?.totalPaid ?? 0),
        totalPayable: Number(summaryRow?.totalPayable ?? 0),
        lastPurchaseDate: summaryRow?.lastPurchaseDate ?? null,
      },
      payablePurchases,
      paymentHistory: paymentHistoryRows.map((row) => ({
        id: Number(row.id),
        purchaseId: Number(row.purchaseId),
        amount: Number(row.amount),
        paymentDate: row.paymentDate,
        note: row.note,
        referenceNo: row.referenceNo,
        purchaseTotalAmount: Number(row.purchaseTotalAmount),
        purchasePaidAmount: Number(row.purchasePaidAmount),
        purchasePayableAmount: Number(row.purchasePayableAmount),
        companyId: Number(row.companyId),
        companyName: row.companyName,
        companyCode: row.companyCode,
      })),
    };
  }

  async receivePayment(
    id: number,
    receivePurchasePaymentDto: ReceivePurchasePaymentDto,
  ) {
    const purchaseId = await this.dataSource.transaction(async (manager) => {
      const purchaseRepository = manager.getRepository(Purchase);
      const paymentRepository = manager.getRepository(PurchasePayment);

      const purchase = await purchaseRepository.findOne({
        where: { id },
      });

      if (!purchase) {
        throw new NotFoundException('Purchase not found.');
      }

      const amount = this.roundToTwo(receivePurchasePaymentDto.amount);

      if (purchase.payableAmount <= 0) {
        throw new BadRequestException(
          'This purchase has no payable amount left.',
        );
      }

      if (amount > purchase.payableAmount) {
        throw new BadRequestException(
          `Payment cannot be greater than payable amount (${purchase.payableAmount}).`,
        );
      }

      purchase.paidAmount = this.roundToTwo(purchase.paidAmount + amount);
      purchase.payableAmount = this.roundToTwo(
        purchase.totalAmount - purchase.paidAmount,
      );

      await purchaseRepository.save(purchase);
      await paymentRepository.save(
        paymentRepository.create({
          purchaseId: purchase.id,
          amount,
          paymentDate: receivePurchasePaymentDto.paymentDate,
          note: receivePurchasePaymentDto.note?.trim() || null,
        }),
      );

      return purchase.id;
    });

    return this.findOne(purchaseId);
  }

  private applyPurchaseFilters(
    queryBuilder: SelectQueryBuilder<Purchase>,
    query: QueryPurchasesDto,
  ) {
    if (query.companyId) {
      queryBuilder.andWhere('purchase.companyId = :companyId', {
        companyId: query.companyId,
      });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('purchase.purchaseDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      queryBuilder.andWhere('purchase.purchaseDate <= :toDate', {
        toDate: query.toDate,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        `(
          purchase.referenceNo ILIKE :search
          OR company.name ILIKE :search
          OR company.code ILIKE :search
          OR COALESCE(purchase.note, '') ILIKE :search
        )`,
        {
          search: `%${query.search}%`,
        },
      );
    }
  }

  private async ensureReferenceNoAvailable(
    purchaseRepository: Repository<Purchase>,
    referenceNo: string,
  ) {
    const existingPurchase = await purchaseRepository.findOne({
      where: { referenceNo },
    });

    if (existingPurchase) {
      throw new ConflictException('Purchase reference number already exists.');
    }
  }

  private roundToTwo(value: number) {
    return Number(value.toFixed(2));
  }

  private roundToThree(value: number) {
    return Number(value.toFixed(3));
  }
}
