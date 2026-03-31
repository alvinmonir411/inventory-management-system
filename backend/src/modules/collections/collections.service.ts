import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Route } from '../routes/entities/route.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { QueryCollectionsDto } from './dto/query-collections.dto';
import { Collection } from './entities/collection.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,
  ) {}

  async create(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const normalizedCollectionNo = createCollectionDto.collectionNo
      .trim()
      .toUpperCase();

    const existingCollection = await this.collectionsRepository.findOne({
      where: { collectionNo: normalizedCollectionNo },
    });

    if (existingCollection) {
      throw new ConflictException('Collection number already exists');
    }

    const route = await this.findRouteOrFail(createCollectionDto.routeId);

    const collection = this.collectionsRepository.create({
      collectionNo: normalizedCollectionNo,
      collectionDate: createCollectionDto.collectionDate,
      amount: createCollectionDto.amount,
      paymentMethod: createCollectionDto.paymentMethod?.trim() || null,
      note: createCollectionDto.note?.trim() || null,
      route,
    });

    return this.collectionsRepository.save(collection);
  }

  async findAll(queryCollectionsDto: QueryCollectionsDto) {
    const page = queryCollectionsDto.page ?? 1;
    const limit = queryCollectionsDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.collectionsRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.route', 'route')
      .orderBy('collection.collectionDate', 'DESC')
      .addOrderBy('collection.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (queryCollectionsDto.routeId) {
      queryBuilder.andWhere('route.id = :routeId', {
        routeId: queryCollectionsDto.routeId,
      });
    }

    if (queryCollectionsDto.fromDate) {
      queryBuilder.andWhere('collection.collection_date >= :fromDate', {
        fromDate: queryCollectionsDto.fromDate,
      });
    }

    if (queryCollectionsDto.toDate) {
      queryBuilder.andWhere('collection.collection_date <= :toDate', {
        toDate: queryCollectionsDto.toDate,
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

  async findOne(id: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id },
      relations: {
        route: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  private async findRouteOrFail(routeId: string): Promise<Route> {
    const route = await this.routesRepository.findOne({
      where: { id: routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }
}
