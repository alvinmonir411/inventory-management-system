import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class StockSummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  companyId: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  threshold?: number;
}
