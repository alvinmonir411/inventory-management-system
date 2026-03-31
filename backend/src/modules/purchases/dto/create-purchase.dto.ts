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

import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  purchaseNo!: string;

  @IsDateString()
  purchaseDate!: string;

  @IsUUID()
  companyId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierInvoiceNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
