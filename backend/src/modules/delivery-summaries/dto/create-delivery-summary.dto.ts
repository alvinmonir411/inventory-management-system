import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DeliverySummaryItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0.001)
  orderQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreateDeliverySummaryDto {
  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  routeId?: number;

  @Transform(({ value }) => (value ? new Date(value) : new Date()))
  @IsDate()
  deliveryDate: Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliverySummaryItemDto)
  items: DeliverySummaryItemDto[];
}
