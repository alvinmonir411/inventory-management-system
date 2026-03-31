import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CreateRouteDto } from './dto/create-route.dto';
import { QueryRoutesDto } from './dto/query-routes.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const normalizedCode = createRouteDto.code.trim().toUpperCase();
    const normalizedName = createRouteDto.name.trim();

    await this.ensureCodeOrNameIsUnique(normalizedCode, normalizedName);

    const route = this.routesRepository.create({
      code: normalizedCode,
      name: normalizedName,
      note: createRouteDto.note?.trim() || null,
      isActive: createRouteDto.isActive ?? true,
    });

    return this.routesRepository.save(route);
  }

  async findAll(queryRoutesDto: QueryRoutesDto): Promise<Route[]> {
    const queryBuilder = this.routesRepository
      .createQueryBuilder('route')
      .orderBy('route.name', 'ASC');

    if (queryRoutesDto.isActive !== undefined) {
      queryBuilder.andWhere('route.is_active = :isActive', {
        isActive: queryRoutesDto.isActive,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    const nextCode = updateRouteDto.code?.trim().toUpperCase();
    const nextName = updateRouteDto.name?.trim();

    if (
      (nextCode && nextCode !== route.code) ||
      (nextName && nextName !== route.name)
    ) {
      await this.ensureCodeOrNameIsUnique(
        nextCode ?? route.code,
        nextName ?? route.name,
        id,
      );
    }

    route.code = nextCode ?? route.code;
    route.name = nextName ?? route.name;
    route.note =
      updateRouteDto.note !== undefined
        ? updateRouteDto.note?.trim() || null
        : route.note;
    route.isActive = updateRouteDto.isActive ?? route.isActive;

    return this.routesRepository.save(route);
  }

  async remove(id: string): Promise<{ message: string }> {
    const route = await this.findOne(id);

    await this.routesRepository.remove(route);

    return {
      message: 'Route deleted successfully',
    };
  }

  private async ensureCodeOrNameIsUnique(
    code: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existingRoute = await this.routesRepository
      .createQueryBuilder('route')
      .where(
        new Brackets((qb) => {
          qb.where('route.code = :code', { code }).orWhere('route.name = :name', {
            name,
          });
        }),
      )
      .andWhere(excludeId ? 'route.id != :excludeId' : '1=1', {
        excludeId,
      })
      .getOne();

    if (!existingRoute) {
      return;
    }

    if (existingRoute.code === code) {
      throw new ConflictException('Route code already exists');
    }

    throw new ConflictException('Route name already exists');
  }
}
