import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  symbol?: string;
}
