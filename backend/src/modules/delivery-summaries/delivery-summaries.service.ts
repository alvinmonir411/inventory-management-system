import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';
import { Route } from '../routes/entities/route.entity';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { StockMovementType } from '../stock/enums/stock-movement-type.enum';
import { CreateDeliverySummaryDto } from './dto/create-delivery-summary.dto';
import { QueryDeliverySummariesDto } from './dto/query-delivery-summaries.dto';
import { UpdateDeliverySummaryDto } from './dto/update-delivery-summary.dto';
import { DeliverySummaryItem } from './entities/delivery-summary-item.entity';
import { DeliverySummary } from './entities/delivery-summary.entity';

@Injectable()
export class DeliverySummariesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(DeliverySummary)
    private readonly deliverySummaryRepo: Repository<DeliverySummary>,
  ) {}

  async create(createDto: CreateDeliverySummaryDto) {
    const summaryId = await this.dataSource.transaction(async (manager) => {
      // Validate company if provided
      if (createDto.companyId) {
        const company = await manager.getRepository(Company).findOne({
          where: { id: createDto.companyId },
        });
        if (!company || !company.isActive) {
          throw new BadRequestException('Invalid or inactive company.');
        }
      }

      // Validate route if provided
      if (createDto.routeId) {
        const route = await manager.getRepository(Route).findOne({
          where: { id: createDto.routeId },
        });
        if (!route || !route.isActive) {
          throw new BadRequestException('Invalid or inactive route.');
        }
      }

      // Validate products
      const productIds = createDto.items.map((i) => i.productId);
      const products = await manager.getRepository(Product).findByIds(productIds);
      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found.');
      }

      const productsMap = new Map(products.map((p) => [p.id, p]));

      const items = createDto.items.map((item) => {
        const product = productsMap.get(item.productId)!;
        const unitPrice = item.unitPrice ?? product.salePrice;
        const orderQuantity = Math.round(item.orderQuantity);
        return manager.getRepository(DeliverySummaryItem).create({
          productId: product.id,
          orderQuantity,
          returnQuantity: 0,
          saleQuantity: orderQuantity,
          unitPrice,
          lineTotal: Number((orderQuantity * unitPrice).toFixed(2)),
        });
      });

      const summary = manager.getRepository(DeliverySummary).create({
        companyId: createDto.companyId || null,
        routeId: createDto.routeId || null,
        deliveryDate: createDto.deliveryDate,
        note: createDto.note || null,
        status: 'PENDING',
        items,
      });

      const savedSummary = await manager.getRepository(DeliverySummary).save(summary);
      return savedSummary.id;
    });

    return this.findOne(summaryId);
  }

  async findAll(query: QueryDeliverySummariesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    
    const queryBuilder = this.deliverySummaryRepo
      .createQueryBuilder('ds')
      .leftJoinAndSelect('ds.company', 'company')
      .leftJoinAndSelect('ds.route', 'route')
      .leftJoinAndSelect('ds.items', 'items')
      .orderBy('ds.deliveryDate', 'DESC')
      .addOrderBy('ds.id', 'DESC');

    if (query.companyId) {
      queryBuilder.andWhere('ds.companyId = :companyId', { companyId: query.companyId });
    }
    if (query.routeId) {
      queryBuilder.andWhere('ds.routeId = :routeId', { routeId: query.routeId });
    }
    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('ds.deliveryDate >= :start AND ds.deliveryDate <= :end', { start, end });
    }

    const [items, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalItems, page, pageSize: limit };
  }

  async findOne(id: number) {
    const summary = await this.deliverySummaryRepo.findOne({
      where: { id },
      relations: ['company', 'route', 'items', 'items.product'],
    });
    if (!summary) throw new NotFoundException('Delivery Summary not found');
    return summary;
  }

  async update(id: number, updateDto: UpdateDeliverySummaryDto) {
    const summaryId = await this.dataSource.transaction(async (manager) => {
      const summary = await manager.getRepository(DeliverySummary).findOne({
        where: { id },
        relations: ['items', 'items.product'],
      });

      if (!summary) throw new NotFoundException('Delivery Summary not found');

      const itemsMap = new Map(summary.items.map((i) => [i.productId, i]));

      for (const updateItem of updateDto.items) {
        const item = itemsMap.get(updateItem.productId);
        if (!item) continue;

        if (updateItem.returnQuantity > item.orderQuantity) {
          throw new BadRequestException(
            `Return quantity for product ${item.product?.name || item.productId} cannot exceed order quantity.`,
          );
        }

        item.returnQuantity = Math.round(updateItem.returnQuantity);
        item.saleQuantity = Math.round(item.orderQuantity - item.returnQuantity);
        item.lineTotal = Number((item.saleQuantity * item.unitPrice).toFixed(2));
        if (updateItem.remarks !== undefined) {
          item.remarks = updateItem.remarks;
        }

        await manager.getRepository(DeliverySummaryItem).save(item);
      }

      const shouldFinalize = updateDto.finalize === true;
      const isAlreadyCompleted = summary.status === 'COMPLETED';

      if (shouldFinalize || isAlreadyCompleted) {
        summary.status = 'COMPLETED';
        await manager.getRepository(DeliverySummary).save(summary);

        // Safely reverse old stock effects
        await manager.getRepository(StockMovement).delete({
          note: `DeliverySummary ${id}`,
        });

        // Add new stock movements for valid sales
        const newMovements: StockMovement[] = [];
        
        for (const item of summary.items) {
          const companyIdToUse = summary.companyId || item.product?.companyId;
          if (!companyIdToUse) continue;

          if (item.isFromOrder) {
            // ORDER ITEM: The Order already deducted full quantity.
            // We only need to add back the returned quantity to stock.
            if (item.returnQuantity > 0) {
              newMovements.push(manager.getRepository(StockMovement).create({
                companyId: companyIdToUse,
                productId: item.productId,
                type: StockMovementType.RETURN_IN,
                quantity: item.returnQuantity,
                note: `DeliverySummary ${id} Return`,
                movementDate: summary.deliveryDate,
              }));
            }
          } else {
            // MANUAL ITEM: Nothing has deducted stock yet.
            // Deduct the final sale quantity.
            if (item.saleQuantity > 0) {
              newMovements.push(manager.getRepository(StockMovement).create({
                companyId: companyIdToUse,
                productId: item.productId,
                type: StockMovementType.SALE_OUT,
                quantity: item.saleQuantity,
                note: `DeliverySummary ${id} Manual`,
                movementDate: summary.deliveryDate,
              }));
            }
          }
        }

        if (newMovements.length > 0) {
          await manager.getRepository(StockMovement).save(newMovements);
        }
      }

      return summary.id;
    });

    return this.findOne(summaryId);
  }

  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const summary = await manager.getRepository(DeliverySummary).findOne({
        where: { id },
      });
      if (!summary) throw new NotFoundException('Delivery Summary not found');

      // Reverse stock effects if any exist
      await manager.getRepository(StockMovement).delete({
        note: `DeliverySummary ${id}`,
      });

      await manager.getRepository(DeliverySummary).remove(summary);
      return { success: true };
    });
  }
}
