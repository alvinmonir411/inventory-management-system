import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCompanyPaymentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  paymentNo!: string;

  @IsUUID()
  companyId!: string;

  @IsDateString()
  paymentDate!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
