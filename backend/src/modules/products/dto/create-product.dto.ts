import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  code!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  mrp?: number;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  unitId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
