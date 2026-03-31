import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class QueryUsersDto {
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

  @IsOptional()
  @IsUUID()
  roleId?: string;
}
