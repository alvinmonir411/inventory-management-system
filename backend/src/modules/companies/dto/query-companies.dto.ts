import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryCompaniesDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
