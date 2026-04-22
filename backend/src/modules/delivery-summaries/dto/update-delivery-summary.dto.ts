import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateDeliverySummaryItemDto {
  @IsInt()
  productId: number;

  @IsNumber()
  @Min(0)
  returnQuantity: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateDeliverySummaryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDeliverySummaryItemDto)
  items: UpdateDeliverySummaryItemDto[];

  @IsOptional()
  @IsBoolean()
  finalize?: boolean; // if true, status becomes COMPLETED and stock is updated
}
