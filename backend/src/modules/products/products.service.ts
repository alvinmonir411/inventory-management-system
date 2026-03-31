import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Category } from '../categories/entities/category.entity';
import { Company } from '../companies/entities/company.entity';
import { Unit } from '../units/entities/unit.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const normalizedCode = createProductDto.code.trim().toUpperCase();
    const normalizedSku = createProductDto.sku?.trim().toUpperCase() || null;
    const normalizedName = createProductDto.name.trim();

    await this.ensureUnique(normalizedCode, normalizedSku);

    const [company, category, unit] = await Promise.all([
      this.findCompanyOrFail(createProductDto.companyId),
      this.findCategoryOrFail(createProductDto.categoryId),
      this.findUnitOrFail(createProductDto.unitId),
    ]);

    const product = this.productsRepository.create({
      code: normalizedCode,
      sku: normalizedSku,
      name: normalizedName,
      purchasePrice: createProductDto.purchasePrice,
      salePrice: createProductDto.salePrice,
      mrp: createProductDto.mrp ?? null,
      isActive: createProductDto.isActive ?? true,
      company,
      category,
      unit,
    });

    const savedProduct = await this.productsRepository.save(product);

    return this.findOne(savedProduct.id);
  }

  async findAll(queryProductsDto: QueryProductsDto) {
    const page = queryProductsDto.page ?? 1;
    const limit = queryProductsDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.unit', 'unit')
      .orderBy('product.name', 'ASC')
      .skip(skip)
      .take(limit);

    if (queryProductsDto.search) {
      const normalizedSearch = `%${queryProductsDto.search.trim()}%`;

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :search', {
            search: normalizedSearch,
          })
            .orWhere('product.code ILIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('product.sku ILIKE :search', {
              search: normalizedSearch,
            });
        }),
      );
    }

    if (queryProductsDto.companyId) {
      queryBuilder.andWhere('company.id = :companyId', {
        companyId: queryProductsDto.companyId,
      });
    }

    if (queryProductsDto.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: queryProductsDto.categoryId,
      });
    }

    if (queryProductsDto.unitId) {
      queryBuilder.andWhere('unit.id = :unitId', {
        unitId: queryProductsDto.unitId,
      });
    }

    if (queryProductsDto.isActive !== undefined) {
      queryBuilder.andWhere('product.is_active = :isActive', {
        isActive: queryProductsDto.isActive,
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        company: true,
        category: true,
        unit: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const nextCode = updateProductDto.code?.trim().toUpperCase();
    const nextSku =
      updateProductDto.sku !== undefined
        ? updateProductDto.sku?.trim().toUpperCase() || null
        : product.sku;
    const nextName = updateProductDto.name?.trim();

    if ((nextCode && nextCode !== product.code) || nextSku !== product.sku) {
      await this.ensureUnique(nextCode ?? product.code, nextSku, id);
    }

    if (updateProductDto.companyId) {
      product.company = await this.findCompanyOrFail(updateProductDto.companyId);
    }

    if (updateProductDto.categoryId) {
      product.category = await this.findCategoryOrFail(
        updateProductDto.categoryId,
      );
    }

    if (updateProductDto.unitId) {
      product.unit = await this.findUnitOrFail(updateProductDto.unitId);
    }

    product.code = nextCode ?? product.code;
    product.sku = nextSku;
    product.name = nextName ?? product.name;
    product.purchasePrice =
      updateProductDto.purchasePrice ?? product.purchasePrice;
    product.salePrice = updateProductDto.salePrice ?? product.salePrice;
    product.mrp =
      updateProductDto.mrp !== undefined ? updateProductDto.mrp : product.mrp;
    product.isActive = updateProductDto.isActive ?? product.isActive;

    const updatedProduct = await this.productsRepository.save(product);

    return this.findOne(updatedProduct.id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);

    await this.productsRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }

  private async ensureUnique(
    code: string,
    sku: string | null,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .where(
        new Brackets((qb) => {
          qb.where('product.code = :code', { code });

          if (sku !== null) {
            qb.orWhere('product.sku = :sku', { sku });
          }
        }),
      );

    if (excludeId) {
      queryBuilder.andWhere('product.id != :excludeId', { excludeId });
    }

    const existingProduct = await queryBuilder.getOne();

    if (!existingProduct) {
      return;
    }

    if (existingProduct.code === code) {
      throw new ConflictException('Product code already exists');
    }

    throw new ConflictException('Product SKU already exists');
  }

  private async findCompanyOrFail(companyId: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  private async findCategoryOrFail(categoryId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async findUnitOrFail(unitId: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }
}
