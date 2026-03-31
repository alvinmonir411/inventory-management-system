import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const normalizedName = createUnitDto.name.trim().toLowerCase();
    const normalizedSymbol = createUnitDto.symbol?.trim().toLowerCase() || null;

    await this.ensureUnique(normalizedName, normalizedSymbol);

    const unit = this.unitsRepository.create({
      name: normalizedName,
      symbol: normalizedSymbol,
    });

    return this.unitsRepository.save(unit);
  }

  findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    const nextName = updateUnitDto.name?.trim().toLowerCase();
    const nextSymbol =
      updateUnitDto.symbol !== undefined
        ? updateUnitDto.symbol?.trim().toLowerCase() || null
        : unit.symbol;

    if (
      (nextName && nextName !== unit.name) ||
      nextSymbol !== unit.symbol
    ) {
      await this.ensureUnique(nextName ?? unit.name, nextSymbol, id);
    }

    unit.name = nextName ?? unit.name;
    unit.symbol = nextSymbol;

    return this.unitsRepository.save(unit);
  }

  async remove(id: string): Promise<{ message: string }> {
    const unit = await this.findOne(id);

    await this.unitsRepository.remove(unit);

    return {
      message: 'Unit deleted successfully',
    };
  }

  private async ensureUnique(
    name: string,
    symbol: string | null,
    excludeId?: string,
  ): Promise<void> {
    const units = await this.unitsRepository.find();

    const conflict = units.find((unit) => {
      if (excludeId && unit.id === excludeId) {
        return false;
      }

      return unit.name === name || (symbol !== null && unit.symbol === symbol);
    });

    if (!conflict) {
      return;
    }

    if (conflict.name === name) {
      throw new ConflictException('Unit name already exists');
    }

    throw new ConflictException('Unit symbol already exists');
  }
}
