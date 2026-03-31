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

export class CreateCollectionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  collectionNo!: string;

  @IsUUID()
  routeId!: string;

  @IsDateString()
  collectionDate!: string;

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
