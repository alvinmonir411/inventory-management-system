import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreatePurchaseItemDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(99999999999.999)
  quantity!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  unitPrice!: number;
}
