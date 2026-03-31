import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsDateString()
  expenseDate!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
