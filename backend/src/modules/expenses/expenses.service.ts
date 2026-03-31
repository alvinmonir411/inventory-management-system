import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expensesRepository.create({
      expenseDate: createExpenseDto.expenseDate,
      name: createExpenseDto.name.trim(),
      amount: createExpenseDto.amount,
      note: createExpenseDto.note?.trim() || null,
    });

    return this.expensesRepository.save(expense);
  }

  async findAll(queryExpensesDto: QueryExpensesDto) {
    const page = queryExpensesDto.page ?? 1;
    const limit = queryExpensesDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.expensesRepository
      .createQueryBuilder('expense')
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (queryExpensesDto.name) {
      queryBuilder.andWhere('LOWER(expense.name) LIKE :name', {
        name: `%${queryExpensesDto.name.trim().toLowerCase()}%`,
      });
    }

    if (queryExpensesDto.fromDate) {
      queryBuilder.andWhere('expense.expense_date >= :fromDate', {
        fromDate: queryExpensesDto.fromDate,
      });
    }

    if (queryExpensesDto.toDate) {
      queryBuilder.andWhere('expense.expense_date <= :toDate', {
        toDate: queryExpensesDto.toDate,
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

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }
}
