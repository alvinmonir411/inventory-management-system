import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  Min,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  ValidateNested,
  IsIn,
  IsString,
} from 'class-validator';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  companyId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  routeId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  shopId?: number;

  @Type(() => Date)
  @IsDate()
  saleDate: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  invoiceNo?: string;

  @Type(() => Number)
  @Min(0)
  paidAmount: number;

  @IsOptional()
  @IsString()
  @IsIn(['percentage', 'fixed'])
  invoiceDiscountType?: 'percentage' | 'fixed';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  invoiceDiscountValue?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
