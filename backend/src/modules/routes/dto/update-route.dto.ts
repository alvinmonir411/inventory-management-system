import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  area?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
