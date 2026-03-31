import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  saleNo!: string;

  @IsDateString()
  saleDate!: string;

  @IsUUID()
  routeId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}
