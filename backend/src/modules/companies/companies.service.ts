import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCompanyDto } from './dto/create-company.dto';
import { QueryCompaniesDto } from './dto/query-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const normalizedName = createCompanyDto.name.trim();

    const existingCompany = await this.companiesRepository.findOne({
      where: { name: normalizedName },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }

    const company = this.companiesRepository.create({
      name: normalizedName,
      note: createCompanyDto.note?.trim() || null,
      isActive: createCompanyDto.isActive ?? true,
    });

    return this.companiesRepository.save(company);
  }

  async findAll(queryCompaniesDto: QueryCompaniesDto): Promise<Company[]> {
    const queryBuilder = this.companiesRepository
      .createQueryBuilder('company')
      .orderBy('company.name', 'ASC');

    if (queryCompaniesDto.isActive !== undefined) {
      queryBuilder.andWhere('company.is_active = :isActive', {
        isActive: queryCompaniesDto.isActive,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);
    const nextName = updateCompanyDto.name?.trim();

    if (nextName && nextName !== company.name) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { name: nextName },
      });

      if (existingCompany) {
        throw new ConflictException('Company name already exists');
      }
    }

    company.name = nextName ?? company.name;
    company.note =
      updateCompanyDto.note !== undefined
        ? updateCompanyDto.note?.trim() || null
        : company.note;
    company.isActive = updateCompanyDto.isActive ?? company.isActive;

    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<{ message: string }> {
    const company = await this.findOne(id);

    await this.companiesRepository.remove(company);

    return {
      message: 'Company deleted successfully',
    };
  }
}
