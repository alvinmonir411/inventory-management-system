import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Product } from '../products/entities/product.entity';
import { StockTransactionsService } from '../stock-transactions/stock-transactions.service';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateDamageDto } from './dto/create-damage.dto';
import { QueryDamagesDto } from './dto/query-damages.dto';
import { Damage } from './entities/damage.entity';

@Injectable()
export class DamagesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Damage)
    private readonly damagesRepository: Repository<Damage>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    private readonly stockTransactionsService: StockTransactionsService,
  ) {}

  async create(createDamageDto: CreateDamageDto) {
    return this.dataSource.transaction(async (manager) => {
      const [product, warehouse] = await Promise.all([
        this.findProductOrFail(createDamageDto.productId, manager),
        this.findWarehouseOrFail(createDamageDto.warehouseId, manager),
      ]);

      const damagesRepository = manager.getRepository(Damage);
      const damage = await damagesRepository.save(
        damagesRepository.create({
          product,
          warehouse,
          damageDate: createDamageDto.damageDate,
          quantity: createDamageDto.quantity,
          reason: createDamageDto.reason?.trim() || null,
          note: createDamageDto.note?.trim() || null,
        }),
      );

      await this.stockTransactionsService.recordDamage(
        {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: createDamageDto.quantity,
          transactionDate: createDamageDto.damageDate,
          referenceModule: 'damages',
          referenceId: damage.id,
          note: createDamageDto.note?.trim() || createDamageDto.reason?.trim(),
        },
        manager,
      );

      return this.findOneWithManager(damage.id, manager);
    });
  }

  async findAll(queryDamagesDto: QueryDamagesDto) {
    const page = queryDamagesDto.page ?? 1;
    const limit = queryDamagesDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.damagesRepository
      .createQueryBuilder('damage')
      .leftJoinAndSelect('damage.product', 'product')
      .leftJoinAndSelect('damage.warehouse', 'warehouse')
      .orderBy('damage.damageDate', 'DESC')
      .addOrderBy('damage.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (queryDamagesDto.productId) {
      queryBuilder.andWhere('product.id = :productId', {
        productId: queryDamagesDto.productId,
      });
    }

    if (queryDamagesDto.warehouseId) {
      queryBuilder.andWhere('warehouse.id = :warehouseId', {
        warehouseId: queryDamagesDto.warehouseId,
      });
    }

    if (queryDamagesDto.fromDate) {
      queryBuilder.andWhere('damage.damage_date >= :fromDate', {
        fromDate: queryDamagesDto.fromDate,
      });
    }

    if (queryDamagesDto.toDate) {
      queryBuilder.andWhere('damage.damage_date <= :toDate', {
        toDate: queryDamagesDto.toDate,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
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
    const damageRepository = manager
      ? manager.getRepository(Damage)
      : this.damagesRepository;

    const damage = await damageRepository.findOne({
      where: { id },
      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!damage) {
      throw new NotFoundException('Damage not found');
    }

    return damage;
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

  private getProductsRepository(manager?: EntityManager): Repository<Product> {
    return manager ? manager.getRepository(Product) : this.productsRepository;
  }

  private getWarehousesRepository(
    manager?: EntityManager,
  ): Repository<Warehouse> {
    return manager ? manager.getRepository(Warehouse) : this.warehousesRepository;
  }
}
