import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existingCompany = await this.companiesRepository.findOne({
      where: { code: createCompanyDto.code },
    });

    if (existingCompany) {
      throw new ConflictException('Company code already exists.');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(query: QueryCompaniesDto) {
    const queryBuilder = this.companiesRepository
      .createQueryBuilder('company')
      .orderBy('company.name', 'ASC');

    if (query.search) {
      queryBuilder.andWhere(
        '(company.name ILIKE :search OR company.code ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('company.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const company = await this.companiesRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    if (updateCompanyDto.code && updateCompanyDto.code !== company.code) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { code: updateCompanyDto.code },
      });

      if (existingCompany) {
        throw new ConflictException('Company code already exists.');
      }
    }

    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    const productCount = await this.productsRepository.count({
      where: { companyId: company.id },
    });

    if (productCount > 0) {
      throw new ConflictException(
        'Company cannot be deleted while products exist for it.',
      );
    }

    await this.companiesRepository.remove(company);
    return { success: true };
  }
}
