import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateStockMovementDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  companyId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  productId: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;

  @Type(() => Date)
  @IsDate()
  movementDate: Date;
}
