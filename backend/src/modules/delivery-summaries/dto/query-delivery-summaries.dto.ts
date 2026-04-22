import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class QueryDeliverySummariesDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  routeId?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  date?: Date;
}
