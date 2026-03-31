import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { QueryWarehousesDto } from './dto/query-warehouses.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const normalizedName = createWarehouseDto.name.trim();
    const normalizedCode = createWarehouseDto.code?.trim().toUpperCase() || null;

    await this.ensureUnique(normalizedName, normalizedCode);

    const warehouse = this.warehousesRepository.create({
      name: normalizedName,
      code: normalizedCode,
      note: createWarehouseDto.note?.trim() || null,
      isActive: createWarehouseDto.isActive ?? true,
    });

    return this.warehousesRepository.save(warehouse);
  }

  async findAll(
    queryWarehousesDto: QueryWarehousesDto,
  ): Promise<Warehouse[]> {
    const queryBuilder = this.warehousesRepository
      .createQueryBuilder('warehouse')
      .orderBy('warehouse.name', 'ASC');

    if (queryWarehousesDto.isActive !== undefined) {
      queryBuilder.andWhere('warehouse.is_active = :isActive', {
        isActive: queryWarehousesDto.isActive,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async update(
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    const nextName = updateWarehouseDto.name?.trim();
    const nextCode =
      updateWarehouseDto.code !== undefined
        ? updateWarehouseDto.code?.trim().toUpperCase() || null
        : warehouse.code;

    if ((nextName && nextName !== warehouse.name) || nextCode !== warehouse.code) {
      await this.ensureUnique(nextName ?? warehouse.name, nextCode, id);
    }

    warehouse.name = nextName ?? warehouse.name;
    warehouse.code = nextCode;
    warehouse.note =
      updateWarehouseDto.note !== undefined
        ? updateWarehouseDto.note?.trim() || null
        : warehouse.note;
    warehouse.isActive = updateWarehouseDto.isActive ?? warehouse.isActive;

    return this.warehousesRepository.save(warehouse);
  }

  async remove(id: string): Promise<{ message: string }> {
    const warehouse = await this.findOne(id);

    await this.warehousesRepository.remove(warehouse);

    return {
      message: 'Warehouse deleted successfully',
    };
  }

  private async ensureUnique(
    name: string,
    code: string | null,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.warehousesRepository
      .createQueryBuilder('warehouse')
      .where(
        new Brackets((qb) => {
          qb.where('warehouse.name = :name', { name });

          if (code !== null) {
            qb.orWhere('warehouse.code = :code', { code });
          }
        }),
      );

    if (excludeId) {
      queryBuilder.andWhere('warehouse.id != :excludeId', { excludeId });
    }

    const existingWarehouse = await queryBuilder.getOne();

    if (!existingWarehouse) {
      return;
    }

    if (existingWarehouse.name === name) {
      throw new ConflictException('Warehouse name already exists');
    }

    throw new ConflictException('Warehouse code already exists');
  }
}
