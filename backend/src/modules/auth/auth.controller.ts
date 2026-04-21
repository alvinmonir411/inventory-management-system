import { Controller, Post, Body, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ValidateUserDto } from './dto/validate-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

  @Get('seed')
  async seed() {
    try {
      await this.usersService.create({
        email: 'admin@gamil.com',
        password: '13663',
        name: 'Admin User',
        role: 'ADMIN' as any,
      });
      return { message: 'Seeded admin@gamil.com / 13663' };
    } catch (e: any) {
      if (e.status === 409) return { message: 'Already seeded admin@gamil.com / 13663' };
      throw e;
    }
  }

  @Post('login')
  async login(@Body() validateUserDto: ValidateUserDto) {
    const user = await this.authService.validateUser(validateUserDto);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
