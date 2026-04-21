import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ValidateUserDto } from './dto/validate-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(validateUserDto: ValidateUserDto): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(validateUserDto.email);
      if (user && user.isActive) {
        const isMatch = await bcrypt.compare(validateUserDto.password, user.passwordHash);
        if (isMatch) {
          const { passwordHash, ...result } = user;
          return result;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
