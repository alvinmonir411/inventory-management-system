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
} from 'class-validator';

export class CreateDamageDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsDateString()
  damageDate!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(99999999999.999)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
