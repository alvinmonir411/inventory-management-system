import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsUUID()
  roleId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
