import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from '../companies/entities/company.entity';
import { CreateCompanyPaymentDto } from './dto/create-company-payment.dto';
import { QueryCompanyPaymentsDto } from './dto/query-company-payments.dto';
import { CompanyPayment } from './entities/company-payment.entity';

@Injectable()
export class CompanyPaymentsService {
  constructor(
    @InjectRepository(CompanyPayment)
    private readonly companyPaymentsRepository: Repository<CompanyPayment>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(
    createCompanyPaymentDto: CreateCompanyPaymentDto,
  ): Promise<CompanyPayment> {
    const normalizedPaymentNo = createCompanyPaymentDto.paymentNo.trim().toUpperCase();

    const existingPayment = await this.companyPaymentsRepository.findOne({
      where: { paymentNo: normalizedPaymentNo },
    });

    if (existingPayment) {
      throw new ConflictException('Company payment number already exists');
    }

    const company = await this.findCompanyOrFail(createCompanyPaymentDto.companyId);

    const companyPayment = this.companyPaymentsRepository.create({
      paymentNo: normalizedPaymentNo,
      paymentDate: createCompanyPaymentDto.paymentDate,
      amount: createCompanyPaymentDto.amount,
      paymentMethod: createCompanyPaymentDto.paymentMethod?.trim() || null,
      note: createCompanyPaymentDto.note?.trim() || null,
      company,
    });

    return this.companyPaymentsRepository.save(companyPayment);
  }

  async findAll(queryCompanyPaymentsDto: QueryCompanyPaymentsDto) {
    const page = queryCompanyPaymentsDto.page ?? 1;
    const limit = queryCompanyPaymentsDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.companyPaymentsRepository
      .createQueryBuilder('companyPayment')
      .leftJoinAndSelect('companyPayment.company', 'company')
      .orderBy('companyPayment.paymentDate', 'DESC')
      .addOrderBy('companyPayment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (queryCompanyPaymentsDto.companyId) {
      queryBuilder.andWhere('company.id = :companyId', {
        companyId: queryCompanyPaymentsDto.companyId,
      });
    }

    if (queryCompanyPaymentsDto.fromDate) {
      queryBuilder.andWhere('companyPayment.payment_date >= :fromDate', {
        fromDate: queryCompanyPaymentsDto.fromDate,
      });
    }

    if (queryCompanyPaymentsDto.toDate) {
      queryBuilder.andWhere('companyPayment.payment_date <= :toDate', {
        toDate: queryCompanyPaymentsDto.toDate,
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

  async findOne(id: string): Promise<CompanyPayment> {
    const companyPayment = await this.companyPaymentsRepository.findOne({
      where: { id },
      relations: {
        company: true,
      },
    });

    if (!companyPayment) {
      throw new NotFoundException('Company payment not found');
    }

    return companyPayment;
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
}
